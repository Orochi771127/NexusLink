import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";
import { buildSafetyRedirectReply } from "./safetyShield.js";
import { selectResponsePackLine } from "./corpus/responsePackSelector.js";
import { renderTemplateReply } from "./corpus/templateRenderer.js";
import { RESPONSE_STRATEGIES } from "./responseStrategySelector.js";
import { buildStrategyReply, repairGenericReply } from "./nlu/nluReplyBuilder.js";
import { critiqueGenericReply } from "./eval/genericReplyCritic.js";

const BOUNDARY_MODES = new Set([
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.REJECT,
  SOUL_TALK_REACTIONS.HESITATE
]);

const COMFORT_BLOCK_STRATEGIES = new Set([
  RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION,
  RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE,
  RESPONSE_STRATEGIES.PRACTICAL_EXPLANATION,
  RESPONSE_STRATEGIES.PRACTICAL_PLANNING,
  RESPONSE_STRATEGIES.QUIET_PRESENCE
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
  actionPlan = {},
  replyMode = "",
  nlu = null,
  responseStrategy = null
} = {}) {
  const composeOpts = {
    recoveryRecall: Boolean(recoveryContext?.allowsExplicitReference && recoveryContext?.canRecall),
    recallMode: recoveryContext?.recallMode || "none",
    replyMode: replyMode || actionPlan.replyMode || "",
    nlu,
    responseStrategy
  };

  if (plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT) {
    return buildSafetyRedirectReply(safety);
  }

  const seed = buildSeed(inputText, state, companion);
  const emotionKey = analysis.emotionKey || "calm";
  const mode = plan.mode || actionPlan.reaction || SOUL_TALK_REACTIONS.ACKNOWLEDGE;
  const companionId = companion?.id || persona?.companionId || "greyshade-cat";
  const loadedCorpus = corpus || {};
  const strategy = responseStrategy?.strategy || RESPONSE_STRATEGIES.CONTEXTUAL_ACK;
  const blockComfort = shouldBlockComfortPacks(nlu, strategy);

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
    if (boundaryLine.line) {
      return finalizeAndGuardReply(boundaryLine.line, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }
    const boundaryFallback =
      mode === SOUL_TALK_REACTIONS.WITHDRAW
        ? "我聽見你很需要有人在。但如果你說『不准拒絕』，我會先退後一點。"
        : mode === SOUL_TALK_REACTIONS.REJECT
          ? "這樣的靠近太快了。"
          : "我需要一點距離，才能好好聽你。";
    return finalizeAndGuardReply(boundaryFallback, {
      persona,
      state,
      composeOpts,
      nlu,
      previousReply: getPreviousCompanionReply(state)
    });
  }

  if (strategy === RESPONSE_STRATEGIES.MEMORY_REFERENCE && composeOpts.recoveryRecall) {
    const awakeningReply = buildStrategyReply({
      strategy,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed,
      recoveryContext
    });
    if (awakeningReply) {
      return finalizeAndGuardReply(awakeningReply, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }

    const templateReply = renderTemplateReply({
      corpus: loadedCorpus,
      companionId,
      recoveryContext,
      analysis,
      reaction: mode,
      seed
    });
    if (templateReply?.text) {
      return finalizeAndGuardReply(templateReply.text, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }
  }

  if (strategy !== RESPONSE_STRATEGIES.MEMORY_REFERENCE) {
    const strategyReply = buildStrategyReply({
      strategy,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed,
      recoveryContext
    });
    if (strategyReply) {
      return finalizeAndGuardReply(strategyReply, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }
  }

  if (!blockComfort) {
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

    if (packLine.line && !packLine.silent) {
      return finalizeAndGuardReply(packLine.line, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }
  }

  if (intent.intent === SOUL_TALK_INTENTS.QUESTION && mode === SOUL_TALK_REACTIONS.ACKNOWLEDGE) {
    const questionReply = buildStrategyReply({
      strategy: RESPONSE_STRATEGIES.ANSWER_OR_CLARIFY,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed
    });
    if (questionReply) {
      return finalizeAndGuardReply(questionReply, {
        persona,
        state,
        composeOpts,
        nlu,
        previousReply: getPreviousCompanionReply(state)
      });
    }
  }

  const fallback = buildStrategyReply({
    strategy: RESPONSE_STRATEGIES.CLARIFYING_QUESTION,
    nlu,
    semanticFrame: nlu?.semanticFrame,
    seed: seed + 3
  });

  return finalizeAndGuardReply(fallback || "我在。你想我先懂的是哪一段？", {
    persona,
    state,
    composeOpts,
    nlu,
    previousReply: getPreviousCompanionReply(state)
  });
}

export function finalizeAndGuardReply(text, { persona, state, composeOpts, nlu, previousReply }) {
  let reply = finalizeReply(text, persona, state, composeOpts);
  const critique = critiqueGenericReply({
    reply,
    nlu,
    state,
    previousReply
  });

  if (!critique.pass) {
    reply = repairGenericReply({
      strategy: composeOpts.responseStrategy?.strategy,
      nlu,
      semanticFrame: nlu?.semanticFrame,
      seed: buildSeed("", state, null),
      recoveryContext: null
    });
    reply = finalizeReply(reply, persona, state, composeOpts);
  }

  return reply;
}

function shouldBlockComfortPacks(nlu, strategy) {
  const constraints = nlu?.semanticFrame?.constraints || nlu?.constraints || [];
  if (constraints.includes("not_seeking_comfort")) return true;
  if (COMFORT_BLOCK_STRATEGIES.has(strategy)) return true;
  if (nlu?.preferredResponse === "practical_short") return true;
  return false;
}

function getPreviousCompanionReply(state = {}) {
  const history = Array.isArray(state.chatHistory) ? state.chatHistory : [];
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === "companion") return history[index].text || "";
  }
  return "";
}

function finalizeReply(text, persona, state, options = {}) {
  let reply = String(text || "").trim();
  const isRecovery = options.recoveryRecall || options.replyMode === "reflect";

  if (!isRecovery && (state.energy ?? 10) <= 2 && reply.length > 42) {
    reply = reply.split(/[。！？]/)[0] + "。";
  }

  if (!persona) return reply;

  const styledPersona = isRecovery
    ? { ...persona, responseBias: { ...persona.responseBias, maxSentences: 3 } }
    : persona;

  return applyPersonaStyle(reply, styledPersona);
}

function corpusSeedOffset(corpusHits = []) {
  if (!corpusHits?.length) return 0;
  return corpusHits.reduce((sum, hit) => sum + String(hit.id || "").length, 0) % 7;
}

function buildSeed(inputText, state, companion) {
  return (
    String(inputText || "").length +
    Math.round(state.energy || 0) +
    Math.round(state.trust || 0) +
    String(companion?.id || companion?.name || "").length
  );
}