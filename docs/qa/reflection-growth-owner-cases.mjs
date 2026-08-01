import {
  createCompletedGrowthEvent,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";
import {
  REFLECTION_GROWTH_RESOLUTION_IDS,
  createReflectionGrowthWriteInput,
  inspectCanonicalReflectionSource
} from "../../src/engine/reflectionGrowthOwner.js";
import { sanitizeEmotionalMemory, sanitizeTrace } from "../../src/engine/storageGuard.js";
import { createDefaultGrowthState } from "../../src/state/companionStateSchema.js";

const COMPANION_ID = "greyshade-cat";
const OTHER_ID = "auriowl";
const BASE_TIME = 1785542400000;
const cases = [];

await runCase("fixed reflection resolution allowlist maps to qualitative tendencies", () => {
  assertDeepEqual(REFLECTION_GROWTH_RESOLUTION_IDS, [
    "shared_understanding",
    "accepted_rewrite",
    "held_uncertainty",
    "named_next_step"
  ], "resolution ids");

  const expected = {
    shared_understanding: ["attunement", null],
    accepted_rewrite: ["boundary_respect", "respected_rewrite"],
    held_uncertainty: ["steadfastness", null],
    named_next_step: ["pathfinding", null]
  };
  for (const resolutionId of REFLECTION_GROWTH_RESOLUTION_IDS) {
    const result = buildResult({ resolutionId });
    assertEqual(result.ok, true, `${resolutionId} accepted`);
    assertEqual(result.writeInput.tendency, expected[resolutionId][0], `${resolutionId} tendency`);
    assertEqual(result.writeInput.consentKind, expected[resolutionId][1], `${resolutionId} consent`);
  }
});

await runCase("verified memory produces a downstream-compatible write payload", () => {
  const state = makeState();
  const before = JSON.stringify(state);
  const result = buildResult({ state });
  assertEqual(result.ok, true, "owner result");
  assertEqual(result.reason, "reflection_write_input_ready", "owner reason");
  assertEqual(result.originType, "memory", "origin type");
  assertEqual(result.rootContextKey, "reflection:emem_shared", "root key");
  assertEqual(result.writeInput.sourceType, "reflection", "source type");
  assertDeepEqual(result.writeInput.context, {
    memoryId: "emem_shared",
    traceId: null,
    resolutionId: "shared_understanding"
  }, "reflection context");
  assertEqual(JSON.stringify(state), before, "source owner is pure");
  assertEqual(Object.isFrozen(result.writeInput), true, "write input frozen");

  const created = createCompletedGrowthEvent(result.writeInput);
  assertEqual(created.ok, true, "growth event created");
  assertEqual(created.event.growthSafetyExcluded, false, "event remains safe");
  const written = writeCompanionGrowthEvidence({
    growth: state.companionStates.byId[COMPANION_ID].growth,
    companionId: COMPANION_ID,
    event: created.event
  });
  assertEqual(written.result.accepted, true, "growth writer accepts payload");
});

await runCase("verified standalone habitat trace uses traceId without copying text", () => {
  const state = makeState({
    emotionalMemories: [],
    habitatTraces: [safeTrace({ memoryId: null })]
  });
  const result = buildResult({ state, memoryId: null, traceId: "htrace_shared" });
  assertEqual(result.ok, true, "trace accepted");
  assertEqual(result.originType, "trace", "trace type");
  assertEqual(result.writeInput.memoryId, null, "memory id absent");
  assertEqual(result.writeInput.traceId, "htrace_shared", "trace id retained");
  assertForbiddenFields(result, [
    "text", "rawText", "playerText", "message", "excerpt", "textHint",
    "reflectionText", "resolutionText", "copy"
  ]);
});

await runCase("linked trace must resolve to the same verified companion memory", () => {
  const validState = makeState({
    habitatTraces: [safeTrace({ memoryId: "emem_shared" })]
  });
  assertEqual(buildResult({
    state: validState,
    memoryId: null,
    traceId: "htrace_shared"
  }).ok, true, "verified linked trace");

  const missingState = makeState({
    emotionalMemories: [],
    habitatTraces: [safeTrace({ memoryId: "emem_missing" })]
  });
  const missing = buildResult({ state: missingState, memoryId: null, traceId: "htrace_shared" });
  assertEqual(missing.reason, "linked_memory_unverifiable", "missing linked memory");

  const otherOwner = makeState({
    emotionalMemories: [safeMemory({ companionId: OTHER_ID })],
    habitatTraces: [safeTrace({ memoryId: "emem_shared" })]
  });
  assertEqual(buildResult({
    state: otherOwner,
    memoryId: null,
    traceId: "htrace_shared"
  }).reason, "linked_memory_unverifiable", "linked owner mismatch");
});

await runCase("legacy records without owner or sealed safety fail closed", () => {
  const legacyMemory = {
    id: "emem_shared",
    status: "settled",
    source: "soul_talk",
    excerpt: "legacy player text"
  };
  const result = buildResult({ state: makeState({ emotionalMemories: [legacyMemory] }) });
  assertEqual(result.ok, false, "legacy record rejected");
  assertEqual(result.reason, "source_owner_unverifiable", "zero-inference owner reason");
});

await runCase("current storage sanitizers expose the G3.2 source-owner schema gate", () => {
  const normalizedMemory = sanitizeEmotionalMemory(safeMemory(), BASE_TIME);
  assertEqual(normalizedMemory.companionId, undefined, "memory owner not retained today");
  assertEqual(normalizedMemory.safetyProvenance, undefined, "memory safety seal not retained today");
  assertEqual(buildResult({
    state: makeState({ emotionalMemories: [normalizedMemory] })
  }).reason, "source_owner_unverifiable", "normalized memory fails closed");

  const normalizedTrace = sanitizeTrace(safeTrace({ memoryId: null }), BASE_TIME);
  assertEqual(normalizedTrace.companionId, undefined, "trace owner not retained today");
  assertEqual(normalizedTrace.safetyProvenance, undefined, "trace safety seal not retained today");
  assertEqual(buildResult({
    state: makeState({ emotionalMemories: [], habitatTraces: [normalizedTrace] }),
    memoryId: null,
    traceId: "htrace_shared"
  }).reason, "source_owner_unverifiable", "normalized trace fails closed");
});

await runCase("unknown, ambiguous, noncanonical and dual source ids fail closed", () => {
  assertEqual(buildResult({ memoryId: "emem_missing" }).reason, "unknown_source_id", "unknown id");
  const ambiguous = makeState({ emotionalMemories: [safeMemory(), safeMemory()] });
  assertEqual(buildResult({ state: ambiguous }).reason, "ambiguous_source_id", "duplicate ids");
  assertEqual(buildResult({ memoryId: "Memory With Spaces" }).reason, "invalid_source_id", "noncanonical id");
  assertEqual(buildResult({ traceId: "htrace_shared" }).reason,
    "reflection_source_requires_one_id", "dual ids");
  assertEqual(buildResult({ memoryId: null, traceId: null }).reason,
    "reflection_source_requires_one_id", "missing ids");
});

await runCase("owner mismatch, locked companion and missing growth never produce a payload", () => {
  const ownerMismatch = makeState({ emotionalMemories: [safeMemory({ companionId: OTHER_ID })] });
  assertEqual(buildResult({ state: ownerMismatch }).reason, "source_owner_unverifiable", "source owner");

  const activeMismatch = makeState();
  activeMismatch.activeCompanionId = OTHER_ID;
  assertEqual(buildResult({ state: activeMismatch }).reason,
    "active_companion_mismatch", "active owner");

  const locked = makeState();
  locked.unlockedCompanionIds = [];
  assertEqual(buildResult({ state: locked }).reason, "companion_locked", "locked companion");

  const missingGrowth = makeState();
  delete missingGrowth.companionStates.byId[COMPANION_ID].growth;
  assertEqual(buildResult({ state: missingGrowth }).reason,
    "missing_companion_growth", "missing growth");
});

await runCase("unknown resolution and malformed completion timestamps fail closed", () => {
  assertEqual(buildResult({ resolutionId: "best_answer" }).reason,
    "unknown_resolution", "unknown resolution");
  for (const completedAt of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "178"] ) {
    assertEqual(buildResult({ completedAt }).reason, "invalid_completed_at", `timestamp ${completedAt}`);
  }
});

await runCase("raw player copy and unexpected payload fields are rejected", () => {
  const rawText = buildResult({ playerText: "please remember this" });
  assertEqual(rawText.reason, "raw_player_text_forbidden", "raw player text");
  const unexpected = buildResult({ score: 100 });
  assertEqual(unexpected.reason, "invalid_input_shape", "unexpected score");
});

await runCase("source safety provenance is sealed and cannot be washed", () => {
  const tampered = safeMemory();
  tampered.safetyProvenance = {
    ...tampered.safetyProvenance,
    isHighRisk: true,
    excluded: false
  };
  const tamperedResult = buildResult({ state: makeState({ emotionalMemories: [tampered] }) });
  assertEqual(tamperedResult.reason, "source_safety_unverifiable", "tampered seal");

  const excludedProvenance = sealGrowthSafetyProvenance(safetyFacts({ isHighRisk: true }));
  const excluded = safeMemory({
    growthSafetyExcluded: true,
    safetyProvenance: excludedProvenance
  });
  assertEqual(buildResult({ state: makeState({ emotionalMemories: [excluded] }) }).reason,
    "source_safety_unverifiable", "excluded source");
});

await runCase("safe harbor and unsafe resolution facts are zero evidence", () => {
  const safeHarbor = makeState();
  safeHarbor.safeHarborMode = true;
  assertEqual(buildResult({ state: safeHarbor }).reason,
    "safe_harbor_zero_evidence", "safe harbor terminal");

  assertEqual(buildResult({ safetyFacts: safetyFacts({ isHighRisk: true }) }).reason,
    "resolution_safety_excluded", "high-risk completion");
  assertEqual(buildResult({ safetyFacts: safetyFacts({ strategyId: "safety_redirect" }) }).reason,
    "resolution_safety_excluded", "safety redirect");
  assertEqual(buildResult({ safetyFacts: {} }).reason,
    "resolution_safety_incomplete", "missing safety facts");
});

await runCase("released memories and expired or archived traces are not reflectable", () => {
  const released = makeState({ emotionalMemories: [safeMemory({ status: "released" })] });
  assertEqual(buildResult({ state: released }).reason, "source_not_reflectable", "released memory");

  const expired = makeState({
    emotionalMemories: [],
    habitatTraces: [safeTrace({ memoryId: null, expiresAt: BASE_TIME + 10 })]
  });
  assertEqual(buildResult({
    state: expired,
    memoryId: null,
    traceId: "htrace_shared",
    completedAt: BASE_TIME + 100
  }).reason, "source_trace_expired", "expired trace");

  const archived = makeState({
    emotionalMemories: [],
    habitatTraces: [safeTrace({ memoryId: null, status: "archived" })]
  });
  assertEqual(buildResult({ state: archived, memoryId: null, traceId: "htrace_shared" }).reason,
    "source_not_reflectable", "archived trace");
});

await runCase("missing, zero or future source timestamps fail closed", () => {
  for (const createdAt of [undefined, 0, -1, BASE_TIME + 200]) {
    const memory = safeMemory();
    if (createdAt === undefined) delete memory.createdAt;
    else memory.createdAt = createdAt;
    const result = buildResult({ state: makeState({ emotionalMemories: [memory] }) });
    assertEqual(result.reason, "source_timestamp_unverifiable", `source timestamp ${createdAt}`);
  }
});

await runCase("one immutable origin root cannot be resolved twice", () => {
  for (const placement of ["consumed", "coverage", "evidence"]) {
    const state = makeState();
    const growth = state.companionStates.byId[COMPANION_ID].growth;
    const root = "reflection:emem_shared";
    if (placement === "consumed") growth.consumedRootKeys = [root];
    if (placement === "coverage") growth.coverage.rootsBySourceType.reflection = [root];
    if (placement === "evidence") growth.evidence = [{ rootContextKey: root }];
    const result = buildResult({ state, resolutionId: "named_next_step" });
    assertEqual(result.reason, "reflection_origin_already_consumed", placement);
  }
});

await runCase("final, future or corrupt Growth windows fail before handoff", () => {
  const finalState = makeState();
  finalState.companionStates.byId[COMPANION_ID].growth = createDefaultGrowthState({
    companionId: COMPANION_ID,
    stage: "final_awakened",
    now: BASE_TIME
  });
  assertEqual(buildResult({ state: finalState }).reason, "final_stage_complete", "final stage");

  const futureWindow = makeState();
  futureWindow.companionStates.byId[COMPANION_ID].growth.coverage.windowOpenedAt = BASE_TIME + 200;
  assertEqual(buildResult({ state: futureWindow }).reason,
    "event_before_target_window", "future target window");

  const corrupt = makeState();
  corrupt.companionStates.byId[COMPANION_ID].growth.stage = "unknown_stage";
  assertEqual(buildResult({ state: corrupt }).reason, "invalid_growth_state", "corrupt growth");
});

await runCase("source inspection never returns source record copy fields", () => {
  const state = makeState();
  const inspected = inspectCanonicalReflectionSource({
    state,
    companionId: COMPANION_ID,
    memoryId: "emem_shared",
    at: BASE_TIME + 100
  });
  assertEqual(inspected.ok, true, "source inspection");
  assertDeepEqual(Object.keys(inspected).sort(), [
    "ok", "originId", "originType", "reason", "safetyProvenance"
  ], "bounded inspection fields");
  assertForbiddenFields(inspected, ["excerpt", "textHint", "playerText", "message"]);
});

await runCase("same canonical input is deterministic and deeply frozen", () => {
  const state = makeState();
  const first = buildResult({ state });
  const second = buildResult({ state: JSON.parse(JSON.stringify(state)) });
  assertDeepEqual(second, first, "deterministic result");
  assertEqual(Object.isFrozen(first), true, "result frozen");
  assertEqual(Object.isFrozen(first.writeInput.parentEvent.safetyProvenance), true,
    "parent provenance frozen");
});

const failures = cases.filter((entry) => !entry.ok);
console.log(`Reflection Growth owner cases: ${cases.length - failures.length}/${cases.length} passed`);
for (const entry of cases) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.error ? ` — ${entry.error}` : ""}`);
}
if (failures.length > 0) process.exitCode = 1;

function buildResult(overrides = {}) {
  const defaults = {
    state: makeState(),
    companionId: COMPANION_ID,
    memoryId: "emem_shared",
    traceId: null,
    resolutionId: "shared_understanding",
    completedAt: BASE_TIME + 100,
    safetyFacts: safetyFacts()
  };
  return createReflectionGrowthWriteInput({ ...defaults, ...overrides });
}

function makeState({
  emotionalMemories = [safeMemory()],
  habitatTraces = [safeTrace({ memoryId: "emem_shared" })]
} = {}) {
  return {
    activeCompanionId: COMPANION_ID,
    unlockedCompanionIds: [COMPANION_ID],
    safeHarborMode: false,
    emotionalMemories: emotionalMemories.map((item) => ({ ...item })),
    habitatTraces: habitatTraces.map((item) => ({ ...item })),
    companionStates: {
      version: 1,
      byId: {
        [COMPANION_ID]: {
          relationship: {},
          growth: createDefaultGrowthState({
            companionId: COMPANION_ID,
            now: BASE_TIME
          })
        }
      }
    }
  };
}

function safeMemory(overrides = {}) {
  return {
    id: "emem_shared",
    companionId: COMPANION_ID,
    status: "settled",
    source: "chapter",
    excerpt: "private player wording must never enter Growth",
    createdAt: BASE_TIME,
    growthSafetyExcluded: false,
    safetyProvenance: sealGrowthSafetyProvenance(safetyFacts()),
    ...overrides
  };
}

function safeTrace(overrides = {}) {
  return {
    id: "htrace_shared",
    memoryId: null,
    companionId: COMPANION_ID,
    status: "settled",
    textHint: "private presentation copy",
    createdAt: BASE_TIME,
    expiresAt: BASE_TIME + 100000,
    growthSafetyExcluded: false,
    safetyProvenance: sealGrowthSafetyProvenance(safetyFacts()),
    ...overrides
  };
}

function safetyFacts(overrides = {}) {
  return {
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    safeHarborModeActive: false,
    ...overrides
  };
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assertForbiddenFields(value, forbiddenKeys) {
  const forbidden = new Set(forbiddenKeys);
  walk(value, (key) => {
    if (forbidden.has(key)) throw new Error(`forbidden field leaked: ${key}`);
  });
}

function walk(value, visit) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    visit(key, child);
    walk(child, visit);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}
