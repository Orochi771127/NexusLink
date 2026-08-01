/**
 * Heartcore Orbit V3 pre-session / post-session RaphaelCore bridge cases.
 * Run: node docs/qa/orbit-v3-companion-bridge-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const fromRepo = (relativePath) =>
  pathToFileURL(path.join(repoRoot, relativePath)).href;

const {
  ORBIT_COMPANION_BRIDGE_STATUS,
  createOrbitSettlementEnvelope,
  prepareOrbitCompanionEntry,
  prepareOrbitSettlementReflection,
  projectOrbitCoreState
} = await import(fromRepo("src/orbit/orbitCompanionBridge.js"));
const {
  clearAllDialogueStates,
  getDialogueState
} = await import(fromRepo("src/ai/dialogue/dialogueStateTracker.js"));
const {
  clearSessionPreferenceProfiles
} = await import(fromRepo("src/ai/companionPreferenceProfile.js"));
const {
  clearSessionTraces,
  getSessionTraces
} = await import(fromRepo("src/ai/evolution/interactionTraceCollector.js"));
const {
  confirmOrbitAttunement,
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession
} = await import(fromRepo("src/orbit/orbitEngine.js"));
const { createOrbitAttunementSnapshot } = await import(
  fromRepo("src/orbit/orbitAttunement.js")
);
const { MOONLAKE_CAMP_SLICE } = await import(
  fromRepo("src/data/orbit/stages/index.js")
);
const { ORBIT_PHYSICS_MODELS } = await import(
  fromRepo("src/orbit/orbitPhysics.js")
);
const { getCompanionById } = await import(
  fromRepo("src/data/companionRegistry.js")
);

const companion = getCompanionById("thunder-pup");
const state = Object.freeze({
  activeCompanionId: "thunder-pup",
  mood: "calm",
  energy: 10,
  trust: 42,
  bond: 28,
  defense: 12,
  touchFatigue: 0,
  spamScore: 0,
  safeHarborMode: false,
  chatHistory: [{ role: "player", text: "PRIVATE_PLAYER_TEXT" }],
  emotionalMemories: [{ excerpt: "PRIVATE_MEMORY" }],
  habitatTraces: [{ text: "PRIVATE_TRACE" }],
  companionAnchors: [{ detail: "PRIVATE_ANCHOR" }]
});

const attunement = createOrbitAttunementSnapshot(state, {
  defaultStanceId: MOONLAKE_CAMP_SLICE.defaultLaunchStanceId,
  ...MOONLAKE_CAMP_SLICE.attunement
});

function ok(name) {
  console.log(`PASS  ${name}`);
}

function fakeCoreResult({
  reaction = "acknowledge",
  reply = "我願意。先照我們都看得見的軌道走。",
  highRisk = false,
  extra = {}
} = {}) {
  return {
    invocation: {
      surface: "orbit_test",
      readOnly: true,
      simulationAuthority: false,
      stateWriteApplied: false,
      memoryWriteApplied: false
    },
    plan: { mode: reaction },
    safety: { isHighRisk: highRisk },
    output: {
      reply,
      replyRole: highRisk ? "system" : "companion",
      shouldSpeak: true
    },
    reply,
    forbiddenPhraseDetected: false,
    stateMutation: { statePatch: { energy: 0 } },
    memoryDecision: { shouldWrite: true, memoryObject: { text: "blocked" } },
    traceDecision: { shouldApplyTrace: true },
    anchorDecision: { shouldWrite: true },
    ...extra
  };
}

let capturedEntry = null;
const willing = await prepareOrbitCompanionEntry({
  state,
  companion,
  attunement,
  now: 1_800_000_000_000,
  invokeCore(input, projectedState, runtime) {
    capturedEntry = { input, projectedState, runtime };
    return fakeCoreResult();
  }
});
assert.equal(willing.willing, true);
assert.equal(willing.status, "willing");
assert.equal(willing.source, "raphael_core_read_only");
assert.equal(capturedEntry.runtime.readOnly, true);
assert.equal(capturedEntry.runtime.surface, "orbit_entry");
assert.deepEqual(capturedEntry.projectedState.chatHistory, []);
assert.deepEqual(capturedEntry.projectedState.emotionalMemories, []);
assert.deepEqual(capturedEntry.projectedState.habitatTraces, []);
assert.deepEqual(capturedEntry.projectedState.companionAnchors, []);
assert.ok(!JSON.stringify(capturedEntry).includes("PRIVATE_"));
assert.equal(willing.authority.simulationAuthority, "orbitEngine");
assert.equal(willing.authority.coreInSimulationLoop, false);
ok("entry willingness uses a read-only private-memory-free Core projection");

const declined = await prepareOrbitCompanionEntry({
  state,
  companion,
  attunement,
  invokeCore: () => fakeCoreResult({ reaction: "reject", reply: "今天先不要。" })
});
assert.equal(declined.willing, false);
assert.equal(declined.status, "core_declined");
assert.equal(declined.decision, "refuse");
assert.equal(declined.line, "今天先不要。");
ok("RaphaelCore may refuse entry but cannot secretly rewrite a launched session");

const restingAttunement = createOrbitAttunementSnapshot(
  { ...state, energy: 1 },
  {
    defaultStanceId: MOONLAKE_CAMP_SLICE.defaultLaunchStanceId,
    ...MOONLAKE_CAMP_SLICE.attunement
  }
);
const cannotPromoteRest = await prepareOrbitCompanionEntry({
  state: { ...state, energy: 1 },
  companion,
  attunement: restingAttunement,
  invokeCore: () => fakeCoreResult({ reaction: "acknowledge" })
});
assert.equal(cannotPromoteRest.willing, false);
assert.equal(cannotPromoteRest.decision, "rest");
assert.match(cannotPromoteRest.status, /deterministic_rest/);
ok("Core cannot promote a deterministic rest or safety refusal into entry");

const unavailable = await prepareOrbitCompanionEntry({
  state,
  companion,
  attunement,
  timeoutMs: 20,
  invokeCore: () => new Promise(() => {})
});
assert.equal(unavailable.willing, false);
assert.equal(unavailable.status, "core_unavailable");
assert.equal(unavailable.source, "fail_closed");
ok("entry timeout fails closed with a non-punitive no-session result");

const resolvedSession = Object.freeze({
  stageId: MOONLAKE_CAMP_SLICE.id,
  prototypeSlice: true,
  progressEligible: false,
  companionLine: "有一點光被我們留住了。我想記得這個。",
  outcome: Object.freeze({
    key: "recovered",
    reason: "camp_resonated",
    title: "營火共鳴",
    summary: "三點記憶回來了。"
  }),
  confirmedLaunchPlan: Object.freeze({ secretPhysics: "DO_NOT_SHARE" }),
  player: Object.freeze({ x: 0.1, y: 0.2 }),
  sessionTrace: "NO_PLAYER_TEXT"
});
const envelope = createOrbitSettlementEnvelope(resolvedSession);
assert.deepEqual(Object.keys(envelope), [
  "schemaVersion",
  "stageId",
  "outcomeKey",
  "outcomeReason",
  "retreated",
  "prototypeSlice",
  "progressEligible",
  "simulationAuthority"
]);
assert.ok(!JSON.stringify(envelope).includes("secretPhysics"));
assert.ok(!JSON.stringify(envelope).includes("player"));
assert.ok(!JSON.stringify(envelope).includes("sessionTrace"));
ok("post-session envelope exposes outcome facts but no bodies, plan, replay, or player text");

const sessionBeforeReflection = structuredClone(resolvedSession);
let capturedSettlement = null;
const reflected = await prepareOrbitSettlementReflection({
  state,
  companion,
  session: resolvedSession,
  invokeCore(input, projectedState, runtime) {
    capturedSettlement = { input, projectedState, runtime };
    return fakeCoreResult({
      reply: "那點光有接住。現在先讓它安靜一會兒。",
      extra: {
        outcome: { key: "hacked" },
        replay: { winner: "core" },
        physics: { speed: 999 }
      }
    });
  }
});
assert.equal(reflected.status, "reflected");
assert.equal(reflected.line, "那點光有接住。現在先讓它安靜一會兒。");
assert.equal(reflected.envelope.outcomeKey, "recovered");
assert.equal(capturedSettlement.runtime.surface, "orbit_settlement");
assert.deepEqual(resolvedSession, sessionBeforeReflection);
assert.equal("outcome" in reflected, false);
assert.equal("replay" in reflected, false);
assert.equal("physics" in reflected, false);
ok("settlement response is presentation-only and cannot alter outcome or replay truth");

const fallback = await prepareOrbitSettlementReflection({
  state,
  companion,
  session: resolvedSession,
  invokeCore: () => {
    throw new Error("offline");
  }
});
assert.equal(fallback.status, "core_unavailable");
assert.equal(fallback.source, "deterministic_fallback");
assert.equal(fallback.line, resolvedSession.companionLine);
ok("post-session Core failure keeps the deterministic safe companion line");

clearAllDialogueStates();
clearSessionPreferenceProfiles();
clearSessionTraces();
const actualStateBefore = structuredClone(state);
const actualCoreEntry = await prepareOrbitCompanionEntry({
  state,
  companion,
  attunement,
  now: 1_800_000_000_000
});
assert.equal(actualCoreEntry.willing, true);
assert.equal(getSessionTraces().length, 0);
assert.equal(getDialogueState("thunder-pup").recentTurns.length, 0);
assert.deepEqual(state, actualStateBefore);
clearAllDialogueStates();
clearSessionPreferenceProfiles();
ok("the real RaphaelCore read-only path leaves state, dialogue turns, and traces untouched");

function createReplaySession() {
  return createOrbitSession({
    stats: {
      impact: 38,
      spin: 42,
      guard: 46,
      burst: 18,
      overheat: 0,
      canLaunch: true
    },
    stage: MOONLAKE_CAMP_SLICE,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    prototypeSlice: true,
    nonPersistent: true,
    attunement
  });
}

function replaySnapshot(hz) {
  let replay = createReplaySession();
  replay = confirmOrbitAttunement(replay);
  replay = launchOrbitSession(replay, -0.46, 0.18);
  for (let frame = 0; frame < hz * 2; frame += 1) {
    replay = stepOrbitSession(replay, 1 / hz);
  }
  return {
    phase: replay.phase,
    elapsed: replay.elapsed,
    objectiveIndex: replay.objectiveIndex,
    nextMemoryMoteIndex: replay.nextMemoryMoteIndex,
    boundaryChargesRemaining: replay.boundaryChargesRemaining,
    player: replay.player,
    outcome: replay.outcome
  };
}

const replay30 = replaySnapshot(30);
const replay60 = replaySnapshot(60);
const replay120 = replaySnapshot(120);
assert.deepEqual(replay30, replay60);
assert.deepEqual(replay60, replay120);
assert.deepEqual(ORBIT_COMPANION_BRIDGE_STATUS.participation, [
  "pre_session_willingness",
  "post_session_reflection"
]);
assert.equal(ORBIT_COMPANION_BRIDGE_STATUS.coreMayChangeOutcome, false);
assert.equal(ORBIT_COMPANION_BRIDGE_STATUS.coreMayWriteReplay, false);
assert.deepEqual(projectOrbitCoreState(state, companion.id).chatHistory, []);
ok("fixed-step replay remains exact at 30/60/120 Hz and outside Core authority");

console.log("\nAll Heartcore Orbit V3 companion bridge cases passed.");
