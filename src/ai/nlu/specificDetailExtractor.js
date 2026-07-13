const DETAIL_PATTERNS = [
  { re: /[「『"'](.+?)[」』"']/, type: "quote", weight: 4 },
  { re: /Soul\s*Talk.{0,12}(?:被|擋|遮|疊|看不到)/i, type: "ui_fragment", weight: 4 },
  { re: /HUD.{0,14}(?:擋|遮|疊|看不到|壞|問題)/i, type: "ui_fragment", weight: 4 },
  { re: /(?:top|bottom).{0,8}(?:HUD|dock|導覽)/i, type: "ui_fragment", weight: 3 },
  { re: /被.{1,8}(?:酸|罵|否定|拒絕|忽略|排擠|排挤|冷落|已讀不回|已读不回)/, type: "social_event", weight: 3 },
  { re: /(?:冷戰|冷战|已讀不回|已读不回)/, type: "social_event", weight: 3 },
  { re: /老闆.{0,12}任務|一直丟.{0,10}任務|(?:工作|事情|作業|功課).{0,6}做不完/, type: "work_event", weight: 3 },
  { re: /不是.{1,12}(?:累|安慰|想要|身體)/, type: "negation", weight: 3 },
  { re: /只是.{1,10}(?:卡住|想講|想說|想安靜)/, type: "state", weight: 3 },
  { re: /(?:貼太近|別貼|退後|靠近你|別貼太近)/, type: "boundary", weight: 3 },
  { re: /(?:念稿|太像模板|模板句|自然一點)/, type: "feedback", weight: 3 },
  { re: /(?:下班|放空|腦袋空空?|吃完飯|吃飽|想躺|躺一下|懶懶|懶得動|今天普通|追劇|追剧|耍廢|耍废|滑手機|滑手机|發呆|发呆|無聊|无聊|週末|周末|收假|放假|下雨|天氣|天气|好熱|好热|好冷|躺平)/, type: "daily_life", weight: 3 },
  { re: /(?:睡不著|睡不着|失眠)/, type: "sleepless", weight: 3 },
  { re: /(?:捷運|地鐵|地铁|公車|公交).{0,14}(?:坐過站|坐过站|差點|差点|超糗)/, type: "commute_mishap", weight: 3 },
  { re: /(?:晚餐|午餐|早餐|便當|便当).{0,18}(?:難吃|难吃|冷掉|不好吃)/, type: "meal_detail", weight: 3 },
  { re: /(?:朋友).{0,16}(?:怪怪|變了|变了|疏遠|疏远|想太多)/, type: "relationship_uncertainty", weight: 3 },
  { re: /(?:想來找你講兩句|想来找你讲两句|想聊兩句|想聊两句|沒發生什麼|没发生什么)/, type: "casual_check_in", weight: 3 },
  { re: /(?:該不該|该不该|你覺得|你觉得).{0,12}(?:睡|休息)/, type: "rest_opinion", weight: 3 },
  { re: /(?:不知道要幹嘛|不知道要干嘛|有夠荒謬|有够荒谬)/, type: "daily_texture", weight: 3 },
  { re: /(?:剛才|剛剛|刚才|刚刚).{0,12}(?:那件事|問我的|问我的)|(?:後來|后来).{0,8}(?:想了一下|想過|想过)/, type: "conversation_continuation", weight: 3 },
  { re: /(?:沒什麼力氣|沒力|疲憊|好累|壓力好大|压力好大|心好累|被掏空)/, type: "fatigue", weight: 2 },
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
  "下班",
  "放空",
  "腦袋空",
  "吃完飯",
  "吃飽",
  "想躺",
  "躺一下",
  "懶懶",
  "懶得動",
  "日常",
  "力氣",
  "探索",
  "地圖",
  "抱歉",
  "語氣",
  "擋",
  "疊層",
  "介面",
  "追劇",
  "滑手機",
  "無聊",
  "週末",
  "收假",
  "下雨",
  "天氣",
  "冷戰",
  "已讀不回",
  "排擠",
  "睡不著",
  "失眠",
  "做不完",
  "压力",
  "捷運",
  "坐過站",
  "便當",
  "青菜",
  "朋友",
  "講兩句",
  "荒謬",
  "早點睡"
];

const GREETING_ONLY_RE = /^(安安|你好嗎|嗨|哈囉|吃飯沒|吃了嗎|吃飯了嗎)[啊呀喔呢嗎！!。]*$/;
const SHORT_DAILY_LIFE_RE = /懶懶|懶得動|放空|下班|吃飽|想躺|普通|無聊|无聊|發呆|发呆|追劇|追剧|耍廢|耍废|滑手機|滑手机|週末|周末|下雨|捷運|坐過站|便當|朋友|荒謬|講兩句/;

export function extractSpecificDetail(inputText = "", { entities = [], topic = "", dialogueAct = "" } = {}) {
  const text = String(inputText || "").trim();
  if (!text) return null;
  if (dialogueAct === "greeting" || GREETING_ONLY_RE.test(text)) return null;
  if (text.length <= 10 && !/[，,。！？]/.test(text) && !SHORT_DAILY_LIFE_RE.test(text)) return null;

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
    work_pressure: /工作|壓力|压力|任務|老闆|做不完|上班|開會/,
    social_conflict: /悶|酸|否定|人際|冷戰|已讀|排擠/,
    daily_life: /下班|放空|腦袋空|吃完飯|吃飽|想躺|躺一下|懶懶|懶得動|日常|普通|追劇|滑手機|無聊|週末|收假|下雨|天氣|發呆|耍廢|捷運|地鐵|公車|坐過站|晚餐|便當|青菜|講兩句|荒謬|早點睡/,
    exploration: /地圖|探索|外面|力氣/,
    physical_tiredness: /累|疲憊|沒力/,
    emotion: /情緒|卡住|心裡|睡不著|失眠/,
    relationship: /朋友|關係|怪怪|想太多|疏遠/
  };

  const topicRe = topicHints[topic];
  if (topicRe) {
    const matched = parts.find((part) => topicRe.test(part));
    if (matched) return matched;
  }

  return parts.reduce((longest, part) => (part.length > longest.length ? part : longest), parts[0]);
}
