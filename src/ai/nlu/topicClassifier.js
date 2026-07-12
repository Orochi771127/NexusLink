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
  // 2026-07-13 訓練批次：日常質感（追劇/滑手機/天氣/週末）、社交細節（冷戰/已讀不回/排擠）、
  // 心累歸「情緒」不歸「身體累」、高頻簡體變體。順序守則：日常 → 心累 → 身體累 → 工作。
  if (/下班|放空|腦袋空|腦袋空空|吃完飯|吃飽|想躺|躺一下|懶懶|懶得動|剛醒|睡醒|日常|今天普通|追劇|追剧|耍廢|耍废|滑手機|滑手机|發呆|发呆|無聊|无聊|週末|周末|假日|放假|收假|下雨|天氣|天气|好熱|好热|好冷|逛街|散步|喝咖啡|泡茶|躺平/.test(text)) {
    return TOPICS.DAILY_LIFE;
  }
  if (/心裡卡住|不是身體累|心裡累|心好累|心累|被掏空|心里累|心里卡住/.test(text)) {
    return TOPICS.EMOTION;
  }
  if (/累|疲憊|疲惫|好睏|好困|沒力|没力|體力|体力/.test(text)) {
    return TOPICS.PHYSICAL_TIREDNESS;
  }
  // 強社交訊號先於工作：「被同事已讀不回」的主體是人際，不是職場壓力。
  if (/冷戰|冷战|已讀不回|已读不回|被排擠|被排挤|被誤會|被误会|翻臉|翻脸|絕交|绝交|被封鎖|被封锁|吵架/.test(text)) {
    return TOPICS.SOCIAL_CONFLICT;
  }
  if (/工作|加班|deadline|壓力很大|壓力好大|壓力大|專案|老闆|老板|主管|任務|丟任務|上班|開會|开会|報告|客戶|同事|考試|作業|功課|唸書|做不完|忙不完|压力很大|压力好大|压力大/.test(text)) {
    return TOPICS.WORK_PRESSURE;
  }
  if (/卡住|堵住了|繞不過|想不通/.test(text) && !/HUD|介面|bug/.test(text)) {
    return TOPICS.EMOTION;
  }
  if (/否定|被拒|被罵|被骂|人際|人际|悶|闷|委屈/.test(text)) {
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
