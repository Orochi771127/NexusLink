const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve(
  process.env.R4_0_OUTPUT_DIR
    || path.join(os.tmpdir(), "nexuslink-moonlake-visible-glb-r4-0")
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
const WAYPOINT_IDS = [
  "platform_center",
  "bridge_near",
  "bridge_mid",
  "bridge_far"
];
const VIEWPORT = { width: 390, height: 844 };
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

function readSnapshot() {
  const api = window.__NEXUS_HABITAT;
  return {
    diagnostics: api.getLive3dDiagnostics(),
    roaming: api.getRoamingSnapshot(),
    foot: api.getFootPlacement(),
    visual: api.getCompanionVisualBounds(),
    occlusion: api.getDepthOcclusionDiagnostics()
  };
}

function median(values) {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2
    ? ordered[middle]
    : (ordered[middle - 1] + ordered[middle]) / 2;
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
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
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
        greyshadeMetAt: now,
        veteranAutoCompleted: false,
        firstLoop: { skippedAt: now, completedAt: now }
      },
      playerProfile: {
        displayName: "R4 Visible GLB QA",
        identitySkipped: false,
        createdAt: now,
        updatedAt: now
      }
    }));
  }, COMPANION_IDS);

  const query = new URLSearchParams({
    live3d: "1",
    moonlakeVisibleGlb: "1",
    moonlakeBridgeQa: "1",
    timePhase: "day",
    weather: "clear"
  });
  await page.goto(`${baseUrl}?${query}`, {
    waitUntil: "commit",
    timeout: 45_000
  });
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true
      && window.__NEXUS_HABITAT?.getDepthOcclusionDiagnostics?.()?.loadedCount === 7,
    null,
    { timeout: 45_000 }
  );
  await page.waitForTimeout(160);

  const initial = await page.evaluate(readSnapshot);
  assert.equal(initial.diagnostics.renderMode, "visible_glb_candidate");
  assert.equal(initial.diagnostics.visibleGlbCandidate.enabled, true);
  assert.equal(initial.diagnostics.visibleGlbCandidate.shippingDefault, false);
  assert.equal(initial.diagnostics.visibleGlbCandidate.dynamicRigVisible, true);
  assert.equal(initial.diagnostics.visualMaster.visible, false);
  assert.equal(
    initial.diagnostics.visualMaster.role,
    "loading-reduced-capability-renderer-failure-fallback"
  );
  assert.equal(initial.diagnostics.visibleGlbCandidate.modelVisibleMeshCount, 7);
  assert.equal(initial.diagnostics.visibleGlbCandidate.modelHiddenMeshCount, 3);
  assert.ok(initial.diagnostics.renderer.triangles >= 60_000);

  const cases = [];
  const legacyCollisionMismatches = [];
  for (const companionId of COMPANION_IDS) {
    await page.evaluate(
      (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
      companionId
    );
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
      companionId,
      { timeout: 15_000 }
    );
    for (const waypointId of WAYPOINT_IDS) {
      await page.evaluate((id) => {
        window.__NEXUS_HABITAT.clearForcedMotionForQa();
        window.__NEXUS_HABITAT.setRoamingWaypointForQa(id);
      }, waypointId);
      await page.waitForFunction(
        (id) => {
          const roaming = window.__NEXUS_HABITAT.getRoamingSnapshot();
          return roaming?.currentId === id
            && roaming?.projected?.projectionMode === "three_camera";
        },
        waypointId,
        { timeout: 5_000 }
      );
      const snapshot = await page.evaluate(readSnapshot);
      assert.equal(snapshot.roaming.currentId, waypointId);
      assert.equal(snapshot.foot.companionId, companionId);
      assert.ok(
        snapshot.roaming.projected,
        `${companionId} ${waypointId} projection missing`
      );
      assert.equal(snapshot.roaming.projected.projectionMode, "three_camera");
      assert.equal(snapshot.roaming.projectionReady, true);
      assert.equal(typeof snapshot.roaming.footSafety.safe, "boolean");
      if (!snapshot.roaming.footSafety.safe) {
        legacyCollisionMismatches.push({
          companionId,
          waypointId,
          footSafety: snapshot.roaming.footSafety
        });
      }
      assert.ok(snapshot.roaming.projected.visible);
      assert.ok(
        Math.abs(snapshot.foot.globalX - snapshot.roaming.projected.x) <= 1.6,
        `${companionId} ${waypointId} foot x drift`
      );
      assert.ok(
        Math.abs(snapshot.foot.globalY - snapshot.roaming.projected.y) <= 4,
        `${companionId} ${waypointId} foot y drift`
      );
      cases.push({
        companionId,
        waypointId,
        projected: snapshot.roaming.projected,
        footSafety: snapshot.roaming.footSafety,
        visualWidth: snapshot.visual.width,
        visibleOccluders: snapshot.occlusion.visibleIds
      });
    }
    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${companionId}-bridge-mid.png`),
      fullPage: false
    });
  }

  await page.evaluate(() => {
    window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat");
    window.__NEXUS_HABITAT.clearForcedMotionForQa();
    window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_center");
  });
  await page.waitForTimeout(120);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, "day-clear-platform.png"),
    fullPage: false
  });

  const perf = await page.evaluate(() => new Promise((resolve) => {
    const deltas = [];
    const startedAt = performance.now();
    let previous = startedAt;
    function frame(now) {
      deltas.push(now - previous);
      previous = now;
      if (now - startedAt >= 30_000) {
        resolve({
          durationMs: now - startedAt,
          frameCount: deltas.length,
          frameDeltas: deltas.slice(1)
        });
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }));
  const medianFrameTimeMs = median(perf.frameDeltas);
  const performanceReady = medianFrameTimeMs <= 25;

  const contextLifecycle = await page.evaluate(async () => {
    const canvas = document.querySelector(".moonlake-live3d-canvas");
    const gl = canvas?.getContext("webgl2") || canvas?.getContext("webgl");
    const extension = gl?.getExtension("WEBGL_lose_context");
    if (!extension) return { supported: false };
    extension.loseContext();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const lost = window.__NEXUS_HABITAT.getLive3dDiagnostics().contextLost;
    extension.restoreContext();
    await new Promise((resolve) => setTimeout(resolve, 220));
    const restored = window.__NEXUS_HABITAT.getLive3dDiagnostics().ready;
    return { supported: true, lost, restored };
  });
  if (contextLifecycle.supported) {
    assert.equal(contextLifecycle.lost, true);
    assert.equal(contextLifecycle.restored, true);
  }

  const fallbackPage = await context.newPage();
  await fallbackPage.goto(`${baseUrl}?live3d=0`, {
    waitUntil: "domcontentloaded",
    timeout: 45_000
  });
  await fallbackPage.waitForTimeout(500);
  assert.equal(
    await fallbackPage.locator(".moonlake-live3d-canvas").count(),
    0
  );
  assert.equal(
    await fallbackPage.locator("#game-root").isVisible(),
    true
  );
  await fallbackPage.close();

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);

  const result = {
    pass: true,
    package: "TP-MOONLAKE-VISIBLE-GLB-FEASIBILITY-R4.0",
    viewport: VIEWPORT,
    companionCount: COMPANION_IDS.length,
    waypointCount: WAYPOINT_IDS.length,
    matrixCaseCount: cases.length,
    renderMode: initial.diagnostics.renderMode,
    visibleGlbMeshes: initial.diagnostics.visibleGlbCandidate.visibleMeshNames,
    hiddenGlbMeshes: initial.diagnostics.visibleGlbCandidate.hiddenMeshNames,
    renderer: initial.diagnostics.renderer,
    performance: {
      durationMs: perf.durationMs,
      frameCount: perf.frameCount,
      medianFrameTimeMs
    },
    contextLifecycle,
    staticFallback: true,
    promotionReady: legacyCollisionMismatches.length === 0 && performanceReady,
    performanceReady,
    legacyCollisionMismatchCount: legacyCollisionMismatches.length,
    legacyCollisionMismatches,
    screenshots: OUTPUT_DIR,
    pageErrors,
    consoleErrors,
    cases
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "results.json"),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({
    pass: result.pass,
    package: result.package,
    viewport: `${VIEWPORT.width}x${VIEWPORT.height}`,
    companionCount: result.companionCount,
    matrixCaseCount: result.matrixCaseCount,
    visibleGlbMeshCount: result.visibleGlbMeshes.length,
    medianFrameTimeMs: result.performance.medianFrameTimeMs,
    performanceReady: result.performanceReady,
    contextLifecycle: result.contextLifecycle,
    staticFallback: result.staticFallback,
    promotionReady: result.promotionReady,
    legacyCollisionMismatchCount: result.legacyCollisionMismatchCount,
    pageErrors: result.pageErrors,
    consoleErrors: result.consoleErrors,
    screenshots: result.screenshots
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await browser?.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
});
