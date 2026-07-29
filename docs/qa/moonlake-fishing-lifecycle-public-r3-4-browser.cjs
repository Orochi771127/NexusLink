const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve(
  "output/playwright/moonlake-fishing-lifecycle-public-r3-4"
);
const EXTERNAL_BASE_URL = process.env.R3_4_BASE_URL?.trim() || "";
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
  Number.parseInt(process.env.R3_4_COMPANION_OFFSET || "0", 10) || 0
);
const companionCount = Math.max(
  1,
  Number.parseInt(
    process.env.R3_4_COMPANION_COUNT || String(COMPANION_IDS.length),
    10
  ) || COMPANION_IDS.length
);
const SELECTED_COMPANION_IDS = COMPANION_IDS.slice(
  companionOffset,
  companionOffset + companionCount
);
const RUN_PAUSE_RESUME = process.env.R3_4_RUN_PAUSE_RESUME !== "0";
const ORIENTATIONS = [
  {
    id: "front-right",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: false,
    waterSide: "right"
  },
  {
    id: "front-left",
    waypointId: "bridge_mid",
    animationName: "fishing_front",
    mirrorX: true,
    waterSide: "left"
  },
  {
    id: "side-right",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: false,
    waterSide: "right"
  },
  {
    id: "side-left",
    waypointId: "bridge_mid",
    animationName: "fishing_side",
    mirrorX: true,
    waterSide: "left"
  },
  {
    id: "back-far",
    waypointId: "bridge_far",
    animationName: "fishing_back",
    mirrorX: false,
    waterSide: "far"
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
  if (!EXTERNAL_BASE_URL) {
    staticServer = await startStaticServer();
    console.log("[R3.4] static server ready");
  }
  const baseUrl = EXTERNAL_BASE_URL
    ? `${EXTERNAL_BASE_URL.replace(/\/+$/, "")}/`
    : `http://127.0.0.1:${staticServer.address().port}/`;
  console.log(`[R3.4] target ${baseUrl}`);
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
  console.log("[R3.4] browser ready");
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
        firstLoop: { skippedAt: null, completedAt: now }
      },
      playerProfile: {
        displayName: "Moonlake R3.4 QA",
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
  console.log("[R3.4] page committed");
  await page.waitForFunction(
    () => window.__NEXUS_HABITAT?.getLive3dDiagnostics?.()?.ready === true
      && typeof window.__NEXUS_HABITAT?.playFishingForQa === "function"
      && typeof window.__NEXUS_HABITAT?.setFishingLifecycleActiveForQa === "function",
    null,
    { timeout: 60_000 }
  );
  console.log("[R3.4] Moonlake runtime ready");
  await page.waitForTimeout(700);
  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
  }
  await page.evaluate(
    () => window.__NEXUS_HABITAT.triggerHabitatInteractionForQa("lake-center")
  );
  assert.equal(
    await page.evaluate(
      () => Boolean(
        window.__NEXUS_HABITAT.getTouchAffordanceDiagnostics()?.visible
      )
    ),
    false,
    "the first-touch cue stays hidden after firstTouchCompleted"
  );

  const lifecycleResults = [];
  for (const phase of ["day", "night"]) {
    await page.evaluate(
      (nextPhase) => window.__NEXUS_HABITAT.setTimePhase(nextPhase),
      phase
    );
    for (const companionId of SELECTED_COMPANION_IDS) {
      assert.equal(
        await page.evaluate(
          (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
          companionId
        ),
        true
      );
      await page.waitForFunction(
        (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
        companionId,
        { timeout: 15_000 }
      );
      for (const orientation of ORIENTATIONS) {
        const previousId = await page.evaluate(
          () => window.__NEXUS_HABITAT.getRoamingSnapshot()
            ?.lastFishingLifecycle?.id || 0
        );
        assert.equal(
          await page.evaluate(
            ({ waypointId, animationName, mirrorX }) =>
              window.__NEXUS_HABITAT.playFishingForQa(
                waypointId,
                animationName,
                mirrorX,
                0.02
              ),
            orientation
          ),
          true,
          `${phase} ${companionId} ${orientation.id}: start failed`
        );
        try {
          await page.waitForFunction(
            (priorId) => {
              const snapshot = window.__NEXUS_HABITAT.getRoamingSnapshot();
              return !snapshot?.fishing
                && snapshot?.lastFishingLifecycle?.id > priorId;
            },
            previousId,
            { timeout: 12_000 }
          );
        } catch (error) {
          const snapshot = await page.evaluate(
            () => window.__NEXUS_HABITAT.getRoamingSnapshot()
          );
          throw new Error(
            `${phase} ${companionId} ${orientation.id} lifecycle timeout: `
              + `${JSON.stringify(snapshot)}`,
            { cause: error }
          );
        }
        const lifecycle = await page.evaluate(
          () => window.__NEXUS_HABITAT.getRoamingSnapshot()
            .lastFishingLifecycle
        );
        assert.equal(lifecycle.animationName, orientation.animationName);
        assert.equal(lifecycle.mirrorX, orientation.mirrorX);
        assert.equal(lifecycle.waterSide, orientation.waterSide);
        assert.equal(
          lifecycle.status,
          "completed",
          `${phase} ${companionId} ${orientation.id}: ${JSON.stringify(lifecycle)}`
        );
        assert.deepEqual(
          lifecycle.phases,
          ["cast", "wait", "bite", "reel", "settle", "idle"]
        );
        lifecycleResults.push({ phase, companionId, ...orientation });
      }
      console.log(
        `[R3.4 lifecycle] ${phase} ${companionId} `
          + `${lifecycleResults.length}/${SELECTED_COMPANION_IDS.length * 10}`
      );
    }
  }
  assert.equal(lifecycleResults.length, SELECTED_COMPANION_IDS.length * 10);

  const lineResults = [];
  await page.evaluate(() => window.__NEXUS_HABITAT.setTimePhase("day"));
  for (const companionId of SELECTED_COMPANION_IDS) {
    await page.evaluate(
      (id) => window.__NEXUS_HABITAT.swapCompanionById(id),
      companionId
    );
    await page.waitForFunction(
      (id) => window.__NEXUS_HABITAT.getFootPlacement().companionId === id,
      companionId,
      { timeout: 15_000 }
    );
    for (const orientation of ORIENTATIONS) {
      await page.evaluate(
        ({ waypointId, animationName, mirrorX }) =>
          window.__NEXUS_HABITAT.playFishingForQa(
            waypointId,
            animationName,
            mirrorX,
            0.1
          ),
        orientation
      );
      await page.waitForFunction(
        () => {
          const snapshot = window.__NEXUS_HABITAT.getRoamingSnapshot();
          const fx = window.__NEXUS_HABITAT.getFishingFxDiagnostics();
          return snapshot?.fishing?.phase === "wait"
            && fx?.phase === "wait"
            && fx?.visible;
        },
        null,
        { timeout: 3_000 }
      );
      const line = await page.evaluate(() => ({
        fishing: window.__NEXUS_HABITAT.getRoamingSnapshot().fishing,
        fx: window.__NEXUS_HABITAT.getFishingFxDiagnostics()
      }));
      assert.equal(line.fx.extendsBeyondRail, true);
      assert.equal(line.fx.bobberVisible, true);
      assert.equal(line.fx.rippleCount, 2);
      assert.equal(line.fx.paused, false);
      assert.ok(line.fx.lineLengthPx >= 42);
      if (orientation.waterSide === "left") {
        assert.ok(line.fx.end.x < line.fx.start.x);
      } else if (orientation.waterSide === "right") {
        assert.ok(line.fx.end.x > line.fx.start.x);
      } else {
        assert.ok(line.fx.end.y < line.fx.start.y);
      }
      lineResults.push({ companionId, ...orientation, ...line.fx });
      await page.evaluate(
        () => window.__NEXUS_HABITAT.clearForcedMotionForQa()
      );
    }
    console.log(
      `[R3.4 line] ${companionId} ${lineResults.length}/`
        + `${SELECTED_COMPANION_IDS.length * 5}`
    );
  }
  assert.equal(lineResults.length, SELECTED_COMPANION_IDS.length * 5);

  if (RUN_PAUSE_RESUME) {
    await page.evaluate(
      () => window.__NEXUS_HABITAT.swapCompanionById("greyshade-cat")
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.evaluate(() => window.__NEXUS_HABITAT.playFishingForQa(
      "bridge_mid",
      "fishing_side",
      false,
      1
    ));
    await page.waitForFunction(
      () => window.__NEXUS_HABITAT.getRoamingSnapshot()?.fishing?.phase === "wait"
    );
    const beforePause = await page.evaluate(() => ({
      snapshot: window.__NEXUS_HABITAT.getRoamingSnapshot(),
      fx: window.__NEXUS_HABITAT.getFishingFxDiagnostics()
    }));
    assert.equal(beforePause.fx.rippleCount, 2);
    assert.equal(beforePause.fx.bobberVisible, true);
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "moonlake-r3-4-wait-reduced-motion.png"),
      fullPage: false
    });
    assert.equal(
      await page.evaluate(
        () => window.__NEXUS_HABITAT.setFishingLifecycleActiveForQa(false)
      ),
      true
    );
    const pausedStart = await page.evaluate(
      () => window.__NEXUS_HABITAT.getRoamingSnapshot().fishing
    );
    await page.waitForTimeout(900);
    const paused = await page.evaluate(
      () => window.__NEXUS_HABITAT.getRoamingSnapshot().fishing
    );
    assert.equal(paused.phase, "wait");
    assert.equal(paused.paused, true);
    assert.ok(
      Math.abs(paused.phaseProgress - pausedStart.phaseProgress) < 0.01
    );
    assert.equal(
      await page.evaluate(
        () => window.__NEXUS_HABITAT.setFishingLifecycleActiveForQa(true)
      ),
      true
    );
    const pausedLifecycleId = beforePause.snapshot.fishing
      ? beforePause.snapshot.lastFishingLifecycle?.id || 0
      : 0;
    await page.waitForFunction(
      (priorId) => {
        const snapshot = window.__NEXUS_HABITAT.getRoamingSnapshot();
        return !snapshot.fishing
          && snapshot.lastFishingLifecycle?.id > priorId
          && snapshot.lastFishingLifecycle?.status === "completed";
      },
      pausedLifecycleId,
      { timeout: 20_000 }
    );
    const afterResume = await page.evaluate(() => ({
      snapshot: window.__NEXUS_HABITAT.getRoamingSnapshot(),
      fx: window.__NEXUS_HABITAT.getFishingFxDiagnostics()
    }));
    assert.deepEqual(
      afterResume.snapshot.lastFishingLifecycle.phases,
      ["cast", "wait", "bite", "reel", "settle", "idle"]
    );
    assert.equal(afterResume.fx.visible, false);
    assert.equal(afterResume.fx.rippleCount, 0);
    assert.equal(afterResume.fx.bobberVisible, false);
  }

  assert.deepEqual(pageErrors, []);
  assert.deepEqual(consoleErrors, []);
  console.log(JSON.stringify({
    pass: true,
    package: "TP-MOONLAKE-FISHING-LIFECYCLE-PUBLIC-R3.4",
    lifecycleCases: lifecycleResults.length,
    lineReadabilityCases: lineResults.length,
    companions: SELECTED_COMPANION_IDS.length,
    companionOffset,
    orientations: ORIENTATIONS.length,
    phases: ["day", "night"],
    reducedMotion: RUN_PAUSE_RESUME,
    pauseResume: RUN_PAUSE_RESUME,
    cleanup: RUN_PAUSE_RESUME,
    screenshot: path.join(
      OUTPUT_DIR,
      "moonlake-r3-4-wait-reduced-motion.png"
    )
  }, null, 2));

  await browser.close();
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close().catch(() => {});
  await new Promise((resolve) => staticServer?.close(resolve) || resolve());
  process.exitCode = 1;
});
