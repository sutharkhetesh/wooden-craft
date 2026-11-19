import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";

test("serverless submissions without images never need filesystem storage", async () => {
  const result = await build({
    entryPoints: ["src/lib/server/uploads.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "esm",
    define: {
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
  const { storeUploads } = await import(`data:text/javascript;base64,${source}`);

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
