export const STANDOFF_CLEAR_OUTCOMES = Object.freeze([
  "stabilized",
  "recovered"
]);

export function getStandoffScenarioId(nodeId) {
  return String(nodeId || "unknown_standoff");
}

export function isStandoffScenarioCleared(state, scenarioId) {
  return (state?.activityProgress?.standoff?.clearedScenarioIds || [])
    .includes(scenarioId);
}

export function recordStandoffScenarioClear(draft, scenarioId) {
  if (!draft.activityProgress || typeof draft.activityProgress !== "object") {
    draft.activityProgress = {};
  }
  draft.activityProgress.version = 1;
  if (!draft.activityProgress.standoff || typeof draft.activityProgress.standoff !== "object") {
    draft.activityProgress.standoff = {};
  }
  const ids = Array.isArray(draft.activityProgress.standoff.clearedScenarioIds)
    ? draft.activityProgress.standoff.clearedScenarioIds
    : [];
  draft.activityProgress.standoff.clearedScenarioIds = ids.includes(scenarioId)
    ? ids
    : [...ids, scenarioId];
}

export function resolveStandoffFirstClear(state, nodeId, outcome) {
  const scenarioId = getStandoffScenarioId(nodeId);
  const clearOutcome = STANDOFF_CLEAR_OUTCOMES.includes(outcome);
  const alreadyCleared = isStandoffScenarioCleared(state, scenarioId);
  return {
    scenarioId,
    clearOutcome,
    alreadyCleared,
    grantsFirstClear: clearOutcome && !alreadyCleared
  };
}
