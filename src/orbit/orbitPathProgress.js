/**
 * 心核迴旋戰路徑進度（R2：session-only，不寫 localStorage）
 *
 * 設計理念：
 * - 重整頁面會重置——刻意避免未核准的 GROUNDWORK 存檔欄位。
 * - 失敗／撤退不倒退已通關節點；通關才解鎖下一關／下一區。
 */

import {
  getOrbitStageById,
  listStagesForRegion,
  ORBIT_PATH_ORDER
} from "../data/orbit/stages/index.js";

function createDefaultProgress() {
  return {
    /** @type {string} */
    activeRegionId: "moonlake",
    /** @type {Set<string>} */
    unlockedRegionIds: new Set(["moonlake"]),
    /** @type {Set<string>} */
    clearedStageIds: new Set(),
    /** 最近一段短敘事（給 UI） */
    lastNarrative: null,
    /** 若剛解鎖新區域，記在這裡給地圖提示 */
    justUnlockedRegionId: null
  };
}

let progress = createDefaultProgress();

export function resetOrbitPathProgressForTests() {
  progress = createDefaultProgress();
}

export function getOrbitPathProgressSnapshot() {
  return {
    activeRegionId: progress.activeRegionId,
    unlockedRegionIds: [...progress.unlockedRegionIds],
    clearedStageIds: [...progress.clearedStageIds],
    lastNarrative: progress.lastNarrative,
    justUnlockedRegionId: progress.justUnlockedRegionId
  };
}

export function setActiveOrbitRegion(regionId) {
  if (!progress.unlockedRegionIds.has(regionId)) return false;
  progress.activeRegionId = regionId;
  return true;
}

export function isOrbitRegionUnlocked(regionId) {
  return progress.unlockedRegionIds.has(regionId);
}

export function isOrbitStageCleared(stageId) {
  return progress.clearedStageIds.has(stageId);
}

/**
 * 第一關永遠可打；其後需前一關已通關。
 */
export function isOrbitStageUnlocked(stageId) {
  const stage = getOrbitStageById(stageId);
  if (!stage) return false;
  if (!progress.unlockedRegionIds.has(stage.regionId)) return false;
  const stages = listStagesForRegion(stage.regionId);
  if (!stages.length) return false;
  if (stage.index <= 1) return true;
  const prev = stages.find((s) => s.index === stage.index - 1);
  return prev ? progress.clearedStageIds.has(prev.id) : false;
}

/**
 * 通關結算：標記 cleared、解鎖下一關／下一區。
 * 非勝利結局（撤退／過載）不呼叫此函式 → 進度不倒退也不前進。
 */
export function recordOrbitStageClear(stageId) {
  const stage = getOrbitStageById(stageId);
  if (!stage) {
    return { ok: false, unlockedNextStageId: null, unlockedRegionId: null };
  }

  progress.clearedStageIds.add(stageId);
  progress.lastNarrative = stage.clearNarrative || null;
  progress.justUnlockedRegionId = null;

  const stages = listStagesForRegion(stage.regionId);
  const nextStage = stages.find((s) => s.index === stage.index + 1) || null;
  let unlockedRegionId = null;

  if (stage.unlocksNextRegion) {
    progress.unlockedRegionIds.add(stage.unlocksNextRegion);
    progress.justUnlockedRegionId = stage.unlocksNextRegion;
    unlockedRegionId = stage.unlocksNextRegion;
  } else if (!nextStage) {
    // 該區最後一關但未標 unlocksNextRegion 時，依全域順序嘗試解鎖下一區
    const idx = ORBIT_PATH_ORDER.indexOf(stage.regionId);
    const nextRegion = idx >= 0 ? ORBIT_PATH_ORDER[idx + 1] : null;
    if (nextRegion && listStagesForRegion(nextRegion).length) {
      progress.unlockedRegionIds.add(nextRegion);
      progress.justUnlockedRegionId = nextRegion;
      unlockedRegionId = nextRegion;
    }
  }

  return {
    ok: true,
    unlockedNextStageId: nextStage?.id || null,
    unlockedRegionId,
    narrative: progress.lastNarrative
  };
}

export function consumeJustUnlockedRegion() {
  const id = progress.justUnlockedRegionId;
  progress.justUnlockedRegionId = null;
  return id;
}

/**
 * 給地圖 UI 的節點列。
 */
export function listOrbitMapNodes(regionId = progress.activeRegionId) {
  return listStagesForRegion(regionId).map((stage) => ({
    id: stage.id,
    index: stage.index,
    title: stage.title,
    goalLabel: stage.goalLabel,
    unlocked: isOrbitStageUnlocked(stage.id),
    cleared: isOrbitStageCleared(stage.id)
  }));
}
