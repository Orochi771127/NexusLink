import { clamp } from "../utils/clamp.js";

export const TOUCH_FATIGUE_RECOVERY_1_MS = 60 * 1000;
export const TOUCH_FATIGUE_RECOVERY_3_MS = 5 * 60 * 1000;
export const BLOCKED_TOUCH_RESET_MS = 10_000;
export const MAX_BLOCKED_TOUCH_RESET_MS = 30_000;

export function applyTouchRecovery(state, now = Date.now()) {
  const nextState = { ...state };
  const lastTouchAt = Number(nextState.lastTouchAt) || null;

  if (lastTouchAt) {
    const elapsedMs = Math.max(0, now - lastTouchAt);
    if (elapsedMs >= TOUCH_FATIGUE_RECOVERY_3_MS) {
      nextState.touchFatigue = clamp((nextState.touchFatigue || 0) - 3, 0, 10);
    } else if (elapsedMs >= TOUCH_FATIGUE_RECOVERY_1_MS) {
      nextState.touchFatigue = clamp((nextState.touchFatigue || 0) - 1, 0, 10);
    }
  }

  if (nextState.lastBlockedTouchAt && now - nextState.lastBlockedTouchAt >= BLOCKED_TOUCH_RESET_MS) {
    nextState.blockedTouchCount = 0;
  }

  return nextState;
}
