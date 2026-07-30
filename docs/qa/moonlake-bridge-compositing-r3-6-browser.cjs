const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { PNG } = require("pngjs");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve(
  process.env.R3_6_OUTPUT_DIR
    || path.join(os.tmpdir(), "nexuslink-moonlake-bridge-compositing-r3-6")
);
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
const VIEWPORT = { width: 390, height: 844 };
const COMPANION_CAP_PX390 = 76;
const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function startStaticServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname
    );
    const relativePath = pathname === "/"
      ? "index.html"
      : pathname.replace(/^\/+/, "");
    const filePath = path.resolve(ROOT, relativePath);
    if (!filePath.startsWith(`${ROOT}${path.sep}`) || !fs.existsSync(filePath)) {
      response.writeHead(404).end("Not found");
      return;
    }
    const stat = fs.statSync(filePath);
    const resolved = stat.isDirectory()
      ? path.join(filePath, "index.html")
      : filePath;
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
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function readBridgeSnapshot() {
  const api = window.__NEXUS_HABITAT;
  const roaming = api.getRoamingSnapshot();
  const visual = api.getCompanionVisualBounds();
  const foot = api.getFootPlacement();
  const depth = api.getDepthOcclusionDiagnostics();
  const rail = depth.entries.find((entry) => entry.id === "bridge-rails");
  return {
    companionId: foot.companionId,
    animationName: api.getActiveCompanionNode()
      ?.__animationController
      ?.getCurrentAnimationName?.() || null,
    roaming,
    visual,
    foot,
    depth: {
      companionBounds: depth.companionBounds,
      visibleIds: depth.visibleIds,
      rail
    }
  };
}

function assertBridgeSnapshot(snapshot, {
  companionId,
  animationName,
  phase
}) {
  assert.equal(snapshot.companionId, companionId);
  assert.equal(snapshot.animationName, animationName);
  assert.equal(snapshot.roaming.area, "bridge");
  assert.equal(snapshot.roaming.projected.surface, "bridge");
  assert.equal(snapshot.roaming.projected.routeId, "bridge-clearance-r2-1");
  assert.equal(snapshot.depth.companionBounds?.source, "opaque-frame");
  assert.ok(snapshot.visual.width > 0);
  assert.ok(
    snapshot.visual.width <= COMPANION_CAP_PX390,
    `${companionId} ${phase} ${animationName} width ${snapshot.visual.width}`
  );
  assert.ok(
    Math.abs(snapshot.foot.globalX - snapshot.roaming.projected.x) <= 1.6,
    `${companionId} ${phase} ${animationName} foot x drift`
  );
  assert.ok(
    Math.abs(snapshot.foot.globalY - snapshot.roaming.projected.y) <= 4,
    `${companionId} ${phase} ${animationName} foot y drift`
  );
  assert.ok(snapshot.depth.visibleIds.includes("bridge-rails"));
  assert.equal(snapshot.depth.rail.visible, true);
  assert.equal(snapshot.depth.rail.behind, true);
  assert.ok(snapshot.depth.rail.intersectionArea > 0);
  assert.ok(snapshot.depth.rail.overlapRatio > 0);
}

function averagePatch(png, { left, top, right, bottom }) {
  const totals = [0, 0, 0];
  let count = 0;
  let woodLike = 0;
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = (y * png.width + x) * 4;
      const red = png.data[offset];
      const green = png.data[offset + 1];
      const blue = png.data[offset + 2];
      totals[0] += red;
      totals[1] += green;
      totals[2] += blue;
      count += 1;
      if (red > green * 1.1 && green > blue * 1.1) woodLike += 1;
    }
  }
  return {
    red: totals[0] / count,
    green: totals[1] / count,
    blue: totals[2] / count,
    blueMinusRed: (totals[2] - totals[0]) / count,
    woodLikeRatio: woodLike / count
  };
}

let browser;
let staticServer;

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  staticServer = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${staticServer.address().port}/`;
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
    viewport: VIEWPORT,
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
        "content-type": response.headers.get("content-type")
          || "application/javascript"
      }
    });
  });
  await page.addInitScript((companionIds) => {
    const now = Date.now();
    localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
      activeHabitatId: "moonlake",
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: companionIds,
      mood: "calm",
      firstTouchCompleted: true,
      onboarding: {
        version: 1,
        status: "completed",
        completed: true,
        completedAt: now,
        startedAt: now - 1000,
        identityCompleted: true,
        guidanceCompleted: true,
        firstTouchCompleted: true,
        firstSoulTalkCompleted: true,
        greyshadeMetAt: now,
        veteranAutoCompleted: false,
        firstLoop: { skippedAt: null, completedAt: now }
      },
      playerProfile: {
        displayName: "Moonlake R3.6 QA",
        identitySkipped: false,
        createdAt: now,
        updatedAt: now
      }
    }));
  }, COMPANION_IDS);

  await page.goto(
    `${baseUrl}?live3d=1&moonlakeBridgeQa=1&timePhase=day&weather=clear`,
    { waitUntil: "commit", timeout: 60_000 }
  );
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true
      && window.__NEXUS_HABITAT?.getDepthOcclusionDiagnostics?.()?.loadedCount === 7,
    null,
    { timeout: 60_000 }
  );
  await page.waitForTimeout(900);
  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await page.waitForTimeout(150);
  }

  const results = [];
  for (const companionId of COMPANION_IDS) {
    assert.equal(
      await page.evaluate(
        (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
        companionId
      ),
      true,
      `${companionId} swap failed`
    );
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
      companionId,
      { timeout: 15_000 }
    );

    await page.evaluate(() => {
      window.__NEXUS_HABITAT.setTimePhase("day");
      window.__NEXUS_HABITAT.clearForcedMotionForQa();
      window.__NEXUS_HABITAT.setRoamingSegmentForQa(
        "bridge_mid",
        "bridge_near",
        0.9
      );
    });
    await page.waitForFunction(
      () => {
        const api = window.__NEXUS_HABITAT;
        return api.getRoamingSnapshot()?.animationName === "front_walk"
          && api.getDepthOcclusionDiagnostics()
            ?.visibleIds
            ?.includes("bridge-rails")
          && api.getActiveCompanionNode()
            ?.__animationController
            ?.getCurrentAnimationName?.() === "front_walk";
      },
      null,
      { timeout: 15_000 }
    );
    await page.waitForTimeout(140);
    const dayFront = await page.evaluate(readBridgeSnapshot);
    assertBridgeSnapshot(dayFront, {
      companionId,
      animationName: "front_walk",
      phase: "day"
    });
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${companionId}-day-front-bridge.png`),
      fullPage: false
    });

    await page.evaluate(() => {
      window.__NEXUS_HABITAT.setTimePhase("night");
      window.__NEXUS_HABITAT.clearForcedMotionForQa();
      window.__NEXUS_HABITAT.setRoamingSegmentForQa(
        "bridge_near",
        "bridge_mid",
        0.1
      );
    });
    await page.waitForFunction(
      () => {
        const api = window.__NEXUS_HABITAT;
        return api.getRoamingSnapshot()?.animationName === "back_walk"
          && api.getDepthOcclusionDiagnostics()
            ?.visibleIds
            ?.includes("bridge-rails")
          && api.getActiveCompanionNode()
            ?.__animationController
            ?.getCurrentAnimationName?.() === "back_walk";
      },
      null,
      { timeout: 15_000 }
    );
    await page.waitForTimeout(140);
    const nightBack = await page.evaluate(readBridgeSnapshot);
    assertBridgeSnapshot(nightBack, {
      companionId,
      animationName: "back_walk",
      phase: "night"
    });

    results.push({
      companionId,
      dayFrontWidth: dayFront.visual.width,
      nightBackWidth: nightBack.visual.width,
      dayRailOverlapRatio: dayFront.depth.rail.overlapRatio,
      nightRailOverlapRatio: nightBack.depth.rail.overlapRatio
    });
  }

  await page.evaluate(async () => {
    await window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat");
    window.__NEXUS_HABITAT.setTimePhase("day");
    window.__NEXUS_HABITAT.clearForcedMotionForQa();
    window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_center");
  });
  await page.waitForTimeout(220);
  const platformDepth = await page.evaluate(
    () => window.__NEXUS_HABITAT.getDepthOcclusionDiagnostics()
  );
  assert.ok(!platformDepth.visibleIds.includes("bridge-rails"));

  const cleanBridgePng = PNG.sync.read(await page.screenshot({ fullPage: false }));
  const retiredLeftExtension = averagePatch(cleanBridgePng, {
    left: 220,
    top: 322,
    right: 235,
    bottom: 362
  });
  const retiredRightExtension = averagePatch(cleanBridgePng, {
    left: 296,
    top: 322,
    right: 311,
    bottom: 362
  });
  for (const [side, sample] of Object.entries({
    left: retiredLeftExtension,
    right: retiredRightExtension
  })) {
    assert.ok(
      sample.blueMinusRed > 30,
      `${side} former bridge block must reveal the authored blue lake`
    );
    assert.ok(
      sample.woodLikeRatio < 0.1,
      `${side} former bridge block must not remain a flat wood-colour band`
    );
  }

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  const report = {
    pass: true,
    package: "TP-MOONLAKE-BRIDGE-COMPOSITING-R3.6",
    viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
    companionCount: COMPANION_IDS.length,
    matrixCaseCount: results.length * 2,
    authoredBridgeSilhouette: true,
    bridgeRailOcclusion: true,
    retiredExtensionSamples: {
      left: retiredLeftExtension,
      right: retiredRightExtension
    },
    maxBridgeWidth: Math.max(
      ...results.flatMap((entry) => [
        entry.dayFrontWidth,
        entry.nightBackWidth
      ])
    ),
    screenshots: OUTPUT_DIR,
    pageErrors,
    consoleErrors,
    results
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "results.json"),
    `${JSON.stringify(report, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({
    ...report,
    results: results.map(({ companionId, dayFrontWidth, nightBackWidth }) => ({
      companionId,
      dayFrontWidth,
      nightBackWidth
    }))
  }, null, 2));

  await browser.close();
  await new Promise((resolve) => staticServer.close(resolve));
})().catch(async (error) => {
  console.error(error);
  await browser?.close().catch(() => {});
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});
