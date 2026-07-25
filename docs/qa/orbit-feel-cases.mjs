/**
 * PACK R5 — Orbit feel / launch curve cases.
 * Run: node docs/qa/orbit-feel-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const physics = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitPhysics.js")).href
);

function ok(name) {
  console.log(`PASS  ${name}`);
}

const {
  LAUNCH_PULL_MIN,
  LAUNCH_PULL_MAX,
  LAUNCH_CHARGE_EXP,
  LAUNCH_SPEED_BASE,
  DEFAULT_SPIN_DECAY,
  DEFAULT_FRICTION,
  COLLIDE_DAMAGE_MAX_TO_B,
  COLLIDE_DAMAGE_MAX_TO_A,
  launchVelocityFromPull
} = physics;

assert.equal(LAUNCH_PULL_MIN, 0.04);
assert.equal(LAUNCH_PULL_MAX, 0.52);
assert.equal(LAUNCH_CHARGE_EXP, 0.85);
assert.equal(LAUNCH_SPEED_BASE, 0.48);
assert.equal(DEFAULT_SPIN_DECAY, 6.2);
assert.equal(DEFAULT_FRICTION, 0.15);
assert.equal(COLLIDE_DAMAGE_MAX_TO_B, 24);
assert.equal(COLLIDE_DAMAGE_MAX_TO_A, 22);
ok("R5 feel constants match BALANCE_SHEET §9.1");

const short = launchVelocityFromPull(0, 0.12, 50);
const mid = launchVelocityFromPull(0, 0.28, 50);
const long = launchVelocityFromPull(0, 0.5, 50);
const shortSpeed = Math.hypot(short.vx, short.vy);
const midSpeed = Math.hypot(mid.vx, mid.vy);
const longSpeed = Math.hypot(long.vx, long.vy);
assert.ok(shortSpeed < midSpeed && midSpeed < longSpeed);
assert.ok(short.charge < mid.charge && mid.charge <= long.charge);
ok("launch speed / charge increase with pull length");

const lowImpact = launchVelocityFromPull(0, 0.35, 20);
const highImpact = launchVelocityFromPull(0, 0.35, 90);
assert.ok(Math.hypot(highImpact.vx, highImpact.vy) > Math.hypot(lowImpact.vx, lowImpact.vy));
ok("Impact projection scales launch speed");

// 短拉不可瞬間爆衝：0.12 正規化拉力應明顯低於長拉
assert.ok(shortSpeed < longSpeed * 0.72);
ok("short pull stays controllable vs long pull");

console.log("\nAll orbit feel cases passed.");
