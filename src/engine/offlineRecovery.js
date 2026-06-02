import { normalizeState } from "../state/store.js";
import { clamp } from "../utils/clamp.js";
import { THIRTY_MINUTES_MS, TWO_HOURS_MS } from "../utils/time.js";

export function applyOfflineRecovery(targetState) {
  const recoveredState = normalizeState(targetState);
  const now = Date.now();
  const elapsedMs = Math.max(0, now - recoveredState.lastSeenAt);

  if (elapsedMs >= THIRTY_MINUTES_MS) {
    const fatigueRecovery = Math.floor(elapsedMs / THIRTY_MINUTES_MS);
    recoveredState.touchFatigue = clamp(recoveredState.touchFatigue - fatigueRecovery, 0, 10);
  }

  if (elapsedMs >= TWO_HOURS_MS) {
    const energyRecovery = Math.floor(elapsedMs / TWO_HOURS_MS);
    recoveredState.energy = clamp(recoveredState.energy + energyRecovery, 0, 10);
  }

  recoveredState.lastSeenAt = now;
  return recoveredState;
}
