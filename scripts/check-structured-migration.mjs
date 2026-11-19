import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import nextEnv from "@next/env";
import { neon, neonConfig } from "@neondatabase/serverless";
import { databaseFetch } from "../src/lib/server/database-fetch.mjs";

nextEnv.loadEnvConfig(process.cwd());
neonConfig.fetchFunction = databaseFetch;
const sql = neon(process.env.DIRECT_URL || process.env.DATABASE_URL);
const schema = "migration_qa_" + randomUUID().replaceAll("-", "");
async function statements(file) {
  return (await readFile(new URL(file, import.meta.url), "utf8"))
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s && !/^(BEGIN|COMMIT)$/i.test(s));
}
const base = await statements("../prisma/migrations/0_baseline/migration.sql");
const upgrade = await statements(
  "../prisma/migrations/202611190001_structured_submissions/migration.sql",
);
const payload = {
  name: "Migration QA",
  email: "migration-qa@example.invalid",
  mobile: "+91 9000000000",
  city: "Jaipur",
  consent: true,
  description: "Preserve this original enquiry message.",
  projectType: "Dining Table",
  title: "Original table",
  quantity: "2",
  dimensions: "",
  material: "Oak",
  finish: "",
  budget: "Let’s discuss",
  timeline: "Flexible",
  location: "Jaipur",
  whatsapp: "",
  instructions: "Original instructions",
};
const enquiry = {
  ...payload,
  attachments: [
    {
      id: "migration-image",
      filename: "migration-image.png",
      name: "reference.png",
      mime: "image/png",
      size: 8,
    },
  ],
};
const contact = {
  ...payload,
  attachments: [
    {
      id: "contact-image",
      filename: "contact-image.png",
      name: "contact.png",
      mime: "image/png",
      size: 8,
    },
  ],
};
try {
  const results = await sql.transaction([
    sql.query(`CREATE SCHEMA "${schema}"`),
    sql.query(`SET LOCAL search_path TO "${schema}"`),
    ...base.map((s) => sql.query(s)),
    sql`INSERT INTO enquiries (id, created_at, status, notes, payload, source) VALUES ('migration-enquiry', '2026-01-01T00:00:00Z', 'New', 'Original notes', ${JSON.stringify(enquiry)}::jsonb, 'enquiry')`,
    sql`INSERT INTO enquiries (id, payload, source) VALUES ('migration-contact', ${JSON.stringify(contact)}::jsonb, 'contact')`,
    ...upgrade.map((s) => sql.query(s)),
    sql`SELECT id, name, quantity, instructions, dimensions, notes, created_at FROM enquiries`,
    sql`SELECT id, name, message FROM contact_messages`,
    sql`SELECT id, enquiry_id, contact_message_id FROM attachments ORDER BY id`,
    sql.query(`DROP SCHEMA "${schema}" CASCADE`),
  ]);
  const [projects, contacts, attachments] = results.slice(-4, -1);
  assert.equal(projects.length, 1);
  assert.equal(projects[0].quantity, 2);
  assert.equal(projects[0].dimensions, null);
  assert.equal(projects[0].instructions, payload.instructions);
  assert.equal(projects[0].notes, "Original notes");
  assert.equal(
    new Date(projects[0].created_at).toISOString(),
    "2026-01-01T00:00:00.000Z",
  );
  assert.equal(contacts.length, 1);
  assert.equal(contacts[0].message, payload.description);
  assert.deepEqual(
    attachments.map((a) => [a.id, a.enquiry_id, a.contact_message_id]),
    [
      ["contact-image", null, "migration-contact"],
      ["migration-image", "migration-enquiry", null],
    ],
  );
  console.log(
    "Migration verified in an isolated temporary schema: records, typed values, attachments and timestamps preserved. Temporary schema removed.",
  );
} catch {
  console.error(
    "Structured migration verification failed; the test transaction was rolled back.",
  );
  process.exitCode = 1;
}
