import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const origin = "http://localhost:3104";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3104"],
  { stdio: ["ignore", "pipe", "pipe"] },
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
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      if ((await fetch(origin)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert.ok(ready, `Preview did not start: ${logs}`);
  browser = await chromium.launch({
    executablePath: "/usr/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const routes = [
    "/",
    "/about",
    "/services",
    "/work",
    "/work/the-walnut-residence",
    "/enquiry",
    "/contact",
    "/products",
    "/products/wooden-desk-organiser",
    "/products/wooden-quill-holder",
  ];
  const requestedWidths = process.argv.find((argument) =>
    argument.startsWith("--widths="),
  );
  const widths = requestedWidths
    ? requestedWidths.slice(9).split(",").map(Number)
    : [
        320, 360, 390, 430, 600, 768, 800, 900, 1024, 1150, 1280, 1440, 1920,
        2560,
      ];
  for (const width of widths) {
    assert.ok(
      Number.isInteger(width) && width > 0,
      "Screen widths must be positive integers",
    );
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      assert.equal(response.status(), 200, `${route} at ${width}px`);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        offenders: [
          ...document.querySelectorAll(
            "header, main, footer, .header-inner, .button, input, select, textarea",
          ),
        ]
          .filter((element) => {
            if (element.closest('[aria-hidden="true"]')) return false;
            const bounds = element.getBoundingClientRect();
            return (
              bounds.width &&
              (bounds.right > innerWidth + 1 || bounds.left < -1)
            );
          })
          .map((element) => element.className || element.tagName),
      }));
      assert.ok(
        overflow.width <= width + 1,
        `${route} at ${width}px: ${JSON.stringify(overflow)}`,
      );
      assert.deepEqual(
        overflow.offenders,
        [],
        `${route} at ${width}px has clipped controls`,
      );
    }
    if (width <= 1150) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .waitFor();
      const menu = await page.locator(".mobile-nav").boundingBox();
      assert.ok(menu.x >= 0 && menu.x + menu.width <= width + 1);
      await page.keyboard.press("Escape");
      assert.equal(
        await page
          .getByRole("button", { name: "Open menu" })
          .getAttribute("aria-expanded"),
        "false",
      );
      assert.notEqual(
        await page.evaluate(() => document.body.style.overflow),
        "hidden",
      );
    }
    console.log(
      `PASS: ten routes at ${width}px, no overflow or clipped controls`,
    );
  }
  // Short landscape screens must still have a scrollable, usable menu.
  await page.setViewportSize({ width: 844, height: 390 });
  await page.goto(origin);
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Contact" })
    .click();
  await page.waitForURL(origin + "/contact");
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );

  // Menus close and release body scrolling when resized to desktop.
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForFunction(() => document.body.style.overflow !== "hidden");
  assert.equal(await page.locator(".desktop-nav").isVisible(), true);

  // Exercise real animation, then reduced motion, on the same browser page.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(origin + "/work", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Kitchens", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".portfolio-card").length === 1,
  );
  await page.getByRole("button", { name: "All work", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".portfolio-card").length === 6,
  );
  assert.equal(await page.locator(".scroll-progress").count(), 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .locator(".mobile-nav")
    .getByRole("link", { name: "Our Story" })
    .click();
  await page.waitForURL(origin + "/about");
  await page.waitForFunction(() => !document.querySelector(".mobile-nav"));
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin, { waitUntil: "networkidle" });
  await page.waitForFunction(
    () =>
      Number(
        getComputedStyle(document.querySelector(".hero-content > div")).opacity,
      ) === 1,
  );
  await page.screenshot({ path: "/tmp/wooden-craft-motion-desktop.png" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload({ waitUntil: "networkidle" });
  assert.equal(await page.locator(".scroll-progress").count(), 0);
  await page.screenshot({
    path: "/tmp/wooden-craft-responsive-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/wooden-craft-responsive-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: landscape menu, desktop resize, animated filters, motion preferences, and browser errors",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
