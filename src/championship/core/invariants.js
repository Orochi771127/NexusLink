import {
  CHAMPIONSHIP_PHASES,
  CHAMPIONSHIP_SCHEMA_VERSION,
  assertResultEnvelope,
  isPlainRecord
} from "../contracts/championshipContracts.js";

const FORBIDDEN_OUTPUT_KEYS = new Set([
  "playerStatePatch",
  "saveCommand",
  "cloudCommand",
  "relationshipDelta",
  "growthDelta",
  "productionRewardWrite"
]);

function assertNoForbiddenOutputKeys(value, path = "$", seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_OUTPUT_KEYS.has(key)) throw new Error(`Forbidden Championship state key at ${path}.${key}`);
    assertNoForbiddenOutputKeys(child, `${path}.${key}`, seen);
  }
}

export function assertChampionshipStateInvariants(state) {
  if (!isPlainRecord(state)) throw new TypeError("Championship state must be a plain object");
  if (state.schemaVersion !== CHAMPIONSHIP_SCHEMA_VERSION) throw new Error("Unsupported Championship state schema version");
  if (!Number.isInteger(state.revision) || state.revision < 0) throw new Error("Championship revision must be non-negative");
  if (!state.session || !CHAMPIONSHIP_PHASES.includes(state.session.phase)) throw new Error("Championship phase is invalid");
  if (state.session.committable !== false) throw new Error("Championship sessions are never committable");
  if (state.session.persistencePolicy !== "MEMORY_ONLY_DISCARD_ON_EXIT") throw new Error("Championship persistence policy changed");
  if (state.economy.source !== "RESEARCH_FIXTURE") throw new Error("Championship economy must be a research fixture");
  if (state.collection.authority !== "RESEARCH_FIXTURE") throw new Error("Championship collection cannot claim player authority");
  for (const instance of Object.values(state.collection.instancesById)) {
    if (instance.playerOwned !== false || instance.relationshipAuthority !== "NONE") {
      throw new Error("Research captures cannot claim player ownership or relationship authority");
    }
  }
  assertNoForbiddenOutputKeys(state);
  return true;
}

export function assertTransitionResult(result) {
  assertResultEnvelope(result);
  return true;
}
