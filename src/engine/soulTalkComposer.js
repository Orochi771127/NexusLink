import { RESPONSE_PACKS, TONE_FLAVOR, ECHO_TEMPLATES, EVENT_REFLECTION, MEMORY_REFLECTION, MEMORY_REFLECTION_BOND } from "../data/soulTalkResponsePacks.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";

const ECHO_WINDOW_MS = 48 * 60 * 60 * 1000;
const ECHOABLE_STATUSES = new Set(["fresh", "settled"]);

export function findRecentEmotionEcho(emotionalMemories = [], emotionKey, now = Date.now(), excludeMemoryId = null) {
  if (!Array.isArray(emotionalMemories) || !emotionKey) return null;

  for (let index = emotionalMemories.length - 1; index >= 0; index -= 1) {
    const memory = emotionalMemories[index];
    if (!memory || memory.id === excludeMemoryId) continue;
    if (memory.emotion !== emotionKey) continue;
    if (!ECHOABLE_STATUSES.has(memory.status)) continue;
    if (now - (memory.createdAt || 0) > ECHO_WINDOW_MS) continue;
    return memory;
  }
  return null;
}

function pickBondTier(bond = 0) {
  if (bond >= 60) return "high";
  if (bond >= 20) return "mid";
  return "low";
}

function pickFromPool(pool = [], seed = 0) {
  if (!Array.isArray(pool) || pool.length === 0) return "";
  return pool[Math.abs(seed) % pool.length];
}

/**
 * 組合夥伴回應：情緒池（依 bond 分檔）＋記憶回聲＋夥伴語氣。
 * 純函數：不改 state，不碰 DOM。
 */
export function composeCompanionReply({
  emotionKey,
  state = {},
  companion = null,
  now = Date.now(),
  excludeMemoryId = null
}) {
  const packs = RESPONSE_PACKS[emotionKey];
  const seed = (state.chatHistory?.length || 0) + (state.bond || 0);

  let reply = "";
  if (packs) {
    const tier = pickBondTier(state.bond);
    reply = pickFromPool(packs[tier], seed) || pickFromPool(packs.mid, seed) || pickFromPool(packs.low, seed);
  }

  if (!reply) {
    reply = "我接住你的訊號了。讓我們先把它放在湖邊，慢慢看清楚。";
  }

  let usedEcho = false;
  const echoMemory = findRecentEmotionEcho(state.emotionalMemories, emotionKey, now, excludeMemoryId);
  const echoTemplate = ECHO_TEMPLATES[emotionKey];
  if (echoMemory && echoTemplate && (state.trust || 0) >= 3) {
    reply = `${echoTemplate.replace("{theme}", echoMemory.theme || "那段情緒")}\n${reply}`;
    usedEcho = true;
  }

  const toneFragments = TONE_FLAVOR[companion?.soulTalkTone];
  if (toneFragments && toneFragments.length > 0 && seed % 2 === 0) {
    reply = `${reply}\n${pickFromPool(toneFragments, seed)}`;
  }

  return { reply, usedEcho };
}

// ---- 事件引用（閉環：探索/對峙 → 回家對話） ----

const EVENT_FRESH_WINDOW_MS = 15 * 60 * 1000;

// 既有 battleRecord 三值 → 對峙結局文案 key 的反推。
// "win" 無法區分 stabilized/recovered → 由呼叫端傳 outcome 覆寫；
// 純讀 state 時退回 stabilized（語氣相容）。
const LEGACY_TO_OUTCOME = {
  win: "stabilized",
  lose: "overwhelmed_but_safe",
  retreat: "retreated"
};

/**
 * 依最近事件（對峙優先，其次探索）產生一句「牠記得」的引用台詞。
 * 純函數：只讀 state，不寫入。回傳 null = 沒有夠新鮮的事件。
 *
 * 新鮮度規則：
 * - 對峙：以 battleRecord.lastBattleAt 時間窗判定（15 分鐘）。
 * - 探索：lastNodeId 是永續欄位、無獨立 timestamp（不改 schema），
 *   因此必須由呼叫端在「剛探索完的同一 session」以 allowExploration 顯式開啟。
 *
 * @param {object} options.outcomeOverride 對峙剛結束時由 controller 傳入精確結局
 * @param {boolean} options.allowExploration 探索引用 opt-in（mapController 專用）
 */
export function buildEventReflection(state = {}, now = Date.now(), { outcomeOverride = null, allowExploration = false } = {}) {
  const lastBattleAt = state.battleRecord?.lastBattleAt || 0;
  const lastNodeId = state.explorationProgress?.lastNodeId || null;
  const node = lastNodeId ? getExplorationNodeById(lastNodeId) : null;
  const nodeName = node?.label?.zh || "那片場域";
  const seed = (state.chatHistory?.length || 0) + (state.bond || 0);

  if (lastBattleAt && now - lastBattleAt <= EVENT_FRESH_WINDOW_MS) {
    const outcome = outcomeOverride || LEGACY_TO_OUTCOME[state.battleRecord?.lastResult] || "stabilized";
    const pool = EVENT_REFLECTION.standoff[outcome] || EVENT_REFLECTION.standoff.stabilized;
    const line = pool[Math.abs(seed) % pool.length] || pool[0];
    return line.replace("{node}", nodeName);
  }

  if (allowExploration && node) {
    const pool = EVENT_REFLECTION.exploration;
    const line = pool[Math.abs(seed) % pool.length] || pool[0];
    return line.replace("{node}", nodeName);
  }

  return null;
}

/**
 * 無情緒命中時的一般回應，仍套夥伴語氣。
 */
export function composeFallbackReply({ baseReply, state = {}, companion = null }) {
  const seed = (state.chatHistory?.length || 0) + (state.trust || 0);
  const toneFragments = TONE_FLAVOR[companion?.soulTalkTone];
  if (toneFragments && toneFragments.length > 0 && seed % 3 === 0) {
    return `${baseReply}\n${pickFromPool(toneFragments, seed)}`;
  }
  return baseReply;
}

/**
 * 記憶回廊：玩家回看一段記憶時，夥伴以「自己的聲音」說一句「我們一起記得」。
 * 純函數：不改 state、不碰 DOM。羈絆里程碑走專屬語，其餘依情緒取模板（有 fallback）。
 */
export function composeMemoryReflection({ memory, companion = null, state = {} }) {
  if (!memory) return "";
  const theme = memory.theme || "那段記憶";
  const isBond = memory.source === "bond" || String(memory.id || "").startsWith("bond_milestone_");
  const template = isBond
    ? MEMORY_REFLECTION_BOND
    : MEMORY_REFLECTION[memory.emotion] || "「{theme}」我都記得。你願意回來看它，這對我很重要。";
  let line = template.replace("{theme}", theme);

  const seed = (state.chatHistory?.length || 0) + (state.bond || 0);
  const toneFragments = TONE_FLAVOR[companion?.soulTalkTone];
  if (toneFragments && toneFragments.length > 0 && seed % 2 === 0) {
    line = `${line}\n${pickFromPool(toneFragments, seed)}`;
  }
  return line;
}
