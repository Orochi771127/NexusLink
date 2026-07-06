import { COMPANIONS, DEFAULT_COMPANION_ID, getCompanionById, isKnownCompanionId } from "./companionRegistry.js";

export const DEFAULT_ACTIVE_COMPANION_ID = DEFAULT_COMPANION_ID;

const RUNTIME_READY_ASSET_STATES = new Set(["runtime-ready", "static-ready"]);

export function normalizeUnlockedCompanionIds(rawUnlockedIds = [], options = {}) {
  const source = Array.isArray(rawUnlockedIds) ? rawUnlockedIds : [];
  // CH-3（Master Canon §1.3 階段二）：不再無條件塞回灰影貓——「選後即唯一」，
  // 初遇選了誰，誰就是唯一解鎖；灰影貓只是壞資料的兜底，不是永久保底。
  // veteran 既有存檔的解鎖清單（多隻/含灰影）原樣保留，不沒收。
  const unlocked = new Set();

  source.forEach((companionId) => {
    if (isKnownCompanionId(companionId)) {
      unlocked.add(companionId);
    }
  });

  if (options.preserveActiveCompanion && isKnownCompanionId(options.activeCompanionId)) {
    unlocked.add(options.activeCompanionId);
  }

  // 兜底：解鎖集不可為空（缺欄位/壞資料且 active 也不可用）→ 回到預設夥伴。
  if (unlocked.size === 0) {
    unlocked.add(DEFAULT_ACTIVE_COMPANION_ID);
  }

  return [...unlocked];
}

export function isCompanionAssetReady(companion) {
  return RUNTIME_READY_ASSET_STATES.has(companion?.assetReadiness);
}

export function getCompanionRuntimeEligibility(companionOrId, state = {}) {
  const companion = typeof companionOrId === "string"
    ? isKnownCompanionId(companionOrId)
      ? getCompanionById(companionOrId)
      : null
    : companionOrId;
  const companionId = companion?.id;
  const unlockedIds = normalizeUnlockedCompanionIds(state.unlockedCompanionIds);
  const isKnown = Boolean(companionId && isKnownCompanionId(companionId));
  // CH-3：灰影貓不再有「永遠已解鎖」特權——選了別隻，灰影就是「未走的那條人生」
  //（章節中再遇見）。空/壞 state 時 normalize 兜底仍回 [灰影]，安全預設不變。
  const isUnlocked = unlockedIds.includes(companionId);
  const isAssetReady = isCompanionAssetReady(companion);
  const hasRuntimeFlag = companion?.runtimeEnabled === true;
  const selectableWhenUnlocked = companion?.selectableWhenUnlocked === true;
  const canSelect = Boolean(isKnown && isUnlocked && isAssetReady && hasRuntimeFlag && selectableWhenUnlocked);

  let reason = "available";
  if (!isKnown) reason = "unknown";
  else if (!hasRuntimeFlag) reason = "runtime_disabled";
  else if (!selectableWhenUnlocked) reason = "not_selectable";
  else if (!isAssetReady) reason = "asset_pending";
  else if (!isUnlocked) reason = "chapter_locked";

  return {
    companion,
    canSelect,
    reason,
    isAssetReady,
    isUnlocked
  };
}

export function isRuntimeEligibleCompanion(companionId, state = {}) {
  return getCompanionRuntimeEligibility(companionId, state).canSelect;
}

export function normalizeRuntimeCompanionId(companionId, state = {}) {
  if (isRuntimeEligibleCompanion(companionId, state)) return companionId;
  return DEFAULT_ACTIVE_COMPANION_ID;
}

export function getUnlockedRuntimeCompanions(state = {}) {
  return COMPANIONS.filter((companion) => getCompanionRuntimeEligibility(companion, state).canSelect);
}
