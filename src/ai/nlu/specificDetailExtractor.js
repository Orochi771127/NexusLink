const DETAIL_PATTERNS = [
  { re: /[「『"'](.+?)[」』"']/, type: "quote", weight: 4 },
  { re: /Soul\s*Talk.{0,12}(?:被|擋|遮|疊|看不到)/i, type: "ui_fragment", weight: 4 },
  { re: /HUD.{0,14}(?:擋|遮|疊|看不到|壞|問題)/i, type: "ui_fragment", weight: 4 },
  { re: /(?:top|bottom).{0,8}(?:HUD|dock|導覽)/i, type: "ui_fragment", weight: 3 },
  { re: /被.{1,8}(?:酸|罵|否定|拒絕|忽略)/, type: "social_event", weight: 3 },
  { re: /老闆.{0,12}任務|一直丟.{0,10}任務/, type: "work_event", weight: 3 },
  { re: /不是.{1,12}(?:累|安慰|想要|身體)/, type: "negation", weight: 3 },
  { re: /只是.{1,10}(?:卡住|想講|想說|想安靜)/, type: "state", weight: 3 },
  { re: /(?:貼太近|別貼|退後|靠近你|別貼太近)/, type: "boundary", weight: 3 },
  { re: /(?:念稿|太像模板|模板句|自然一點)/, type: "feedback", weight: 3 },
  { re: /(?:沒什麼力氣|沒力|疲憊|好累|壓力好大)/, type: "fatigue", weight: 2 },
  { re: /(?:語氣太差|抱歉|對不起)/, type: "apology", weight: 3 },
  { re: /心裡.{0,4}(?:悶|悶悶)/, type: "emotion_state", weight: 2 }
];

const KEYWORD_HINTS = [
  "老闆",
  "任務",
  "壓力",
  "HUD",
  "Soul Talk",
  "面板",
  "dock",
  "酸",
  "悶",
  "卡住",
  "安慰",
  "靠近",
  "模板",
  "自然",
  "力氣",
  "探索",
  "地圖",
  "抱歉",
  "語氣",
  "擋",
  "疊層",
  "介面"
];

const GREETING_ONLY_RE = /^(安安|你好嗎|嗨|哈囉|吃飯沒|吃了嗎|吃飯了嗎)[啊呀喔呢嗎！!。]*$/;

export function extractSpecificDetail(inputText = "", { entities = [], topic = "", dialogueAct = "" } = {}) {
  const text = String(inputText || "").trim();
  if (!text) return null;
  if (dialogueAct === "greeting" || GREETING_ONLY_RE.test(text)) return null;
  if (text.length <= 10 && !/[，,。！？]/.test(text)) return null;

  let best = null;
  let bestScore = 0;

  for (const pattern of DETAIL_PATTERNS) {
    const match = text.match(pattern.re);
    if (!match) continue;
    const fragment = String(match[1] || match[0]).trim();
    const score = pattern.weight + Math.min(fragment.length / 24, 1);
    if (score > bestScore) {
      bestScore = score;
      best = {
        text: fragment,
        type: pattern.type,
        keywords: deriveKeywords(fragment, entities)
      };
    }
  }

  if (!best && entities.length) {
    const entityContext = extractEntityContext(text, entities[0]);
    if (entityContext) {
      best = {
        text: entityContext,
        type: "entity_context",
        keywords: deriveKeywords(entityContext, entities)
      };
    }
  }

  if (!best) {
    const clause = extractSalientClause(text, topic);
    if (clause) {
      best = {
        text: clause,
        type: "clause",
        keywords: deriveKeywords(clause, entities)
      };
    }
  }

  return best;
}

export function buildPrefilledSpecificDetail(text = "", entities = []) {
  const fragment = String(text || "").trim();
  if (!fragment) return null;
  return {
    text: fragment,
    type: "quick_reply_prefill",
    keywords: deriveKeywords(fragment, entities)
  };
}

export function deriveKeywords(fragment = "", entities = []) {
  const keywords = new Set();
  const haystack = String(fragment || "");

  for (const entity of entities) {
    if (entity) keywords.add(entity);
  }

  for (const hint of KEYWORD_HINTS) {
    if (haystack.includes(hint)) keywords.add(hint);
  }

  const chunks = haystack.match(/[\u4e00-\u9fff]{2,6}|[A-Za-z][A-Za-z\s]{1,12}/g) || [];
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (trimmed.length >= 2) keywords.add(trimmed);
  }

  return [...keywords].slice(0, 8);
}

function extractEntityContext(text, entity) {
  if (!entity) return "";
  const idx = text.indexOf(entity);
  if (idx < 0) return "";
  const start = Math.max(0, idx - 8);
  const end = Math.min(text.length, idx + entity.length + 10);
  return text.slice(start, end).trim();
}

function extractSalientClause(text, topic) {
  const parts = text
    .split(/[，,。！？]/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 4);
  if (!parts.length) return "";

  const topicHints = {
    hud_ui: /HUD|面板|介面|擋|疊/,
    work_pressure: /工作|壓力|任務|老闆/,
    social_conflict: /悶|酸|否定|人際/,
    exploration: /地圖|探索|外面|力氣/,
    physical_tiredness: /累|疲憊|沒力/,
    emotion: /情緒|卡住|心裡/
  };

  const topicRe = topicHints[topic];
  if (topicRe) {
    const matched = parts.find((part) => topicRe.test(part));
    if (matched) return matched;
  }

  return parts.reduce((longest, part) => (part.length > longest.length ? part : longest), parts[0]);
}