import "server-only";
import "@/lib/server/database-node";
import { mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EnquiryRecord } from "@/lib/enquiry/schema";
import { saveDatabaseEnquiry } from "@/lib/server/database";
export const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY || ".data",
);
export function requirePersistentFileStorage() {
  if (
    !process.env.DATA_DIRECTORY &&
    (process.env.VERCEL || process.env.LAMBDA_TASK_ROOT)
  ) {
    throw new Error(
      "File storage is unavailable on this host. Configure persistent upload storage before attaching images.",
    );
  }
}
async function directory() {
  requirePersistentFileStorage();
  const dir = path.join(dataDirectory, "enquiries");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}
export async function saveEnquiry(record: EnquiryRecord) {
  if (process.env.DATABASE_URL) {
    await saveDatabaseEnquiry(process.env.DATABASE_URL, record);
    return;
  }
  const dir = await directory();
  const tmp = path.join(dir, `${record.id}.${randomUUID()}.tmp`);
  await writeFile(tmp, JSON.stringify(record), { mode: 0o600 });
  await rename(tmp, path.join(dir, `${record.id}.json`));
}
