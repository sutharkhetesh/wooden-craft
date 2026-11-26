import test from "node:test";
import assert from "node:assert/strict";
import { storageErrorDetails } from "../src/lib/server/storage-error";
import { databaseUrl } from "../src/lib/server/database-url";

test("storage diagnostics keep Prisma codes without private error data", () => {
  const error = Object.assign(new Error("private connection string and SQL"), {
    name: "PrismaClientKnownRequestError",
    code: "P2021",
    meta: { customerEmail: "private@example.com" },
    cause: new Error("private password"),
  });
  assert.deepEqual(storageErrorDetails(error), {
    name: "PrismaClientKnownRequestError",
    code: "P2021",
  });
});

test("URL failures use fixed summaries without invocation arguments", () => {
  assert.deepEqual(
    storageErrorDetails({
      name: "PrismaClientKnownRequestError",
      message: 'Invalid invocation: { name: "Private Client" }\n\nInvalid URL',
    }),
    {
      name: "PrismaClientKnownRequestError",
      summary: "Invalid URL",
    },
  );
  try {
    databaseUrl("private-invalid-connection-string");
    assert.fail("Invalid configuration must throw");
  } catch (error) {
    assert.deepEqual(storageErrorDetails(error), {
      name: "DatabaseConfigurationError",
      summary: "Invalid DATABASE_URL configuration",
    });
  }
});

test("unknown errors and malformed codes never expose private details", () => {
  for (const error of [
    null,
    undefined,
    "private password",
    new Error("private connection string"),
    { name: "private name", code: "private code" },
    { name: "Error", code: "P2021\nprivate data" },
    { name: "Error", code: "P2021\n" },
  ])
    assert.deepEqual(storageErrorDetails(error), { name: "Error" });
});
