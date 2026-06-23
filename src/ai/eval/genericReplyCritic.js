import { replyReferencesDetail } from "../nlu/explicitReference.js";

const GENERIC_PATTERNS = [
  /^好[，,]?\s*我聽見了/,
  /^我聽見了[。.]?\s*我們先慢一點/,
  /^我聽見了[。.]?\s*我們慢一點/,
  /^我聽見了[。.]?$/,
  /^好[，,]?\s*我們先慢一點/,
  /^我在旁邊聽著[。.]?$/,
  /^我聽見你在說.+。我們先從這個點開始。$/
];

const THIN_ACK_RE = /^(我在|嗯|好)[。.]?$/;

const GENERIC_FRAGMENTS = ["好", "我聽到了", "我聽見了", "慢一點", "我們慢一點", "我在旁邊"];

export function critiqueGenericReply({
  reply = "",
  nlu = {},
  perception = {},
  state = {},
  previousReply = ""
} = {}) {
  const issues = [];
  const text = String(reply || "").trim();
  const frame = nlu.semanticFrame || perception?.nlu?.semanticFrame || {};
  const preferred = frame.preferredResponse || nlu.preferredResponse || "";
  const topic = frame.topic || nlu.topic || "";
  const entities = frame.entities || [];
  const constraints = frame.constraints || [];
  const specificDetail = frame.specificDetail || null;

  if (!text) return { pass: true, issues: [], repairHint: "" };

  if (GENERIC_PATTERNS.some((re) => re.test(text))) {
    issues.push("generic_fallback_reply");
  }

  if (THIN_ACK_RE.test(text) && topic !== "unknown") {
    issues.push("thin_ack_without_grounding");
  }

  const onlyGeneric = text.length <= 24 && GENERIC_FRAGMENTS.some((frag) => text.includes(frag));
  if (onlyGeneric && topic !== "unknown") {
    issues.push("generic_without_topic");
  }

  const hasTopicRef =
    (topic !== "unknown" && text.includes(topicLabel(topic))) ||
    entities.some((entity) => text.includes(entity)) ||
    mentionsTopicKeyword(text, topic);

  if (
    topic !== "unknown" &&
    !hasTopicRef &&
    !["quiet_presence", "acknowledge_generic_failure", "practical_short"].includes(preferred)
  ) {
    issues.push("missing_topic_reference");
  }

  if (
    specificDetail?.text &&
    !replyReferencesDetail(text, specificDetail) &&
    !["quiet_presence", "light_greeting"].includes(preferred)
  ) {
    issues.push("missing_specific_detail_reference");
  }

  if (constraints.includes("not_seeking_comfort") && /安慰|沒事|會好起來|我在這裡陪/.test(text)) {
    issues.push("comfort_violates_constraint");
  }

  if (constraints.includes("no_questions") && /[？?]/.test(text)) {
    issues.push("question_violates_constraint");
  }

  if (preferred === "practical_short" && /慢一點|我在旁邊|陪你把情緒/.test(text)) {
    issues.push("comfort_instead_of_practical");
  }

  if (previousReply && similarity(text, previousReply) > 0.82) {
    issues.push("too_similar_to_previous_reply");
  }

  return {
    pass: issues.length === 0,
    issues,
    repairHint: issues.length ? "Rebuild reply from NLU strategy with topic/entity grounding." : ""
  };
}

function topicLabel(topic) {
  const labels = {
    hud_ui: "HUD",
    development: "開發",
    raphael_ai: "理解",
    exploration: "探索",
    awakening: "初醒",
    social_conflict: "悶"
  };
  return labels[topic] || topic;
}

function mentionsTopicKeyword(text, topic) {
  const map = {
    hud_ui: /HUD|介面|面板|dock|疊層/,
    development: /開發|修|優先|UI|AI/,
    raphael_ai: /理解|intent|semanticFrame|自然語言|回覆層/,
    exploration: /地圖|探索|外面|湖面/,
    awakening: /初醒|醒來|心核/,
    social_conflict: /悶|否定|委屈/,
    work_pressure: /工作|壓力|任務|老闆/,
    physical_tiredness: /累|疲憊|沒力/,
    emotion: /情緒|卡住|心裡/
  };
  return map[topic] ? map[topic].test(text) : false;
}

function similarity(a, b) {
  const left = String(a || "");
  const right = String(b || "");
  if (!left || !right) return 0;
  const shorter = left.length < right.length ? left : right;
  const longer = left.length >= right.length ? left : right;
  if (longer.includes(shorter)) return shorter.length / longer.length;
  return 0;
}