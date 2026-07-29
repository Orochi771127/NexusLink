/**
 * Orbit path progress.
 *
 * Product runtime reads and writes activityProgress.orbit.clearedStageIds.
 * A tiny in-memory fallback remains only for isolated QA calls that do not
 * construct a store state.
 */

import {
  getMoonlakeOrbitZone,
  getOrbitStageById,
  listStagesForMoonlakeZone,
  listStagesForRegion,
  MOONLAKE_ORBIT_ZONES,
  ORBIT_PATH_ORDER
} from "../data/orbit/stages/index.js";

function createLegacyProgress() {
  return {
    activeRegionId: "moonlake",
    clearedStageIds: new Set(),
    lastNarrative: null,
    justUnlockedRegionId: null,
    justUnlockedZoneId: null
  };
}

let legacyProgress = createLegacyProgress();

function isStateLike(value) {
  return Boolean(value && typeof value === "object" && (
    value.activityProgress ||
    value.explorationProgress ||
    value.chapterProgress
  ));
}

function clearedStageSet(state) {
  if (isStateLike(state)) {
    return new Set(state.activityProgress?.orbit?.clearedStageIds || []);
  }
  return legacyProgress.clearedStageIds;
}

function hasSafeMoonlakeArrival(state) {
  if (!isStateLike(state)) return true;
  return Number(state.explorationProgress?.visitCounts?.moonlake_camp || 0) > 0;
}

function ensureOrbitDraft(draft) {
  if (!draft.activityProgress || typeof draft.activityProgress !== "object") {
    draft.activityProgress = {};
  }
  draft.activityProgress.version = 1;
  if (!draft.activityProgress.orbit || typeof draft.activityProgress.orbit !== "object") {
    draft.activityProgress.orbit = {};
  }
  if (!Array.isArray(draft.activityProgress.orbit.clearedStageIds)) {
    draft.activityProgress.orbit.clearedStageIds = [];
  }
  return draft.activityProgress.orbit.clearedStageIds;
}

export function resetOrbitPathProgressForTests() {
  legacyProgress = createLegacyProgress();
}

export function isMoonlakeOrbitZoneUnlocked(zoneId, state = null) {
  const zone = getMoonlakeOrbitZone(zoneId);
  if (!zone || !hasSafeMoonlakeArrival(state)) return false;
  const cleared = clearedStageSet(state);
  return zone.prerequisiteFinalStageIds.every((stageId) => cleared.has(stageId));
}

export function getMoonlakeZoneProgress(zoneId, state = null) {
  const stages = listStagesForMoonlakeZone(zoneId);
  const cleared = clearedStageSet(state);
  return {
    zoneId,
    unlocked: isMoonlakeOrbitZoneUnlocked(zoneId, state),
    clearedCount: stages.filter((stage) => cleared.has(stage.id)).length,
    totalCount: stages.length,
    complete: stages.length > 0 && stages.every((stage) => cleared.has(stage.id))
  };
}

export function getOrbitPathProgressSnapshot(state = null) {
  const cleared = clearedStageSet(state);
  const unlockedRegionIds = ORBIT_PATH_ORDER.filter((regionId) =>
    isOrbitRegionUnlocked(regionId, state)
  );
  return {
    activeRegionId: legacyProgress.activeRegionId,
    unlockedRegionIds,
    clearedStageIds: [...cleared],
    lastNarrative: legacyProgress.lastNarrative,
    justUnlockedRegionId: legacyProgress.justUnlockedRegionId,
    justUnlockedZoneId: legacyProgress.justUnlockedZoneId
  };
}

export function setActiveOrbitRegion(regionId, state = null) {
  if (!isOrbitRegionUnlocked(regionId, state)) return false;
  legacyProgress.activeRegionId = regionId;
  return true;
}

export function isOrbitRegionUnlocked(regionId, state = null) {
  if (regionId === "moonlake") return hasSafeMoonlakeArrival(state);
  if (regionId === "plains") return clearedStageSet(state).has("moonlake-25");
  const index = ORBIT_PATH_ORDER.indexOf(regionId);
  if (index <= 0) return false;
  const previousRegionId = ORBIT_PATH_ORDER[index - 1];
  const previousStages = listStagesForRegion(previousRegionId);
  return previousStages.length > 0 && previousStages.every((stage) =>
    clearedStageSet(state).has(stage.id)
  );
}

export function isOrbitStageCleared(stageId, state = null) {
  return clearedStageSet(state).has(stageId);
}

export function isOrbitStageUnlocked(stageId, state = null) {
  const stage = getOrbitStageById(stageId);
  if (!stage) return false;
  const cleared = clearedStageSet(state);

  if (stage.zoneId) {
    if (!isMoonlakeOrbitZoneUnlocked(stage.zoneId, state)) return false;
    const stages = listStagesForMoonlakeZone(stage.zoneId);
    if (stage.zoneStageIndex <= 1) return true;
    const previous = stages.find(
      (candidate) => candidate.zoneStageIndex === stage.zoneStageIndex - 1
    );
    return previous ? cleared.has(previous.id) : false;
  }

  if (!isOrbitRegionUnlocked(stage.regionId, state)) return false;
  const stages = listStagesForRegion(stage.regionId);
  if (stage.index <= 1) return true;
  const previous = stages.find((candidate) => candidate.index === stage.index - 1);
  return previous ? cleared.has(previous.id) : false;
}

export function recordOrbitStageClear(stageId, stateOrDraft = null) {
  const stage = getOrbitStageById(stageId);
  if (!stage) {
    return {
      ok: false,
      firstClear: false,
      unlockedNextStageId: null,
      unlockedRegionId: null,
      unlockedZoneId: null
    };
  }

  const state = isStateLike(stateOrDraft) ? stateOrDraft : null;
  const alreadyCleared = isOrbitStageCleared(stageId, state);
  const lockedZonesBefore = new Set(
    MOONLAKE_ORBIT_ZONES
      .filter((zone) => !isMoonlakeOrbitZoneUnlocked(zone.id, state))
      .map((zone) => zone.id)
  );

  if (state) {
    const ids = ensureOrbitDraft(state);
    if (!ids.includes(stageId)) ids.push(stageId);
  } else {
    legacyProgress.clearedStageIds.add(stageId);
  }

  legacyProgress.lastNarrative = stage.clearNarrative || null;
  legacyProgress.justUnlockedRegionId = null;
  legacyProgress.justUnlockedZoneId = null;

  const zoneStages = stage.zoneId
    ? listStagesForMoonlakeZone(stage.zoneId)
    : listStagesForRegion(stage.regionId);
  const stageIndex = stage.zoneId ? stage.zoneStageIndex : stage.index;
  const nextStage = zoneStages.find((candidate) =>
    (stage.zoneId ? candidate.zoneStageIndex : candidate.index) === stageIndex + 1
  ) || null;

  let unlockedZoneId = null;
  for (const zone of MOONLAKE_ORBIT_ZONES) {
    if (
      lockedZonesBefore.has(zone.id) &&
      isMoonlakeOrbitZoneUnlocked(zone.id, state)
    ) {
      unlockedZoneId = zone.id;
      break;
    }
  }

  let unlockedRegionId = null;
  if (stage.unlocksNextRegion && isOrbitRegionUnlocked(stage.unlocksNextRegion, state)) {
    unlockedRegionId = stage.unlocksNextRegion;
  }
  legacyProgress.justUnlockedZoneId = unlockedZoneId;
  legacyProgress.justUnlockedRegionId = unlockedRegionId;

  return {
    ok: true,
    firstClear: !alreadyCleared,
    unlockedNextStageId: nextStage?.id || null,
    unlockedRegionId,
    unlockedZoneId,
    narrative: stage.clearNarrative || null
  };
}

export function consumeJustUnlockedRegion() {
  const id = legacyProgress.justUnlockedRegionId;
  legacyProgress.justUnlockedRegionId = null;
  return id;
}

export function listOrbitMapNodes(regionId = legacyProgress.activeRegionId, state = null) {
  return listStagesForRegion(regionId).map((stage) => ({
    id: stage.id,
    index: stage.index,
    zoneStageIndex: stage.zoneStageIndex || stage.index,
    zoneId: stage.zoneId || null,
    title: stage.title,
    goalLabel: stage.goalLabel,
    unlocked: isOrbitStageUnlocked(stage.id, state),
    cleared: isOrbitStageCleared(stage.id, state)
  }));
}
