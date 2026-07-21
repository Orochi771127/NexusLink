import {
  createDefaultState,
  getState,
  normalizeState,
  replaceState,
  updateState
} from "../../src/state/store.js";
import {
  createDefaultGrowthState,
  createDefaultRelationshipState
} from "../../src/state/companionStateSchema.js";
import {
  createCompanionGrowthController,
  createGrowthSafetyFacts
} from "../../src/ui/companionGrowthController.js";

const controller = createCompanionGrowthController();
const cases = [];

await runCase("completed exploration writes once and survives normalization", () => {
  const state = freshState();
  const beforeStage = state.companionStates.byId["greyshade-cat"].growth.stage;
  const first = write(state, exploration("greyshade-cat", "starwood_trail", "anchor_read", nowAfter(state, 1)));
  assertEqual(first.accepted, true, "first accepted");
  assertEqual(first.rootAccepted, true, "root accepted");
  const growth = state.companionStates.byId["greyshade-cat"].growth;
  assertEqual(growth.evidence.length, 1, "one evidence detail");
  assertEqual(growth.stage, beforeStage, "G3 never advances stage");
  assertEqual(growth.offeredStage, null, "G3 never creates offer");

  const replay = write(state, exploration("greyshade-cat", "starwood_trail", "direct", nowAfter(state, 2)));
  assertEqual(replay.accepted, false, "same root replay rejected");
  assertEqual(replay.reason, "duplicate_root", "same root reason");
  assertEqual(growth.evidence.length, 1, "replay leaves one detail");

  const roundTrip = normalizeState(structuredClone(state));
  assertDeepEqual(
    roundTrip.companionStates.byId["greyshade-cat"].growth,
    growth,
    "canonical round trip"
  );
});

await runCase("canonical store transaction preserves the Growth write", () => {
  const state = freshState();
  replaceState(state);
  const createdAt = nowAfter(getState(), 1);
  updateState((draft) => {
    const result = write(
      draft,
      exploration("greyshade-cat", "starwood_trail", "direct", createdAt)
    );
    assertEqual(result.accepted, true, "transaction accepted");
  });
  const growth = getState().companionStates.byId["greyshade-cat"].growth;
  assertEqual(growth.evidence.length, 1, "transaction evidence survives");
  assertEqual(growth.coverage.rootsBySourceType.exploration.length, 1, "transaction coverage survives");
});

await runCase("all standoff settlements share one root and equal readiness weight", () => {
  const shapes = [];
  for (const outcome of ["stabilized", "recovered", "retreated", "overwhelmed_but_safe"]) {
    const state = freshState();
    const result = write(state, standoff("greyshade-cat", "rift_observatory", outcome, nowAfter(state, 1)));
    assertEqual(result.accepted, true, `${outcome} accepted`);
    const growth = state.companionStates.byId["greyshade-cat"].growth;
    shapes.push({
      roots: growth.coverage.rootsBySourceType.standoff.length,
      consumed: growth.consumedRootKeys.length,
      detail: growth.evidence.length
    });
  }
  assertEqual(new Set(shapes.map(JSON.stringify)).size, 1, "outcomes are equal weight");

  const state = freshState();
  write(state, standoff("greyshade-cat", "rift_observatory", "retreated", nowAfter(state, 1)));
  const alternate = write(
    state,
    standoff("greyshade-cat", "rift_observatory", "stabilized", nowAfter(state, 2))
  );
  assertEqual(alternate.reason, "duplicate_root", "alternate outcome deduped");
});

await runCase("safe harbor and incomplete safety provenance write nothing", () => {
  const state = freshState();
  const before = structuredClone(state.companionStates);
  state.safeHarborMode = true;
  const excluded = write(
    state,
    exploration("greyshade-cat", "starwood_trail", "direct", nowAfter(state, 1), state)
  );
  assertEqual(excluded.accepted, false, "safe harbor rejected");
  assertEqual(excluded.reason, "safety_excluded", "safe harbor reason");
  assertDeepEqual(state.companionStates, before, "safe harbor no growth mutation");

  state.safeHarborMode = false;
  const missing = exploration("greyshade-cat", "misttide_shore", "direct", nowAfter(state, 2));
  missing.safetyProvenance = { ...missing.safetyProvenance };
  delete missing.safetyProvenance.actionId;
  const incomplete = write(state, missing);
  assertEqual(incomplete.reason, "safety_excluded", "missing provenance fails closed");
  assertDeepEqual(state.companionStates, before, "incomplete provenance no mutation");
});

await runCase("active companion owner guard keeps A and B isolated", () => {
  const state = freshState();
  state.unlockedCompanionIds = ["greyshade-cat", "blazetail-kit"];
  state.companionStates.byId["blazetail-kit"] = {
    relationship: createDefaultRelationshipState(),
    growth: createDefaultGrowthState({ companionId: "blazetail-kit" })
  };
  const mismatch = write(
    state,
    exploration("blazetail-kit", "starwood_trail", "direct", nowAfter(state, 1))
  );
  assertEqual(mismatch.reason, "active_companion_mismatch", "inactive owner rejected");
  assertEqual(state.companionStates.byId["blazetail-kit"].growth.evidence.length, 0, "B unchanged");

  state.activeCompanionId = "blazetail-kit";
  const accepted = write(
    state,
    exploration("blazetail-kit", "starwood_trail", "direct", nowAfter(state, 2))
  );
  assertEqual(accepted.accepted, true, "active B accepted");
  assertEqual(state.companionStates.byId["greyshade-cat"].growth.evidence.length, 0, "A unchanged");
  assertEqual(state.companionStates.byId["blazetail-kit"].growth.evidence.length, 1, "B owns evidence");
});

await runCase("presentation exposes qualitative enums but no raw ids, counts or timestamps", () => {
  const state = freshState();
  write(state, exploration("greyshade-cat", "starwood_trail", "anchor_read", nowAfter(state, 1)));
  write(state, standoff("greyshade-cat", "rift_observatory", "retreated", nowAfter(state, 2)));
  const model = controller.getViewModel(state, sessionSnapshot());
  assertEqual(model.formalStage.id, "initial_awakened", "formal stage");
  assertEqual(model.relationshipSignal.readinessId, "forming", "forming signal");
  assertEqual(model.livedEvidence.rows.length, 2, "two visible rows");
  const serialized = JSON.stringify(model);
  for (const forbidden of ["starwood_trail", "rift_observatory", "anchor_read", "createdAt", "familyCount", "requiredFamilyCount"]) {
    assertEqual(serialized.includes(forbidden), false, `no ${forbidden}`);
  }
});

await runCase("presentation folds repeated source and tendency rows into one qualitative trace", () => {
  const state = freshState();
  write(state, exploration("greyshade-cat", "starwood_trail", "anchor_read", nowAfter(state, 1)));
  write(state, exploration("greyshade-cat", "misttide_shore", "direct", nowAfter(state, 2)));
  write(state, standoff("greyshade-cat", "rift_observatory", "retreated", nowAfter(state, 3)));
  const model = controller.getViewModel(state, sessionSnapshot());
  assertEqual(model.livedEvidence.rows.length, 2, "duplicate exploration presentation folded");
  assertEqual(
    model.livedEvidence.rows.filter((row) => row.sourceType === "exploration").length,
    1,
    "one exploration summary"
  );
});

await runCase("readiness signal ignores defense and does not decay after thirty days", () => {
  const state = readyState();
  const lowDefense = structuredClone(state);
  lowDefense.defense = 0;
  const highDefense = structuredClone(state);
  highDefense.defense = 100;
  const lowModel = controller.getViewModel(lowDefense, sessionSnapshot());
  const highModel = controller.getViewModel(highDefense, sessionSnapshot());
  assertDeepEqual(highModel.relationshipSignal, lowModel.relationshipSignal, "defense invariant");
  assertEqual(lowModel.relationshipSignal.readinessId, "possible", "readiness possible");

  const afterThirtyDays = structuredClone(state);
  afterThirtyDays.lastSeenAt += 30 * 86400000;
  const laterModel = controller.getViewModel(afterThirtyDays, sessionSnapshot());
  assertDeepEqual(laterModel.relationshipSignal, lowModel.relationshipSignal, "time invariant signal");
  assertDeepEqual(laterModel.livedEvidence, lowModel.livedEvidence, "time invariant evidence");
});

await runCase("typed fatigue and boundary only change qualitative willingness after readiness", () => {
  const resting = readyState();
  resting.touchFatigue = 8;
  const restingModel = controller.getViewModel(resting, sessionSnapshot());
  assertEqual(restingModel.relationshipSignal.copyKey, "growth.persisted.signal.possible.resting", "resting signal");

  const repairing = readyState();
  repairing.lastTouchReaction = "reject";
  const repairingModel = controller.getViewModel(repairing, sessionSnapshot());
  assertEqual(repairingModel.relationshipSignal.copyKey, "growth.persisted.signal.possible.repairing", "repair signal");

  const defensive = readyState();
  defensive.mood = "defensive";
  assertEqual(
    controller.getViewModel(defensive, sessionSnapshot()).relationshipSignal.copyKey,
    "growth.persisted.signal.possible.repairing",
    "defensive mood holds willingness"
  );

  const angryBoundary = readyState();
  angryBoundary.lastTouchReaction = "spam_angry";
  assertEqual(
    controller.getViewModel(angryBoundary, sessionSnapshot()).relationshipSignal.copyKey,
    "growth.persisted.signal.possible.repairing",
    "spam boundary holds willingness"
  );

  const rewritten = readyState();
  const rewrittenMoment = sessionSnapshot();
  rewrittenMoment.lastResult = { outcomeId: "modify" };
  assertEqual(
    controller.getViewModel(rewritten, rewrittenMoment).relationshipSignal.willingnessId,
    "rewrite",
    "companion rewrite remains distinct from acceptance"
  );

  const declined = readyState();
  const declinedMoment = sessionSnapshot();
  declinedMoment.lastResult = { outcomeId: "decline" };
  assertEqual(
    controller.getViewModel(declined, declinedMoment).relationshipSignal.copyKey,
    "growth.persisted.signal.possible.notNow",
    "companion decline keeps possibility without proceeding"
  );
});

await runCase("safety view model is terminal and contains no Growth presentation", () => {
  const state = readyState();
  state.safeHarborMode = true;
  const model = controller.getViewModel(state, sessionSnapshot());
  assertDeepEqual(Object.keys(model).sort(), ["companionId", "safetyPaused"], "terminal keys");
  assertEqual(model.safetyPaused, true, "safety paused");
});

const failures = cases.filter((entry) => !entry.ok);
console.log(`Companion Growth G3 runtime cases: ${cases.length - failures.length}/${cases.length} passed`);
for (const entry of cases) {
  console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.error ? ` — ${entry.error}` : ""}`);
}
if (failures.length) process.exitCode = 1;

function freshState() {
  const state = createDefaultState();
  state.chapterProgress.current = 2;
  return state;
}

function readyState() {
  const state = freshState();
  const createdAt = nowAfter(state, 1);
  for (const input of [
    {
      companionId: "greyshade-cat",
      sourceType: "care",
      tendency: "attunement",
      context: { chapterNo: 1, originEventId: "qa_care", practiceId: "listen" },
      createdAt
    },
    {
      ...exploration("greyshade-cat", "starwood_trail", "anchor_read", createdAt + 1),
      safetyProvenance: createGrowthSafetyFacts(state)
    },
    {
      companionId: "greyshade-cat",
      sourceType: "reflection",
      tendency: "attunement",
      context: { traceId: "qa_trace", resolutionId: "reframed" },
      createdAt: createdAt + 2
    },
    {
      companionId: "greyshade-cat",
      sourceType: "recovery",
      tendency: "steadfastness",
      context: { originKey: "care:1:qa_repair" },
      createdAt: createdAt + 3
    }
  ]) {
    write(state, {
      completed: true,
      completionStatus: "completed",
      safetyProvenance: createGrowthSafetyFacts(state),
      ...input
    });
  }
  return state;
}

function exploration(companionId, nodeId, choiceId, createdAt, state = {}) {
  return {
    companionId,
    sourceType: "exploration",
    tendency: "pathfinding",
    context: { chapterNo: 1, nodeId, choiceId },
    createdAt,
    completed: true,
    completionStatus: "completed",
    safetyProvenance: createGrowthSafetyFacts(state)
  };
}

function standoff(companionId, nodeId, outcomeFamily, createdAt, state = {}) {
  return {
    companionId,
    sourceType: "standoff",
    tendency: outcomeFamily === "recovered" ? "steadfastness" : "boundary_respect",
    context: { chapterNo: 1, nodeId, outcomeFamily },
    createdAt,
    completed: true,
    completionStatus: "completed",
    safetyProvenance: createGrowthSafetyFacts(state)
  };
}

function sessionSnapshot() {
  return {
    phaseId: "steady",
    phaseLabelKey: "growth.session.phase.steady.label",
    phaseCopyKey: "growth.session.phase.steady.copy",
    safetyPaused: false,
    observedTendencyIds: [],
    lastResult: null
  };
}

function write(state, input) {
  return controller.writeIntoDraft(state, input);
}

function nowAfter(state, offset) {
  return state.companionStates.byId[state.activeCompanionId].growth.coverage.windowOpenedAt + offset;
}

async function runCase(name, callback) {
  try {
    await callback();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error: error?.message || String(error) });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function assertDeepEqual(actual, expected, label) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${label}: expected ${right}, got ${left}`);
}
