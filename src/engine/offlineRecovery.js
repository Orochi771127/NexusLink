import { normalizeState } from "../state/store.js";
import { hydrateRelationshipMirror } from "../state/companionStateSchema.js";
import { clamp } from "../utils/clamp.js";
import { evaluateOfflineTrace } from "./offlineTraceEngine.js";
import { applyTouchRecovery } from "./recoveryEngine.js";
import { isTraceActive } from "./storageGuard.js";
import { THIRTY_MINUTES_MS, TWO_HOURS_MS } from "../utils/time.js";

export function applyOfflineRecovery(targetState) {
  // Offline time belongs to every established companion, not only whichever
  // companion happens to be active when the save boots. Recover each canonical
  // relationship once, then hydrate the active compatibility mirror.
  let recoveredState = normalizeState(targetState);
  const now = Date.now();
  const elapsedMs = Math.max(0, now - recoveredState.lastSeenAt);
  const fatigueRecovery = elapsedMs >= THIRTY_MINUTES_MS
    ? Math.floor(elapsedMs / THIRTY_MINUTES_MS)
    : 0;
  const energyRecovery = elapsedMs >= TWO_HOURS_MS
    ? Math.floor(elapsedMs / TWO_HOURS_MS)
    : 0;

  const byId = Object.fromEntries(
    Object.entries(recoveredState.companionStates.byId).map(([companionId, record]) => {
      if (!record.relationship) return [companionId, record];
      const relationship = applyTouchRecovery(record.relationship, now);
      return [companionId, {
        ...record,
        relationship: {
          ...relationship,
          touchFatigue: clamp(relationship.touchFatigue - fatigueRecovery, 0, 10),
          energy: clamp(relationship.energy + energyRecovery, 0, 10)
        }
      }];
    })
  );
  recoveredState = hydrateRelationshipMirror({
    ...recoveredState,
    companionStates: { ...recoveredState.companionStates, byId }
  });

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
