import { RAPHAEL_CORPUS_BUNDLE } from "../data/ai/raphaelCorpusBundle.js";
import { HEARTSPARK_COUNCIL_VOICE_PACKS } from "../data/ai/heartsparkCouncilVoicePacks.js";

/**
 * Local static corpus loader.
 * Primary: exported bundle from aiforge-raphael-corpus.
 * Overlay: Heartspark Council formal-five voice packs (hand-authored, Nuwa v0.5).
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

function normalizeCorpus(raw = {}) {
  if (!raw.sentences?.length && !raw.responsePacks) return FALLBACK_CORPUS;
  return {
    version: raw.version || "1.0.0",
    source: raw.source || "unknown",
    concepts: raw.concepts || [],
    sentences: raw.sentences || [],
    mappings: raw.mappings || [],
    // 五席 voice packs 覆寫／補齊：正式席不應再落到 greyshade 預設台詞。
    responsePacks: mergeResponsePacks(raw.responsePacks || {}, HEARTSPARK_COUNCIL_VOICE_PACKS),
    templates: raw.templates || {}
  };
}

function mergeResponsePacks(basePacks = {}, overlayPacks = {}) {
  return {
    ...basePacks,
    ...overlayPacks
  };
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