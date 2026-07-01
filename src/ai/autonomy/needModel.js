import { clamp } from "../../utils/clamp.js";

export function deriveCompanionNeeds({ state = {}, perception = {}, plan = {} } = {}) {
  const safety = perception.safety || {};
  const analysis = perception.analysis || {};
  const semanticSoul = perception.semanticSoul || {};
  const memories = perception.memories || {};
  const gateway = perception.gateway || {};

  const energy = clamp(state.energy ?? 10, 0, 10) / 10;
  const defense = clamp(state.defense ?? 0, 0, 100) / 100;
  const boundaryPressure = clamp(semanticSoul.boundaryPressure ?? 0, 0, 1);
  const bondAffinity = clamp(semanticSoul.bondAffinity ?? 0, 0, 1);
  const safeHarbor = Boolean(state.safeHarborMode || safety.action === "safe_harbor");

  const needForSafety = clamp(
    (safety.riskLevel === "high" ? 1 : safety.riskLevel === "caution" ? 0.72 : 0) +
      (safeHarbor ? 0.2 : 0) +
      boundaryPressure * 0.15,
    0,
    1
  );

  const needForRest = clamp((1 - energy) * 0.7 + (analysis.emotionKey === "fatigue" ? 0.25 : 0), 0, 1);

  const needForDistance = clamp(
    boundaryPressure * 0.55 +
      defense * 0.25 +
      (plan.mode === "withdraw" || plan.mode === "reject" ? 0.35 : 0) +
      (safety.isBoundaryPressure ? 0.3 : 0),
    0,
    1
  );

  const needForConnection = clamp(
    bondAffinity * 0.35 +
      (analysis.emotionKey === "loneliness" ? 0.35 : 0) +
      (memories.hasRecentSimilarEmotion ? 0.1 : 0) -
      needForDistance * 0.4,
    0,
    1
  );

  const needForRepair = clamp(
    (memories.hasBoundaryMemory ? 0.25 : 0) +
      (perception.intent?.intent === "apology" ? 0.45 : 0) +
      (state.mood === "defensive" ? 0.2 : 0),
    0,
    1
  );

  const needForExploration = clamp(
    (perception.intent?.intent === "exploration_request" ? 0.55 : 0) +
      (semanticSoul.stability >= 0.55 ? 0.15 : 0) -
      needForSafety * 0.5 -
      needForRest * 0.25,
    0,
    1
  );

  const recovery = perception.recoveryContext || {};
  const needForReflection = clamp(
    (memories.relevantMemories?.length >= 2 ? 0.25 : 0) +
      (memories.hasRecallableMemory ? 0.3 : 0) +
      (recovery.canRecall ? 0.25 : 0) +
      (gateway.repeated ? 0.2 : 0) +
      (analysis.intensity >= 0.65 ? 0.2 : 0),
    0,
    1
  );

  return {
    needForSafety,
    needForRest,
    needForDistance,
    needForConnection,
    needForRepair,
    needForExploration,
    needForReflection,
    dominantNeed: pickDominant({
      needForSafety,
      needForRest,
      needForDistance,
      needForConnection,
      needForRepair,
      needForExploration,
      needForReflection
    })
  };
}

function pickDominant(needs) {
  let best = "needForSafety";
  let bestScore = -1;
  for (const [key, value] of Object.entries(needs)) {
    if (value > bestScore) {
      bestScore = value;
      best = key;
    }
  }
  return best;
}