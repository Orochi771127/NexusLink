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
  SILENCE_REQUEST: "silence_request",
  QUIET_PRESENCE: "quiet_presence",
  LOW_INTENT: "low_intent",
  SHORT_ACK: "short_ack",
  EMPTY_OR_NOISE: "empty_or_noise",
  PRESSURE: "pressure",
  DEPENDENCY_PRESSURE: "dependency_pressure",
  EMOTIONAL_EXPRESSION: "emotional_expression"
});

export function classifyIntent(inputText = "", analysis = {}, safety = {}) {
  const text = String(inputText || "").trim();

  if (!text) return createIntent(SOUL_TALK_INTENTS.EMPTY_OR_NOISE, 0);
  if (isBoundaryPressureText(text)) return createIntent(SOUL_TALK_INTENTS.PRESSURE, 0.88);
  if (/^(嗯|哦|好呀|好喔|ok|OK|嗨|安安|哈囉|嘿)$/i.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.SHORT_ACK, 0.7);
  }
  if (/不想講|不要問|不用說|別說太多|先不要聊|不想說|不要說太多|先別問/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.SILENCE_REQUEST, 0.88);
  }
  if (/陪我安靜|安靜陪|安靜待|靜靜陪/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.QUIET_PRESENCE, 0.86);
  }
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
  if (
    /抱抱|擁抱|摸摸|牽/.test(text) ||
    (/靠近/.test(text) && !/退後|太快|距離|半步|貼太近|別貼|不要太近/.test(text))
  ) {
    return createIntent(SOUL_TALK_INTENTS.SEEKING_COMFORT_PHYSICAL, 0.8);
  }
  if (/我想待著|不用說太多|先不要說|只想待著/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.REST_REQUEST, 0.8);
  }
  if (/陪我|陪一下|不要一個人|在旁邊|可以陪/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.SEEKING_COMFORT_PRESENCE, 0.82);
  }
  if (/探索|地圖|外面|冒險|裂隙|去哪|走走/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.EXPLORATION_REQUEST, 0.72);
  }
  // 「睡不著／失眠」是焦慮訊號、「睡前～」是日常分享——都不是休息請求，豁免給對應路徑接手。
  if (/晚安|休息|睡|安靜|放空|慢一點|想安靜|安靜一下/.test(text) && !/睡不著|睡不着|失眠|睡前/.test(text)) {
    return createIntent(SOUL_TALK_INTENTS.REST_REQUEST, 0.78);
  }
  if (
    /^(安安|你好|嗨|哈囉|早安|午安|晚上好)$|安安你在|你在嗎|在嗎/.test(text) ||
    /^(你好嗎|你好不好|最近好嗎|還好嗎)$/.test(text) ||
    /吃飯沒[啊阿]?$|吃了嗎|吃飯了嗎/.test(text) ||
    /聽說.{0,12}很[型屌行]|^[你妳]很[型屌行]/.test(text)
  ) {
    return createIntent(SOUL_TALK_INTENTS.GREETING, 0.78);
  }
  if (analysis?.isQuestion) {
    return createIntent(SOUL_TALK_INTENTS.QUESTION, 0.68);
  }
  if (analysis?.emotionKey || Math.abs(analysis?.sentiment || 0) >= 0.25) {
    return createIntent(analysis?.intensity >= 0.55 ? SOUL_TALK_INTENTS.VENT : SOUL_TALK_INTENTS.EMOTIONAL_EXPRESSION, 0.65);
  }

  if (text.length <= 3) return createIntent(SOUL_TALK_INTENTS.LOW_INTENT, 0.4);
  return createIntent(SOUL_TALK_INTENTS.UNKNOWN, 0.25);
}

function createIntent(intent, confidence) {
  return { intent, confidence };
}

function isBoundaryPressureText(text) {
  return (
    /只能屬於我|不可以拒絕我|不可以有自己的邊界|不准慢慢來/.test(text) ||
    /如果你不.{0,12}(回答|陪|理我).{0,12}(不在乎|不愛|討厭我)/.test(text) ||
    /(馬上|立刻|現在).{0,8}(回答|陪我).{0,12}(不在乎|不愛|討厭我)/.test(text)
  );
}
