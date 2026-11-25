import test from "node:test";
import assert from "node:assert/strict";
import { defaults, enquirySchema } from "../src/lib/enquiry/schema";
import { createWorker } from "../hosting/worker.mjs";

const quick = {
  ...defaults,
  source: "contact" as const,
  title: "Quick enquiry",
  name: "Test Client",
  mobile: "+919000000000",
  description: "I would like a wooden desk for my study.",
  consent: true,
};

test("quick enquiries allow missing email/city, while full enquiries require them", () => {
  assert.ok(enquirySchema.safeParse(quick).success);
  assert.equal(
    enquirySchema.safeParse({ ...quick, source: "enquiry" }).success,
    false,
  );
  assert.equal(
    enquirySchema.safeParse({ ...quick, source: undefined }).success,
    false,
  );
  for (const patch of [
    { email: "bad" },
    { consent: false },
    { mobile: "123" },
    { website: "spam" },
  ])
    assert.equal(
      enquirySchema.safeParse({ ...quick, ...patch }).success,
      false,
    );
});

test("hosted quick enquiry persists without inventing email/city", async () => {
  const records: string[] = [];
  const form = new FormData();
  form.set("data", JSON.stringify(quick));
  const response = await createWorker({}).fetch(
    new Request("https://quick.example/api/enquiries", {
      method: "POST",
      headers: { Origin: "https://quick.example" },
      body: form,
    }),
    {
      BUCKET: {
        async put(_key: string, body: string) {
          records.push(body);
        },
        async delete() {},
      },
    },
  );
  assert.equal(response.status, 201);
  const record = JSON.parse(records[0]);
  assert.equal(record.payload.email, "");
  assert.equal(record.payload.city, "");
  assert.equal(record.payload.source, "contact");
});
