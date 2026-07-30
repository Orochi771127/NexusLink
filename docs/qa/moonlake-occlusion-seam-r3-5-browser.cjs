const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve("output/playwright/moonlake-occlusion-seam-r3-5");
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
const companionOffset = Math.max(
  0,
  Number.parseInt(process.env.R3_5_COMPANION_OFFSET || "0", 10) || 0
);
const companionCount = Math.max(
  1,
  Number.parseInt(
    process.env.R3_5_COMPANION_COUNT || String(COMPANION_IDS.length),
    10
  ) || COMPANION_IDS.length
);
const SELECTED_COMPANION_IDS = COMPANION_IDS.slice(
  companionOffset,
  companionOffset + companionCount
);
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 430, height: 932 }
];
const PHASES = ["day", "dusk", "night"];
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

function startStaticServer() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://127.0.0.1").pathname
    );
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
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
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

  const results = [];
  const pageErrors = [];
  const consoleErrors = [];
  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage({
      viewport,
      deviceScaleFactor: 1,
      isMobile: true,
      hasTouch: true,
      ignoreHTTPSErrors: true
    });
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
          firstTouchCompleted: true,
          firstSoulTalkCompleted: true,
          greyshadeMetAt: now,
          veteranAutoCompleted: false,
          firstLoop: { skippedAt: null, completedAt: now }
        },
        playerProfile: {
          displayName: "Moonlake R3.5 QA",
          identitySkipped: false,
          createdAt: now,
          updatedAt: now
        }
      }));
    });
    await page.goto(
      `${baseUrl}?live3d=1&moonlakeBridgeQa=1&timePhase=day&weather=clear`,
      { waitUntil: "commit", timeout: 60_000 }
    );
    await page.waitForFunction(
      () => window.__NEXUS_HABITAT?.getDepthOcclusionDiagnostics?.()?.loadedCount === 7,
      null,
      { timeout: 60_000 }
    );
    await page.waitForTimeout(800);
    const dismiss = page.locator(".resonance-thread .rt-dismiss");
    if (await dismiss.isVisible().catch(() => false)) {
      await dismiss.click();
      await page.waitForTimeout(180);
    }
    await page.evaluate(
      () => window.__NEXUS_HABITAT.triggerHabitatInteractionForQa("lake-center")
    );

    for (const companionId of SELECTED_COMPANION_IDS) {
      assert.equal(
        await page.evaluate(
          (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
          companionId
        ),
        true,
        `${companionId} mounts for R3.5 occlusion QA`
      );
      await page.waitForFunction(
        (id) => window.__NEXUS_HABITAT?.getFootPlacement?.()?.companionId === id,
        companionId,
        { timeout: 15_000 }
      );

      for (const phase of PHASES) {
        await page.evaluate((nextPhase) => {
          window.__NEXUS_HABITAT.setTimePhase(nextPhase);
          window.__NEXUS_HABITAT.clearForcedMotionForQa();
          window.__NEXUS_HABITAT.setRoamingWaypointForQa("near_ground_center");
        }, phase);
        await page.waitForTimeout(180);
        const center = await readDepth(page);
        assert.equal(center.companionBounds?.source, "opaque-frame");
        for (const lampId of ["lantern-front-left", "lantern-front-right"]) {
          const lamp = center.entries.find((entry) => entry.id === lampId);
          assert.ok(lamp);
          assert.equal(
            lamp.visible,
            lamp.intersectionArea > 0 && lamp.behind,
            `${companionId} ${phase} ${lampId} visibility follows real opaque overlap`
          );
          if (lamp.visible) {
            assert.ok(lamp.overlapRatio > 0);
          }
        }
        assert.ok(
          center.entries.every((entry) => entry.colorMode === "matrix-filter"),
          "all occluder plates use the shader-matched color matrix"
        );

        for (const route of [
          ["near_ground_left", "near_ground_center", "lantern-front-left"],
          ["near_ground_right", "near_ground_center", "lantern-front-right"]
        ]) {
          await page.evaluate(([from, to]) => {
            window.__NEXUS_HABITAT.setRoamingSegmentForQa(from, to, 0.25);
          }, route);
          await page.waitForTimeout(90);
          const safeRoute = await readDepth(page);
          const routeLamp = safeRoute.entries.find((entry) => entry.id === route[2]);
          assert.equal(
            routeLamp.visible,
            routeLamp.intersectionArea > 0 && routeLamp.behind,
            `${companionId} ${phase} ${route[2]} follows opaque-frame overlap`
          );
        }
        results.push({
          viewport: `${viewport.width}x${viewport.height}`,
          companionId,
          phase
        });
      }
    }

    await page.evaluate(async () => {
      await window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat");
      window.__NEXUS_HABITAT.setTimePhase("night");
      window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_left");
    });
    await page.waitForTimeout(220);
    const leftTent = (await readDepth(page)).entries.find(
      (entry) => entry.id === "tent-left"
    );
    assert.equal(
      leftTent.visible,
      leftTent.intersectionArea > 0 && leftTent.behind,
      "left tent follows real opaque overlap"
    );
    await page.evaluate(() => {
      window.__NEXUS_HABITAT.setRoamingWaypointForQa("platform_right");
    });
    await page.waitForTimeout(220);
    const rightTent = (await readDepth(page)).entries.find(
      (entry) => entry.id === "tent-right"
    );
    assert.equal(
      rightTent.visible,
      rightTent.intersectionArea > 0 && rightTent.behind,
      "right tent follows real opaque overlap"
    );
    assert.equal(
      await page.evaluate(
        () => window.__NEXUS_HABITAT.setRoamingWaypointForQa("bridge_mid")
      ),
      true
    );
    await page.waitForFunction(
      () => window.__NEXUS_HABITAT
        ?.getDepthOcclusionDiagnostics?.()
        ?.visibleIds
        ?.includes("bridge-rails"),
      null,
      { timeout: 8_000 }
    );
    await page.evaluate(() => {
      window.__NEXUS_HABITAT.setRoamingWaypointForQa("near_ground_center");
    });
    await page.waitForTimeout(180);
    await page.screenshot({
      path: path.join(
        OUTPUT_DIR,
        `night-center-no-ghost-${viewport.width}x${viewport.height}.png`
      ),
      fullPage: false
    });
    await page.close();
  }

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  console.log(JSON.stringify({
    pass: true,
    package: "TP-MOONLAKE-OCCLUSION-SEAM-R3.5",
    cases: results.length,
    companions: SELECTED_COMPANION_IDS.length,
    companionOffset,
    phases: PHASES,
    viewports: VIEWPORTS.map(({ width, height }) => `${width}x${height}`),
    lampSafeRoutes: results.length * 2,
    tentOcclusion: true,
    bridgeOcclusion: true,
    pageErrors,
    consoleErrors
  }, null, 2));

  await browser.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});

async function readDepth(page) {
  return page.evaluate(
    () => window.__NEXUS_HABITAT.getDepthOcclusionDiagnostics()
  );
}
