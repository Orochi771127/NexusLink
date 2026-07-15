/**
 * Cross-session companion preference persistence.
 * Runtime storage is injected from the canonical Nexus Link save state. The old
 * key is exported only so saveManager can migrate pre-consolidation installs.
 */
export const LEGACY_PREFERENCE_STORAGE_KEY = "nexusLinkCompanionPrefs:v1";
export const PREFERENCE_STORAGE_KEY = LEGACY_PREFERENCE_STORAGE_KEY;
const STORE_VERSION = 1;
const MAX_LEARNED_SIGNALS = 12;

const EMPTY_STORE = Object.freeze({
  version: STORE_VERSION,
  updatedAt: 0,
  companions: {}
});

let activeStore = cloneStore(EMPTY_STORE);

export function loadPreferenceStore() {
  return cloneStore(activeStore);
}

export function savePreferenceStore(store = {}) {
  activeStore = cloneStore({
    version: STORE_VERSION,
    updatedAt: Date.now(),
    companions: store.companions || {}
  });
  return true;
}

export function replacePreferenceStore(store = {}) {
  activeStore = cloneStore({
    version: Number(store.version) || STORE_VERSION,
    updatedAt: Number(store.updatedAt) || 0,
    companions: store.companions || {}
  });
  return loadPreferenceStore();
}

export function getPersistedCompanionProfile(companionId = "default") {
  const store = loadPreferenceStore();
  const profile = store.companions?.[companionId];
  if (!profile) return null;
  return sanitizePersistedProfile(profile);
}

export function commitCompanionPreferenceProfile(companionId = "default", profile = {}) {
  const store = loadPreferenceStore();
  const existing = store.companions?.[companionId] || null;
  const merged = mergePersistedProfiles(existing, profile, { now: Date.now() });

  store.companions[companionId] = merged;
  store.updatedAt = Date.now();
  savePreferenceStore(store);
  return merged;
}

export function clearPersistedCompanionPreferences(companionId = null) {
  const store = loadPreferenceStore();
  if (companionId) {
    delete store.companions[companionId];
  } else {
    store.companions = {};
  }
  store.updatedAt = Date.now();
  savePreferenceStore(store);
}

export function mergePersistedProfiles(persisted = null, session = {}, { now = Date.now() } = {}) {
  const base = persisted ? sanitizePersistedProfile(persisted) : emptyPersistedProfile();
  const next = { ...base };

  next.replyLengthBias = stickyReplyLengthBias(base.replyLengthBias, session.replyLengthBias);
  next.avoidComfortIntensity = blendScalar(base.avoidComfortIntensity, session.avoidComfortIntensity, 0.35);
  next.boundarySensitivity = blendScalar(base.boundarySensitivity, session.boundarySensitivity, 0.4);
  next.interactionPace = blendScalar(base.interactionPace, session.interactionPace, 0.35, -1, 1);
  next.preferPresenceOverAdvice =
    Boolean(base.preferPresenceOverAdvice) || Boolean(session.preferPresenceOverAdvice);
  next.eveningAffinity = Boolean(base.eveningAffinity) || Boolean(session.eveningAffinity);
  next.restAffinity = Boolean(base.restAffinity) || Boolean(session.restAffinity);

  next.learnedSignals = mergeLearnedSignals(base.learnedSignals, session.learnedSignals);
  next.sessionCount = (base.sessionCount || 0) + (session._sessionBump ? 1 : 0);
  next.lastSeenAt = now;
  next.updatedAt = now;

  return next;
}

export function hydrateSessionProfileFromStore(companionId = "default", defaultProfile = {}) {
  const persisted = getPersistedCompanionProfile(companionId);
  if (!persisted) {
    return {
      ...defaultProfile,
      learnedSignals: [...(defaultProfile.learnedSignals || [])]
    };
  }

  return {
    replyLengthBias: persisted.replyLengthBias || defaultProfile.replyLengthBias || "normal",
    avoidComfortIntensity: persisted.avoidComfortIntensity ?? defaultProfile.avoidComfortIntensity ?? 0,
    preferPresenceOverAdvice:
      persisted.preferPresenceOverAdvice ?? defaultProfile.preferPresenceOverAdvice ?? false,
    boundarySensitivity: persisted.boundarySensitivity ?? defaultProfile.boundarySensitivity ?? 0,
    interactionPace: persisted.interactionPace ?? defaultProfile.interactionPace ?? 0,
    eveningAffinity: persisted.eveningAffinity ?? defaultProfile.eveningAffinity ?? false,
    restAffinity: persisted.restAffinity ?? defaultProfile.restAffinity ?? false,
    learnedSignals: [...(persisted.learnedSignals || [])],
    _hydratedFromStore: true,
    _sessionCount: persisted.sessionCount || 0
  };
}

function emptyPersistedProfile() {
  return {
    replyLengthBias: "normal",
    avoidComfortIntensity: 0,
    preferPresenceOverAdvice: false,
    boundarySensitivity: 0,
    interactionPace: 0,
    eveningAffinity: false,
    restAffinity: false,
    learnedSignals: [],
    sessionCount: 0,
    lastSeenAt: 0,
    updatedAt: 0
  };
}

function sanitizePersistedProfile(profile = {}) {
  return {
    replyLengthBias: profile.replyLengthBias === "short" ? "short" : "normal",
    avoidComfortIntensity: clamp01(profile.avoidComfortIntensity),
    preferPresenceOverAdvice: Boolean(profile.preferPresenceOverAdvice),
    boundarySensitivity: clamp01(profile.boundarySensitivity),
    interactionPace: clamp(profile.interactionPace, -1, 1),
    eveningAffinity: Boolean(profile.eveningAffinity),
    restAffinity: Boolean(profile.restAffinity),
    learnedSignals: Array.isArray(profile.learnedSignals)
      ? profile.learnedSignals.slice(-MAX_LEARNED_SIGNALS)
      : [],
    sessionCount: Math.max(0, Number(profile.sessionCount) || 0),
    lastSeenAt: Number(profile.lastSeenAt) || 0,
    updatedAt: Number(profile.updatedAt) || 0
  };
}

function stickyReplyLengthBias(persisted = "normal", session = "normal") {
  if (persisted === "short" || session === "short") return "short";
  return "normal";
}

function blendScalar(base = 0, session = 0, sessionWeight = 0.35, min = 0, max = 1) {
  const a = Number(base) || 0;
  const b = Number(session) || 0;
  return clamp(a * (1 - sessionWeight) + b * sessionWeight, min, max);
}

function mergeLearnedSignals(persisted = [], session = []) {
  const merged = [];
  for (const signal of [...persisted, ...session]) {
    if (signal && !merged.includes(signal)) merged.push(signal);
  }
  return merged.slice(-MAX_LEARNED_SIGNALS);
}

function cloneStore(store) {
  return {
    version: Number(store.version) || STORE_VERSION,
    updatedAt: Number(store.updatedAt) || 0,
    companions: Object.fromEntries(
      Object.entries(store.companions || {}).map(([companionId, profile]) => [
        companionId,
        {
          ...(profile || {}),
          learnedSignals: [...(profile?.learnedSignals || [])]
        }
      ])
    )
  };
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
