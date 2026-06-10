import { createDefaultState, normalizeState } from "./store.js";
import { getEmergencyStorageLimits, pruneStateForStorage } from "../engine/storageGuard.js";

export const STORAGE_KEY = "nexusLinkR2State:v1";
const LEGACY_STORAGE_KEYS = ["nexusLinkPrototypeState", "nexusLinkState"];

export function loadState() {
  try {
    const raw = readFirstAvailableSave();
    if (!raw) return createDefaultState();
    return normalizeState({ ...createDefaultState(), ...JSON.parse(raw) });
  } catch (error) {
    console.warn("Failed to load save data", error);
    return createDefaultState();
  }
}

export function saveState(state) {
  const now = Date.now();
  const nextState = normalizeState({ ...state, lastSeenAt: now });
  const prunedState = pruneStateForStorage(nextState, now);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prunedState));
    return { ok: true, state: prunedState, emergency: false };
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      console.warn("[saveManager] Save failed:", error);
      return { ok: false, state: prunedState, emergency: false, error };
    }

    const emergencyState = pruneStateForStorage(prunedState, now, getEmergencyStorageLimits());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyState));
      return { ok: true, state: emergencyState, emergency: true };
    } catch (retryError) {
      console.warn("[saveManager] Emergency save failed:", retryError);
      return { ok: false, state: emergencyState, emergency: true, error: retryError };
    }
  }
}

export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("Failed to clear NexusLink save", error);
  }
}

function readFirstAvailableSave() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return current;

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) return legacy;
  }

  return null;
}
