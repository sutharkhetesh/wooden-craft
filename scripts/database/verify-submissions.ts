import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import "../../src/lib/server/database-node";
import {
  createDatabaseClient,
  saveDatabaseEnquiry,
} from "../../src/lib/server/database";
import { defaults, type EnquiryRecord } from "../../src/lib/enquiry/schema";
import { createWorker } from "../../hosting/worker.mjs";
import { neonConfig } from "@neondatabase/serverless";
import { databaseFetch } from "./fetch.mjs";
import { rm } from "node:fs/promises";

loadEnvConfig(process.cwd());
neonConfig.fetchFunction = databaseFetch;
const connectionString = process.env.DATABASE_URL!;
const database = createDatabaseClient(connectionString);
const saved: { id: string; source: string }[] = [];
const blobs = new Map<string, unknown>();
const marker = "prisma-qa-" + randomUUID();
const orphanId = randomUUID();
const payload = {
  ...defaults,
  title: marker,
  description: "Temporary verification of typed Prisma persistence.",
  name: "Prisma QA",
  email: "prisma-qa@example.invalid",
  mobile: "+91 9000000000",
  city: "Jaipur",
  location: "Jaipur",
  quantity: "2",
  consent: true,
};
const env = {
  DATABASE_URL: connectionString,
  BUCKET: {
    async put(key: string, bytes: unknown) {
      blobs.set(key, bytes);
    },
    async delete(key: string) {
      blobs.delete(key);
    },
  },
};
const worker = createWorker({});
let rollbackId = "";
async function main() {
  try {
    for (const mode of ["node", "worker"]) {
      for (const source of ["contact", "enquiry"]) {
        const form = new FormData();
        form.append("data", JSON.stringify({ ...payload, source }));
        form.append(
          "images",
          new File(
            [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
            "reference.png",
            { type: "image/png" },
          ),
        );
        const base =
          mode === "node" ? "http://127.0.0.1:3127" : "https://studio.example";
        const request = new Request(base + "/api/enquiries", {
          method: "POST",
          headers: { Origin: base },
          body: form,
        });
        const response =
          mode === "node"
            ? await fetch(request)
            : await worker.fetch(request, env);
        const result = await response.json();
        assert.equal(response.status, 201, mode + "/" + source + " failed");
        saved.push({ id: result.id, source });
        const row =
          source === "contact"
            ? await database.contactMessage.findUniqueOrThrow({
                where: { id: result.id },
                include: { attachments: true },
              })
            : await database.enquiry.findUniqueOrThrow({
                where: { id: result.id },
                include: { attachments: true },
              });
        assert.equal(row.name, payload.name);
        assert.equal(row.email, payload.email);
        assert.equal(row.attachments.length, 1);
        assert.equal(row.attachments[0].size, 8);
        if (mode === "node")
          assert.deepEqual(
            row.attachments[0].content,
            new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
          );
        else assert.equal(row.attachments[0].content, null);
        assert.equal("payload" in row, false);
        if ("quantity" in row) assert.equal(row.quantity, 2);
        else assert.equal(row.message, payload.description);
        assert.equal(
          source === "contact"
            ? row.attachments[0].contactMessageId
            : row.attachments[0].enquiryId,
          result.id,
        );
        console.log(
          mode +
            "/" +
            source +
            ": HTTP 201; typed columns and attachment relation verified.",
        );
      }
    }
    rollbackId = "GF-ROLLBACK-" + randomUUID();
    const duplicateAttachment = (await database.attachment.findFirstOrThrow())
      .id;
    const record: EnquiryRecord = {
      id: rollbackId,
      createdAt: new Date().toISOString(),
      status: "New",
      notes: "",
      payload: {
        ...payload,
        attachments: [
          {
            id: duplicateAttachment,
            filename: "duplicate.png",
            name: "duplicate.png",
            mime: "image/png",
            size: 8,
          },
        ],
      },
    };
    await assert.rejects(saveDatabaseEnquiry(connectionString, record));
    assert.equal(
      await database.enquiry.findUnique({ where: { id: rollbackId } }),
      null,
    );
    console.log(
      "Prisma nested write rollback verified: failed attachment left no parent record.",
    );
    await assert.rejects(
      database.attachment.create({
        data: {
          id: orphanId,
          filename: "orphan.png",
          name: "orphan.png",
          mime: "image/png",
          size: 8,
        },
      }),
    );
    console.log("Database rejected an attachment without an owner.");
  } finally {
    for (const { id, source } of saved) {
      if (source === "contact")
        await database.contactMessage.deleteMany({
          where: { id, email: payload.email },
        });
      else
        await database.enquiry.deleteMany({
          where: { id, email: payload.email },
        });
      await rm("/tmp/grain-form-prisma-qa/uploads/" + id, {
        recursive: true,
        force: true,
      });
    }
    if (rollbackId)
      await database.enquiry.deleteMany({
        where: { id: rollbackId, email: payload.email },
      });
    await database.attachment.deleteMany({ where: { id: orphanId } });
    await database.$disconnect();
    console.log("Temporary QA submissions and image files cleaned up.");
  }
}
main().catch(() => {
  console.error("Structured submission verification failed.");
  process.exitCode = 1;
});
