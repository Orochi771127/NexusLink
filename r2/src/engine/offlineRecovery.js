import { normalizeState } from "../state/store.js";
import { clamp } from "../utils/clamp.js";
import { evaluateOfflineTrace } from "./offlineTraceEngine.js";
import { applyTouchRecovery } from "./recoveryEngine.js";
import { isTraceActive } from "./storageGuard.js";
import { THIRTY_MINUTES_MS, TWO_HOURS_MS } from "../utils/time.js";

export function applyOfflineRecovery(targetState) {
  const recoveredState = normalizeState(applyTouchRecovery(targetState));
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

  const offlineTrace = evaluateOfflineTrace(recoveredState, now);
  Object.assign(recoveredState, offlineTrace.statePatch);
  recoveredState.habitatTraces = (recoveredState.habitatTraces || []).filter((trace) => isTraceActive(trace, now));
  if (offlineTrace.traces.length > 0) {
    recoveredState.habitatTraces = [
      ...(Array.isArray(recoveredState.habitatTraces) ? recoveredState.habitatTraces : []),
      ...offlineTrace.traces
    ];
    recoveredState.reactionPreview = offlineTrace.statusMessage;
  }

  return recoveredState;
}
