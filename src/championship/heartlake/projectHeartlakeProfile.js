import { deepFreeze, isPlainRecord, stableDigest } from "../contracts/championshipContracts.js";

function readDataProperty(record, key, fallback) {
  if (!isPlainRecord(record)) throw new TypeError("Heartlake projection source must be a plain object");
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  if (!descriptor) return fallback;
  if (descriptor.get || descriptor.set || !("value" in descriptor)) throw new TypeError(`Heartlake projection rejects accessor: ${key}`);
  return descriptor.value;
}

function cloneStringArray(value, key) {
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === "string")) throw new TypeError(`${key} must be a string array`);
  return [...new Set(value)];
}

export function projectHeartlakeProfile(existingState) {
  const activeCompanionId = readDataProperty(existingState, "activeCompanionId", null);
  const unlockedCompanionIds = cloneStringArray(readDataProperty(existingState, "unlockedCompanionIds", []), "unlockedCompanionIds");
  const settings = readDataProperty(existingState, "settings", {});
  if (!isPlainRecord(settings)) throw new TypeError("settings must be a plain object");
  const locale = readDataProperty(settings, "locale", "en");
  const reducedMotion = Boolean(readDataProperty(settings, "reducedMotion", false));
  if (activeCompanionId !== null && typeof activeCompanionId !== "string") throw new TypeError("activeCompanionId must be a string or null");
  if (typeof locale !== "string") throw new TypeError("settings.locale must be a string");

  const value = {
    activeCompanionId,
    unlockedCompanionIds,
    locale,
    reducedMotion,
    presentationRefs: {}
  };
  return deepFreeze({ ...value, sourceDigest: stableDigest(value) });
}
