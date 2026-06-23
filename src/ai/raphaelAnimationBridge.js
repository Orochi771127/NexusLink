import EventBus from "../utils/eventBus.js";

export const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

const ANIMATION_KEY_TO_INTENT = Object.freeze({
  idle_wake: "soul.awaken",
  idle_calm: "soul.acknowledge",
  touch_guarded: "soul.guarded",
  idle_defensive: "soul.defensive",
  idle_distant: "soul.distant",
  idle_happy: "soul.happy",
  sleep: "soul.rest",
  idle_tired: "soul.rest",
  idle_angry: "soul.defensive"
});

export function resolveAnimationIntentFromKey(animationKey = "idle_calm") {
  return ANIMATION_KEY_TO_INTENT[animationKey] || "soul.acknowledge";
}

export function dispatchRaphaelAnimationCue(animationDecision = {}, { source = "raphael-core" } = {}) {
  if (!animationDecision?.shouldDispatchNow) return false;

  const animationKey = animationDecision.animationKey || animationDecision.fallbackKey || "idle_calm";
  const intent = animationDecision.animationIntent || resolveAnimationIntentFromKey(animationKey);

  EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, { intent, source, animationKey });
  return true;
}