const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const EXTERNAL_BASE_URL = process.env.MOONLAKE_QA_URL || null;
const OUTPUT_DIR = path.resolve("output/playwright/moonlake-fishing-orientation-r2-2");
const BRIDGE_MID_RAIL_HALF_WIDTH_PX390 = 26;
const MINIMUM_STABLE_LINE_OVERHANG_PX390 = 4;
const COMPANION_IDS = [
  "greyshade-cat",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm"
];
const ORIENTATION_CASES = [
  {
    id: "front-right",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: false,
    waterSide: "right",
    railOffsetX390: 0
  },
  {
    id: "front-left",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: true,
    waterSide: "left",
    railOffsetX390: 0
  },
  {
    id: "side-right",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: false,
    waterSide: "right",
    railOffsetX390: 8
  },
  {
    id: "side-left",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: true,
    waterSide: "left",
    railOffsetX390: -8
  },
  {
    id: "back-far",
    waypointId: "bridge_far",
    animationName: "fishing_back",
    mirrorX: false,
    waterSide: "far",
    railOffsetX390: 0
  }
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

function snapshotPage() {
  const api = window.__NEXUS_HABITAT;
  const companion = api.getActiveCompanionNode();
  const animatedSprite = companion?.__animationController?.getAnimatedSprite?.();
  const bounds = companion?.getBounds?.();
  const roaming = api.getRoamingSnapshot();
  const foot = api.getFootPlacement();
  return {
    companionId: foot.companionId,
    animationName: companion?.__animationController?.getCurrentAnimationName?.() || null,
    animatedFrameScaleX: Number(animatedSprite?.scale?.x),
    companionX: Number(companion?.x),
    companionY: Number(companion?.y),
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
      shadowGap: Number(foot.shadowGap)
    },
    roaming: {
      currentId: roaming.currentId,
      area: roaming.area,
      isFishingSpot: roaming.isFishingSpot,
      fishing: roaming.fishing,
      projected: roaming.projected
        ? {
            x: Number(roaming.projected.x),
            y: Number(roaming.projected.y),
            scale: Number(roaming.projected.scale),
            referenceScale390: Number(roaming.projected.referenceScale390),
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
        displayName: "Fishing Orientation QA",
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
      && typeof window.__NEXUS_HABITAT?.playFishingForQa === "function",
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
    assert.equal(swapped, true, `${companionId}: swap failed`);
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
      companionId,
      { timeout: 12_000 }
    );

    for (const orientation of ORIENTATION_CASES) {
      const staged = await page.evaluate((entry) => {
        window.__NEXUS_HABITAT.clearForcedMotionForQa();
        return window.__NEXUS_HABITAT.playFishingForQa(
          entry.waypointId,
          entry.animationName,
          entry.mirrorX
        );
      }, orientation);
      assert.equal(staged, true, `${companionId}/${orientation.id}: staging failed`);
      await page.waitForFunction(
        ({
          animationName,
          mirrorX,
          waterSide,
          waypointId,
          railOffsetX390
        }) => {
          const api = window.__NEXUS_HABITAT;
          const node = api.getActiveCompanionNode();
          const roaming = api.getRoamingSnapshot();
          return node?.__animationController?.getCurrentAnimationName?.() === animationName
            && roaming?.currentId === waypointId
            && roaming?.isFishingSpot === true
            && roaming?.fishing?.animationName === animationName
            && roaming?.fishing?.mirrorX === mirrorX
            && roaming?.fishing?.waterSide === waterSide
            && roaming?.fishing?.railOffsetX390 === railOffsetX390;
        },
        orientation,
        { timeout: 12_000 }
      );
      await page.evaluate(() => {
        const animatedSprite = window.__NEXUS_HABITAT
          .getActiveCompanionNode()
          ?.__animationController
          ?.getAnimatedSprite?.();
        animatedSprite?.gotoAndPlay?.(0);
        if (animatedSprite) animatedSprite.animationSpeed = 0;
      });
      await page.waitForTimeout(80);

      const snapshot = await page.evaluate(snapshotPage);
      const { bounds, roaming, foot } = snapshot;
      const projected = roaming.projected;
      assert.equal(snapshot.companionId, companionId);
      assert.equal(snapshot.animationName, orientation.animationName);
      assert.equal(roaming.currentId, orientation.waypointId);
      assert.equal(roaming.isFishingSpot, true);
      assert.equal(roaming.fishing.animationName, orientation.animationName);
      assert.equal(roaming.fishing.mirrorX, orientation.mirrorX);
      assert.equal(roaming.fishing.waterSide, orientation.waterSide);
      assert.equal(
        roaming.fishing.railOffsetX390,
        orientation.railOffsetX390
      );
      assert.equal(projected.surface, "bridge");
      assert.equal(projected.routeId, "bridge-clearance-r2-1");
      assert.equal(projected.referenceScale390, 1);
      assert.equal(snapshot.animatedFrameScaleX < 0, orientation.mirrorX);
      assert.ok(
        Math.abs(
          snapshot.companionX
          - projected.x
          - orientation.railOffsetX390
        ) <= 1.5,
        `${companionId}/${orientation.id}: rail-side anchor offset drifted`
      );
      assert.ok(
        Math.abs(snapshot.companionY - projected.y) <= 5,
        `${companionId}/${orientation.id}: anchor left bridge datum`
      );

      if (
        orientation.animationName === "fishing_side"
        && orientation.waterSide === "right"
      ) {
        assert.ok(
          bounds.x + bounds.width >= projected.x
            + BRIDGE_MID_RAIL_HALF_WIDTH_PX390
            + MINIMUM_STABLE_LINE_OVERHANG_PX390,
          `${companionId}/${orientation.id}: stable line stayed over right bridge rail`
        );
      } else if (
        orientation.animationName === "fishing_side"
        && orientation.waterSide === "left"
      ) {
        assert.ok(
          bounds.x <= projected.x
            - BRIDGE_MID_RAIL_HALF_WIDTH_PX390
            - MINIMUM_STABLE_LINE_OVERHANG_PX390,
          `${companionId}/${orientation.id}: stable line stayed over left bridge rail`
        );
      } else if (orientation.waterSide === "right") {
        assert.ok(
          bounds.x + bounds.width >= projected.x + 25,
          `${companionId}/${orientation.id}: rod did not reach right water`
        );
      } else if (orientation.waterSide === "left") {
        assert.ok(
          bounds.x <= projected.x - 25,
          `${companionId}/${orientation.id}: rod did not reach left water`
        );
      } else {
        assert.ok(
          bounds.width <= 76,
          `${companionId}/${orientation.id}: far fishing silhouette too wide`
        );
      }

      await page.screenshot({
        path: path.join(
          OUTPUT_DIR,
          `${orientation.id}-${companionId}.png`
        ),
        fullPage: false
      });
      cases.push({
        companionId,
        ...orientation,
        snapshot
      });
    }
  }

  await page.evaluate(() => window.__NEXUS_HABITAT.clearForcedMotionForQa());
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  assert.equal(cases.length, 80);

  const result = {
    pass: true,
    viewport: { width: 390, height: 844 },
    companionCount: COMPANION_IDS.length,
    orientationCount: ORIENTATION_CASES.length,
    caseCount: cases.length,
    screenshots: OUTPUT_DIR,
    maximumBoundsWidth: Math.max(...cases.map((entry) => entry.snapshot.bounds.width)),
    maximumRailOffsetDrift: Math.max(...cases.map((entry) =>
      Math.abs(
        entry.snapshot.companionX
        - entry.snapshot.roaming.projected.x
        - entry.railOffsetX390
      )
    )),
    maximumAnchorDatumDrift: Math.max(...cases.map((entry) =>
      Math.abs(entry.snapshot.companionY - entry.snapshot.roaming.projected.y)
    )),
    cases
  };
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "results.json"),
    `${JSON.stringify(result, null, 2)}\n`,
    "utf8"
  );
  console.log(JSON.stringify({
    ...result,
    cases: cases.map(({
      companionId,
      id,
      railOffsetX390,
      snapshot
    }) => ({
      companionId,
      id,
      width: snapshot.bounds.width,
      railOffsetDrift: Math.abs(
        snapshot.companionX
        - snapshot.roaming.projected.x
        - railOffsetX390
      )
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
