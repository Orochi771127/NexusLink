const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const EXTERNAL_BASE_URL = process.env.MOONLAKE_QA_URL || null;
const OUTPUT_DIR = path.resolve("output/playwright/moonlake-ro-depth-direction-r3-2");
const COMPANION_IDS = [
  "greyshade-cat",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit"
];
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
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.route("https://cdn.jsdelivr.net/**", async (route) => {
    const response = await fetch(route.request().url());
    await route.fulfill({
      status: response.status,
      body: Buffer.from(await response.arrayBuffer()),
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
        displayName: "Moonlake R3.2 QA",
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
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getDepthOcclusionDiagnostics?.()?.loadedCount === 7,
    null,
    { timeout: 60_000 }
  );
  await page.waitForTimeout(900);
  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await page.waitForTimeout(180);
  }

  const initial = await readDepthState(page);
  assert.equal(initial.depth.active, true);
  assert.equal(initial.depth.loadedCount, 7);
  assert.equal(initial.depth.configuredCount, 7);
  assert.equal(initial.oldOcclusion.dayVisible, false);
  assert.equal(initial.oldOcclusion.nightVisible, false);
  assert.equal(initial.layerOcclusionVisible, true);

  await page.evaluate(() => {
    window.__NEXUS_HABITAT.clearForcedMotionForQa();
    window.__NEXUS_HABITAT.setRoamingSegmentForQa(
      "near_ground_left",
      "near_ground_center",
      0.25
    );
  });
  await page.waitForFunction(
    () => {
      const roaming = window.__NEXUS_HABITAT?.getRoamingSnapshot?.();
      return roaming?.targetId === "near_ground_center"
        && window.__NEXUS_HABITAT
          ?.getNavigationSafetyDiagnostics?.()
          ?.footSafety
          ?.safe === true;
    },
    null,
    { timeout: 5_000 }
  );
  const leftLamp = await readDepthState(page);
  assert.ok(!leftLamp.depth.visibleIds.includes("lantern-front-left"));
  assert.equal(leftLamp.navigation.footSafety.safe, true);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "lamp-left-safe-route-390x844.png"),
    fullPage: false
  });

  await page.evaluate(() => {
    window.__NEXUS_HABITAT.setRoamingSegmentForQa(
      "near_ground_right",
      "near_ground_center",
      0.25
    );
  });
  await page.waitForFunction(
    () => {
      const roaming = window.__NEXUS_HABITAT?.getRoamingSnapshot?.();
      return roaming?.targetId === "near_ground_center"
        && window.__NEXUS_HABITAT
          ?.getNavigationSafetyDiagnostics?.()
          ?.footSafety
          ?.safe === true;
    },
    null,
    { timeout: 5_000 }
  );
  const rightLamp = await readDepthState(page);
  assert.ok(!rightLamp.depth.visibleIds.includes("lantern-front-right"));
  assert.equal(rightLamp.navigation.footSafety.safe, true);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "lamp-right-safe-route-390x844.png"),
    fullPage: false
  });

  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_left")),
    true
  );
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT
      ?.getDepthOcclusionDiagnostics?.()
      ?.visibleIds
      ?.includes("tent-left"),
    null,
    { timeout: 5_000 }
  );
  const leftTent = await readDepthState(page);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "tent-left-behind-390x844.png"),
    fullPage: false
  });

  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_right")),
    true
  );
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT
      ?.getDepthOcclusionDiagnostics?.()
      ?.visibleIds
      ?.includes("tent-right"),
    null,
    { timeout: 5_000 }
  );
  const rightTent = await readDepthState(page);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "tent-right-behind-390x844.png"),
    fullPage: false
  });

  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.setRoamingWaypointForQa("bridge_mid")),
    true
  );
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT
      ?.getDepthOcclusionDiagnostics?.()
      ?.visibleIds
      ?.includes("bridge-rails"),
    null,
    { timeout: 5_000 }
  );
  const bridge = await readDepthState(page);
  assert.equal(bridge.depth.area, "bridge");
  assert.ok(bridge.depth.visibleIds.includes("bridge-rails"));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "bridge-rail-occlusion-390x844.png"),
    fullPage: false
  });

  assert.equal(
    await page.evaluate(() => window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_center")),
    true
  );
  await page.waitForTimeout(220);
  const platform = await readDepthState(page);
  assert.ok(!platform.depth.visibleIds.includes("bridge-rails"));
  assert.equal(
    platform.depth.entries.find((entry) => entry.id === "bridge-rails")?.behind,
    false
  );

  const rightWalkRuntime = [];
  for (const companionId of COMPANION_IDS) {
    assert.equal(
      await page.evaluate(
        (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
        companionId
      ),
      true,
      `${companionId} can be mounted for direction QA`
    );
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT?.getFootPlacement?.()?.companionId === id,
      companionId,
      { timeout: 15_000 }
    );
    await page.evaluate(() => {
      window.__NEXUS_HABITAT.clearForcedMotionForQa();
      window.__NEXUS_HABITAT.setRoamingSegmentForQa(
        "platform_left",
        "platform_center",
        0.25
      );
    });
    await page.waitForFunction(
      () => window.__NEXUS_ACTIVE_COMPANION__?.__animationController
        ?.getPlaybackState?.()?.animationName === "right_walk",
      null,
      { timeout: 8_000 }
    );
    const playback = await page.evaluate(
      () => window.__NEXUS_ACTIVE_COMPANION__.__animationController.getPlaybackState()
    );
    assert.equal(playback.animationName, "right_walk");
    assert.equal(playback.mirrorX, false);
    assert.equal(playback.playing, true);
    rightWalkRuntime.push({
      companionId,
      animationName: playback.animationName,
      mirrorX: playback.mirrorX,
      playbackRate: playback.playbackRate
    });
  }

  await page.evaluate(async () => {
    window.__NEXUS_HABITAT.setTimePhase("night");
    await window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat");
    window.__NEXUS_HABITAT.clearForcedMotionForQa();
    window.__NEXUS_HABITAT.setRoamingSegmentForQa(
      "near_ground_left",
      "near_ground_center",
      0.25
    );
  });
  await page.waitForFunction(
    () => {
      const live3d = window.__NEXUS_HABITAT?.getLive3dDiagnostics?.();
      return live3d?.environment?.nightMix === 1
        && window.__NEXUS_HABITAT
          ?.getNavigationSafetyDiagnostics?.()
          ?.footSafety
          ?.safe === true;
    },
    null,
    { timeout: 15_000 }
  );
  const night = await readDepthState(page);
  assert.ok(!night.depth.visibleIds.includes("lantern-front-left"));
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "lamp-left-safe-route-night-390x844.png"),
    fullPage: false
  });

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  console.log(JSON.stringify({
    pass: true,
    viewport: "390x844",
    initial,
    leftLampSafeRoute: leftLamp,
    rightLampSafeRoute: rightLamp,
    leftTent: leftTent.depth,
    rightTent: rightTent.depth,
    bridge: bridge.depth,
    platform: platform.depth,
    rightWalkRuntime,
    night: night.depth,
    screenshots: [
      path.join(OUTPUT_DIR, "lamp-left-safe-route-390x844.png"),
      path.join(OUTPUT_DIR, "lamp-right-safe-route-390x844.png"),
      path.join(OUTPUT_DIR, "tent-left-behind-390x844.png"),
      path.join(OUTPUT_DIR, "tent-right-behind-390x844.png"),
      path.join(OUTPUT_DIR, "bridge-rail-occlusion-390x844.png"),
      path.join(OUTPUT_DIR, "lamp-left-safe-route-night-390x844.png")
    ]
  }, null, 2));
  await browser.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
})().catch(async (error) => {
  console.error(error);
  await browser?.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});

async function readDepthState(page) {
  return page.evaluate(() => {
    const depth = window.__NEXUS_HABITAT.getDepthOcclusionDiagnostics();
    const active = window.__NEXUS_ACTIVE_COMPANION__;
    const world = active?.parent?.parent?.parent;
    const occlusionLayer = world?.__sceneLayers?.layerOcclusion;
    const day = occlusionLayer?.children?.find?.((child) => child.name === "foreground_occlusion_day");
    const night = occlusionLayer?.children?.find?.((child) => child.name === "foreground_occlusion_night");
    return {
      depth,
      navigation: window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics(),
      oldOcclusion: {
        dayVisible: day?.visible ?? false,
        nightVisible: night?.visible ?? false
      },
      layerOcclusionVisible: occlusionLayer?.visible ?? true
    };
  });
}
