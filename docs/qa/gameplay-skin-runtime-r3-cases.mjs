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
  assert.equal(GAMEPLAY_VISUAL_PROFILE_VERSION, 2);
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

test("approved current maps resolve promoted authored foundations", () => {
  const orbit = getOrbitGameplayVisualProfile("moonlake");
  const expedition = getExpeditionGameplayVisualProfile("plains_windrest");
  assert.match(orbit.assetSlots.foundation, /orbit_moonlake_foundation\.png$/);
  assert.match(expedition.assetSlots.foundation, /expedition_windrest_foundation\.png$/);
  assert.equal(getOrbitGameplayVisualProfile("plains").assetSlots.foundation, null);
  assert.equal(getExpeditionGameplayVisualProfile("forge_emberpath").assetSlots.foundation, null);
});

test("profile inventory exposes both gameplay modes", () => {
  const ids = listGameplayVisualProfileIds();
  assert.deepEqual(ids.orbit, ["orbit-moonlake-clay-resin-v1", "orbit-plains-clay-resin-v1"]);
  assert.equal(ids.expedition.length, 3);
});

const [battle, duel, clayRenderer, expeditionScene, expeditionController, expeditionEngine, orbitEngine, css, expeditionCss] = await Promise.all([
  source("src/ui/orbitBattleController.js"),
  source("src/ui/orbitDuelController.js"),
  source("src/ui/orbitClayRenderer.js"),
  source("src/pixi/expeditionScene.js"),
  source("src/ui/expeditionController.js"),
  source("src/expedition/expeditionEngine.js"),
  source("src/orbit/orbitEngine.js"),
  source("styles.css"),
  source("styles/expedition.css")
]);

const foundationCases = [
  ["orbit", getOrbitGameplayVisualProfile("moonlake").assetSlots.foundation, 852, 1846],
  ["expedition", getExpeditionGameplayVisualProfile("plains_windrest").assetSlots.foundation, 853, 1844]
];
const foundationBuffers = await Promise.all(
  foundationCases.map(([, path]) => readFile(resolve(ROOT, path)))
);
foundationCases.forEach(([label, , width, height], index) => {
  test(`${label} foundation is a valid promoted PNG at the declared size`, () => {
    const bytes = foundationBuffers[index];
    assert.deepEqual([...bytes.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
    assert.equal(bytes.readUInt32BE(16), width);
    assert.equal(bytes.readUInt32BE(20), height);
  });
});

test("both orbit controllers consume the shared clay renderer", () => {
  assert.match(battle, /drawOrbitClayArena/);
  assert.match(battle, /drawOrbitClayBody/);
  assert.match(duel, /drawOrbitClayArena/);
  assert.match(duel, /drawOrbitClayBody/);
});

test("orbit authored foundation is lazy and keeps procedural fallback", () => {
  assert.match(clayRenderer, /getFoundationImage/);
  assert.match(clayRenderer, /drawImageCover/);
  assert.match(clayRenderer, /foundationReady/);
  assert.match(clayRenderer, /drawClayMound/);
});

test("expedition scene consumes a visual profile while engines stay presentation-blind", () => {
  assert.match(expeditionScene, /getExpeditionGameplayVisualProfile/);
  assert.doesNotMatch(expeditionEngine, /gameplayVisualProfiles/);
  assert.doesNotMatch(orbitEngine, /gameplayVisualProfiles/);
});

test("expedition authored foundation loads asynchronously and degrades safely", () => {
  assert.match(expeditionScene, /attachFoundationSprite/);
  assert.match(expeditionScene, /procedural_foundation_fallback/);
  assert.match(expeditionScene, /\.catch\(\(\) => null\)/);
});

test("expedition keeps canonical illustrated companions and registered rift art separate", () => {
  assert.match(expeditionScene, /getIllustratedCompanionAssetById/);
  assert.match(expeditionScene, /attachIllustratedCompanion/);
  assert.match(expeditionScene, /getEnemyRiftSilhouettePath/);
  assert.match(expeditionScene, /procedural_body_fallback/);
});

test("player-facing expedition HUD suppresses diagnostics unless debug is explicit", () => {
  assert.match(expeditionController, /dataset\?\.expeditionDebug === "1"/);
  assert.match(expeditionController, /debugEl\.hidden = !debugEnabled/);
  assert.match(expeditionController, /debugEnabled[\s\S]*?target=/);
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

console.log(`gameplay-skin-runtime-r3: ${passed}/15 PASS`);
