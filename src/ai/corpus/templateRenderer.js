import { selectResponsePackLine } from "./responsePackSelector.js";

const EMOTION_LABELS = Object.freeze({
  fatigue: "疲憊",
  sadness: "難過",
  anxiety: "焦慮",
  loneliness: "孤單",
  anger: "憤怒",
  gratitude: "感謝",
  calm: "安靜"
});

const TRACE_MOTIF_LABELS = Object.freeze({
  campfire_dim: "營火",
  blue_lantern: "藍色燈籠",
  glitch_mist: "薄霧",
  faint_spark: "微光",
  soft_ripple: "漣漪",
  repaired_light: "修補過的光",
  quiet_glow: "淡光"
});

const STATUS_LABELS = Object.freeze({
  fresh: "剛留下",
  settled: "慢慢沉澱",
  transformed: "被修補過"
});

const SMALL_ACTIONS = Object.freeze({
  fatigue: "把聲音放慢",
  sadness: "先只是難過",
  anxiety: "先抓住一點穩定",
  loneliness: "讓湖面留一點光",
  anger: "找一個不會燒傷自己的地方",
  calm: "先停一下",
  gratitude: "把這份感謝放著"
});

export function renderTemplateReply({
  corpus = {},
  companionId = "greyshade-cat",
  recoveryContext = null,
  analysis = {},
  reaction = "acknowledge",
  seed = 0
} = {}) {
  if (!recoveryContext?.canRecall) return null;

  const recoveryPack = selectResponsePackLine({
    corpus,
    companionId,
    emotion: analysis.emotionKey,
    reaction,
    recoveryContext,
    seed
  });

  if (recoveryPack.line && recoveryPack.source === "response_pack") {
    return { text: recoveryPack.line, source: "recovery_pack", packId: recoveryPack.packId };
  }

  const templates = resolveCompanionTemplates(corpus, companionId);
  const slots = buildTemplateSlots(recoveryContext, analysis);

  for (const templateDef of templates) {
    if (!templateMatches(templateDef, recoveryContext, analysis)) continue;
    const text = fillTemplate(templateDef.template, slots);
    if (text) return { text, source: "template", templateId: templateDef.id };
  }

  return null;
}

function templateMatches(templateDef, recoveryContext, analysis) {
  if (templateDef.requiresRecall && !recoveryContext?.canRecall) return false;
  if (templateDef.emotion && templateDef.emotion !== analysis.emotionKey) return false;
  if (templateDef.requiresTraceMotif && recoveryContext.traceMotif !== templateDef.requiresTraceMotif) {
    return false;
  }
  return true;
}

function buildTemplateSlots(recoveryContext = {}, analysis = {}) {
  const emotionKey = analysis.emotionKey || "calm";
  return {
    memoryTheme: recoveryContext.memoryTheme || "那段情緒",
    currentEmotion: emotionKey,
    currentEmotionLabel: EMOTION_LABELS[emotionKey] || "某種感覺",
    traceMotif: recoveryContext.traceMotif || "quiet_glow",
    traceMotifLabel: TRACE_MOTIF_LABELS[recoveryContext.traceMotif] || "棲地的光",
    memoryStatus: recoveryContext.memoryStatus || "fresh",
    memoryStatusLabel: STATUS_LABELS[recoveryContext.memoryStatus] || "留下來",
    smallAction: SMALL_ACTIONS[emotionKey] || "先慢一點"
  };
}

function resolveCompanionTemplates(corpus = {}, companionId = "greyshade-cat") {
  const root = corpus.templates || {};
  if (root[companionId]?.templates) return root[companionId].templates;
  if (root.templates) return root.templates;
  return [];
}

function fillTemplate(template = "", slots = {}) {
  let text = String(template || "");
  for (const [key, value] of Object.entries(slots)) {
    text = text.replaceAll(`{${key}}`, value);
  }
  return text.includes("{") ? "" : text;
}