// Handoff & progress: docs/handoff/RAPHAEL_AI_HANDOFF.md
import { assessInputSafety, isSafetyTerminalDecision } from "./safetyShield.js";
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
import { askHermesShadow } from "./external/hermesShadowAdapter.js";
import { searchCorpus } from "./corpusSearch.js";
import {
  getCompanionPreferenceProfile,
  applyPreferenceToPersona
} from "./companionPreferenceProfile.js";
import { buildRecoveryContext } from "./recovery/recoveryLoop.js";
import { runNluPipeline } from "./nlu/runNluPipeline.js";
import { selectDialogueDirection, DIALOGUE_MODES } from "./dialogue/dialogueDirector.js";
import { buildWorldGrounding } from "./worldAutonomy/worldObservationGrounding.js";
import { selectResponseStrategy, RESPONSE_STRATEGIES } from "./responseStrategySelector.js";
import { LOW_RECALL_INTENTS } from "./memoryRecallPolicy.js";
import {
  applyRecentBoundaryContext,
  applyRecentDialogueContext,
  createEmptyDialogueState,
  getDialogueState,
  recordDialogueTurn,
  getRepetitionScore
} from "./dialogue/dialogueStateTracker.js";
import { evaluateAntiLoop } from "./dialogue/antiLoopPolicy.js";
import { selectReplyVariant } from "./dialogue/replyVariantSelector.js";
import { planQuickReplies } from "./dialogue/quickReplyPlanner.js";
import { buildConversationDebugTrace, logConversationDebugTrace } from "./dialogue/conversationDebugTrace.js";
import { applyQuickReplyContext, resolveQuickReplyStrategy } from "./dialogue/quickReplyContext.js";
import { evaluateConstitutionSignals } from "./eval/constitutionCritic.js";

export function runRaphaelCore(inputText = "", state = {}, runtime = {}) {
  const companion = runtime.companion || null;
  const companionId = companion?.id || state.activeCompanionId || "default";
  const readOnly = runtime.readOnly === true;
  const gateway = prepareSoulTalkInput(inputText, state, runtime);
  const corpus = loadRaphaelCorpus();

  let safety = assessInputSafety(gateway.normalizedInput);
  const analysis = interpretEmotionInput(gateway.originalInput, state, { repeated: gateway.repeated });
  const intent = classifyIntent(gateway.normalizedInput, analysis, safety);
  const dialogueSessionKey = companionId;
  const dialogueState = readOnly
    ? createEmptyDialogueState()
    : getDialogueState(dialogueSessionKey);
  let nlu = runNluPipeline(gateway.normalizedInput, analysis, intent, safety);
  nlu = applyRecentDialogueContext(nlu, dialogueState, {
    companionAnchors: state.companionAnchors || [],
    emotionalMemories: state.emotionalMemories || []
  });
  nlu = applyQuickReplyContext(nlu, runtime.quickReply);
  safety = applyRecentBoundaryContext(safety, nlu, dialogueState, intent);
  
  const worldGrounding = buildWorldGrounding({ state, environment: runtime.environment });
  const dialogueDirection = selectDialogueDirection({
    nlu,
    intent,
    safety,
    worldGrounding,
    recentModes: dialogueState.recentModes || [],
    repeatedReply: false,
    seed: (gateway.normalizedInput || "").length + Math.round(state.energy || 0)
  });

  const isSafetyTerminal = isSafetyTerminalDecision(safety);
  let responseStrategy = isSafetyTerminal
    ? { strategy: RESPONSE_STRATEGIES.SAFETY_REDIRECT, reason: "safety_terminal" }
    : selectResponseStrategy(nlu, intent, safety);
  if (!isSafetyTerminal) {
    responseStrategy = resolveQuickReplyStrategy(runtime.quickReply, responseStrategy);
  }

  const constitutionSignal = isSafetyTerminal ? null : evaluateConstitutionSignals(nlu.semanticFrame, nlu);
  if (!isSafetyTerminal && constitutionSignal?.override) {
    responseStrategy = {
      strategy: constitutionSignal.override,
      reason: constitutionSignal.reason
    };
  }
  const semanticSoul = deriveSemanticSoulState(state, analysis);
  const memories = isSafetyTerminal
    ? createSafetyTerminalMemoryContext()
    : retrieveRelevantMemories(
        state,
        analysis,
        { now: gateway.now, inputText: gateway.normalizedInput },
        intent
      );
  const recoveryContext = isSafetyTerminal
    ? createSafetyTerminalRecoveryContext()
    : buildRecoveryContext(state, memories, analysis, { now: gateway.now });

  if (!isSafetyTerminal && memories.recallPolicy?.blockReason === "repeated_fatigue_recall") {
    responseStrategy = {
      strategy: RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL,
      reason: "repeated_fatigue_recall"
    };
  } else if (
    !isSafetyTerminal &&
    memories.shouldRecall &&
    recoveryContext.allowsExplicitReference &&
    !LOW_RECALL_INTENTS.has(intent.intent)
  ) {
    responseStrategy = { strategy: RESPONSE_STRATEGIES.MEMORY_REFERENCE, reason: "memory_recall_gate" };
  }

  const antiLoopDecision = isSafetyTerminal
    ? { shouldBlock: false, forceStrategy: null, reason: "safety_terminal", complaintType: null }
    : evaluateAntiLoop({
        nlu,
        responseStrategy,
        dialogueState,
        inputText: gateway.normalizedInput,
        sessionKey: dialogueSessionKey
      });

  if (!isSafetyTerminal && antiLoopDecision.shouldBlock && antiLoopDecision.forceStrategy) {
    responseStrategy = {
      strategy: antiLoopDecision.forceStrategy,
      reason: antiLoopDecision.reason
    };
  }

  const variantSeed =
    String(gateway.normalizedInput || "").length +
    Math.round(state.energy || 0) +
    Math.round(state.trust || 0);

  const variantSelection = isSafetyTerminal
    ? null
    : selectReplyVariant({
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

  const preferenceProfile = isSafetyTerminal
    ? runtime.companionPreferenceProfile || {}
    : runtime.companionPreferenceProfile || getCompanionPreferenceProfile(companionId);
  const resolvedPersona = resolvePersona(companion, state);
  const persona = isSafetyTerminal
    ? resolvedPersona
    : applyPreferenceToPersona(resolvedPersona, preferenceProfile);

  const corpusSearch = isSafetyTerminal
    ? {
        emotionHint: null,
        hits: [],
        corpusVersion: corpus.version,
        corpusSource: corpus.source
      }
    : searchCorpus({
        emotionKey: analysis.emotionKey,
        intent: intent.intent,
        inputText: gateway.normalizedInput,
        limit: 3
      });

  const sedimentationResult = isSafetyTerminal
    ? createSafetyTerminalSedimentationResult(safety)
    : processEmotionInput(gateway.normalizedInput, state, {
        now: gateway.now,
        idSuffix: gateway.idSuffix
      });

  const plan = planSoulTalkReaction({ analysis, intent, semanticSoul, safety, state, memories });
  if (dialogueDirection.mode !== DIALOGUE_MODES.FOLLOW && !isSafetyTerminal) {
    plan.mode = dialogueDirection.mode;
    responseStrategy.dialogueMode = dialogueDirection.mode;
  }

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

  const animationDecision = isSafetyTerminal ? null : execution.animationDecision || null;
  const finalReply = execution.reply || "";

  const quickReplies = isSafetyTerminal
    ? []
    : planQuickReplies({
        nlu,
        dialogueState,
        responseStrategy,
        state,
        reply: finalReply
      });

  const debugTrace = buildConversationDebugTrace({
    inputText: isSafetyTerminal ? "[safety-redacted]" : gateway.originalInput,
    nlu,
    responseStrategy,
    composeMeta: execution.composeMeta || null,
    antiLoopDecision,
    variantSelection,
    actionPlan,
    quickReplies,
    reply: finalReply
  });

  if (!isSafetyTerminal && !readOnly) {
    logConversationDebugTrace(debugTrace, runtime);
  }

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
      nuances: nlu.nuances,
      trainingSuggestion: nlu.trainingSuggestion
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
    anchorDecision: execution.anchorDecision || { shouldWrite: false, anchors: [], reason: "missing" },
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

  coreResult.invocation = Object.freeze({
    surface: String(runtime.surface || "soul_talk"),
    readOnly,
    simulationAuthority: false,
    stateWriteApplied: false,
    memoryWriteApplied: false
  });

  // High-risk text remains visible in the UI transcript, but it must not enter
  // Raphael's dialogue-memory or evolution-trace caches.
  if (!isSafetyTerminal && !readOnly) {
    recordDialogueTurn(dialogueSessionKey, coreResult);
    collectInteractionTrace(coreResult);
  }
  return coreResult;
}

function resolveExternalAdvice(runtime, perception, coreDecision) {
  if (isSafetyTerminalDecision(perception.safety)) {
    return { used: false, reason: "safety_terminal" };
  }
  const settings = runtime?.externalIntelligence || {};
  if (!settings.advisorEnabled && !settings.externalEnabled) {
    return { used: false, reason: "external_disabled" };
  }
  return { used: false, reason: "external_enabled_requires_async_gateway", asyncEntry: "askAdvisor" };
}

function createSafetyTerminalMemoryContext() {
  return {
    relevantMemories: [],
    strongestMemory: null,
    similarEmotionMemories: [],
    hasBoundaryMemory: false,
    hasRecentSimilarEmotion: false,
    hasRecallableMemory: false,
    shouldRecall: false,
    recallMode: "none",
    recallPolicy: {
      shouldRecall: false,
      recallMode: "none",
      blockReason: "safety_terminal",
      strongestMemory: null
    },
    recallHint: null,
    allowsExplicitReference: false
  };
}

function createSafetyTerminalRecoveryContext() {
  return {
    canRecall: false,
    phase: "none",
    recallMode: "none",
    shouldRecall: false,
    allowsExplicitReference: false,
    reason: "safety_terminal"
  };
}

function createSafetyTerminalSedimentationResult(safety) {
  return {
    memoryObject: null,
    matchedEmotionKey: null,
    matchedKeywordHits: 0,
    intensity: 0,
    emotionalRepetitionScore: 0,
    recentSimilarEmotionCount: 0,
    safetyRisk: safety,
    inputQuality: "safety_terminal",
    triggerSafeHarbor: true,
    shouldCreateMemory: false,
    shouldBypassSpam: true
  };
}

/** Future: async external advisor path — RaphaelCore still validates final output. */
export async function runRaphaelCoreWithExternal(inputText = "", state = {}, runtime = {}) {
  const coreResult = runRaphaelCore(inputText, state, runtime);
  if (isSafetyTerminalDecision(coreResult.safety)) return coreResult;
  const settings = runtime?.externalIntelligence || {};

  let shadowResult = null;
  if (settings.hermesShadowEnabled) {
    // Issue 4 fix: pass only perception subset, never raw coreResult
    shadowResult = await askHermesShadow(settings, coreResult.perception || {}, inputText);

    // Issue 8 fix: enforce read-only contract
    if (shadowResult) {
      const { assertHermesShadowIsReadOnly } = await import("./external/hermesShadowAdapter.js");
      const readOnlyCheck = assertHermesShadowIsReadOnly(shadowResult);
      if (!readOnlyCheck.ok) {
        console.error("[HermesShadow] READ-ONLY CONTRACT VIOLATED — discarding result");
        shadowResult = null;
      } else {
        console.log("[QA Report] Hermes Shadow Candidates:", shadowResult);
      }
    }
  }

  if (!settings.advisorEnabled && !settings.externalEnabled) {
      return { ...coreResult, hermesShadow: shadowResult };
  }

  const advice = await askAdvisor({
    perception: { ...coreResult.perception, gateway: coreResult.input },
    coreDecision: coreResult.autonomy,
    settings,
    runtime
  });

  return { ...coreResult, externalAdvice: advice, hermesShadow: shadowResult };
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
  import("./testHarness/raphaelTrainingBundleCases.js").then((mod) => mod.installRaphaelTrainingBundleHarness(window));
  import("./testHarness/dialogueLoopSmokeCases.js").then((mod) => mod.installDialogueLoopHarness(window));
  import("./testHarness/constitutionSmokeCases.js").then((mod) => mod.installConstitutionSmokeHarness(window));
  import("./testHarness/raphaelAgentEventCases.js").then((mod) => mod.installRaphaelAgentEventHarness(window));
  import("./testHarness/personaBoundaryEvalCases.js").then((mod) => mod.installPersonaBoundaryHarness(window));
  import("./testHarness/wordingQualityEvalCases.js").then((mod) => mod.installWordingQualityHarness(window));
  import("./testHarness/raphaelAutonomyEvalCases.js").then((mod) => mod.installRaphaelAutonomyEvalHarness(window));
  import("./testHarness/raphaelStandoffEvalCases.js").then((mod) => mod.installRaphaelStandoffEvalHarness(window));
}
