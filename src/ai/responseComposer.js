import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";
import { buildSafetyRedirectReply } from "./safetyShield.js";
import { selectResponsePackLine } from "./corpus/responsePackSelector.js";
import { renderTemplateReply } from "./corpus/templateRenderer.js";

const BOUNDARY_MODES = new Set([
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.REJECT,
  SOUL_TALK_REACTIONS.HESITATE
]);

function applyPersonaStyle(text, persona = {}) {
  const style = persona.sentenceStyle || "balanced";
  if (style !== "short_quiet") return text;

  const parts = String(text || "")
    .split(/[\n。！？]/)
    .map((part) => part.trim())
    .filter(Boolean);

  const maxSentences = persona.responseBias?.maxSentences || 2;
  return parts.slice(0, maxSentences).join("。") + (parts.length ? "。" : "");
}

export function composeRaphaelReply({
  inputText = "",
  analysis = {},
  intent = {},
  plan = {},
  safety = {},
  state = {},
  companion = null,
  persona = null,
  corpus = null,
  corpusHits = null,
  semanticSoul = {},
  recoveryContext = null,
  actionPlan = {}
} = {}) {
  if (plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT) {
    return buildSafetyRedirectReply(safety);
  }

  const seed = buildSeed(inputText, state, companion);
  const emotionKey = analysis.emotionKey || "calm";
  const mode = plan.mode || actionPlan.reaction || SOUL_TALK_REACTIONS.ACKNOWLEDGE;
  const companionId = companion?.id || persona?.companionId || "greyshade-cat";
  const loadedCorpus = corpus || {};

  if (BOUNDARY_MODES.has(mode)) {
    if (safety?.category === "dependency_pressure") {
      return buildSafetyRedirectReply(safety);
    }
    const boundaryLine = selectResponsePackLine({
      corpus: loadedCorpus,
      companionId,
      emotion: "boundary",
      intent: intent.intent,
      reaction: mode,
      state,
      semanticSoul,
      recoveryContext,
      seed
    });
    if (boundaryLine.line) return finalizeReply(boundaryLine.line, persona, state);
  }

  const templateReply = renderTemplateReply({
    corpus: loadedCorpus,
    companionId,
    recoveryContext,
    analysis,
    reaction: mode,
    seed
  });
  if (templateReply?.text) return finalizeReply(templateReply.text, persona, state);

  const packLine = selectResponsePackLine({
    corpus: loadedCorpus,
    companionId,
    emotion: emotionKey,
    intent: intent.intent,
    reaction: mode,
    state,
    semanticSoul,
    recoveryContext,
    seed: seed + corpusSeedOffset(corpusHits)
  });

  if (packLine.line) return finalizeReply(packLine.line, persona, state);

  if (intent.intent === SOUL_TALK_INTENTS.QUESTION && mode === SOUL_TALK_REACTIONS.ACKNOWLEDGE) {
    return finalizeReply(
      pickLine(
        [
          "這個問題我先收著。有些答案要在湖邊待久一點才浮上來。",
          "我不一定立刻有答案，但我可以陪你把問題放慢。"
        ],
        seed
      ),
      persona,
      state
    );
  }

  return finalizeReply("我聽見了。我們先慢一點。", persona, state);
}

function finalizeReply(text, persona, state) {
  let reply = String(text || "").trim();
  if ((state.energy ?? 10) <= 2 && reply.length > 42) {
    reply = reply.split(/[。！？]/)[0] + "。";
  }
  return persona ? applyPersonaStyle(reply, persona) : reply;
}

function corpusSeedOffset(corpusHits = []) {
  if (!corpusHits?.length) return 0;
  return corpusHits.reduce((sum, hit) => sum + String(hit.id || "").length, 0) % 7;
}

function pickLine(lines = [], seed = 0) {
  return lines[Math.abs(seed) % lines.length] || "我聽見了。";
}

function buildSeed(inputText, state, companion) {
  return (
    String(inputText || "").length +
    Math.round(state.energy || 0) +
    Math.round(state.trust || 0) +
    String(companion?.id || companion?.name || "").length
  );
}