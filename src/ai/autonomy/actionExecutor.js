import { composeRaphaelReply } from "../responseComposer.js";
import { buildSafetyRedirectReply } from "../safetyShield.js";
import { deriveStateMutation } from "../stateMutationPolicy.js";
import { buildMemoryDecision } from "../memoryWriter.js";
import { mapHabitatTraceIntent } from "../habitatTraceMapper.js";
import { mapSoulTalkAnimation } from "../animationMapper.js";
import { sanitizeReply } from "../forbiddenPhrases.js";
import { SOUL_TALK_REACTIONS } from "../reactionPlanner.js";
import { validatePlannedAction, coerceToAllowedAction } from "./actionPolicy.js";

export function executeAutonomousAction({
  state = {},
  perception = {},
  plan = {},
  actionPlan = {},
  sedimentationResult = {},
  companion = null,
  corpus = null,
  cooldown = {}
} = {}) {
  const gateway = perception.gateway || {};
  const coerced = coerceToAllowedAction(actionPlan, perception);

  const alignedPlan = {
    ...plan,
    mode: coerced.reaction || plan.mode,
    shouldCreateMemory: coerced.shouldCreateMemory,
    shouldRewardRelationship: coerced.shouldRewardRelationship,
    replyRole: plan.replyRole || (coerced.reaction === SOUL_TALK_REACTIONS.SAFETY_REDIRECT ? "system" : "companion")
  };

  const stateMutation = deriveStateMutation({
    state,
    gateway,
    safety: perception.safety,
    analysis: perception.analysis,
    intent: perception.intent,
    plan: alignedPlan,
    semanticSoul: perception.semanticSoul,
    memories: perception.memories,
    sedimentationResult
  });

  if (!coerced.shouldRewardRelationship) {
    stateMutation.shouldRewardRelationship = false;
    stateMutation.shouldTriggerMilestone = false;
  }
  if (!coerced.shouldCreateMemory) {
    stateMutation.shouldCreateMemory = false;
  }

  const memoryDecision = buildMemoryDecision({
    state,
    gateway,
    safety: perception.safety,
    analysis: perception.analysis,
    intent: perception.intent,
    plan: alignedPlan,
    stateMutation,
    sedimentationResult
  });

  if (!coerced.shouldCreateMemory) {
    memoryDecision.shouldWrite = false;
    memoryDecision.memoryObject = null;
  }

  const traceDecision = coerced.shouldCreateTrace
    ? mapHabitatTraceIntent(memoryDecision, alignedPlan, perception.analysis)
    : { traceObject: null, traceIntent: null, shouldApplyTrace: false };

  const animationDecision = mapSoulTalkAnimation({
    plan: { ...alignedPlan, mode: coerced.reaction, animationKey: coerced.animationKey },
    analysis: perception.analysis,
    intent: perception.intent
  });

  let reply = "";
  let shouldSpeak = coerced.shouldSpeak;
  let shouldStaySilent = !shouldSpeak;

  if (coerced.selectedAction === "stay_silent" || coerced.selectedAction === "body_cue_only") {
    shouldSpeak = false;
    shouldStaySilent = true;
    reply = "";
  } else if (coerced.selectedAction === "enter_safe_harbor") {
    reply = buildSafetyRedirectReply(perception.safety);
    alignedPlan.replyRole = "system";
  } else {
    reply = composeRaphaelReply({
      inputText: gateway.normalizedInput,
      analysis: perception.analysis,
      intent: perception.intent,
      plan: alignedPlan,
      safety: perception.safety,
      state,
      companion,
      persona: perception.persona,
      corpus,
      corpusHits: perception.corpusHits,
      semanticSoul: perception.semanticSoul,
      recoveryContext: perception.recoveryContext,
      actionPlan: coerced
    });

    if (cooldown.replyLengthCap === "short" && reply.length > 48) {
      reply = trimToShortReply(reply);
    }
  }

  const seed = gateway.normalizedInput.length + Math.round(state.energy || 0);
  const sanitized = sanitizeReply(reply, seed);
  reply = sanitized.text;

  const validation = validatePlannedAction(coerced, reply);
  if (!validation.allowed && reply) {
    reply = sanitizeReply("我聽見了。我們先慢一點。", seed).text;
  }

  const replyRole = alignedPlan.replyRole || (coerced.reaction === SOUL_TALK_REACTIONS.SAFETY_REDIRECT ? "system" : "companion");

  return {
    replyRole,
    reply,
    shouldSpeak: shouldSpeak && Boolean(reply),
    shouldStaySilent,
    statePatch: stateMutation.statePatch || {},
    stateMutation,
    memoryDecision,
    traceDecision,
    animationDecision,
    actionPlan: coerced,
    forbiddenPhraseDetected: sanitized.forbiddenPhraseDetected,
    policyValidation: validation
  };
}

function trimToShortReply(text) {
  const first = String(text || "").split(/[\n。！？]/).map((part) => part.trim()).filter(Boolean)[0];
  return first ? `${first}。` : "我聽見了。";
}