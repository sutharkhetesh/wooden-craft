import "server-only";
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { dataDirectory } from "./storage";
import type { Attachment } from "./schema";
import { maxFileSize, imageKind } from "./image-validation";
export async function storeUploads(files: File[], enquiryId: string) {
  if (files.length > 5) throw new Error("Upload up to 5 reference images.");
  const validated = await Promise.all(
    files.map(async (file) => {
      if (file.size === 0 || file.size > maxFileSize)
        throw new Error("Each reference must be between 1 byte and 4 MB.");
      const bytes = Buffer.from(await file.arrayBuffer());
      const kind = imageKind(bytes);
      if (!kind || kind.mime !== file.type)
        throw new Error("Only valid JPG, PNG and WebP images are supported.");
      return { file, bytes, kind };
    }),
  );
  const dir = path.join(dataDirectory, "uploads", enquiryId);
  await mkdir(dir, { recursive: true, mode: 0o700 });
  const attachments: Attachment[] = [];
  try {
    for (const { file, bytes, kind } of validated) {
      const id = randomUUID();
      const filename = `${id}.${kind.extension}`;
      await writeFile(path.join(dir, filename), bytes, { mode: 0o600 });
      attachments.push({
        id,
        filename,
        name: path
          .basename(file.name)
          .replace(/[\x00-\x1f\x7f]/g, "")
          .slice(0, 120),
        mime: kind.mime,
        size: file.size,
      });
    }
    return attachments;
  } catch (error) {
    await rm(dir, { recursive: true, force: true });
    throw error;
  }
}
export async function removeUploads(id: string) {
  await rm(path.join(dataDirectory, "uploads", id), {
    recursive: true,
    force: true,
  });
}
