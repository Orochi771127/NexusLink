import {
  createCompletedGrowthEvent,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";
import { projectCodexLivedPaths } from "../../src/engine/codexLivedPaths.js";
import { createDefaultGrowthState } from "../../src/state/companionStateSchema.js";

const COMPANION_ID = "greyshade-cat";
const OTHER_ID = "auriowl";
const BASE_TIME = 1785542400000;
const cases = [];

await runCase("locked or missing companion records return the fixed empty projection", () => {
  const locked = makeState();
  seedAllEvidence(locked);
  locked.unlockedCompanionIds = [];
  assertDeepEqual(projectCodexLivedPaths({ state: locked, companionId: COMPANION_ID }), {
    stageId: null,
    pathEchoes: [],
    signalId: "lived_path_unavailable"
  }, "locked projection");

  const missing = makeState();
  delete missing.companionStates.byId[COMPANION_ID];
  assertDeepEqual(projectCodexLivedPaths({ state: missing, companionId: COMPANION_ID }), {
    stageId: null,
    pathEchoes: [],
    signalId: "lived_path_unavailable"
  }, "missing record projection");
});

await runCase("canonical evidence projects qualitative lived paths only", () => {
  const state = makeState();
  seedAllEvidence(state);
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(result.stageId, "initial_awakened", "formal stage");
  assertEqual(result.signalId, "lived_path_echoing", "qualitative signal");
  assertDeepEqual(result.pathEchoes.map((echo) => echo.sourceType), [
    "care", "exploration", "standoff", "chapter", "reflection"
  ], "source order");
  assertDeepEqual(result.pathEchoes[0], {
    sourceType: "care",
    tendencyId: "attunement",
    labelKey: "growth.livedPaths.care.label",
    copyKey: "growth.livedPaths.care.attunement"
  }, "echo shape");
  assertForbiddenFields(result, [
    "percent", "percentage", "count", "missing", "threshold", "reward",
    "readiness", "willingness", "unlock", "score", "excerpt", "textHint"
  ]);
  assertEqual(Object.isFrozen(result), true, "projection frozen");
  assertEqual(Object.isFrozen(result.pathEchoes), true, "echo list frozen");
});

await runCase("global chapter marks and clear ids never establish companion ownership", () => {
  const state = makeState();
  state.activityProgress.orbit.clearedStageIds = ["orbit_stage_01"];
  state.activityProgress.standoff.clearedScenarioIds = ["rift_01"];
  state.resonance.chapterMarks[1] = { enteredAt: BASE_TIME };
  state.habitatTraces.push(safeTrace());
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(result.pathEchoes.length, 0, "no evidence from global progress");
  assertEqual(result.signalId, "lived_path_quiet", "quiet signal");
});

await runCase("Orbit and standoff evidence require their canonical clear ids", () => {
  const state = makeState();
  writeEvent(state, explorationEvent());
  writeEvent(state, standoffEvent());
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    0, "uncorroborated clears hidden");

  state.activityProgress.orbit.clearedStageIds = ["orbit_stage_01"];
  let result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertDeepEqual(result.pathEchoes.map((echo) => echo.sourceType), ["exploration"],
    "Orbit clear corroborated");

  state.activityProgress.standoff.clearedScenarioIds = ["rift_01"];
  result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertDeepEqual(result.pathEchoes.map((echo) => echo.sourceType), ["exploration", "standoff"],
    "standoff clear corroborated");
});

await runCase("ordinary exploration evidence requires a canonical visit", () => {
  const state = makeState();
  writeEvent(state, {
    sourceType: "exploration",
    tendency: "pathfinding",
    context: { chapterNo: 1, nodeId: "moonlake_shore", choiceId: "listen" },
    createdAt: BASE_TIME + 2
  });
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    0, "unvisited node hidden");
  state.explorationProgress.visitCounts.moonlake_shore = 1;
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    1, "visited node visible");
});

await runCase("chapter evidence is visible only in reached canonical chapter context", () => {
  const state = makeState();
  writeEvent(state, chapterEvent({ chapterNo: 2 }));
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    0, "unreached chapter hidden");
  state.resonance.chapterMarks[2] = { enteredAt: BASE_TIME + 1 };
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    1, "chapter mark corroborates owned evidence");
});

await runCase("reflection evidence requires its canonical same-owner safe source", () => {
  const state = makeState();
  writeEvent(state, reflectionEvent());
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    1, "verified reflection visible");

  const unowned = clone(state);
  delete unowned.habitatTraces[0].companionId;
  assertEqual(projectCodexLivedPaths({ state: unowned, companionId: COMPANION_ID }).pathEchoes.length,
    0, "unowned source hidden");

  const released = clone(state);
  released.habitatTraces[0].status = "released";
  assertEqual(projectCodexLivedPaths({ state: released, companionId: COMPANION_ID }).pathEchoes.length,
    0, "released trace hidden");

  const tampered = clone(state);
  tampered.habitatTraces[0].safetyProvenance.isHighRisk = true;
  assertEqual(projectCodexLivedPaths({ state: tampered, companionId: COMPANION_ID }).pathEchoes.length,
    0, "tampered source hidden");
});

await runCase("memory-backed reflection is supported without exposing memory text", () => {
  const state = makeState();
  writeEvent(state, {
    sourceType: "reflection",
    tendency: "boundary_respect",
    context: { memoryId: "emem_shared", resolutionId: "accepted_rewrite" },
    createdAt: BASE_TIME + 5,
    memoryId: "emem_shared",
    consentKind: "respected_rewrite"
  });
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertDeepEqual(result.pathEchoes, [{
    sourceType: "reflection",
    tendencyId: "boundary_respect",
    labelKey: "growth.livedPaths.reflection.label",
    copyKey: "growth.livedPaths.reflection.boundary_respect"
  }], "memory reflection projection");
  assertEqual(JSON.stringify(result).includes("private player wording"), false, "memory excerpt absent");
});

await runCase("unsafe, legacy-attributed, wrong-owner and incoherent details are ignored", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  const baseDetail = state.companionStates.byId[COMPANION_ID].growth.evidence[0];
  for (const patch of [
    { growthSafetyExcluded: true },
    { legacyAttributed: true },
    { companionId: OTHER_ID },
    { key: "care:1:tampered" },
    { rootContextKey: "care:1:other_root" },
    { createdAt: 0 }
  ]) {
    const candidate = clone(state);
    candidate.companionStates.byId[COMPANION_ID].growth.evidence = [
      { ...baseDetail, ...patch }
    ];
    const result = projectCodexLivedPaths({ state: candidate, companionId: COMPANION_ID });
    assertEqual(result.pathEchoes.length, 0, `ignored patch ${JSON.stringify(patch)}`);
  }
});

await runCase("details not referenced by consumedRootKeys are ignored", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  state.companionStates.byId[COMPANION_ID].growth.consumedRootKeys = [];
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(result.pathEchoes.length, 0, "unconsumed detail hidden");
});

await runCase("current-window details require the matching coverage family", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  const growth = state.companionStates.byId[COMPANION_ID].growth;
  const root = growth.evidence[0].rootContextKey;

  growth.coverage.rootsBySourceType.care = [];
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    0, "missing current coverage hidden");

  growth.coverage.rootsBySourceType.exploration = [root];
  assertEqual(projectCodexLivedPaths({ state, companionId: COMPANION_ID }).pathEchoes.length,
    0, "wrong-family coverage hidden");
});

await runCase("prior-window lived evidence survives a legitimate stage window reset", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  const growth = state.companionStates.byId[COMPANION_ID].growth;
  growth.stage = "resonant_mature";
  growth.coverage.targetStage = "final_awakened";
  growth.coverage.windowOpenedAt = BASE_TIME + 100;
  growth.coverage.rootsBySourceType = Object.fromEntries([
    "care", "exploration", "reflection", "standoff", "chapter", "boundary", "recovery"
  ].map((sourceType) => [sourceType, []]));

  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(result.stageId, "resonant_mature", "advanced stage");
  assertEqual(result.pathEchoes.length, 1, "prior lived path retained");
  assertEqual(result.pathEchoes[0].sourceType, "care", "prior source retained");
});

await runCase("repeated evidence of one source and tendency projects one echo", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  writeEvent(state, {
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "care_second", practiceId: "listen" },
    createdAt: BASE_TIME + 2
  });
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(state.companionStates.byId[COMPANION_ID].growth.evidence.length, 2,
    "two canonical details exist");
  assertEqual(result.pathEchoes.length, 1, "one qualitative echo");
});

await runCase("distinct tendencies remain visible without weights or best-route ranking", () => {
  const state = makeState();
  writeEvent(state, careEvent());
  writeEvent(state, {
    sourceType: "care",
    tendency: "boundary_respect",
    context: { chapterNo: 1, originEventId: "care_boundary", practiceId: "leave_space" },
    createdAt: BASE_TIME + 2
  });
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertDeepEqual(result.pathEchoes.map((echo) => echo.tendencyId),
    ["attunement", "boundary_respect"], "two lived tendencies");
  assertForbiddenFields(result, ["weight", "rank", "best", "remaining"]);
});

await runCase("formal stage changes only stageId and never emits readiness fields", () => {
  const state = makeState();
  seedAllEvidence(state);
  state.companionStates.byId[COMPANION_ID].growth.stage = "resonant_mature";
  const result = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  assertEqual(result.stageId, "resonant_mature", "formal stage projected");
  assertEqual(result.signalId, "lived_path_echoing", "non-readiness signal");
  assertForbiddenFields(result, ["ready", "readiness", "targetStage", "familyCount"]);
});

await runCase("projection is deterministic, read-only and rebuildable from state", () => {
  const state = makeState();
  seedAllEvidence(state);
  const before = JSON.stringify(state);
  const first = projectCodexLivedPaths({ state, companionId: COMPANION_ID });
  const second = projectCodexLivedPaths({ state: clone(state), companionId: COMPANION_ID });
  assertDeepEqual(second, first, "rebuilt projection");
  assertEqual(JSON.stringify(state), before, "state remains untouched");
});

await runCase("unknown companion and malformed canonical bundle fail closed", () => {
  assertEqual(projectCodexLivedPaths({ state: makeState(), companionId: "unknown" }).stageId,
    null, "unknown companion");
  const malformed = makeState();
  malformed.companionStates.version = 99;
  assertEqual(projectCodexLivedPaths({ state: malformed, companionId: COMPANION_ID }).stageId,
    null, "unknown schema version");
  const malformedStage = makeState();
  malformedStage.companionStates.byId[COMPANION_ID].growth.stage = "ready_to_evolve";
  assertEqual(projectCodexLivedPaths({ state: malformedStage, companionId: COMPANION_ID }).stageId,
    null, "unknown stage");
});

const failures = cases.filter((entry) => !entry.ok);
console.log(`Codex lived paths cases: ${cases.length - failures.length}/${cases.length} passed`);
for (const entry of cases) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.error ? ` — ${entry.error}` : ""}`);
}
if (failures.length > 0) process.exitCode = 1;

function makeState() {
  return {
    activeCompanionId: COMPANION_ID,
    unlockedCompanionIds: [COMPANION_ID],
    safeHarborMode: false,
    emotionalMemories: [safeMemory()],
    habitatTraces: [safeTrace()],
    chapterProgress: { current: 1, completed: [] },
    resonance: { chapterMarks: {}, companions: {} },
    explorationProgress: { visitCounts: {} },
    activityProgress: {
      version: 1,
      orbit: { clearedStageIds: [] },
      standoff: { clearedScenarioIds: [] },
      expedition: { clearedRouteIds: [] }
    },
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

function seedAllEvidence(state) {
  state.activityProgress.orbit.clearedStageIds = ["orbit_stage_01"];
  state.activityProgress.standoff.clearedScenarioIds = ["rift_01"];
  state.resonance.chapterMarks[1] = { enteredAt: BASE_TIME };
  for (const event of [
    careEvent(),
    explorationEvent(),
    standoffEvent(),
    chapterEvent(),
    reflectionEvent()
  ]) writeEvent(state, event);
}

function writeEvent(state, specification) {
  const created = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    completed: true,
    completionStatus: "completed",
    safetyProvenance: safetyFacts(),
    ...specification
  });
  if (!created.ok) throw new Error(`event creation failed: ${created.reason}`);
  const current = state.companionStates.byId[COMPANION_ID].growth;
  const written = writeCompanionGrowthEvidence({
    growth: current,
    companionId: COMPANION_ID,
    event: created.event
  });
  if (!written.result.accepted) throw new Error(`growth write failed: ${written.result.reason}`);
  state.companionStates.byId[COMPANION_ID].growth = written.growth;
}

function careEvent() {
  return {
    sourceType: "care",
    tendency: "attunement",
    context: { chapterNo: 1, originEventId: "care_first", practiceId: "listen" },
    createdAt: BASE_TIME + 1
  };
}

function explorationEvent() {
  return {
    sourceType: "exploration",
    tendency: "pathfinding",
    context: { chapterNo: 1, nodeId: "orbit_stage_01", choiceId: "orbit_clear" },
    createdAt: BASE_TIME + 2
  };
}

function standoffEvent() {
  return {
    sourceType: "standoff",
    tendency: "steadfastness",
    context: { chapterNo: 1, nodeId: "rift_01", outcomeFamily: "retreated" },
    createdAt: BASE_TIME + 3
  };
}

function chapterEvent(overrides = {}) {
  const chapterNo = overrides.chapterNo || 1;
  return {
    sourceType: "chapter",
    tendency: "boundary_respect",
    context: { chapterNo, eventId: `lake_vow_${chapterNo}`, branchFamily: "listen" },
    createdAt: BASE_TIME + 4,
    ...overrides
  };
}

function reflectionEvent() {
  return {
    sourceType: "reflection",
    tendency: "attunement",
    context: { traceId: "htrace_shared", resolutionId: "shared_understanding" },
    traceId: "htrace_shared",
    createdAt: BASE_TIME + 5
  };
}

function safeMemory(overrides = {}) {
  return {
    id: "emem_shared",
    companionId: COMPANION_ID,
    status: "settled",
    excerpt: "private player wording",
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
    textHint: "private trace wording",
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
