import { createDefaultState, normalizeState } from "./store.js";
import { getEmergencyStorageLimits, pruneStateForStorage } from "../engine/storageGuard.js";

export const STORAGE_KEY = "nexusLinkR2State:v1";
const LEGACY_STORAGE_KEYS = ["nexusLinkPrototypeState", "nexusLinkState"];
const LEGACY_PREFERENCE_STORAGE_KEY = "nexusLinkCompanionPrefs:v1";
const LEGACY_AUDIO_STORAGE_KEY = "nexusLinkAudioMuted:v1";
const pendingLegacyCleanup = new Set();

export function loadState() {
  try {
    const source = readFirstAvailableSave();
    const parsed = source?.raw ? JSON.parse(source.raw) : {};
    if (source?.key && source.key !== STORAGE_KEY) pendingLegacyCleanup.add(source.key);
    migrateCompanionPreferences(parsed);
    migrateAudioMuted(parsed);
    return normalizeState({ ...createDefaultState(), ...parsed });
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
    cleanupMigratedLegacyKeys();
    return { ok: true, state: prunedState, emergency: false };
  } catch (error) {
    if (error?.name !== "QuotaExceededError") {
      console.warn("[saveManager] Save failed:", error);
      return { ok: false, state: prunedState, emergency: false, error };
    }

    const emergencyState = pruneStateForStorage(prunedState, now, getEmergencyStorageLimits());
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(emergencyState));
      cleanupMigratedLegacyKeys();
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
    for (const key of [...LEGACY_STORAGE_KEYS, LEGACY_PREFERENCE_STORAGE_KEY, LEGACY_AUDIO_STORAGE_KEY]) {
      localStorage.removeItem(key);
    }
  } catch (error) {
    console.warn("Failed to clear NexusLink save", error);
  }
}

// 匯出存檔：回傳目前存檔的 JSON 字串（唯讀，不改 STORAGE_KEY/schema）。
// 由 settingsController 包成 Blob 讓玩家自行下載。
export function exportSaveData() {
  try {
    const source = readFirstAvailableSave();
    return source?.raw || JSON.stringify(createDefaultState());
  } catch (error) {
    console.warn("Failed to export NexusLink save", error);
    return null;
  }
}

function readFirstAvailableSave() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current) return { key: STORAGE_KEY, raw: current };

  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) return { key, raw: legacy };
  }

  return null;
}

function migrateCompanionPreferences(targetState) {
  const raw = localStorage.getItem(LEGACY_PREFERENCE_STORAGE_KEY);
  if (!raw) return;
  if (targetState.companionPreferences && typeof targetState.companionPreferences === "object") {
    pendingLegacyCleanup.add(LEGACY_PREFERENCE_STORAGE_KEY);
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    targetState.companionPreferences = parsed;
    pendingLegacyCleanup.add(LEGACY_PREFERENCE_STORAGE_KEY);
  } catch {
    // 損壞的 legacy preference 不阻擋主存檔；也不刪除，保留人工復原可能。
  }
}

function migrateAudioMuted(targetState) {
  const raw = localStorage.getItem(LEGACY_AUDIO_STORAGE_KEY);
  if (raw !== "true" && raw !== "false") return;
  if (typeof targetState.settings?.audioMuted === "boolean") {
    pendingLegacyCleanup.add(LEGACY_AUDIO_STORAGE_KEY);
    return;
  }
  targetState.settings = { ...(targetState.settings || {}), audioMuted: raw === "true" };
  pendingLegacyCleanup.add(LEGACY_AUDIO_STORAGE_KEY);
}

function cleanupMigratedLegacyKeys() {
  for (const key of pendingLegacyCleanup) {
    try {
      localStorage.removeItem(key);
      pendingLegacyCleanup.delete(key);
    } catch {
      // 主存檔已成功；清理失敗留待下次 save 重試。
    }
  }
}
