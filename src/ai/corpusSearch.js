import { loadRaphaelCorpus } from "./corpusLoader.js";

const INTENT_EMOTION_HINTS = Object.freeze({
  apology: "guilt",
  vent: "sadness",
  gratitude: "gratitude",
  rest_request: "calm",
  exploration_request: "calm",
  dependency_pressure: "boundary",
  pressure: "boundary"
});

export function searchCorpus({ emotionKey = "", intent = "", inputText = "", limit = 3 } = {}) {
  const corpus = loadRaphaelCorpus();
  const emotionHint = emotionKey || INTENT_EMOTION_HINTS[intent] || "calm";
  const keywords = tokenize(inputText);

  const sentenceById = new Map(corpus.sentences.map((sentence) => [sentence.id, sentence]));
  const ranked = [];

  for (const mapping of corpus.mappings) {
    if (mapping.emotionHint !== emotionHint && emotionKey && mapping.emotionHint !== emotionKey) {
      continue;
    }

    for (const sentenceId of mapping.sentenceIds || []) {
      const sentence = sentenceById.get(sentenceId);
      if (!sentence) continue;
      ranked.push({
        sentence,
        score: scoreSentence(sentence, emotionHint, intent, keywords, mapping.priority || 1)
      });
    }
  }

  for (const sentence of corpus.sentences) {
    if (ranked.some((entry) => entry.sentence.id === sentence.id)) continue;
    ranked.push({
      sentence,
      score: scoreSentence(sentence, emotionHint, intent, keywords, 0.5)
    });
  }

  const hits = ranked
    .sort((left, right) => right.score - left.score)
    .filter((entry) => entry.score >= 0.35)
    .slice(0, limit)
    .map((entry) => ({
      id: entry.sentence.id,
      text: entry.sentence.text,
      emotion: entry.sentence.emotion,
      tone: entry.sentence.tone,
      score: entry.score
    }));

  return {
    emotionHint,
    hits,
    corpusVersion: corpus.version,
    corpusSource: corpus.source
  };
}

function scoreSentence(sentence, emotionHint, intent, keywords, priority) {
  let score = 0.2 + priority * 0.1;
  if (sentence.emotion === emotionHint) score += 0.35;
  if (intent && sentence.emotion === INTENT_EMOTION_HINTS[intent]) score += 0.2;

  const text = sentence.text || "";
  for (const keyword of keywords) {
    if (text.includes(keyword)) score += 0.15;
  }

  return Math.min(1, score);
}

function tokenize(text = "") {
  return String(text)
    .replace(/[，。！？、\s]/g, " ")
    .split(" ")
    .map((part) => part.trim())
    .filter((part) => part.length >= 2)
    .slice(0, 6);
}