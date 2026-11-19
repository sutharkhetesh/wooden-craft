import { neon } from "@neondatabase/serverless";

// The Worker uses HTTPS transactions against the same Prisma-managed schema.
export async function saveDatabaseEnquiry(connectionString, record) {
  const sql = neon(connectionString);
  const p = record.payload;
  const contact = p.source === "contact";
  const insert = contact
    ? sql`INSERT INTO contact_messages
        (id, created_at, status, notes, name, email, mobile, city, consent, message)
        VALUES (${record.id}, ${record.createdAt}, ${record.status}, ${record.notes},
          ${p.name}, ${p.email}, ${p.mobile}, ${p.city}, ${p.consent}, ${p.description})`
    : sql`INSERT INTO enquiries
        (id, created_at, status, notes, name, email, mobile, city, consent,
         project_type, title, description, dimensions, material, quantity,
         finish, budget, timeline, location, whatsapp, instructions)
        VALUES (${record.id}, ${record.createdAt}, ${record.status}, ${record.notes},
          ${p.name}, ${p.email}, ${p.mobile}, ${p.city}, ${p.consent},
          ${p.projectType}, ${p.title}, ${p.description}, ${p.dimensions || null},
          ${p.material || null}, ${Number(p.quantity)}, ${p.finish || null},
          ${p.budget}, ${p.timeline}, ${p.location}, ${p.whatsapp || null}, ${p.instructions || null})`;
  await sql.transaction([
    insert,
    ...p.attachments.map(
      (a) => sql`INSERT INTO attachments
      (id, filename, name, mime, size, enquiry_id, contact_message_id)
      VALUES (${a.id}, ${a.filename}, ${a.name}, ${a.mime}, ${a.size},
        ${contact ? null : record.id}, ${contact ? record.id : null})`,
    ),
  ]);
}
