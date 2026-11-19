import test from "node:test";
import assert from "node:assert/strict";
import {
  contactCreateData,
  enquiryCreateData,
} from "../src/lib/server/submission-data";
import { defaults, type EnquiryRecord } from "../src/lib/enquiry/schema";

const record: EnquiryRecord = {
  id: "GF-TEST",
  createdAt: "2026-11-19T00:00:00Z",
  status: "New",
  notes: "Original notes",
  payload: {
    ...defaults,
    name: "Test Client",
    email: "test@example.com",
    mobile: "+91 9000000000",
    city: "Jaipur",
    location: "Jaipur",
    title: "Oak table",
    quantity: "2",
    consent: true,
    description: "A six-seater dining table with rounded edges.",
    attachments: [
      {
        id: "image-id",
        filename: "image-id.png",
        name: "Reference.png",
        mime: "image/png",
        size: 8,
      },
    ],
  },
};

test("project data uses typed columns and nested attachment creation", () => {
  const data = enquiryCreateData(record);
  assert.equal(data.quantity, 2);
  assert.equal(data.dimensions, null);
  assert.equal(data.whatsapp, null);
  assert.equal(data.instructions, null);
  assert.equal(data.description, record.payload.description);
  assert.equal(data.createdAt instanceof Date, true);
  assert.equal(data.notes, "Original notes");
  assert.equal("payload" in data, false);
  assert.equal("website" in data, false);
  assert.equal("source" in data, false);
  assert.deepEqual(data.attachments, { create: record.payload.attachments });
});

test("contact data stores a message and contact fields without project defaults", () => {
  const data = contactCreateData({
    ...record,
    payload: { ...record.payload, source: "contact", attachments: [] },
  });
  assert.equal(data.message, record.payload.description);
  assert.equal(data.name, record.payload.name);
  assert.equal(data.email, record.payload.email);
  assert.equal(data.mobile, record.payload.mobile);
  assert.equal(data.city, record.payload.city);
  assert.equal(data.consent, true);
  assert.equal(data.attachments, undefined);
  for (const field of [
    "payload",
    "website",
    "source",
    "quantity",
    "budget",
    "projectType",
  ])
    assert.equal(field in data, false);
});
