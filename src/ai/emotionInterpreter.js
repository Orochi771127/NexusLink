import { EmotionDict } from "../data/emotionDictionary.js";

const SENTIMENT_LEXICON = Object.freeze({
  開心: 0.8,
  快樂: 0.9,
  高興: 0.7,
  喜歡: 0.7,
  謝謝: 0.5,
  感謝: 0.5,
  平靜: 0.3,
  安心: 0.4,
  難過: -0.8,
  傷心: -0.9,
  孤單: -0.7,
  孤獨: -0.7,
  害怕: -0.6,
  緊張: -0.35,
  壓力: -0.45,
  好累: -0.5,
  疲憊: -0.55,
  討厭: -0.7,
  生氣: -0.65
});

const DEGREE_ADVERBS = Object.freeze({
  非常: 1.5,
  很: 1.25,
  真的: 1.25,
  有點: 0.7,
  不太: 0.55,
  快要: 1.35,
  超: 1.4
});

const NEGATION_WORDS = ["不", "沒有", "沒", "別", "不是", "not"];

export function interpretEmotionInput(inputText = "", state = {}, runtime = {}) {
  const originalInput = String(inputText || "").trim();
  const cleanedInput = cleanInput(originalInput);
  const isQuestion = /[?？]|嗎|為什麼|怎麼|是不是|什麼/.test(originalInput);
  const repeated = Boolean(runtime.repeated ?? (cleanedInput && cleanInput(state.lastMessage) === cleanedInput));
  const lexiconResult = scoreSentiment(cleanedInput);
  const dictionaryMatch = findDictionaryEmotion(originalInput);

  const emotionKey = dictionaryMatch?.emotion?.key || inferFallbackEmotion(cleanedInput, lexiconResult.primaryEmotion);
  const intensity = clamp01(
    (dictionaryMatch?.intensity || 0) +
      Math.min(0.35, Math.abs(lexiconResult.sentiment) * 0.35) +
      calculatePunctuationWeight(originalInput) +
      (repeated ? 0.15 : 0)
  );

  return {
    originalInput,
    cleanedInput,
    isQuestion,
    repeated,
    emotionKey,
    primaryEmotion: lexiconResult.primaryEmotion || emotionKey || "neutral",
    sentiment: lexiconResult.sentiment,
    intensity,
    keywords: [...new Set([...lexiconResult.keywords, ...(dictionaryMatch?.keywords || [])])],
    negatedKeywords: lexiconResult.negatedKeywords,
    containsIntenseEmotionWords: intensity >= 0.72,
    dictionaryMatch
  };
}

function cleanInput(input) {
  return String(input || "")
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function scoreSentiment(text) {
  let score = 0;
  let count = 0;
  let primaryEmotion = null;
  const keywords = [];
  const negatedKeywords = [];

  for (const [keyword, value] of Object.entries(SENTIMENT_LEXICON)) {
    if (!text.includes(keyword)) continue;

    const degree = findDegree(text, keyword);
    const isNegated = NEGATION_WORDS.some((word) => text.includes(`${word}${keyword}`) || text.includes(`${word} ${keyword}`));
    const finalValue = value * degree * (isNegated ? -1 : 1);

    score += finalValue;
    count += 1;
    if (isNegated) negatedKeywords.push(keyword);
    else keywords.push(keyword);

    if (!primaryEmotion || Math.abs(finalValue) > Math.abs(SENTIMENT_LEXICON[primaryEmotion] || 0)) {
      primaryEmotion = mapKeywordToEmotion(keyword, finalValue);
    }
  }

  return {
    sentiment: count > 0 ? clamp(score / count, -1, 1) : 0,
    primaryEmotion,
    keywords,
    negatedKeywords
  };
}

function findDegree(text, keyword) {
  const index = text.indexOf(keyword);
  const prefix = index >= 0 ? text.slice(Math.max(0, index - 4), index) : "";
  for (const [word, weight] of Object.entries(DEGREE_ADVERBS)) {
    if (prefix.includes(word)) return weight;
  }
  return 1;
}

function findDictionaryEmotion(text) {
  let best = null;

  for (const emotion of Object.values(EmotionDict)) {
    const keywords = emotion.keywords.filter((keyword) => text.includes(keyword));
    if (!keywords.length) continue;

    const intensity = clamp01((emotion.baseIntensity || 0.4) + keywords.length * 0.08);
    if (!best || intensity > best.intensity) {
      best = { emotion, keywords, intensity };
    }
  }

  return best;
}

function mapKeywordToEmotion(keyword, value) {
  if (["開心", "快樂", "高興", "喜歡", "謝謝", "感謝", "安心"].includes(keyword)) return "gratitude";
  if (["好累", "疲憊"].includes(keyword)) return "fatigue";
  if (["孤單", "孤獨"].includes(keyword)) return "loneliness";
  if (["害怕", "緊張", "壓力"].includes(keyword)) return "anxiety";
  if (["生氣", "討厭"].includes(keyword)) return "anger";
  if (value < 0) return "sadness";
  return "calm";
}

function inferFallbackEmotion(text, primaryEmotion) {
  if (primaryEmotion) return primaryEmotion;
  if (/累|疲|撐不住/.test(text)) return "fatigue";
  if (/難過|傷心|失落|空/.test(text)) return "sadness";
  if (/怕|焦慮|緊張|壓力/.test(text)) return "anxiety";
  if (/孤單|孤獨|沒有人/.test(text)) return "loneliness";
  if (/生氣|討厭|火大/.test(text)) return "anger";
  if (/謝謝|感謝|晚安|安靜/.test(text)) return "gratitude";
  return null;
}

function calculatePunctuationWeight(text) {
  const exclamationCount = (text.match(/[!！]/g) || []).length;
  const questionCount = (text.match(/[?？]/g) || []).length;
  const ellipsisCount = (text.match(/…|\.{3,}/g) || []).length;
  return Math.min(0.15, exclamationCount * 0.04 + questionCount * 0.03 + ellipsisCount * 0.03);
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}
