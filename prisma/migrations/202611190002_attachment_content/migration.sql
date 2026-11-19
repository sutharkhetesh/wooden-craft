-- Keep existing filesystem/R2 attachment metadata compatible.
ALTER TABLE "attachments" ADD COLUMN "content" BYTEA;
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_content_size_check"
  CHECK ("content" IS NULL OR octet_length("content") = "size");
