const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");
const { PNG } = require("pngjs");

const ROOT = path.resolve(".");
const EXTERNAL_BASE_URL = process.env.MOONLAKE_QA_URL || null;
const OUTPUT_DIR = path.resolve("output/playwright");
const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};
let browser;
let staticServer;

async function startStaticServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
    const relativePath = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const stat = fs.statSync(filePath);
    const resolved = stat.isDirectory() ? path.join(filePath, "index.html") : filePath;
    if (!fs.existsSync(resolved)) {
      response.writeHead(404).end("Not found");
      return;
    }
    response.writeHead(200, {
      "Content-Type": CONTENT_TYPES[path.extname(resolved).toLowerCase()]
        || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(resolved).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server;
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  staticServer = EXTERNAL_BASE_URL ? null : await startStaticServer();
  const address = staticServer?.address();
  const baseUrl = EXTERNAL_BASE_URL
    || `http://127.0.0.1:${address.port}/`;
  browser = await chromium.launch({
    headless: true,
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--ignore-certificate-errors",
      "--use-angle=swiftshader"
    ]
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const pageErrors = [];
  const consoleErrors = [];
  const pendingRequests = new Set();
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("request", (request) => pendingRequests.add(request.url()));
  page.on("requestfinished", (request) => pendingRequests.delete(request.url()));
  page.on("requestfailed", (request) => pendingRequests.delete(request.url()));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.route("https://cdn.jsdelivr.net/**", async (route) => {
    const response = await fetch(route.request().url());
    const body = Buffer.from(await response.arrayBuffer());
    await route.fulfill({
      status: response.status,
      body,
      headers: {
        "access-control-allow-origin": "*",
        "content-type": response.headers.get("content-type") || "application/javascript"
      }
    });
  });
  await page.addInitScript(() => {
    const now = Date.now();
    localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
      activeHabitatId: "moonlake",
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: ["greyshade-cat"],
      mood: "calm",
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
        displayName: "Moonlake R3 QA",
        identitySkipped: false,
        createdAt: now,
        updatedAt: now
      }
    }));
  });

  await page.goto(`${baseUrl}?live3d=1&moonlakeBridgeQa=1&timePhase=day&weather=clear`, {
    waitUntil: "commit",
    timeout: 60_000
  });
  try {
    await page.waitForFunction(
      () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true,
      null,
      { timeout: 60_000 }
    );
  } catch (error) {
    console.error(JSON.stringify({
      page: await page.evaluate(() => ({
        readyState: document.readyState,
        pixiLoadFailed: Boolean(window.__NEXUS_PIXI_LOAD_FAILED__),
        hasPixi: Boolean(window.PIXI),
        hasHabitatApi: Boolean(window.__NEXUS_HABITAT),
        diagnostics: window.__NEXUS_HABITAT?.getLive3dDiagnostics?.() || null,
        statusText: document.querySelector("#status-text")?.textContent || null,
        pixiCanvasCount: document.querySelectorAll("#game-root canvas").length
      })),
      pendingRequests: [...pendingRequests],
      pageErrors,
      consoleErrors
    }));
    throw error;
  }
  await page.waitForTimeout(1_500);
  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await page.waitForTimeout(180);
  }

  const initial = await page.evaluate(() => {
    const bounds = window.__NEXUS_HABITAT.getCompanionVisualBounds();
    const affordanceBounds = document.querySelector(".touch-affordance")?.getBoundingClientRect?.();
    return {
      diagnostics: window.__NEXUS_HABITAT.getLive3dDiagnostics(),
      hotspots: window.__NEXUS_HABITAT.getInteractionHotspots(),
      companionBounds: bounds
        ? { width: bounds.width, height: bounds.height, x: bounds.x, y: bounds.y }
        : null,
      touchAffordance: affordanceBounds
        ? {
          visible: document.querySelector(".touch-affordance")?.classList.contains("is-visible"),
          x: affordanceBounds.x + affordanceBounds.width / 2,
          y: affordanceBounds.y + affordanceBounds.height / 2,
          size: affordanceBounds.width
        }
        : null
    };
  });
  assert.equal(initial.diagnostics.ready, true);
  assert.equal(initial.diagnostics.animation.waterfallBackdropStrength, 0.47);
  assert.equal(initial.hotspots.count, 9);
  assert.ok(initial.hotspots.targets.every((target) => target.visible));
  assert.ok(initial.companionBounds.height > 35 && initial.companionBounds.height < 125);
  assert.equal(initial.touchAffordance.visible, true);
  assert.ok(
    Math.abs(
      initial.touchAffordance.x
      - (initial.companionBounds.x + initial.companionBounds.width / 2)
    ) < 1
  );
  assert.ok(
    Math.abs(
      initial.touchAffordance.y
      - (initial.companionBounds.y + initial.companionBounds.height / 2)
    ) < 1
  );

  const liveCanvas = page.locator(".moonlake-live3d-canvas");
  const waterfallBefore = PNG.sync.read(await liveCanvas.screenshot());
  await page.waitForTimeout(650);
  const waterfallAfter = PNG.sync.read(await liveCanvas.screenshot());
  const waterfallMotion = measureWaterfallMotion(waterfallBefore, waterfallAfter);
  assert.ok(
    waterfallMotion.meanChannelDelta > 0.05,
    `waterfall shader must cause visible pixel motion, got ${waterfallMotion.meanChannelDelta}`
  );

  const targetById = Object.fromEntries(
    initial.hotspots.targets.map((target) => [target.id, target])
  );
  await page.touchscreen.tap(
    targetById["lantern-front-left"].x,
    targetById["lantern-front-left"].y
  );
  await page.touchscreen.tap(
    targetById["crystal-bridge-right"].x,
    targetById["crystal-bridge-right"].y
  );
  await page.touchscreen.tap(
    targetById["lake-center"].x,
    targetById["lake-center"].y
  );
  const interactions = await page.evaluate(() => ({
    diagnostics: window.__NEXUS_HABITAT.getLive3dDiagnostics(),
    statusText: document.querySelector("#status-text")?.textContent || ""
  }));
  assert.equal(interactions.diagnostics.interactions.last.type, "water");
  assert.ok(interactions.diagnostics.interactions.pulses.lantern > 0);
  assert.ok(interactions.diagnostics.interactions.pulses.crystal > 0);
  assert.ok(interactions.diagnostics.interactions.pulses.water > 0);
  assert.match(interactions.statusText, /漣漪/);

  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.playFishingForQa(
      "bridge_mid",
      "fishing_side",
      false
    )),
    true
  );
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getRoamingSnapshot?.()?.fishing?.phase === "wait",
    null,
    { timeout: 5_000 }
  );
  const fishing = await page.evaluate(() => ({
    roaming: window.__NEXUS_HABITAT.getRoamingSnapshot(),
    fx: window.__NEXUS_HABITAT.getFishingFxDiagnostics(),
    companionBounds: (() => {
      const bounds = window.__NEXUS_HABITAT.getCompanionVisualBounds();
      return bounds
        ? { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
        : null;
    })(),
    touchAffordance: (() => {
      const bounds = document.querySelector(".touch-affordance")?.getBoundingClientRect?.();
      return bounds
        ? {
          visible: document.querySelector(".touch-affordance")?.classList.contains("is-visible"),
          x: bounds.x + bounds.width / 2,
          y: bounds.y + bounds.height / 2,
          size: bounds.width
        }
        : null;
    })()
  }));
  assert.equal(fishing.roaming.fishing.animationName, "fishing_side");
  assert.equal(fishing.roaming.fishing.waterSide, "right");
  assert.equal(fishing.roaming.fishing.phase, "wait");
  assert.equal(fishing.fx.visible, true);
  assert.equal(fishing.fx.extendsBeyondRail, true);
  assert.ok(fishing.fx.lineLengthPx > 38);
  assert.ok(fishing.fx.end.x > fishing.fx.start.x);
  assert.equal(fishing.touchAffordance.visible, true);
  assert.ok(fishing.touchAffordance.size >= 68 && fishing.touchAffordance.size <= 128);
  assert.ok(
    Math.abs(
      fishing.touchAffordance.x
      - (fishing.companionBounds.x + fishing.companionBounds.width / 2)
    ) < 1,
    "touch affordance must track the companion horizontal center"
  );
  assert.ok(
    Math.abs(
      fishing.touchAffordance.y
      - (fishing.companionBounds.y + fishing.companionBounds.height / 2)
    ) < 1,
    "touch affordance must track the companion vertical center"
  );

  await page.screenshot({
    path: path.join(OUTPUT_DIR, "moonlake-r3-living-habitat-mobile.png"),
    fullPage: false
  });

  assert.equal(await page.evaluate(() => window.__NEXUS_HABITAT.clearForcedMotionForQa()), true);
  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.setRoamingSegmentForQa(
      "near_ground_left",
      "near_ground_center",
      0.25
    )),
    true
  );
  await page.waitForTimeout(500);
  const walking = await page.evaluate(() => ({
    roaming: window.__NEXUS_HABITAT.getRoamingSnapshot(),
    playback: window.__NEXUS_ACTIVE_COMPANION__?.__animationController?.getPlaybackState?.()
  }));
  assert.ok(walking.roaming.projectedSpeedPxPerSecond > 0);
  assert.ok(walking.playback.playbackRate >= 0.55 && walking.playback.playbackRate <= 3.2);
  assert.match(walking.playback.animationName, /_walk$/);

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  console.log(JSON.stringify({
    pass: true,
    screenshot: path.join(OUTPUT_DIR, "moonlake-r3-living-habitat-mobile.png"),
    companionBounds: initial.companionBounds,
    initialTouchAffordance: initial.touchAffordance,
    fishing: fishing.fx,
    touchAffordance: fishing.touchAffordance,
    walking,
    interactions: interactions.diagnostics.interactions,
    waterfallMotion,
    renderer: initial.diagnostics.renderer
  }, null, 2));
  await browser.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
})().catch(async (error) => {
  console.error(error);
  await browser?.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});

function measureWaterfallMotion(before, after) {
  assert.equal(before.width, after.width);
  assert.equal(before.height, after.height);
  const zones = [
    { x0: 0, x1: Math.floor(before.width * 0.31), y0: 70, y1: 310 },
    { x0: Math.floor(before.width * 0.69), x1: before.width, y0: 70, y1: 310 }
  ];
  let totalDelta = 0;
  let channelCount = 0;
  zones.forEach((zone) => {
    for (let y = zone.y0; y < Math.min(zone.y1, before.height); y += 1) {
      for (let x = zone.x0; x < zone.x1; x += 1) {
        const index = (y * before.width + x) * 4;
        for (let channel = 0; channel < 3; channel += 1) {
          totalDelta += Math.abs(before.data[index + channel] - after.data[index + channel]);
          channelCount += 1;
        }
      }
    }
  });
  return {
    meanChannelDelta: totalDelta / Math.max(1, channelCount),
    comparedChannels: channelCount
  };
}
