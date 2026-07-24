/**
 * Product Pack — Qualitative bond presentation
 * Run: node docs/qa/qualitative-bond-presentation-cases.mjs
 *
 * 驗收：
 * 1) 階段映射對齊里程碑門檻（12/25/45/70/90）
 * 2) 玩家可見模組不再輸出「羈絆 +N／達 N／目前 N」刷分句
 * 3) HUD／年表／探索 chip helper 走質性 API
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
  getBondStagePresentation,
  getTrustStagePresentation,
  formatAffinityDeltaChip,
  formatUpcomingMilestoneCopy
} = await import(pathToFileURL(path.join(repoRoot, "src/ui/bondPresentation.js")).href);

assert.equal(getBondStagePresentation(0).id, "nascent");
assert.equal(getBondStagePresentation(11).id, "nascent");
assert.equal(getBondStagePresentation(12).id, "first_glow");
assert.equal(getBondStagePresentation(25).id, "trust_sprout");
assert.equal(getBondStagePresentation(45).id, "safe_place");
assert.equal(getBondStagePresentation(70).id, "side_by_side");
assert.equal(getBondStagePresentation(90).id, "lake_light");
assert.equal(getBondStagePresentation(100).label, "不滅的湖光");
assert.equal(getBondStagePresentation(90, "en").id, "lake_light");
ok("bond stage bands align to milestone thresholds");

assert.equal(getTrustStagePresentation(0).id, "watching");
assert.equal(getTrustStagePresentation(19).id, "watching");
assert.equal(getTrustStagePresentation(20).id, "step_closer");
assert.equal(getTrustStagePresentation(80).id, "deep_trust");
ok("trust stage bands resolve");

assert.equal(formatAffinityDeltaChip("bond", 3, "zh"), "羈絆更深了一點");
assert.equal(formatAffinityDeltaChip("trust", -1, "zh"), "信任往後退了一點");
assert.equal(formatAffinityDeltaChip("energy", 1, "zh"), null);
assert.doesNotMatch(formatAffinityDeltaChip("bond", 2, "zh"), /\+\d|達\s*\d|目前\s*\d/);
ok("affinity chips are qualitative");

const upcoming = formatUpcomingMilestoneCopy("初亮的記憶", "zh");
assert.match(upcoming, /下一段光痕/);
assert.doesNotMatch(upcoming, /達\s*\d|目前\s*\d|threshold/);
ok("upcoming milestone copy hides thresholds");

const PLAYER_FACING = [
  "src/ui/hudController.js",
  "src/ui/actionSheetController.js",
  "src/ui/mapController.js",
  "src/ui/pageRouter.js",
  "src/expedition/expeditionSettlementVoice.js"
];

const GRIND_RE = /羈絆\s*[+\-]\s*\d|信任\s*[+\-]\s*\d|羈絆達\s*\$\{|目前\s*\$\{bond\}|羈絆\s*\+\$\{/;

for (const relative of PLAYER_FACING) {
  const text = fs.readFileSync(path.join(repoRoot, relative), "utf8");
  const hit = text.match(GRIND_RE);
  assert.equal(hit, null, `${relative} still exposes grind copy: ${hit?.[0]}`);
}
ok("player-facing modules free of bond/trust grind deltas");

const hud = fs.readFileSync(path.join(repoRoot, "src/ui/hudController.js"), "utf8");
assert.match(hud, /getBondStagePresentation/);
assert.match(hud, /getTrustStagePresentation/);
assert.doesNotMatch(hud, /bondEl\.textContent\s*=\s*state\.bond/);
assert.doesNotMatch(hud, /trustEl\.textContent\s*=\s*state\.trust/);
ok("HUD wires qualitative stages");

const sheet = fs.readFileSync(path.join(repoRoot, "src/ui/actionSheetController.js"), "utf8");
assert.match(sheet, /formatUpcomingMilestoneCopy/);
assert.doesNotMatch(sheet, /羈絆達 \$\{milestone\.threshold\}/);
ok("growth chronicle uses qualitative upcoming copy");

const map = fs.readFileSync(path.join(repoRoot, "src/ui/mapController.js"), "utf8");
assert.match(map, /formatAffinityDeltaChip/);
ok("map chips use affinity helper");

const settlement = fs.readFileSync(path.join(repoRoot, "src/expedition/expeditionSettlementVoice.js"), "utf8");
assert.match(settlement, /關係更深了一點/);
assert.doesNotMatch(settlement, /羈絆 \+\$\{/);
ok("expedition settlement voice qualitative");

console.log("\nAll qualitative bond presentation cases passed.");
