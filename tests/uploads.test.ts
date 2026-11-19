import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

async function loadUploads(databaseUrl: string) {
  const result = await build({
    entryPoints: ["src/lib/server/uploads.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    define: {
      "process.env.DATABASE_URL": JSON.stringify(databaseUrl),
      "process.env.VERCEL": '"1"',
      "process.env.DATA_DIRECTORY": '""',
    },
    plugins: [
      {
        name: "omit-server-only-and-database",
        setup(build) {
          build.onResolve(
            { filter: /^(server-only|@\/lib\/server\/database(?:-node)?)$/ },
            ({ path }) => ({ path, namespace: "test-stub" }),
          );
          build.onLoad({ filter: /.*/, namespace: "test-stub" }, () => ({
            contents:
              "export function saveDatabaseEnquiry() { throw new Error('Unexpected database access'); }",
            loader: "js",
          }));
        },
      },
    ],
  });
  const source = Buffer.from(result.outputFiles[0].contents).toString("base64");
  return import(`data:text/javascript;base64,${source}`);
}

test("serverless submissions without images never need filesystem storage", async () => {
  const { storeUploads } = await loadUploads("");
  assert.deepEqual(await storeUploads([], "GF-NO-FILES"), []);
  const image = new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
    "reference.png",
    { type: "image/png" },
  );
  await assert.rejects(
    storeUploads([image], "GF-WITH-FILE"),
    /Configure persistent upload storage/,
  );
});

test("serverless database uploads retain exact bytes without filesystem writes", async () => {
  const { storeUploads, removeUploads } =
    await loadUploads("postgresql://test");
  const bytes = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const image = new File([bytes], "reference.png", { type: "image/png" });
  const attachments = await storeUploads([image], "GF-DATABASE-IMAGE");
  assert.equal(attachments.length, 1);
  assert.equal(attachments[0].name, "reference.png");
  assert.equal(attachments[0].size, bytes.length);
  assert.deepEqual(new Uint8Array(attachments[0].content), bytes);
  await removeUploads("GF-DATABASE-IMAGE");
  await assert.rejects(
    storeUploads(
      [new File(["forged"], "fake.png", { type: "image/png" })],
      "GF-INVALID",
    ),
    /Only valid JPG, PNG and WebP/,
  );
});
