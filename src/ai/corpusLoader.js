/**
 * Local static corpus loader (v1 skeleton).
 * Future target: NexusLink/src/data/ai/raphael_corpus.bundle.json
 * Do not fetch network or import the external corpus repo at runtime.
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
  if (!cachedCorpus) cachedCorpus = FALLBACK_CORPUS;
  return cachedCorpus;
}

export function getCorpusSentencesByEmotion(emotionKey = "") {
  const corpus = loadRaphaelCorpus();
  const sentenceIds = new Set();

  corpus.mappings
    .filter((mapping) => mapping.emotionHint === emotionKey)
    .forEach((mapping) => mapping.sentenceIds.forEach((id) => sentenceIds.add(id)));

  return corpus.sentences.filter((sentence) => sentenceIds.has(sentence.id));
}