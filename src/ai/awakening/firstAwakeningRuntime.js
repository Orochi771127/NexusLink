import { buildFirstAwakeningPayload } from "./firstAwakeningEvent.js";
import { applyFirstAwakeningResult } from "./applyAwakeningResult.js";
import { canTriggerFirstAwakening } from "./raphaelAwakeningGate.js";
import { dispatchRaphaelAnimationCue } from "../raphaelAnimationBridge.js";

export function maybeTriggerFirstAwakening(state, { companion = null, now = Date.now(), dispatchAnimation = true } = {}) {
  if (!canTriggerFirstAwakening(state)) {
    return { applied: false, reason: "already_awakened" };
  }

  const payload = buildFirstAwakeningPayload({ state, companion, now });
  const result = applyFirstAwakeningResult(state, payload);

  if (result.applied && dispatchAnimation) {
    dispatchRaphaelAnimationCue(
      {
        animationKey: payload.animationKey,
        animationIntent: payload.animationIntent,
        fallbackKey: "idle_calm",
        shouldDispatchNow: true
      },
      { source: "raphael-awakening" }
    );
  }

  return { ...result, payload };
}