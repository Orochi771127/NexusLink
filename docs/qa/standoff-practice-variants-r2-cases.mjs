import {
  applyNoiseTurn,
  applyPlayerAction,
  createStandoffSession,
  getIntentTelegraph
} from "../../src/engine/battleEngine.js";
import { getCompanionById } from "../../src/data/companionRegistry.js";
import {
  STANDOFF_PRACTICE_VARIANTS,
  advanceStandoffPracticeIntent,
  applyStandoffPracticeVariant,
  getStandoffPracticeMetadata,
  listAvailableStandoffPracticeVariants
} from "../../src/engine/standoffPracticeVariantEngine.js";

const cases = [];
const NODE_ID = "rift_observatory";
const rng = () => 0.5;

runCase("all three variants appear only for an existing cleared node", () => {
  const state = clearedState();
  assertDeepEqual(
    listAvailableStandoffPracticeVariants(state, NODE_ID).map(({ id }) => id),
    ["solo_witness", "shared_breath", "cross_current"],
    "available ids"
  );
  assertDeepEqual(listAvailableStandoffPracticeVariants(clearedState([]), NODE_ID), [], "uncleared hidden");
  assertDeepEqual(listAvailableStandoffPracticeVariants(state, "not-a-node"), [], "unknown hidden");
});

runCase("variant descriptors contain no reward, Growth, rank, or stage contract", () => {
  for (const variant of STANDOFF_PRACTICE_VARIANTS) {
    assertEqual(hasForbiddenProgressionField(variant), false, `${variant.id} has no progression`);
    assertDeepEqual(Object.keys(variant).sort(), ["copyKey", "id", "labelKey"], `${variant.id} minimal descriptor`);
  }
});

runCase("unknown node, uncleared node, and unknown variant fail closed", () => {
  const session = makeSession();
  const attempts = [
    applyStandoffPracticeVariant(session, {
      state: clearedState(["not-a-node"]),
      nodeId: "not-a-node",
      variantId: "solo_witness"
    }),
    applyStandoffPracticeVariant(session, {
      state: clearedState([]),
      nodeId: NODE_ID,
      variantId: "solo_witness"
    }),
    applyStandoffPracticeVariant(session, {
      state: clearedState(),
      nodeId: NODE_ID,
      variantId: "daily_ranked"
    })
  ];
  assertDeepEqual(attempts.map(({ reason }) => reason), ["unknown-node", "node-not-cleared", "unknown-variant"], "fail reasons");
  assertEqual(attempts.every(({ permanentDelta }) => permanentDelta === null), true, "zero delta failures");
});

runCase("session owner must match the cleared node", () => {
  const session = makeSession();
  const result = applyStandoffPracticeVariant(session, {
    state: clearedState([NODE_ID, "starwood_trail"]),
    nodeId: "starwood_trail",
    variantId: "solo_witness"
  });
  assertEqual(result.ok, false, "owner mismatch blocked");
  assertEqual(result.reason, "owner-mismatch", "owner reason");
});

runCase("safe harbor is terminal before creating a practice transform", () => {
  const state = { ...clearedState(), safeHarborMode: true };
  assertDeepEqual(listAvailableStandoffPracticeVariants(state, NODE_ID), [], "safety hides variants");
  const result = applyStandoffPracticeVariant(makeSession(), {
    state,
    variantId: "solo_witness"
  });
  assertEqual(result.ok, false, "safety blocked");
  assertEqual(result.reason, "safety-paused", "safety reason");
  assertEqual(result.session.practiceVariant, undefined, "no practice metadata fabricated");
});

runCase("safe harbor provenance stops cross-current advancement", () => {
  const transformed = applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "cross_current"
  });
  const result = advanceStandoffPracticeIntent({
    ...transformed.session,
    growthSafetyExcluded: true
  });
  assertEqual(result.ok, false, "advance blocked");
  assertEqual(result.reason, "safety-paused", "safety reason");
});

runCase("solo witness removes all supports and restores lead-only affinity", () => {
  const session = makeSession({ circleIds: ["blazetail-kit"] });
  assertEqual(session.affinityTier, "attuned", "support initially provides best affinity");
  const before = JSON.stringify(session);
  const result = applyStandoffPracticeVariant(session, {
    state: clearedState(),
    variantId: "solo_witness"
  });
  assertEqual(result.ok, true, "solo applied");
  assertEqual(result.session.circle.length, 0, "empty circle");
  assertEqual(result.session.affinityTier, "neutral", "lead-only affinity restored");
  assertEqual(result.session.affinityMultiplier, 1, "lead-only multiplier");
  assertEqual(result.session.log.some(({ text }) => text.includes("【共鳴圈】")), false, "stale circle intro removed");
  assertEqual(result.session.log.some(({ text }) => text === session.affinityLine), false, "stale support affinity line removed");
  assertEqual(JSON.stringify(session), before, "input unchanged");
});

runCase("solo witness remains a normal battleEngine session", () => {
  const result = applyStandoffPracticeVariant(makeSession({ circleIds: ["sprigfawn"] }), {
    state: clearedState(),
    variantId: "solo_witness"
  });
  const acted = applyPlayerAction(result.session, "barrier", rng);
  assertEqual(acted.turn, "noise", "battleEngine executes action");
  assertEqual(acted.practiceVariant.id, "solo_witness", "practice metadata survives clone");
  assertEqual(result.permanentDelta, null, "no permanent delta");
});

runCase("shared breath rests exactly one support early without replacing them", () => {
  const session = makeSession({ circleIds: ["sprigfawn", "auriowl"] });
  const before = JSON.stringify(session);
  const result = applyStandoffPracticeVariant(session, {
    state: clearedState(),
    variantId: "shared_breath"
  });
  assertEqual(result.ok, true, "shared breath applied");
  assertEqual(result.session.circle.length, 2, "circle not refilled or reduced");
  assertEqual(result.session.circle[0].resting, true, "first support rests");
  assertEqual(result.session.circle[0].breath, 0, "rest breath exhausted safely");
  assertEqual(result.session.circle[0].practiceRested, true, "practice rest marked");
  assertEqual(result.session.circle[1].resting, false, "second support unchanged");
  assertEqual(result.session.practiceVariant.earlyRestCompanionId, "sprigfawn", "deterministic resting support");
  assertEqual(JSON.stringify(session), before, "input unchanged");
});

runCase("shared breath fails closed when no support is present", () => {
  const session = makeSession({ circleIds: [] });
  const before = JSON.stringify(session);
  const result = applyStandoffPracticeVariant(session, {
    state: clearedState(),
    variantId: "shared_breath"
  });
  assertEqual(result.ok, false, "support required");
  assertEqual(result.reason, "support-required", "support reason");
  assertEqual(JSON.stringify(session), before, "input unchanged");
});

runCase("cross current opens on a clearly telegraphed surge", () => {
  const result = applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "cross_current"
  });
  assertEqual(result.ok, true, "cross current applied");
  assertEqual(result.session.nextIntent, "surge", "initial surge");
  assertEqual(result.session.practiceVariant.telegraphLocked, true, "telegraph locked");
  assertEqual(getIntentTelegraph(result.session).intent, "surge", "battle telegraph reads surge");
});

runCase("cross current alternates surge and lull deterministically", () => {
  let session = expectOk(applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "cross_current"
  })).session;
  const first = advanceStandoffPracticeIntent(session);
  const repeated = advanceStandoffPracticeIntent(session);
  assertDeepEqual(first, repeated, "same input same next intent");
  session = expectOk(first).session;
  assertEqual(session.nextIntent, "lull", "beat one lull");
  session = expectOk(advanceStandoffPracticeIntent(session)).session;
  assertEqual(session.nextIntent, "surge", "beat two surge");
  session = expectOk(advanceStandoffPracticeIntent(session)).session;
  assertEqual(session.nextIntent, "lull", "beat three lull");
});

runCase("cross current reapplies its next telegraph after battleEngine noise authority", () => {
  let session = expectOk(applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "cross_current"
  })).session;
  session = applyPlayerAction(session, "barrier", rng);
  assertEqual(session.turn, "noise", "lead action stays battle-owned");
  session = applyNoiseTurn(session, rng);
  assertEqual(session.turn, "player", "noise action stays battle-owned");
  session = expectOk(advanceStandoffPracticeIntent(session)).session;
  assertEqual(session.nextIntent, "lull", "next locked lull");
  assertEqual(getIntentTelegraph(session).intent, "lull", "clear lull telegraph");
});

runCase("practice intent cannot advance during the noise turn", () => {
  const transformed = applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "cross_current"
  });
  const noiseTurn = applyPlayerAction(transformed.session, "barrier", rng);
  const result = advanceStandoffPracticeIntent(noiseTurn);
  assertEqual(result.ok, false, "wrong turn blocked");
  assertEqual(result.reason, "not-player-turn", "wrong turn reason");
});

runCase("non-cross-current variants cannot take ownership of intent selection", () => {
  const transformed = applyStandoffPracticeVariant(makeSession(), {
    state: clearedState(),
    variantId: "solo_witness"
  });
  const result = advanceStandoffPracticeIntent(transformed.session);
  assertEqual(result.ok, false, "not advanced");
  assertEqual(result.reason, "not-cross-current", "policy remains battleEngine");
});

runCase("all transforms preserve the existing node, enemy, and session key", () => {
  for (const variantId of ["solo_witness", "shared_breath", "cross_current"]) {
    const session = makeSession({ circleIds: variantId === "shared_breath" ? ["sprigfawn"] : ["blazetail-kit"] });
    const result = applyStandoffPracticeVariant(session, {
      state: clearedState(),
      variantId
    });
    assertEqual(result.session.nodeId, session.nodeId, `${variantId} node`);
    assertEqual(result.session.enemyId, session.enemyId, `${variantId} enemy`);
    assertEqual(result.session.sessionKey, session.sessionKey, `${variantId} session key`);
    assertEqual(result.session.practiceVariant.nodeId, NODE_ID, `${variantId} practice owner`);
  }
});

runCase("transforms add no stage, reward, Growth, ranking, score, or clear id", () => {
  for (const variantId of ["solo_witness", "shared_breath", "cross_current"]) {
    const result = applyStandoffPracticeVariant(
      makeSession({ circleIds: variantId === "shared_breath" ? ["sprigfawn"] : [] }),
      { state: clearedState(), variantId }
    );
    assertEqual(result.ok, true, `${variantId} applied`);
    assertEqual(hasForbiddenProgressionField(result.session), false, `${variantId} no progression`);
    assertEqual(result.permanentDelta, null, `${variantId} zero permanent delta`);
  }
});

runCase("practice metadata is qualitative and session-only", () => {
  const result = applyStandoffPracticeVariant(makeSession({ circleIds: ["sprigfawn"] }), {
    state: clearedState(),
    variantId: "shared_breath"
  });
  assertDeepEqual(getStandoffPracticeMetadata(result.session), {
    id: "shared_breath",
    nodeId: NODE_ID,
    sessionOnly: true,
    beatIndex: 0,
    intentPolicy: "battle_engine",
    telegraphLocked: false,
    earlyRestCompanionId: "sprigfawn"
  }, "metadata");
});

runCase("state and session inputs are never mutated", () => {
  const state = clearedState();
  const session = makeSession({ circleIds: ["sprigfawn", "auriowl"] });
  const stateBefore = JSON.stringify(state);
  const sessionBefore = JSON.stringify(session);
  applyStandoffPracticeVariant(session, { state, variantId: "shared_breath" });
  assertEqual(JSON.stringify(state), stateBefore, "state unchanged");
  assertEqual(JSON.stringify(session), sessionBefore, "session unchanged");
});

runCase("reapplying the same variant to the same base session is deterministic", () => {
  const state = clearedState();
  const session = makeSession({ circleIds: ["sprigfawn", "auriowl"] });
  const first = applyStandoffPracticeVariant(session, { state, variantId: "shared_breath" });
  const second = applyStandoffPracticeVariant(session, { state, variantId: "shared_breath" });
  assertDeepEqual(first, second, "deterministic transform");
});

const failed = cases.filter(({ status }) => status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failed.length, cases }, null, 2));
if (failed.length > 0) process.exitCode = 1;

function clearedState(ids = [NODE_ID]) {
  return {
    activeCompanionId: "greyshade-cat",
    safeHarborMode: false,
    bond: 0,
    activityProgress: {
      version: 1,
      standoff: { clearedScenarioIds: [...ids] }
    }
  };
}

function makeSession({ circleIds = [] } = {}) {
  const state = clearedState();
  const session = createStandoffSession({
    companion: getCompanionById("greyshade-cat"),
    enemyId: "static_wisp",
    nodeId: NODE_ID,
    state,
    rng,
    circle: circleIds.map((id) => getCompanionById(id))
  });
  session.sessionKey = "practice-r2-session";
  return session;
}

function hasForbiddenProgressionField(value) {
  if (!value || typeof value !== "object") return false;
  const forbidden = new Set([
    "stageId",
    "stage",
    "reward",
    "rewards",
    "growth",
    "growthEvidence",
    "ranking",
    "rank",
    "score",
    "clearedScenarioIds"
  ]);
  return Object.entries(value).some(([key, nested]) => (
    forbidden.has(key)
    || (key !== "growthSafetyExcluded" && hasForbiddenProgressionField(nested))
  ));
}

function expectOk(result) {
  if (!result.ok) throw new Error(`expected ok result, received ${result.reason}`);
  if (result.permanentDelta !== null) throw new Error("expected zero permanent delta");
  return result;
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
