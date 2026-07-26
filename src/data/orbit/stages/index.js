import { getOrbitPathLabel, ORBIT_PATH_ORDER } from "../trainingArena.js";
import { MOONLAKE_CAMP_SLICE } from "./moonlakeCampSlice.js";
import { MOONLAKE_STAGES } from "./moonlakeStages.js";
import { PLAINS_STAGES } from "./plainsStages.js";

const BY_REGION = Object.freeze({
  moonlake: MOONLAKE_STAGES,
  plains: PLAINS_STAGES
});

const ALL_STAGES = Object.freeze([
  ...MOONLAKE_STAGES,
  ...PLAINS_STAGES,
  MOONLAKE_CAMP_SLICE
]);

export function listStagesForRegion(regionId) {
  return BY_REGION[regionId] || [];
}

export function getOrbitStageById(stageId) {
  return ALL_STAGES.find((s) => s.id === stageId) || null;
}

export function listPlayableRegionIds() {
  return ORBIT_PATH_ORDER.filter((id) => (BY_REGION[id] || []).length > 0);
}

export function getRegionPathMeta(regionId) {
  return {
    regionId,
    pathLabel: getOrbitPathLabel(regionId),
    stageCount: listStagesForRegion(regionId).length
  };
}

export {
  MOONLAKE_CAMP_SLICE,
  MOONLAKE_STAGES,
  PLAINS_STAGES,
  getOrbitPathLabel,
  ORBIT_PATH_ORDER
};
