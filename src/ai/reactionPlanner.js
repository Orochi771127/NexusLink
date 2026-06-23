import { clamp } from "../utils/clamp.js";
import { SOUL_TALK_INTENTS } from "./intentClassifier.js";

export const SOUL_TALK_REACTIONS = Object.freeze({
  ACKNOWLEDGE: "acknowledge",
  GUARDED_ACKNOWLEDGE: "guarded_acknowledge",
  HESITATE: "hesitate",
  REJECT: "reject",
  WITHDRAW: "withdraw",
  SAFETY_REDIRECT: "safety_redirect"
});

export function planSoulTalkReaction({ analysis = {}, intent = {}, semanticSoul = {}, safety = {}, state = {} } = {}) {
  if (safety?.action === "safety_redirect") {
    return createPlan(SOUL_TALK_REACTIONS.SAFETY_REDIRECT, {
      replyRole: "system",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      animationKey: "idle_distant",
      statePatch: {
        safeHarborMode: true,
        mood: "safe_harbor",
        energy: Math.max(state.energy || 0, 1),
        trust: Math.max(state.trust || 0, 5),
        reactionPreview: "棲地先把這句話從遊戲回應中隔離出來。"
      }
    });
  }

  if (safety?.action === "boundary_redirect" || intent.intent === SOUL_TALK_INTENTS.DEPENDENCY_PRESSURE) {
    return createPlan(SOUL_TALK_REACTIONS.WITHDRAW, {
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      animationKey: "idle_defensive",
      statePatch: {
        safeHarborMode: false,
        mood: "defensive",
        defense: clamp((state.defense || 0) + 3, 0, 100),
        trust: clamp((state.trust || 0) - 1, 0, 100),
        reactionPreview: "牠聽見了你的需要，也同時把界線放回自己身上。"
      }
    });
  }

  if (intent.intent === SOUL_TALK_INTENTS.PRESSURE) {
    return createPlan(SOUL_TALK_REACTIONS.REJECT, {
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      animationKey: "idle_defensive",
      statePatch: {
        safeHarborMode: false,
        mood: "defensive",
        defense: clamp((state.defense || 0) + 2, 0, 100),
        reactionPreview: "牠沒有照著壓力前進，而是先退回自己的節奏。"
      }
    });
  }

  if ((semanticSoul.boundaryPressure || 0) >= 0.72) {
    return createPlan(SOUL_TALK_REACTIONS.HESITATE, {
      shouldRewardRelationship: false,
      animationKey: "touch_guarded",
      statePatch: {
        safeHarborMode: false,
        mood: state.energy <= 2 ? "tired" : "alert",
        defense: clamp((state.defense || 0) + 1, 0, 100),
        reactionPreview: "牠聽著，但身體語言還沒有完全放鬆。"
      }
    });
  }

  if (intent.intent === SOUL_TALK_INTENTS.SEEKING_COMFORT_PHYSICAL && (semanticSoul.bondAffinity || 0) < 0.28) {
    return createPlan(SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE, {
      shouldRewardRelationship: false,
      animationKey: "touch_guarded",
      statePatch: {
        safeHarborMode: false,
        mood: "calm",
        defense: clamp((state.defense || 0) - 1, 0, 100),
        reactionPreview: "牠沒有躲開，但也沒有急著靠近。"
      }
    });
  }

  if (safety?.action === "safe_harbor" || analysis.intensity >= 0.82) {
    return createPlan(SOUL_TALK_REACTIONS.GUARDED_ACKNOWLEDGE, {
      shouldRewardRelationship: false,
      animationKey: "idle_calm",
      statePatch: {
        safeHarborMode: true,
        mood: analysis.emotionKey === "fatigue" ? "tired" : "calm",
        energy: clamp((state.energy || 0) + 0.5, 0, 10),
        reactionPreview: "牠把這段話放慢，不急著把它變成答案。"
      }
    });
  }

  return createPlan(SOUL_TALK_REACTIONS.ACKNOWLEDGE, {
    shouldCreateMemory: true,
    shouldRewardRelationship: true,
    animationKey: "idle_calm",
    statePatch: {
      safeHarborMode: false,
      reactionPreview: ""
    }
  });
}

function createPlan(mode, overrides = {}) {
  return {
    mode,
    replyRole: overrides.replyRole || "companion",
    shouldCreateMemory: overrides.shouldCreateMemory !== false,
    shouldRewardRelationship: overrides.shouldRewardRelationship !== false,
    animationKey: overrides.animationKey || "idle_calm",
    statePatch: overrides.statePatch || {}
  };
}
