import { COMPANIONS, DEFAULT_COMPANION_ID, getCompanionById, isKnownCompanionId } from "./companionRegistry.js";

export const DEFAULT_ACTIVE_COMPANION_ID = DEFAULT_COMPANION_ID;

const RUNTIME_READY_ASSET_STATES = new Set(["runtime-ready", "static-ready"]);

export function normalizeUnlockedCompanionIds(rawUnlockedIds = [], options = {}) {
  const source = Array.isArray(rawUnlockedIds) ? rawUnlockedIds : [];
  const unlocked = new Set([DEFAULT_ACTIVE_COMPANION_ID]);

  source.forEach((companionId) => {
    if (isKnownCompanionId(companionId)) {
      unlocked.add(companionId);
    }
  });

  if (options.preserveActiveCompanion && isKnownCompanionId(options.activeCompanionId)) {
    unlocked.add(options.activeCompanionId);
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
  const isDefault = companionId === DEFAULT_ACTIVE_COMPANION_ID;
  const isUnlocked = isDefault || unlockedIds.includes(companionId);
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
