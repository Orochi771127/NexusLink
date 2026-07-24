import { composeRaphaelReply } from "../responseComposer.js";
import { repairGenericReply } from "../nlu/nluReplyBuilder.js";
import { buildSafetyRedirectReply } from "../safetyShield.js";
import { buildBoundaryPolicyReply } from "../dialogue/boundaryReplyPolicy.js";
import { deriveStateMutation } from "../stateMutationPolicy.js";
import { buildMemoryDecision } from "../memoryWriter.js";
import { buildAnchorDecision } from "../dialogue/companionAnchorPolicy.js";
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
    sedimentationResult,
    responseStrategy: perception.responseStrategy
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

  // 生活錨點與情緒記憶分開：不要求情緒詞典命中；安全／依賴仍擋。
  const anchorDecision = buildAnchorDecision({
    inputText: gateway.normalizedInput || gateway.originalInput || "",
    nlu: perception.nlu,
    safety: perception.safety,
    stateMutation,
    gateway,
    plan: alignedPlan
  });

  const traceDecision = coerced.shouldCreateTrace
    ? mapHabitatTraceIntent(memoryDecision, alignedPlan, perception.analysis)
    : { traceObject: null, traceIntent: null, shouldApplyTrace: false };

  const animationDecision = perception.safety?.isHighRisk
    ? null
    : mapSoulTalkAnimation({
        plan: { ...alignedPlan, mode: coerced.reaction, animationKey: coerced.animationKey },
        analysis: perception.analysis,
        intent: perception.intent
      });

  let reply = "";
  let composeMeta = null;
  let shouldSpeak = coerced.shouldSpeak;
  let shouldStaySilent = !shouldSpeak;

  if (coerced.selectedAction === "stay_silent" || coerced.selectedAction === "body_cue_only") {
    shouldSpeak = false;
    shouldStaySilent = true;
    reply = "";
  } else if (coerced.selectedAction === "enter_safe_harbor") {
    reply = buildSafetyRedirectReply(perception.safety);
    composeMeta = {
      replySource: "safety",
      variantId: "safety:canonical",
      openingPhrase: ""
    };
    alignedPlan.replyRole = "system";
  } else {
    const composed = composeRaphaelReply({
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
      actionPlan: coerced,
      nlu: perception.nlu,
      responseStrategy: perception.responseStrategy,
      variantSelection: perception.variantSelection
    });
    reply = composed.reply;
    composeMeta = composed;

    if (cooldown.replyLengthCap === "short" && reply.length > 48) {
      reply = trimToShortReply(reply);
    }
  }

  const seed = gateway.normalizedInput.length + Math.round(state.energy || 0);
  const sanitized = sanitizeReply(reply, seed);
  reply = sanitized.text;

  const validation = validatePlannedAction(coerced, reply);
  // 物種 voice pack／safety／template／主動關心引導為作者定稿句，policy 失敗時勿用通用 NLU 覆寫。
  const preserveAuthoredReply = ["response_pack", "safety", "template", "care_guide"].includes(composeMeta?.replySource);
  if (!validation.allowed && reply && !perception.safety?.isHighRisk && !preserveAuthoredReply) {
    reply = sanitizeReply(
      perception.safety?.isBoundaryPressure
        ? buildBoundaryPolicyReply(perception.safety)
        : repairGenericReply({
            strategy: perception.responseStrategy?.strategy,
            nlu: perception.nlu,
            semanticFrame: perception.nlu?.semanticFrame,
            seed
          }),
      seed
    ).text;
  }

  const replyRole = alignedPlan.replyRole || (coerced.reaction === SOUL_TALK_REACTIONS.SAFETY_REDIRECT ? "system" : "companion");

  return {
    replyRole,
    reply,
    composeMeta,
    shouldSpeak: shouldSpeak && Boolean(reply),
    shouldStaySilent,
    statePatch: stateMutation.statePatch || {},
    stateMutation,
    memoryDecision,
    anchorDecision,
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
