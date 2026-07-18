import { DEFAULT_COMPANION_ID, isKnownCompanionId } from "../data/companionRegistry.js";
import { clamp } from "../utils/clamp.js";

export const COMPANION_STATE_SCHEMA_VERSION = 1;
export const COMPANION_GROWTH_MIGRATION_VERSION = 1;

// These fields remain at the top level as the active companion compatibility
// mirror. companionStates.byId is the durable source of truth.
export const RELATION_MIRROR_FIELDS = Object.freeze([
  "bond",
  "trust",
  "mood",
  "energy",
  "defense",
  "touchFatigue",
  "lastTouchAt",
  "lastRejectAt",
  "blockedTouchCount",
  "lastBlockedTouchAt",
  "firstTouchCompleted",
  "firstHugCompleted",
  "reactionPreview",
  "lastTouchReaction"
]);

export const COMPANION_GROWTH_STAGES = Object.freeze([
  "initial_awakened",
  "resonant_mature",
  "final_awakened"
]);

export const GROWTH_SOURCE_TYPES = Object.freeze([
  "care",
  "exploration",
  "reflection",
  "standoff",
  "chapter",
  "boundary",
  "recovery"
]);

const STAGE_RANK = new Map(COMPANION_GROWTH_STAGES.map((stage, index) => [stage, index]));
const SOURCE_TYPE_SET = new Set(GROWTH_SOURCE_TYPES);
const MAX_EVIDENCE_DETAILS = 24;
const MAX_CONSUMED_ROOT_KEYS = 48;

export function createDefaultRelationshipState(overrides = {}) {
  const source = overrides && typeof overrides === "object" ? overrides : {};
  return {
    bond: clampNumber(source.bond, 0, 100, 0),
    trust: clampNumber(source.trust, 0, 100, 5),
    mood: normalizeText(source.mood, "calm", 32),
    energy: clampNumber(source.energy, 0, 10, 10),
    defense: clampNumber(source.defense, 0, 100, 35),
    touchFatigue: clampNumber(source.touchFatigue, 0, 10, 0),
    lastTouchAt: normalizeOptionalTimestamp(source.lastTouchAt),
    lastRejectAt: normalizeOptionalTimestamp(source.lastRejectAt),
    blockedTouchCount: clampNumber(source.blockedTouchCount, 0, 999, 0),
    lastBlockedTouchAt: normalizeOptionalTimestamp(source.lastBlockedTouchAt),
    firstTouchCompleted: Boolean(source.firstTouchCompleted),
    firstHugCompleted: Boolean(source.firstHugCompleted),
    reactionPreview: normalizeText(source.reactionPreview, "", 280),
    lastTouchReaction: normalizeText(source.lastTouchReaction, "", 64)
  };
}

export function createDefaultGrowthState({
  now = Date.now(),
  stage = "initial_awakened",
  migration = {},
  companionId = null
} = {}) {
  const normalizedStage = normalizeStage(stage);
  return {
    stage: normalizedStage,
    evidence: [],
    coverage: createDefaultCoverage(normalizedStage, now),
    consumedRootKeys: [],
    offeredStage: null,
    deferredAt: null,
    lastGrowthEventAt: null,
    migration: normalizeMigration(migration, { companionId })
  };
}

export function createDefaultCompanionStates(
  activeCompanionId = DEFAULT_COMPANION_ID,
  now = Date.now()
) {
  const companionId = isKnownCompanionId(activeCompanionId)
    ? activeCompanionId
    : DEFAULT_COMPANION_ID;
  return {
    version: COMPANION_STATE_SCHEMA_VERSION,
    byId: {
      [companionId]: createCompanionRecord({ companionId, relationship: {}, now })
    }
  };
}

export function hasCanonicalCompanionStates(value) {
  return Boolean(
    value
    && typeof value === "object"
    && value.version === COMPANION_STATE_SCHEMA_VERSION
    && value.byId
    && typeof value.byId === "object"
    && !Array.isArray(value.byId)
  );
}

/**
 * Normalize a canonical bundle, or migrate the old one-global-relationship
 * shape exactly once. legacyRelationshipPresent must be derived from the raw
 * save, never from defaults merged into it.
 */
export function normalizeCompanionStates(rawBundle, {
  activeCompanionId = DEFAULT_COMPANION_ID,
  unlockedCompanionIds = [DEFAULT_COMPANION_ID],
  legacyState = {},
  legacyRelationshipPresent = false,
  canonicalFieldPresent = rawBundle !== undefined,
  now = Date.now()
} = {}) {
  const normalizedNow = normalizeRequiredTimestamp(now, Date.now());
  const activeId = isKnownCompanionId(activeCompanionId)
    ? activeCompanionId
    : DEFAULT_COMPANION_ID;

  if (hasCanonicalCompanionStates(rawBundle)) {
    const byId = {};
    for (const [companionId, rawRecord] of Object.entries(rawBundle.byId)) {
      if (!isKnownCompanionId(companionId)) continue;
      byId[companionId] = normalizeCompanionRecord(rawRecord, companionId, normalizedNow);
    }

    if (!byId[activeId]) {
      byId[activeId] = createCompanionRecord({ companionId: activeId, relationship: {}, now: normalizedNow });
    } else if (!byId[activeId].relationship) {
      // An archive-only record becomes real only when the companion is active.
      // Do not borrow the previous active companion's compatibility mirror.
      byId[activeId] = {
        ...byId[activeId],
        relationship: createDefaultRelationshipState()
      };
    }

    return { version: COMPANION_STATE_SCHEMA_VERSION, byId };
  }

  // A present but malformed/unknown-version canonical field is corruption,
  // not proof of a legacy save. Fail closed to one safe active baseline rather
  // than copying a possibly stale compatibility mirror into relationship truth.
  if (canonicalFieldPresent) {
    return createDefaultCompanionStates(activeId, normalizedNow);
  }

  const relationship = createDefaultRelationshipState(legacyState);
  const legacyFloor = legacyRelationshipPresent
    ? getLegacyStageFloorForBond(relationship.bond)
    : null;
  const migration = legacyRelationshipPresent
    ? {
        appliedVersion: COMPANION_GROWTH_MIGRATION_VERSION,
        legacyStageFloor: legacyFloor,
        legacyCodexRevealFloor: legacyFloor,
        legacyBaselineKey: `legacy:v1:${activeId}:relationship`
      }
    : {};
  const byId = {
    [activeId]: createCompanionRecord({
      companionId: activeId,
      relationship,
      now: normalizedNow,
      stage: legacyFloor || "initial_awakened",
      migration
    })
  };

  if (legacyRelationshipPresent) {
    for (const companionId of uniqueKnownIds(unlockedCompanionIds)) {
      if (companionId === activeId) continue;
      byId[companionId] = createCompanionRecord({
        companionId,
        relationship: null,
        now: normalizedNow,
        migration: {
          appliedVersion: COMPANION_GROWTH_MIGRATION_VERSION,
          legacyStageFloor: null,
          legacyCodexRevealFloor: legacyFloor,
          legacyBaselineKey: `legacy:v1:${companionId}:codex-archive`
        }
      });
    }
  }

  return { version: COMPANION_STATE_SCHEMA_VERSION, byId };
}

export function getCompanionRelationship(companionStates, companionId) {
  if (!hasCanonicalCompanionStates(companionStates) || !isKnownCompanionId(companionId)) {
    return null;
  }
  const relationship = companionStates.byId?.[companionId]?.relationship;
  return relationship && typeof relationship === "object"
    ? createDefaultRelationshipState(relationship)
    : null;
}

/**
 * Store-runtime helper: seal the top-level active mirror into a canonical
 * companion record while preserving growth data. This function is pure.
 */
export function archiveRelationshipMirror(targetState, companionId = targetState?.activeCompanionId) {
  if (!targetState || !isKnownCompanionId(companionId)) return targetState;
  if (!hasCanonicalCompanionStates(targetState.companionStates)) return targetState;

  const existing = targetState.companionStates.byId?.[companionId];
  const record = existing
    ? normalizeCompanionRecord(existing, companionId, Date.now())
    : createCompanionRecord({ companionId, relationship: {}, now: Date.now() });
  const byId = {
    ...targetState.companionStates.byId,
    [companionId]: {
      ...record,
      relationship: createDefaultRelationshipState(targetState)
    }
  };

  return {
    ...targetState,
    companionStates: {
      version: COMPANION_STATE_SCHEMA_VERSION,
      byId
    }
  };
}

export function hydrateRelationshipMirror(targetState, companionId = targetState?.activeCompanionId) {
  const relationship = getCompanionRelationship(targetState?.companionStates, companionId);
  if (!relationship) return targetState;
  return { ...targetState, ...relationship };
}

export function getCompanionCodexRevealStage(companionStates, companionId) {
  return getCompanionCodexGrowthPresentation(companionStates, companionId).revealStage;
}

export function getCompanionCodexGrowthPresentation(companionStates, companionId) {
  if (!hasCanonicalCompanionStates(companionStates) || !isKnownCompanionId(companionId)) {
    return {
      formalStage: "initial_awakened",
      revealStage: "initial_awakened",
      isLegacyArchive: false
    };
  }
  const record = companionStates.byId?.[companionId];
  if (!record || typeof record !== "object") {
    return {
      formalStage: "initial_awakened",
      revealStage: "initial_awakened",
      isLegacyArchive: false
    };
  }
  const stage = normalizeStage(record.growth?.stage);
  const legacyFloor = normalizeOptionalStage(record.growth?.migration?.legacyCodexRevealFloor);
  const revealStage = maxStage(stage, legacyFloor);
  return {
    formalStage: stage,
    revealStage,
    // Compatibility provenance must remain visible after an archive-only
    // companion is activated and receives its fresh relationship baseline.
    isLegacyArchive: Boolean(
      legacyFloor
      && (STAGE_RANK.get(revealStage) || 0) > (STAGE_RANK.get(stage) || 0)
    )
  };
}

export function getLegacyStageFloorForBond(value) {
  const bond = clampNumber(value, 0, 100, 0);
  if (bond >= 70) return "final_awakened";
  if (bond >= 25) return "resonant_mature";
  return "initial_awakened";
}

export function rawStateHasRelationshipMirror(rawState) {
  if (!rawState || typeof rawState !== "object") return false;
  return RELATION_MIRROR_FIELDS.some((field) => Object.prototype.hasOwnProperty.call(rawState, field));
}

function createCompanionRecord({
  companionId = null,
  relationship = null,
  now = Date.now(),
  stage = "initial_awakened",
  migration = {}
} = {}) {
  return {
    relationship: relationship === null ? null : createDefaultRelationshipState(relationship),
    growth: createDefaultGrowthState({ now, stage, migration, companionId })
  };
}

function normalizeCompanionRecord(rawRecord, companionId, now) {
  const record = rawRecord && typeof rawRecord === "object" ? rawRecord : {};
  const relationship = record.relationship === null
    ? null
    : createDefaultRelationshipState(record.relationship);
  return {
    relationship,
    growth: normalizeGrowth(record.growth, companionId, now)
  };
}

function normalizeGrowth(rawGrowth, companionId, now) {
  const growth = rawGrowth && typeof rawGrowth === "object" ? rawGrowth : {};
  const migration = normalizeMigration(growth.migration, { companionId });
  const stage = maxStage(normalizeStage(growth.stage), migration.legacyStageFloor);
  const rawEvidence = Array.isArray(growth.evidence) ? growth.evidence : [];
  const evidence = dedupeEvidence(rawEvidence
    .map((item) => normalizeEvidence(item, companionId))
    .filter(Boolean))
    .slice(-MAX_EVIDENCE_DETAILS);
  const expectedOffer = getNextStage(stage);
  return {
    stage,
    evidence,
    coverage: normalizeCoverage(growth.coverage, stage, now),
    consumedRootKeys: normalizeStringList(growth.consumedRootKeys, MAX_CONSUMED_ROOT_KEYS),
    offeredStage: growth.offeredStage === expectedOffer ? expectedOffer : null,
    deferredAt: normalizeOptionalTimestamp(growth.deferredAt),
    lastGrowthEventAt: normalizeOptionalTimestamp(growth.lastGrowthEventAt),
    migration
  };
}

function normalizeEvidence(rawEvidence, companionId) {
  const evidence = rawEvidence && typeof rawEvidence === "object" ? rawEvidence : null;
  // Growth evidence is opt-in provenance. Missing, stringified, or truthy
  // safety markers fail closed instead of being laundered into explicit false.
  if (!evidence || evidence.growthSafetyExcluded !== false) return null;
  if (evidence.companionId !== companionId) return null;
  if (!SOURCE_TYPE_SET.has(evidence.sourceType)) return null;
  const key = normalizeText(evidence.key, "", 180);
  const rootContextKey = normalizeText(evidence.rootContextKey, "", 180);
  const sourceId = normalizeText(evidence.sourceId, "", 160);
  const tendency = normalizeText(evidence.tendency, "", 64);
  const createdAt = normalizeOptionalTimestamp(evidence.createdAt);
  if (!key || !rootContextKey || !sourceId || !tendency || !createdAt) return null;
  return {
    key,
    rootContextKey,
    companionId,
    tendency,
    sourceType: evidence.sourceType,
    sourceId,
    chapterNo: normalizeOptionalChapter(evidence.chapterNo),
    memoryId: normalizeOptionalText(evidence.memoryId, 120),
    traceId: normalizeOptionalText(evidence.traceId, 120),
    createdAt,
    growthSafetyExcluded: false,
    legacyAttributed: Boolean(evidence.legacyAttributed)
  };
}

function createDefaultCoverage(stage, now) {
  return {
    targetStage: getNextStage(stage),
    windowOpenedAt: normalizeRequiredTimestamp(now, Date.now()),
    rootsBySourceType: Object.fromEntries(GROWTH_SOURCE_TYPES.map((sourceType) => [sourceType, []])),
    consentAnchorRootKey: null
  };
}

function normalizeCoverage(rawCoverage, stage, now) {
  const coverage = rawCoverage && typeof rawCoverage === "object" ? rawCoverage : {};
  const rawRoots = coverage.rootsBySourceType && typeof coverage.rootsBySourceType === "object"
    ? coverage.rootsBySourceType
    : {};
  let remainingRoots = MAX_EVIDENCE_DETAILS;
  const rootsBySourceType = {};
  for (const sourceType of GROWTH_SOURCE_TYPES) {
    const roots = normalizeStringList(rawRoots[sourceType], remainingRoots);
    rootsBySourceType[sourceType] = roots;
    remainingRoots -= roots.length;
  }
  return {
    targetStage: normalizeTargetStage(coverage.targetStage, stage),
    windowOpenedAt: normalizeRequiredTimestamp(coverage.windowOpenedAt, now),
    rootsBySourceType,
    consentAnchorRootKey: normalizeOptionalText(coverage.consentAnchorRootKey, 180)
  };
}

function normalizeMigration(rawMigration, { companionId = null } = {}) {
  const migration = rawMigration && typeof rawMigration === "object" ? rawMigration : {};
  const appliedVersion = migration.appliedVersion;
  const validVersion = typeof appliedVersion === "number"
    && Number.isInteger(appliedVersion)
    && appliedVersion === COMPANION_GROWTH_MIGRATION_VERSION;
  const baselineKey = normalizeOptionalText(migration.legacyBaselineKey, 180);
  const relationshipKey = companionId ? `legacy:v1:${companionId}:relationship` : null;
  const archiveKey = companionId ? `legacy:v1:${companionId}:codex-archive` : null;
  const isRelationshipMarker = validVersion && baselineKey === relationshipKey;
  const isArchiveMarker = validVersion && baselineKey === archiveKey;

  if (!isRelationshipMarker && !isArchiveMarker) {
    return {
      appliedVersion: 0,
      legacyStageFloor: null,
      legacyCodexRevealFloor: null,
      legacyBaselineKey: null
    };
  }

  return {
    appliedVersion: COMPANION_GROWTH_MIGRATION_VERSION,
    legacyStageFloor: isRelationshipMarker
      ? normalizeOptionalStage(migration.legacyStageFloor)
      : null,
    legacyCodexRevealFloor: normalizeOptionalStage(migration.legacyCodexRevealFloor),
    legacyBaselineKey: baselineKey
  };
}

function normalizeTargetStage(value, currentStage) {
  const expected = getNextStage(currentStage);
  if (expected === null) return null;
  return value === expected ? value : expected;
}

function getNextStage(stage) {
  const rank = STAGE_RANK.get(normalizeStage(stage)) || 0;
  return COMPANION_GROWTH_STAGES[rank + 1] || null;
}

function maxStage(left, right) {
  const leftStage = normalizeStage(left);
  const rightStage = normalizeOptionalStage(right);
  if (!rightStage) return leftStage;
  return (STAGE_RANK.get(rightStage) || 0) > (STAGE_RANK.get(leftStage) || 0)
    ? rightStage
    : leftStage;
}

function normalizeStage(value) {
  return STAGE_RANK.has(value) ? value : "initial_awakened";
}

function normalizeOptionalStage(value) {
  return STAGE_RANK.has(value) ? value : null;
}

function uniqueKnownIds(values) {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((companionId) => isKnownCompanionId(companionId)))];
}

function normalizeStringList(values, limit) {
  if (!Array.isArray(values) || limit <= 0) return [];
  const result = [];
  for (const value of values) {
    const normalized = normalizeText(value, "", 180);
    if (!normalized || result.includes(normalized)) continue;
    result.push(normalized);
  }
  return result.slice(-limit);
}

function dedupeEvidence(values) {
  const seen = new Set();
  const result = [];
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const evidence = values[index];
    const identity = `${evidence.companionId}\u0000${evidence.key}`;
    if (seen.has(identity)) continue;
    seen.add(identity);
    result.unshift(evidence);
  }
  return result;
}

function normalizeOptionalChapter(value) {
  const chapterNo = Math.round(Number(value));
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7 ? chapterNo : null;
}

function normalizeOptionalText(value, maxLength) {
  const normalized = normalizeText(value, "", maxLength);
  return normalized || null;
}

function normalizeText(value, fallback, maxLength) {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim().slice(0, maxLength);
  return normalized || fallback;
}

function normalizeOptionalTimestamp(value) {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

function normalizeRequiredTimestamp(value, fallback) {
  return normalizeOptionalTimestamp(value) || normalizeOptionalTimestamp(fallback) || Date.now();
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return clamp(Number.isFinite(number) ? number : fallback, min, max);
}
