import test from "node:test";
import assert from "node:assert/strict";
import { notifyEnquiry } from "../src/lib/server/notifications";
import { defaults, type EnquiryRecord } from "../src/lib/enquiry/schema";
import { createWorker } from "../hosting/worker.mjs";

const config = {
  RESEND_API_KEY: "re_test_key",
  RESEND_FROM_EMAIL: "Enteak <enquiries@studio.example>",
  ENQUIRY_NOTIFICATION_EMAIL: "owner@example.com",
};
const record: EnquiryRecord = {
  id: "GF-20261124-ABCDEF12",
  createdAt: "2026-11-24T10:00:00.000Z",
  status: "New",
  notes: "Private internal note",
  payload: {
    ...defaults,
    title: "Oak desk",
    name: "Example Client",
    email: "client@example.com",
    mobile: "+919000000000",
    city: "Siyana",
    location: "Siyana",
    description: "A small wooden desk with drawers for my study.",
    consent: true,
    attachments: [
      {
        id: "private-image",
        filename: "private.webp",
        name: "reference.webp",
        mime: "image/webp",
        size: 4,
        content: new Uint8Array([1, 2, 3, 4]),
      },
    ],
  },
};

test("Resend sends an owner alert with reply-to and stable idempotency, excluding private data", async () => {
  const original = globalThis.fetch;
  const requests: { url: string; init?: RequestInit }[] = [];
  try {
    globalThis.fetch = async (url, init) => {
      requests.push({ url: String(url), init });
      return Response.json({ id: "provider-email-id" });
    };
    await notifyEnquiry(config, record);
    await notifyEnquiry(config, record);
    assert.equal(requests.length, 2);
    const request = requests[0];
    assert.equal(request.url, "https://api.resend.com/emails");
    assert.equal(request.init?.method, "POST");
    assert.equal(request.init?.redirect, "error");
    const headers = new Headers(request.init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer re_test_key");
    assert.equal(headers.get("Idempotency-Key"), `enquiry-alert/${record.id}`);
    assert.equal(
      new Headers(requests[1].init?.headers).get("Idempotency-Key"),
      headers.get("Idempotency-Key"),
    );
    const body = JSON.parse(String(request.init?.body));
    assert.equal(body.from, config.RESEND_FROM_EMAIL);
    assert.deepEqual(body.to, [config.ENQUIRY_NOTIFICATION_EMAIL]);
    assert.equal(body.reply_to, record.payload.email);
    assert.ok(body.subject.includes(record.id));
    assert.ok(body.text.includes(record.payload.description));
    assert.ok(body.text.includes("Reference images: 1"));
    assert.ok(body.text.includes(record.payload.mobile));
    assert.equal("attachments" in body, false);
    assert.equal("html" in body, false);
    assert.ok(!JSON.stringify(body).includes(record.notes));
    assert.ok(!JSON.stringify(body).includes("private.webp"));
  } finally {
    globalThis.fetch = original;
  }
});

test("quick enquiries without an email omit reply-to", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(String(init?.body));
      assert.equal("reply_to" in body, false);
      assert.ok(body.text.includes("Email: Not provided"));
      return Response.json({ id: "provider-email-id" });
    };
    await notifyEnquiry(config, {
      ...record,
      payload: { ...record.payload, email: "" },
    });
  } finally {
    globalThis.fetch = original;
  }
});

test("missing Resend settings, rejection and timeout never throw or expose secrets in logs", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  const logs: string[] = [];
  let calls = 0;
  try {
    console.error = (...args) => {
      logs.push(args.join(" "));
    };
    globalThis.fetch = async () => {
      calls++;
      return Response.json({ message: config.RESEND_API_KEY }, { status: 401 });
    };
    await notifyEnquiry({}, record);
    await notifyEnquiry({ ...config, RESEND_API_KEY: "" }, record);
    await notifyEnquiry({ RESEND_API_KEY: config.RESEND_API_KEY }, record);
    await notifyEnquiry({ ...config, ENQUIRY_NOTIFICATION_EMAIL: " " }, record);
    assert.equal(calls, 0);
    await notifyEnquiry(config, record);
    assert.equal(calls, 1);
    assert.ok(logs.some((line) => line.includes("HTTP 401")));
    globalThis.fetch = async () => {
      throw new Error(
        `Timeout ${config.RESEND_API_KEY} ${record.payload.mobile}`,
      );
    };
    await notifyEnquiry(config, record);
    assert.ok(!logs.join(" ").includes(config.RESEND_API_KEY));
    assert.ok(!logs.join(" ").includes(record.payload.mobile));
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

test("Worker saves first and returns success even if Resend fails", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  let saved = false;
  let attempted = false;
  try {
    console.error = () => {};
    globalThis.fetch = async (url) => {
      assert.ok(saved, "Durable storage must complete before sending email");
      assert.equal(String(url), "https://api.resend.com/emails");
      attempted = true;
      return new Response(null, { status: 429 });
    };
    const form = new FormData();
    const { attachments: _attachments, ...payload } = record.payload;
    form.set("data", JSON.stringify(payload));
    const response = await createWorker({}).fetch(
      new Request("https://resend-test.example/api/enquiries", {
        method: "POST",
        headers: { Origin: "https://resend-test.example" },
        body: form,
      }),
      {
        ...config,
        BUCKET: {
          async put() {
            saved = true;
          },
          async delete() {
            assert.fail(
              "Saved files must not be removed for notification failure",
            );
          },
        },
      },
    );
    assert.ok(attempted);
    assert.equal(response.status, 201);
    assert.match((await response.json()).id, /^GF-/);
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
