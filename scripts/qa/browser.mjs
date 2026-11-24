import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
const port = 3102;
const origin = `http://localhost:${port}`;
const data = `/tmp/grain-form-qa-${randomUUID()}`;
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", String(port)],
  {
    env: {
      ...process.env,
      DATA_DIRECTORY: data,
      RESEND_API_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let logs = "";
child.stdout.on("data", (b) => (logs += b));
child.stderr.on("data", (b) => (logs += b));
let browser;
try {
  let ready = false;
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(origin);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  if (!ready) throw new Error("Server did not start: " + logs);
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  // A 204 keeps the confirmation visible while verifying the WhatsApp handoff.
  await context.route("https://wa.me/**", (route) =>
    route.fulfill({ status: 204 }),
  );
  page.setDefaultTimeout(15000);
  page.on("response", async (r) => {
    if (r.url().includes("/api/"))
      console.log(
        "API",
        r.status(),
        r.url(),
        r.status() >= 400 ? await r.text() : "",
      );
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.screenshot({
    path: "/tmp/grain-form-desktop.png",
    fullPage: true,
  });
  assert.equal(
    await page.locator("h1").innerText(),
    "Crafted from wood.\nDesigned for you.",
  );
  for (const route of [
    "/about",
    "/services",
    "/work",
    "/contact",
    "/work/the-walnut-residence",
  ]) {
    await page.goto(origin + route);
    assert.equal(await page.locator("h1").count(), 1);
  }
  await page.goto(origin + "/work");
  await page.getByRole("button", { name: "Kitchens", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".portfolio-card").length === 1,
  );
  await page.getByRole("button", { name: "All work", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".portfolio-card").length === 6,
  );
  await page.goto(origin + "/enquiry?type=Dining%20Table");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  assert.equal(await page.locator(".field-error").count(), 2);
  await page.getByLabel("Project title").fill("A bespoke walnut dining table");
  await page
    .getByLabel("What would you like us to create?")
    .fill(
      "A beautiful table for six people with rounded corners and a natural finish.",
    );
  // Blur validation removes error text and moves the Continue button.
  await page.getByLabel("What would you like us to create?").blur();
  await page.waitForFunction(
    () => document.querySelectorAll(".field-error").length === 0,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Project location / city").fill("Jaipur");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByLabel("Upload reference images")
    .setInputFiles("public/images/dining.jpg");
  assert.equal(await page.locator(".upload-preview").count(), 1);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Full name").fill("Browser QA Client");
  await page
    .getByLabel("Mobile number", { exact: false })
    .first()
    .fill("+91 9000000000");
  await page.getByLabel("Email address").fill("browser-qa@example.com");
  await page.getByLabel("Your city").fill("Jaipur");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Review enquiry" }).click();
  await page.screenshot({
    path: "/tmp/grain-form-enquiry.png",
    fullPage: true,
  });
  const whatsappRequest = page.waitForRequest((request) =>
    request.url().startsWith("https://wa.me/"),
  );
  await page.getByRole("button", { name: "Submit enquiry" }).click();
  const whatsapp = new URL((await whatsappRequest).url());
  assert.equal(
    whatsapp.pathname,
    `/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918905089544"}`,
  );
  assert.match(
    whatsapp.searchParams.get("text"),
    /A bespoke walnut dining table/,
  );
  await page.getByText("Your idea is in").waitFor();
  const reference = await page.locator(".reference-number").innerText();
  assert.match(reference, /^GF-/);
  assert.equal(
    await page.getByRole("link", { name: "Studio admin" }).count(),
    0,
  );
  assert.equal((await context.request.get(origin + "/admin")).status(), 404);
  assert.equal(
    (await context.request.get(origin + "/api/admin/login")).status(),
    404,
  );
  assert.equal(
    (await context.request.get(origin + "/api/admin/enquiries")).status(),
    404,
  );
  await page.goto(origin + "/contact");
  await page.getByLabel("Full name").fill("WhatsApp Contact Client");
  await page.getByLabel("Email address").fill("contact-qa@example.com");
  await page.getByLabel("Mobile number").fill("+91 9000000000");
  await page.getByLabel("Your city").fill("Jaipur");
  await page
    .getByLabel("How can we help?")
    .fill("Please discuss a custom oak desk for my home office.");
  await page.getByRole("checkbox").check();
  const contactWhatsappRequest = page.waitForRequest((request) =>
    request.url().startsWith("https://wa.me/"),
  );
  await page.getByRole("button", { name: "Send your message" }).click();
  const contactWhatsapp = new URL((await contactWhatsappRequest).url());
  assert.equal(contactWhatsapp.pathname, whatsapp.pathname);
  assert.match(
    contactWhatsapp.searchParams.get("text"),
    /WhatsApp Contact Client/,
  );
  assert.match(contactWhatsapp.searchParams.get("text"), /custom oak desk/);
  await page.getByRole("link", { name: "Send on WhatsApp" }).waitFor();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Custom Enquiry" })
    .click();
  await page
    .getByRole("heading", { name: "Your idea. Let’s give it form." })
    .waitFor();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    true,
  );
  await page.screenshot({
    path: "/tmp/grain-form-mobile-enquiry.png",
    fullPage: true,
  });
  await page.goto(origin);
  await page.screenshot({ path: "/tmp/grain-form-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: desktop pages, portfolio filters, enquiry validation + upload + persistence, WhatsApp handoff, removed admin routes, mobile navigation and overflow.",
  );
  console.log(
    "Screenshots: /tmp/grain-form-{desktop,mobile,enquiry,mobile-enquiry}.png",
  );
} catch (e) {
  console.log("SERVER LOGS", logs);
  for (const c of browser?.contexts() || [])
    for (const p of c.pages()) {
      console.log(
        "PAGE",
        p.url(),
        (await p.locator("body").innerText()).slice(-4500),
      );
      await p.screenshot({
        path: "/tmp/grain-form-qa-error.png",
        fullPage: true,
      });
    }
  throw e;
} finally {
  await browser?.close();
  child.kill("SIGTERM");
  rmSync(data, { recursive: true, force: true });
}
