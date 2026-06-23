import { processEmotionInput } from "../engine/emotionalSedimentationEngine.js";
import { assessInputSafety } from "./safetyShield.js";
import { interpretEmotionInput } from "./emotionInterpreter.js";
import { classifyIntent } from "./intentClassifier.js";
import { deriveSemanticSoulState } from "./semanticSoulModel.js";
import { planSoulTalkReaction } from "./reactionPlanner.js";
import { composeRaphaelReply } from "./responseComposer.js";

export function runRaphaelCore(inputText = "", state = {}, runtime = {}) {
  const now = Number.isFinite(runtime.now) ? runtime.now : Date.now();
  const idSuffix = runtime.idSuffix || "000";
  const companion = runtime.companion || null;
  const repeated = Boolean(runtime.repeated);

  const safety = assessInputSafety(inputText);
  const analysis = interpretEmotionInput(inputText, state, { repeated });
  const intent = classifyIntent(inputText, analysis, safety);
  const semanticSoul = deriveSemanticSoulState(state, analysis);
  const sedimentationResult = processEmotionInput(inputText, state, { now, idSuffix });
  const plan = planSoulTalkReaction({ analysis, intent, semanticSoul, safety, state });
  const reply = composeRaphaelReply({
    inputText,
    analysis,
    intent,
    plan,
    safety,
    state,
    companion
  });

  return {
    now,
    inputText,
    safety,
    analysis,
    intent,
    semanticSoul,
    sedimentationResult,
    plan,
    reply
  };
}
