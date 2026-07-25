/**
 * Pack D — Expedition loot semantics
 * Run: node docs/qa/expedition-loot-semantics-cases.mjs
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

const { SHARD_TYPES, getShardType } = await import(
  pathToFileURL(path.join(repoRoot, "src/data/lootTables.js")).href
);
const {
  describeMoteAmount,
  formatBroughtMotesLine,
  formatVaultMoteStripLabel,
  LOOT_FARM_FRAMING_RE
} = await import(pathToFileURL(path.join(repoRoot, "src/expedition/lootPresentation.js")).href);
const { buildExpeditionSystemFacts } = await import(
  pathToFileURL(path.join(repoRoot, "src/expedition/expeditionSettlementVoice.js")).href
);
const { summarizeExpeditionSession } = await import(
  pathToFileURL(path.join(repoRoot, "src/expedition/expeditionState.js")).href
);

assert.equal(getShardType("forest_shard").label.zh, "森息微光");
assert.equal(getShardType("tide_shard").label.zh, "潮汐微光");
assert.equal(getShardType("ember_shard").label.zh, "餘燼微光");
assert.ok(SHARD_TYPES.forest_shard.id === "forest_shard");
ok("shard ids stable; labels use mote language");

assert.equal(describeMoteAmount(1), "幾縷");
assert.equal(describeMoteAmount(4), "一些");
assert.equal(describeMoteAmount(9), "不少");
const line = formatBroughtMotesLine({
  companionName: "灰影",
  shardId: "forest_shard",
  count: 3,
  regionLabel: "風歇草坡"
});
assert.match(line, /一些森息微光/);
assert.match(line, /不是戰利品/);
assert.doesNotMatch(line, /\d+\s*枚/);
ok("brought-motes line is qualitative");

const strip = formatVaultMoteStripLabel("ember_shard", 5, "zh");
assert.equal(strip.count, 5);
assert.match(strip.label, /餘燼微光痕跡/);
ok("vault strip keeps count, softens label");

const facts = buildExpeditionSystemFacts(
  {
    companionName: "灰影",
    regionId: "plains_windrest",
    lootCollected: { forest_shard: 4 },
    visitedExplorePoints: ["a"],
    stats: { kills: 1 }
  },
  { lootSummary: { forest_shard: 4 } }
);
assert.ok(facts.some((f) => /同行痕跡，不是戰利品/.test(f)));
assert.ok(!facts.some((f) => /\d+\s*枚/.test(f)));
ok("settlement facts avoid enum farm framing");

const summary = summarizeExpeditionSession({
  companionName: "灰影",
  regionId: "plains_windrest",
  nodeId: "plains_windrest",
  lootCollected: { forest_shard: 3 },
  visitedExplorePoints: ["x"],
  stats: { kills: 2 }
});
assert.match(summary.message, /不是戰利品/);
assert.doesNotMatch(summary.message, /\d+\s*枚/);
ok("summarizeExpeditionSession uses mote semantics");

const PLAYER_FILES = [
  "src/expedition/expeditionSettlementVoice.js",
  "src/expedition/expeditionState.js",
  "src/expedition/expeditionPersistence.js",
  "src/expedition/companionBrain.js",
  "src/expedition/intentNarration.js",
  "src/expedition/expeditionCraftEngine.js",
  "src/data/expeditionCraftRecipes.js",
  "src/data/lootTables.js"
];
for (const relative of PLAYER_FILES) {
  const text = fs.readFileSync(path.join(repoRoot, relative), "utf8");
  const hit = text.match(LOOT_FARM_FRAMING_RE);
  assert.equal(hit, null, `${relative} farm framing: ${hit?.[0]}`);
  assert.doesNotMatch(text, /帶回了?\s*\$\{[^}]+\}\s*枚|帶回\s*\$\{primaryCount\}\s*枚/);
}
ok("player-facing expedition files free of farm framing");

console.log("\nAll expedition loot semantics cases passed.");
