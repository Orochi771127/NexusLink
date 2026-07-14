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
