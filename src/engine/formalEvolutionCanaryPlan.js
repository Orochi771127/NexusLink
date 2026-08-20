import {
  FORMAL_EVOLUTION_ANIMATION_INDEX_PATH,
  LIVE_STAGE1_SOURCE,
  resolveFormalEvolutionForm,
  resolveSameCompanionFallback,
  resolveStageAwareSheet,
  selectLiveAnimationAuthority
} from "./formalEvolutionCatalog.js";
import { FORMAL_EVOLUTION_COMPANION_ID_SET } from "./companionFormalEvolutionTransitionEngine.js";

/**
 * EVO-05 — 灰影貓 canary 呈現計畫（純函式）。
 *
 * 這份模組只回答三件事：
 * 1. 現在能不能「試播」下一階的身體（不是正式換形）。
 * 2. 若要試，開場只該載哪一張 sheet。
 * 3. 失敗時退回同一隻夥伴的 Stage 1，而且絕對不能改存檔裡的階段。
 *
 * 它不載圖、不碰 Pixi、不寫 localStorage、不把兩個 runtime 旗標改成 true。
 */

export const EVO05_ENABLED_CANARY_IDS = Object.freeze(["greyshade-cat"]);
export const FORMAL_EVOLUTION_PRESENTATION_REFRESH_EVENT = "FORMAL_EVOLUTION_PRESENTATION_REFRESH";
export const CANARY_PRESENTATION_MODE = "canary-attempt";
export const CANARY_BOOT_ANIMATION_NAME = "idle_calm";
export const CANARY_SHEET_FAMILY = "cardinal";
export const CANARY_DIRECTION_ROW = "south";

const ENABLED_CANARY_SET = new Set(EVO05_ENABLED_CANARY_IDS);
const CANARY_STAGES = Object.freeze(["resonant_mature", "final_awakened"]);
const CANARY_STAGE_SET = new Set(CANARY_STAGES);

// 開場只需要 idle。其他名字對到同一張 cardinal／south 列，讓走路／觸碰
// 之後才 lazy load，不會一次把 176 張都抓進來。
const SEMANTIC_ACTION_ALIASES = Object.freeze({
  idle_calm: "idle",
  idle_happy: "idle",
  idle_sad: "idle",
  idle_anxious: "idle",
  sleep: "idle",
  left_walk: "walk",
  right_walk: "walk",
  front_walk: "walk",
  back_walk: "walk",
  attack_basic: "attack",
  skill_cast: "attack",
  hit: "recovery",
  faint: "recovery",
  defeated: "recovery"
});

export function isEvo05CanaryCompanion(companionId) {
  return ENABLED_CANARY_SET.has(companionId);
}

export function mapSemanticAnimationToFormalSheet(animationName = "idle_calm") {
  const name = String(animationName || "idle_calm");
  const action = SEMANTIC_ACTION_ALIASES[name] || (
    name.includes("walk") ? "walk"
      : name.includes("attack") || name.includes("skill") ? "attack"
        : name.includes("hit") || name.includes("faint") || name.includes("defeat") ? "recovery"
          : "idle"
  );
  return Object.freeze({
    animationName: name,
    action,
    family: CANARY_SHEET_FAMILY,
    row: CANARY_DIRECTION_ROW,
    rowIndex: 0,
    framesPerDirection: 4
  });
}

export function planFormalEvolutionCanaryAttempt({
  companionId,
  savedStage,
  animationIndex = null
} = {}) {
  const live = selectLiveAnimationAuthority(animationIndex, { requestedStage: savedStage });
  const emptyMutation = null;

  if (!FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId)) {
    return frozenPlan({
      attemptFormal: false,
      companionId,
      savedStage: savedStage || null,
      reason: "not_formal_evolution_companion",
      liveSource: LIVE_STAGE1_SOURCE,
      presentationMode: LIVE_STAGE1_SOURCE,
      retryable: false,
      canarySheetsAttempted: false,
      formalSheetsSelectedAsLiveAuthority: false,
      growthMutation: emptyMutation,
      catalogForm: null
    });
  }

  if (!isEvo05CanaryCompanion(companionId)) {
    return frozenPlan({
      attemptFormal: false,
      companionId,
      savedStage: savedStage || null,
      reason: "not_enabled_canary",
      liveSource: live.liveSource,
      presentationMode: LIVE_STAGE1_SOURCE,
      retryable: false,
      canarySheetsAttempted: false,
      formalSheetsSelectedAsLiveAuthority: false,
      growthMutation: emptyMutation,
      catalogForm: null
    });
  }

  if (!CANARY_STAGE_SET.has(savedStage)) {
    return frozenPlan({
      attemptFormal: false,
      companionId,
      savedStage: savedStage || null,
      reason: "stage_not_evolved",
      liveSource: LIVE_STAGE1_SOURCE,
      presentationMode: LIVE_STAGE1_SOURCE,
      retryable: false,
      canarySheetsAttempted: false,
      formalSheetsSelectedAsLiveAuthority: false,
      growthMutation: emptyMutation,
      catalogForm: null
    });
  }

  if (!animationIndex || typeof animationIndex !== "object") {
    return frozenPlan({
      attemptFormal: false,
      companionId,
      savedStage,
      reason: "missing_catalog_index",
      liveSource: LIVE_STAGE1_SOURCE,
      presentationMode: LIVE_STAGE1_SOURCE,
      retryable: true,
      canarySheetsAttempted: false,
      formalSheetsSelectedAsLiveAuthority: false,
      growthMutation: emptyMutation,
      catalogForm: null
    });
  }

  const form = resolveFormalEvolutionForm(animationIndex, {
    companionId,
    stageId: savedStage
  });
  if (!form.ok || !form.catalogForm) {
    const fallback = resolveSameCompanionFallback({
      companionId,
      reason: form.reason || "missing_catalog_form"
    });
    return frozenPlan({
      attemptFormal: false,
      companionId,
      savedStage,
      reason: fallback.reason,
      liveSource: LIVE_STAGE1_SOURCE,
      presentationMode: LIVE_STAGE1_SOURCE,
      retryable: true,
      canarySheetsAttempted: false,
      formalSheetsSelectedAsLiveAuthority: false,
      growthMutation: emptyMutation,
      catalogForm: null,
      fallbackCompanionId: fallback.fallbackCompanionId
    });
  }

  return frozenPlan({
    attemptFormal: true,
    companionId,
    savedStage,
    reason: "canary_attempt_allowed",
    liveSource: LIVE_STAGE1_SOURCE,
    presentationMode: CANARY_PRESENTATION_MODE,
    retryable: true,
    canarySheetsAttempted: true,
    formalSheetsSelectedAsLiveAuthority: false,
    runtimeAuthority: false,
    runtimeFormSwapReady: false,
    growthMutation: emptyMutation,
    catalogForm: form.catalogForm,
    fallbackCompanionId: companionId,
    animationIndexPath: FORMAL_EVOLUTION_ANIMATION_INDEX_PATH
  });
}

export function buildFormalCanaryLoadPlan({
  companionId,
  savedStage,
  animationIndex = null,
  manifest = null,
  manifestPath = null
} = {}) {
  const attempt = planFormalEvolutionCanaryAttempt({
    companionId,
    savedStage,
    animationIndex
  });
  if (!attempt.attemptFormal) {
    return frozenPlan({
      ok: false,
      ...attempt,
      metadata: null,
      bootAnimationNames: [CANARY_BOOT_ANIMATION_NAME],
      uniqueSheetCount: 0,
      uniqueSheets: []
    });
  }

  const resolvedManifestPath = manifestPath || attempt.catalogForm?.manifest;
  const metadata = {};
  const uniqueSheets = [];

  for (const animationName of Object.keys(SEMANTIC_ACTION_ALIASES)) {
    const mapping = mapSemanticAnimationToFormalSheet(animationName);
    const sheet = resolveStageAwareSheet(manifest, {
      companionId,
      action: mapping.action,
      family: mapping.family
    });
    if (!sheet.ok || !sheet.relativeSheet) {
      const failedReason = sheet.reason || "missing_sheet";
      // 開場 idle 缺圖、或任何一張被換成別隻的身體，整包都失敗。
      // 其他動作只是還沒準備好，可以省略，之後仍走同一隻 idle。
      const failWholePlan = animationName === CANARY_BOOT_ANIMATION_NAME
        || failedReason === "cross_companion_sheet_forbidden";
      if (failWholePlan) {
        const fallback = resolveSameCompanionFallback({
          companionId,
          failedManifest: manifest,
          reason: failedReason
        });
        return frozenPlan({
          ok: false,
          attemptFormal: false,
          companionId,
          savedStage,
          reason: fallback.reason,
          liveSource: LIVE_STAGE1_SOURCE,
          presentationMode: LIVE_STAGE1_SOURCE,
          retryable: true,
          canarySheetsAttempted: true,
          formalSheetsSelectedAsLiveAuthority: false,
          runtimeAuthority: false,
          runtimeFormSwapReady: false,
          growthMutation: null,
          fallbackCompanionId: fallback.fallbackCompanionId,
          metadata: null,
          bootAnimationNames: [CANARY_BOOT_ANIMATION_NAME],
          uniqueSheetCount: 0,
          uniqueSheets: [],
          bootSheetCount: 0
        });
      }
      continue;
    }

    const sheetUrl = joinFormalManifestSheetPath(resolvedManifestPath, sheet.relativeSheet);
    if (!uniqueSheets.includes(sheetUrl)) uniqueSheets.push(sheetUrl);
    metadata[animationName] = {
      sheet: toRuntimeAssetUrl(sheetUrl),
      frameWidth: 512,
      frameHeight: 512,
      columns: 4,
      rows: 4,
      frameCount: mapping.framesPerDirection,
      fps: mapping.action === "idle" ? 6 : 8,
      loop: mapping.action === "idle" || mapping.action === "walk",
      anchor: { x: 0.5, y: 1 }
    };
  }

  const bootAnimationNames = [CANARY_BOOT_ANIMATION_NAME];
  const bootSheets = bootAnimationNames
    .map((name) => metadata[name]?.sheet)
    .filter(Boolean);
  return frozenPlan({
    ok: true,
    ...attempt,
    reason: "canary_load_plan_ready",
    manifestPath: resolvedManifestPath,
    metadata,
    bootAnimationNames,
    uniqueSheetCount: uniqueSheets.length,
    uniqueSheets,
    bootSheetCount: new Set(bootSheets).size
  });
}

export async function prepareFormalEvolutionCanaryLoad({
  companionId,
  savedStage,
  animationIndex = null,
  fetchJson = null
} = {}) {
  const earlyAttempt = planFormalEvolutionCanaryAttempt({
    companionId,
    savedStage,
    animationIndex: isEvo05CanaryCompanion(companionId) ? animationIndex : null
  });
  if (!earlyAttempt.attemptFormal && earlyAttempt.reason !== "missing_catalog_index") {
    return {
      ...recordCanaryLoadOutcome({
        companionId,
        savedStage,
        ok: false,
        reason: earlyAttempt.reason
      }),
      pack: null,
      plan: earlyAttempt,
      loadPlan: null
    };
  }

  if (typeof fetchJson !== "function") {
    return {
      ...recordCanaryLoadOutcome({
        companionId,
        savedStage,
        ok: false,
        reason: "missing_catalog_index"
      }),
      pack: null,
      plan: earlyAttempt,
      loadPlan: null
    };
  }

  try {
    const index = animationIndex || await fetchJson(toRuntimeAssetUrl(FORMAL_EVOLUTION_ANIMATION_INDEX_PATH));
    const attempt = planFormalEvolutionCanaryAttempt({
      companionId,
      savedStage,
      animationIndex: index
    });
    if (!attempt.attemptFormal) {
      return {
        ...recordCanaryLoadOutcome({
          companionId,
          savedStage,
          ok: false,
          reason: attempt.reason
        }),
        pack: null,
        plan: attempt,
        loadPlan: null
      };
    }

    const manifest = await fetchJson(toRuntimeAssetUrl(attempt.catalogForm.manifest));
    const loadPlan = buildFormalCanaryLoadPlan({
      companionId,
      savedStage,
      animationIndex: index,
      manifest,
      manifestPath: attempt.catalogForm.manifest
    });
    if (!loadPlan.ok) {
      return {
        ...recordCanaryLoadOutcome({
          companionId,
          savedStage,
          ok: false,
          reason: loadPlan.reason
        }),
        pack: null,
        plan: loadPlan,
        loadPlan
      };
    }

    return {
      ...recordCanaryLoadOutcome({
        companionId,
        savedStage,
        ok: true,
        reason: "canary_load_plan_ready"
      }),
      pack: null,
      plan: attempt,
      loadPlan
    };
  } catch {
    return {
      ...recordCanaryLoadOutcome({
        companionId,
        savedStage,
        ok: false,
        reason: "canary_load_failed"
      }),
      pack: null,
      plan: earlyAttempt,
      loadPlan: null
    };
  }
}

export function stampCanaryFallbackPresentation({
  companionId,
  savedStage
} = {}) {
  return frozenPlan({
    companionId: companionId || null,
    savedStage: savedStage || null,
    presentationMode: LIVE_STAGE1_SOURCE,
    retryable: true,
    usedFallback: true,
    growthMutation: null,
    runtimeAuthority: false,
    runtimeFormSwapReady: false
  });
}

export function recordCanaryLoadOutcome({
  companionId,
  savedStage,
  ok,
  reason = null
} = {}) {
  const fallback = resolveSameCompanionFallback({
    companionId,
    reason: ok ? "canary_presentation_ready" : (reason || "canary_load_failed")
  });
  return frozenPlan({
    ok: ok === true,
    companionId,
    savedStage: savedStage || null,
    reason: fallback.reason,
    usedFallback: ok !== true,
    retryable: true,
    liveSource: LIVE_STAGE1_SOURCE,
    presentationMode: ok === true ? CANARY_PRESENTATION_MODE : LIVE_STAGE1_SOURCE,
    fallbackCompanionId: fallback.fallbackCompanionId,
    growthMutation: null,
    runtimeAuthority: false,
    runtimeFormSwapReady: false,
    formalSheetsSelectedAsLiveAuthority: false
  });
}

export function shouldRefreshFormalEvolutionPresentation(commitResult) {
  return commitResult?.ok === true
    && commitResult?.accepted === true
    && commitResult?.published === true
    && commitResult?.changed === true
    && Boolean(commitResult.companionId);
}

export function joinFormalManifestSheetPath(manifestPath, relativeSheet) {
  const manifest = String(manifestPath || "").replace(/\\/g, "/").replace(/^\.\//, "");
  const sheet = String(relativeSheet || "").replace(/\\/g, "/").replace(/^\.\//, "");
  const directory = manifest.replace(/\/[^/]+$/, "");
  if (!directory || !sheet) return sheet;
  return `${directory}/${sheet}`;
}

export function toRuntimeAssetUrl(path) {
  const normalized = String(path || "").replace(/\\/g, "/").replace(/^\.\//, "");
  return normalized ? `./${normalized}` : "";
}

function frozenPlan(value) {
  return Object.freeze(JSON.parse(JSON.stringify(value)));
}
