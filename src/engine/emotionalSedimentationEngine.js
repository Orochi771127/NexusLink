import { EmotionDict } from "../data/emotionDictionary.js";
import { assessSafetyRisk } from "./safeHarborMode.js";

const MAX_INTENSITY = 1;
const MIN_MEANINGFUL_LENGTH = 2;

export function processEmotionInput(inputText = "", currentState = {}, runtime = {}) {
  const now = Number.isFinite(runtime.now) ? runtime.now : Date.now();
  const idSuffix = runtime.idSuffix || "000";
  const text = normalizeInput(inputText);
  const safetyRisk = assessSafetyRisk(text);

  if (!text) {
    return createEmptyResult({
      inputQuality: "empty",
      safetyRisk
    });
  }

  const inputQuality = assessInputQuality(text);
  if (inputQuality === "noise") {
    return createEmptyResult({
      inputQuality,
      safetyRisk
    });
  }

  const matchResult = findBestEmotionMatch(text);
  const emotionalRepetitionScore = calculateEmotionalRepetitionScore(text, currentState);

  if (!matchResult) {
    return createEmptyResult({
      inputQuality,
      safetyRisk,
      emotionalRepetitionScore
    });
  }

  const intensity = calculateIntensity({
    text,
    matchedEmotion: matchResult.emotion,
    keywordHits: matchResult.keywordHits,
    emotionalRepetitionScore
  });

  const memoryObject = {
    id: `emem_${now}_${idSuffix}`,
    theme: matchResult.emotion.theme,
    label: matchResult.emotion.label,
    emotion: matchResult.emotion.key,
    intensity,
    symbol: matchResult.emotion.symbol,
    place: matchResult.emotion.place,
    status: "fresh",
    source: "soul_talk",
    excerpt: buildExcerpt(text),
    createdAt: now,
    lastUpdatedAt: now,
    isVisibleInHabitat: true
  };

  const recentSimilarEmotionCount = countRecentSimilarEmotion(currentState, memoryObject.emotion);

  const triggerSafeHarbor =
    safetyRisk.riskLevel === "high" ||
    safetyRisk.riskLevel === "caution" ||
    intensity >= 0.82 ||
    emotionalRepetitionScore >= 0.65 ||
    recentSimilarEmotionCount >= 3;

  return {
    memoryObject,
    matchedEmotionKey: matchResult.emotion.key,
    matchedKeywordHits: matchResult.keywordHits,
    intensity,
    emotionalRepetitionScore,
    recentSimilarEmotionCount,
    safetyRisk,
    inputQuality,
    triggerSafeHarbor,
    shouldCreateMemory: safetyRisk.riskLevel !== "high",
    shouldBypassSpam: triggerSafeHarbor || Boolean(memoryObject)
  };
}

function normalizeInput(inputText) {
  return String(inputText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function createEmptyResult(extra = {}) {
  const safetyRisk = extra.safetyRisk || { riskLevel: "none", matched: false, matchedType: null };

  return {
    memoryObject: null,
    matchedEmotionKey: null,
    matchedKeywordHits: 0,
    intensity: 0,
    emotionalRepetitionScore: extra.emotionalRepetitionScore || 0,
    recentSimilarEmotionCount: 0,
    safetyRisk,
    inputQuality: extra.inputQuality || "neutral",
    triggerSafeHarbor: safetyRisk.riskLevel === "high" || safetyRisk.riskLevel === "caution",
    shouldCreateMemory: false,
    shouldBypassSpam: safetyRisk.riskLevel === "high" || safetyRisk.riskLevel === "caution",
    ...extra
  };
}

function assessInputQuality(text) {
  if (!text || text.length < MIN_MEANINGFUL_LENGTH) return "too_short";

  const compact = text.replace(/\s/g, "");
  if (!compact) return "empty";

  const repeatedSingleChar = /^(.)(\1{5,})$/.test(compact);
  if (repeatedSingleChar) return "noise";

  const mostlyDigitsOrSymbols = /^[\d\W_]+$/.test(compact);
  if (mostlyDigitsOrSymbols) return "noise";

  const repeatedLaugh = /^(哈|呵|嘻|ㄏ|w){6,}$/i.test(compact);
  if (repeatedLaugh) return "noise";

  return "meaningful_candidate";
}

function findBestEmotionMatch(text) {
  let best = null;

  for (const emotion of Object.values(EmotionDict)) {
    let keywordHits = 0;

    for (const keyword of emotion.keywords) {
      if (text.includes(keyword)) {
        keywordHits += 1;
      }
    }

    if (keywordHits <= 0) continue;

    const score = emotion.baseIntensity + keywordHits * 0.1;

    if (!best || score > best.score) {
      best = {
        emotion,
        keywordHits,
        score
      };
    }
  }

  return best;
}

function calculateIntensity({ text, matchedEmotion, keywordHits, emotionalRepetitionScore }) {
  const base = matchedEmotion.baseIntensity || 0.4;
  const keywordWeight = Math.min(0.25, keywordHits * 0.08);
  const punctuationWeight = calculatePunctuationWeight(text);
  const lengthWeight = calculateLengthWeight(text);
  const repetitionWeight = Math.min(0.18, emotionalRepetitionScore * 0.18);

  return clamp01(base + keywordWeight + punctuationWeight + lengthWeight + repetitionWeight);
}

function calculatePunctuationWeight(text) {
  const exclamationCount = (text.match(/[!！]/g) || []).length;
  const questionCount = (text.match(/[?？]/g) || []).length;
  const ellipsisCount = (text.match(/…|\.{3,}/g) || []).length;

  return Math.min(0.15, exclamationCount * 0.04 + questionCount * 0.03 + ellipsisCount * 0.03);
}

function calculateLengthWeight(text) {
  const length = text.length;
  if (length >= 80) return 0.12;
  if (length >= 40) return 0.08;
  if (length >= 20) return 0.04;
  return 0;
}

function calculateEmotionalRepetitionScore(text, currentState = {}) {
  const compact = text.replace(/\s/g, "");
  let score = 0;

  const repeatedShortPhrase = detectRepeatedShortPhrase(compact);
  if (repeatedShortPhrase) score += 0.45;

  if (currentState.lastMessage && normalizeInput(currentState.lastMessage) === text) {
    score += 0.35;
  }

  return clamp01(score);
}

function detectRepeatedShortPhrase(compactText) {
  if (!compactText || compactText.length < 4) return false;

  for (let size = 1; size <= 6; size += 1) {
    const unit = compactText.slice(0, size);
    if (!unit) continue;

    const repeated = unit.repeat(Math.ceil(compactText.length / size)).slice(0, compactText.length);
    if (repeated === compactText && compactText.length >= size * 3) {
      return true;
    }
  }

  return false;
}

function countRecentSimilarEmotion(currentState = {}, emotionKey) {
  const memories = Array.isArray(currentState.emotionalMemories) ? currentState.emotionalMemories : [];
  const recent = memories.slice(-5);

  return recent.filter((memory) => memory?.emotion === emotionKey).length;
}

function buildExcerpt(text, maxLength = 30) {
  const value = String(text || "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}

function clamp01(value) {
  return Math.max(0, Math.min(MAX_INTENSITY, Number(value) || 0));
}
