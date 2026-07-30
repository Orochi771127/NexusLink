const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve("output/playwright/moonlake-nav-collision-scale-r3-3");
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
const WAYPOINT_IDS = [
  "platform_center",
  "platform_left",
  "platform_right",
  "near_ground_center",
  "near_ground_left",
  "near_ground_right",
  "bridge_near",
  "bridge_mid",
  "bridge_far"
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

function startStaticServer() {
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

function readSnapshot() {
  const api = window.__NEXUS_HABITAT;
  const roaming = api.getRoamingSnapshot();
  const visual = api.getCompanionVisualBounds();
  const foot = api.getFootPlacement();
  const navigation = api.getNavigationSafetyDiagnostics();
  const affordance = api.getTouchAffordanceDiagnostics();
  return {
    companionId: foot.companionId,
    roaming,
    visual,
    foot,
    navigation,
    affordance
  };
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  staticServer = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${staticServer.address().port}/`;
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
  await page.addInitScript((companionIds) => {
    const now = Date.now();
    localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
      activeHabitatId: "moonlake",
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: companionIds,
      mood: "calm",
      firstTouchCompleted: false,
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
        displayName: "Moonlake R3.3 QA",
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
      && typeof window.__NEXUS_HABITAT?.getNavigationSafetyDiagnostics === "function"
      && typeof window.__NEXUS_HABITAT?.getTouchAffordanceDiagnostics === "function",
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

    for (const phase of ["day", "night"]) {
      await page.evaluate(
        (nextPhase) => window.__NEXUS_HABITAT.setTimePhase(nextPhase),
        phase
      );
      for (const waypointId of WAYPOINT_IDS) {
        assert.equal(
          await page.evaluate(
            (id) => window.__NEXUS_HABITAT.setRoamingWaypointForQa(id),
            waypointId
          ),
          true,
          `${companionId} ${waypointId} snap failed`
        );
        await page.waitForFunction(
          (id) => {
            const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
            const navigation = window.__NEXUS_HABITAT.getNavigationSafetyDiagnostics();
            return roaming?.currentId === id
              && Number.isFinite(roaming?.projected?.x)
              && navigation?.footSafety?.reason !== "projection_unavailable";
          },
          waypointId,
          { timeout: 5_000 }
        );
        await page.waitForFunction(() => {
          const bounds = window.__NEXUS_HABITAT.getCompanionVisualBounds();
          const cue = window.__NEXUS_HABITAT.getTouchAffordanceDiagnostics();
          if (!bounds || !cue?.visible) return false;
          return Math.abs(cue.x - (bounds.x + bounds.width / 2)) <= 2
            && Math.abs(cue.y - (bounds.y + bounds.height / 2)) <= 2;
        }, null, { timeout: 2_000 });
        const snapshot = await page.evaluate(readSnapshot);
        assert.equal(snapshot.companionId, companionId);
        assert.equal(
          snapshot.navigation.footSafety.safe,
          true,
          `${companionId} ${phase} ${waypointId}: ${JSON.stringify(snapshot.navigation.footSafety)}`
        );
        assert.deepEqual(snapshot.navigation.footSafety.violations, []);
        assert.ok(snapshot.visual.width > 0 && snapshot.visual.height > 0);
        assert.ok(snapshot.visual.width <= 110, `${companionId} ${waypointId} too wide`);
        assert.ok(
          Math.abs(snapshot.foot.globalX - snapshot.roaming.projected.x) <= 1.6,
          `${companionId} ${waypointId} foot x drift: ${snapshot.foot.globalX} vs ${snapshot.roaming.projected.x}`
        );
        assert.ok(
          Math.abs(snapshot.foot.globalY - snapshot.roaming.projected.y) <= 4,
          `${companionId} ${waypointId} foot y drift: ${snapshot.foot.globalY} vs ${snapshot.roaming.projected.y}`
        );
        const visualCenterX = snapshot.visual.x + snapshot.visual.width / 2;
        const visualCenterY = snapshot.visual.y + snapshot.visual.height / 2;
        assert.ok(Math.abs(snapshot.navigation.touchTarget.x - visualCenterX) <= 1);
        assert.ok(Math.abs(snapshot.navigation.touchTarget.y - visualCenterY) <= 1);
        assert.equal(snapshot.affordance.visible, true);
        assert.ok(Math.abs(snapshot.affordance.x - visualCenterX) <= 2);
        assert.ok(Math.abs(snapshot.affordance.y - visualCenterY) <= 2);
        results.push({
          companionId,
          phase,
          waypointId,
          area: snapshot.roaming.area,
          width: snapshot.visual.width,
          height: snapshot.visual.height,
          clearanceRadiusPx390: snapshot.navigation.footSafety.clearanceRadiusPx390
        });
      }
    }
  }

  await page.evaluate(async () => {
    await window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat");
    window.__NEXUS_HABITAT.playFishingForQa(
      "bridge_far",
      "fishing_back",
      false
    );
  });
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT.getRoamingSnapshot()?.fishing?.phase === "wait",
    null,
    { timeout: 15_000 }
  );
  const fishing = await page.evaluate(readSnapshot);
  assert.equal(fishing.navigation.footSafety.safe, true);
  assert.ok(fishing.visual.width >= 72, "far-bridge fishing must remain readable");
  assert.ok(fishing.visual.width <= 76, "far-bridge fishing must remain within the authored bridge presentation cap");
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "greyshade-cat-fishing-wait-390x844.png"),
    fullPage: false
  });

  await page.evaluate(() => {
    window.__NEXUS_HABITAT.setTimePhase("day");
    window.__NEXUS_HABITAT.clearForcedMotionForQa();
    window.__NEXUS_HABITAT.setRoamingWaypointForQa("near_ground_left");
  });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "greyshade-cat-safe-ground-and-touch-cue-390x844.png"),
    fullPage: false
  });

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  const report = {
    pass: true,
    viewport: "390x844",
    companionCount: COMPANION_IDS.length,
    phaseCount: 2,
    waypointCount: WAYPOINT_IDS.length,
    matrixCaseCount: results.length,
    fishingWidth: fishing.visual.width,
    minVisualWidth: Math.min(...results.map((entry) => entry.width)),
    maxVisualWidth: Math.max(...results.map((entry) => entry.width)),
    screenshots: OUTPUT_DIR
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "results.json"),
    `${JSON.stringify({ ...report, results }, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  await new Promise((resolve) => staticServer.close(resolve));
})().catch(async (error) => {
  console.error(error);
  await browser?.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});
