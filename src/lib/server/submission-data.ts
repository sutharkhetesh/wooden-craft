import type { Prisma } from "@/generated/prisma/client";
import type { EnquiryRecord } from "@/lib/enquiry/schema";

function sharedData(record: EnquiryRecord) {
  const { name, email, mobile, city, consent, attachments } = record.payload;
  return {
    id: record.id,
    createdAt: new Date(record.createdAt),
    status: record.status,
    notes: record.notes,
    name,
    email,
    mobile,
    city,
    consent,
    attachments: attachments.length
      ? {
          create: attachments.map(
            ({ id, filename, name, mime, size, content }) => ({
              id,
              filename,
              name,
              mime,
              size,
              ...(content ? { content } : {}),
            }),
          ),
        }
      : undefined,
  };
}

export function contactCreateData(
  record: EnquiryRecord,
): Prisma.ContactMessageCreateInput {
  return { ...sharedData(record), message: record.payload.description };
}

export function enquiryCreateData(
  record: EnquiryRecord,
): Prisma.EnquiryCreateInput {
  const data = record.payload;
  return {
    ...sharedData(record),
    projectType: data.projectType,
    title: data.title,
    description: data.description,
    dimensions: data.dimensions || null,
    material: data.material || null,
    quantity: Number(data.quantity),
    finish: data.finish || null,
    budget: data.budget,
    timeline: data.timeline,
    location: data.location,
    whatsapp: data.whatsapp || null,
    instructions: data.instructions || null,
  };
}
