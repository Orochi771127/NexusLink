import { createStandoffSession } from "../../src/engine/battleEngine.js";
import { getCompanionById } from "../../src/data/companionRegistry.js";
import {
  deriveResonanceCircle,
  listEligibleResonanceCompanions
} from "../../src/engine/resonanceCircleEngine.js";
import {
  MAX_AUTONOMOUS_BEATS,
  createStandoffAutonomyState,
  deriveAutonomousLeadDecision,
  deriveStandoffPreparation,
  getAutonomyBeatMetadata,
  markAutonomousBeatComplete,
  resolveStandoffRequest
} from "../../src/engine/standoffAutonomyEngine.js";

const cases = [];
const rng = () => 0.5;

runCase("eligibility lists every joined, unlocked, runtime companion in joinedAt order", () => {
  const state = makeState({
    joined: { sprigfawn: 300, auriowl: 200, "starstripe-cub": 100 }
  });
  assertDeepEqual(
    listEligibleResonanceCompanions(state).map(({ id }) => id),
    ["starstripe-cub", "auriowl", "sprigfawn"],
    "all eligible candidates"
  );
  assertDeepEqual(
    deriveResonanceCircle(state).map(({ id }) => id),
    ["starstripe-cub", "auriowl"],
    "legacy auto circle remains capped"
  );
});

runCase("eligibility excludes the active, locked, unknown, unjoined, and invalid joinedAt candidates", () => {
  const state = makeState({
    activeId: "sprigfawn",
    joined: {
      sprigfawn: 100,
      auriowl: 200,
      "starstripe-cub": 0,
      "no-such-companion": 50
    },
    unlocked: ["sprigfawn", "starstripe-cub", "no-such-companion"]
  });
  assertDeepEqual(listEligibleResonanceCompanions(state), [], "fail-closed eligibility");
});

runCase("preferred ids preserve explicit order and never auto-fill invalid slots", () => {
  const state = makeState({ joined: { sprigfawn: 100, auriowl: 200, "starstripe-cub": 300 } });
  assertDeepEqual(
    deriveResonanceCircle(state, { preferredIds: ["auriowl", "no-such-companion"] }).map(({ id }) => id),
    ["auriowl"],
    "invalid slot stays empty"
  );
  assertDeepEqual(
    deriveResonanceCircle(state, { preferredIds: ["sprigfawn", "sprigfawn", "auriowl"] }).map(({ id }) => id),
    ["sprigfawn", "auriowl"],
    "duplicates are ignored"
  );
  assertDeepEqual(deriveResonanceCircle(state, { preferredIds: "auriowl" }), [], "non-array fails closed");
});

runCase("steady and curious companions accept with distinct readable body cues", () => {
  const steady = prepareOne({ mood: "calm", energy: 8 });
  const curious = prepareOne({ mood: "warm", energy: 8 });
  assertEqual(steady.participation[0].outcomeId, "accept", "steady accepts");
  assertEqual(steady.participation[0].bodyCueId, "step_closer", "steady cue");
  assertEqual(curious.participation[0].outcomeId, "accept", "curious accepts");
  assertEqual(curious.participation[0].bodyCueId, "lean_in", "curious cue");
});

runCase("guarded companion rewrites the distance without being excluded", () => {
  const preparation = prepareOne({ mood: "defensive", energy: 8, lastTouchReaction: "" });
  assertEqual(preparation.participation[0].phaseId, "guarded", "guarded phase");
  assertEqual(preparation.participation[0].outcomeId, "rewrite", "rewrite outcome");
  assertEqual(preparation.participation[0].bodyCueId, "circle_edge", "edge cue");
  assertEqual(preparation.companions[0].id, "sprigfawn", "rewrite still participates");
});

runCase("an explicit boundary declines without replacement", () => {
  const preparation = prepareOne({ mood: "calm", energy: 8, lastTouchReaction: "blocked" });
  assertEqual(preparation.participation[0].outcomeId, "decline", "decline outcome");
  assertEqual(preparation.companions.length, 0, "declined companion is not substituted");
});

runCase("a resting companion rests without replacement", () => {
  const preparation = prepareOne({ mood: "calm", energy: 2 });
  assertEqual(preparation.participation[0].phaseId, "resting", "resting phase");
  assertEqual(preparation.participation[0].outcomeId, "rest", "rest outcome");
  assertEqual(preparation.companions.length, 0, "resting companion is not substituted");
});

runCase("safe harbor is terminal and emits no participation variants", () => {
  const state = makeState({ joined: { sprigfawn: 100 }, safeHarborMode: true });
  const preparation = deriveStandoffPreparation(state, {
    preferredIds: ["sprigfawn"],
    controlMode: "entrusted"
  });
  assertEqual(preparation.ok, false, "preparation blocked");
  assertEqual(preparation.reason, "safety-paused", "safety reason");
  assertDeepEqual(preparation.participation, [], "no response variants");
  assertDeepEqual(preparation.companions, [], "no circle created");
});

runCase("preparation and eligibility are pure reads", () => {
  const state = makeState({ joined: { sprigfawn: 100, auriowl: 200 } });
  const before = JSON.stringify(state);
  deriveStandoffPreparation(state, {
    preferredIds: ["auriowl", "sprigfawn"],
    controlMode: "entrusted",
    approach: "attune"
  });
  assertEqual(JSON.stringify(state), before, "state unchanged");
});

runCase("manual control never produces an autonomous lead decision", () => {
  const { session, preparation } = makeContext({ controlMode: "manual" });
  const autonomy = createStandoffAutonomyState(preparation, {
    sessionKey: "r2-manual",
    leadCompanionId: session.companionId
  });
  const result = deriveAutonomousLeadDecision(session, autonomy);
  assertEqual(result.ok, false, "decision blocked");
  assertEqual(result.reason, "manual-control", "manual reason");
});

runCase("adaptive reads surge as barrier and exposes intent metadata", () => {
  const { session, autonomy } = makeContext({ approach: "adaptive" });
  session.nextIntent = "surge";
  session.boundary = 0;
  const result = deriveAutonomousLeadDecision(session, autonomy);
  assertEqual(result.leadDecision.actionId, "barrier", "barrier action");
  assertEqual(result.leadDecision.reasonId, "surge_without_boundary", "readable reason");
  assertEqual(result.leadDecision.animationIntent, "standoff.barrier", "animation intent");
  assertEqual(result.leadDecision.bodyCueId, "stand_forward", "body cue");
});

runCase("adaptive uses resonance for gather and safe pulse for lull", () => {
  const gather = makeContext({ approach: "adaptive" });
  gather.session.nextIntent = "gather";
  assertEqual(
    deriveAutonomousLeadDecision(gather.session, gather.autonomy).leadDecision.actionId,
    "resonance",
    "gather resonance"
  );

  const lull = makeContext({ approach: "adaptive" });
  lull.session.nextIntent = "lull";
  lull.session.sync = 3;
  lull.session.fatigue = 1;
  assertEqual(
    deriveAutonomousLeadDecision(lull.session, lull.autonomy).leadDecision.actionId,
    "pulse",
    "safe lull pulse"
  );
  lull.session.sync = 1;
  assertEqual(
    deriveAutonomousLeadDecision(lull.session, lull.autonomy).leadDecision.actionId,
    "resonance",
    "unavailable pulse falls back"
  );
});

runCase("attune listens first but protects low stability", () => {
  const { session, autonomy } = makeContext({ approach: "attune" });
  session.nextIntent = "lull";
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).leadDecision.actionId, "resonance", "attune listens");
  session.stability.current = Math.floor(session.stability.max * 0.5);
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).leadDecision.actionId, "barrier", "attune protects");
});

runCase("shelter maintains two boundary layers before resonating", () => {
  const { session, autonomy } = makeContext({ approach: "shelter" });
  session.nextIntent = "lull";
  session.boundary = 1;
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).leadDecision.actionId, "barrier", "low boundary");
  session.boundary = 2;
  session.stability.current = session.stability.max;
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).leadDecision.actionId, "resonance", "boundary steady");
});

runCase("critical stability and fatigue force a protective barrier in every approach", () => {
  for (const approach of ["adaptive", "attune", "shelter"]) {
    const low = makeContext({ approach });
    low.session.nextIntent = "lull";
    low.session.stability.current = Math.floor(low.session.stability.max * 0.3);
    assertEqual(deriveAutonomousLeadDecision(low.session, low.autonomy).leadDecision.actionId, "barrier", `${approach} low stability`);

    const tired = makeContext({ approach });
    tired.session.nextIntent = "lull";
    tired.session.fatigue = 5;
    assertEqual(deriveAutonomousLeadDecision(tired.session, tired.autonomy).leadDecision.actionId, "barrier", `${approach} fatigue`);
  }
});

runCase("the lead decision is deterministic and leaves inputs untouched", () => {
  const { session, autonomy } = makeContext({ approach: "adaptive" });
  session.nextIntent = "lull";
  session.sync = 3;
  const sessionBefore = JSON.stringify(session);
  const autonomyBefore = JSON.stringify(autonomy);
  const first = deriveAutonomousLeadDecision(session, autonomy);
  const second = deriveAutonomousLeadDecision(session, autonomy);
  assertDeepEqual(first, second, "same decision");
  assertEqual(JSON.stringify(session), sessionBefore, "session unchanged");
  assertEqual(JSON.stringify(autonomy), autonomyBefore, "autonomy unchanged");
});

runCase("wrong turn and owner mismatch fail closed", () => {
  const { session, autonomy } = makeContext({});
  session.turn = "noise";
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).reason, "not-player-turn", "wrong turn");
  session.turn = "player";
  const wrongOwner = { ...autonomy, leadCompanionId: "auriowl" };
  assertEqual(deriveAutonomousLeadDecision(session, wrongOwner).reason, "owner-mismatch", "owner mismatch");
});

runCase("an accepted request is consumed once and overrides only the next lead decision", () => {
  const context = makeRequestContext();
  const resolved = resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "resonance"
  });
  assertRequestOutcome(resolved, "accept", "resonance");
  const decision = deriveAutonomousLeadDecision(context.session, resolved.nextAutonomy);
  assertEqual(decision.leadDecision.actionId, "resonance", "override applied");
  assertEqual(decision.leadDecision.reasonId, "request_accepted", "request reason exposed");

  const completed = markAutonomousBeatComplete(resolved.nextAutonomy);
  assertEqual(completed.nextAutonomy.nextActionOverride, null, "override cleared after one beat");
  assertEqual(completed.nextAutonomy.request.pending, false, "request no longer pending");
});

runCase("a guarded companion rewrites a request and still consumes it", () => {
  const context = makeRequestContext();
  const guardedState = withRelationship(context.state, "sprigfawn", {
    mood: "defensive",
    energy: 8,
    lastTouchReaction: ""
  });
  const resolved = resolveStandoffRequest({
    state: guardedState,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "pulse"
  });
  assertRequestOutcome(resolved, "rewrite", "barrier");
  assertEqual(resolved.requestResult.reasonId, "guarded_rewrites_request", "guarded reason");
});

runCase("an unsafe pulse is rewritten to a safe non-pulse action", () => {
  const context = makeRequestContext();
  context.session.nextIntent = "lull";
  context.session.sync = 1;
  const resolved = resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "pulse"
  });
  assertRequestOutcome(resolved, "rewrite", "resonance");
  assertEqual(resolved.requestResult.reasonId, "request_rewritten_for_safety", "safety rewrite reason");
});

runCase("a resting companion consumes the request without an action override", () => {
  const context = makeRequestContext();
  const restingState = withRelationship(context.state, "sprigfawn", { mood: "calm", energy: 1 });
  const resolved = resolveStandoffRequest({
    state: restingState,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "barrier"
  });
  assertRequestOutcome(resolved, "rest", null);
  assertEqual(resolved.nextActionOverride, null, "no override");
});

runCase("an explicit refusal consumes the request without an action override", () => {
  const context = makeRequestContext();
  const boundaryState = withRelationship(context.state, "sprigfawn", {
    mood: "calm",
    energy: 8,
    lastTouchReaction: "blocked"
  });
  const resolved = resolveStandoffRequest({
    state: boundaryState,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "barrier"
  });
  assertRequestOutcome(resolved, "decline", null);
  assertEqual(resolved.nextActionOverride, null, "no override");
});

runCase("all four legitimate request outcomes consume the one request", () => {
  const scenarios = [
    { relationship: { mood: "calm", energy: 8 }, action: "resonance", outcome: "accept" },
    { relationship: { mood: "defensive", energy: 8 }, action: "pulse", outcome: "rewrite" },
    { relationship: { mood: "calm", energy: 1 }, action: "barrier", outcome: "rest" },
    { relationship: { mood: "calm", energy: 8, lastTouchReaction: "reject" }, action: "barrier", outcome: "decline" }
  ];
  for (const scenario of scenarios) {
    const context = makeRequestContext();
    const state = withRelationship(context.state, "sprigfawn", scenario.relationship);
    const resolved = resolveStandoffRequest({
      state,
      session: context.session,
      autonomy: context.autonomy,
      targetId: "sprigfawn",
      requestedActionId: scenario.action
    });
    assertEqual(resolved.requestResult.outcomeId, scenario.outcome, `${scenario.outcome} outcome`);
    assertEqual(resolved.requestResult.consumed, true, `${scenario.outcome} consumed result`);
    assertEqual(resolved.nextAutonomy.request.used, true, `${scenario.outcome} used`);
    assertEqual(resolved.nextAutonomy.request.consumed, true, `${scenario.outcome} consumed state`);
  }
});

runCase("a second request is rejected without changing the consumed request", () => {
  const context = makeRequestContext();
  const first = resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "resonance"
  });
  const second = resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: first.nextAutonomy,
    targetId: "sprigfawn",
    requestedActionId: "barrier"
  });
  assertEqual(second.ok, false, "second blocked");
  assertEqual(second.reason, "request-already-used", "used reason");
  assertDeepEqual(second.nextAutonomy.request, first.nextAutonomy.request, "first result preserved");
});

runCase("invalid request inputs and safety terminal do not consume the request", () => {
  const context = makeRequestContext();
  for (const attempt of [
    { targetId: "no-such-companion", requestedActionId: "barrier", expected: "invalid-request-target" },
    { targetId: "sprigfawn", requestedActionId: "retreat", expected: "unknown-request-action" }
  ]) {
    const result = resolveStandoffRequest({
      state: context.state,
      session: context.session,
      autonomy: context.autonomy,
      ...attempt
    });
    assertEqual(result.reason, attempt.expected, attempt.expected);
    assertEqual(result.nextAutonomy.request.used, false, "not consumed");
  }

  const safety = resolveStandoffRequest({
    state: { ...context.state, safeHarborMode: true },
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "barrier"
  });
  assertEqual(safety.reason, "safety-paused", "safety terminal");
  assertEqual(safety.nextAutonomy.request.used, false, "safety does not fabricate a response");
});

runCase("request judgment ignores bond and trust as obedience probabilities", () => {
  const context = makeRequestContext();
  const low = withRelationship(context.state, "sprigfawn", { mood: "calm", energy: 8, bond: 0, trust: 0 });
  const high = withRelationship(context.state, "sprigfawn", { mood: "calm", energy: 8, bond: 100, trust: 100 });
  const request = {
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "resonance"
  };
  const lowResult = resolveStandoffRequest({ ...request, state: low }).requestResult;
  const highResult = resolveStandoffRequest({ ...request, state: high }).requestResult;
  assertDeepEqual(lowResult, highResult, "bond/trust do not alter the response");
});

runCase("request resolution is pure and owner mismatches fail closed", () => {
  const context = makeRequestContext();
  const stateBefore = JSON.stringify(context.state);
  const sessionBefore = JSON.stringify(context.session);
  const autonomyBefore = JSON.stringify(context.autonomy);
  resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: context.autonomy,
    targetId: "sprigfawn",
    requestedActionId: "resonance"
  });
  assertEqual(JSON.stringify(context.state), stateBefore, "state unchanged");
  assertEqual(JSON.stringify(context.session), sessionBefore, "session unchanged");
  assertEqual(JSON.stringify(context.autonomy), autonomyBefore, "autonomy unchanged");

  const mismatch = resolveStandoffRequest({
    state: context.state,
    session: context.session,
    autonomy: { ...context.autonomy, leadCompanionId: "auriowl" },
    targetId: "sprigfawn",
    requestedActionId: "resonance"
  });
  assertEqual(mismatch.reason, "owner-mismatch", "owner mismatch");
  assertEqual(mismatch.nextAutonomy.request.used, false, "mismatch does not consume");
});

runCase("the twentieth completed beat pauses autonomy without inventing an outcome", () => {
  const { session, autonomy: initial } = makeContext({});
  let autonomy = initial;
  for (let index = 0; index < MAX_AUTONOMOUS_BEATS; index += 1) {
    autonomy = markAutonomousBeatComplete(autonomy).nextAutonomy;
  }
  const metadata = getAutonomyBeatMetadata(autonomy);
  assertEqual(metadata.beatCount, 20, "twenty beats");
  assertEqual(metadata.remainingBeats, 0, "none remaining");
  assertEqual(metadata.limitReached, true, "limit reached");
  assertEqual(metadata.pauseReason, "max-beats", "pause reason");
  assertEqual(deriveAutonomousLeadDecision(session, autonomy).reason, "max-beats", "no twenty-first decision");
  assertEqual(Object.prototype.hasOwnProperty.call(autonomy, "outcome"), false, "no fabricated outcome");
});

const failed = cases.filter(({ status }) => status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failed.length, cases }, null, 2));
if (failed.length > 0) process.exitCode = 1;

function makeState({
  activeId = "greyshade-cat",
  joined = {},
  unlocked = null,
  relationships = {},
  safeHarborMode = false
} = {}) {
  const ids = new Set([activeId, ...Object.keys(joined), ...Object.keys(relationships)]);
  const byId = {};
  for (const id of ids) {
    byId[id] = { companionId: id, relationship: relationship(relationships[id]) };
  }
  return {
    activeCompanionId: activeId,
    unlockedCompanionIds: unlocked || [...ids],
    resonance: {
      chapterMarks: {},
      companions: Object.fromEntries(
        Object.entries(joined).map(([id, joinedAt]) => [id, { metAt: 1, joinedAt }])
      )
    },
    companionStates: { version: 1, byId },
    safeHarborMode,
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    touchFatigue: 0
  };
}

function relationship(overrides = {}) {
  return {
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    defense: 35,
    touchFatigue: 0,
    lastTouchAt: null,
    lastRejectAt: null,
    blockedTouchCount: 0,
    lastBlockedTouchAt: null,
    firstTouchCompleted: false,
    firstHugCompleted: false,
    reactionPreview: "",
    lastTouchReaction: "",
    ...overrides
  };
}

function withRelationship(state, companionId, overrides) {
  return {
    ...state,
    companionStates: {
      ...state.companionStates,
      byId: {
        ...state.companionStates.byId,
        [companionId]: {
          companionId,
          relationship: relationship(overrides)
        }
      }
    }
  };
}

function prepareOne(supportRelationship) {
  const state = makeState({
    joined: { sprigfawn: 100 },
    relationships: { sprigfawn: supportRelationship }
  });
  return deriveStandoffPreparation(state, {
    preferredIds: ["sprigfawn"],
    controlMode: "entrusted",
    approach: "adaptive"
  });
}

function makeContext({ approach = "adaptive", controlMode = "entrusted" } = {}) {
  const state = makeState();
  const preparation = deriveStandoffPreparation(state, {
    preferredIds: [],
    controlMode,
    approach
  });
  const session = createStandoffSession({
    companion: getCompanionById("greyshade-cat"),
    enemyId: "static_wisp",
    nodeId: "moonlake-rift",
    state,
    rng,
    circle: preparation.companions
  });
  session.nextIntent = "lull";
  const autonomy = createStandoffAutonomyState(preparation, {
    sessionKey: "standoff-r2-test",
    leadCompanionId: session.companionId
  });
  return { state, preparation, session, autonomy };
}

function makeRequestContext() {
  const state = makeState({
    joined: { sprigfawn: 100 },
    relationships: { sprigfawn: { mood: "calm", energy: 8 } }
  });
  const preparation = deriveStandoffPreparation(state, {
    preferredIds: ["sprigfawn"],
    controlMode: "entrusted",
    approach: "adaptive"
  });
  const session = createStandoffSession({
    companion: getCompanionById("greyshade-cat"),
    enemyId: "static_wisp",
    nodeId: "moonlake-rift",
    state,
    rng,
    circle: preparation.companions
  });
  session.nextIntent = "lull";
  const autonomy = createStandoffAutonomyState(preparation, {
    sessionKey: "standoff-r2-request-test",
    leadCompanionId: session.companionId
  });
  return { state, preparation, session, autonomy };
}

function assertRequestOutcome(result, outcomeId, resolvedActionId) {
  assertEqual(result.ok, true, `${outcomeId} ok`);
  assertEqual(result.requestResult.outcomeId, outcomeId, `${outcomeId} outcome`);
  assertEqual(result.requestResult.resolvedActionId, resolvedActionId, `${outcomeId} resolved action`);
  assertEqual(result.requestResult.consumed, true, `${outcomeId} consumed`);
  assertEqual(result.nextAutonomy.request.used, true, `${outcomeId} used`);
}

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error.message });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}
