/**
 * RE-2／RE-3：遠征 → RaphaelCore 裁決橋（誠實接點，禁止假整合）。
 *
 * RE-3 #1 已接：
 * - ExpeditionResultEvent schema（可驗證）
 * - expedition memory gateway（保留 source===expedition）
 * - reflection composer 產出第一人稱句 + lite critic
 *
 * 尚未接（明確標記）：
 * - 正式 agent intent classifier（僅 intentStub）
 * - 完整 runCritics／antiLoop／voice pack 事件鏈
 * - memoryWriter.buildMemoryDecision（Soul Talk 語境；遠征走專用 gateway）
 */

import { getCompanionById } from "../data/companionRegistry.js";
import { resolvePersona } from "../ai/personaResolver.js";
import {
  buildExpeditionResultEvent,
  validateExpeditionResultEvent
} from "./expeditionResultEvent.js";
import {
  decideExpeditionMemoryWrites,
  EXPEDITION_MEMORY_SOURCE,
  filterExpeditionMemoryObjects
} from "./expeditionMemoryGateway.js";
import { critiqueExpeditionReflection } from "./expeditionSettlementCritic.js";
import { draftExpeditionReflectionText } from "./expeditionSettlementVoice.js";

/** 向後相容：舊 import 路徑仍可用 */
export { EXPEDITION_MEMORY_SOURCE, filterExpeditionMemoryObjects };

export const EXPEDITION_CORE_BRIDGE_STATUS = Object.freeze({
  /** 發言：event composer + lite critic；完整 voice pack／intent 未接 */
  reflection: "event_composer_lite_critic",
  /** 記憶：expedition gateway；未走 Soul Talk memoryWriter */
  memoryWrite: "expedition_gateway_v1",
  /** intent：僅 stub */
  intent: "stub_only",
  /** 是否可宣稱 Core 完整整合 */
  coreIntegrated: false
});

/**
 * 建立可注入到 buildExpeditionSettlementVoice 的 composeReflection。
 * 回傳通過 lite critic 的第一人稱字串；失敗回 null → voice 層 fallback。
 */
export function createExpeditionReflectionComposer({
  state = {},
  companion = null,
  resultEvent = null
} = {}) {
  return function composeReflection({ session, settlement } = {}) {
    const active = companion || getCompanionById(session?.companionId || state.activeCompanionId);
    let tone = "quiet_observer";
    let persona = null;
    try {
      if (active) {
        persona = resolvePersona(active, state);
        if (persona?.tone) tone = persona.tone;
      }
    } catch {
      // persona 失敗 → 仍可草稿句，再交給 critic
    }

    // 用事件／settlement 脈絡選句（不再永遠 return null）
    void resultEvent;
    const draft = draftExpeditionReflectionText(session, settlement, { tone });
    const critique = critiqueExpeditionReflection(draft, { companion: active, persona });
    if (!critique.pass) {
      return null;
    }
    return draft;
  };
}

/**
 * 一次結算的 Core 側準備包（給 controller 用）。
 */
export function prepareExpeditionCoreSettlement(
  session,
  settlement,
  { state = {}, companion = null, resultEvent = null, now = Date.now() } = {}
) {
  const event = resultEvent || buildExpeditionResultEvent(session, settlement, { now });
  const eventCheck = validateExpeditionResultEvent(event);

  // 事件不合法時仍 fail-closed：不寫記憶、composer 仍可試（voice 有 fallback）
  const memoryGate = eventCheck.ok
    ? decideExpeditionMemoryWrites(event.memoryCandidates || settlement?.memoryObjects || [])
    : {
        accepted: [],
        rejected: [{ memory: null, reason: "invalid_result_event", errors: eventCheck.errors }],
        status: "blocked_invalid_event",
        soulTalkMemoryWriter: false
      };

  return {
    resultEvent: event,
    eventValidation: eventCheck,
    composeReflection: createExpeditionReflectionComposer({
      state,
      companion,
      resultEvent: event
    }),
    memoryObjects: memoryGate.accepted,
    memoryRejected: memoryGate.rejected,
    memoryGateway: {
      status: memoryGate.status,
      soulTalkMemoryWriter: Boolean(memoryGate.soulTalkMemoryWriter)
    },
    bridgeStatus: { ...EXPEDITION_CORE_BRIDGE_STATUS },
    reflectionPathNote:
      "RE-3 partial：result event + composer + lite critic + expedition memory gateway；" +
      "正式 intent classifier／完整 runCritics／Soul Talk memoryWriter 尚未接通"
  };
}
