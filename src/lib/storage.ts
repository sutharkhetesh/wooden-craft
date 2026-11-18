import "server-only";
import { mkdir, readFile, writeFile, rename, readdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { PrismaClient, Prisma } from "@prisma/client";
import type { EnquiryRecord } from "./schema";
export const dataDirectory = path.resolve(
  process.env.DATA_DIRECTORY || ".data",
);
const globalPrisma = globalThis as unknown as { prisma?: PrismaClient };
function db() {
  if (!globalPrisma.prisma) globalPrisma.prisma = new PrismaClient();
  return globalPrisma.prisma;
}
async function directory() {
  const dir = path.join(dataDirectory, "enquiries");
  await mkdir(dir, { recursive: true, mode: 0o700 });
  return dir;
}
export async function saveEnquiry(record: EnquiryRecord) {
  if (process.env.DATABASE_URL) {
    await db().enquiry.upsert({
      where: { id: record.id },
      create: {
        id: record.id,
        createdAt: new Date(record.createdAt),
        status: record.status,
        notes: record.notes,
        payload: record.payload as unknown as Prisma.InputJsonValue,
      },
      update: { status: record.status, notes: record.notes },
    });
    return;
  }
  const dir = await directory();
  const tmp = path.join(dir, `${record.id}.${randomUUID()}.tmp`);
  await writeFile(tmp, JSON.stringify(record), { mode: 0o600 });
  await rename(tmp, path.join(dir, `${record.id}.json`));
}
export async function getEnquiry(id: string): Promise<EnquiryRecord | null> {
  if (!/^GF-[A-Z0-9-]{8,50}$/.test(id)) return null;
  if (process.env.DATABASE_URL) {
    const row = await db().enquiry.findUnique({ where: { id } });
    return row
      ? {
          ...row,
          createdAt: row.createdAt.toISOString(),
          payload: row.payload as EnquiryRecord["payload"],
        }
      : null;
  }
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
  if (process.env.DATABASE_URL) {
    return (
      await db().enquiry.findMany({ orderBy: { createdAt: "desc" } })
    ).map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
      payload: row.payload as EnquiryRecord["payload"],
    }));
  }
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
