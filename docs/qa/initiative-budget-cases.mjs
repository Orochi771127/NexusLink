/**
 * Pack C — Initiative budget view
 * Run: node docs/qa/initiative-budget-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function ok(name) {
  console.log(`PASS  ${name}`);
}

const {
  AMBIENT_INITIATIVE_LIMITS,
  evaluateAmbientInitiativeCooldown,
  getAmbientInitiativeBudget
} = await import(pathToFileURL(path.join(repoRoot, "src/ai/autonomy/initiativeCooldown.js")).href);

const bootAt = 1_000_000;
const nowQuiet = bootAt + 10_000;
const budgetQuiet = getAmbientInitiativeBudget({
  now: nowQuiet,
  bootAt,
  lastMomentAt: 0,
  momentsThisSession: 0,
  safeUnstable: false
});
assert.equal(budgetQuiet.allowed, false);
assert.ok(budgetQuiet.blocks.includes("boot_quiet"));
assert.equal(budgetQuiet.remaining, AMBIENT_INITIATIVE_LIMITS.SESSION_CAP);
assert.equal(budgetQuiet.sessionCap, 2);
assert.equal(budgetQuiet.dailyCap, null);
assert.equal(budgetQuiet.persistence, "session_only");
assert.equal(budgetQuiet.nextEligibleAt, bootAt + AMBIENT_INITIATIVE_LIMITS.BOOT_QUIET_MS);
assert.match(budgetQuiet.blockReasons[0].zh, /安靜/);
ok("boot quiet budget view");

const nowReady = bootAt + AMBIENT_INITIATIVE_LIMITS.BOOT_QUIET_MS + 1;
const budgetReady = getAmbientInitiativeBudget({
  now: nowReady,
  bootAt,
  lastMomentAt: 0,
  momentsThisSession: 0
});
assert.equal(budgetReady.allowed, true);
assert.equal(budgetReady.remaining, 2);
assert.equal(budgetReady.nextEligibleAt, null);
ok("ready budget has full remaining");

const budgetCap = getAmbientInitiativeBudget({
  now: nowReady,
  bootAt,
  lastMomentAt: nowReady - 10_000,
  momentsThisSession: 2
});
assert.equal(budgetCap.allowed, false);
assert.ok(budgetCap.blocks.includes("session_cap"));
assert.equal(budgetCap.remaining, 0);
ok("session cap spends remaining to 0");

const last = nowReady - 60_000;
const budgetInterval = getAmbientInitiativeBudget({
  now: nowReady,
  bootAt,
  lastMomentAt: last,
  momentsThisSession: 1
});
assert.equal(budgetInterval.allowed, false);
assert.ok(budgetInterval.blocks.includes("moment_interval"));
assert.equal(budgetInterval.remaining, 1);
assert.equal(budgetInterval.nextEligibleAt, last + AMBIENT_INITIATIVE_LIMITS.MIN_INTERVAL_MS);
ok("interval block keeps remaining and nextEligibleAt");

const cooldown = evaluateAmbientInitiativeCooldown({
  now: nowReady,
  bootAt,
  lastMomentAt: last,
  momentsThisSession: 1
});
assert.deepEqual(budgetInterval.blocks, cooldown.blocks);
ok("budget blocks stay aligned with cooldown");

const controllerSrc = fs.readFileSync(
  path.join(repoRoot, "src/ui/companionInitiativeController.js"),
  "utf8"
);
assert.match(controllerSrc, /getAmbientInitiativeBudget/);
assert.match(controllerSrc, /getBudgetView/);
ok("companionInitiativeController exposes budget view");

const cooldownSrc = fs.readFileSync(
  path.join(repoRoot, "src/ai/autonomy/initiativeCooldown.js"),
  "utf8"
);
assert.match(cooldownSrc, /dailyCap:\s*null/);
assert.match(cooldownSrc, /persistence:\s*"session_only"/);
assert.doesNotMatch(cooldownSrc, /DAY_CAP\s*=|dailyCap\s*:\s*[1-9]|loginStreak|missedDay/);
ok("no daily FOMO persistence in initiative budget");

console.log("\nAll initiative budget cases passed.");
