import { clamp } from "../utils/clamp.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const FIVE_HOURS_MS = 5 * ONE_HOUR_MS;
const BLOCKED_TOUCH_RESET_MS = 10_000;

export function applyTouchRecovery(state, now = Date.now()) {
  const nextState = { ...state };
  const lastTouchAt = Number(nextState.lastTouchAt) || null;

  if (lastTouchAt) {
    const elapsedMs = Math.max(0, now - lastTouchAt);
    if (elapsedMs >= FIVE_HOURS_MS) {
      nextState.touchFatigue = clamp((nextState.touchFatigue || 0) - 3, 0, 10);
    } else if (elapsedMs >= ONE_HOUR_MS) {
      nextState.touchFatigue = clamp((nextState.touchFatigue || 0) - 1, 0, 10);
    }
  }

  if (nextState.lastBlockedTouchAt && now - nextState.lastBlockedTouchAt >= BLOCKED_TOUCH_RESET_MS) {
    nextState.blockedTouchCount = 0;
  }

  return nextState;
}
