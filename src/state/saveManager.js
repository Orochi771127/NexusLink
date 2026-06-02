import { createDefaultState, normalizeState } from "./store.js";

export const STORAGE_KEY = "nexusLinkPrototypeState:v2";
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
  try {
    const nextState = normalizeState({ ...state, lastSeenAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    return nextState;
  } catch (error) {
    console.warn("Failed to save NexusLink state", error);
    return normalizeState(state);
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
