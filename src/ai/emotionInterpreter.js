import { EmotionDict } from "../data/emotionDictionary.js";

// 2026-07-13 訓練批次：擴充情感詞（含高頻簡體變體）。守則同 emotionDictionary——
// 不收安全層詞族、不收易 substring 誤中的英文縮寫。
const SENTIMENT_LEXICON = Object.freeze({
  開心: 0.8,
  快樂: 0.9,
  高興: 0.7,
  喜歡: 0.7,
  謝謝: 0.5,
  感謝: 0.5,
  平靜: 0.3,
  安心: 0.4,
  幸福: 0.8,
  滿足: 0.6,
  期待: 0.5,
  興奮: 0.7,
  放鬆: 0.4,
  溫暖: 0.5,
  感動: 0.6,
  不錯: 0.5,
  心情好: 0.6,
  不错: 0.5,
  心情好轉: 0.6,
  开心: 0.8,
  快乐: 0.9,
  喜欢: 0.7,
  谢谢: 0.5,
  感谢: 0.5,
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
  生氣: -0.65,
  難受: -0.7,
  委屈: -0.6,
  煩: -0.5,
  悶: -0.4,
  心累: -0.6,
  崩潰: -0.85,
  無力: -0.55,
  失望: -0.65,
  空虛: -0.6,
  寂寞: -0.7,
  不安: -0.5,
  难过: -0.8,
  伤心: -0.9,
  孤单: -0.7,
  紧张: -0.35,
  压力: -0.45,
  疲惫: -0.55,
  讨厌: -0.7,
  生气: -0.65,
  难受: -0.7,
  烦: -0.5,
  闷: -0.4,
  崩溃: -0.85,
  无力: -0.55
});

const DEGREE_ADVERBS = Object.freeze({
  非常: 1.5,
  很: 1.25,
  真的: 1.25,
  有點: 0.7,
  不太: 0.55,
  快要: 1.35,
  超: 1.4,
  超級: 1.5,
  太: 1.3,
  有夠: 1.35,
  整個: 1.3,
  越來越: 1.3,
  特別: 1.3,
  一點點: 0.6,
  有点: 0.7,
  特别: 1.3
});

const NEGATION_WORDS = ["不", "沒有", "沒", "別", "不是", "沒那麼", "没有", "没", "别", "没那么", "not"];

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
  if (["開心", "快樂", "高興", "喜歡", "謝謝", "感謝", "安心", "幸福", "滿足", "期待", "興奮", "溫暖", "感動", "不錯", "心情好", "不错", "心情好轉", "开心", "快乐", "喜欢", "谢谢", "感谢"].includes(keyword)) return "gratitude";
  if (["好累", "疲憊", "心累", "無力", "无力", "疲惫"].includes(keyword)) return "fatigue";
  if (["孤單", "孤獨", "寂寞", "空虛", "孤单"].includes(keyword)) return "loneliness";
  if (["害怕", "緊張", "壓力", "不安", "紧张", "压力"].includes(keyword)) return "anxiety";
  if (["生氣", "討厭", "煩", "生气", "讨厌", "烦"].includes(keyword)) return "anger";
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
