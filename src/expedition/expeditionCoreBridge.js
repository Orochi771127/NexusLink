/**
 * RE-2／P1：遠征 → RaphaelCore 裁決橋（誠實接點，禁止假整合）。
 *
 * 能接的：
 * - resolvePersona（tone）影響第一人稱句庫
 * - 可注入 composeReflection / 未來 event reducer
 * - 探索記憶的輕量寫入政策（excerpt／來源／數量門檻）
 *
 * 尚未接（明確標記，不可假裝已完成）：
 * - 完整 Soul Talk runRaphaelCore 輸入管線（那是玩家對話，不是遠征事件）
 * - constitutionCritic／antiLoop／replyVariant 對遠征事件的正式裁決
 * - memoryWriter.buildMemoryDecision（依賴 gateway／safety／intent，語境不同）
 */

import { getCompanionById } from "../data/companionRegistry.js";
import { resolvePersona } from "../ai/personaResolver.js";

export const EXPEDITION_CORE_BRIDGE_STATUS = Object.freeze({
  /** 發言：persona tone 可讀；完整 critic／voice pack 事件鏈未接 */
  reflection: "partial_persona_tone",
  /** 記憶：有輕量 policy filter；未走 memoryWriter 完整決策 */
  memoryWrite: "lite_policy_only",
  /** 是否可宣稱 Core 完整整合 */
  coreIntegrated: false
});

/**
 * 建立可注入到 buildExpeditionSettlementVoice 的 composeReflection。
 * 回傳字串或 null；來源標記由 voice 層記錄。
 */
export function createExpeditionReflectionComposer({ state = {}, companion = null } = {}) {
  return function composeReflection({ session, settlement } = {}) {
    const active = companion || getCompanionById(session?.companionId || state.activeCompanionId);
    let tone = "quiet_observer";
    try {
      if (active) {
        const persona = resolvePersona(active, state);
        if (persona?.tone) tone = persona.tone;
      }
    } catch {
      // persona 失敗 → 仍可用 heart／預設句，由 voice 層 fallback
    }

    // 這裡只提供「tone 提示」給 voice 層；真正選句仍在 settlementVoice，
    // 避免在 bridge 重複維護兩套文案。回傳 null 讓 voice 走 persona_tone_fallback，
    // 但 controller 會帶上 bridge 狀態標記。
    void tone;
    void settlement;
    return null;
  };
}

/** lite policy 唯一合法來源；禁止 soul_talk／unknown／缺省混入遠征結算寫入 */
export const EXPEDITION_MEMORY_SOURCE = "expedition";

/**
 * 探索記憶寫入政策（lite）。
 * - 必須有 excerpt
 * - source 必須**明確**為 `"expedition"`（缺省／soul_talk／unknown／其他一律拒）
 * - 單次結算最多接受 maxAccept 筆
 *
 * 設計理念：結算記憶閘門 fail-closed，避免心語或其他系統物件誤寫成「遠征記憶」。
 *
 * TODO(RE-3): 接 memoryWriter / 正式 sedimentation policy（需 expedition-specific gateway，
 * 不可直接拿玩家對話 buildMemoryDecision 硬套）。
 */
export function filterExpeditionMemoryObjects(memoryObjects = [], { maxAccept = 4 } = {}) {
  const accepted = [];
  const rejected = [];

  (Array.isArray(memoryObjects) ? memoryObjects : []).forEach((memory) => {
    if (!memory || typeof memory !== "object") {
      rejected.push({ memory, reason: "invalid_object" });
      return;
    }
    const excerpt = String(memory.excerpt || "").trim();
    if (!excerpt) {
      rejected.push({ memory, reason: "empty_excerpt" });
      return;
    }
    // P2：來源閘門 — 只接受明確 expedition；不可默默補上 source
    const source = String(memory.source ?? "").trim();
    if (source !== EXPEDITION_MEMORY_SOURCE) {
      rejected.push({ memory, reason: "non_expedition_source" });
      return;
    }
    if (accepted.length >= maxAccept) {
      rejected.push({ memory, reason: "per_settlement_cap" });
      return;
    }
    accepted.push({
      ...memory,
      excerpt,
      source: EXPEDITION_MEMORY_SOURCE,
      // 標記：此寫入尚未經完整 Core memoryWriter
      writePolicy: "expedition_lite_v1"
    });
  });

  return {
    accepted,
    rejected,
    status: EXPEDITION_CORE_BRIDGE_STATUS.memoryWrite
  };
}

/**
 * 一次結算的 Core 側準備包（給 controller 用）。
 */
export function prepareExpeditionCoreSettlement(session, settlement, { state = {}, companion = null } = {}) {
  const memoryGate = filterExpeditionMemoryObjects(settlement?.memoryObjects || []);
  return {
    composeReflection: createExpeditionReflectionComposer({ state, companion }),
    memoryObjects: memoryGate.accepted,
    memoryRejected: memoryGate.rejected,
    bridgeStatus: { ...EXPEDITION_CORE_BRIDGE_STATUS },
    /**
     * reflectionPath 說明字串：讓 HUD／除錯與文件對齊，避免「看起來像完整整合」。
     */
    reflectionPathNote:
      "persona_tone_fallback（bridge partial）；完整 intent/critic/memoryWriter 事件鏈尚未接通"
  };
}
