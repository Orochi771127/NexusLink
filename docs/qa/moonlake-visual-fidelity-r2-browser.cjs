const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const BASE_URL = process.env.MOONLAKE_QA_URL || "http://127.0.0.1:4173/";
const OUTPUT_DIR = path.resolve("output/playwright");
const TIME_PHASE = process.env.MOONLAKE_TIME_PHASE || "day";
const WEATHER = process.env.MOONLAKE_WEATHER || "clear";
const REDUCED_MOTION = process.env.MOONLAKE_REDUCED_MOTION === "1";
const CAPTURE_BRIDGE = process.env.MOONLAKE_CAPTURE_BRIDGE === "1";
const CAPTURE_ID = `${TIME_PHASE}-${WEATHER}${REDUCED_MOTION ? "-reduced" : ""}${CAPTURE_BRIDGE ? "-bridge" : ""}`
  .replace(/[^a-z0-9_-]+/gi, "-");

let browser;

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-angle=swiftshader"
    ]
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    reducedMotion: REDUCED_MOTION ? "reduce" : "no-preference"
  });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript(() => {
    const now = Date.now();
    localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
      activeHabitatId: "moonlake",
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: ["greyshade-cat"],
      onboarding: {
        version: 1,
        status: "completed",
        completed: true,
        completedAt: now,
        startedAt: now - 1000,
        identityCompleted: true,
        guidanceCompleted: true,
        greyshadeMetAt: now,
        veteranAutoCompleted: false,
        firstLoop: { skippedAt: null, completedAt: now }
      },
      playerProfile: {
        displayName: "Moonlake QA",
        identitySkipped: false,
        createdAt: now,
        updatedAt: now
      }
    }));
  });

  const query = new URLSearchParams({
    live3d: "1",
    timePhase: TIME_PHASE,
    weather: WEATHER
  });
  await page.goto(`${BASE_URL}?${query}`, {
    waitUntil: "commit",
    timeout: 45_000
  });
  try {
    await page.waitForFunction(
      () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true,
      null,
      { timeout: 45_000 }
    );
  } catch (error) {
    const bootState = await page.evaluate(() => ({
      readyState: document.readyState,
      hasHabitatApi: Boolean(window.__NEXUS_HABITAT),
      diagnostics: window.__NEXUS_HABITAT?.getLive3dDiagnostics?.() || null,
      canvasCount: document.querySelectorAll(".moonlake-live3d-canvas").length,
      bodyClass: document.body.className
    }));
    console.error(JSON.stringify({ bootState, pageErrors, consoleErrors }));
    throw error;
  }
  if (CAPTURE_BRIDGE) {
    await page.evaluate(() => {
      const routeChoices = {
        platform_center: 0.5,
        platform_right: 0.99,
        bridge_near: 0.99
      };
      Math.random = () => {
        const stack = String(new Error().stack || "");
        if (stack.includes("chooseNextWaypoint")) {
          const currentId = window.__NEXUS_HABITAT?.getRoamingSnapshot?.()?.currentId;
          return routeChoices[currentId] ?? 0;
        }
        if (stack.includes("randomBetween")) return 0;
        return 0.5;
      };
    });
    await page.waitForFunction(() => {
      const roaming = window.__NEXUS_HABITAT?.getRoamingSnapshot?.();
      return roaming?.currentId === "bridge_mid" && !roaming?.targetId;
    }, null, { timeout: 45_000 });
  }
  await page.waitForTimeout(1600);
  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await page.waitForTimeout(180);
  }

  const snapshot = await page.evaluate(() => {
    const diagnostics = window.__NEXUS_HABITAT.getLive3dDiagnostics();
    const canvas = document.querySelector(".moonlake-live3d-canvas");
    const rect = canvas?.getBoundingClientRect();
    const companion = window.__NEXUS_ACTIVE_COMPANION__;
    const bounds = companion?.getBounds?.();
    return {
      diagnostics,
      canvas: rect
        ? { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        : null,
      companion: bounds
        ? {
            x: bounds.x,
            y: bounds.y,
            width: bounds.width,
            height: bounds.height,
            footX: bounds.x + bounds.width / 2,
            footY: bounds.y + bounds.height
          }
        : null,
      viewport: { width: innerWidth, height: innerHeight }
    };
  });

  await page.screenshot({
    path: path.join(OUTPUT_DIR, `moonlake-r2-mobile-${CAPTURE_ID}.png`),
    fullPage: false
  });

  assert.equal(snapshot.diagnostics.ready, true);
  assert.equal(snapshot.diagnostics.canvasCount, 1);
  assert.equal(snapshot.diagnostics.visualMaster.id, "moonlake-visual-fidelity-r2");
  assert.equal(snapshot.diagnostics.visualMaster.mode, "owner_approved_live_diorama");
  assert.equal(snapshot.diagnostics.reducedMotion, REDUCED_MOTION);
  assert.equal(snapshot.diagnostics.environment.weather, WEATHER);
  if (TIME_PHASE === "night") {
    assert.ok(snapshot.diagnostics.environment.nightMix > 0.9);
  }
  if (WEATHER === "rain" && !REDUCED_MOTION) {
    assert.equal(snapshot.diagnostics.environment.rainVisible, true);
  }
  if (WEATHER === "mist") {
    assert.equal(snapshot.diagnostics.environment.mistVisible, true);
  }
  assert.ok(snapshot.diagnostics.animation.visualTime > 0);
  assert.deepEqual(snapshot.canvas, {
    x: 0,
    y: 0,
    width: snapshot.viewport.width,
    height: snapshot.viewport.height
  });
  assert.ok(snapshot.companion);
  assert.ok(snapshot.companion.footX > 80 && snapshot.companion.footX < 310);
  assert.ok(snapshot.companion.footY > 300 && snapshot.companion.footY < 700);
  if (CAPTURE_BRIDGE) {
    assert.ok(snapshot.companion.footX > 220 && snapshot.companion.footX < 300);
    assert.ok(snapshot.companion.footY > 300 && snapshot.companion.footY < 390);
  }
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  console.log(JSON.stringify({
    pass: true,
    screenshot: path.join(OUTPUT_DIR, `moonlake-r2-mobile-${CAPTURE_ID}.png`),
    visualMaster: snapshot.diagnostics.visualMaster,
    companion: snapshot.companion,
    renderer: snapshot.diagnostics.renderer
  }));
  await browser.close();
})().catch(async (error) => {
  console.error(error);
  await browser?.close();
  process.exitCode = 1;
});
