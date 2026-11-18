import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
  symlinkSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
const root = process.cwd();
const stage = path.join(root, ".sites-build");
rmSync(stage, { recursive: true, force: true });
mkdirSync(stage, { recursive: true });
cpSync("src", path.join(stage, "src"), {
  recursive: true,
  filter: (src) => !src.endsWith("/api"),
});
cpSync("public", path.join(stage, "public"), { recursive: true });
for (const file of ["tsconfig.json", "postcss.config.mjs", "package.json"])
  cpSync(file, path.join(stage, file));
symlinkSync(
  path.join(root, "node_modules"),
  path.join(stage, "node_modules"),
  "dir",
);
writeFileSync(
  path.join(stage, "next.config.ts"),
  `export default {output:'export',images:{unoptimized:true},poweredByHeader:false};\n`,
);
const result = spawnSync(
  process.execPath,
  [path.join(root, "node_modules/next/dist/bin/next"), "build"],
  {
    cwd: stage,
    stdio: "inherit",
    env: {
      ...process.env,
      NEXT_PUBLIC_STATIC_PREVIEW: "false",
      NEXT_PUBLIC_SITE_URL:
        process.env.NEXT_PUBLIC_SITE_URL ||
        "https://grain-form-woodwork.valiantnova8.chatgpt.site",
      NEXT_TELEMETRY_DISABLED: "1",
    },
  },
);
if (result.status !== 0) process.exit(result.status || 1);
const out = path.join(stage, "out");
const assets = {};
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
};
function collect(dir) {
  for (const file of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, file.name);
    if (file.isDirectory()) collect(absolute);
    else
      assets["/" + path.relative(out, absolute).split(path.sep).join("/")] = {
        type: mime[path.extname(file.name)] || "application/octet-stream",
        data: readFileSync(absolute).toString("base64"),
      };
  }
}
collect(out);
writeFileSync(
  path.join(stage, "assets.mjs"),
  `export default ${JSON.stringify(assets)};`,
);
writeFileSync(
  path.join(stage, "entry.mjs"),
  `import assets from './assets.mjs';import {createWorker} from '../hosting/worker.mjs';export default createWorker(assets);`,
);
mkdirSync("dist/server", { recursive: true });
await build({
  entryPoints: [path.join(stage, "entry.mjs")],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  outfile: "dist/server/index.js",
  minify: true,
});
mkdirSync("dist/.openai", { recursive: true });
cpSync(".openai/hosting.json", "dist/.openai/hosting.json");
console.log(
  `Hosted Worker built with ${Object.keys(assets).length} Next.js assets and durable D1/R2 enquiry storage.`,
);
