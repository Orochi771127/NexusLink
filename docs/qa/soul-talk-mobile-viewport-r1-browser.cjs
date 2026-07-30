const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(".");
const OUTPUT_DIR = path.resolve("output/playwright/soul-talk-mobile-viewport-r1");
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 390, height: 664 }
];
const MESSAGE = "今天工作很累，很多事情不知道該怎麼整理";
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
let passed = 0;

function pass(label) {
  passed += 1;
  console.log(`PASS ${label}`);
}

function check(condition, label, details = "") {
  assert.equal(Boolean(condition), true, `${label}${details ? `: ${details}` : ""}`);
  pass(label);
}

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

function seedState() {
  const now = Date.now();
  const history = [];
  for (let index = 0; index < 5; index += 1) {
    history.push(
      { role: "player", text: `先前的話 ${index + 1}` },
      { role: "companion", text: `我還記得第 ${index + 1} 段。慢慢來就好。` }
    );
  }
  localStorage.setItem("nexusLinkR2State:v1", JSON.stringify({
    activeHabitatId: "moonlake",
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat"],
    mood: "calm",
    firstTouchCompleted: true,
    chatHistory: history,
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
      displayName: "Soul Talk Mobile QA",
      identitySkipped: false,
      createdAt: now,
      updatedAt: now
    }
  }));
}

function readGeometry(message) {
  const rect = (element) => {
    const box = element.getBoundingClientRect();
    return {
      left: box.left,
      top: box.top,
      right: box.right,
      bottom: box.bottom,
      width: box.width,
      height: box.height
    };
  };
  const drawer = document.querySelector(".soul-talk-drawer");
  const header = document.querySelector(".soul-drawer-header");
  const chat = document.querySelector("#chat-log");
  const quick = document.querySelector("#quick-reply-row");
  const composer = document.querySelector(".chat-input-row");
  const input = document.querySelector("#message-input");
  const send = document.querySelector("#send-button");
  const nav = document.querySelector(".bottom-nav");
  const lines = [...chat.querySelectorAll(".chat-line")];
  let playerIndex = -1;
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].textContent === `你：${message}`) {
      playerIndex = index;
      break;
    }
  }
  const turnLines = playerIndex >= 0 ? lines.slice(playerIndex) : [];
  const response = turnLines.find(
    (line) => line.classList.contains("companion") || line.classList.contains("system")
  );
  const lastTurnLine = turnLines[turnLines.length - 1] || null;
  const chatRect = rect(chat);
  const playerRect = playerIndex >= 0 ? rect(lines[playerIndex]) : null;
  const responseRect = response ? rect(response) : null;
  const lastRect = lastTurnLine ? rect(lastTurnLine) : null;
  const turnHeight = playerRect && lastRect ? lastRect.bottom - playerRect.top : Infinity;
  const fullTurnFits = turnHeight <= chat.clientHeight - 12;
  const quickRects = [...quick.children].map(rect);
  const firstQuickTop = quickRects[0]?.top ?? 0;

  return {
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight
    },
    drawer: rect(drawer),
    header: rect(header),
    chat: {
      ...chatRect,
      clientHeight: chat.clientHeight,
      scrollHeight: chat.scrollHeight,
      scrollTop: chat.scrollTop
    },
    quick: {
      ...rect(quick),
      clientWidth: quick.clientWidth,
      scrollWidth: quick.scrollWidth,
      childCount: quickRects.length,
      singleRow: quickRects.every((item) => Math.abs(item.top - firstQuickTop) <= 1),
      minTargetHeight: quickRects.length
        ? Math.min(...quickRects.map((item) => item.height))
        : 0
    },
    composer: rect(composer),
    input: rect(input),
    send: rect(send),
    nav: rect(nav),
    latestTurn: {
      found: playerIndex >= 0 && Boolean(response),
      fullTurnFits,
      turnHeight,
      player: playerRect,
      response: responseRect,
      last: lastRect,
      fullyVisible:
        Boolean(playerRect && lastRect)
        && playerRect.top >= chatRect.top - 1
        && lastRect.bottom <= chatRect.bottom + 1,
      responseVisible:
        Boolean(responseRect)
        && responseRect.top >= chatRect.top - 1
        && responseRect.top < chatRect.bottom - 1
    }
  };
}

async function proxyCdn(page) {
  await page.route("https://cdn.jsdelivr.net/**", async (route) => {
    try {
      const response = await fetch(route.request().url());
      await route.fulfill({
        status: response.status,
        body: Buffer.from(await response.arrayBuffer()),
        headers: {
          "access-control-allow-origin": "*",
          "content-type": response.headers.get("content-type") || "application/javascript"
        }
      });
    } catch {
      await route.abort();
    }
  });
}

async function runViewport(baseUrl, viewport) {
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
    locale: "zh-TW"
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await proxyCdn(page);
  await page.addInitScript(seedState);
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.locator(".soul-talk-launcher").waitFor({ state: "visible", timeout: 60_000 });
  await page.waitForTimeout(500);

  const dismiss = page.locator(".resonance-thread .rt-dismiss");
  if (await dismiss.isVisible().catch(() => false)) {
    await dismiss.click();
  }

  await page.locator(".soul-talk-launcher").click();
  const dialog = page.locator(".soul-talk-drawer");
  await dialog.waitFor({ state: "visible" });
  const input = page.locator("#message-input");
  await input.fill(MESSAGE);
  await page.locator("#send-button").click();
  await page.waitForFunction(
    (message) => {
      const lines = [...document.querySelectorAll("#chat-log .chat-line")];
      const playerIndex = lines.findLastIndex((line) => line.textContent === `你：${message}`);
      return playerIndex >= 0
        && lines.slice(playerIndex + 1).some((line) => line.classList.contains("companion"))
        && document.querySelectorAll("#quick-reply-row .quick-reply-chip").length === 3;
    },
    MESSAGE,
    { timeout: 20_000 }
  );
  await page.waitForTimeout(900);

  const geometry = await page.evaluate(readGeometry, MESSAGE);
  const key = `${viewport.width}x${viewport.height}`;
  check(
    geometry.document.scrollWidth === viewport.width,
    `${key} no document horizontal overflow`,
    JSON.stringify(geometry.document)
  );
  check(geometry.header.height <= 56, `${key} compact header <= 56px`, `${geometry.header.height}`);
  check(
    geometry.quick.height <= 44.5,
    `${key} quick-reply rail <= 44px`,
    `${geometry.quick.height}`
  );
  check(geometry.quick.childCount === 3, `${key} three quick replies rendered`);
  check(geometry.quick.singleRow, `${key} quick replies remain on one row`);
  check(
    geometry.quick.minTargetHeight >= 44,
    `${key} quick replies keep 44px targets`,
    `${geometry.quick.minTargetHeight}`
  );
  check(
    geometry.quick.scrollWidth <= geometry.quick.clientWidth + 1,
    `${key} Traditional Chinese quick replies fit without horizontal drag`,
    `${geometry.quick.scrollWidth}/${geometry.quick.clientWidth}`
  );
  check(
    geometry.composer.height <= 60,
    `${key} composer <= 60px`,
    `${geometry.composer.height}`
  );
  check(
    geometry.input.height >= 44 && geometry.send.height >= 44,
    `${key} composer controls keep 44px targets`
  );
  check(
    geometry.drawer.bottom <= geometry.nav.top + 1,
    `${key} drawer stays above navigation`,
    `${geometry.drawer.bottom}/${geometry.nav.top}`
  );
  check(geometry.latestTurn.found, `${key} latest player and companion turn found`);
  check(
    geometry.latestTurn.fullTurnFits
      ? geometry.latestTurn.fullyVisible
      : geometry.latestTurn.responseVisible,
    `${key} latest companion response is visible without manual scrolling`,
    JSON.stringify(geometry.latestTurn)
  );
  if (viewport.height === 664) {
    check(
      geometry.chat.clientHeight >= 280,
      `${key} short Safari-like viewport reserves >= 280px for conversation`,
      `${geometry.chat.clientHeight}`
    );
  }

  await page.screenshot({
    path: path.join(OUTPUT_DIR, `soul-talk-mobile-viewport-r1-${key}.png`),
    fullPage: false
  });

  await input.focus();
  await page.waitForTimeout(180);
  const focusGeometry = await page.evaluate(() => {
    const drawer = document.querySelector(".soul-talk-drawer").getBoundingClientRect();
    const composer = document.querySelector(".chat-input-row").getBoundingClientRect();
    const nav = document.querySelector(".bottom-nav").getBoundingClientRect();
    return {
      focused: document.activeElement?.id === "message-input",
      stFocus: document.body.classList.contains("st-focus"),
      drawerTop: drawer.top,
      composerBottom: composer.bottom,
      navTop: nav.top
    };
  });
  check(focusGeometry.focused && focusGeometry.stFocus, `${key} keyboard focus state activates`);
  check(
    focusGeometry.drawerTop >= -1 && focusGeometry.composerBottom <= focusGeometry.navTop + 1,
    `${key} focused composer remains contained above navigation`,
    JSON.stringify(focusGeometry)
  );
  await input.blur();
  await page.waitForTimeout(220);

  await page.emulateMedia({ reducedMotion: "reduce" });
  const waveformMotion = await page.locator(".soul-presence .waveform-bar").first().evaluate(
    (element) => getComputedStyle(element).animationName
  );
  check(waveformMotion === "none", `${key} reduced motion stops the presence waveform`);

  await page.evaluate(() => {
    document.documentElement.style.fontSize = "200%";
  });
  await page.waitForTimeout(180);
  const zoomGeometry = await page.evaluate(() => {
    const quick = document.querySelector("#quick-reply-row");
    const quickRect = quick.getBoundingClientRect();
    const childRects = [...quick.children].map((child) => child.getBoundingClientRect());
    return {
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: innerWidth,
      quickHeight: quickRect.height,
      singleRow: childRects.every(
        (item) => Math.abs(item.top - (childRects[0]?.top ?? item.top)) <= 1
      ),
      minTargetHeight: childRects.length
        ? Math.min(...childRects.map((item) => item.height))
        : 0
    };
  });
  check(
    zoomGeometry.scrollWidth === zoomGeometry.viewportWidth,
    `${key} 200% text keeps document width contained`,
    JSON.stringify(zoomGeometry)
  );
  check(
    zoomGeometry.quickHeight <= 44.5
      && zoomGeometry.singleRow
      && zoomGeometry.minTargetHeight >= 44,
    `${key} 200% text keeps a single 44px quick-reply rail`,
    JSON.stringify(zoomGeometry)
  );

  check(pageErrors.length === 0, `${key} zero page errors`, pageErrors.join(" | "));
  check(consoleErrors.length === 0, `${key} zero console errors`, consoleErrors.join(" | "));
  await context.close();
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  staticServer = await startStaticServer();
  const baseUrl = `http://127.0.0.1:${staticServer.address().port}/`;
  browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"]
  });

  for (const viewport of VIEWPORTS) {
    await runViewport(baseUrl, viewport);
  }

  console.log(`Soul Talk mobile viewport R1 browser QA: ${passed}/${passed} PASS`);
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (browser) await browser.close();
    if (staticServer) {
      await new Promise((resolve) => staticServer.close(resolve));
    }
  });
