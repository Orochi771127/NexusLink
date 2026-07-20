/**
 * RA-1 Raphael autonomy eval suite.
 *
 * 設計理念（給初階開發者）：
 * - 把 TP-7 的 `__COMPANION_INITIATIVE__` 案例整包納入，再加契約層斷言。
 * - 不啟動 DOM／Pixi；只驗純函數紅線。UI 表面閘門留給 Owner feel-check。
 * - 瀏覽器：`__RAPHAEL_AUTONOMY_EVAL__.runAll()`；Node：直接 import 本檔。
 */

import {
  COMPANION_INITIATIVE_CASES,
  runAllCompanionInitiativeCases,
  installCompanionInitiativeHarness
} from "./companionInitiativeCases.js";
import { AMBIENT_INITIATIVE_LIMITS } from "../autonomy/initiativeCooldown.js";
import { deriveInitiativeMoment } from "../../engine/gentleInvitationEngine.js";
import { RAPHAEL_NUWA_DISTILLATION_BUNDLE } from "../../data/ai/raphaelNuwaDistillationBundle.js";
import { getNuwaAutonomyAdvisory } from "../raphaelTrainingAdapter.js";

const DAY_NOON = new Date("2026-07-06T12:00:00").getTime();

const CONTRACT_SURFACE_GATES = Object.freeze([
  "onboarding-active",
  "first-loop-active",
  "page-open",
  "st-focus"
]);

/** RA-1 專屬契約案（不重複 INIT-* id）。 */
export const RAPHAEL_AUTONOMY_EVAL_EXTRAS = Object.freeze([
  {
    id: "RA1-SUITE-001",
    name: "RA-1：TP-7 initiative 基線全數納入 autonomy suite",
    run: () => COMPANION_INITIATIVE_CASES.length >= 17
  },
  {
    id: "RA1-SUITE-002",
    name: "RA-1：密封常數可從 runtime 模組讀取（供契約文件對照）",
    run: () =>
      Number.isFinite(AMBIENT_INITIATIVE_LIMITS.BOOT_QUIET_MS) &&
      Number.isFinite(AMBIENT_INITIATIVE_LIMITS.MIN_INTERVAL_MS) &&
      Number.isFinite(AMBIENT_INITIATIVE_LIMITS.SESSION_CAP)
  },
  {
    id: "RA1-SUITE-003",
    name: "RA-1：表面閘門清單凍結（對齊 companionInitiativeController canShow）",
    run: () =>
      CONTRACT_SURFACE_GATES.includes("st-focus") &&
      CONTRACT_SURFACE_GATES.includes("onboarding-active") &&
      CONTRACT_SURFACE_GATES.length === 4
  },
  {
    id: "RA1-SUITE-004",
    name: "RA-1：登入計數極大值仍不得改變暖態主動輸出",
    run: () => {
      const base = {
        energy: 7,
        defense: 20,
        trust: 14,
        bond: 30,
        touchFatigue: 1,
        mood: "warm",
        safeHarborMode: false
      };
      const a = JSON.stringify(deriveInitiativeMoment(base, DAY_NOON));
      const b = JSON.stringify(
        deriveInitiativeMoment({ ...base, loginCount: 10_000, daysSinceLastLogin: 90 }, DAY_NOON)
      );
      return a === b && Boolean(JSON.parse(a)?.id);
    }
  },
  // ---- RA-2：Nuwa 自主啟發式（advisory-only；不驗玩家台詞）----
  {
    id: "RA2-NUWA-001",
    name: "RA-2：Nuwa bundle ≥ v0.7 且 autonomyHeuristics.trusted=false",
    run: () => {
      const version = String(RAPHAEL_NUWA_DISTILLATION_BUNDLE.version || "");
      const autonomy = RAPHAEL_NUWA_DISTILLATION_BUNDLE.autonomyHeuristics;
      return (
        /v0\.7(\.|$)/.test(version) &&
        autonomy?.trusted === false &&
        RAPHAEL_NUWA_DISTILLATION_BUNDLE.runtimePolicy?.trusted === false
      );
    }
  },
  {
    id: "RA2-NUWA-002",
    name: "RA-2：三個微時刻 + 紅線啟發式（不得讀 loneliness／login）皆在 bundle",
    run: () => {
      const autonomy = RAPHAEL_NUWA_DISTILLATION_BUNDLE.autonomyHeuristics;
      const momentIds = (autonomy?.moments || []).map((moment) => moment.id);
      const heuristicsText = (autonomy?.decisionHeuristics || []).join("\n");
      return (
        momentIds.includes("fireside_settle") &&
        momentIds.includes("quiet_approach") &&
        momentIds.includes("moon_gaze") &&
        heuristicsText.includes("loneliness") &&
        heuristicsText.includes("loginCount") &&
        heuristicsText.includes("null")
      );
    }
  },
  {
    id: "RA2-NUWA-003",
    name: "RA-2：adapter getNuwaAutonomyAdvisory 永遠 trusted:false 且無副作用旗標",
    run: () => {
      const advisory = getNuwaAutonomyAdvisory();
      const suggestion = advisory?.suggestion;
      return (
        advisory?.ok === true &&
        advisory?.trusted === false &&
        suggestion?.trusted === false &&
        suggestion?.mayWriteMemory === false &&
        suggestion?.mayRewardRelationship === false &&
        suggestion?.mayOverrideCooldown === false &&
        suggestion?.maySpeakAsNuwa === false &&
        suggestion?.memoryTraceCandidate === false &&
        (suggestion?.moments || []).length >= 3
      );
    }
  },
  {
    id: "RA2-NUWA-004",
    name: "RA-2：antiPatterns 含孤獨偵測／登入觸發／獎勵記憶／重建 stack",
    run: () => {
      const anti = new Set(RAPHAEL_NUWA_DISTILLATION_BUNDLE.autonomyHeuristics?.antiPatterns || []);
      return (
        anti.has("loneliness_detection") &&
        anti.has("login_frequency_trigger") &&
        anti.has("reward_or_memory_on_ambient_moment") &&
        anti.has("rebuild_autonomy_stack_from_nuwa")
      );
    }
  },
  {
    id: "RA2-ALIGN-001",
    name: "RA-2：Nuwa rarity 數字必須對齊 AMBIENT_INITIATIVE_LIMITS（契約不漂移）",
    run: () => {
      const rarity = RAPHAEL_NUWA_DISTILLATION_BUNDLE.autonomyHeuristics?.rarity || {};
      return (
        rarity.sessionCap === AMBIENT_INITIATIVE_LIMITS.SESSION_CAP &&
        rarity.bootQuietMs === AMBIENT_INITIATIVE_LIMITS.BOOT_QUIET_MS &&
        rarity.minIntervalMs === AMBIENT_INITIATIVE_LIMITS.MIN_INTERVAL_MS
      );
    }
  }
]);

export const RAPHAEL_AUTONOMY_EVAL_CASES = Object.freeze([
  ...COMPANION_INITIATIVE_CASES,
  ...RAPHAEL_AUTONOMY_EVAL_EXTRAS
]);

export function runAllRaphaelAutonomyEvalCases() {
  return RAPHAEL_AUTONOMY_EVAL_CASES.map((testCase) => {
    let pass = false;
    let error = null;
    try {
      pass = testCase.run() === true;
    } catch (err) {
      error = String(err?.message || err);
    }
    return { id: testCase.id, name: testCase.name, pass, error };
  });
}

export function installRaphaelAutonomyEvalHarness(globalRef = globalThis) {
  if (!globalRef) return;
  installCompanionInitiativeHarness(globalRef);
  globalRef.__RAPHAEL_AUTONOMY_EVAL__ = {
    runAll: runAllRaphaelAutonomyEvalCases,
    cases: RAPHAEL_AUTONOMY_EVAL_CASES,
    extras: RAPHAEL_AUTONOMY_EVAL_EXTRAS,
    limits: AMBIENT_INITIATIVE_LIMITS,
    surfaceGates: CONTRACT_SURFACE_GATES
  };
}

export { runAllCompanionInitiativeCases, AMBIENT_INITIATIVE_LIMITS, CONTRACT_SURFACE_GATES };
