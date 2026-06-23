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

export function runRaphaelCore(inputText = "", state = {}, runtime = {}) {
  const companion = runtime.companion || null;
  const companionId = companion?.id || state.activeCompanionId || "default";
  const gateway = prepareSoulTalkInput(inputText, state, runtime);
  const corpus = loadRaphaelCorpus();

  const safety = assessInputSafety(gateway.normalizedInput);
  const analysis = interpretEmotionInput(gateway.originalInput, state, { repeated: gateway.repeated });
  const intent = classifyIntent(gateway.normalizedInput, analysis, safety);
  const semanticSoul = deriveSemanticSoulState(state, analysis);
  const memories = retrieveRelevantMemories(state, analysis, { now: gateway.now });

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
    preferenceProfile
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
      preferenceProfile: updatedProfile
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
    settings
  });

  return { ...coreResult, externalAdvice: advice };
}

export { applyRaphaelCoreResult } from "./applyCoreResult.js";

if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("raphaelSmoke") === "1") {
  import("./testHarness/raphaelCoreSmokeCases.js").then((mod) => mod.installRaphaelSmokeHarness(window));
  import("./testHarness/awakeningGateSmokeCases.js").then((mod) => mod.installAwakeningSmokeHarness(window));
}