export const TOPICS = Object.freeze({
  EMOTION: "emotion",
  RELATIONSHIP: "relationship",
  DEVELOPMENT: "development",
  HUD_UI: "hud_ui",
  RAPHAEL_AI: "raphael_ai",
  MEMORY: "memory",
  AWAKENING: "awakening",
  EXPLORATION: "exploration",
  DAILY_LIFE: "daily_life",
  PHYSICAL_TIREDNESS: "physical_tiredness",
  WORK_PRESSURE: "work_pressure",
  SOCIAL_CONFLICT: "social_conflict",
  UNKNOWN: "unknown"
});

export function classifyTopic(inputText = "", entities = [], analysis = {}) {
  const text = String(inputText || "");

  if (/初醒|心核|第一次醒|月湖.*亮/.test(text) || entities.includes("awakening")) {
    return TOPICS.AWAKENING;
  }
  if (/記得|回想|還記得/.test(text) && entities.includes("memory")) {
    return TOPICS.MEMORY;
  }
  if (/\bHUD\b|dock|底部導覽|抬頭|頂部介面|面板.*擋|疊層|z-index/i.test(text) || entities.includes("HUD")) {
    return TOPICS.HUD_UI;
  }
  if (/開發|下一步|先修|優先|實作|bug|壞掉|釐清|修復|Grok/i.test(text) || entities.includes("Grok")) {
    return TOPICS.DEVELOPMENT;
  }
  if (
    /自然語言|理解不了|semanticFrame|intent|response\s*pack|Raphael.*理解|幫我拆解/i.test(text) ||
    (/Raphael/i.test(text) && /理解/.test(text))
  ) {
    return TOPICS.RAPHAEL_AI;
  }
  if (/\bAI\b/.test(text) && /理解|自然語言|semanticFrame/.test(text)) {
    return TOPICS.RAPHAEL_AI;
  }
  if (/地圖|外面|探索|走走|湖面外/i.test(text) || entities.includes("地圖")) {
    return TOPICS.EXPLORATION;
  }
  if (/下班|放空|腦袋空|腦袋空空|吃完飯|吃飽|想躺|躺一下|懶懶|懶得動|剛醒|睡醒|日常|今天普通/.test(text)) {
    return TOPICS.DAILY_LIFE;
  }
  if (/心裡卡住|不是身體累|心裡累/.test(text)) {
    return TOPICS.EMOTION;
  }
  if (/累|疲憊|好睏|沒力|體力/.test(text)) {
    return TOPICS.PHYSICAL_TIREDNESS;
  }
  if (/工作|加班|deadline|壓力很大|壓力好大|壓力大|專案|老闆|老板|主管|任務|丟任務/.test(text)) {
    return TOPICS.WORK_PRESSURE;
  }
  if (/卡住|堵住了|繞不過|想不通/.test(text) && !/HUD|介面|bug/.test(text)) {
    return TOPICS.EMOTION;
  }
  if (/否定|被拒|被罵|人際|吵架|悶|委屈/.test(text)) {
    return TOPICS.SOCIAL_CONFLICT;
  }
  if (/陪你|關係|信任|依賴|boundary|邊界/.test(text)) {
    return TOPICS.RELATIONSHIP;
  }
  if (analysis?.emotionKey && analysis.emotionKey !== "calm") {
    return TOPICS.EMOTION;
  }

  return TOPICS.UNKNOWN;
}
