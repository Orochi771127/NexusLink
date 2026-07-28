const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const EXTERNAL_BASE_URL = process.env.MOONLAKE_QA_URL || null;
const OUTPUT_DIR = path.resolve("output/playwright/moonlake-bridge-clearance-r2-1");
const COMPANION_IDS = [
  "greyshade-cat",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit",
  "sprigfawn",
  "starstripe-cub",
  "auriowl",
  "blazetail-kit",
  "crystalfin-seahorse",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
];

let browser;
let staticServer;

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

function snapshotPage() {
  const api = window.__NEXUS_HABITAT;
  const companion = api.getActiveCompanionNode();
  const bounds = companion?.getBounds?.();
  const roaming = api.getRoamingSnapshot();
  const foot = api.getFootPlacement();
  return {
    companionId: foot.companionId,
    animationName: companion?.__animationController?.getCurrentAnimationName?.() || null,
    bounds: bounds
      ? {
          x: Number(bounds.x),
          y: Number(bounds.y),
          width: Number(bounds.width),
          height: Number(bounds.height)
        }
      : null,
    foot: {
      globalX: Number(foot.globalX),
      globalY: Number(foot.globalY),
      targetX: Number(foot.targetX),
      targetY: Number(foot.targetY),
      shadowGap: Number(foot.shadowGap)
    },
    roaming: {
      currentId: roaming.currentId,
      targetId: roaming.targetId,
      animationName: roaming.animationName || null,
      area: roaming.area,
      reason: roaming.reason,
      moving: roaming.moving,
      projected: roaming.projected
        ? {
            x: Number(roaming.projected.x),
            y: Number(roaming.projected.y),
            scale: Number(roaming.projected.scale),
            surface: roaming.projected.surface,
            routeId: roaming.projected.routeId
          }
        : null
    }
  };
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  staticServer = EXTERNAL_BASE_URL ? null : await startStaticServer();
  const address = staticServer?.address();
  const baseUrl = EXTERNAL_BASE_URL
    || `http://127.0.0.1:${address.port}/`;
  browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"]
  });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true
  });
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.addInitScript((companionIds) => {
    const now = Date.now();
    localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
      activeHabitatId: "moonlake",
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: companionIds,
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
        displayName: "Bridge QA",
        identitySkipped: false,
        createdAt: now,
        updatedAt: now
      }
    }));
  }, COMPANION_IDS);

  const query = new URLSearchParams({
    live3d: "1",
    timePhase: "day",
    weather: "clear",
    devPanel: "1",
    moonlakeBridgeQa: "1"
  });
  await page.goto(`${baseUrl}?${query}`, { waitUntil: "commit", timeout: 45_000 });
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true
      && typeof window.__NEXUS_HABITAT?.setRoamingSegmentForQa === "function",
    null,
    { timeout: 45_000 }
  );
  await page.waitForTimeout(900);

  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
    await page.waitForTimeout(150);
  }
  const collapseDevPanel = page.locator("[data-dev-collapse]");
  if (await collapseDevPanel.isVisible().catch(() => false)) {
    await collapseDevPanel.click();
    await page.waitForTimeout(100);
  }
  await page.addStyleTag({
    content: ".dev-reaction-lab { display: none !important; }"
  });

  const cases = [];
  for (const companionId of COMPANION_IDS) {
    const swapped = await page.evaluate(
      (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
      companionId
    );
    assert.equal(swapped, true, `${companionId} swap failed`);
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
      companionId,
      { timeout: 12_000 }
    );

    await page.evaluate(() => {
      window.__NEXUS_HABITAT.clearForcedMotionForQa();
      window.__NEXUS_HABITAT.setRoamingSegmentForQa(
        "bridge_near",
        "bridge_mid",
        0.9
      );
    });
    await page.waitForFunction(() => {
      const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
      return roaming?.animationName === "back_walk"
        && roaming?.projected?.surface === "bridge";
    }, null, { timeout: 12_000 });
    await page.waitForFunction(() => {
      const node = window.__NEXUS_HABITAT.getActiveCompanionNode();
      return node?.__animationController?.getCurrentAnimationName?.() === "back_walk";
    }, null, { timeout: 12_000 });
    await page.waitForTimeout(120);
    const bridge = await page.evaluate(snapshotPage);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${companionId}-bridge-back-walk.png`),
      fullPage: false
    });

    assert.equal(bridge.companionId, companionId);
    assert.equal(bridge.animationName, "back_walk");
    assert.equal(bridge.roaming.projected.surface, "bridge");
    assert.equal(bridge.roaming.projected.routeId, "bridge-clearance-r2-1");
    assert.ok(bridge.bounds.width <= 76, `${companionId} bridge bounds too wide`);
    assert.ok(
      Math.abs(
        bridge.bounds.x + bridge.bounds.width / 2 - bridge.roaming.projected.x
      ) <= 1.5,
      `${companionId} bridge silhouette left the centerline`
    );
    assert.ok(
      Math.abs(
        bridge.bounds.y + bridge.bounds.height - bridge.roaming.projected.y
      ) <= 1.5,
      `${companionId} bridge silhouette left the deck datum`
    );

    await page.evaluate(() => {
      window.__NEXUS_HABITAT.clearForcedMotionForQa();
      window.__NEXUS_HABITAT.setRoamingWaypointForQa("bridge_far");
    });
    await page.waitForFunction(() => {
      const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
      return roaming?.isFishingSpot === true
        && roaming?.projected?.surface === "bridge";
    }, null, { timeout: 12_000 });
    await page.evaluate(() => {
      window.__NEXUS_PLAY_ANIMATION_INTENT__("habitat.fishing.back");
    });
    await page.waitForFunction(() => {
      const node = window.__NEXUS_HABITAT.getActiveCompanionNode();
      return node?.__animationController?.getCurrentAnimationName?.() === "fishing_back";
    }, null, { timeout: 12_000 });
    await page.waitForTimeout(120);
    const fishing = await page.evaluate(snapshotPage);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${companionId}-fishing-back.png`),
      fullPage: false
    });

    assert.equal(fishing.companionId, companionId);
    assert.equal(fishing.animationName, "fishing_back");
    assert.equal(fishing.roaming.projected.surface, "bridge");
    assert.equal(fishing.roaming.projected.routeId, "bridge-clearance-r2-1");
    assert.ok(fishing.bounds.width <= 76, `${companionId} fishing bounds too wide`);
    assert.ok(
      Math.abs(
        fishing.bounds.x + fishing.bounds.width / 2 - fishing.roaming.projected.x
      ) <= 1.5,
      `${companionId} fishing silhouette left the bridge centerline`
    );
    assert.ok(
      Math.abs(
        fishing.bounds.y + fishing.bounds.height - fishing.roaming.projected.y
      ) <= 4,
      `${companionId} fishing silhouette left the bridge datum`
    );

    cases.push({ companionId, bridge, fishing });
  }

  await page.evaluate(() => window.__NEXUS_HABITAT.clearForcedMotionForQa());
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  const result = {
    pass: true,
    viewport: { width: 390, height: 844 },
    companionCount: COMPANION_IDS.length,
    caseCount: cases.length * 2,
    screenshots: OUTPUT_DIR,
    maxBridgeBoundsWidth: Math.max(...cases.map((entry) => entry.bridge.bounds.width)),
    maxFishingBoundsWidth: Math.max(...cases.map((entry) => entry.fishing.bounds.width)),
    cases
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "results.json"),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({
    ...result,
    cases: cases.map(({ companionId, bridge, fishing }) => ({
      companionId,
      bridgeWidth: bridge.bounds.width,
      fishingWidth: fishing.bounds.width
    }))
  }, null, 2));
  await browser.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
})().catch(async (error) => {
  console.error(error);
  await browser?.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});
