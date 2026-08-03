import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  CLAY_RESIN_MATERIAL_FAMILY,
  GAMEPLAY_VISUAL_PROFILE_VERSION,
  getExpeditionGameplayVisualProfile,
  getOrbitGameplayVisualProfile,
  listGameplayVisualProfileIds
} from "../../src/data/gameplayVisualProfiles.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
let passed = 0;

function test(name, fn) {
  fn();
  passed += 1;
  console.log(`PASS ${name}`);
}

async function source(path) {
  return readFile(resolve(ROOT, path), "utf8");
}

test("shared material family is explicit and versioned", () => {
  assert.equal(GAMEPLAY_VISUAL_PROFILE_VERSION, 1);
  assert.equal(CLAY_RESIN_MATERIAL_FAMILY.id, "nexus-clay-resin-miniature-v1");
  assert.equal(CLAY_RESIN_MATERIAL_FAMILY.glossyToyPlastic, false);
  assert.equal(CLAY_RESIN_MATERIAL_FAMILY.companionLayer, "canonical-illustrated-2d");
});

test("orbit and expedition keep distinct profiles inside one material family", () => {
  const orbit = getOrbitGameplayVisualProfile("moonlake");
  const expedition = getExpeditionGameplayVisualProfile("plains_windrest");
  assert.equal(orbit.materialFamilyId, CLAY_RESIN_MATERIAL_FAMILY.id);
  assert.equal(expedition.materialFamilyId, CLAY_RESIN_MATERIAL_FAMILY.id);
  assert.notEqual(orbit.id, expedition.id);
  assert.ok(orbit.arena.rimStoneCount >= 12);
  assert.ok(expedition.pathPolylines.length >= 1);
});

test("unknown regions resolve to safe presentation fallbacks", () => {
  assert.equal(getOrbitGameplayVisualProfile("missing").id, "orbit-moonlake-clay-resin-v1");
  assert.equal(getExpeditionGameplayVisualProfile("missing").id, "expedition-windrest-clay-resin-v1");
});

test("asset slots preserve a future manifest seam without claiming promoted assets", () => {
  for (const profile of [
    getOrbitGameplayVisualProfile("moonlake"),
    getExpeditionGameplayVisualProfile("plains_windrest")
  ]) {
    assert.ok(profile.assetSlots);
    assert.equal(profile.assetSlots.foundation, null);
  }
});

test("profile inventory exposes both gameplay modes", () => {
  const ids = listGameplayVisualProfileIds();
  assert.deepEqual(ids.orbit, ["orbit-moonlake-clay-resin-v1", "orbit-plains-clay-resin-v1"]);
  assert.equal(ids.expedition.length, 3);
});

const [battle, duel, clayRenderer, expeditionScene, expeditionEngine, orbitEngine, css, expeditionCss] = await Promise.all([
  source("src/ui/orbitBattleController.js"),
  source("src/ui/orbitDuelController.js"),
  source("src/ui/orbitClayRenderer.js"),
  source("src/pixi/expeditionScene.js"),
  source("src/expedition/expeditionEngine.js"),
  source("src/orbit/orbitEngine.js"),
  source("styles.css"),
  source("styles/expedition.css")
]);

test("both orbit controllers consume the shared clay renderer", () => {
  assert.match(battle, /drawOrbitClayArena/);
  assert.match(battle, /drawOrbitClayBody/);
  assert.match(duel, /drawOrbitClayArena/);
  assert.match(duel, /drawOrbitClayBody/);
});

test("expedition scene consumes a visual profile while engines stay presentation-blind", () => {
  assert.match(expeditionScene, /getExpeditionGameplayVisualProfile/);
  assert.doesNotMatch(expeditionEngine, /gameplayVisualProfiles/);
  assert.doesNotMatch(orbitEngine, /gameplayVisualProfiles/);
});

test("visual modules do not acquire save, reward, growth, or relationship authority", () => {
  for (const text of [clayRenderer, expeditionScene]) {
    assert.doesNotMatch(text, /saveManager|rewardLedger|Growth|relationshipState|localStorage/);
  }
});

test("mobile controls and reduced-motion treatment remain explicit", () => {
  assert.match(css, /\.orbit-actions \.orbit-btn\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(expeditionCss, /\.expedition-tactics button\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(expeditionCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(expeditionCss, /max-width:\s*420px/);
});

console.log(`gameplay-skin-runtime-r2: ${passed}/9 PASS`);
