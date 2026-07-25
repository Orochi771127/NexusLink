/**
 * PACK R4 — Orbit settlement (motes + growth evidence plan) cases.
 * Run: node docs/qa/orbit-settlement-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  ORBIT_REGION_SHARD,
  describeOrbitEntryFromVault,
  applyOrbitEntryAttunement,
  mergeOrbitVaultShards,
  buildOrbitGrowthInput,
  planOrbitStageSettlement
} = await import(pathToFileURL(path.join(repoRoot, "src/orbit/orbitSettlement.js")).href);

const { getOrbitStageById } = await import(
  pathToFileURL(path.join(repoRoot, "src/data/orbit/stages/index.js")).href
);

const { createCompletedGrowthEvent } = await import(
  pathToFileURL(path.join(repoRoot, "src/engine/companionGrowthEngine.js")).href
);

function ok(name) {
  console.log(`PASS  ${name}`);
}

// Region → mote mapping stays inside expedition shard whitelist
assert.equal(ORBIT_REGION_SHARD.moonlake, "tide_shard");
assert.equal(ORBIT_REGION_SHARD.plains, "forest_shard");
assert.equal(ORBIT_REGION_SHARD.forge, "ember_shard");
ok("orbit regions map to expedition mote ids");

// 遠征→微光→進場
const emptyEntry = describeOrbitEntryFromVault({ shards: {} }, "moonlake");
assert.equal(emptyEntry.hasMote, false);
const filledEntry = describeOrbitEntryFromVault(
  { shards: { tide_shard: 2, forest_shard: 1 } },
  "moonlake"
);
assert.equal(filledEntry.hasMote, true);
assert.equal(filledEntry.shardId, "tide_shard");
assert.match(filledEntry.line, /微光|痕跡/);
ok("expedition vault motes describe orbit entry");

const baseStats = { impact: 40, spin: 40, guard: 40, burst: 20, overheat: 10, canLaunch: true };
const attuned = applyOrbitEntryAttunement(baseStats, filledEntry);
assert.ok(attuned.burst > baseStats.burst);
assert.equal(attuned.entryAttuned, true);
const plain = applyOrbitEntryAttunement(baseStats, emptyEntry);
assert.equal(plain.burst, baseStats.burst);
ok("entry attunement boosts burst only when motes exist");

// Thin vault merge does NOT bump totalExpeditions
const merged = mergeOrbitVaultShards(
  { shards: { tide_shard: 1 }, totalExpeditions: 3, logs: [], lastExpeditionAt: null },
  "tide_shard",
  1
);
assert.equal(merged.ok, true);
assert.equal(merged.vault.shards.tide_shard, 2);
assert.equal(merged.vault.totalExpeditions, 3);
assert.equal(mergeOrbitVaultShards({}, "not_a_shard", 1).ok, false);
ok("orbit vault merge grants mote without expedition counter");

// Growth input shape accepted by Core writer factory
const growth = buildOrbitGrowthInput({
  companionId: "greyshade-cat",
  stageId: "moonlake-1",
  chapterNo: 1,
  safeHarborMode: false
});
assert.equal(growth.ok, true);
assert.equal(growth.input.sourceType, "exploration");
assert.equal(growth.input.context.choiceId, "orbit_clear");
const created = createCompletedGrowthEvent(growth.input);
assert.equal(created.ok, true);
// key factory 會把 nodeId 的連字號正規成底線
assert.match(created.event.key, /^exploration:1:moonlake_1:orbit_clear$/);
ok("orbit growth input is valid exploration evidence");

const harbor = buildOrbitGrowthInput({
  companionId: "greyshade-cat",
  stageId: "moonlake-1",
  safeHarborMode: true
});
assert.equal(harbor.ok, false);
ok("safe harbor yields zero evidence plan");

// First clear plans grant; repeat clear does not
const stage = getOrbitStageById("moonlake-1");
const first = planOrbitStageSettlement({
  stage,
  alreadyCleared: false,
  companionId: "greyshade-cat",
  chapterNo: 1,
  existingVault: { shards: {}, totalExpeditions: 0 }
});
assert.equal(first.shouldGrant, true);
assert.equal(first.shardGrant.shardId, "tide_shard");
assert.ok(first.growth);
assert.match(first.moteLine, /微光|痕跡/);

const repeat = planOrbitStageSettlement({
  stage,
  alreadyCleared: true,
  companionId: "greyshade-cat",
  chapterNo: 1,
  existingVault: { shards: { tide_shard: 1 }, totalExpeditions: 0 }
});
assert.equal(repeat.shouldGrant, false);
assert.equal(repeat.shardGrant, null);
assert.equal(repeat.growth, null);
ok("first clear grants mote+evidence; repeat clear does not farm");

// Survive stage prefers steadfastness tendency
const survive = getOrbitStageById("moonlake-3");
const survivePlan = planOrbitStageSettlement({
  stage: survive,
  alreadyCleared: false,
  companionId: "greyshade-cat",
  chapterNo: 1,
  existingVault: { shards: {} }
});
assert.equal(survivePlan.growth.tendency, "steadfastness");
ok("survive clear uses steadfastness tendency");

console.log("\nAll orbit settlement cases passed.");
