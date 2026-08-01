import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = process.env.NEXUS_GAMEPLAY_SKIN_QA_URL || "http://127.0.0.1:4174";
const OUTPUT = resolve("output/gameplay-skins/r3-runtime");
const STORAGE_KEY = "nexusLinkR2State:v1";
const results = [];

await mkdir(OUTPUT, { recursive: true });

function seedScript() {
  return `(() => {
    const now = Date.now();
    localStorage.setItem(${JSON.stringify(STORAGE_KEY)}, JSON.stringify({
      playerProfile: { displayName: 'Gameplay Skin R3 QA', identitySkipped: false, createdAt: now, updatedAt: now },
      onboarding: {
        status: 'completed', completed: true, completedAt: now,
        identityCompleted: true, guidanceCompleted: true, greyshadeMetAt: now,
        veteranAutoCompleted: false, firstLoop: { completedAt: now }
      },
      firstTouchCompleted: true,
      firstHugCompleted: true,
      activeCompanionId: 'greyshade-cat',
      unlockedCompanionIds: ['greyshade-cat'],
      energy: 10,
      trust: 48,
      bond: 42,
      mood: 'calm',
      defense: 24,
      touchFatigue: 0,
      safeHarborMode: false,
      chapterProgress: { current: 2, completed: [1] },
      explorationProgress: { totalExplorations: 1, lastNodeId: 'moonlake_camp', visitCounts: { moonlake_camp: 1 } },
      emotionalMemories: [],
      habitatTraces: []
    }));
  })()`;
}

async function boot(page, path = "/") {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: "commit", timeout: 30_000 });
  await page.waitForFunction(
    "document.documentElement.dataset.nexusControllersReady === 'true'",
    null,
    { timeout: 20_000 }
  );
}

async function openOrbit(page) {
  await page.locator(".bottom-nav [data-action='explore']").click();
  await page.evaluate(() => {
    const host = document.querySelector('[data-page="explore"]');
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.pageAction = "open-orbit";
    host.appendChild(button);
    button.click();
  });
  await page.locator(".orbit-battle:not([hidden])").waitFor({ state: "visible", timeout: 12_000 });
  await page.waitForTimeout(1_800);
}

async function openExpedition(page) {
  await page.locator(".bottom-nav [data-action='explore']").click();
  await page.locator('[data-page="explore"] [data-page-action="open-map"]').click();
  await page.locator('.map-expedition-launch[data-expedition-node="plains_windrest"]').waitFor({ state: "visible", timeout: 12_000 });
  await page.locator('.map-expedition-launch[data-expedition-node="plains_windrest"]').click();
  await page.waitForFunction("document.body.classList.contains('expedition-active')", null, { timeout: 12_000 });
  await page.waitForTimeout(2_400);
}

async function geometry(page, mode) {
  return page.evaluate((activeMode) => {
    const rect = (selector) => {
      const value = document.querySelector(selector)?.getBoundingClientRect();
      return value ? {
        x: value.x, y: value.y, top: value.top, right: value.right,
        bottom: value.bottom, width: value.width, height: value.height
      } : null;
    };
    const buttons = [...document.querySelectorAll(
      activeMode === "orbit"
        ? ".orbit-battle:not([hidden]) button:not([hidden])"
        : ".expedition-overlay button:not([hidden])"
    )].map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height, text: button.textContent.trim() };
    });
    return {
      viewport: { width: innerWidth, height: innerHeight },
      top: rect(activeMode === "orbit" ? ".orbit-battle:not([hidden]) .orbit-hud-top" : ".expedition-hud-top"),
      bottom: rect(activeMode === "orbit" ? ".orbit-battle:not([hidden]) .orbit-hud-bottom" : ".expedition-hud-bottom"),
      stage: rect(activeMode === "orbit" ? ".orbit-canvas" : "#game-root canvas:not(.moonlake-live3d-canvas)"),
      buttons
    };
  }, mode);
}

async function runVisibleCase(browser, { name, viewport, mode, reducedMotion = "no-preference" }) {
  const context = await browser.newContext({ viewport, reducedMotion });
  await context.addInitScript(seedScript());
  const page = await context.newPage();
  const pageErrors = [];
  const failedRequests = [];
  const promotedResponses = [];
  page.on("pageerror", (error) => pageErrors.push(error?.stack || String(error)));
  page.on("requestfailed", (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText || "failed"}`));
  page.on("response", (response) => {
    if (response.url().includes("/assets/gameplay/GameplaySkins_r3/")) {
      promotedResponses.push({ url: response.url(), status: response.status() });
    }
  });

  await boot(page, mode === "orbit" ? "/?orbitCampSlice=1" : "/");
  if (mode === "orbit") await openOrbit(page);
  else await openExpedition(page);

  const layout = await geometry(page, mode);
  console.log(name, JSON.stringify(layout));
  assert.ok(layout.stage?.width > 300 && layout.stage?.height > 250, `${name}: playfield too small`);
  assert.equal(pageErrors.length, 0, `${name}: page errors: ${pageErrors.join(" | ")}`);
  assert.ok(promotedResponses.some((entry) => entry.status === 200), `${name}: promoted foundation was not loaded`);
  if (viewport.width <= 420) {
    assert.ok(layout.buttons.every((button) => button.height >= 43.5), `${name}: touch target below 44px`);
    assert.ok(!layout.top || !layout.bottom || layout.top.bottom < layout.bottom.top, `${name}: HUD overlap`);
  }

  const screenshot = resolve(OUTPUT, `${name}.png`);
  await page.screenshot({ path: screenshot });
  results.push({ name, mode, viewport, reducedMotion, layout, promotedResponses, pageErrors, failedRequests, screenshot });
  await context.close();
}

async function runFallbackCase(browser, mode) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addInitScript(seedScript());
  await context.route("**/assets/gameplay/GameplaySkins_r3/*.png", (route) => route.abort("failed"));
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error?.stack || String(error)));
  await boot(page, mode === "orbit" ? "/?orbitCampSlice=1" : "/");
  if (mode === "orbit") await openOrbit(page);
  else await openExpedition(page);
  const layout = await geometry(page, mode);
  assert.ok(layout.stage?.width > 300 && layout.stage?.height > 250, `${mode} fallback playfield missing`);
  assert.equal(pageErrors.length, 0, `${mode} fallback page errors: ${pageErrors.join(" | ")}`);
  results.push({ name: `${mode}-asset-fallback-390x844`, mode, viewport: { width: 390, height: 844 }, layout, pageErrors });
  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await runVisibleCase(browser, { name: "orbit-390x844", viewport: { width: 390, height: 844 }, mode: "orbit" });
  await runVisibleCase(browser, { name: "expedition-390x844", viewport: { width: 390, height: 844 }, mode: "expedition" });
  await runVisibleCase(browser, { name: "orbit-1280x800", viewport: { width: 1280, height: 800 }, mode: "orbit" });
  await runVisibleCase(browser, { name: "expedition-1280x800", viewport: { width: 1280, height: 800 }, mode: "expedition" });
  await runVisibleCase(browser, { name: "orbit-reduced-motion-390x844", viewport: { width: 390, height: 844 }, mode: "orbit", reducedMotion: "reduce" });
  await runFallbackCase(browser, "orbit");
  await runFallbackCase(browser, "expedition");
} finally {
  await browser.close();
}

await writeFile(resolve(OUTPUT, "browser-gate.json"), `${JSON.stringify(results, null, 2)}\n`, "utf8");
console.log(`gameplay-skin-browser-r3: ${results.length}/7 PASS`);
