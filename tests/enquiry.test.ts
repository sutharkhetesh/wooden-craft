import test from "node:test";
import assert from "node:assert/strict";
import { enquirySchema, defaults } from "../src/lib/schema";
import { imageKind } from "../src/lib/image-validation";
import { createWorker } from "../hosting/worker.mjs";
const valid = {
  ...defaults,
  title: "Oak dining table",
  description: "A six-seater dining table with rounded edges.",
  name: "Test Client",
  mobile: "+91 9000000000",
  email: "test@example.com",
  city: "Jaipur",
  location: "Jaipur",
  consent: true,
};
test("server validation rejects missing contact, unsafe lengths, invalid type, no consent and spam", () => {
  assert.equal(enquirySchema.safeParse(valid).success, true);
  for (const patch of [
    { email: "wrong" },
    { mobile: "123" },
    { description: "short" },
    { quantity: "0" },
    { consent: false },
    { website: "https://spam.example" },
    { projectType: "Checkout" },
    { title: "x".repeat(121) },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...valid, ...patch }).success,
      false,
    );
});
test("image sniffing accepts supported signatures and rejects forged files", () => {
  assert.deepEqual(imageKind(Uint8Array.from([255, 216, 255, 0])), {
    mime: "image/jpeg",
    extension: "jpg",
  });
  assert.equal(
    imageKind(new TextEncoder().encode('<svg onload="bad"/>')),
    null,
  );
  assert.equal(imageKind(new TextEncoder().encode("not an image")), null);
  assert.equal(imageKind(new Uint8Array()), null);
  assert.equal(
    imageKind(Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]))?.mime,
    "image/png",
  );
  assert.equal(
    imageKind(new TextEncoder().encode("RIFF1234WEBP"))?.mime,
    "image/webp",
  );
});
function fixture() {
  const blobs = new Map<string, { bytes: Uint8Array; type: string }>();
  const env = {
    BUCKET: {
      async put(
        key: string,
        bytes: Uint8Array | string,
        options: { httpMetadata: { contentType: string } },
      ) {
        blobs.set(key, {
          bytes:
            typeof bytes === "string" ? new TextEncoder().encode(bytes) : bytes,
          type: options.httpMetadata.contentType,
        });
      },
      async delete(key: string) {
        blobs.delete(key);
      },
    },
  };
  const worker = createWorker({});
  async function request(path: string, options: RequestInit = {}) {
    return worker.fetch(
      new Request(`https://studio.example${path}`, {
        ...options,
        headers: { Origin: "https://studio.example", ...options.headers },
      }),
      env,
    );
  }
  return { blobs, request, env };
}
test("hosted enquiry saves private JSON and image files", async () => {
  const { request, blobs } = fixture();
  const form = new FormData();
  form.append("data", JSON.stringify(valid));
  form.append(
    "images",
    new File([Uint8Array.from([255, 216, 255, 0])], "reference.jpg", {
      type: "image/jpeg",
    }),
  );
  const submitted = await request("/api/enquiries", {
    method: "POST",
    body: form,
  });
  assert.equal(submitted.status, 201);
  const { id } = await submitted.json();
  assert.match(id, /^GF-\d{8}-[A-F0-9]{8}$/);
  assert.equal(blobs.has(`enquiries/${id}.json`), true);
  const record = JSON.parse(
    new TextDecoder().decode(blobs.get(`enquiries/${id}.json`)!.bytes),
  );
  assert.equal(record.payload.title, valid.title);
  const attachment = record.payload.attachments[0];
  assert.equal(blobs.get(`${id}/${attachment.filename}`)!.type, "image/jpeg");
  assert.equal(blobs.get(`${id}/${attachment.filename}`)!.bytes.byteLength, 4);
});
test("hosted API rejects cross-origin submissions and validates uploaded content", async () => {
  const { request, blobs } = fixture();
  assert.equal(
    (
      await request("/api/enquiries", {
        method: "POST",
        headers: { Origin: "https://evil.example" },
      })
    ).status,
    403,
  );
  const invalid = new FormData();
  invalid.append("data", JSON.stringify({ ...valid, email: "not an email" }));
  assert.equal(
    (await request("/api/enquiries", { method: "POST", body: invalid })).status,
    400,
  );
  const badFile = new FormData();
  badFile.append("data", JSON.stringify(valid));
  badFile.append(
    "images",
    new File(["<script>bad</script>"], "fake.jpg", { type: "image/jpeg" }),
  );
  assert.equal(
    (await request("/api/enquiries", { method: "POST", body: badFile })).status,
    400,
  );
  assert.equal(blobs.size, 0);
});

test("removed admin endpoints return 404", async () => {
  const { request } = fixture();
  for (const endpoint of [
    "login",
    "logout",
    "enquiries",
    "enquiries/GF-20261118-12345678",
    "export",
    "files/example",
  ]) {
    for (const method of ["GET", "POST", "PATCH"]) {
      assert.equal(
        (await request(`/api/admin/${endpoint}`, { method })).status,
        404,
      );
    }
  }
});

test("hosted enquiry rate limit still rejects repeated submissions", async () => {
  const { request } = fixture();
  for (let i = 0; i < 10; i++) {
    const form = new FormData();
    form.append("data", JSON.stringify(valid));
    assert.equal(
      (await request("/api/enquiries", { method: "POST", body: form })).status,
      201,
    );
  }
  const form = new FormData();
  form.append("data", JSON.stringify(valid));
  assert.equal(
    (await request("/api/enquiries", { method: "POST", body: form })).status,
    429,
  );
});

test("failed record saves report failure and clean up uploaded files", async () => {
  const { request, env, blobs } = fixture();
  const put = env.BUCKET.put;
  env.BUCKET.put = async (key, bytes, options) => {
    if (key.startsWith("enquiries/")) throw new Error("Storage unavailable");
    return put(key, bytes, options);
  };
  const form = new FormData();
  form.append("data", JSON.stringify(valid));
  form.append(
    "images",
    new File([Uint8Array.from([255, 216, 255, 0])], "reference.jpg", {
      type: "image/jpeg",
    }),
  );
  assert.equal(
    (await request("/api/enquiries", { method: "POST", body: form })).status,
    503,
  );
  assert.equal(blobs.size, 0);
});
