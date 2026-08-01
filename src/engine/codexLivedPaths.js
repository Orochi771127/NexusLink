import { isKnownCompanionId } from "../data/companionRegistry.js";
import {
  COMPANION_GROWTH_SOURCE_TYPES,
  COMPANION_GROWTH_TENDENCIES
} from "./companionGrowthEngine.js";
import { inspectCanonicalReflectionSource } from "./reflectionGrowthOwner.js";

const GROWTH_STAGES = new Set([
  "initial_awakened",
  "resonant_mature",
  "final_awakened"
]);
const SOURCE_TYPES = new Set(COMPANION_GROWTH_SOURCE_TYPES);
const TENDENCIES = new Set(COMPANION_GROWTH_TENDENCIES);
const MAX_TEXT_LENGTH = 180;

/**
 * Project per-companion lived paths for Codex presentation.
 *
 * The result is rebuilt entirely from canonical state, never creates a
 * companion record and never exposes progress counts, readiness, thresholds,
 * rewards or source text. Global chapter/clear collections only corroborate a
 * per-companion Growth detail; they can never establish ownership by themselves.
 */
export function projectCodexLivedPaths({ state = {}, companionId = null } = {}) {
  const record = getVisibleCanonicalRecord(state, companionId);
  if (!record) return emptyProjection();

  const stageId = GROWTH_STAGES.has(record.growth?.stage)
    ? record.growth.stage
    : null;
  if (!stageId) return emptyProjection();

  const evidence = Array.isArray(record.growth.evidence)
    ? record.growth.evidence
    : [];
  const consumedRoots = new Set(
    Array.isArray(record.growth.consumedRootKeys)
      ? record.growth.consumedRootKeys.filter((value) => isBoundedText(value))
      : []
  );
  const coverage = inspectCoverage(record.growth.coverage);
  const legalDetails = evidence
    .filter((detail) => isLegalEvidenceDetail(
      detail,
      companionId,
      consumedRoots,
      coverage
    ))
    .filter((detail) => isCorroboratedByCanonicalState(detail, state, companionId))
    .sort(compareEvidence);

  const seenEvidenceKeys = new Set();
  const seenRoots = new Set();
  const seenEchoes = new Set();
  const pathEchoes = [];
  for (const detail of legalDetails) {
    if (seenEvidenceKeys.has(detail.key) || seenRoots.has(detail.rootContextKey)) continue;
    seenEvidenceKeys.add(detail.key);
    seenRoots.add(detail.rootContextKey);

    const echoKey = `${detail.sourceType}:${detail.tendency}`;
    if (seenEchoes.has(echoKey)) continue;
    seenEchoes.add(echoKey);
    pathEchoes.push(Object.freeze({
      sourceType: detail.sourceType,
      tendencyId: detail.tendency,
      labelKey: `growth.livedPaths.${detail.sourceType}.label`,
      copyKey: `growth.livedPaths.${detail.sourceType}.${detail.tendency}`
    }));
  }

  return deepFreeze({
    stageId,
    pathEchoes,
    signalId: pathEchoes.length > 0 ? "lived_path_echoing" : "lived_path_quiet"
  });
}

function getVisibleCanonicalRecord(state, companionId) {
  if (!isPlainObject(state) || !isKnownCompanionId(companionId)) return null;
  if (!Array.isArray(state.unlockedCompanionIds)
    || !state.unlockedCompanionIds.includes(companionId)) return null;
  if (state.companionStates?.version !== 1
    || !isPlainObject(state.companionStates.byId)) return null;
  const record = state.companionStates.byId[companionId];
  return isPlainObject(record) && isPlainObject(record.growth) ? record : null;
}

function isLegalEvidenceDetail(detail, companionId, consumedRoots, coverage) {
  if (!isPlainObject(detail)
    || detail.companionId !== companionId
    || !SOURCE_TYPES.has(detail.sourceType)
    || !TENDENCIES.has(detail.tendency)
    || detail.growthSafetyExcluded !== false
    || detail.legacyAttributed !== false
    || !normalizePositiveTimestamp(detail.createdAt)
    || !isBoundedText(detail.key)
    || !isBoundedText(detail.rootContextKey)
    || !isBoundedText(detail.sourceId, 160)
    || !coverage
    || !consumedRoots.has(detail.rootContextKey)) return false;
  if (detail.memoryId !== null && detail.memoryId !== undefined
    && !isBoundedText(detail.memoryId, 120)) return false;
  if (detail.traceId !== null && detail.traceId !== undefined
    && !isBoundedText(detail.traceId, 120)) return false;
  if (detail.createdAt >= coverage.windowOpenedAt
    && !coverage.rootsBySourceType[detail.sourceType].has(detail.rootContextKey)) {
    return false;
  }
  return isCoherentEvidenceIdentity(detail);
}

function isCoherentEvidenceIdentity(detail) {
  const rootParts = detail.rootContextKey.split(":");
  const sourceParts = detail.sourceId.split(":");
  switch (detail.sourceType) {
    case "care":
    case "exploration":
    case "standoff":
    case "chapter": {
      if (rootParts.length !== 3 || sourceParts.length !== 2) return false;
      if (rootParts[0] !== detail.sourceType || sourceParts[0] !== rootParts[2]) return false;
      if (detail.key !== `${detail.rootContextKey}:${sourceParts[1]}`) return false;
      const chapterNo = normalizeChapterNo(rootParts[1]);
      return chapterNo !== null && detail.chapterNo === chapterNo;
    }
    case "reflection": {
      if (rootParts.length !== 2 || sourceParts.length !== 2) return false;
      if (rootParts[0] !== "reflection" || sourceParts[0] !== rootParts[1]) return false;
      if (detail.key !== `${detail.rootContextKey}:${sourceParts[1]}`) return false;
      const memoryId = detail.memoryId || null;
      const traceId = detail.traceId || null;
      return Boolean(memoryId) !== Boolean(traceId)
        && (memoryId || traceId) === rootParts[1]
        && (detail.chapterNo === null || detail.chapterNo === undefined);
    }
    case "boundary":
      return detail.key === `boundary:${detail.rootContextKey}:respected`
        && detail.sourceId === `${detail.rootContextKey}:respected`;
    case "recovery":
      return detail.key === `recovery:${detail.rootContextKey}:completed`
        && detail.sourceId === `${detail.rootContextKey}:completed`;
    default:
      return false;
  }
}

function isCorroboratedByCanonicalState(detail, state, companionId) {
  switch (detail.sourceType) {
    case "reflection": {
      return inspectCanonicalReflectionSource({
        state,
        companionId,
        memoryId: detail.memoryId || null,
        traceId: detail.traceId || null,
        at: detail.createdAt
      }).ok;
    }
    case "exploration": {
      const [nodeId, choiceId] = detail.sourceId.split(":");
      if (choiceId === "orbit_clear" || choiceId === "first_clear") {
        return hasCanonicalId(state.activityProgress?.orbit?.clearedStageIds, nodeId);
      }
      const visits = state.explorationProgress?.visitCounts;
      return isPlainObject(visits) && Number(visits[nodeId]) > 0;
    }
    case "standoff": {
      const [nodeId] = detail.sourceId.split(":");
      return hasCanonicalId(state.activityProgress?.standoff?.clearedScenarioIds, nodeId);
    }
    case "chapter": {
      const chapterNo = detail.chapterNo;
      const current = normalizeChapterNo(state.chapterProgress?.current);
      const completed = Array.isArray(state.chapterProgress?.completed)
        ? state.chapterProgress.completed.map(normalizeChapterNo).filter(Boolean)
        : [];
      const marks = state.resonance?.chapterMarks;
      return (current !== null && current >= chapterNo)
        || completed.includes(chapterNo)
        || (isPlainObject(marks) && Object.prototype.hasOwnProperty.call(marks, chapterNo));
    }
    default:
      return true;
  }
}

function hasCanonicalId(values, expected) {
  return Array.isArray(values)
    && values.some((value) => typeof value === "string" && value === expected);
}

function compareEvidence(left, right) {
  if (left.createdAt !== right.createdAt) return left.createdAt - right.createdAt;
  if (left.key === right.key) return 0;
  return left.key < right.key ? -1 : 1;
}

function inspectCoverage(coverage) {
  const windowOpenedAt = normalizePositiveTimestamp(coverage?.windowOpenedAt);
  const rawRoots = coverage?.rootsBySourceType;
  if (!windowOpenedAt || !isPlainObject(rawRoots)) return null;
  const rootsBySourceType = {};
  for (const sourceType of COMPANION_GROWTH_SOURCE_TYPES) {
    const roots = rawRoots[sourceType];
    if (!Array.isArray(roots) || roots.some((root) => !isBoundedText(root))) return null;
    rootsBySourceType[sourceType] = new Set(roots);
  }
  return { windowOpenedAt, rootsBySourceType };
}

function normalizeChapterNo(value) {
  const chapterNo = Number(value);
  return Number.isInteger(chapterNo) && chapterNo >= 1 && chapterNo <= 7
    ? chapterNo
    : null;
}

function normalizePositiveTimestamp(value) {
  return Number.isFinite(value) && value > 0 ? value : null;
}

function isBoundedText(value, maxLength = MAX_TEXT_LENGTH) {
  return typeof value === "string" && value.length > 0 && value.length <= maxLength;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function emptyProjection() {
  return Object.freeze({
    stageId: null,
    pathEchoes: Object.freeze([]),
    signalId: "lived_path_unavailable"
  });
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach((child) => deepFreeze(child));
  return value;
}
