import test from "node:test";
import assert from "node:assert/strict";
import { enquirySchema, defaults } from "../src/lib/schema";
import { imageKind } from "../src/lib/image-validation";
import { csvCell } from "../src/lib/csv";
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
test("CSV cells escape quotes and neutralize spreadsheet formulas", () => {
  assert.equal(csvCell('a"b'), '"a""b"');
  assert.equal(csvCell("=SUM(A1:A2)"), '"\'=SUM(A1:A2)"');
  assert.equal(csvCell(" +123"), '"\' +123"');
});
function fixture() {
  const blobs = new Map<string, { bytes: Uint8Array; type: string }>();
  const env = {
    ADMIN_PASSWORD: "test-only-password-123",
    SESSION_SECRET: "a-test-only-session-key-with-over-32-characters",
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
      async get(key: string) {
        const b = blobs.get(key);
        return b
          ? {
              body: b.bytes,
              async json() {
                return JSON.parse(new TextDecoder().decode(b.bytes));
              },
            }
          : null;
      },
      async list({ prefix, cursor }: { prefix: string; cursor?: string }) {
        const keys = [...blobs.keys()]
          .filter((key) => key.startsWith(prefix))
          .sort();
        const start = Number(cursor || 0);
        // A single object per page exercises cursor handling even for small tests.
        const end = start + 1;
        return {
          objects: keys.slice(start, end).map((key) => ({ key })),
          truncated: end < keys.length,
          cursor: end < keys.length ? String(end) : undefined,
        };
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
test("hosted enquiry, private files, admin status/notes, CSV and logout work end to end", async () => {
  const { request, blobs } = fixture();
  assert.equal((await request("/api/admin/enquiries")).status, 401);
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
  const login = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password: "test-only-password-123" }),
  });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  const headers = { Cookie: cookie };
  const list = await (
    await request("/api/admin/enquiries", { headers })
  ).json();
  assert.equal(list.enquiries.length, 1);
  const attachment = list.enquiries[0].payload.attachments[0];
  const filePath = `/api/admin/files/${attachment.id}?enquiry=${id}`;
  assert.equal((await request(filePath)).status, 401);
  const image = await request(filePath, { headers });
  assert.equal(image.status, 200);
  assert.equal(image.headers.get("content-type"), "image/jpeg");
  assert.equal((await image.arrayBuffer()).byteLength, 4);
  const update = await request(`/api/admin/enquiries/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      status: "Quotation Sent",
      notes: "Client prefers natural oak.",
    }),
  });
  assert.equal(update.status, 200);
  const updated = (
    await (await request("/api/admin/enquiries", { headers })).json()
  ).enquiries[0];
  assert.equal(updated.status, "Quotation Sent");
  assert.equal(updated.notes, "Client prefers natural oak.");
  const csv = await request("/api/admin/export", { headers });
  assert.equal(csv.status, 200);
  assert.match(await csv.text(), /Oak dining table/);
  assert.match(
    (
      await request("/api/admin/logout", { method: "POST", headers })
    ).headers.get("set-cookie")!,
    /Max-Age=0/,
  );
  assert.equal(
    (
      await request("/api/admin/enquiries", {
        headers: { Cookie: cookie + "tampered" },
      })
    ).status,
    401,
  );
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
  assert.equal(
    (
      await request("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: "incorrect" }),
      })
    ).status,
    401,
  );
  for (let i = 0; i < 5; i++)
    await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ password: "incorrect" }),
    });
  assert.equal(
    (
      await request("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ password: "incorrect" }),
      })
    ).status,
    429,
  );
});

test("hosted records survive a new Worker and listing follows every object page", async () => {
  const { request, env } = fixture();
  const ids = [];
  for (let i = 0; i < 3; i++) {
    const form = new FormData();
    form.append(
      "data",
      JSON.stringify({ ...valid, title: `Dining table ${i}` }),
    );
    const response = await request("/api/enquiries", {
      method: "POST",
      body: form,
    });
    assert.equal(response.status, 201);
    ids.push((await response.json()).id);
  }
  const login = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({ password: env.ADMIN_PASSWORD }),
  });
  const cookie = login.headers.get("set-cookie")!.split(";")[0];
  // A new instance can read all records from the same private bucket.
  const restarted = createWorker({});
  const response = await restarted.fetch(
    new Request("https://studio.example/api/admin/enquiries", {
      headers: { Cookie: cookie },
    }),
    { ...env },
  );
  assert.equal(response.status, 200);
  const { enquiries } = await response.json();
  assert.deepEqual(
    enquiries.map((record: { id: string }) => record.id).sort(),
    ids.sort(),
  );
  assert.deepEqual(
    enquiries.map((record: { createdAt: string }) => record.createdAt),
    enquiries
      .map((record: { createdAt: string }) => record.createdAt)
      .sort()
      .reverse(),
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
