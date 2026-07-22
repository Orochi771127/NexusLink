import { RAPHAEL_CORPUS_BUNDLE } from "../data/ai/raphaelCorpusBundle.js";
import { HEARTSPARK_COUNCIL_VOICE_PACKS } from "../data/ai/heartsparkCouncilVoicePacks.js";
import { IRONFLOW_HACKER_VOICE_PACKS } from "../data/ai/ironflowHackerVoicePacks.js";
import { GREYSHADE_VOICE_PACKS } from "../data/ai/greyshadeVoicePacks.js";

/**
 * Local static corpus loader.
 * Primary: exported bundle from aiforge-raphael-corpus.
 * Overlay: Heartspark five + Ironflow five + Nuwa greyshade voice packs (hand-authored).
 * Fallback: minimal internal pack if bundle import fails.
 */
const FALLBACK_CORPUS = Object.freeze({
  version: "1.0.0-fallback",
  source: "internal_fallback",
  concepts: [
    { id: "A001", label: "失落", tags: ["悲傷", "內省"] },
    { id: "A002", label: "道歉", tags: ["修復", "內疚"] },
    { id: "A003", label: "疲憊", tags: ["休息", "邊界"] },
    { id: "A004", label: "邊界", tags: ["安全", "距離"] }
  ],
  sentences: [
    { id: "F001", text: "我聽見了。", emotion: "calm", tone: "quiet_observer" },
    { id: "F002", text: "我們先慢一點。", emotion: "calm", tone: "quiet_observer" },
    { id: "F003", text: "我不會假裝自己沒有界線。", emotion: "boundary", tone: "quiet_observer" }
  ],
  mappings: [
    { conceptId: "A002", emotionHint: "gratitude", sentenceIds: ["F001", "F002"] },
    { conceptId: "A004", emotionHint: "boundary", sentenceIds: ["F003"] }
  ]
});

let cachedCorpus = null;

export function loadRaphaelCorpus() {
  if (!cachedCorpus) {
    cachedCorpus = normalizeCorpus(RAPHAEL_CORPUS_BUNDLE || FALLBACK_CORPUS);
  }
  return cachedCorpus;
}

/** 測試／熱重載用：清掉快取，讓 overlay 變更立刻生效。 */
export function clearRaphaelCorpusCache() {
  cachedCorpus = null;
}

function normalizeCorpus(raw = {}) {
  if (!raw.sentences?.length && !raw.responsePacks) return FALLBACK_CORPUS;
  // 先合兩組正式五席，再合灰影 Nuwa packs（同 id 覆寫 corpus 舊句，其餘保留）。
  const withHeartspark = mergeResponsePacks(raw.responsePacks || {}, HEARTSPARK_COUNCIL_VOICE_PACKS);
  const withIronflow = mergeResponsePacks(withHeartspark, IRONFLOW_HACKER_VOICE_PACKS);
  const withGreyshade = mergeResponsePacks(withIronflow, GREYSHADE_VOICE_PACKS);
  return {
    version: raw.version || "1.0.0",
    source: raw.source || "unknown",
    concepts: raw.concepts || [],
    sentences: raw.sentences || [],
    mappings: raw.mappings || [],
    responsePacks: withGreyshade,
    templates: raw.templates || {}
  };
}

/**
 * 依 companionId 合併；同一 pack.id 時 overlay 勝出。
 * 好處：灰影可只覆寫情緒核心 7 packs，不丟掉道歉／孤獨／回憶等既有語料。
 */
function mergeResponsePacks(basePacks = {}, overlayPacks = {}) {
  const result = { ...basePacks };
  for (const [companionId, overlayList] of Object.entries(overlayPacks)) {
    const baseList = Array.isArray(result[companionId]) ? result[companionId] : [];
    const byId = new Map(baseList.map((item) => [item.id, item]));
    for (const pack of overlayList || []) {
      if (pack?.id) byId.set(pack.id, pack);
    }
    result[companionId] = [...byId.values()];
  }
  return result;
}

export function getCompanionResponsePacks(companionId = "greyshade-cat") {
  const corpus = loadRaphaelCorpus();
  return corpus.responsePacks?.[companionId] || [];
}

export function getCorpusSentencesByEmotion(emotionKey = "") {
  const corpus = loadRaphaelCorpus();
  const sentenceIds = new Set();

  corpus.mappings
    .filter((mapping) => mapping.emotionHint === emotionKey)
    .forEach((mapping) => (mapping.sentenceIds || []).forEach((id) => sentenceIds.add(id)));

  if (!sentenceIds.size) {
    return corpus.sentences.filter((sentence) => sentence.emotion === emotionKey);
  }

  return corpus.sentences.filter((sentence) => sentenceIds.has(sentence.id));
}
