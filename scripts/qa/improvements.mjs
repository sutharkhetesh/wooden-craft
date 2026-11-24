import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import assert from "node:assert/strict";

const data = await mkdtemp("/tmp/enteak-improvements-");
const origin = "http://localhost:3118";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3118"],
  {
    env: {
      ...process.env,
      DATABASE_URL: "",
      DIRECT_URL: "",
      RESEND_API_KEY: "",
      DATA_DIRECTORY: data,
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
server.stdout.on("data", (chunk) => {
  logs += chunk;
});
server.stderr.on("data", (chunk) => {
  logs += chunk;
});
let browser;
try {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, logs);
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ status: 204 }),
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin, { waitUntil: "networkidle" });
  assert.equal(await page.locator(".testimonials").count(), 0);
  const faq = page.locator(".faq-list details").first();
  await faq.locator("summary").click();
  assert.ok(await faq.evaluate((el) => el.open));
  const form = page.locator("#quick-enquiry form");
  assert.equal(
    await form
      .locator('input:not([type="checkbox"]):not([name="website"])')
      .count(),
    2,
  );
  await form.getByLabel("Full name").fill("QA Quick Client");
  await form.getByLabel("Mobile number").fill("+919000000000");
  await form
    .getByLabel("How can we help?")
    .fill("A custom desk for a small study room, please.");
  await form.getByRole("checkbox").check();
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/api/enquiries") && r.request().method() === "POST",
  );
  await form.getByRole("button", { name: "Send your message" }).click();
  assert.equal((await response).status(), 201);
  await page.locator(".reference-number").waitFor();
  const saved = JSON.parse(
    await readFile(
      `${data}/enquiries/${(await readdir(`${data}/enquiries`))[0]}`,
      "utf8",
    ),
  );
  assert.equal(saved.payload.name, "QA Quick Client");
  assert.equal(saved.payload.email, "");

  await page.goto(origin + "/enquiry", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Continue/ }).click();
  await page.locator("#title").fill("Oak desk draft");
  await page
    .locator("#description")
    .fill("A compact oak desk with storage for books.");
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByText("Your project draft was restored.", { exact: false })
    .waitFor();
  await page.getByRole("button", { name: /Continue/ }).click();
  assert.equal(await page.locator("#title").inputValue(), "Oak desk draft");
  await page.getByRole("button", { name: "Clear draft & start again" }).click();
  assert.equal(
    await page.evaluate(() => localStorage.getItem("enteak-project-draft-v1")),
    null,
  );
  await page.getByRole("button", { name: /Continue/ }).click();
  assert.equal(await page.locator("#title").inputValue(), "");

  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/enquiry", "/products/wooden-quill-holder"]) {
      await page.goto(origin + path, { waitUntil: "networkidle" });
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        `${path} overflows at ${width}`,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + "/#quick-enquiry", { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/enteak-improvements-mobile.png" });
  assert.deepEqual(errors, []);
  console.log(
    "Passed: saved quick enquiry, FAQ interaction, draft restore/clear, mobile/tablet/desktop overflow and browser errors.",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
  await new Promise((resolve) =>
    server.exitCode !== null ? resolve() : server.once("exit", resolve),
  );
  await rm(data, { recursive: true, force: true });
}
