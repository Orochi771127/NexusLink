/**
 * EVO-03 — Formal evolution candidate-first critical save.
 *
 * 這份測試證明：邀請 token 可以活過 schema／normalize；
 * 接受時先存檔，成功才發布可見 stage；失敗則從頭到尾都還是舊樣子。
 * renderer intent 在本包必須是 no-op。這不是形態 swap，也不是 live Reflection。
 */

import {
  createDefaultState,
  getState,
  normalizeState,
  replaceState,
  subscribe
} from "../../src/state/store.js";
import { pruneStateForStorage } from "../../src/engine/storageGuard.js";
import { STORAGE_KEY, clearState, loadState, saveState } from "../../src/state/saveManager.js";
import { createDefaultGrowthState } from "../../src/state/companionStateSchema.js";
import {
  createCompletedGrowthEvent,
  evaluateCompanionGrowthReadiness,
  sealGrowthSafetyProvenance,
  writeCompanionGrowthEvidence
} from "../../src/engine/companionGrowthEngine.js";
import {
  createFormalEvolutionOfferToken
} from "../../src/engine/companionFormalEvolutionTransitionEngine.js";
import {
  commitFormalEvolutionTransition,
  createCompanionGrowthController
} from "../../src/ui/companionGrowthController.js";

const COMPANION_ID = "greyshade-cat";
const BASE_TIME = 1785542400000;
const PROFILE = {
  minimumChapterByStage: {
    resonant_mature: 2,
    final_awakened: 5
  }
};
const controller = createCompanionGrowthController();
const cases = [];

installFakeLocalStorage();

await runCase("formalOffer survives normalize and missing token cannot accept", () => {
  const ready = seedReadyState();
  const offered = applyOffer(ready.state);
  const normalized = normalizeState(offered);
  const growth = normalized.companionStates.byId[COMPANION_ID].growth;
  assertEqual(growth.offeredStage, "resonant_mature", "offer stage kept");
  assertEqual(growth.formalOffer?.status, "open", "token kept");
  assertEqual(typeof growth.formalOffer.token, "string", "token string");

  const legacy = seedReadyState();
  legacy.state.companionStates.byId[COMPANION_ID].growth.offeredStage = "resonant_mature";
  const stripped = normalizeState(legacy.state);
  assertEqual(
    stripped.companionStates.byId[COMPANION_ID].growth.formalOffer,
    null,
    "old save has no invented token"
  );

  const forged = createFormalEvolutionOfferToken({
    companionId: COMPANION_ID,
    currentStage: "initial_awakened",
    targetStage: "resonant_mature",
    generation: "never-issued"
  });
  const rejected = apply(stripped, {
    action: "accept",
    offerToken: forged,
    at: BASE_TIME + 20
  });
  assertEqual(rejected.ok, false, "missing token cannot accept");
  assertEqual(rejected.reason, "stale_offer", "legacy accept is stale");
  assertEqual(stripped.companionStates.byId[COMPANION_ID].growth.stage, "initial_awakened", "stage unchanged");
});

await runCase("mock save failure never publishes a new stage to store or subscribers", async () => {
  const ready = seedReadyState();
  replaceState(ready.state);
  const offered = await commit("offer", getState(), { save: saveOk });
  assertEqual(offered.published, true, "offer saved");

  const before = JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth);
  const seenStages = [];
  const unsubscribe = subscribe((state) => {
    seenStages.push(state.companionStates.byId[COMPANION_ID].growth.stage);
  });
  const failed = await commit("accept", getState(), {
    save: async () => ({ ok: false }),
    at: BASE_TIME + 20
  });
  unsubscribe();
  assertEqual(failed.ok, false, "save fail");
  assertEqual(failed.reason, "formal_evolution_save_failed", "save fail reason");
  assertEqual(failed.published, false, "not published");
  assertEqual(failed.rendererIntent, null, "no renderer");
  assertEqual(
    JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth),
    before,
    "canonical growth unchanged"
  );
  assertEqual(seenStages.includes("resonant_mature"), false, "subscribers never saw new stage");
});

await runCase("save success then UI failure keeps the new stage after reload-shaped normalize", async () => {
  const ready = seedReadyState();
  replaceState(ready.state);
  await commit("offer", getState(), { save: saveOk });
  let uiFailed = false;
  try {
    await commit("accept", getState(), {
      save: saveOk,
      at: BASE_TIME + 20,
      publishState: (candidate) => {
        replaceState(candidate);
        uiFailed = true;
        throw new Error("ui-failed");
      }
    });
  } catch (error) {
    assertEqual(error.message, "ui-failed", "ui throw");
  }
  assertEqual(uiFailed, true, "ui failed after publish");
  const live = getState().companionStates.byId[COMPANION_ID].growth;
  assertEqual(live.stage, "resonant_mature", "live stage stays new");
  const reloaded = normalizeState(JSON.parse(JSON.stringify(getState())));
  assertEqual(
    reloaded.companionStates.byId[COMPANION_ID].growth.stage,
    "resonant_mature",
    "reload-shaped stage stays new"
  );
  assertEqual(
    reloaded.companionStates.byId[COMPANION_ID].growth.formalOffer.status,
    "consumed",
    "consumed token survives reload shape"
  );
});

await runCase("duplicate accept twenty times does not save or publish again", async () => {
  const ready = seedReadyState();
  replaceState(ready.state);
  await commit("offer", getState(), { save: saveOk });
  const first = await commit("accept", getState(), { save: saveOk, at: BASE_TIME + 20 });
  assertEqual(first.ok, true, "first accept");
  assertEqual(getState().companionStates.byId[COMPANION_ID].growth.stage, "resonant_mature", "one hop");
  let extraSaves = 0;
  const firstJson = JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth);
  for (let index = 0; index < 20; index += 1) {
    const repeat = await commit("accept", getState(), {
      save: async (candidate) => {
        extraSaves += 1;
        return { ok: true, state: candidate };
      },
      at: BASE_TIME + 21 + index
    });
    assertEqual(repeat.ok, true, `repeat ${index} ok`);
    assertEqual(repeat.changed, false, `repeat ${index} unchanged`);
    assertEqual(repeat.published, false, `repeat ${index} unpublished`);
    assertEqual(repeat.rendererIntent, null, `repeat ${index} renderer`);
  }
  assertEqual(extraSaves, 0, "idempotent accepts do not save");
  assertEqual(
    JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth),
    firstJson,
    "growth frozen after first accept"
  );
});

await runCase("defer is no-penalty and rewrite stays pending until a second accept", async () => {
  const ready = seedReadyState();
  const before = snapshot(ready.state);
  replaceState(ready.state);
  await commit("offer", getState(), { save: saveOk });
  const deferred = await commit("defer", getState(), { save: saveOk, at: BASE_TIME + 15 });
  assertEqual(deferred.ok, true, "defer ok");
  const afterDefer = snapshot(getState());
  assertEqual(afterDefer.stage, before.stage, "defer stage");
  assertEqual(afterDefer.relationship.bond, before.relationship.bond, "defer bond");
  assertEqual(afterDefer.relationship.trust, before.relationship.trust, "defer trust");
  assertEqual(getState().companionStates.byId[COMPANION_ID].growth.formalOffer.status, "deferred", "deferred status");

  replaceState(ready.state);
  await commit("offer", getState(), { save: saveOk, generation: "gen-rewrite" });
  const rewritten = await commit("rewrite", getState(), { save: saveOk, at: BASE_TIME + 16 });
  assertEqual(rewritten.ok, true, "rewrite ok");
  assertEqual(getState().companionStates.byId[COMPANION_ID].growth.stage, "initial_awakened", "rewrite no stage");
  assertEqual(getState().companionStates.byId[COMPANION_ID].growth.formalOffer.rewritePending, true, "pending");
  const blocked = await commit("accept", getState(), {
    save: saveOk,
    at: BASE_TIME + 17,
    rewriteAccepted: false
  });
  assertEqual(blocked.ok, false, "second accept required");
  const accepted = await commit("accept", getState(), {
    save: saveOk,
    at: BASE_TIME + 18,
    rewriteAccepted: true
  });
  assertEqual(accepted.ok, true, "rewrite accept");
  assertEqual(getState().companionStates.byId[COMPANION_ID].growth.stage, "resonant_mature", "rewrite then hop");
});

await runCase("safeHarbor and high-risk leave canonical growth unchanged", async () => {
  const ready = seedReadyState();
  replaceState(ready.state);
  await commit("offer", getState(), { save: saveOk });
  const before = JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth);
  const harborState = JSON.parse(JSON.stringify(getState()));
  harborState.safeHarborMode = true;
  const harbor = await commit("accept", harborState, { save: saveOk, at: BASE_TIME + 20 });
  assertEqual(harbor.ok, false, "harbor blocked");
  assertEqual(harbor.reason, "safe_harbor_terminal", "harbor reason");
  assertEqual(harbor.published, false, "harbor unpublished");
  assertEqual(
    JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth),
    before,
    "harbor does not publish"
  );

  const highRisk = await commit("accept", getState(), {
    save: saveOk,
    at: BASE_TIME + 20,
    safetyFacts: { ...safeFacts(), isHighRisk: true }
  });
  assertEqual(highRisk.reason, "safety_excluded", "high-risk");
  assertEqual(highRisk.published, false, "high-risk unpublished");
  assertEqual(
    JSON.stringify(getState().companionStates.byId[COMPANION_ID].growth),
    before,
    "high-risk does not publish"
  );
});

await runCase("view model exposes invite without FOMO fields", () => {
  const ready = seedReadyState();
  const view = controller.getViewModel(ready.state, {
    phaseId: "steady",
    companionIntent: "accept"
  });
  assertEqual(view.formalEvolution.kind, "can_invite", "ready companion can invite");
  assertEqual(JSON.stringify(view).includes("deadline"), false, "no deadline");
  assertEqual(JSON.stringify(view).includes("cooldown"), false, "no cooldown");
  const offered = applyOffer(ready.state);
  const openView = controller.getViewModel(offered, { phaseId: "steady", companionIntent: "accept" });
  assertEqual(openView.formalEvolution.kind, "open", "open invite");
});

await runCase("Heart Phase rest hides invite and blocks a forged offer click", async () => {
  const ready = seedReadyState();
  const restingMoment = {
    phaseId: "resting",
    lastResult: { outcomeId: "rest" }
  };
  const view = controller.getViewModel(ready.state, restingMoment);
  assertEqual(view.formalEvolution.kind, "none", "resting companion has no invite");

  replaceState(ready.state);
  const forged = await commit("offer", getState(), {
    save: saveOk,
    currentMoment: restingMoment
  });
  assertEqual(forged.ok, false, "forged offer blocked");
  assertEqual(forged.reason, "companion_deferred", "rest maps to defer");
  assertEqual(forged.published, false, "rest does not persist");
  assertEqual(
    getState().companionStates.byId[COMPANION_ID].growth.formalOffer,
    null,
    "canonical offer stays empty"
  );
});

await runCase("formalOffer survives prune and save/load roundtrip", async () => {
  const ready = seedReadyState();
  replaceState(ready.state);
  const offered = await commit("offer", getState(), { save: saveOk });
  assertEqual(offered.ok, true, "offer ok");
  const liveOffer = getState().companionStates.byId[COMPANION_ID].growth.formalOffer;
  assertEqual(liveOffer?.status, "open", "live open offer");

  const pruned = pruneStateForStorage(getState(), BASE_TIME);
  assertEqual(
    pruned.companionStates.byId[COMPANION_ID].growth.formalOffer.token,
    liveOffer.token,
    "prune keeps token"
  );
  assertEqual(
    pruned.companionStates.byId[COMPANION_ID].growth.formalOffer.status,
    "open",
    "prune keeps open status"
  );

  localStorage.clear();
  const saved = saveState(getState());
  assertEqual(saved.ok, true, "save ok");
  assertEqual(saved.state.companionStates.byId[COMPANION_ID].growth.formalOffer.token, liveOffer.token, "disk token");
  const reloaded = loadState();
  const reloadedGrowth = reloaded.companionStates.byId[COMPANION_ID].growth;
  assertEqual(reloadedGrowth.formalOffer.token, liveOffer.token, "reload token");
  assertEqual(reloadedGrowth.formalOffer.status, "open", "reload status");
  assertEqual(reloadedGrowth.offeredStage, "resonant_mature", "reload offered stage");
  assertEqual(reloadedGrowth.stage, "initial_awakened", "reload stage unchanged");
  assertDeepEqual(storageKeys(), [STORAGE_KEY], "single storage key");
  clearState();
});

report();

function applyOffer(state, overrides = {}) {
  const result = apply(state, { action: "offer", ...overrides });
  if (!result.ok) throw new Error(`offer failed: ${result.reason}`);
  return state;
}

function apply(state, overrides = {}) {
  return controller.applyFormalEvolutionIntoDraft(state, {
    companionId: COMPANION_ID,
    at: BASE_TIME + 10,
    generation: "gen-1",
    willingnessContext: willingContext(),
    safetyFacts: safeFacts(),
    ...overrides
  });
}

async function commit(action, currentState, {
  save,
  at = BASE_TIME + 10,
  generation = "gen-1",
  rewriteAccepted,
  safetyFacts,
  publishState,
  currentMoment = null,
  willingnessContext = null
} = {}) {
  const result = await commitFormalEvolutionTransition({
    currentState,
    saveCandidateState: save,
    publishState: publishState || ((candidate) => replaceState(candidate)),
    notifyRenderer: () => null,
    action,
    companionId: COMPANION_ID,
    at,
    generation,
    rewriteAccepted,
    safetyFacts: safetyFacts || safeFacts(),
    currentMoment,
    ...(currentMoment && !willingnessContext
      ? {}
      : { willingnessContext: willingnessContext || willingContext() })
  });
  return result;
}

function seedReadyState() {
  const state = createDefaultState();
  state.chapterProgress.current = 2;
  let growth = createDefaultGrowthState({ companionId: COMPANION_ID, now: BASE_TIME });
  for (const event of readyEvents(COMPANION_ID, 3)) {
    const written = writeCompanionGrowthEvidence({ growth, companionId: COMPANION_ID, event });
    if (written.result.changed) growth = written.growth;
  }
  const readiness = evaluateCompanionGrowthReadiness({
    growth,
    companionId: COMPANION_ID,
    chapterNo: 2,
    profile: PROFILE
  });
  if (!readiness.ready) throw new Error(`fixture not ready: ${readiness.reason}`);
  state.companionStates.byId[COMPANION_ID].growth = growth;
  state.companionStates.byId[COMPANION_ID].growth.coverage.windowOpenedAt = BASE_TIME;
  return { state, growth };
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

async function saveOk(candidate) {
  return { ok: true, state: candidate };
}

function snapshot(state) {
  const record = state.companionStates.byId[COMPANION_ID];
  return {
    relationship: {
      bond: record.relationship.bond,
      trust: record.relationship.trust
    },
    stage: record.growth.stage
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

function installFakeLocalStorage() {
  const values = new Map();
  globalThis.localStorage = {
    get length() {
      return values.size;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    },
    clear() {
      values.clear();
    }
  };
}

function storageKeys() {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).sort();
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function report() {
  const failed = cases.filter((entry) => !entry.ok);
  for (const entry of cases) {
    console.log(`${entry.ok ? "PASS" : "FAIL"} ${entry.name}${entry.ok ? "" : ` — ${entry.error}`}`);
  }
  console.log(`\nevo-03 formal evolution runtime: ${cases.length - failed.length}/${cases.length}`);
  if (failed.length > 0) process.exitCode = 1;
}
