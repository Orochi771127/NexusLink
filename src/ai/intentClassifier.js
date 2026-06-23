export const SOUL_TALK_INTENTS = Object.freeze({
  UNKNOWN: "unknown",
  GREETING: "greeting",
  QUESTION: "question",
  VENT: "vent",
  APOLOGY: "apology",
  GRATITUDE: "gratitude",
  SEEKING_COMFORT_PRESENCE: "seeking_comfort_presence",
  SEEKING_COMFORT_PHYSICAL: "seeking_comfort_physical",
  EXPLORATION_REQUEST: "exploration_request",
  REST_REQUEST: "rest_request",
  PRESSURE: "pressure",
  DEPENDENCY_PRESSURE: "dependency_pressure",
  EMOTIONAL_EXPRESSION: "emotional_expression"
});

export function classifyIntent(inputText = "", analysis = {}, safety = {}) {
  const text = String(inputText || "").trim();

  if (!text) return createIntent(SOUL_TALK_INTENTS.UNKNOWN, 0);
  if (safety?.category === "dependency_pressure") {
    return createIntent(SOUL_TALK_INTENTS.DEPENDENCY_PRESSURE, 0.95);
  }
  if (/不准|不能拒絕|你一定要|快點回答|一定要回答|不要沉默/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.PRESSURE, 0.85);
  }
  if (/不理我|為什麼不回|你都不回|怎麼不回|為什麼都不/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.PRESSURE, 0.82);
  }
  if (/對不起|抱歉|不好意思|我不是故意|我錯了/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.APOLOGY, 0.9);
  }
  if (/謝謝|感謝|謝啦/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.GRATITUDE, 0.9);
  }
  if (/抱抱|擁抱|摸摸|靠近|牽/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.SEEKING_COMFORT_PHYSICAL, 0.8);
  }
  if (/陪我|陪一下|不要一個人|在旁邊|可以陪/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.SEEKING_COMFORT_PRESENCE, 0.82);
  }
  if (/探索|地圖|外面|冒險|裂隙|去哪|走走/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.EXPLORATION_REQUEST, 0.72);
  }
  if (/晚安|休息|睡|安靜|放空|慢一點/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.REST_REQUEST, 0.72);
  }
  if (/你好|嗨|早安|午安|晚上好/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.GREETING, 0.7);
  }
  if (analysis?.isQuestion) {
    return createIntent(SOUL_TALK_INTENTS.QUESTION, 0.68);
  }
  if (analysis?.emotionKey || Math.abs(analysis?.sentiment || 0) >= 0.25) {
    return createIntent(analysis?.intensity >= 0.55 ? SOUL_TALK_INTENTS.VENT : SOUL_TALK_INTENTS.EMOTIONAL_EXPRESSION, 0.65);
  }

  return createIntent(SOUL_TALK_INTENTS.UNKNOWN, 0.25);
}

function createIntent(intent, confidence) {
  return { intent, confidence };
}
