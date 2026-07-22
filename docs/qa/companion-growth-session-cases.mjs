import assert from "node:assert/strict";
import {
  HEART_PHASE_PRACTICES,
  HEART_PHASE_TENDENCIES,
  HEART_PHASE_COMPLETION,
  createCompanionGrowthSession,
  deriveHeartPhaseSnapshot,
  evaluateHeartPhasePractice,
  resolveHeartPhaseRewrite
} from "../../src/engine/companionGrowthSessionEngine.js";

const cases = [];
const BASE_STATE = Object.freeze({
  activeCompanionId: "greyshade-cat",
  energy: 6,
  touchFatigue: 1,
  mood: "calm",
  lastTouchReaction: "",
  safeHarborMode: false
});

runCase("four practices map to the four qualitative tendencies", () => {
  assert.deepEqual(
    HEART_PHASE_PRACTICES.map((practice) => practice.id),
    HEART_PHASE_TENDENCIES
  );
  assert.equal(new Set(HEART_PHASE_PRACTICES.map((practice) => practice.tendencyId)).size, 4);
});

runCase("steady practice is accepted without mutating state or session input", () => {
  const state = deepFreeze({ ...BASE_STATE });
  const session = deepFreeze(createCompanionGrowthSession("greyshade-cat"));
  const stateBefore = JSON.stringify(state);
  const sessionBefore = JSON.stringify(session);
  const evaluation = evaluateHeartPhasePractice(state, session, "attunement");

  assert.equal(evaluation.ok, true);
  assert.equal(evaluation.result.outcomeId, "accept");
  assert.equal(evaluation.result.completionStatus, HEART_PHASE_COMPLETION.COMPLETED);
  assert.equal(evaluation.result.observedTendencyId, "attunement");
  assert.deepEqual(evaluation.session.observedTendencyIds, ["attunement"]);
  assert.equal(JSON.stringify(state), stateBefore);
  assert.equal(JSON.stringify(session), sessionBefore);
});

runCase("guarded companion rewrites closeness into boundary respect", () => {
  const state = { ...BASE_STATE, mood: "distant" };
  const evaluation = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "attunement"
  );

  assert.equal(evaluation.result.outcomeId, "modify");
  assert.equal(evaluation.result.completionStatus, HEART_PHASE_COMPLETION.AWAITING_REWRITE);
  assert.equal(evaluation.result.observedTendencyId, "boundary_respect");
  assert.deepEqual(evaluation.session.observedTendencyIds, ["boundary_respect"]);
});

runCase("guarded companion may decline pathfinding with zero observation", () => {
  const state = { ...BASE_STATE, lastTouchReaction: "reject" };
  const evaluation = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "pathfinding"
  );

  assert.equal(evaluation.ok, true);
  assert.equal(evaluation.result.outcomeId, "decline");
  assert.equal(evaluation.result.observedTendencyId, null);
  assert.deepEqual(evaluation.session.observedTendencyIds, []);
});

runCase("low energy asks for rest with zero observation and zero failure", () => {
  const state = { ...BASE_STATE, energy: 1, touchFatigue: 8 };
  const evaluation = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "steadfastness"
  );

  assert.equal(evaluation.ok, true);
  assert.equal(evaluation.result.outcomeId, "rest");
  assert.equal(evaluation.result.observedTendencyId, null);
  assert.deepEqual(evaluation.session.observedTendencyIds, []);
});

runCase("curious companion may rewrite staying into pathfinding", () => {
  const state = { ...BASE_STATE, energy: 8, mood: "happy" };
  const evaluation = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "steadfastness"
  );

  assert.equal(evaluation.result.outcomeId, "modify");
  assert.equal(evaluation.result.observedTendencyId, "pathfinding");
});

runCase("companion rewrite needs an explicit second acceptance", () => {
  const state = { ...BASE_STATE, energy: 8, mood: "happy" };
  const proposed = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "steadfastness"
  );
  const before = JSON.stringify(proposed.session);
  const resolved = resolveHeartPhaseRewrite(state, proposed.session, "accept");

  assert.equal(resolved.ok, true);
  assert.equal(resolved.result.completionStatus, HEART_PHASE_COMPLETION.COMPLETED);
  assert.equal(resolved.result.rewriteDecision, "accept");
  assert.equal(resolved.result.resolutionResponseKey, "growth.session.response.rewriteAccepted");
  assert.equal(JSON.stringify(proposed.session), before, "pending session input stays immutable");
});

runCase("deferring a rewrite is a completed interaction with zero evidence status", () => {
  const state = { ...BASE_STATE, mood: "distant" };
  const proposed = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "attunement"
  );
  const resolved = resolveHeartPhaseRewrite(state, proposed.session, "defer");

  assert.equal(resolved.ok, true);
  assert.equal(resolved.result.completionStatus, HEART_PHASE_COMPLETION.DEFERRED);
  assert.equal(resolved.result.rewriteDecision, "defer");
  assertForbiddenFields(resolved, ["evidence", "stage", "offer", "reward", "statePatch"]);
});

runCase("rewrite resolution fails closed without a pending companion rewrite", () => {
  const accepted = evaluateHeartPhasePractice(
    BASE_STATE,
    createCompanionGrowthSession(BASE_STATE.activeCompanionId),
    "attunement"
  );
  const resolution = resolveHeartPhaseRewrite(BASE_STATE, accepted.session, "accept");

  assert.equal(resolution.ok, false);
  assert.equal(resolution.reason, "no-pending-rewrite");
  assert.equal(resolution.result, null);
  assert.deepEqual(resolution.session, accepted.session);
});

runCase("safe harbor cannot resolve a queued rewrite after it was proposed", () => {
  const state = { ...BASE_STATE, mood: "distant" };
  const proposed = evaluateHeartPhasePractice(
    state,
    createCompanionGrowthSession(state.activeCompanionId),
    "attunement"
  );
  const before = JSON.parse(JSON.stringify(proposed.session));
  const resolution = resolveHeartPhaseRewrite(
    { ...state, safeHarborMode: true },
    proposed.session,
    "accept"
  );

  assert.equal(resolution.ok, false);
  assert.equal(resolution.reason, "safety-paused");
  assert.equal(resolution.result, null);
  assert.deepEqual(resolution.session, before);
});

runCase("repeat practice never creates numeric accumulation or duplicate tendency", () => {
  const first = evaluateHeartPhasePractice(
    BASE_STATE,
    createCompanionGrowthSession(BASE_STATE.activeCompanionId),
    "attunement"
  );
  const second = evaluateHeartPhasePractice(BASE_STATE, first.session, "attunement");

  assert.deepEqual(second.session.observedTendencyIds, ["attunement"]);
  assertForbiddenFields(second, [
    "score", "count", "progress", "xp", "reward", "statePatch", "bondDelta", "trustDelta",
    "energyDelta", "defenseDelta", "evidence", "stage", "offer", "memory", "trace", "saveLevel"
  ]);
});

runCase("safety pause is terminal and preserves the session for every practice", () => {
  const session = evaluateHeartPhasePractice(
    BASE_STATE,
    createCompanionGrowthSession(BASE_STATE.activeCompanionId),
    "attunement"
  ).session;

  const safetyState = { ...BASE_STATE, safeHarborMode: true };
  const before = JSON.parse(JSON.stringify(session));
  for (const practice of HEART_PHASE_PRACTICES) {
    const evaluation = evaluateHeartPhasePractice(safetyState, session, practice.id);
    assert.equal(evaluation.ok, false);
    assert.equal(evaluation.reason, "safety-paused");
    assert.equal(evaluation.result, null);
    assert.deepEqual(evaluation.session, before);
  }
});

runCase("event provenance is not accepted as an ad-hoc top-level safety field", () => {
  const state = { ...BASE_STATE, growthSafetyExcluded: true };
  const snapshot = deriveHeartPhaseSnapshot(
    state,
    createCompanionGrowthSession(state.activeCompanionId)
  );

  assert.equal(snapshot.safetyPaused, false);
  assert.notEqual(snapshot.phaseId, "safety_pause");
});

runCase("bond trust defense and offline fields cannot influence a practice", () => {
  const low = {
    ...BASE_STATE,
    bond: 0,
    trust: 0,
    defense: 0,
    lastSeenAt: 1,
    loginStreak: 0,
    offlineDays: 0
  };
  const high = {
    ...BASE_STATE,
    bond: 100,
    trust: 100,
    defense: 100,
    lastSeenAt: 9999999999999,
    loginStreak: 999,
    offlineDays: 999
  };
  const session = createCompanionGrowthSession(BASE_STATE.activeCompanionId);

  assert.deepEqual(deriveHeartPhaseSnapshot(low, session), deriveHeartPhaseSnapshot(high, session));
  assert.deepEqual(
    evaluateHeartPhasePractice(low, session, "steadfastness"),
    evaluateHeartPhasePractice(high, session, "steadfastness")
  );
});

runCase("switching companion context discards the other companion session view", () => {
  const greyshade = evaluateHeartPhasePractice(
    BASE_STATE,
    createCompanionGrowthSession("greyshade-cat"),
    "attunement"
  ).session;
  const foxState = { ...BASE_STATE, activeCompanionId: "blazetail-kit" };
  const foxSnapshot = deriveHeartPhaseSnapshot(foxState, greyshade);

  assert.equal(foxSnapshot.companionId, "blazetail-kit");
  assert.deepEqual(foxSnapshot.observedTendencyIds, []);
  assert.equal(foxSnapshot.lastResult, null);
});

runCase("unknown practice fails closed with no observation", () => {
  const session = createCompanionGrowthSession(BASE_STATE.activeCompanionId);
  const evaluation = evaluateHeartPhasePractice(BASE_STATE, session, "farm_xp");

  assert.equal(evaluation.ok, false);
  assert.equal(evaluation.reason, "unknown-practice");
  assert.equal(evaluation.result, null);
  assert.deepEqual(evaluation.session, session);
});

runCase("same input produces the same output without clock or random state", () => {
  const session = createCompanionGrowthSession(BASE_STATE.activeCompanionId);
  const first = evaluateHeartPhasePractice(BASE_STATE, session, "pathfinding");
  const second = evaluateHeartPhasePractice(BASE_STATE, session, "pathfinding");
  assert.deepEqual(first, second);
});

const failedCases = cases.filter((item) => item.status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failedCases.length, cases }, null, 2));
if (failedCases.length > 0) process.exitCode = 1;

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error.message });
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  Object.values(value).forEach(deepFreeze);
  return value;
}

function assertForbiddenFields(value, forbiddenKeys) {
  const forbidden = new Set(forbiddenKeys.map((key) => key.toLowerCase()));
  walk(value, (key) => {
    assert.equal(forbidden.has(String(key).toLowerCase()), false, `forbidden field ${key}`);
  });
}

function walk(value, visitKey) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    visitKey(key);
    walk(child, visitKey);
  }
}
