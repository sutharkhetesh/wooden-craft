import test from "node:test";
import assert from "node:assert/strict";
import { databaseUrl } from "../src/lib/server/database-url";

const url =
  "postgresql://owner:example-password@db.example/neondb?sslmode=verify-full&channel_binding=require";

test("database URL preserves credentials and options while removing dashboard quotes", () => {
  for (const value of [url, `  ${url}\n`, `"${url}"`, `'${url}'`]) {
    assert.equal(databaseUrl(value), url);
  }
});

test("invalid deployment URLs fail with credential-free configuration errors", () => {
  for (const value of [
    "",
    `DATABASE_URL="${url}"`,
    "https://db.example/neondb",
    "postgresql:///neondb",
    "postgresql://owner:example-password@db.example",
    url.replace("db.example", "db.\nexample"),
  ]) {
    assert.throws(
      () => databaseUrl(value),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /DATABASE_URL/);
        assert.equal(error.message.includes("example-password"), false);
        assert.equal(error.message.includes("db.example"), false);
        return true;
      },
    );
  }
});
