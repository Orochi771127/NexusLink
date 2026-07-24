/**
 * Pack 2.5 — Relationship authority / active-mirror misuse guardrails.
 *
 * 設計理念（給維護者）：
 * - 頂層 bond/trust 是「正在玩的那隻」快捷鏡像，可以給 HUD／對峙／觸碰用。
 * - 只要判斷「某隻指定 companionId 對玩家的感覺」，就必須走
 *   resolveRelationshipForCompanion（byId 權威），不可直接讀 state.bond。
 * - 本檔只放規則常數與薄包裝，方便 harness 與呼叫端共用同一套文字。
 */

import { resolveRelationshipForCompanion } from "./companionStateSchema.js";

/**
 * 這些模組若用頂層 bond/trust 去「判定某隻夥伴」，就是誤用。
 * （允許出現在註解；靜態掃描會先剝註解。）
 */
export const JUDGMENT_GUARDED_RELATIVE_PATHS = Object.freeze([
  "src/engine/resonanceInviteEngine.js",
  "src/engine/chapterEncounterResolver.js"
]);

/**
 * mapController 的相遇／邀請路徑必須用 snapshot helper，不可把 draft.bond 寫進 chapterMarks。
 */
export const CHAPTER_MARK_GUARDED_RELATIVE_PATH = "src/ui/mapController.js";

/**
 * 允許讀寫頂層 mirror 的「玩 active」模組（非完整清單；供文件／掃描對照）。
 * 這些檔案讀 state.bond 不算誤用，前提是對象就是 active companion。
 */
export const ACTIVE_MIRROR_ALLOWLIST_RELATIVE_PATHS = Object.freeze([
  "src/ui/hudController.js",
  "src/engine/battleEngine.js",
  "src/engine/touchReactionEngine.js",
  "src/engine/explorationEngine.js",
  "src/engine/gentleInvitationEngine.js",
  "src/engine/returnBehaviorEngine.js",
  "src/engine/soulTalkComposer.js",
  "src/engine/actionEffectEngine.js",
  "src/ui/expeditionController.js",
  "src/expedition/expeditionState.js"
]);

export const MIRROR_MISUSE_RULE = Object.freeze({
  id: "pack2.5-no-active-mirror-for-foreign-judgment",
  summary:
    "Never judge companion X via top-level bond/trust; use resolveRelationshipForCompanion(state, X).",
  summaryZh:
    "判定夥伴 X 的感受時，禁止用頂層 bond/trust；必須用 resolveRelationshipForCompanion(state, X)。"
});

/**
 * 判定用讀取入口（語意別名）：之後新程式請優先 import 這個名字，方便搜尋。
 */
export function resolveRelationshipForJudgment(state, companionId) {
  return resolveRelationshipForCompanion(state, companionId);
}

/**
 * 開發／測試用：若目標不是 active 且呼叫端仍想「直接用頂層數值」，回傳風險字串。
 * 不 throw，避免玩法路徑被門禁打斷。
 */
export function diagnoseActiveMirrorJudgmentRisk(state = {}, companionId = "") {
  const target = String(companionId || "");
  const active = String(state?.activeCompanionId || "");
  if (!target || !active || target === active) return null;
  return (
    `Pack2.5 risk: judging non-active companion "${target}" while active is "${active}". `
    + "Use resolveRelationshipForJudgment / resolveRelationshipForCompanion — never state.bond."
  );
}
