import { RESPONSE_PACKS, TONE_FLAVOR, ECHO_TEMPLATES } from "../data/soulTalkResponsePacks.js";

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
