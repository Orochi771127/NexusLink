// Handoff & progress: docs/handoff/RAPHAEL_AI_HANDOFF.md
import { assessInputSafety } from "./safetyShield.js";
import { interpretEmotionInput } from "./emotionInterpreter.js";
import { classifyIntent } from "./intentClassifier.js";
import { deriveSemanticSoulState } from "./semanticSoulModel.js";
import { planSoulTalkReaction } from "./reactionPlanner.js";
import { prepareSoulTalkInput } from "./inputGateway.js";
import { retrieveRelevantMemories } from "./memoryRetriever.js";
import { resolvePersona } from "./personaResolver.js";
import { loadRaphaelCorpus } from "./corpusLoader.js";
import { detectForbiddenPhrases } from "./forbiddenPhrases.js";
import { processEmotionInput } from "../engine/emotionalSedimentationEngine.js";
import { runAutonomyLoop } from "./autonomy/autonomyLoop.js";
import { collectInteractionTrace } from "./evolution/interactionTraceCollector.js";
import { askAdvisor } from "./external/externalModelGateway.js";
import { searchCorpus } from "./corpusSearch.js";
import {
  getCompanionPreferenceProfile,
  applyPreferenceToPersona
} from "./companionPreferenceProfile.js";
import { buildRecoveryContext } from "./recovery/recoveryLoop.js";
import { runNluPipeline } from "./nlu/runNluPipeline.js";
import { selectResponseStrategy, RESPONSE_STRATEGIES } from "./responseStrategySelector.js";
import { LOW_RECALL_INTENTS } from "./memoryRecallPolicy.js";
import { getDialogueState, recordDialogueTurn, getRepetitionScore } from "./dialogue/dialogueStateTracker.js";
import { evaluateAntiLoop } from "./dialogue/antiLoopPolicy.js";
import { selectReplyVariant } from "./dialogue/replyVariantSelector.js";
import { planQuickReplies } from "./dialogue/quickReplyPlanner.js";
import { buildConversationDebugTrace, logConversationDebugTrace } from "./dialogue/conversationDebugTrace.js";
import { applyQuickReplyContext, resolveQuickReplyStrategy } from "./dialogue/quickReplyContext.js";
import { evaluateConstitutionSignals } from "./eval/constitutionCritic.js";

export function runRaphaelCore(inputText = "", state = {}, runtime = {}) {
  const companion = runtime.companion || null;
  const companionId = companion?.id || state.activeCompanionId || "default";
  const gateway = prepareSoulTalkInput(inputText, state, runtime);
  const corpus = loadRaphaelCorpus();

  const safety = assessInputSafety(gateway.normalizedInput);
  const analysis = interpretEmotionInput(gateway.originalInput, state, { repeated: gateway.repeated });
  const intent = classifyIntent(gateway.normalizedInput, analysis, safety);
  let nlu = runNluPipeline(gateway.normalizedInput, analysis, intent, safety);
  nlu = applyQuickReplyContext(nlu, runtime.quickReply);
  let responseStrategy = selectResponseStrategy(nlu, intent, safety);
  responseStrategy = resolveQuickReplyStrategy(runtime.quickReply, responseStrategy);

  const constitutionSignal = evaluateConstitutionSignals(nlu.semanticFrame, nlu);
  if (constitutionSignal?.override) {
    responseStrategy = {
      strategy: constitutionSignal.override,
      reason: constitutionSignal.reason
    };
  }
  const semanticSoul = deriveSemanticSoulState(state, analysis);
  const memories = retrieveRelevantMemories(
    state,
    analysis,
    { now: gateway.now, inputText: gateway.normalizedInput },
    intent
  );
  const recoveryContext = buildRecoveryContext(state, memories, analysis, { now: gateway.now });

  if (memories.recallPolicy?.blockReason === "repeated_fatigue_recall") {
    responseStrategy = {
      strategy: RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL,
      reason: "repeated_fatigue_recall"
    };
  } else if (
    memories.shouldRecall &&
    recoveryContext.allowsExplicitReference &&
    !LOW_RECALL_INTENTS.has(intent.intent)
  ) {
    responseStrategy = { strategy: RESPONSE_STRATEGIES.MEMORY_REFERENCE, reason: "memory_recall_gate" };
  }

  const dialogueSessionKey = companionId;
  const dialogueState = getDialogueState(dialogueSessionKey);
  const antiLoopDecision = evaluateAntiLoop({
    nlu,
    responseStrategy,
    dialogueState,
    inputText: gateway.normalizedInput,
    sessionKey: dialogueSessionKey
  });

  if (antiLoopDecision.shouldBlock && antiLoopDecision.forceStrategy) {
    responseStrategy = {
      strategy: antiLoopDecision.forceStrategy,
      reason: antiLoopDecision.reason
    };
  }

  const variantSeed =
    String(gateway.normalizedInput || "").length +
    Math.round(state.energy || 0) +
    Math.round(state.trust || 0);

  const variantSelection = selectReplyVariant({
    responseStrategy,
    nlu,
    dialogueState,
    corpus,
    companionId,
    analysis,
    intent,
    plan: { mode: "acknowledge" },
    state,
    semanticSoul,
    recoveryContext,
    seed: variantSeed
  });

  const preferenceProfile =
    runtime.companionPreferenceProfile || getCompanionPreferenceProfile(companionId);
  const persona = applyPreferenceToPersona(resolvePersona(companion, state), preferenceProfile);

  const corpusSearch = searchCorpus({
    emotionKey: analysis.emotionKey,
    intent: intent.intent,
    inputText: gateway.normalizedInput,
    limit: 3
  });

  const sedimentationResult = processEmotionInput(gateway.normalizedInput, state, {
    now: gateway.now,
    idSuffix: gateway.idSuffix
  });

  const plan = planSoulTalkReaction({ analysis, intent, semanticSoul, safety, state, memories });

  const perception = {
    gateway,
    safety,
    analysis,
    intent,
    semanticSoul,
    memories,
    persona,
    corpusHits: corpusSearch.hits,
    corpusMeta: {
      version: corpusSearch.corpusVersion,
      source: corpusSearch.corpusSource,
      emotionHint: corpusSearch.emotionHint
    },
    preferenceProfile,
    recoveryContext,
    nlu,
    responseStrategy,
    antiLoopDecision,
    variantSelection
  };

  const autonomyResult = runAutonomyLoop({
    state,
    perception,
    plan,
    sedimentationResult,
    companion,
    corpus,
    preferenceProfile,
    runtime
  });

  const { execution, reflection, reflectionPasses, needs, actionPlan, critique, preferenceProfile: updatedProfile } =
    autonomyResult;
  const forbiddenCheck = detectForbiddenPhrases(execution.reply || "");

  const externalAdvice = resolveExternalAdvice(runtime, perception, actionPlan);

  const animationDecision = execution.animationDecision || null;
  const finalReply = execution.reply || "";

  const quickReplies = planQuickReplies({
    nlu,
    dialogueState: getDialogueState(dialogueSessionKey),
    responseStrategy,
    state,
    reply: finalReply
  });

  const debugTrace = buildConversationDebugTrace({
    inputText: gateway.originalInput,
    nlu,
    responseStrategy,
    composeMeta: execution.composeMeta || null,
    antiLoopDecision,
    variantSelection,
    quickReplies,
    reply: finalReply
  });

  logConversationDebugTrace(debugTrace, runtime);

  const coreResult = {
    now: gateway.now,
    inputText: gateway.originalInput,
    input: gateway,

    perception: {
      safety,
      analysis,
      intent,
      semanticSoul,
      memories,
      persona,
      corpusHits: perception.corpusHits,
      corpusMeta: perception.corpusMeta,
      preferenceProfile: updatedProfile,
      recoveryContext,
      nlu,
      responseStrategy
    },

    nlu: {
      semanticFrame: nlu.semanticFrame,
      dialogueAct: nlu.dialogueAct,
      topic: nlu.topic,
      confidence: nlu.confidence,
      confidenceBand: nlu.confidenceBand,
      constraints: nlu.constraints,
      preferredResponse: nlu.preferredResponse,
      entities: nlu.entities,
      nuances: nlu.nuances
    },

    responseStrategy,
    composeMeta: execution.composeMeta || null,
    quickReplies,
    debugTrace,
    dialogueLoop: {
      antiLoopApplied: Boolean(antiLoopDecision.shouldBlock),
      antiLoopReason: antiLoopDecision.reason || null,
      forceStrategy: antiLoopDecision.forceStrategy || null,
      repetitionScore: getRepetitionScore(dialogueState),
      variantSelection
    },

    autonomy: {
      needs,
      activeGoal: actionPlan.activeGoal,
      selectedAction: actionPlan.selectedAction,
      reason: actionPlan.reason,
      confidence: actionPlan.confidence
    },

    plan: {
      ...plan,
      mode: actionPlan.reaction || plan.mode
    },

    output: {
      replyRole: execution.replyRole,
      reply: execution.reply,
      shouldSpeak: execution.shouldSpeak,
      shouldStaySilent: execution.shouldStaySilent
    },

    stateMutation: execution.stateMutation,
    memoryDecision: execution.memoryDecision,
    traceDecision: execution.traceDecision,
    animationDecision,
    reflection,
    reflectionPasses,
    critique,
    externalAdvice,
    renderMeta: execution.renderMeta || null,
    cooldown: autonomyResult.cooldown,
    preferenceProfile: updatedProfile,

    corpusMeta: { version: corpus.version, source: corpus.source },
    sedimentationResult: execution.memoryDecision?.sedimentationResult || sedimentationResult,

    safety,
    analysis,
    intent,
    semanticSoul,
    memories,
    persona,
    reply: execution.reply,
    replyRole: execution.replyRole,
    forbiddenPhraseDetected: Boolean(execution.forbiddenPhraseDetected || forbiddenCheck.hasForbidden)
  };

  recordDialogueTurn(dialogueSessionKey, coreResult);
  collectInteractionTrace(coreResult);
  return coreResult;
}

function resolveExternalAdvice(runtime, perception, coreDecision) {
  const settings = runtime?.externalIntelligence || {};
  if (!settings.advisorEnabled && !settings.externalEnabled) {
    return { used: false, reason: "external_disabled" };
  }
  return { used: false, reason: "external_enabled_requires_async_gateway", asyncEntry: "askAdvisor" };
}

/** Future: async external advisor path — RaphaelCore still validates final output. */
export async function runRaphaelCoreWithExternal(inputText = "", state = {}, runtime = {}) {
  const coreResult = runRaphaelCore(inputText, state, runtime);
  const settings = runtime?.externalIntelligence || {};
  if (!settings.advisorEnabled && !settings.externalEnabled) return coreResult;

  const advice = await askAdvisor({
    perception: { ...coreResult.perception, gateway: coreResult.input },
    coreDecision: coreResult.autonomy,
    settings,
    runtime
  });

  return { ...coreResult, externalAdvice: advice };
}

export { applyRaphaelCoreResult } from "./applyCoreResult.js";

if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("raphaelSmoke") === "1") {
  import("./testHarness/raphaelCoreSmokeCases.js").then((mod) => mod.installRaphaelSmokeHarness(window));
  import("./testHarness/awakeningGateSmokeCases.js").then((mod) => mod.installAwakeningSmokeHarness(window));
  import("./testHarness/raphaelGrowthSession.js").then((mod) => mod.installRaphaelGrowthHarness(window));
  import("./testHarness/raphaelCrossSessionPreferenceCases.js").then((mod) =>
    mod.installCrossSessionPreferenceHarness(window)
  );
  import("./testHarness/raphaelGatewaySmokeCases.js").then((mod) => mod.installGatewaySmokeHarness(window));
  import("./testHarness/nluSmokeCases.js").then((mod) => mod.installNluSmokeHarness(window));
  import("./testHarness/stage4HumanPlaytestCases.js").then((mod) => mod.installStage4PlaytestHarness(window));
  import("./testHarness/nluTrainingCases.js").then((mod) => mod.installNluTrainingHarness(window));
  import("./testHarness/dialogueLoopSmokeCases.js").then((mod) => mod.installDialogueLoopHarness(window));
  import("./testHarness/constitutionSmokeCases.js").then((mod) => mod.installConstitutionSmokeHarness(window));
  import("./testHarness/raphaelAgentEventCases.js").then((mod) => mod.installRaphaelAgentEventHarness(window));
}
