/**
 * EVO-04 — Formal evolution catalog and stage-aware adapter.
 *
 * 這份測試證明：11 隻正式角色的 Stage 2／3 目錄可以對上現有索引；
 * 鳥／海馬／鹿不能套四足模板；失敗只能退回同一隻 Stage 1。
 * flags 仍當 false，這不是換形 Runtime，也不讀 evolutionLines.js。
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FORMAL_EVOLUTION_COMPANION_IDS,
  FORMAL_EVOLUTION_EXACT_NEXT
} from "../../src/engine/companionFormalEvolutionTransitionEngine.js";
import {
  FORMAL_EVOLUTION_ANIMATION_INDEX_PATH,
  FORMAL_EVOLUTION_INDEX_PATH,
  LIVE_STAGE1_SOURCE,
  inspectFormalEvolutionIndexes,
  isForbiddenMotionTemplate,
  parseStageAwareManifest,
  resolveFormalEvolutionForm,
  resolveFormalEvolutionMotionPlan,
  resolveSameCompanionFallback,
  resolveStageAwareSheet,
  selectLiveAnimationAuthority
} from "../../src/engine/formalEvolutionCatalog.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");
const cases = [];
const INDEX = loadJson(FORMAL_EVOLUTION_INDEX_PATH);
const ANIMATION_INDEX = loadJson(FORMAL_EVOLUTION_ANIMATION_INDEX_PATH);
const CATALOG_SOURCE = readFileSync(
  join(ROOT, "src/engine/formalEvolutionCatalog.js"),
  "utf8"
);
const NEGATIVE_CASES = [
  ["greyshade-cat", "unknown_action", { action: "fly", family: "cardinal" }],
  ["auriowl", "missing_row", { action: "idle", family: "up" }],
  ["sprigfawn", "missing_sheet", { action: "idle", family: "cardinal", emptySheet: true }],
  ["crystalfin-seahorse", "unknown_action", { action: "cast_super", family: "diagonal" }],
  ["blazetail-kit", "missing_row", { action: "walk", family: "side" }],
  ["starstripe-cub", "missing_sheet", { action: "attack", family: "diagonal", emptySheet: true }],
  ["thunder-pup", "unknown_action", { action: "pounce", family: "cardinal" }],
  ["wavecub", "missing_row", { action: "recovery", family: "north" }],
  ["starflame-phoenix", "missing_sheet", { action: "walk", family: "cardinal", emptySheet: true }],
  ["star-foal", "unknown_action", { action: "gallop", family: "diagonal" }],
  ["goldenspark-wyrm", "missing_row", { action: "idle", family: "vertical" }]
];

await runCase("indexes keep flags false and match the formal 11", () => {
  const inspected = inspectFormalEvolutionIndexes(INDEX, ANIMATION_INDEX);
  assertEqual(inspected.ok, true, "indexes ok");
  assertEqual(INDEX.runtimeAuthority, false, "index authority");
  assertEqual(ANIMATION_INDEX.runtimeAuthority, false, "r4 authority");
  assertEqual(ANIMATION_INDEX.runtimeFormSwapReady, false, "r4 swap");
  assertEqual(inspected.runtimeAuthority, false, "adapter authority");
  assertEqual(inspected.runtimeFormSwapReady, false, "adapter swap");
  assertEqual(inspected.liveSource, LIVE_STAGE1_SOURCE, "live stays stage 1");
  assertEqual(inspected.formCount, 22, "22 later forms");
  assertDeepEqual(
    [...inspected.companionIds].sort(),
    [...FORMAL_EVOLUTION_COMPANION_IDS].sort(),
    "roster ids"
  );
  assertDeepEqual(inspected.exactNext, FORMAL_EVOLUTION_EXACT_NEXT, "exact next table");
});

await runCase("catalog does not treat evolutionLines as authority", () => {
  assertEqual(CATALOG_SOURCE.includes("evolutionLines"), false, "no evolutionLines import");
  assertEqual(CATALOG_SOURCE.includes("bondThreshold"), false, "no bondThreshold");
});

await runCase("exact-next lookup rejects skip and unknown ids", () => {
  const skip = resolveFormalEvolutionForm(ANIMATION_INDEX, {
    companionId: "greyshade-cat",
    stageId: "initial_awakened",
    targetStage: "final_awakened"
  });
  assertEqual(skip.reason, "exact_next_stage_only", "no skip");
  const carrier = resolveFormalEvolutionForm(ANIMATION_INDEX, {
    companionId: "flame-flicker",
    stageId: "resonant_mature"
  });
  assertEqual(carrier.reason, "not_formal_evolution_companion", "test carrier");
  const roadmap = resolveFormalEvolutionForm(ANIMATION_INDEX, {
    companionId: "star-energy-boarlet",
    stageId: "resonant_mature"
  });
  assertEqual(roadmap.reason, "not_formal_evolution_companion", "roadmap id");
});

await runCase("every formal companion has preview-only later forms", () => {
  for (const companionId of FORMAL_EVOLUTION_COMPANION_IDS) {
    const stage1 = resolveFormalEvolutionForm(ANIMATION_INDEX, {
      companionId,
      stageId: "initial_awakened"
    });
    assertEqual(stage1.ok, true, `${companionId} stage1`);
    assertEqual(stage1.formalSheetsSelected, false, `${companionId} stage1 not live r4`);
    assertEqual(stage1.liveSource, LIVE_STAGE1_SOURCE, `${companionId} stage1 live`);

    for (const stageId of ["resonant_mature", "final_awakened"]) {
      const form = resolveFormalEvolutionForm(ANIMATION_INDEX, { companionId, stageId });
      assertEqual(form.ok, true, `${companionId} ${stageId}`);
      assertEqual(form.catalogForm.characterId, companionId, `${companionId} owns ${stageId}`);
      assertEqual(form.formalSheetsSelected, false, `${companionId} ${stageId} preview only`);
      assertEqual(form.liveSource, LIVE_STAGE1_SOURCE, `${companionId} ${stageId} live stage1`);
      assertEqual(
        form.catalogForm.manifest.includes(`/${companionId}/`),
        true,
        `${companionId} ${stageId} path`
      );
    }
  }
});

await runCase("live authority never selects R4 even if flags are forged true", () => {
  const forged = {
    ...ANIMATION_INDEX,
    runtimeAuthority: true,
    runtimeFormSwapReady: true
  };
  const live = selectLiveAnimationAuthority(forged, { requestedStage: "resonant_mature" });
  assertEqual(live.formalSheetsSelected, false, "forged flags still preview");
  assertEqual(live.liveSource, LIVE_STAGE1_SOURCE, "forged flags still stage1");
});

await runCase("bird seahorse and deer refuse quadruped templates", () => {
  const owl = resolveFormalEvolutionMotionPlan({
    companionId: "auriowl",
    stageId: "resonant_mature",
    rigFamily: "grounded-avian"
  });
  const seahorse = resolveFormalEvolutionMotionPlan({
    companionId: "crystalfin-seahorse",
    stageId: "resonant_mature",
    rigFamily: "upright-aquatic-hover"
  });
  const deer = resolveFormalEvolutionMotionPlan({
    companionId: "sprigfawn",
    stageId: "resonant_mature",
    rigFamily: "quadruped-cervid"
  });
  const phoenix = resolveFormalEvolutionMotionPlan({
    companionId: "starflame-phoenix",
    stageId: "final_awakened",
    rigFamily: "upright-avian-wing-arms"
  });
  assertEqual(owl.family, "avian", "owl family");
  assertEqual(seahorse.family, "aquatic-hover", "seahorse family");
  assertEqual(deer.family, "cervid", "deer family");
  assertEqual(phoenix.family, "avian", "phoenix family");
  assertEqual(isForbiddenMotionTemplate(owl, "quadruped-walk"), true, "owl no quadruped walk");
  assertEqual(isForbiddenMotionTemplate(owl, "mammal-hug"), true, "owl no mammal hug");
  assertEqual(isForbiddenMotionTemplate(seahorse, "quadruped-walk"), true, "seahorse no walk");
  assertEqual(isForbiddenMotionTemplate(seahorse, "haunch-sit"), true, "seahorse no haunch sit");
  assertEqual(isForbiddenMotionTemplate(deer, "canine-sit"), true, "deer no dog sit");
  assertEqual(isForbiddenMotionTemplate(deer, "paw-groom"), true, "deer no paw groom");
});

await runCase("row-aware parse keeps companion identity and 4x4 rows", () => {
  const owlManifest = loadJson(
    "assets/characters/auriowl/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  );
  const parsed = parseStageAwareManifest(owlManifest, { companionId: "auriowl" });
  assertEqual(parsed.ok, true, "owl manifest");
  assertEqual(parsed.cardinalRows.length, 4, "cardinal rows");
  assertEqual(parsed.diagonalRows.length, 4, "diagonal rows");
  assertEqual(parsed.formalSheetsSelected, false, "parse is not live");
  assertEqual(owlManifest.runtimeAuthority, false, "owl flag authority");
  assertEqual(owlManifest.runtimeFormSwapReady, false, "owl flag swap");

  const stolen = parseStageAwareManifest(owlManifest, { companionId: "greyshade-cat" });
  assertEqual(stolen.ok, false, "cannot parse owl as cat");
  assertEqual(stolen.reason, "cross_companion_sheet_forbidden", "stolen manifest");
});

await runCase("same-companion fallback never returns another roster sheet", () => {
  const owlManifest = loadJson(
    "assets/characters/auriowl/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  );
  const seahorseManifest = loadJson(
    "assets/characters/crystalfin-seahorse/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  );
  const fallback = resolveSameCompanionFallback({
    companionId: "greyshade-cat",
    failedManifest: owlManifest
  });
  assertEqual(fallback.ok, true, "fallback ok");
  assertEqual(fallback.companionId, "greyshade-cat", "input id");
  assertEqual(fallback.fallbackCompanionId, "greyshade-cat", "output id");
  assertEqual(fallback.sheet, null, "no foreign sheet");
  assertEqual(fallback.liveSource, LIVE_STAGE1_SOURCE, "stage1 fallback");

  const seahorseFallback = resolveSameCompanionFallback({
    companionId: "crystalfin-seahorse",
    failedManifest: owlManifest
  });
  assertEqual(seahorseFallback.fallbackCompanionId, "crystalfin-seahorse", "seahorse stays seahorse");
  assertEqual(
    JSON.stringify(seahorseFallback).includes("auriowl"),
    false,
    "owl id does not leak into seahorse fallback"
  );
  assertEqual(seahorseManifest.characterId, "crystalfin-seahorse", "seahorse manifest owner");
});

await runCase("eleven negative sheet cases stay on the same companion", () => {
  for (const [companionId, expectedReason, request] of NEGATIVE_CASES) {
    const manifest = loadJson(
      `assets/characters/${companionId}/formal-stages/resonant_mature/animation-r3/animation-manifest.json`
    );
    const mutated = JSON.parse(JSON.stringify(manifest));
    if (request.emptySheet) {
      mutated.actions[request.action][request.family] = "";
    }
    const resolved = resolveStageAwareSheet(mutated, {
      companionId,
      action: request.action,
      family: request.family
    });
    assertEqual(resolved.ok, true, `${companionId} fallback ok`);
    assertEqual(resolved.reason, expectedReason, `${companionId} reason`);
    assertEqual(resolved.companionId, companionId, `${companionId} input`);
    assertEqual(resolved.fallbackCompanionId, companionId, `${companionId} output`);
    assertEqual(resolved.formalSheetsSelected, false, `${companionId} not live`);
    assertEqual(resolved.liveSource, LIVE_STAGE1_SOURCE, `${companionId} stage1`);
  }
});

await runCase("tampered paths and mismatched bodies fail closed or stay same-companion", () => {
  const stolenIndex = JSON.parse(JSON.stringify(ANIMATION_INDEX));
  const catForm = stolenIndex.forms.find((form) => (
    form.characterId === "greyshade-cat" && form.stageId === "resonant_mature"
  ));
  catForm.manifest = "assets/characters/auriowl/formal-stages/resonant_mature/animation-r3/animation-manifest.json";
  const stolenForm = resolveFormalEvolutionForm(stolenIndex, {
    companionId: "greyshade-cat",
    stageId: "resonant_mature"
  });
  assertEqual(stolenForm.ok, false, "stolen path rejected");
  assertEqual(stolenForm.reason, "cross_companion_sheet_forbidden", "stolen path reason");
  assertEqual(stolenForm.formalSheetsSelected, false, "stolen path not live");

  const owl = resolveFormalEvolutionMotionPlan({
    companionId: "auriowl",
    rigFamily: "quadruped-feline"
  });
  assertEqual(owl.ok, false, "owl cannot wear feline rig");
  assertEqual(owl.reason, "rig_family_mismatch", "owl rig mismatch");

  const owlManifest = loadJson(
    "assets/characters/auriowl/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  );
  const truncated = JSON.parse(JSON.stringify(owlManifest));
  truncated.directions.cardinalRows = ["south"];
  const missingRows = resolveStageAwareSheet(truncated, {
    companionId: "auriowl",
    action: "idle",
    family: "cardinal"
  });
  assertEqual(missingRows.ok, true, "truncated rows still fallback");
  assertEqual(missingRows.reason, "missing_row", "truncated rows reason");
  assertEqual(missingRows.fallbackCompanionId, "auriowl", "truncated rows stay owl");

  const catManifest = loadJson(
    "assets/characters/greyshade-cat/formal-stages/resonant_mature/animation-r3/animation-manifest.json"
  );
  const swappedSheet = JSON.parse(JSON.stringify(catManifest));
  swappedSheet.actions.idle.cardinal = "idle/auriowl_resonant_mature_idle_cardinal_4x4_r3.png";
  const swapped = resolveStageAwareSheet(swappedSheet, {
    companionId: "greyshade-cat",
    action: "idle",
    family: "cardinal"
  });
  assertEqual(swapped.ok, true, "foreign filename fallback");
  assertEqual(swapped.reason, "cross_companion_sheet_forbidden", "foreign filename reason");
  assertEqual(swapped.fallbackCompanionId, "greyshade-cat", "foreign filename stays cat");
  assertEqual(swapped.sheet == null, true, "foreign filename not kept");
});

report();

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(ROOT, relativePath), "utf8"));
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nevo-04 formal evolution catalog: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
