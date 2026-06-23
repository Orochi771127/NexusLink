import { assessInputSafety } from "./safetyShield.js";
import { interpretEmotionInput } from "./emotionInterpreter.js";
import { classifyIntent } from "./intentClassifier.js";
import { deriveSemanticSoulState } from "./semanticSoulModel.js";
import { planSoulTalkReaction } from "./reactionPlanner.js";
import { composeRaphaelReply } from "./responseComposer.js";
import { prepareSoulTalkInput } from "./inputGateway.js";
import { retrieveRelevantMemories } from "./memoryRetriever.js";
import { resolvePersona } from "./personaResolver.js";
import { deriveStateMutation } from "./stateMutationPolicy.js";
import { buildMemoryDecision } from "./memoryWriter.js";
import { mapHabitatTraceIntent } from "./habitatTraceMapper.js";
import { mapSoulTalkAnimation } from "./animationMapper.js";
import { loadRaphaelCorpus } from "./corpusLoader.js";
import { detectForbiddenPhrases, sanitizeReply } from "./forbiddenPhrases.js";
import { processEmotionInput } from "../engine/emotionalSedimentationEngine.js";

export function runRaphaelCore(inputText = "", state = {}, runtime = {}) {
  const companion = runtime.companion || null;
  const gateway = prepareSoulTalkInput(inputText, state, runtime);
  const corpus = loadRaphaelCorpus();

  const safety = assessInputSafety(gateway.normalizedInput);
  const analysis = interpretEmotionInput(gateway.originalInput, state, { repeated: gateway.repeated });
  const intent = classifyIntent(gateway.normalizedInput, analysis, safety);
  const semanticSoul = deriveSemanticSoulState(state, analysis);
  const memories = retrieveRelevantMemories(state, analysis, { now: gateway.now });
  const persona = resolvePersona(companion, state);

  const sedimentationResult = processEmotionInput(gateway.normalizedInput, state, {
    now: gateway.now,
    idSuffix: gateway.idSuffix
  });

  const plan = planSoulTalkReaction({ analysis, intent, semanticSoul, safety, state, memories });
  const stateMutation = deriveStateMutation({
    state,
    gateway,
    safety,
    analysis,
    intent,
    plan,
    semanticSoul,
    memories,
    sedimentationResult
  });

  const memoryDecision = buildMemoryDecision({
    state,
    gateway,
    safety,
    analysis,
    intent,
    plan,
    stateMutation,
    sedimentationResult
  });

  const traceDecision = mapHabitatTraceIntent(memoryDecision, plan, analysis);
  const animationDecision = mapSoulTalkAnimation({ plan, analysis, intent });

  let reply = composeRaphaelReply({
    inputText: gateway.normalizedInput,
    analysis,
    intent,
    plan,
    safety,
    state,
    companion,
    persona,
    corpus
  });

  const seed = gateway.normalizedInput.length + Math.round(state.energy || 0);
  const sanitized = sanitizeReply(reply, seed);
  reply = sanitized.text;

  const replyRole = plan.replyRole || (plan.mode === "safety_redirect" ? "system" : "companion");
  const forbiddenCheck = detectForbiddenPhrases(reply);

  return {
    now: gateway.now,
    inputText: gateway.originalInput,
    input: gateway,
    safety,
    analysis,
    intent,
    semanticSoul,
    memories,
    persona,
    corpusMeta: { version: corpus.version, source: corpus.source },
    plan,
    stateMutation,
    memoryDecision,
    traceDecision,
    animationDecision,
    sedimentationResult: memoryDecision.sedimentationResult,
    reply,
    replyRole,
    forbiddenPhraseDetected: sanitized.forbiddenPhraseDetected || forbiddenCheck.hasForbidden
  };
}

export { applyRaphaelCoreResult } from "./applyCoreResult.js";

if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("raphaelSmoke") === "1") {
  import("./testHarness/raphaelCoreSmokeCases.js").then((mod) => mod.installRaphaelSmokeHarness(window));
}