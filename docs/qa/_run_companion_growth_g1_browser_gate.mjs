// Targeted G1 browser gate.
// Run with Playwright resolvable by Node (Codex: set NODE_PATH to bundled node_modules).
import { createRequire } from "node:module";
import { join } from "node:path";
import { tmpdir } from "node:os";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE_URL = process.env.NEXUS_QA_BASE || process.env.NEXUS_BASE_URL || "http://127.0.0.1:5197";
const STORAGE_KEY = "nexusLinkR2State:v1";
const PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js";
const report = { checks: [], consoleErrors: [], screenshots: {}, outcomes: [] };

function check(name, ok, detail = null) {
  report.checks.push({ name, ok: Boolean(ok), detail });
}

async function installSeed(context) {
  await context.addInitScript((storageKey) => {
    if (!['http:', 'https:'].includes(location.protocol)) return;
    const now = Date.now();
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify({
        activeCompanionId: "greyshade-cat",
        unlockedCompanionIds: ["greyshade-cat"],
        playerProfile: { displayName: "Growth QA", createdAt: now, updatedAt: now },
        onboarding: {
          status: "completed",
          completed: true,
          completedAt: now,
          identityCompleted: true,
          guidanceCompleted: true,
          greyshadeMetAt: now,
          firstLoop: { completedAt: now }
        },
        firstTouchCompleted: true,
        firstHugCompleted: true,
        energy: 6,
        touchFatigue: 1,
        mood: "calm",
        defense: 35,
        bond: 12,
        trust: 12,
        lastTouchReaction: "",
        safeHarborMode: false,
        lastSeenAt: now
      }));
    }
    const originalSetItem = Storage.prototype.setItem;
    window.__growthStorageWrites = [];
    Storage.prototype.setItem = function setItem(key, value) {
      window.__growthStorageWrites.push({ key: String(key), value: String(value) });
      return originalSetItem.call(this, key, value);
    };
  }, STORAGE_KEY);
}

async function preparePage(context) {
  const page = await context.newPage();
  await page.route(PIXI_CDN_URL, (route) => route.abort("failed"));
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const location = message.location();
    if (location.url === PIXI_CDN_URL && message.text().includes("ERR_FAILED")) return;
    report.consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => report.consoleErrors.push(String(error)));
  return page;
}

async function waitReady(page, reload = false) {
  if (reload) await page.reload({ waitUntil: "commit", timeout: 30000 });
  else await page.goto(BASE_URL, { waitUntil: "commit", timeout: 30000 });
  await page.locator('[data-action="grow"]').waitFor({ state: "visible", timeout: 30000 });
  await page.waitForFunction(
    () => document.documentElement.dataset.nexusControllersReady === "true",
    null,
    { timeout: 30000 }
  );
  await page.locator("#pixi-load-failure").waitFor({ state: "visible", timeout: 10000 });
}

async function openGrowth(page) {
  const activePage = await page.locator("#page-layer").getAttribute("data-active-page");
  if (activePage !== "grow") await page.locator('[data-action="grow"]').click({ force: true });
  await page.locator('[data-page="grow"]:not([hidden])').waitFor({ state: "visible", timeout: 10000 });
}

async function setFixture(page, patch) {
  await page.evaluate(([storageKey, fixturePatch]) => {
    const state = JSON.parse(localStorage.getItem(storageKey) || "{}");
    Object.assign(state, {
      activeCompanionId: "greyshade-cat",
      energy: 6,
      touchFatigue: 1,
      mood: "calm",
      lastTouchReaction: "",
      safeHarborMode: false,
      growthSafetyExcluded: false,
      lastSeenAt: Date.now()
    }, fixturePatch);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [STORAGE_KEY, patch]);
}

async function snapshot(page) {
  return page.evaluate(async (storageKey) => {
    const store = await import("./src/state/store.js");
    return {
      raw: localStorage.getItem(storageKey),
      keys: Object.keys(localStorage).sort(),
      state: JSON.parse(JSON.stringify(store.getState()))
    };
  }, STORAGE_KEY);
}

async function runOutcome(page, name, fixture, practiceId, expectedOutcome) {
  await setFixture(page, fixture);
  await waitReady(page, true);
  await openGrowth(page);
  const before = await snapshot(page);
  await page.evaluate(() => { window.__growthStorageWrites = []; });
  await page.locator(`[data-growth-practice="${practiceId}"]`).click();
  const result = page.locator(`[data-growth-result][data-outcome="${expectedOutcome}"]`);
  await result.waitFor({ state: "visible", timeout: 5000 });
  const after = await snapshot(page);
  const writes = await page.evaluate(() => window.__growthStorageWrites || []);
  const resultText = (await result.innerText()).trim();
  const outcome = { name, practiceId, expectedOutcome, resultText };
  report.outcomes.push(outcome);
  check(`${name}_outcome`, await result.count() === 1 && Boolean(resultText), outcome);
  check(`${name}_aria_live`, await result.getAttribute("aria-live") === "polite");
  check(`${name}_store_unchanged`, JSON.stringify(after.state) === JSON.stringify(before.state));
  check(`${name}_main_save_unchanged`, after.raw === before.raw);
  check(`${name}_storage_keys_unchanged`, JSON.stringify(after.keys) === JSON.stringify(before.keys));
  check(`${name}_zero_storage_writes`, writes.length === 0, writes);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    await installSeed(context);
    const page = await preparePage(context);
    await waitReady(page);

    await runOutcome(page, "accepted", {}, "attunement", "accept");
    const acceptedShot = join(tmpdir(), "nexus-growth-g1-accepted-390x844.png");
    await page.screenshot({ path: acceptedShot, fullPage: true });
    report.screenshots.acceptedMobile = acceptedShot;
    await runOutcome(page, "modified", { mood: "distant" }, "attunement", "modify");
    await runOutcome(page, "declined", { lastTouchReaction: "reject" }, "pathfinding", "decline");
    await runOutcome(page, "rested", { energy: 1, touchFatigue: 8 }, "steadfastness", "rest");

    await waitReady(page, true);
    await openGrowth(page);
    check("reload_clears_result", await page.locator('[data-growth-result][data-outcome="waiting"]').count() === 1);
    check("reload_clears_tendencies", await page.locator("[data-growth-tendency]").count() === 0);

    const growthPage = page.locator('[data-page="grow"]');
    const practiceButtons = page.locator("[data-growth-practice]");
    check("four_practices_visible", await practiceButtons.count() === 4);
    const mobileOverflow = await growthPage.evaluate((element) => ({
      ok: element.scrollWidth <= element.clientWidth + 1,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }));
    check("mobile_no_horizontal_overflow", mobileOverflow.ok, mobileOverflow);
    const buttonHeights = await practiceButtons.evaluateAll(
      (elements) => elements.map((element) => Math.round(element.getBoundingClientRect().height))
    );
    check("mobile_touch_targets", buttonHeights.every((height) => height >= 44), buttonHeights);
    check("no_growth_progress_bar", await page.locator("#growth-page-body .page-progress-block").count() === 0);
    const prototype = page.locator("[data-growth-prototype]");
    check("prototype_secondary_and_closed", await prototype.count() === 1 && await prototype.getAttribute("open") === null);
    const primaryText = await page.locator("#growth-page-body").evaluate((element) => Array.from(element.children)
      .filter((child) => !child.matches("[data-growth-prototype]"))
      .map((child) => child.innerText)
      .join(" "));
    const forbiddenPrimary = ["xp", "等級", "等级", "每日", "倒數", "倒数", "還差", "还差", "+1", "勝場", "胜场"];
    check(
      "primary_growth_has_no_fomo_or_power_copy",
      !forbiddenPrimary.some((term) => primaryText.toLowerCase().includes(term)),
      primaryText
    );

    await page.locator('[data-growth-practice="boundary_respect"]').focus();
    await page.keyboard.press("Enter");
    await page.locator('[data-growth-result][data-outcome="accept"]').waitFor({ state: "visible", timeout: 5000 });
    check("keyboard_enter_activates_practice", true);
    await page.keyboard.press("Escape");
    check("escape_returns_home", await page.locator("#page-layer").getAttribute("data-active-page") === "home");

    await page.emulateMedia({ reducedMotion: "reduce" });
    await openGrowth(page);
    const transitionDuration = await growthPage.evaluate((element) => getComputedStyle(element).transitionDuration);
    check("reduced_motion_disables_page_transition", transitionDuration === "0s", transitionDuration);

    await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    await page.locator('[data-growth-practice="steadfastness"]').scrollIntoViewIfNeeded();
    const textOverflow = await growthPage.evaluate((element) => ({
      ok: element.scrollWidth <= element.clientWidth + 1,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }));
    check("text_200_percent_no_horizontal_overflow", textOverflow.ok, textOverflow);
    await page.evaluate(() => { document.documentElement.style.fontSize = ""; });

    const desktopContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    await installSeed(desktopContext);
    const desktop = await preparePage(desktopContext);
    await waitReady(desktop);
    await openGrowth(desktop);
    const desktopGrowth = desktop.locator('[data-page="grow"]');
    const desktopOverflow = await desktopGrowth.evaluate((element) => ({
      ok: element.scrollWidth <= element.clientWidth + 1,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }));
    check("desktop_no_horizontal_overflow", desktopOverflow.ok, desktopOverflow);
    const desktopShot = join(tmpdir(), "nexus-growth-g1-desktop-1280x900.png");
    await desktop.screenshot({ path: desktopShot, fullPage: true });
    report.screenshots.desktop = desktopShot;
    await desktopContext.close();

    check("no_console_errors", report.consoleErrors.length === 0, report.consoleErrors);
    await context.close();
  } finally {
    await browser.close();
  }

  const failed = report.checks.filter((item) => !item.ok);
  report.summary = {
    total: report.checks.length,
    passed: report.checks.length - failed.length,
    failed: failed.length,
    ok: failed.length === 0
  };
  console.log(JSON.stringify(report, null, 2));
  if (failed.length) process.exitCode = 1;
}

await run();
