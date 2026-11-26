import test from "node:test";
import assert from "node:assert/strict";
import { storageErrorDetails } from "../src/lib/server/storage-error";

test("storage diagnostics retain Prisma codes without private error data", () => {
  const error = Object.assign(new Error("private connection string and SQL"), {
    name: "PrismaClientKnownRequestError",
    code: "P2021",
    meta: { customerEmail: "private@example.com", query: "private SQL" },
    cause: new Error("private password"),
  });
  assert.deepEqual(storageErrorDetails(error), {
    name: "PrismaClientKnownRequestError",
    code: "P2021",
  });
});

test("storage diagnostics discard unknown names, codes, and thrown values", () => {
  for (const error of [
    null,
    undefined,
    "private password",
    new Error("private connection string"),
    { name: "private name", code: "private code" },
    { name: "Error", code: "P2021\nprivate data" },
  ]) assert.deepEqual(storageErrorDetails(error), { name: "Error" });
});
