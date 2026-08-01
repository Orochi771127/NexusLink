import assert from "node:assert/strict";

import {
  HABITAT_RHYTHM_HOTSPOTS,
  deriveHabitatCareRootKey,
  deriveHabitatPracticeInvitation,
  deriveHabitatRhythm,
  projectHabitatPracticeResult
} from "../../src/engine/habitatRhythmEngine.js";
import {
  HEART_PHASE_COMPLETION,
  isCanonicalHeartPhaseResult
} from "../../src/engine/companionGrowthSessionEngine.js";

const BASE_STATE = Object.freeze({
  activeCompanionId: "greyshade-cat",
  energy: 6,
  touchFatigue: 0,
  mood: "calm",
  lastTouchReaction: "accept",
  safeHarborMode: false,
  chapterProgress: Object.freeze({ current: 3 })
});

const EXPECTED_HOTSPOTS = Object.freeze({
  water: Object.freeze({
    practiceId: "attunement",
    affordanceId: "listen_to_tide",
    waypointId: "bridge_far",
    animationIntent: "care.calm_sync"
  }),
  lantern: Object.freeze({
    practiceId: "boundary_respect",
    affordanceId: "approach_lantern_with_space",
    waypointId: "near_ground_left",
    animationIntent: "soul.acknowledge"
  }),
  crystal: Object.freeze({
    practiceId: "pathfinding",
    affordanceId: "sort_crystal_echoes",
    waypointId: "platform_left",
    animationIntent: "standoff.resonance"
  }),
  "quiet-ground": Object.freeze({
    practiceId: "steadfastness",
    affordanceId: "sit_or_wait_together",
    waypointId: "near_ground_center",
    animationIntent: "soul.rest"
  })
});

const cases = [];

runCase("四種 hotspot 對映 canonical practice／affordance／waypoint／animation", () => {
  assert.deepEqual(Object.keys(HABITAT_RHYTHM_HOTSPOTS), Object.keys(EXPECTED_HOTSPOTS));
  for (const [hotspotType, expected] of Object.entries(EXPECTED_HOTSPOTS)) {
    const output = deriveHabitatPracticeInvitation({
      state: BASE_STATE,
      environment: { chapterNo: 3, hotspotId: `${hotspotType}-fixture` },
      hotspotType
    });
    assert.equal(output.ok, true);
    assert.equal(output.invitation.hotspotType, hotspotType);
    assert.equal(output.invitation.hotspotId, `${hotspotType}-fixture`);
    for (const [key, value] of Object.entries(expected)) {
      assert.equal(output.invitation[key], value, `${hotspotType}.${key}`);
    }
  }
});

runCase("Heart Phase 四相直接沿用 existing engine", () => {
  const fixtures = [
    [{ ...BASE_STATE, energy: 2 }, "resting", "settle_low"],
    [{ ...BASE_STATE, mood: "defensive" }, "guarded", "hold_comfortable_distance"],
    [{ ...BASE_STATE, mood: "happy", energy: 7 }, "curious", "look_twice_then_approach"],
    [{ ...BASE_STATE, mood: "calm", energy: 6 }, "steady", "breathe_evenly"]
  ];
  for (const [state, phaseId, bodyCueId] of fixtures) {
    const rhythm = deriveHabitatRhythm({ state, environment: { timePhase: "day", weather: "clear" } });
    assert.equal(rhythm.phaseId, phaseId);
    assert.equal(rhythm.bodyCueId, bodyCueId);
    assert.equal(rhythm.safetyPaused, false);
  }
});

runCase("四種 canonical outcome 均可由 hotspot＋phase 形成", () => {
  const fixtures = [
    [{ ...BASE_STATE, mood: "calm" }, "water", "accept", HEART_PHASE_COMPLETION.COMPLETED],
    [{ ...BASE_STATE, mood: "defensive" }, "water", "modify", HEART_PHASE_COMPLETION.AWAITING_REWRITE],
    [{ ...BASE_STATE, energy: 2 }, "quiet-ground", "rest", HEART_PHASE_COMPLETION.ZERO_EVIDENCE],
    [{ ...BASE_STATE, mood: "defensive" }, "crystal", "decline", HEART_PHASE_COMPLETION.ZERO_EVIDENCE]
  ];

  for (const [state, hotspotType, outcomeId, completionStatus] of fixtures) {
    const output = deriveHabitatPracticeInvitation({ state, environment: { chapterNo: 3 }, hotspotType });
    assert.equal(output.ok, true);
    assert.equal(output.invitation.outcomeId, outcomeId);
    assert.equal(output.invitation.completionStatus, completionStatus);
    assert.equal(
      isCanonicalHeartPhaseResult(output.invitation.heartPhaseResult, "greyshade-cat"),
      true
    );
  }
});

runCase("modify 在玩家第二次明示前保持 awaiting_rewrite", () => {
  const state = { ...BASE_STATE, mood: "defensive" };
  const invitation = invite(state, "water");
  const projected = projectHabitatPracticeResult({ state, invitation });
  assert.equal(projected.ok, true);
  assert.equal(projected.result.outcomeId, "modify");
  assert.equal(projected.result.completionStatus, HEART_PHASE_COMPLETION.AWAITING_REWRITE);
  assert.equal(projected.result.completed, false);
  assert.equal(projected.result.rewriteDecision, null);
});

runCase("玩家明示接受 companion rewrite 後才完成", () => {
  const state = { ...BASE_STATE, mood: "defensive" };
  const invitation = invite(state, "water");
  const projected = projectHabitatPracticeResult({ state, invitation, rewriteDecision: "accept" });
  assert.equal(projected.ok, true);
  assert.equal(projected.result.completionStatus, HEART_PHASE_COMPLETION.COMPLETED);
  assert.equal(projected.result.completed, true);
  assert.equal(projected.result.rewriteDecision, "accept");
  assert.equal(projected.result.resolutionResponseKey, "growth.session.response.rewriteAccepted");
  assert.equal(isCanonicalHeartPhaseResult(projected.result.heartPhaseResult, "greyshade-cat"), true);
});

runCase("延後 companion rewrite 是 canonical deferred 零完成", () => {
  const state = { ...BASE_STATE, mood: "defensive" };
  const invitation = invite(state, "water");
  const projected = projectHabitatPracticeResult({ state, invitation, rewriteDecision: "defer" });
  assert.equal(projected.ok, true);
  assert.equal(projected.result.completionStatus, HEART_PHASE_COMPLETION.DEFERRED);
  assert.equal(projected.result.completed, false);
  assert.equal(projected.result.rewriteDecision, "defer");
  assert.equal(projected.result.resolutionResponseKey, "growth.session.response.rewriteDeferred");
});

runCase("accept／rest／decline projection 不被改寫成其他 outcome", () => {
  const fixtures = [
    [BASE_STATE, "water", "accept", true],
    [{ ...BASE_STATE, energy: 2 }, "quiet-ground", "rest", false],
    [{ ...BASE_STATE, mood: "defensive" }, "crystal", "decline", false]
  ];
  for (const [state, hotspotType, outcomeId, completed] of fixtures) {
    const projected = projectHabitatPracticeResult({ state, invitation: invite(state, hotspotType) });
    assert.equal(projected.ok, true);
    assert.equal(projected.result.outcomeId, outcomeId);
    assert.equal(projected.result.completed, completed);
  }
});

runCase("非 modify outcome 拒絕額外 rewrite decision", () => {
  const invitation = invite(BASE_STATE, "water");
  const projected = projectHabitatPracticeResult({
    state: BASE_STATE,
    invitation,
    rewriteDecision: "accept"
  });
  assert.equal(projected.ok, false);
  assert.equal(projected.reason, "unexpected-rewrite-decision");
  assert.equal(projected.result, null);
});

runCase("safeHarbor rhythm fail closed 且無回應變體", () => {
  const safeState = { ...BASE_STATE, safeHarborMode: true };
  const rhythm = deriveHabitatRhythm({ state: safeState, environment: { timePhase: "night", weather: "rain" } });
  assert.equal(rhythm.safetyPaused, true);
  assert.equal(rhythm.bodyCueId, null);
  assert.deepEqual(rhythm.availableAffordanceIds, []);
  assert.equal(rhythm.roamingPolicyId, "safety_paused");

  const invitation = deriveHabitatPracticeInvitation({ state: safeState, hotspotType: "water" });
  assert.equal(invitation.ok, false);
  assert.equal(invitation.reason, "safety-paused");
  assert.equal(invitation.invitation, null);
});

runCase("pending invitation 遇到 safeHarbor 不可復活或完成", () => {
  const state = { ...BASE_STATE, mood: "defensive" };
  const invitation = invite(state, "water");
  const safeState = { ...state, safeHarborMode: true };
  const projected = projectHabitatPracticeResult({
    state: safeState,
    invitation,
    rewriteDecision: "accept"
  });
  assert.equal(projected.ok, false);
  assert.equal(projected.reason, "safety-paused");
  assert.equal(projected.result, null);
});

runCase("日夜與天氣只改 presentation／visible affordance／roaming", () => {
  const day = deriveHabitatRhythm({
    state: BASE_STATE,
    environment: { timePhase: "day", weather: "clear" }
  });
  const nightRain = deriveHabitatRhythm({
    state: BASE_STATE,
    environment: { timePhase: "night", weather: "rain" }
  });
  assert.equal(day.phaseId, nightRain.phaseId);
  assert.equal(day.bodyCueId, nightRain.bodyCueId);
  assert.notDeepEqual(day.presentation, nightRain.presentation);
  assert.notDeepEqual(day.availableAffordanceIds, nightRain.availableAffordanceIds);
  assert.notEqual(day.roamingPolicyId, nightRain.roamingPolicyId);
  assertNoPermanentOrPowerFields(day);
  assertNoPermanentOrPowerFields(nightRain);

  const dayInvite = deriveHabitatPracticeInvitation({ state: BASE_STATE, environment: { timePhase: "day" }, hotspotType: "water" });
  const nightInvite = deriveHabitatPracticeInvitation({ state: BASE_STATE, environment: { timePhase: "night", weather: "rain" }, hotspotType: "water" });
  assert.equal(dayInvite.invitation.outcomeId, nightInvite.invitation.outcomeId);
  assert.deepEqual(dayInvite.invitation.heartPhaseResult, nightInvite.invitation.heartPhaseResult);
});

runCase("time／weather alias 僅正規化 presentation", () => {
  const rhythm = deriveHabitatRhythm({
    state: BASE_STATE,
    environment: { timePhase: "evening", weather: "foggy" }
  });
  assert.equal(rhythm.presentation.timePhaseId, "dusk");
  assert.equal(rhythm.presentation.weatherId, "mist");
  assert.equal(rhythm.presentation.ambienceId, "moonlake.dusk.mist");
});

runCase("四 hotspot 在同章共用唯一 care group root", () => {
  const roots = Object.keys(EXPECTED_HOTSPOTS).map((hotspotType) => (
    deriveHabitatPracticeInvitation({
      state: BASE_STATE,
      environment: { chapterNo: 3 },
      hotspotType
    }).invitation.careRootKey
  ));
  assert.deepEqual([...new Set(roots)], ["care:3:heart_phase_practice"]);

  const hotspotTypes = Object.keys(EXPECTED_HOTSPOTS);
  const replayRoots = Array.from({ length: 50 }, (_, index) => (
    deriveHabitatPracticeInvitation({
      state: BASE_STATE,
      environment: {
        chapterNo: 3,
        timePhase: index % 2 ? "night" : "day",
        weather: index % 3 ? "clear" : "rain"
      },
      hotspotType: hotspotTypes[index % hotspotTypes.length]
    }).invitation.careRootKey
  ));
  assert.deepEqual([...new Set(replayRoots)], ["care:3:heart_phase_practice"]);

  assert.equal(deriveHabitatCareRootKey({ state: BASE_STATE }), "care:3:heart_phase_practice");
  assert.equal(deriveHabitatCareRootKey({ state: BASE_STATE, chapterNo: 4 }), "care:4:heart_phase_practice");
});

runCase("非法章節不建立 care root", () => {
  assert.equal(deriveHabitatCareRootKey({ state: {}, chapterNo: 0 }), null);
  assert.equal(deriveHabitatCareRootKey({ state: {}, chapterNo: 8 }), null);
  assert.equal(deriveHabitatCareRootKey({ state: {}, chapterNo: "unknown" }), null);
});

runCase("未知 hotspot fail closed", () => {
  const output = deriveHabitatPracticeInvitation({ state: BASE_STATE, hotspotType: "training-machine" });
  assert.equal(output.ok, false);
  assert.equal(output.reason, "unknown-hotspot");
  assert.equal(output.invitation, null);
});

runCase("result projection 拒絕偽造 mapping 與 owner mismatch", () => {
  const invitation = invite(BASE_STATE, "water");
  const forged = { ...invitation, waypointId: "reward_room" };
  assert.equal(projectHabitatPracticeResult({ state: BASE_STATE, invitation: forged }).reason, "invalid-invitation");

  const guardedState = { ...BASE_STATE, mood: "defensive" };
  const guardedWater = invite(guardedState, "water");
  const otherPractice = invite(guardedState, "quiet-ground");
  const forgedSession = {
    ...guardedWater,
    heartPhaseSession: otherPractice.heartPhaseSession
  };
  assert.equal(
    projectHabitatPracticeResult({ state: guardedState, invitation: forgedSession }).reason,
    "invalid-invitation"
  );

  const otherOwnerState = { ...BASE_STATE, activeCompanionId: "sprigfawn" };
  assert.equal(
    projectHabitatPracticeResult({ state: otherOwnerState, invitation }).reason,
    "invalid-invitation"
  );
});

runCase("derive／invite／project 對輸入零 mutation、輸出零永久 delta", () => {
  const mutableState = {
    ...BASE_STATE,
    mood: "defensive",
    chapterProgress: { current: 5 },
    relationship: { trust: 77 },
    growth: { stageId: "initial_awakened" }
  };
  const environment = {
    timePhase: "night",
    weather: "mist",
    chapterNo: 5,
    hotspot: { id: "waterfall-pool-left", type: "water" }
  };
  const beforeState = structuredClone(mutableState);
  const beforeEnvironment = structuredClone(environment);
  deepFreeze(mutableState);
  deepFreeze(environment);

  const rhythm = deriveHabitatRhythm({ state: mutableState, environment });
  const invitationOutput = deriveHabitatPracticeInvitation({ state: mutableState, environment });
  const projected = projectHabitatPracticeResult({
    state: mutableState,
    invitation: invitationOutput.invitation,
    rewriteDecision: "accept"
  });

  assert.deepEqual(mutableState, beforeState);
  assert.deepEqual(environment, beforeEnvironment);
  assertNoPermanentOrPowerFields(rhythm);
  assertNoPermanentOrPowerFields(invitationOutput);
  assertNoPermanentOrPowerFields(projected);
  assert.equal(invitationOutput.invitation.hotspotId, "waterfall-pool-left");
  assert.equal(projected.result.sessionOnly, true);
});

const failed = cases.filter((entry) => !entry.ok);
for (const entry of cases) {
  console.log(`${entry.ok ? "PASS" : "FAIL"}  ${entry.name}`);
  if (!entry.ok) console.error(`      ${entry.error?.stack || entry.error}`);
}
console.log(`\n${cases.length - failed.length}/${cases.length} cases passed`);
if (failed.length) process.exitCode = 1;

function invite(state, hotspotType) {
  const output = deriveHabitatPracticeInvitation({
    state,
    environment: { chapterNo: state.chapterProgress?.current || 3 },
    hotspotType
  });
  assert.equal(output.ok, true);
  return output.invitation;
}

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error });
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function assertNoPermanentOrPowerFields(value) {
  const forbidden = new Set([
    "statePatch",
    "savePatch",
    "reward",
    "rewards",
    "bond",
    "trust",
    "energy",
    "defense",
    "power",
    "stats",
    "growth",
    "evidence",
    "memory",
    "trace"
  ]);
  walk(value, (key) => {
    assert.equal(forbidden.has(key), false, `forbidden output key: ${key}`);
  });
}

function walk(value, visit) {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    visit(key, nested);
    walk(nested, visit);
  }
}
