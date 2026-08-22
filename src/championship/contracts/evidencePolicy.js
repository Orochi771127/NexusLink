import { clonePlainData, isPlainRecord } from "./championshipContracts.js";

const PUBLIC_EVIDENCE_STATUSES = new Set([
  "NEXUS_RESEARCH_RULE",
  "VERIFIED_BINARY",
  "VERIFIED_CROSSCHECK"
]);

const PRIVATE_ONLY_EVIDENCE_STATUSES = new Set([
  "HIGH_CONFIDENCE",
  "UNKNOWN_REQUIRES_TRACE",
  "HIGH_CONFIDENCE_STRUCTURE",
  "UNKNOWN_SEMANTIC"
]);

const SAFE_FINDING_ID = /^[a-z0-9][a-z0-9:_-]{2,95}$/i;
const EXECUTABLE_RULE_KEYS = Object.freeze([
  "evidenceRefs",
  "evidenceStatus",
  "executable",
  "originalParityClaim",
  "ruleAuthority",
  "value"
]);

export function validateFindingId(findingId) {
  if (typeof findingId !== "string" || !SAFE_FINDING_ID.test(findingId)) {
    throw new TypeError("Finding IDs must be short sanitized identifiers");
  }
  if (findingId.includes("\\") || findingId.includes("/") || findingId.includes("..")) {
    throw new TypeError("Finding IDs cannot contain file-system paths");
  }
  return findingId;
}

export function validateEvidenceBoundExecutableRule(rule) {
  if (!isPlainRecord(rule)) throw new TypeError("Executable rule must be a plain object");
  const keys = Object.keys(rule).sort();
  if (keys.length !== EXECUTABLE_RULE_KEYS.length || keys.some((key, index) => key !== EXECUTABLE_RULE_KEYS[index])) {
    throw new Error("Executable rule contains missing or unsupported fields");
  }
  clonePlainData(rule.value);
  if (PRIVATE_ONLY_EVIDENCE_STATUSES.has(rule.evidenceStatus)) {
    throw new Error(`${rule.evidenceStatus} is private-only and cannot enter a public executable rule`);
  }
  if (!PUBLIC_EVIDENCE_STATUSES.has(rule.evidenceStatus)) throw new Error("Unknown public evidence status");
  if (!Array.isArray(rule.evidenceRefs)) throw new TypeError("evidenceRefs must be an array");
  rule.evidenceRefs.forEach(validateFindingId);
  if (rule.executable === true && (rule.value === null || rule.value === undefined)) {
    throw new Error("Executable rules require a non-null value");
  }
  if (rule.executable !== true && rule.value !== null) {
    throw new Error("Non-executable rules must have a null value");
  }

  if (rule.ruleAuthority === "NEXUS_ADAPTATION") {
    if (rule.evidenceStatus !== "NEXUS_RESEARCH_RULE" || rule.executable !== true || rule.originalParityClaim !== false) {
      throw new Error("Nexus adaptations must be research rules with no original-parity claim");
    }
  } else if (rule.ruleAuthority === "VERIFIED_YDIJ_RULE") {
    if (!new Set(["VERIFIED_BINARY", "VERIFIED_CROSSCHECK"]).has(rule.evidenceStatus)) {
      throw new Error("Verified YDIJ rules require verified evidence");
    }
    if (rule.evidenceRefs.length === 0) throw new Error("Verified YDIJ rules require accepted evidence references");
    if (rule.originalParityClaim !== true) throw new Error("Verified YDIJ rules must declare their bounded parity claim");
  } else {
    throw new Error("Unknown rule authority");
  }
  return true;
}

export function validateAggregateParity(aggregate) {
  if (!isPlainRecord(aggregate) || !Array.isArray(aggregate.blockingFindingIds)) {
    throw new TypeError("Aggregate parity must include a blockingFindingIds array");
  }
  aggregate.blockingFindingIds.forEach(validateFindingId);
  if (aggregate.status === "BLOCKED_UNKNOWN" && aggregate.blockingFindingIds.length === 0) {
    throw new Error("BLOCKED_UNKNOWN requires at least one sanitized finding ID");
  }
  if (aggregate.status !== "BLOCKED_UNKNOWN" && aggregate.blockingFindingIds.length !== 0) {
    throw new Error("Only BLOCKED_UNKNOWN may carry blocking finding IDs");
  }
  if (!["RESEARCH_NON_PARITY", "VERIFIED_BEHAVIOR", "BLOCKED_UNKNOWN"].includes(aggregate.status)) {
    throw new Error("Unknown aggregate parity status");
  }
  return true;
}

export const PUBLIC_EVIDENCE_POLICY = Object.freeze({
  publicStatuses: Object.freeze([...PUBLIC_EVIDENCE_STATUSES]),
  privateOnlyStatuses: Object.freeze([...PRIVATE_ONLY_EVIDENCE_STATUSES])
});
