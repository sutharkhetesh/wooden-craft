import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import type { EnquiryRecord } from "@/lib/enquiry/schema";
import {
  contactCreateData,
  enquiryCreateData,
} from "@/lib/server/submission-data";

// Node API persistence. Nested creates keep records and attachments atomic.
export function createDatabaseClient(connectionString: string) {
  return new PrismaClient({
    adapter: new PrismaNeon({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 10000,
    }),
    transactionOptions: { maxWait: 10000, timeout: 15000 },
  });
}

export async function saveDatabaseEnquiry(
  connectionString: string,
  record: EnquiryRecord,
) {
  const database = createDatabaseClient(connectionString);
  try {
    if (record.payload.source === "contact") {
      await database.contactMessage.create({ data: contactCreateData(record) });
    } else {
      await database.enquiry.create({ data: enquiryCreateData(record) });
    }
  } finally {
    await database.$disconnect();
  }
}
