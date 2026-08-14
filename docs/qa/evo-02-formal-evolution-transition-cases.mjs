/**
 * EVO-02 — Pure formal evolution transition engine.
 *
 * 這份測試只驗純函式。沒有 save、store 發布、UI、Pixi 或 runtime flags。
 */

import { createDefaultState } from "../../src/state/store.js";
import { createDefaultGrowthState } from "../../src/state/companionStateSchema.js";
import {
  createCompletedGrowthEvent,
  evaluateCompanionGrowthReadiness,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";
import {
  FORMAL_EVOLUTION_COMPANION_IDS,
  FORMAL_EVOLUTION_COMPANION_ID_SET,
  FORMAL_EVOLUTION_EXACT_NEXT,
  createFormalEvolutionOfferToken,
  decideFormalEvolutionTransition,
  parseFormalEvolutionOfferToken
} from "../../src/engine/companionFormalEvolutionTransitionEngine.js";

const COMPANION_ID = "greyshade-cat";
const OTHER_ID = "auriowl";
const BASE_TIME = 1785542400000;
const PROFILE = {
  minimumChapterByStage: {
    resonant_mature: 2,
    final_awakened: 5
  }
};
const cases = [];

await runCase("offer requires companion-led readiness and willingness", () => {
  const ready = seedReadyGrowth();
  const blocked = decide(ready.growth, { action: "offer", chapterNo: 1 });
  assertEqual(blocked.ok, false, "chapter gate blocks offer");
  assertEqual(blocked.changed, false, "blocked offer unchanged");
  assertEqual(ready.growth.offeredStage, null, "input growth not mutated");

  const offered = decide(ready.growth, { action: "offer" });
  assertEqual(offered.ok, true, "lawful offer");
  assertEqual(offered.persistRequested, false, "offer does not persist");
  assertEqual(offered.rendererIntent, null, "offer has no renderer intent");
  assertEqual(offered.candidateGrowth.offeredStage, "resonant_mature", "exact next offered");
  assertEqual(offered.candidateGrowth.stage, "initial_awakened", "offer does not advance stage");
  assertEqual(
    offered.offer.token,
    createFormalEvolutionOfferToken({
      companionId: COMPANION_ID,
      currentStage: "initial_awakened",
      targetStage: "resonant_mature",
      generation: "gen-1"
    }),
    "token binding"
  );
});

await runCase("exact-next-stage matrix rejects skip reverse and unknown", () => {
  const ready = seedReadyGrowth();
  const skip = decide(ready.growth, { action: "offer", targetStage: "final_awakened" });
  assertEqual(skip.reason, "exact_next_stage_only", "no skip to final");

  const reverse = decide(ready.growth, { action: "offer", targetStage: "initial_awakened" });
  assertEqual(reverse.reason, "exact_next_stage_only", "no reverse");

  const unknown = decide({ ...ready.growth, stage: "unknown_stage" }, { action: "offer" });
  assertEqual(unknown.reason, "unknown_stage", "unknown stage");

  const offered = decide(ready.growth, { action: "offer" });
  const accepted = decide(offered.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    at: BASE_TIME + 20
  });
  assertEqual(accepted.candidateGrowth.stage, "resonant_mature", "first hop");
  assertEqual(accepted.candidateGrowth.coverage.targetStage, "final_awakened", "next window");

  const finalReady = seedReadyGrowth({
    stage: "resonant_mature",
    chapterNo: 6,
    families: 4
  });
  const secondOffer = decide(finalReady.growth, {
    action: "offer",
    chapterNo: 6,
    generation: "gen-2"
  });
  const secondAccept = decide(secondOffer.candidateGrowth, {
    action: "accept",
    offerToken: secondOffer.offer.token,
    generation: "gen-2",
    chapterNo: 6,
    at: BASE_TIME + 30
  });
  assertEqual(secondAccept.candidateGrowth.stage, "final_awakened", "second hop");
  assertEqual(secondAccept.candidateGrowth.coverage.targetStage, null, "no further target");

  const again = decide(secondAccept.candidateGrowth, {
    action: "offer",
    chapterNo: 6,
    generation: "gen-3"
  });
  assertEqual(again.reason, "final_stage_complete", "no advance past final");
});

await runCase("11 companion ownership matrix rejects cross-companion tokens", () => {
  assertEqual(FORMAL_EVOLUTION_COMPANION_IDS.length, 11, "formal roster size");
  for (const companionId of FORMAL_EVOLUTION_COMPANION_IDS) {
    const ready = seedReadyGrowth({ companionId });
    const offered = decide(ready.growth, { action: "offer", companionId });
    assertEqual(offered.ok, true, `${companionId} can offer`);
    const thief = FORMAL_EVOLUTION_COMPANION_IDS.find((id) => id !== companionId);
    const stolen = decide(offered.candidateGrowth, {
      action: "accept",
      companionId: thief,
      offerToken: offered.offer.token
    });
    assertEqual(stolen.ok, false, `${thief} cannot consume ${companionId}`);
    assertEqual(stolen.reason, "companion_mismatch", `${companionId} mismatch reason`);
    assertEqual(stolen.candidateGrowth.stage, "initial_awakened", `${companionId} stage held`);
  }
});

await runCase("stale token matrix rejects generation stage and consumed tokens", () => {
  const ready = seedReadyGrowth();
  const first = decide(ready.growth, { action: "offer", generation: "gen-1" });
  const staleGen = decide(first.candidateGrowth, {
    action: "accept",
    offerToken: createFormalEvolutionOfferToken({
      companionId: COMPANION_ID,
      currentStage: "initial_awakened",
      targetStage: "resonant_mature",
      generation: "gen-2"
    })
  });
  assertEqual(staleGen.reason, "stale_offer", "wrong generation");

  const deferred = decide(first.candidateGrowth, { action: "defer", at: BASE_TIME + 15 });
  const afterDefer = decide(deferred.candidateGrowth, {
    action: "accept",
    offerToken: first.offer.token
  });
  assertEqual(afterDefer.reason, "stale_offer", "deferred token is stale");

  const reoffer = decide(deferred.candidateGrowth, {
    action: "offer",
    generation: "gen-2",
    at: BASE_TIME + 16,
    willingnessContext: willingContext({
      reevaluation: recoveryReevaluation(deferred.candidateGrowth, BASE_TIME + 16)
    })
  });
  assertEqual(reoffer.ok, true, "lawful re-offer after new context");
  assertEqual(reoffer.offer.generation, "gen-2", "new generation");
  assertEqual(reoffer.offer.token === first.offer.token, false, "new token");
});

await runCase("duplicate accept twenty times does not add stage audit or intent", () => {
  const ready = seedReadyGrowth();
  const offered = decide(ready.growth, { action: "offer" });
  let latest = decide(offered.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    at: BASE_TIME + 20
  });
  assertEqual(latest.ok, true, "first accept");
  assertEqual(latest.candidateGrowth.stage, "resonant_mature", "one hop");
  assertEqual(latest.rendererIntent, null, "no renderer");
  const firstJson = JSON.stringify(latest.candidateGrowth);
  const firstTransition = JSON.stringify(latest.candidateTransition);

  for (let index = 0; index < 20; index += 1) {
    latest = decide(latest.candidateGrowth, {
      action: "accept",
      offerToken: offered.offer.token,
      at: BASE_TIME + 21 + index
    });
    assertEqual(latest.ok, true, `repeat ${index} accepted flag`);
    assertEqual(latest.changed, false, `repeat ${index} unchanged`);
    assertEqual(latest.candidateGrowth.stage, "resonant_mature", `repeat ${index} stage`);
    assertEqual(latest.rendererIntent, null, `repeat ${index} intent`);
    assertEqual(JSON.stringify(latest.candidateGrowth), firstJson, `repeat ${index} growth`);
    assertEqual(latest.candidateTransition, null, `repeat ${index} no extra transition`);
  }
  assertEqual(firstTransition.includes("resonant_mature"), true, "first transition recorded once");
});

await runCase("defer is no-penalty and writes no FOMO fields", () => {
  const state = seedReadyState();
  const offered = decide(state.growth, {
    action: "offer",
    state: state.state
  });
  const before = snapshot(offered.candidateState, COMPANION_ID);
  const deferred = decide(offered.candidateGrowth, {
    action: "defer",
    state: offered.candidateState,
    at: BASE_TIME + 15
  });
  assertEqual(deferred.ok, true, "defer ok");
  const after = snapshot(deferred.candidateState, COMPANION_ID);
  assertDeepEqual(after.relationship, before.relationship, "defer relationship");
  assertEqual(after.stage, before.stage, "defer stage");
  assertDeepEqual(after.evidence, before.evidence, "defer evidence");
  assertEqual(deferred.candidateGrowth.offeredStage, null, "offer cleared");
  assertEqual(deferred.candidateGrowth.deferredAt, BASE_TIME + 15, "defer provenance");
  assertEqual(Object.prototype.hasOwnProperty.call(deferred.candidateGrowth, "missed"), false, "no missed");
  assertEqual(Object.prototype.hasOwnProperty.call(deferred.candidateGrowth, "deadline"), false, "no deadline");
  assertEqual(JSON.stringify(deferred.candidateGrowth).includes("fomo"), false, "no fomo");
});

await runCase("rewrite stays pending until a second explicit accept", () => {
  const ready = seedReadyGrowth();
  const offered = decide(ready.growth, { action: "offer" });
  const rewritten = decide(offered.candidateGrowth, { action: "rewrite", at: BASE_TIME + 12 });
  assertEqual(rewritten.ok, true, "rewrite pending");
  assertEqual(rewritten.candidateGrowth.stage, "initial_awakened", "no stage mutation");
  assertDeepEqual(rewritten.candidateGrowth.evidence, offered.candidateGrowth.evidence, "no evidence");
  assertEqual(rewritten.candidateGrowth.formalOffer.rewritePending, true, "pending flag");

  const blocked = decide(rewritten.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    at: BASE_TIME + 13
  });
  assertEqual(blocked.reason, "rewrite_pending_unaccepted", "first accept blocked");
  assertEqual(blocked.candidateGrowth.stage, "initial_awakened", "still no hop");

  const accepted = decide(rewritten.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    rewriteAccepted: true,
    at: BASE_TIME + 14
  });
  assertEqual(accepted.candidateGrowth.stage, "resonant_mature", "second accept hops");
});

await runCase("safeHarbor and high-risk leave growth deep-equal", () => {
  const ready = seedReadyGrowth();
  const offered = decide(ready.growth, { action: "offer" });
  const before = JSON.stringify(offered.candidateGrowth);

  const harborState = {
    safeHarborMode: true,
    companionStates: {
      byId: {
        [COMPANION_ID]: { growth: offered.candidateGrowth }
      }
    }
  };
  const harbor = decide(offered.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    state: harborState,
    at: BASE_TIME + 20
  });
  assertEqual(harbor.reason, "safe_harbor_terminal", "harbor reason");
  assertEqual(JSON.stringify(harbor.candidateGrowth), before, "harbor growth");

  const highRisk = decide(offered.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    safetyFacts: { ...safeFacts(), isHighRisk: true },
    at: BASE_TIME + 20
  });
  assertEqual(highRisk.reason, "safety_excluded", "high-risk reason");
  assertEqual(JSON.stringify(highRisk.candidateGrowth), before, "high-risk growth");

  const systemReply = decide(offered.candidateGrowth, {
    action: "offer",
    safetyFacts: { ...safeFacts(), systemRoleSafetyReply: true }
  });
  assertEqual(systemReply.reason, "safety_excluded", "system safety reply");
});

await runCase("legacy unverifiable provenance and unknown ids fail closed", () => {
  const ready = seedReadyGrowth();
  const missing = decide(ready.growth, { action: "offer", safetyFacts: null });
  assertEqual(missing.reason, "legacy_provenance_unverifiable", "missing safety");

  const unknownCompanion = decide(ready.growth, {
    action: "offer",
    companionId: "not-a-companion"
  });
  assertEqual(unknownCompanion.reason, "not_formal_evolution_companion", "unknown companion");

  const force = decide(ready.growth, { action: "offer", forceEvolve: true });
  assertEqual(force.reason, "force_evolve_forbidden", "no force evolve");
});

await runCase("accept returns a candidate only and never requests persist or renderer", () => {
  const state = seedReadyState();
  const offered = decide(state.growth, { action: "offer", state: state.state });
  const accepted = decide(offered.candidateGrowth, {
    action: "accept",
    offerToken: offered.offer.token,
    state: offered.candidateState,
    at: BASE_TIME + 20
  });
  assertEqual(accepted.ok, true, "accept ok");
  assertEqual(accepted.persistRequested, false, "no persist");
  assertEqual(accepted.rendererIntent, null, "no renderer");
  assertEqual(accepted.candidateState.companionStates.byId[COMPANION_ID].growth.stage, "resonant_mature", "candidate stage");
  assertEqual(state.state.companionStates.byId[COMPANION_ID].growth.stage, "initial_awakened", "input state unchanged");
  assertEqual(state.growth.stage, "initial_awakened", "input growth unchanged");
});

await runCase("pure functions are deterministic without clock or random", () => {
  const ready = seedReadyGrowth();
  const first = decide(ready.growth, { action: "offer" });
  const second = decide(JSON.parse(JSON.stringify(ready.growth)), { action: "offer" });
  assertDeepEqual(second, first, "deterministic offer");
  const source = JSON.stringify(ready.growth);
  decide(ready.growth, { action: "offer" });
  assertEqual(JSON.stringify(ready.growth), source, "no input mutation");
});

await runCase("exact next table only contains the two lawful hops", () => {
  assertDeepEqual(FORMAL_EVOLUTION_EXACT_NEXT, {
    initial_awakened: "resonant_mature",
    resonant_mature: "final_awakened",
    final_awakened: null
  }, "exact next table");
});

await runCase("test carriers and roadmap ids cannot receive a formal evolution token", () => {
  assertEqual(FORMAL_EVOLUTION_COMPANION_ID_SET.size, 11, "set size");
  const rejected = [
    "flame-flicker",
    "ice-talon",
    "stone-shard",
    "vine-twist",
    "crystal-rabbit",
    "star-energy-boarlet"
  ];
  for (const companionId of rejected) {
    assertEqual(FORMAL_EVOLUTION_COMPANION_ID_SET.has(companionId), false, `${companionId} not in set`);
    assertEqual(createFormalEvolutionOfferToken({
      companionId,
      currentStage: "initial_awakened",
      targetStage: "resonant_mature",
      generation: "gen-1"
    }), null, `${companionId} token`);
    assertEqual(parseFormalEvolutionOfferToken(
      `fev1:${companionId}:initial_awakened:resonant_mature:gen-1`
    ), null, `${companionId} parse`);
    const decided = decide(seedReadyGrowth().growth, { action: "offer", companionId });
    assertEqual(decided.reason, "not_formal_evolution_companion", `${companionId} decide`);
  }
});

await runCase("unissued token at target stage is stale, not already accepted", () => {
  const ready = seedReadyGrowth({ stage: "resonant_mature", chapterNo: 6, families: 4 });
  const forged = createFormalEvolutionOfferToken({
    companionId: COMPANION_ID,
    currentStage: "initial_awakened",
    targetStage: "resonant_mature",
    generation: "never-issued"
  });
  const result = decide(ready.growth, {
    action: "accept",
    offerToken: forged,
    chapterNo: 6,
    at: BASE_TIME + 20
  });
  assertEqual(result.ok, false, "unissued reject");
  assertEqual(result.reason, "stale_offer", "unissued reason");
  assertEqual(result.changed, false, "unissued unchanged");
  assertEqual(result.candidateGrowth.stage, "resonant_mature", "stage stays");
});

await runCase("provided state must own the same growth or fail closed", () => {
  const ready = seedReadyState();
  const detached = decide(ready.growth, {
    action: "offer",
    state: { companionStates: { byId: {} } }
  });
  assertEqual(detached.reason, "growth_state_mismatch", "missing companion state");

  const other = seedReadyGrowth({ companionId: OTHER_ID });
  const crossed = decide(ready.growth, {
    action: "offer",
    state: {
      companionStates: {
        byId: {
          [OTHER_ID]: { growth: other.growth }
        }
      }
    }
  });
  assertEqual(crossed.reason, "growth_state_mismatch", "cross-companion state");

  const mismatched = decide(ready.growth, {
    action: "offer",
    state: {
      companionStates: {
        byId: {
          [COMPANION_ID]: { growth: { ...ready.growth, stage: "resonant_mature" } }
        }
      }
    }
  });
  assertEqual(mismatched.reason, "growth_state_mismatch", "detached growth");

  const offered = decide(ready.growth, { action: "offer", state: ready.state });
  assertEqual(offered.ok, true, "matching state accepted");
  assertEqual(
    offered.candidateState.companionStates.byId[COMPANION_ID].growth.offeredStage,
    "resonant_mature",
    "candidateState follows candidateGrowth"
  );
});

report();

function decide(growth, overrides = {}) {
  return decideFormalEvolutionTransition({
    action: "offer",
    companionId: COMPANION_ID,
    growth,
    chapterNo: 2,
    profile: PROFILE,
    willingnessContext: willingContext(),
    safetyFacts: safeFacts(),
    generation: "gen-1",
    at: BASE_TIME + 10,
    ...overrides
  });
}

function seedReadyGrowth({
  companionId = COMPANION_ID,
  stage = "initial_awakened",
  chapterNo = 2,
  families = 3
} = {}) {
  let growth = createDefaultGrowthState({ companionId, now: BASE_TIME, stage });
  const events = readyEvents(companionId, families);
  for (const event of events) {
    const written = writeCompanionGrowthEvidence({ growth, companionId, event });
    if (written.result.changed) growth = written.growth;
  }
  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId,
    chapterNo,
    profile: PROFILE
  });
  if (!readiness.ready) {
    throw new Error(`fixture not ready: ${readiness.reason}`);
  }
  return { growth, companionId };
}

function seedReadyState() {
  const state = createDefaultState();
  state.chapterProgress.current = 2;
  const seeded = seedReadyGrowth();
  state.companionStates.byId[COMPANION_ID].growth = seeded.growth;
  state.companionStates.byId[COMPANION_ID].growth.coverage.windowOpenedAt = BASE_TIME;
  return { state, growth: state.companionStates.byId[COMPANION_ID].growth };
}

function readyEvents(companionId, familyCount) {
  const table = [
    ["care", "attunement", {
      chapterNo: 1,
      originEventId: "care_ready",
      practiceId: "listen"
    }, "respected_rewrite"],
    ["exploration", "pathfinding", {
      chapterNo: 1,
      nodeId: "trail_ready",
      choiceId: "read"
    }, null],
    ["chapter", "steadfastness", {
      chapterNo: 1,
      eventId: "life_moonlake_still",
      branchFamily: "presence"
    }, null],
    ["reflection", "attunement", {
      memoryId: "emem_ready",
      resolutionId: "shared_understanding"
    }, null]
  ];
  return table.slice(0, familyCount).map((entry, index) => {
    const created = createCompletedGrowthEvent({
      companionId,
      sourceType: entry[0],
      tendency: entry[1],
      context: entry[2],
      createdAt: BASE_TIME + 1 + index,
      completed: true,
      completionStatus: "completed",
      consentKind: entry[3],
      safetyProvenance: safeFacts()
    });
    if (!created.ok) throw new Error(`fixture event ${entry[0]}: ${created.reason}`);
    return created.event;
  });
}

function recoveryReevaluation(growth, createdAt) {
  const created = createCompletedGrowthEvent({
    companionId: COMPANION_ID,
    sourceType: "recovery",
    tendency: "steadfastness",
    context: { originKey: "recovery:after_defer" },
    createdAt,
    completed: true,
    completionStatus: "completed",
    safetyProvenance: safeFacts()
  });
  const written = writeCompanionGrowthEvidence({
    growth,
    companionId: COMPANION_ID,
    event: created.event
  });
  if (!written.result.accepted) {
    throw new Error(`reevaluation write failed: ${written.result.reason}`);
  }
  Object.assign(growth, written.growth);
  return {
    kind: "repair_completed",
    rootContextKey: created.event.rootContextKey,
    event: created.event
  };
}

function willingContext(overrides = {}) {
  return {
    growthSafetyExcluded: false,
    safetyProvenance: sealGrowthSafetyProvenance(safeFacts()),
    fatigue: { kind: "touch", state: "regulated" },
    boundaryState: "clear",
    chapterRhythm: "open",
    companionIntent: "accept",
    ...overrides
  };
}

function safeFacts() {
  return {
    isHighRisk: false,
    strategyId: null,
    actionId: null,
    systemRoleSafetyReply: false,
    safetyModeActive: false,
    safeHarborModeActive: false
  };
}

function snapshot(state, companionId) {
  const record = state.companionStates.byId[companionId];
  return {
    relationship: {
      bond: record.relationship.bond,
      trust: record.relationship.trust,
      energy: state.energy,
      mood: state.mood
    },
    stage: record.growth.stage,
    evidence: record.growth.evidence
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

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, label) {
  const left = JSON.stringify(actual);
  const right = JSON.stringify(expected);
  if (left !== right) throw new Error(`${label}: expected ${right}, got ${left}`);
}

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nevo-02 formal evolution transition: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
