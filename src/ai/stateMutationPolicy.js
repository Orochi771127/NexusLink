import { clamp } from "../utils/clamp.js";
import { SOUL_TALK_INTENTS } from "./intentClassifier.js";
import { SOUL_TALK_REACTIONS } from "./reactionPlanner.js";
import { isPrivateCareStrategy } from "./dialogue/reflectiveCarePolicy.js";

const NON_REWARDING_MODES = new Set([
  SOUL_TALK_REACTIONS.SAFETY_REDIRECT,
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.REJECT
]);

export function deriveStateMutation({
  state = {},
  gateway = {},
  safety = {},
  analysis = {},
  intent = {},
  plan = {},
  semanticSoul = {},
  memories = {},
  sedimentationResult = {},
  responseStrategy = {}
} = {}) {
  const bond = Number(state.bond) || 0;
  const trust = Number(state.trust) || 0;
  const defense = Number(state.defense) || 0;
  const energy = Number(state.energy) || 0;

  const patch = { ...(plan.statePatch || {}) };
  let spamScoreDelta = 0;
  let reason = "default_acknowledge";

  if (safety?.isCrisisContinuity === true) {
    reason = safety.releaseCrisisContinuity === true
      ? "crisis_continuity_resolved"
      : "crisis_continuity_active";
    return finalize({
      statePatch: {
        // The resolving turn is still a local system terminal. Ordinary
        // relationship behavior may resume only on the next safe turn.
        safeHarborMode: safety.releaseCrisisContinuity !== true
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (
    safety?.isHighRisk
    || safety?.riskLevel === "high"
  ) {
    reason = "high_risk_safety";
    return finalize({
      statePatch: {
        safeHarborMode: true
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (plan.mode === SOUL_TALK_REACTIONS.SAFETY_REDIRECT || safety?.action === "safety_redirect") {
    reason = `policy_terminal_${safety?.category || "unknown"}`;
    return finalize({
      statePatch: {
        safeHarborMode: false,
        reactionPreview: ""
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (
    plan.mode === SOUL_TALK_REACTIONS.WITHDRAW ||
    safety?.category === "dependency_pressure" ||
    intent.intent === SOUL_TALK_INTENTS.DEPENDENCY_PRESSURE
  ) {
    reason = "dependency_pressure";
    spamScoreDelta = 1;
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "defensive",
        bond,
        trust: clamp(trust - 1, 0, 100),
        defense: clamp(defense + 2, 0, 100),
        energy: Math.max(0, energy - 1),
        reactionPreview: patch.reactionPreview || "牠聽見了你的需要，也同時把界線放回自己身上。"
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta
    });
  }

  if (plan.mode === SOUL_TALK_REACTIONS.REJECT || intent.intent === SOUL_TALK_INTENTS.PRESSURE) {
    reason = "pressure_command";
    spamScoreDelta = 1;
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "defensive",
        bond,
        trust: clamp(trust - 1, 0, 100),
        defense: clamp(defense + 2, 0, 100),
        energy: Math.max(0, energy - 1),
        reactionPreview: patch.reactionPreview || "牠沒有照著壓力前進，而是先退回自己的節奏。"
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta
    });
  }

  if (gateway.repeated) {
    reason = "repeated_spam";
    spamScoreDelta = 1;
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "defensive",
        bond,
        trust: clamp(trust - 1, 0, 100),
        defense: clamp(defense + 1, 0, 100),
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta
    });
  }

  if (gateway.isNoise || gateway.isEmpty) {
    reason = "noise_or_empty";
    return finalize({
      statePatch: { safeHarborMode: false, mood: state.mood || "calm", bond, trust, defense, energy },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (sedimentationResult.triggerSafeHarbor || safety?.action === "safe_harbor") {
    reason = "safe_harbor_caution";
    return finalize({
      statePatch: {
        // Caution regulation is supportive and non-rewarding, but it is not
        // the persisted acute-crisis latch. Only a high-risk system terminal
        // may activate cross-turn crisis continuity.
        safeHarborMode: false,
        mood: analysis.emotionKey === "fatigue" ? "tired" : "calm",
        bond,
        trust,
        defense,
        energy: clamp(energy + 0.5, 0, 10),
        reactionPreview: patch.reactionPreview || "牠把這段話放慢，不急著把它變成答案。"
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: -1
    });
  }

  if (isPrivateCareStrategy(responseStrategy?.strategy)) {
    reason = "private_reflective_care";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: state.mood || "calm",
        bond,
        trust,
        defense,
        energy: Math.max(0, energy - 1),
        reactionPreview: patch.reactionPreview || ""
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (
    safety?.action === "support_only"
    || safety?.category === "support_sensitive"
    || safety?.shouldRewardRelationship === false
    || safety?.shouldCreateMemory === false
  ) {
    reason = "psychology_support_session_only";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: analysis.emotionKey === "fatigue" ? "tired" : (state.mood || "calm"),
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: false,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (intent.intent === SOUL_TALK_INTENTS.APOLOGY) {
    reason = "sincere_apology";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "soft",
        bond: bond + (semanticSoul.bondAffinity >= 0.2 ? 1 : 0),
        trust: clamp(trust + 1, 0, 100),
        defense: clamp(defense - 1, 0, 100),
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: true,
      shouldTriggerMilestone: true,
      shouldCreateMemory: plan.shouldCreateMemory,
      reason,
      spamScoreDelta: 0
    });
  }

  if (intent.intent === SOUL_TALK_INTENTS.GRATITUDE) {
    reason = "gratitude";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "calm",
        bond: bond + 1,
        trust: clamp(trust + 1, 0, 100),
        defense: clamp(defense - 1, 0, 100),
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: true,
      shouldTriggerMilestone: true,
      shouldCreateMemory: plan.shouldCreateMemory,
      reason,
      spamScoreDelta: 0
    });
  }

  if (intent.intent === SOUL_TALK_INTENTS.REST_REQUEST) {
    reason = "rest_request";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "calm",
        bond: bond + 1,
        trust: clamp(trust + 1, 0, 100),
        defense,
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: true,
      shouldTriggerMilestone: true,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  if (sedimentationResult.memoryObject && plan.shouldCreateMemory) {
    reason = "ordinary_emotional_expression";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: mapEmotionToMood(sedimentationResult.memoryObject.emotion),
        bond: bond + 1,
        trust: clamp(trust + 1, 0, 100),
        defense,
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: true,
      shouldTriggerMilestone: true,
      shouldCreateMemory: true,
      reason,
      spamScoreDelta: 0
    });
  }

  if (energy <= 2) {
    reason = "low_energy_fallback";
    return finalize({
      statePatch: {
        safeHarborMode: false,
        mood: "tired",
        bond: bond + 1,
        trust,
        defense,
        energy: Math.max(0, energy - 1),
        reactionPreview: ""
      },
      shouldRewardRelationship: true,
      shouldTriggerMilestone: false,
      shouldCreateMemory: false,
      reason,
      spamScoreDelta: 0
    });
  }

  reason = "light_acknowledge";
  return finalize({
    statePatch: {
      safeHarborMode: false,
      mood: "warm",
      bond: bond + 1,
      trust,
      defense,
      energy: Math.max(0, energy - 1),
      reactionPreview: patch.reactionPreview || ""
    },
    shouldRewardRelationship: plan.shouldRewardRelationship !== false,
    shouldTriggerMilestone: plan.shouldRewardRelationship !== false,
    shouldCreateMemory: false,
    reason,
    spamScoreDelta: 0
  });
}

function finalize(result) {
  return {
    ...result,
    spamScoreDelta: result.spamScoreDelta || 0
  };
}

function mapEmotionToMood(emotion) {
  if (emotion === "fatigue") return "tired";
  if (emotion === "sadness") return "soft";
  if (emotion === "anxiety") return "alert";
  if (emotion === "loneliness") return "warm";
  if (emotion === "anger") return "defensive";
  if (emotion === "gratitude") return "calm";
  if (emotion === "calm") return "calm";
  return "warm";
}

export function shouldBlockMilestone(plan = {}, stateMutation = {}) {
  return !stateMutation.shouldTriggerMilestone || NON_REWARDING_MODES.has(plan.mode);
}
