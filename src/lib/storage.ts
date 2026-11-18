import "server-only";
import { mkdir, readFile, writeFile, rename, readdir } from "node:fs/promises";
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
export async function getEnquiry(id: string): Promise<EnquiryRecord | null> {
  if (!/^GF-[A-Z0-9-]{8,50}$/.test(id)) return null;
  try {
    return JSON.parse(
      await readFile(path.join(await directory(), `${id}.json`), "utf8"),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}
export async function listEnquiries(): Promise<EnquiryRecord[]> {
  const dir = await directory();
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  const records = await Promise.all(
    files.map(
      async (f) =>
        JSON.parse(await readFile(path.join(dir, f), "utf8")) as EnquiryRecord,
    ),
  );
  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
