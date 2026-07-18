import assert from "node:assert/strict";

import {
  HABITAT_MOMENT_CHOICES,
  createHabitatMomentSession,
  resolveHabitatMomentChoice
} from "../../src/engine/habitatMomentEngine.js";
import {
  getCrystalReleaseEligibility,
  observeCrystalWeaving,
  releaseCrystalMemory
} from "../../src/engine/crystalWeavingEngine.js";
import { createCrystalWeavingController } from "../../src/ui/crystalWeavingController.js";

const NOW = 1_800_000_000_000;
const ENVELOPE_KEYS = Object.freeze([
  "companionId",
  "encounter",
  "memoryObject",
  "message",
  "outcomeKind",
  "raphaelEvent",
  "sourceId",
  "statePatch",
  "terminal",
  "traceIntent"
]);
const BASE_STATE = Object.freeze({
  activeCompanionId: "greyshade-cat",
  energy: 7,
  bond: 30,
  trust: 20,
  defense: 20,
  touchFatigue: 1,
  mood: "warm",
  safeHarborMode: false,
  onboarding: {
    completed: true,
    firstLoop: { completedAt: NOW - 20_000, skippedAt: null }
  }
});
const MOMENT_SOURCES = Object.freeze([
  "quiet_approach",
  "fireside_settle",
  "moon_gaze"
]);

const checks = [];

runCheck("habitat 3x3 choice matrix is terminal, qualitative, and non-rewarding", () => {
  assert.deepEqual(
    HABITAT_MOMENT_CHOICES.map((choice) => choice.id),
    ["respond", "wait", "leave"]
  );

  for (const sourceId of MOMENT_SOURCES) {
    const session = createHabitatMomentSession(BASE_STATE, { id: sourceId }, NOW);
    assert.equal(session.sourceId, sourceId);

    for (const choice of HABITAT_MOMENT_CHOICES) {
      const outcome = resolveHabitatMomentChoice(BASE_STATE, session, choice.id, NOW + 1);
      assertEnvelope(outcome);
      assert.equal(outcome.sourceId, sourceId);
      assert.equal(outcome.companionId, BASE_STATE.activeCompanionId);
      assert.equal(outcome.terminal, true);
      assert.deepEqual(outcome.statePatch, {});
      assert.equal(outcome.memoryObject, null);
      assert.equal(outcome.traceIntent, null);
      if (sourceId === "fireside_settle") {
        assert.equal(outcome.encounter?.environmentEvent?.type, "crystal_touch");
      } else if (choice.id === "respond") {
        assert.equal(outcome.encounter?.animationIntent, "soul.acknowledge");
      } else {
        assert.equal(outcome.encounter, null);
      }
      assert.equal(outcome.raphaelEvent, null);
      assert.ok(outcome.message.length > 0);
    }
  }
});

runCheck("habitat current-state safety recheck is terminal with zero gameplay output", () => {
  const session = createHabitatMomentSession(BASE_STATE, { id: "quiet_approach" }, NOW);
  for (const safetyState of habitatProtectiveStates()) {
    const outcome = resolveHabitatMomentChoice(safetyState, session, "respond", NOW + 1);
    assertEnvelope(outcome);
    assert.equal(outcome.outcomeKind, "habitat_moment_safety_pause");
    assert.equal(outcome.terminal, true);
    assert.deepEqual(outcome.statePatch, {});
    assert.equal(outcome.memoryObject, null);
    assert.equal(outcome.traceIntent, null);
    assert.equal(outcome.encounter, null);
    assert.equal(outcome.raphaelEvent, null);
    assert.equal(createHabitatMomentSession(safetyState, { id: "quiet_approach" }, NOW), null);
  }
});

runCheck("habitat lifecycle admits veteran/low-energy source and blocks fresh/fatigued state", () => {
  const veteran = {
    ...BASE_STATE,
    onboarding: {
      completed: true,
      veteranAutoCompleted: true,
      firstLoop: { completedAt: NOW - 30_000, skippedAt: null }
    }
  };
  assert.equal(
    createHabitatMomentSession(veteran, { id: "quiet_approach" }, NOW)?.sourceId,
    "quiet_approach"
  );
  assert.equal(
    createHabitatMomentSession({ ...BASE_STATE, energy: 2 }, { id: "fireside_settle" }, NOW)?.sourceId,
    "fireside_settle"
  );
  assert.equal(
    createHabitatMomentSession({
      ...BASE_STATE,
      onboarding: { completed: false, firstLoop: { completedAt: null, skippedAt: null } }
    }, { id: "quiet_approach" }, NOW),
    null
  );
  assert.equal(
    createHabitatMomentSession({ ...BASE_STATE, touchFatigue: 6 }, { id: "quiet_approach" }, NOW),
    null
  );
});

runCheck("habitat engine is pure for frozen state, moment, and session inputs", () => {
  const state = deepFreeze({ ...BASE_STATE, nested: { stable: true } });
  const momentDef = deepFreeze({ id: "moon_gaze", lines: ["不應被修改"] });
  const beforeState = JSON.stringify(state);
  const beforeMoment = JSON.stringify(momentDef);
  const session = deepFreeze(createHabitatMomentSession(state, momentDef, NOW));
  const beforeSession = JSON.stringify(session);

  resolveHabitatMomentChoice(state, session, "wait", NOW + 1);

  assert.equal(JSON.stringify(state), beforeState);
  assert.equal(JSON.stringify(momentDef), beforeMoment);
  assert.equal(JSON.stringify(session), beforeSession);
});

runCheck("crystal observe is qualitative and never mutates memory or state", () => {
  const memory = createMemory();
  const state = deepFreeze({
    ...BASE_STATE,
    emotionalMemories: [memory],
    habitatTraces: [createLinkedTrace(memory.id)]
  });
  const before = JSON.stringify(state);
  const outcome = observeCrystalWeaving(state, memory.id, NOW);

  assertEnvelope(outcome);
  assert.equal(outcome.outcomeKind, "crystal_observed");
  assert.deepEqual(outcome.statePatch, {});
  assert.equal(outcome.memoryObject, null);
  assert.equal(outcome.traceIntent, null);
  assert.equal(outcome.encounter?.environmentEvent?.type, "crystal_touch");
  assert.equal(outcome.raphaelEvent, null);
  assert.equal(JSON.stringify(state), before);

  const paused = observeCrystalWeaving({ ...state, safeHarborMode: true }, memory.id, NOW);
  assert.equal(paused.outcomeKind, "crystal_weaving_safety_pause");
  assert.equal(paused.encounter, null);
  assert.equal(paused.raphaelEvent, null);
});

runCheck("release keeps the memory record, removes its linked trace, and changes no numeric field", () => {
  const memory = createMemory();
  const unrelatedMemory = createMemory({
    id: "emem_unrelated",
    intensity: 0.71,
    createdAt: NOW - 4_000,
    lastUpdatedAt: NOW - 2_000
  });
  const unrelatedEmotionalTrace = Object.freeze({
    id: `htrace_${unrelatedMemory.id}`,
    memoryId: unrelatedMemory.id,
    type: "em_transformed_calm",
    emotion: "calm",
    intensity: 0.43,
    status: "transformed",
    createdAt: NOW - 4_000,
    lastUpdatedAt: NOW - 2_000,
    expiresAt: NOW + 88_000,
    visualHint: "leave-this-unchanged",
    textHint: "unrelated emotional trace"
  });
  const unrelatedTrace = Object.freeze({
    id: "ambient_unrelated",
    type: "ambient",
    intensity: 0.2,
    createdAt: NOW - 100,
    expiresAt: null
  });
  const state = deepFreeze({
    ...BASE_STATE,
    emotionalMemories: [memory, unrelatedMemory],
    habitatTraces: [
      createLinkedTrace(memory.id),
      unrelatedEmotionalTrace,
      unrelatedTrace
    ]
  });
  const before = JSON.stringify(state);
  const outcome = releaseCrystalMemory(state, memory.id, NOW);

  assertEnvelope(outcome);
  assert.equal(outcome.outcomeKind, "crystal_released");
  assert.deepEqual(Object.keys(outcome.statePatch).sort(), ["emotionalMemories", "habitatTraces"]);
  assert.equal(outcome.statePatch.emotionalMemories.length, state.emotionalMemories.length);
  const releasedMemory = outcome.statePatch.emotionalMemories.find((item) => item.id === memory.id);
  const preservedMemory = outcome.statePatch.emotionalMemories.find(
    (item) => item.id === unrelatedMemory.id
  );
  assert.equal(releasedMemory.id, memory.id);
  assert.equal(releasedMemory.status, "released");
  assert.equal(releasedMemory.isVisibleInHabitat, false);
  assert.deepEqual(preservedMemory, unrelatedMemory);
  assert.equal(
    outcome.statePatch.habitatTraces.some((trace) => trace?.memoryId === memory.id),
    false
  );
  assert.deepEqual(
    outcome.statePatch.habitatTraces,
    [unrelatedEmotionalTrace, unrelatedTrace]
  );
  for (const key of ["energy", "bond", "trust", "defense", "touchFatigue"]) {
    assert.equal(Object.hasOwn(outcome.statePatch, key), false);
  }
  assert.equal(outcome.memoryObject, null);
  assert.equal(outcome.traceIntent, null);
  assert.equal(outcome.raphaelEvent, null);
  assert.equal(JSON.stringify(state), before);
});

runCheck("release requires one visible transformed memory", () => {
  for (const memory of [
    createMemory({ status: "fresh" }),
    createMemory({ status: "settled" }),
    createMemory({ status: "transformed", isVisibleInHabitat: false }),
    createMemory({ status: "archived", isVisibleInHabitat: false })
  ]) {
    const state = {
      ...BASE_STATE,
      emotionalMemories: [memory],
      habitatTraces: [createLinkedTrace(memory.id)]
    };
    const eligibility = getCrystalReleaseEligibility(state, memory);
    const outcome = releaseCrystalMemory(state, memory.id, NOW);
    assert.equal(eligibility.allowed, false);
    assert.equal(outcome.outcomeKind, "crystal_release_blocked");
    assert.deepEqual(outcome.statePatch, {});
    assert.equal(outcome.raphaelEvent, null);
  }
});

runCheck("release blocks protective state and protected memory source or emotion", () => {
  const memory = createMemory();
  for (const state of crystalProtectiveStates()) {
    const eligibility = getCrystalReleaseEligibility(
      { ...state, emotionalMemories: [memory] },
      memory
    );
    const outcome = releaseCrystalMemory(
      { ...state, emotionalMemories: [memory], habitatTraces: [createLinkedTrace(memory.id)] },
      memory.id,
      NOW
    );
    assert.deepEqual(eligibility, { allowed: false, reason: "protective_state" });
    assert.equal(outcome.outcomeKind, "crystal_release_blocked");
    assert.deepEqual(outcome.statePatch, {});
    assert.equal(outcome.raphaelEvent, null);
  }

  for (const token of ["bond", "first_awakening", "boundary", "standoff"]) {
    for (const field of ["source", "emotion"]) {
      const protectedMemory = createMemory({ [field]: token });
      const state = {
        ...BASE_STATE,
        emotionalMemories: [protectedMemory],
        habitatTraces: [createLinkedTrace(protectedMemory.id)]
      };
      const eligibility = getCrystalReleaseEligibility(state, protectedMemory);
      const outcome = releaseCrystalMemory(state, protectedMemory.id, NOW);
      assert.deepEqual(eligibility, { allowed: false, reason: "protected_memory" });
      assert.equal(outcome.outcomeKind, "crystal_release_blocked");
      assert.deepEqual(outcome.statePatch, {});
      assert.equal(outcome.raphaelEvent, null);
    }
  }
});

runCheck("release is idempotent after the first atomic patch", () => {
  const memory = createMemory();
  const state = {
    ...BASE_STATE,
    emotionalMemories: [memory],
    habitatTraces: [createLinkedTrace(memory.id)]
  };
  const first = releaseCrystalMemory(state, memory.id, NOW);
  const nextState = deepFreeze({ ...state, ...first.statePatch });
  const beforeSecond = JSON.stringify(nextState);
  const second = releaseCrystalMemory(nextState, memory.id, NOW + 1);

  assert.equal(second.outcomeKind, "crystal_release_unchanged");
  assert.deepEqual(second.statePatch, {});
  assert.equal(second.raphaelEvent, null);
  assert.equal(JSON.stringify(nextState), beforeSecond);
});

await runAsyncCheck("crystal controller rolls back the whole patch when critical save fails", async () => {
  const memory = createMemory();
  const initialState = {
    ...BASE_STATE,
    emotionalMemories: [memory],
    habitatTraces: [createLinkedTrace(memory.id)]
  };
  const store = createMutableStore(initialState);
  let presentationCount = 0;
  const controller = createCrystalWeavingController({
    store,
    saveCandidateState: async () => ({ ok: false, error: new Error("synthetic save failure") }),
    onOutcome: () => {
      presentationCount += 1;
    }
  });

  const outcome = await controller.release(memory.id, NOW);
  assertEnvelope(outcome);
  assert.equal(outcome.outcomeKind, "crystal_release_save_failed");
  assert.deepEqual(store.getState(), initialState);
  assert.equal(store.getSetCount(), 0);
  assert.equal(presentationCount, 0);
  assert.equal(controller.isActionInFlight(), false);
});

await runAsyncCheck("crystal controller admits one save and rejects concurrent duplicate release", async () => {
  const memory = createMemory();
  const store = createMutableStore({
    ...BASE_STATE,
    emotionalMemories: [memory],
    habitatTraces: [createLinkedTrace(memory.id)]
  });
  let completeSave;
  let saveCount = 0;
  let savedCandidate = null;
  let presentationCount = 0;
  const controller = createCrystalWeavingController({
    store,
    saveCandidateState: (candidateState) => {
      saveCount += 1;
      savedCandidate = candidateState;
      return new Promise((resolve) => {
        completeSave = resolve;
      });
    },
    onOutcome: () => {
      presentationCount += 1;
    }
  });

  const firstRelease = controller.release(memory.id, NOW);
  const duplicate = await controller.release(memory.id, NOW + 1);
  assertEnvelope(duplicate);
  assert.equal(duplicate.outcomeKind, "crystal_release_busy");
  assert.equal(saveCount, 1);
  assert.equal(savedCandidate.emotionalMemories[0].status, "released");
  assert.equal(store.getState().emotionalMemories[0].status, "transformed");
  assert.equal(store.getSetCount(), 0);
  assert.equal(
    store.getState().habitatTraces.some((trace) => trace?.memoryId === memory.id),
    true
  );

  completeSave({ ok: true });
  const completed = await firstRelease;
  assertEnvelope(completed);
  assert.equal(completed.outcomeKind, "crystal_released");
  assert.equal(store.getSetCount(), 1);
  assert.equal(presentationCount, 1);
  assert.equal(store.getState().emotionalMemories[0].status, "released");
  assert.equal(
    store.getState().habitatTraces.some((trace) => trace?.memoryId === memory.id),
    false
  );
  assert.equal(controller.isActionInFlight(), false);
});

printResults();

function createMemory(overrides = {}) {
  return Object.freeze({
    id: "emem_weaving_target",
    theme: "安靜",
    label: "湖畔回聲",
    emotion: "calm",
    intensity: 0.4,
    symbol: "faint_spark",
    place: "shore_side",
    status: "transformed",
    source: "soul_talk",
    excerpt: "一段共同經歷",
    createdAt: NOW - 10_000,
    lastUpdatedAt: NOW - 5_000,
    isVisibleInHabitat: true,
    ...overrides
  });
}

function createLinkedTrace(memoryId) {
  return Object.freeze({
    id: `htrace_${memoryId}`,
    memoryId,
    type: "em_transformed_calm",
    emotion: "calm",
    intensity: 0.1,
    status: "transformed",
    createdAt: NOW - 10_000,
    lastUpdatedAt: NOW - 5_000,
    expiresAt: NOW + 10_000
  });
}

function crystalProtectiveStates() {
  return [
    { ...BASE_STATE, safeHarborMode: true },
    { ...BASE_STATE, mood: "defensive" },
    { ...BASE_STATE, mood: "distant" },
    { ...BASE_STATE, defense: 70 }
  ];
}

function habitatProtectiveStates() {
  return [
    ...crystalProtectiveStates(),
    { ...BASE_STATE, touchFatigue: 6 }
  ];
}

function createMutableStore(initialState) {
  let state = initialState;
  let setCount = 0;
  return {
    getState: () => state,
    getSetCount: () => setCount,
    setState: (patch) => {
      setCount += 1;
      state = { ...state, ...patch };
      return state;
    },
    replaceState: (nextState) => {
      state = nextState;
      return state;
    }
  };
}

function assertEnvelope(outcome) {
  assert.deepEqual(Object.keys(outcome).sort(), ENVELOPE_KEYS);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function runCheck(id, test) {
  try {
    test();
    checks.push({ id, ok: true });
  } catch (error) {
    checks.push({ id, ok: false, error: error?.message || String(error) });
  }
}

async function runAsyncCheck(id, test) {
  try {
    await test();
    checks.push({ id, ok: true });
  } catch (error) {
    checks.push({ id, ok: false, error: error?.message || String(error) });
  }
}

function printResults() {
  const failed = checks.filter((check) => !check.ok).length;
  console.log(JSON.stringify({ total: checks.length, failed, checks }, null, 2));
  if (failed > 0) process.exitCode = 1;
}
