import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";

const manifest = JSON.parse(
  readFileSync("docs/product-photo-prompts.json", "utf8"),
);
assert.equal(manifest.images.length, 14);
for (const photo of manifest.images) {
  assert.equal(
    createHash("sha256").update(readFileSync(photo.original)).digest("hex"),
    photo.originalSha256,
    `Original photo ${photo.id} changed`,
  );
  assert.ok(readFileSync(photo.studio).byteLength > 1000);
}
const origin = "http://localhost:3105";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", "3105"],
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
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(origin + "/products", { waitUntil: "networkidle" });
  const links = await page
    .locator(".collection-card-link")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  assert.equal(links.length, 4);
  assert.equal(
    await page.getByText("The Everyday Collection", { exact: true }).count(),
    0,
  );
  await page.screenshot({
    path: "/tmp/wooden-craft-products-desktop.png",
    fullPage: true,
  });
  let views = 0;
  for (const href of links) {
    assert.equal(
      (await page.goto(origin + href, { waitUntil: "networkidle" })).status(),
      200,
    );
    const name = await page.locator("h1").innerText();
    assert.equal(
      await page
        .locator('.desktop-nav a[href="/products"]')
        .getAttribute("aria-current"),
      "page",
    );
    const thumbnails = page.locator(".product-thumbnails button");
    const count = (await thumbnails.count()) || 1;
    for (let index = 0; index < count; index++) {
      if (count > 1) await thumbnails.nth(index).click();
      assert.equal(
        await page
          .getByRole("button", { name: "Original photo", exact: true })
          .count(),
        0,
      );
      assert.equal(
        await page
          .getByRole("button", { name: "Studio view", exact: true })
          .count(),
        0,
      );
      await page.waitForFunction(() => {
        const image = document.querySelector(".product-gallery-image img");
        return (
          image?.complete &&
          image.naturalWidth > 0 &&
          decodeURIComponent(image.src).includes("/studio/")
        );
      });
      views++;
    }
    if (count > 1) {
      await page.getByRole("button", { name: "Next product photo" }).click();
      await page.waitForFunction(() =>
        document.querySelector(".photo-counter").textContent.startsWith("1 /"),
      );
      await page
        .getByRole("button", { name: "Previous product photo" })
        .click();
      await page.waitForFunction(
        (count) =>
          document
            .querySelector(".photo-counter")
            .textContent.startsWith(`${count} /`),
        count,
      );
    }
    const whatsapp = new URL(
      await page
        .getByRole("link", { name: "Enquire on WhatsApp" })
        .getAttribute("href"),
    );
    assert.equal(whatsapp.hostname, "wa.me");
    assert.equal(whatsapp.pathname, "/918905089544");
    assert.ok(whatsapp.searchParams.get("text").includes(name));
    const custom = new URL(
      await page
        .getByRole("link", { name: "Discuss a custom version" })
        .getAttribute("href"),
      origin,
    );
    assert.equal(custom.searchParams.get("title"), name);
  }
  assert.equal(views, 13);
  assert.equal(
    (
      await page.request.get(origin + "/products/wooden-objects-collection")
    ).status(),
    404,
  );
  assert.equal(
    (
      await page.request.get(origin + "/images/products/originals/04.jpeg")
    ).status(),
    404,
  );
  assert.equal(
    (
      await page.request.get(origin + "/images/products/studio/15.webp")
    ).status(),
    404,
  );
  const sitemap = await (
    await page.request.get(origin + "/sitemap.xml")
  ).text();
  for (const href of links) assert.ok(sitemap.includes(href));
  assert.equal(
    (await page.request.get(origin + "/products/not-a-product")).status(),
    404,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(origin + "/products", { waitUntil: "networkidle" });
  await page.mouse.move(0, 0);
  await page.waitForFunction(() => {
    const track = document.querySelector(".ticker-track");
    return new DOMMatrixReadOnly(getComputedStyle(track).transform).m41 < -2;
  });
  assert.equal(await page.locator(".ticker button").count(), 0);
  await page.locator(".ticker").hover();
  const pausedX = await page
    .locator(".ticker-track")
    .evaluate(
      (element) =>
        new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
    );
  await page.waitForTimeout(200);
  const stillX = await page
    .locator(".ticker-track")
    .evaluate(
      (element) =>
        new DOMMatrixReadOnly(getComputedStyle(element).transform).m41,
    );
  assert.ok(Math.abs(pausedX - stillX) < 0.5, "Ticker must stay paused");
  await page.mouse.move(0, 0);
  await page.waitForFunction((previous) => {
    const x = new DOMMatrixReadOnly(
      getComputedStyle(document.querySelector(".ticker-track")).transform,
    ).m41;
    return Math.abs(x - previous) > 2;
  }, stillX);
  await page.goto(origin + links[0], { waitUntil: "networkidle" });
  const zoomTrigger = page.locator(".gallery-zoom-trigger");
  await zoomTrigger.hover({ position: { x: 120, y: 140 } });
  const preview = page.getByRole("region", { name: /Magnified detail/ });
  await preview.waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const image = document.querySelector(".gallery-zoom-preview img");
    return image?.complete && image.naturalWidth > 0;
  });
  const stageBox = await page.locator(".product-gallery-stage").boundingBox();
  const previewBox = await preview.boundingBox();
  assert.ok(
    previewBox.x >= stageBox.x + stageBox.width,
    "Desktop detail must appear beside the photo",
  );
  const firstPosition = await page
    .locator(".gallery-zoom-detail")
    .getAttribute("style");
  await zoomTrigger.hover({ position: { x: 240, y: 240 } });
  assert.notEqual(
    await page.locator(".gallery-zoom-detail").getAttribute("style"),
    firstPosition,
  );
  await page.screenshot({
    path: "/tmp/wooden-craft-gallery-hover-desktop.png",
  });
  await page.mouse.move(0, 0);
  await preview.waitFor({ state: "detached" });
  await zoomTrigger.focus();
  await page.keyboard.press("Enter");
  await preview.waitFor({ state: "visible" });
  await page.keyboard.press("Escape");
  await preview.waitFor({ state: "detached" });
  await page.locator(".product-thumbnails button").first().click();
  const initialPhoto = await page
    .locator(".product-gallery-image img")
    .getAttribute("src");
  await page.getByRole("button", { name: "Next product photo" }).focus();
  await page.keyboard.press("Enter");
  await page.waitForFunction((previous) => {
    const image = document.querySelector(".product-gallery-image img");
    return (
      image?.complete &&
      image.naturalWidth > 0 &&
      image.getAttribute("src") !== previous &&
      getComputedStyle(image.parentElement).opacity === "1"
    );
  }, initialPhoto);
  assert.equal(await page.locator(".thumbnail-indicator").count(), 1);
  assert.equal(
    await page
      .locator(".product-thumbnails button")
      .nth(1)
      .getAttribute("aria-pressed"),
    "true",
  );
  await page.waitForFunction(
    () =>
      getComputedStyle(document.querySelector(".product-enquiry")).opacity ===
      "1",
  );
  await page
    .locator(".related-products .collection-grid")
    .scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll(".related-products .collection-card")].every(
      (card) => getComputedStyle(card).opacity === "1",
    ),
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({
    path: "/tmp/wooden-craft-product-motion.png",
    fullPage: true,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin + "/products", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".ticker button").count(), 0);
  assert.equal(
    await page
      .locator(".ticker-track")
      .evaluate((element) => getComputedStyle(element).transform),
    "none",
  );
  await page.screenshot({
    path: "/tmp/wooden-craft-products-mobile.png",
    fullPage: true,
  });
  await page.goto(origin + links[0], { waitUntil: "networkidle" });
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const touchPage = await mobile.newPage();
  await touchPage.goto(origin + links[0], { waitUntil: "networkidle" });
  const cdp = await mobile.newCDPSession(touchPage);
  async function swipe(selector, dx, dy = 0) {
    const target = touchPage.locator(selector);
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    const x = box.x + box.width * (dx < 0 ? 0.8 : 0.2);
    const y = box.y + box.height / 2;
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x, y }],
    });
    for (let step = 1; step <= 6; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + (dx * step) / 6, y: y + (dy * step) / 6 }],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
  }
  await swipe(".product-gallery-stage", -150);
  await touchPage.waitForFunction(
    () =>
      document.querySelector(".photo-counter").textContent.trim() === "2 / 5",
  );
  assert.equal(
    await touchPage.getByRole("dialog").count(),
    0,
    "Swiping must not open fullscreen",
  );
  await swipe(".product-gallery-stage", 150);
  await touchPage.waitForFunction(
    () =>
      document.querySelector(".photo-counter").textContent.trim() === "1 / 5",
  );
  await touchPage.locator(".gallery-zoom-trigger").tap();
  await touchPage.waitForFunction(() =>
    document
      .querySelector(".product-gallery-stage")
      .classList.contains("is-zoomed"),
  );
  assert.equal(
    await touchPage
      .locator(".product-gallery-stage")
      .evaluate((element) => element.classList.contains("is-zoomed")),
    true,
  );
  const oldOrigin = await touchPage
    .locator(".product-gallery-image")
    .getAttribute("style");
  await swipe(".product-gallery-stage", -100);
  assert.equal(
    await touchPage.locator(".photo-counter").textContent(),
    "1 / 5",
    "Zoom panning must not change the photo",
  );
  assert.notEqual(
    await touchPage.locator(".product-gallery-image").getAttribute("style"),
    oldOrigin,
  );
  await touchPage.screenshot({
    path: "/tmp/wooden-craft-gallery-zoom-mobile.png",
  });
  await touchPage.locator(".gallery-zoom-trigger").tap();
  await touchPage.waitForFunction(
    () =>
      !document
        .querySelector(".product-gallery-stage")
        .classList.contains("is-zoomed"),
  );
  assert.equal(
    await touchPage
      .locator(".product-gallery-stage")
      .evaluate((element) => element.classList.contains("is-zoomed")),
    false,
  );
  await mobile.close();
  await page.screenshot({
    path: "/tmp/wooden-craft-product-detail-mobile.png",
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    "PASS: four products, 13 generated views, desktop hover detail and moving lens, keyboard zoom/escape, mobile swipe and inline zoom panning, ticker, animations, reduced motion, WhatsApp and sitemap",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
