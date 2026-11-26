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
  assert.deepEqual(storageErrorDetails(error, [error.message]), {
    name: "PrismaClientKnownRequestError",
    code: "P2021",
    summary: "[redacted]",
  });
});

test("code-less Prisma failures expose nested driver diagnostics without private text", () => {
  const error = {
    name: "PrismaClientKnownRequestError",
    meta: {
      driverAdapterError: {
        cause: {
          kind: "AuthenticationFailed",
          originalCode: "28P01",
          originalMessage:
            'password authentication failed for user "private-user"',
          user: "private-user",
        },
      },
    },
  };
  assert.deepEqual(storageErrorDetails(error), {
    name: "PrismaClientKnownRequestError",
    driverCodes: ["28P01"],
    driverKinds: ["AuthenticationFailed"],
    signals: ["authentication-failed"],
  });
});

test("diagnostics handle cyclic causes and classify code-less connection timeouts", () => {
  const error = Object.assign(
    new Error("Connection terminated due to connection timeout"),
    {
      name: "PrismaClientKnownRequestError",
      cause: {} as unknown,
    },
  );
  error.cause = error;
  assert.deepEqual(storageErrorDetails(error), {
    name: "PrismaClientKnownRequestError",
    signals: ["connection-timeout", "connection-closed"],
    summary: "Connection terminated due to connection timeout",
  });
});

test("error summaries omit invocation arguments and redact credentials and customer fields", () => {
  const url = "postgresql://owner:private-password@db.example/db";
  const error = {
    name: "PrismaClientKnownRequestError",
    message: `Invalid invocation:\n{ name: "Private Client", description: "Private project" }\n\nDriver failed for Private Client at ${url}; password private-password; client@example.com`,
  };
  assert.deepEqual(
    storageErrorDetails(error, [url, "Private Client", "Private project"]),
    {
      name: "PrismaClientKnownRequestError",
      summary:
        "Driver failed for [redacted] at [redacted]; password [redacted]; [redacted-email]",
    },
  );
});

test("storage diagnostics discard unknown names, codes, and thrown values", () => {
  for (const error of [
    null,
    undefined,
    "private password",
    new Error("private connection string"),
    { name: "private name", code: "private code" },
    { name: "Error", code: "P2021\nprivate data" },
  ])
    assert.deepEqual(storageErrorDetails(error), { name: "Error" });
});
