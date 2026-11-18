import "server-only";
import { mkdir, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { EnquiryRecord } from "./schema";
export const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY || ".data",
);
async function directory() {
  const dir = path.join(dataDirectory, "enquiries");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}
export async function saveEnquiry(record: EnquiryRecord) {
  const dir = await directory();
  const tmp = path.join(dir, `${record.id}.${randomUUID()}.tmp`);
  await writeFile(tmp, JSON.stringify(record), { mode: 0o600 });
  await rename(tmp, path.join(dir, `${record.id}.json`));
}
