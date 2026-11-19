BEGIN;

-- Move legacy contact submissions into their dedicated table before backfill.
INSERT INTO "contact_messages" (id, created_at, status, notes, payload)
SELECT id, created_at, status, notes, payload FROM "enquiries" WHERE source = 'contact'
ON CONFLICT (id) DO NOTHING;
DELETE FROM "enquiries" WHERE source = 'contact';

-- AlterTable
ALTER TABLE "contact_messages"
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "consent" BOOLEAN,
ADD COLUMN     "email" VARCHAR(200),
ADD COLUMN     "message" TEXT,
ADD COLUMN     "mobile" VARCHAR(18),
ADD COLUMN     "name" VARCHAR(100);

-- AlterTable
ALTER TABLE "enquiries"
ADD COLUMN     "budget" TEXT,
ADD COLUMN     "city" VARCHAR(100),
ADD COLUMN     "consent" BOOLEAN,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dimensions" VARCHAR(200),
ADD COLUMN     "email" VARCHAR(200),
ADD COLUMN     "finish" VARCHAR(150),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "location" VARCHAR(150),
ADD COLUMN     "material" VARCHAR(100),
ADD COLUMN     "mobile" VARCHAR(18),
ADD COLUMN     "name" VARCHAR(100),
ADD COLUMN     "project_type" TEXT,
ADD COLUMN     "quantity" INTEGER DEFAULT 1,
ADD COLUMN     "timeline" TEXT,
ADD COLUMN     "title" VARCHAR(120),
ADD COLUMN     "whatsapp" VARCHAR(18);

-- CreateTable
CREATE TABLE "attachments" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mime" VARCHAR(100) NOT NULL,
    "size" INTEGER NOT NULL,
    "enquiry_id" TEXT,
    "contact_message_id" TEXT,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "attachments_enquiry_id_idx" ON "attachments"("enquiry_id");

-- CreateIndex
CREATE INDEX "attachments_contact_message_id_idx" ON "attachments"("contact_message_id");

-- CreateIndex
CREATE INDEX "contact_messages_created_at_idx" ON "contact_messages"("created_at");

-- CreateIndex
CREATE INDEX "contact_messages_status_created_at_idx" ON "contact_messages"("status", "created_at");

-- CreateIndex
CREATE INDEX "enquiries_created_at_idx" ON "enquiries"("created_at");

-- CreateIndex
CREATE INDEX "enquiries_status_created_at_idx" ON "enquiries"("status", "created_at");

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_enquiry_id_fkey" FOREIGN KEY ("enquiry_id") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_contact_message_id_fkey" FOREIGN KEY ("contact_message_id") REFERENCES "contact_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

UPDATE "contact_messages" SET
  "name" = payload->>'name',
  "email" = payload->>'email',
  "mobile" = payload->>'mobile',
  "city" = payload->>'city',
  "consent" = (payload->>'consent')::boolean,
  "message" = payload->>'description';

INSERT INTO "attachments" (id, filename, name, mime, size, "contact_message_id")
SELECT attachment->>'id', attachment->>'filename', attachment->>'name',
       attachment->>'mime', (attachment->>'size')::integer, submission.id
FROM "contact_messages" AS submission
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(submission.payload->'attachments', '[]'::jsonb)) AS attachment;

ALTER TABLE "contact_messages"
  ALTER COLUMN "name" SET NOT NULL,
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "mobile" SET NOT NULL,
  ALTER COLUMN "city" SET NOT NULL,
  ALTER COLUMN "consent" SET NOT NULL,
  ALTER COLUMN "message" SET NOT NULL;

UPDATE "enquiries" SET
  "name" = payload->>'name',
  "email" = payload->>'email',
  "mobile" = payload->>'mobile',
  "city" = payload->>'city',
  "consent" = (payload->>'consent')::boolean,
  "project_type" = payload->>'projectType',
  "title" = payload->>'title',
  "description" = payload->>'description',
  "dimensions" = NULLIF(payload->>'dimensions', ''),
  "material" = NULLIF(payload->>'material', ''),
  "quantity" = COALESCE((payload->>'quantity')::integer, 1),
  "finish" = NULLIF(payload->>'finish', ''),
  "budget" = payload->>'budget',
  "timeline" = payload->>'timeline',
  "location" = payload->>'location',
  "whatsapp" = NULLIF(payload->>'whatsapp', ''),
  "instructions" = NULLIF(payload->>'instructions', '');

INSERT INTO "attachments" (id, filename, name, mime, size, "enquiry_id")
SELECT attachment->>'id', attachment->>'filename', attachment->>'name',
       attachment->>'mime', (attachment->>'size')::integer, submission.id
FROM "enquiries" AS submission
CROSS JOIN LATERAL jsonb_array_elements(COALESCE(submission.payload->'attachments', '[]'::jsonb)) AS attachment;

ALTER TABLE "enquiries"
  ALTER COLUMN "name" SET NOT NULL,
  ALTER COLUMN "email" SET NOT NULL,
  ALTER COLUMN "mobile" SET NOT NULL,
  ALTER COLUMN "city" SET NOT NULL,
  ALTER COLUMN "consent" SET NOT NULL,
  ALTER COLUMN "project_type" SET NOT NULL,
  ALTER COLUMN "title" SET NOT NULL,
  ALTER COLUMN "description" SET NOT NULL,
  ALTER COLUMN "quantity" SET NOT NULL,
  ALTER COLUMN "budget" SET NOT NULL,
  ALTER COLUMN "timeline" SET NOT NULL,
  ALTER COLUMN "location" SET NOT NULL;

ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_quantity_check" CHECK (quantity BETWEEN 1 AND 999);
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_owner_check"
  CHECK (num_nonnulls(enquiry_id, contact_message_id) = 1);
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_size_check"
  CHECK (size BETWEEN 1 AND 4194304);

-- Payload data is now represented by typed columns and attachment relations.
ALTER TABLE "contact_messages" DROP COLUMN "payload";
ALTER TABLE "enquiries" DROP COLUMN "payload", DROP COLUMN "source";

COMMIT;
