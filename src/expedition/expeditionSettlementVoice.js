/**
 * RE-2 E-CORE：遠征結算語音拆分。
 *
 * 設計理念：
 * - 系統事實（帶回的微光痕跡）→ Soul Talk `system`
 * - 夥伴感受（第一人稱短句）→ `companion`，但必須經本 adapter
 *   （可掛 persona／未來 critic；接不到也不准把第三人稱 journal 假扮成夥伴說話）
 *
 * 這不是完整 RaphaelCore 整合；是乾淨接點 + 安全 fallback。
 */

import { getCompanionById } from "../data/companionRegistry.js";
import { getRegionLootTable } from "../data/lootTables.js";
import { describeMoteAmount, getShardDisplayLabel } from "./lootPresentation.js";
import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { resolvePersona } from "../ai/personaResolver.js";

/**
 * 從結算結果組出「系統事實」句（第三人稱／中性敘事 OK）。
 */
export function buildExpeditionSystemFacts(session, settlement = {}) {
  const region = getExpeditionRegionByNodeId(session?.regionId || session?.nodeId);
  const regionLabel = region?.label?.zh || "遠征區";
  const loot = settlement.lootSummary || session?.lootCollected || {};
  const primaryShard = getRegionLootTable(session?.regionId || "plains_windrest").primaryShard;
  const primaryCount = Number(loot[primaryShard]) || 0;
  const shardLabel = getShardDisplayLabel(primaryShard, "zh");
  const kills = session?.stats?.kills || 0;
  const visited = session?.visitedExplorePoints?.length || 0;
  const memoryEvents = session?.triggeredMemoryEvents?.length || 0;
  const retreated = Boolean(settlement.retreated);
  const name = session?.companionName || "夥伴";

  const facts = [];

  if (retreated || session?.returnHomeRequested) {
    facts.push(`遠征結束：你們從${regionLabel}返回棲地。`);
  } else {
    facts.push(`遠征完成：${regionLabel}巡視告一段落。`);
  }

  if (primaryCount > 0) {
    // Pack D：質性數量＋微光語意，避免「帶回 N 枚」刷分框架。
    facts.push(`帶回了${describeMoteAmount(primaryCount, "zh")}${shardLabel}——同行痕跡，不是戰利品。`);
  }
  if (visited > 0) {
    facts.push(`造訪探索點 ${visited} 處。`);
  }
  if (memoryEvents > 0) {
    facts.push(`留下可回看的短記憶 ${memoryEvents} 段。`);
  }
  if (kills > 0) {
    facts.push(`驅散雜訊 ${kills} 次（不作為好感來源）。`);
  }
  if ((settlement.bondGain || 0) > 0 || (settlement.trustGain || 0) > 0) {
    // 質性羈絆：結算語不暴露 +N，避免被讀成刷怪好感。
    facts.push("這趟同行讓關係更深了一點（來自共同發現，非刷怪）。");
  }

  if (!facts.length) {
    facts.push(`${name}的遠征紀錄已收進棲地。`);
  }

  return facts;
}

/**
 * 依 persona tone 微調第一人稱句庫（輕量接點，不是完整 voice pack／critic）。
 * 供 bridge composer 與本檔 fallback 共用，避免兩套文案漂移。
 */
export function draftExpeditionReflectionText(session, settlement = {}, { tone = "quiet_observer" } = {}) {
  const heart = session?.heart || {};
  const ctx = {
    retreated: Boolean(settlement.retreated || session?.returnHomeRequested),
    memories: session?.triggeredMemoryEvents?.length || 0,
    stress: Number(heart.stress) || 0,
    fatigue: Number(heart.fatigue) || 0,
    safety: Number(heart.feltSafety) || 0.5,
    pressure: Number(heart.interventionPressure) || 0
  };
  return pickReflectionByTone(tone, ctx);
}

function pickReflectionByTone(tone, { retreated, memories, stress, fatigue, safety, pressure }) {
  const quiet = tone === "quiet_observer" || !tone;

  if (retreated && (stress > 0.55 || pressure > 0.45)) {
    return quiet
      ? "那裡有點超過我現在能扛的。我們回來就好。"
      : "我需要先離開那裡。回來並不可恥。";
  }
  if (retreated) {
    return quiet
      ? "先回家沒關係。我還記得路上的氣味。"
      : "我們回來了。這次的節奏我可以接受。";
  }
  if (memories >= 2 && safety >= 0.5) {
    return quiet
      ? "有幾處我會想再跟你一起慢慢看。"
      : "那些角落……我想以後還能跟你再去。";
  }
  if (fatigue > 0.55) {
    return "我有點累了……但不是討厭這趟。";
  }
  if (stress > 0.5) {
    return "雜訊散了之後，我才覺得呼吸順一點。";
  }
  return quiet
    ? "這趟我記住了。不用急著再出發。"
    : "這趟夠了。讓記憶先沉一會兒。";
}

/**
 * 第一人稱感受：優先 composeReflection hook；否則 persona tone + heart fallback。
 */
export function buildExpeditionCompanionReflection(session, settlement = {}, options = {}) {
  const { composeReflection } = options;

  if (typeof composeReflection === "function") {
    try {
      const hooked = composeReflection({ session, settlement });
      if (typeof hooked === "string" && hooked.trim()) {
        return {
          text: hooked.trim(),
          source: "composer_hook"
        };
      }
    } catch {
      // hook 失敗 → 安全 fallback
    }
  }

  let tone = "quiet_observer";
  let source = "heart_fallback";
  try {
    const companion = getCompanionById(session?.companionId);
    if (companion) {
      const persona = resolvePersona(companion);
      if (persona?.tone) {
        tone = persona.tone;
        source = "persona_tone_fallback";
      }
    }
  } catch {
    // persona 讀取失敗仍可用 heart fallback
  }

  return {
    text: draftExpeditionReflectionText(session, settlement, { tone }),
    source
  };
}

/** 組合完整結算語音封包（純資料）。 */
export function buildExpeditionSettlementVoice(session, settlement = {}, options = {}) {
  const systemFacts = buildExpeditionSystemFacts(session, settlement);
  const reflection = buildExpeditionCompanionReflection(session, settlement, options);
  const bridgeStatus = options.bridgeStatus || null;

  return {
    systemFacts,
    companionReflection: reflection?.text || null,
    reflectionSource: reflection?.source || "none",
    /** 誠實標記：是否仍屬 fallback／partial（供除錯與 QA，不進玩家 UI）。 */
    corePath: {
      integrated: false,
      bridgeStatus,
      note: options.reflectionPathNote
        || "未走完整 Raphael intent/critic/reducer；現行為 adapter + persona/heart fallback"
    }
  };
}

/**
 * 發佈到 Soul Talk：facts → system；感受 → companion（經 adapter）。
 * 禁止呼叫端把第三人稱 journal 直接塞 companion。
 */
export function publishExpeditionSettlementVoice(soulTalkController, voice) {
  if (!soulTalkController || !voice) {
    return { publishedSystem: 0, publishedCompanion: false };
  }

  let publishedSystem = 0;
  (voice.systemFacts || []).forEach((line) => {
    if (!line) return;
    soulTalkController.addChat("system", line);
    publishedSystem += 1;
  });

  let publishedCompanion = false;
  if (voice.companionReflection) {
    soulTalkController.addChat("companion", voice.companionReflection);
    publishedCompanion = true;
  }

  soulTalkController.renderChat?.();
  return { publishedSystem, publishedCompanion };
}
