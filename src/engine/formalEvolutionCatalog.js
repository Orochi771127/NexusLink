import {
  FORMAL_EVOLUTION_COMPANION_IDS,
  FORMAL_EVOLUTION_COMPANION_ID_SET,
  FORMAL_EVOLUTION_EXACT_NEXT
} from "./companionFormalEvolutionTransitionEngine.js";

/**
 * 正式進化目錄與對照（EVO-04）。
 *
 * 這份模組只回答三件事：
 * 1. 這 11 隻正式角色，下一階的美術包在哪裡。
 * 2. 那一包該用哪種身體語言，不能把鳥／海馬／鹿當成四足。
 * 3. 播不了的時候，只能退回同一隻的 Stage 1，不能變成另一隻。
 *
 * 它不改存檔、不載圖、不碰 Pixi。兩個 runtime 旗標在這包一律當 false：
 * 查得到路徑，不代表現在可以換形。
 */

export const FORMAL_EVOLUTION_INDEX_PATH = "assets/characters/formal-evolution-index.json";
export const FORMAL_EVOLUTION_ANIMATION_INDEX_PATH = "assets/characters/formal-evolution-animation-r4.json";
export const FORMAL_STAGE_IDS = Object.freeze([
  "initial_awakened",
  "resonant_mature",
  "final_awakened"
]);
export const FORMAL_SHEET_FAMILIES = Object.freeze(["cardinal", "diagonal"]);
export const FORMAL_SHEET_ACTIONS = Object.freeze(["idle", "walk", "attack", "recovery"]);
export const LIVE_STAGE1_SOURCE = "stage1-illustrated-runtime";

// 建議名單只是備註。EVO-05 實際啟用的 canary 在 formalEvolutionCanaryPlan.js，
// 目前只有灰影貓。金羽小梟有 Owner Lock，不要當第一隻。
export const FORMAL_EVOLUTION_CANARY_CANDIDATES = Object.freeze([
  "greyshade-cat",
  "auriowl",
  "crystalfin-seahorse"
]);

const STAGE_SET = new Set(FORMAL_STAGE_IDS);
const SHEET_FAMILY_SET = new Set(FORMAL_SHEET_FAMILIES);
const SHEET_ACTION_SET = new Set(FORMAL_SHEET_ACTIONS);
const R4_FORM_STAGES = Object.freeze(["resonant_mature", "final_awakened"]);
const COMPANION_ALLOWED_RIGS = Object.freeze({
  "greyshade-cat": Object.freeze(["quadruped-feline"]),
  auriowl: Object.freeze(["grounded-avian", "upright-wing-arm-avian"]),
  sprigfawn: Object.freeze(["quadruped-cervid", "upright-cervid"]),
  "crystalfin-seahorse": Object.freeze(["upright-aquatic-hover", "horizontal-aquatic-hover"]),
  "blazetail-kit": Object.freeze(["upright-vulpine-robed", "upright-vulpine"]),
  "starstripe-cub": Object.freeze(["quadruped-feline", "upright-feline"]),
  "thunder-pup": Object.freeze(["quadruped-canine", "upright-canine"]),
  wavecub: Object.freeze(["quadruped-feline", "upright-feline"]),
  "starflame-phoenix": Object.freeze(["grounded-avian", "upright-avian-wing-arms"]),
  "star-foal": Object.freeze(["quadruped-equine"]),
  "goldenspark-wyrm": Object.freeze(["quadruped-wingless-saurian", "upright-wingless-saurian"])
});

const MOTION_PLANS = Object.freeze({
  "grounded-avian": motionPlan("avian", "talons-or-hop", [
    "quadruped-walk",
    "mammal-hug",
    "fingered-wing-arms"
  ]),
  "upright-wing-arm-avian": motionPlan("avian", "talons-or-hop", [
    "quadruped-walk",
    "mammal-hug",
    "fingered-wing-arms"
  ]),
  "upright-avian-wing-arms": motionPlan("avian", "talons-or-hop", [
    "quadruped-walk",
    "mammal-hug",
    "fingered-wing-arms"
  ]),
  "upright-aquatic-hover": motionPlan("aquatic-hover", "hover-datum", [
    "quadruped-walk",
    "feet",
    "floor-impact",
    "haunch-sit"
  ]),
  "horizontal-aquatic-hover": motionPlan("aquatic-hover", "hover-datum", [
    "quadruped-walk",
    "feet",
    "floor-impact",
    "haunch-sit"
  ]),
  "quadruped-cervid": motionPlan("cervid", "hooves", [
    "canine-sit",
    "paw-groom",
    "feline-pounce"
  ]),
  "upright-cervid": motionPlan("cervid", "hooves", [
    "canine-sit",
    "paw-groom",
    "feline-pounce"
  ]),
  "quadruped-vulpine": motionPlan("vulpine", "four-paws", ["generic-wolf-heaviness"]),
  "upright-vulpine": motionPlan("vulpine", "four-paws", ["generic-wolf-heaviness"]),
  "upright-vulpine-robed": motionPlan("vulpine", "four-paws", ["generic-wolf-heaviness"]),
  "quadruped-feline": motionPlan("feline", "four-paws", ["fox-bounce", "canine-pant"]),
  "upright-feline": motionPlan("feline", "four-paws", ["fox-bounce", "canine-pant"]),
  "quadruped-canine": motionPlan("canine", "four-paws", ["happy-dog-pant", "feline-pounce"]),
  "upright-canine": motionPlan("canine", "four-paws", ["happy-dog-pant", "feline-pounce"]),
  "quadruped-equine": motionPlan("equine", "hooves", ["paw-gait", "feline-crouch", "cervid-bound"]),
  "quadruped-wingless-saurian": motionPlan("saurian", "four-feet", [
    "mammal-cub-bounce",
    "wing-flight"
  ]),
  "upright-wingless-saurian": motionPlan("saurian", "four-feet", [
    "mammal-cub-bounce",
    "wing-flight"
  ])
});

export function inspectFormalEvolutionIndexes(index = null, animationIndex = null) {
  const indexFlags = inspectFlags(index, { requireFormSwap: false });
  const animationFlags = inspectFlags(animationIndex, { requireFormSwap: true });
  if (!indexFlags.ok) return frozenResult({ ok: false, reason: indexFlags.reason });
  if (!animationFlags.ok) return frozenResult({ ok: false, reason: animationFlags.reason });

  const roster = listIndexCompanionIds(index);
  if (!roster.ok) return frozenResult({ ok: false, reason: roster.reason });
  const forms = listAnimationForms(animationIndex);
  if (!forms.ok) return frozenResult({ ok: false, reason: forms.reason });

  return frozenResult({
    ok: true,
    reason: "catalog_ready",
    companionIds: roster.companionIds,
    formCount: forms.forms.length,
    runtimeAuthority: false,
    runtimeFormSwapReady: false,
    liveSource: LIVE_STAGE1_SOURCE,
    exactNext: { ...FORMAL_EVOLUTION_EXACT_NEXT }
  });
}

export function resolveFormalEvolutionForm(animationIndex = null, input = {}) {
  const companionId = input.companionId;
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return frozenResult({ ok: false, reason: "not_formal_evolution_companion", companionId });
  }
  const stageId = input.stageId;
  if (!STAGE_SET.has(stageId)) {
    return frozenResult({ ok: false, reason: "unknown_stage", companionId });
  }
  if (input.targetStage && FORMAL_EVOLUTION_EXACT_NEXT[stageId] !== input.targetStage) {
    return frozenResult({
      ok: false,
      reason: "exact_next_stage_only",
      companionId,
      stageId
    });
  }

  const live = selectLiveAnimationAuthority(animationIndex, { requestedStage: stageId });
  if (stageId === "initial_awakened") {
    return frozenResult({
      ok: true,
      reason: "stage1_live_runtime",
      companionId,
      stageId,
      catalogForm: null,
      liveSource: LIVE_STAGE1_SOURCE,
      formalSheetsSelected: false
    });
  }

  const form = findAnimationForm(animationIndex, companionId, stageId);
  if (!form) {
    return frozenResult({
      ok: false,
      reason: "missing_catalog_form",
      companionId,
      stageId,
      liveSource: LIVE_STAGE1_SOURCE,
      formalSheetsSelected: false
    });
  }
  if (form.characterId !== companionId || !assetBelongsToCompanion(form.manifest, companionId)) {
    return frozenResult({
      ok: false,
      reason: "cross_companion_sheet_forbidden",
      companionId,
      stageId,
      liveSource: LIVE_STAGE1_SOURCE,
      formalSheetsSelected: false
    });
  }

  const motionPlan = resolveFormalEvolutionMotionPlan({
    companionId,
    stageId,
    rigFamily: form.rigFamily
  });
  if (!motionPlan.ok) {
    return frozenResult({
      ok: false,
      reason: motionPlan.reason,
      companionId,
      stageId,
      liveSource: LIVE_STAGE1_SOURCE,
      formalSheetsSelected: false
    });
  }

  return frozenResult({
    ok: true,
    reason: "catalog_preview_only",
    companionId,
    stageId,
    catalogForm: cloneJson(form),
    liveSource: live.liveSource,
    formalSheetsSelected: false,
    motionPlan
  });
}

export function selectLiveAnimationAuthority(_animationIndex = null, input = {}) {
  const requestedStage = STAGE_SET.has(input.requestedStage)
    ? input.requestedStage
    : "initial_awakened";
  // EVO-04 查得到 Stage 2／3 路徑，但 live 一律停在 Stage 1。
  // 就算索引被誤改成 true，這包也不能自己升格。
  return frozenResult({
    ok: true,
    reason: "evo04_never_selects_formal_sheets",
    requestedStage,
    liveSource: LIVE_STAGE1_SOURCE,
    formalSheetsSelected: false
  });
}

export function resolveSameCompanionFallback(input = {}) {
  const companionId = input.companionId;
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return frozenResult({ ok: false, reason: "not_formal_evolution_companion", companionId });
  }
  const failedManifest = input.failedManifest && typeof input.failedManifest === "object"
    ? input.failedManifest
    : null;
  if (failedManifest?.characterId && failedManifest.characterId !== companionId) {
    return frozenResult({
      ok: true,
      reason: "ignored_foreign_manifest",
      companionId,
      fallbackCompanionId: companionId,
      liveSource: LIVE_STAGE1_SOURCE,
      formalSheetsSelected: false,
      sheet: null
    });
  }
  return frozenResult({
    ok: true,
    reason: input.reason || "same_companion_stage1_fallback",
    companionId,
    fallbackCompanionId: companionId,
    liveSource: LIVE_STAGE1_SOURCE,
    formalSheetsSelected: false,
    sheet: null
  });
}

export function parseStageAwareManifest(manifest = null, input = {}) {
  const companionId = input.companionId;
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return frozenResult({ ok: false, reason: "not_formal_evolution_companion", companionId });
  }
  if (!isPlainObject(manifest)) {
    return frozenResult({ ok: false, reason: "invalid_manifest", companionId });
  }
  if (manifest.characterId !== companionId) {
    return frozenResult({
      ok: false,
      reason: "cross_companion_sheet_forbidden",
      companionId,
      liveSource: LIVE_STAGE1_SOURCE
    });
  }
  if (!STAGE_SET.has(manifest.stageId)) {
    return frozenResult({ ok: false, reason: "unknown_stage", companionId });
  }
  const flags = inspectFlags(manifest, { requireFormSwap: true });
  if (!flags.ok) {
    return frozenResult({ ok: false, reason: flags.reason, companionId });
  }

  const cardinalRows = Array.isArray(manifest.directions?.cardinalRows)
    ? manifest.directions.cardinalRows.map(String)
    : [];
  const diagonalRows = Array.isArray(manifest.directions?.diagonalRows)
    ? manifest.directions.diagonalRows.map(String)
    : [];
  if (cardinalRows.length !== 4 || diagonalRows.length !== 4) {
    return frozenResult({
      ok: false,
      reason: "missing_row",
      companionId,
      liveSource: LIVE_STAGE1_SOURCE
    });
  }

  const motionPlan = resolveFormalEvolutionMotionPlan({
    companionId,
    stageId: manifest.stageId,
    rigFamily: manifest.rigFamily
  });
  if (!motionPlan.ok) {
    return frozenResult({
      ok: false,
      reason: motionPlan.reason,
      companionId,
      liveSource: LIVE_STAGE1_SOURCE
    });
  }

  return frozenResult({
    ok: true,
    reason: "stage_aware_manifest",
    companionId,
    stageId: manifest.stageId,
    rigFamily: manifest.rigFamily || null,
    cardinalRows,
    diagonalRows,
    actions: FORMAL_SHEET_ACTIONS.slice(),
    families: FORMAL_SHEET_FAMILIES.slice(),
    liveSource: LIVE_STAGE1_SOURCE,
    formalSheetsSelected: false,
    motionPlan
  });
}

export function resolveStageAwareSheet(manifest = null, input = {}) {
  const companionId = input.companionId;
  const parsed = parseStageAwareManifest(manifest, input);
  if (!parsed.ok) {
    if (parsed.reason === "not_formal_evolution_companion") return parsed;
    return resolveSameCompanionFallback({
      companionId,
      failedManifest: manifest,
      reason: parsed.reason
    });
  }
  const action = input.action;
  const family = input.family;
  if (!SHEET_ACTION_SET.has(action)) {
    return resolveSameCompanionFallback({
      companionId,
      failedManifest: manifest,
      reason: "unknown_action"
    });
  }
  if (!SHEET_FAMILY_SET.has(family)) {
    return resolveSameCompanionFallback({
      companionId,
      failedManifest: manifest,
      reason: "missing_row"
    });
  }
  const relativeSheet = manifest?.actions?.[action]?.[family];
  if (typeof relativeSheet !== "string" || !relativeSheet.trim()) {
    return resolveSameCompanionFallback({
      companionId,
      failedManifest: manifest,
      reason: "missing_sheet"
    });
  }
  if (!assetBelongsToCompanion(relativeSheet, companionId)) {
    return resolveSameCompanionFallback({
      companionId,
      failedManifest: manifest,
      reason: "cross_companion_sheet_forbidden"
    });
  }
  return frozenResult({
    ok: true,
    reason: "sheet_resolved_preview_only",
    companionId,
    fallbackCompanionId: companionId,
    action,
    family,
    relativeSheet: relativeSheet.replace(/\\/g, "/"),
    liveSource: LIVE_STAGE1_SOURCE,
    formalSheetsSelected: false
  });
}

export function resolveFormalEvolutionMotionPlan(input = {}) {
  const companionId = input.companionId;
  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return frozenResult({ ok: false, reason: "not_formal_evolution_companion", companionId });
  }
  const rigFamily = String(input.rigFamily || "");
  const allowedRigs = COMPANION_ALLOWED_RIGS[companionId];
  if (!allowedRigs?.includes(rigFamily)) {
    return frozenResult({
      ok: false,
      reason: "rig_family_mismatch",
      companionId,
      rigFamily
    });
  }
  const plan = MOTION_PLANS[rigFamily];
  if (!plan) {
    return frozenResult({
      ok: false,
      reason: "unknown_rig_family",
      companionId,
      rigFamily
    });
  }
  return frozenResult({
    ok: true,
    reason: "motion_plan_ready",
    companionId,
    stageId: STAGE_SET.has(input.stageId) ? input.stageId : null,
    rigFamily,
    family: plan.family,
    locomotion: plan.locomotion,
    never: plan.never.slice()
  });
}

export function isForbiddenMotionTemplate(motionPlan, template) {
  if (!motionPlan?.ok || !Array.isArray(motionPlan.never)) return false;
  return motionPlan.never.includes(template);
}

function inspectFlags(source, { requireFormSwap }) {
  if (!isPlainObject(source)) return { ok: false, reason: "invalid_catalog_index" };
  if (source.runtimeAuthority !== false) {
    return { ok: false, reason: "runtime_authority_must_stay_false" };
  }
  if (requireFormSwap && source.runtimeFormSwapReady !== false) {
    return { ok: false, reason: "runtime_form_swap_must_stay_false" };
  }
  return {
    ok: true,
    runtimeAuthority: false,
    runtimeFormSwapReady: requireFormSwap ? false : source.runtimeFormSwapReady === false
      ? false
      : null
  };
}

function listIndexCompanionIds(index) {
  if (!Array.isArray(index?.characters) || index.characters.length !== 11) {
    return { ok: false, reason: "catalog_roster_mismatch" };
  }
  const companionIds = index.characters.map((entry) => entry?.characterId);
  if (companionIds.some((id) => !FORMAL_EVOLUTION_COMPANION_ID_SET.has(id))) {
    return { ok: false, reason: "catalog_contains_non_formal_id" };
  }
  if (new Set(companionIds).size !== 11) {
    return { ok: false, reason: "catalog_roster_mismatch" };
  }
  for (const expectedId of FORMAL_EVOLUTION_COMPANION_IDS) {
    if (!companionIds.includes(expectedId)) {
      return { ok: false, reason: "catalog_roster_mismatch" };
    }
  }
  return { ok: true, companionIds: Object.freeze(companionIds.slice()) };
}

function listAnimationForms(animationIndex) {
  if (!Array.isArray(animationIndex?.forms) || animationIndex.forms.length !== 22) {
    return { ok: false, reason: "animation_form_count_mismatch" };
  }
  const seen = new Set();
  for (const form of animationIndex.forms) {
    if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(form?.characterId)) {
      return { ok: false, reason: "catalog_contains_non_formal_id" };
    }
    if (!R4_FORM_STAGES.includes(form?.stageId)) {
      return { ok: false, reason: "unknown_stage" };
    }
    const key = `${form.characterId}:${form.stageId}`;
    if (seen.has(key)) return { ok: false, reason: "duplicate_catalog_form" };
    seen.add(key);
    if (typeof form.manifest !== "string" || !assetBelongsToCompanion(form.manifest, form.characterId)) {
      return { ok: false, reason: "cross_companion_sheet_forbidden" };
    }
  }
  for (const companionId of FORMAL_EVOLUTION_COMPANION_IDS) {
    for (const stageId of R4_FORM_STAGES) {
      if (!seen.has(`${companionId}:${stageId}`)) {
        return { ok: false, reason: "missing_catalog_form" };
      }
    }
  }
  return { ok: true, forms: animationIndex.forms };
}

function assetBelongsToCompanion(path, companionId) {
  const normalized = String(path || "").replace(/\\/g, "/");
  if (!normalized || !companionId) return false;
  return normalized.split("/").some((part) => (
    part === companionId || part.startsWith(`${companionId}_`)
  ));
}

function findAnimationForm(animationIndex, companionId, stageId) {
  if (!Array.isArray(animationIndex?.forms)) return null;
  return animationIndex.forms.find((form) => (
    form?.characterId === companionId && form?.stageId === stageId
  )) || null;
}

function motionPlan(family, locomotion, never) {
  return Object.freeze({
    family,
    locomotion,
    never: Object.freeze(never.slice())
  });
}

function frozenResult(value) {
  return Object.freeze(cloneJson(value));
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
