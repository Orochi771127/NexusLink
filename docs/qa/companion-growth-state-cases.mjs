import * as store from "../../src/state/store.js";
import { applyOfflineRecovery } from "../../src/engine/offlineRecovery.js";
import { evaluateTouchReaction } from "../../src/engine/touchReactionEngine.js";
import { getTouchPersonality } from "../../src/engine/personalityProfile.js";
import { COMPANIONS, getCompanionById } from "../../src/data/companionRegistry.js";
import { deriveStateMutation } from "../../src/ai/stateMutationPolicy.js";
import { InteractionController } from "../../src/engine/interactionController.js";
import {
  COMPANION_GROWTH_STAGES,
  GROWTH_SOURCE_TYPES,
  RELATION_MIRROR_FIELDS,
  getCompanionCodexGrowthPresentation
} from "../../src/state/companionStateSchema.js";
import {
  STORAGE_KEY,
  clearState,
  loadState,
  saveState
} from "../../src/state/saveManager.js";

const EXPECTED_RELATION_FIELDS = [
  "bond",
  "trust",
  "mood",
  "energy",
  "defense",
  "touchFatigue",
  "lastTouchAt",
  "lastRejectAt",
  "blockedTouchCount",
  "lastBlockedTouchAt",
  "firstTouchCompleted",
  "firstHugCompleted",
  "reactionPreview",
  "lastTouchReaction"
];
const ALL_COMPANION_IDS = COMPANIONS.map((companion) => companion.id);
const cases = [];

installFakeLocalStorage();
installFakeWindow();

await runCase("G2 mirror inventory is the exact 14-field contract", () => {
  assertDeepEqual(RELATION_MIRROR_FIELDS, EXPECTED_RELATION_FIELDS, "mirror fields");
});

await runCase("fresh state owns one active relationship with isolated references", () => {
  const first = store.createDefaultState();
  const second = store.createDefaultState();
  assertDeepEqual(Object.keys(first.companionStates.byId), ["greyshade-cat"], "fresh records");
  assertMirrorMatchesCanonical(first, "fresh mirror");
  assertEqual(first.companionStates.byId["greyshade-cat"].growth.stage, "initial_awakened", "fresh stage");
  assertEqual(first.companionStates.byId["greyshade-cat"].growth.evidence.length, 0, "fresh evidence");
  assertNotEqual(first.companionStates, second.companionStates, "bundle reference");
  assertNotEqual(
    first.companionStates.byId["greyshade-cat"].growth.coverage.rootsBySourceType,
    second.companionStates.byId["greyshade-cat"].growth.coverage.rootsBySourceType,
    "coverage reference"
  );
});

await runCase("legacy bond boundaries map once to the three formal stage floors", () => {
  const boundaries = [
    [24, "initial_awakened"],
    [25, "resonant_mature"],
    [69, "resonant_mature"],
    [70, "final_awakened"]
  ];
  for (const [bond, expectedStage] of boundaries) {
    const state = store.normalizeState({ bond, activeCompanionId: "greyshade-cat" });
    const record = state.companionStates.byId["greyshade-cat"];
    assertEqual(record.growth.stage, expectedStage, `bond ${bond} stage`);
    assertEqual(record.growth.migration.legacyStageFloor, expectedStage, `bond ${bond} floor`);
    assertEqual(record.growth.migration.appliedVersion, 1, `bond ${bond} migration version`);
    assertEqual(record.growth.evidence.length, 0, `bond ${bond} evidence`);
  }
});

await runCase("legacy multi-unlock attributes relationship only to resolved active", () => {
  const state = store.normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["greyshade-cat", "flame-flicker", "ice-talon"],
    bond: 72,
    trust: 41,
    energy: 6,
    firstTouchCompleted: true
  });
  const active = state.companionStates.byId["flame-flicker"];
  assertEqual(active.relationship.bond, 72, "active legacy bond");
  assertEqual(active.growth.stage, "final_awakened", "active legacy floor");
  for (const companionId of ["greyshade-cat", "ice-talon"]) {
    const archive = state.companionStates.byId[companionId];
    assertEqual(archive.relationship, null, `${companionId} archive relationship`);
    assertEqual(archive.growth.stage, "initial_awakened", `${companionId} formal stage`);
    assertEqual(archive.growth.migration.legacyCodexRevealFloor, "final_awakened", `${companionId} display floor`);
    assertEqual(archive.growth.evidence.length, 0, `${companionId} evidence`);
    const presentation = getCompanionCodexGrowthPresentation(state.companionStates, companionId);
    assertEqual(presentation.isLegacyArchive, true, `${companionId} archive presentation`);
    assertEqual(presentation.formalStage, "initial_awakened", `${companionId} presentation formal stage`);
  }
});

await runCase("legacy Codex compatibility reveal survives archive activation and renormalization", () => {
  const legacy = store.normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker", "ice-talon"],
    bond: 72
  });
  resetStore(legacy);
  store.setState({ activeCompanionId: "ice-talon" });
  const activated = store.getState();
  const presentation = getCompanionCodexGrowthPresentation(
    activated.companionStates,
    "ice-talon"
  );
  assertEqual(presentation.formalStage, "initial_awakened", "activated formal stage");
  assertEqual(presentation.revealStage, "final_awakened", "activated reveal floor");
  assertEqual(presentation.isLegacyArchive, true, "activated compatibility note");

  const reloaded = store.normalizeState(activated);
  assertEqual(
    getCompanionCodexGrowthPresentation(reloaded.companionStates, "ice-talon").isLegacyArchive,
    true,
    "compatibility note after normalize"
  );
});

await runCase("legacy active outside unlock is preserved and unknown active fails safe", () => {
  const activeOutside = store.normalizeState({
    activeCompanionId: "ice-talon",
    unlockedCompanionIds: ["flame-flicker"],
    bond: 12
  });
  assertEqual(activeOutside.activeCompanionId, "ice-talon", "known active preserved");
  assertIncludes(activeOutside.unlockedCompanionIds, "ice-talon", "known active unlocked");
  assertEqual(activeOutside.companionStates.byId["ice-talon"].relationship.bond, 12, "known active attribution");

  const unknown = store.normalizeState({
    activeCompanionId: "not-a-companion",
    unlockedCompanionIds: ["flame-flicker"],
    bond: 33
  });
  assertEqual(unknown.activeCompanionId, "greyshade-cat", "unknown active fallback");
  assertIncludes(unknown.unlockedCompanionIds, "greyshade-cat", "fallback added to unlocks");
  assertEqual(unknown.companionStates.byId["greyshade-cat"].relationship.bond, 33, "fallback attribution");
  assertEqual(unknown.companionStates.byId["not-a-companion"], undefined, "unknown record absent");
});

await runCase("canonical relationship wins over stale mirror and keeps known locked records", () => {
  const canonical = store.normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat"],
    bond: 44,
    trust: 18
  });
  const lockedRecord = store.normalizeState({
    activeCompanionId: "blazetail-kit",
    unlockedCompanionIds: ["blazetail-kit"],
    bond: 28,
    trust: 19
  }).companionStates.byId["blazetail-kit"];
  canonical.companionStates.byId["blazetail-kit"] = lockedRecord;
  canonical.companionStates.byId["unknown-id"] = lockedRecord;
  canonical.bond = 99;
  canonical.trust = 99;

  const normalized = store.normalizeState(canonical);
  assertEqual(normalized.bond, 44, "canonical bond precedence");
  assertEqual(normalized.trust, 18, "canonical trust precedence");
  assertEqual(normalized.companionStates.byId["blazetail-kit"].relationship.bond, 28, "known locked record kept");
  assertEqual(normalized.companionStates.byId["unknown-id"], undefined, "unknown canonical record removed");
});

await runCase("present malformed canonical field fails closed instead of legacy attribution", () => {
  for (const companionStates of [
    null,
    "bad",
    { version: "1", byId: {} },
    { version: 99, byId: {} },
    { version: 1, byId: null }
  ]) {
    const state = store.normalizeState({
      activeCompanionId: "greyshade-cat",
      unlockedCompanionIds: ["greyshade-cat"],
      bond: 88,
      trust: 77,
      companionStates
    });
    const record = state.companionStates.byId["greyshade-cat"];
    assertEqual(record.relationship.bond, 0, `corrupt ${JSON.stringify(companionStates)} bond`);
    assertEqual(record.relationship.trust, 5, `corrupt ${JSON.stringify(companionStates)} trust`);
    assertEqual(record.growth.migration.appliedVersion, 0, `corrupt ${JSON.stringify(companionStates)} migration`);
  }
});

await runCase("growth evidence and migration provenance fail closed", () => {
  const canonical = store.createDefaultState();
  const record = canonical.companionStates.byId["greyshade-cat"];
  const evidenceBase = {
    key: "care:1:valid",
    rootContextKey: "care:1",
    companionId: "greyshade-cat",
    tendency: "attunement",
    sourceType: "care",
    sourceId: "valid",
    createdAt: 1784227200000
  };
  record.growth.evidence = [
    { ...evidenceBase, key: "valid", growthSafetyExcluded: false },
    { ...evidenceBase, key: "missing" },
    { ...evidenceBase, key: "string-false", growthSafetyExcluded: "false" },
    { ...evidenceBase, key: "string-true", growthSafetyExcluded: "true" },
    { ...evidenceBase, key: "excluded", growthSafetyExcluded: true }
  ];
  record.growth.stage = "initial_awakened";
  record.growth.migration = {
    appliedVersion: 0,
    legacyStageFloor: "final_awakened",
    legacyCodexRevealFloor: "final_awakened",
    legacyBaselineKey: "legacy:v1:greyshade-cat:relationship"
  };

  const normalized = store.normalizeState(canonical);
  const growth = normalized.companionStates.byId["greyshade-cat"].growth;
  assertDeepEqual(growth.evidence.map((item) => item.key), ["valid"], "explicit-safe evidence only");
  assertEqual(growth.stage, "initial_awakened", "invalid marker cannot promote stage");
  assertEqual(growth.migration.appliedVersion, 0, "invalid marker version reset");
  assertEqual(growth.migration.legacyStageFloor, null, "invalid stage floor removed");

  canonical.companionStates.byId["greyshade-cat"].growth.migration.appliedVersion = "1";
  const stringVersion = store.normalizeState(canonical).companionStates.byId["greyshade-cat"].growth;
  assertEqual(stringVersion.stage, "initial_awakened", "string migration version rejected");
  assertEqual(stringVersion.migration.legacyCodexRevealFloor, null, "string marker reveal removed");
});

await runCase("normalization is byte-idempotent and bounded", () => {
  const canonical = store.createDefaultState();
  const record = canonical.companionStates.byId["greyshade-cat"];
  const evidenceBase = {
    rootContextKey: "care:1:test",
    companionId: "greyshade-cat",
    tendency: "attunement",
    sourceType: "care",
    sourceId: "test",
    chapterNo: 1,
    memoryId: null,
    traceId: null,
    createdAt: 1784227200000,
    growthSafetyExcluded: false,
    legacyAttributed: false
  };
  record.growth.evidence = Array.from({ length: 30 }, (_, index) => ({
    ...evidenceBase,
    key: `care:1:test:${index % 26}`
  }));
  for (const sourceType of GROWTH_SOURCE_TYPES) {
    record.growth.coverage.rootsBySourceType[sourceType] = Array.from(
      { length: 8 },
      (_, index) => `${sourceType}:root:${index}`
    );
  }
  record.growth.consumedRootKeys = Array.from({ length: 60 }, (_, index) => `consumed:${index}`);
  record.growth.offeredStage = "final_awakened";

  const once = store.normalizeState(canonical);
  const twice = store.normalizeState(once);
  assertEqual(JSON.stringify(twice), JSON.stringify(once), "idempotent JSON");
  assertEqual(once.companionStates.byId["greyshade-cat"].growth.evidence.length, 24, "evidence cap");
  assertEqual(
    Object.values(once.companionStates.byId["greyshade-cat"].growth.coverage.rootsBySourceType)
      .flat().length,
    24,
    "coverage root cap"
  );
  assertEqual(once.companionStates.byId["greyshade-cat"].growth.consumedRootKeys.length, 48, "consumed root cap");
  assertEqual(once.companionStates.byId["greyshade-cat"].growth.offeredStage, null, "invalid next-stage offer removed");
});

await runCase("setState and updateState seal active mirror while preserving growth", () => {
  resetStore(store.createDefaultState());
  store.setState({ bond: 12, trust: 17, energy: 6 });
  assertMirrorMatchesCanonical(store.getState(), "setState mirror");
  assertEqual(store.getState().companionStates.byId["greyshade-cat"].relationship.bond, 12, "setState bond sealed");

  store.updateState((draft) => {
    draft.touchFatigue = 4;
    draft.lastTouchReaction = "hesitate";
    draft.companionStates.byId["greyshade-cat"].growth.stage = "resonant_mature";
  });
  assertMirrorMatchesCanonical(store.getState(), "updateState mirror");
  assertEqual(store.getState().companionStates.byId["greyshade-cat"].relationship.touchFatigue, 4, "update fatigue sealed");
  assertEqual(store.getState().companionStates.byId["greyshade-cat"].growth.stage, "resonant_mature", "growth preserved");
});

await runCase("persisted replace is canonical-authoritative; runtime replace seals recovery", () => {
  const canonical = store.normalizeState({ bond: 11, energy: 3 });
  const staleRuntime = { ...canonical, bond: 42, energy: 8 };
  store.replaceState(staleRuntime);
  assertEqual(store.getState().bond, 11, "persisted replace canonical bond");
  assertEqual(store.getState().energy, 3, "persisted replace canonical energy");

  store.replaceRuntimeState(staleRuntime);
  assertEqual(store.getState().bond, 42, "runtime replace sealed bond");
  assertEqual(store.getState().energy, 8, "runtime replace sealed energy");
  assertMirrorMatchesCanonical(store.getState(), "runtime replace mirror");
});

await runCase("A to B to A isolates relationship and lazy-initializes archive baseline", () => {
  const legacy = store.normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker", "ice-talon"],
    bond: 44,
    trust: 31,
    energy: 6,
    firstTouchCompleted: true
  });
  resetStore(legacy);
  store.setState({ activeCompanionId: "ice-talon" });
  assertRelationshipBaseline(store.getState(), "lazy inactive baseline");
  store.setState({ bond: 9, trust: 12, mood: "warm", firstHugCompleted: true });
  store.setState({ activeCompanionId: "flame-flicker" });
  assertEqual(store.getState().bond, 44, "A bond restored");
  assertEqual(store.getState().trust, 31, "A trust restored");
  assertEqual(store.getState().firstTouchCompleted, true, "A touch restored");
  assertEqual(store.getState().firstHugCompleted, false, "A hug isolated");
  store.setState({ activeCompanionId: "ice-talon" });
  assertEqual(store.getState().bond, 9, "B bond restored");
  assertEqual(store.getState().firstHugCompleted, true, "B hug restored");
  assertMirrorMatchesCanonical(store.getState(), "B mirror restored");
});

await runCase("combined companion switch ignores top-level relationship patch and archives previous mirror", () => {
  const initial = store.normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker", "ice-talon"],
    bond: 12,
    trust: 17,
    mood: "warm"
  });
  resetStore(initial);
  store.setState({
    activeCompanionId: "ice-talon",
    bond: 77,
    trust: 88,
    mood: "defensive"
  });

  const switched = store.getState();
  assertEqual(switched.companionStates.byId["flame-flicker"].relationship.bond, 12, "A bond archived");
  assertEqual(switched.companionStates.byId["flame-flicker"].relationship.trust, 17, "A trust archived");
  assertRelationshipBaseline(switched, "B ignores combined mirror patch");
});

await runCase("all registered companions survive a relationship isolation ring", () => {
  resetStore(store.normalizeState({
    activeCompanionId: ALL_COMPANION_IDS[0],
    unlockedCompanionIds: ALL_COMPANION_IDS,
    bond: 0
  }));

  for (let index = 0; index < ALL_COMPANION_IDS.length; index += 1) {
    const companionId = ALL_COMPANION_IDS[index];
    if (store.getState().activeCompanionId !== companionId) {
      store.setState({ activeCompanionId: companionId });
    }
    store.setState({
      bond: index + 1,
      trust: index + 11,
      mood: `ring-${index}`,
      energy: index % 11,
      defense: 30 + index,
      touchFatigue: index % 10,
      lastTouchAt: 1784227200000 + index,
      lastRejectAt: index % 2 ? 1784227100000 + index : null,
      blockedTouchCount: index,
      lastBlockedTouchAt: index % 2 ? 1784227150000 + index : null,
      firstTouchCompleted: index % 2 === 0,
      firstHugCompleted: index % 3 === 0,
      reactionPreview: `preview-${index}`,
      lastTouchReaction: `reaction-${index}`
    });
  }

  for (let index = 0; index < ALL_COMPANION_IDS.length; index += 1) {
    const companionId = ALL_COMPANION_IDS[index];
    store.setState({ activeCompanionId: companionId });
    assertEqual(store.getState().bond, index + 1, `${companionId} ring bond`);
    assertEqual(store.getState().reactionPreview, `preview-${index}`, `${companionId} ring preview`);
    assertMirrorMatchesCanonical(store.getState(), `${companionId} ring mirror`);
  }
  assertEqual(store.getState().companionStates.byId["not-a-companion"], undefined, "ring unknown absent");
});

await runCase("20 rapid switches emit exactly one coherent notification each", () => {
  resetStore(store.normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "flame-flicker"],
    bond: 7,
    spamScore: 4
  }));
  let notifications = 0;
  const failures = [];
  const unsubscribe = store.subscribe((snapshot) => {
    notifications += 1;
    try {
      assertMirrorMatchesCanonical(snapshot, `notification ${notifications}`);
      assertEqual(snapshot.spamScore, 0, `notification ${notifications} spam reset`);
    } catch (error) {
      failures.push(error.message);
    }
  });
  try {
    for (let index = 0; index < 20; index += 1) {
      store.setState({ activeCompanionId: index % 2 === 0 ? "flame-flicker" : "greyshade-cat" });
    }
  } finally {
    unsubscribe();
  }
  assertEqual(notifications, 20, "rapid switch notification count");
  assertDeepEqual(failures, [], "rapid switch coherence");
});

await runCase("20 runtime controller swaps do not add a second store notification", () => {
  resetStore(store.normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "flame-flicker"],
    bond: 7,
    spamScore: 4
  }));
  let notifications = 0;
  const unsubscribe = store.subscribe(() => { notifications += 1; });
  let controller = null;
  try {
    for (let index = 0; index < 20; index += 1) {
      controller?.dispose();
      const companionId = index % 2 === 0 ? "flame-flicker" : "greyshade-cat";
      store.setState({ activeCompanionId: companionId });
      controller = createTestInteractionController(companionId);
    }
  } finally {
    controller?.dispose();
    unsubscribe();
  }
  assertEqual(notifications, 20, "controller swap notification count");
});

await runCase("sleep wake touch aborts when companion changes before animation resolves", async () => {
  resetStore(store.normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "flame-flicker"],
    bond: 14,
    trust: 16,
    firstTouchCompleted: false
  }));
  let resolveWake;
  const wake = new Promise((resolve) => { resolveWake = resolve; });
  let saves = 0;
  let changes = 0;
  const controller = createTestInteractionController("greyshade-cat", {
    saveCurrentState: () => { saves += 1; },
    onStateChange: () => { changes += 1; },
    currentAnimation: "sleep"
  });
  controller.playAnimation = () => wake;

  const pending = controller.handleTouch("touch");
  store.setState({ activeCompanionId: "flame-flicker" });
  const beforeResolve = JSON.stringify(store.getState().companionStates.byId["flame-flicker"]);
  controller.dispose();
  resolveWake();
  const result = await pending;

  assertEqual(result.blocked, true, "stale touch blocked");
  assertEqual(result.reason, "companion_changed", "stale touch reason");
  assertEqual(saves, 0, "stale touch save count");
  assertEqual(changes, 0, "stale touch callback count");
  assertEqual(
    JSON.stringify(store.getState().companionStates.byId["flame-flicker"]),
    beforeResolve,
    "new active record unchanged"
  );
});

await runCase("touch recovery hydrates canonical before applying fatigue mutation", () => {
  const now = 1784227200000;
  const state = store.normalizeState({
    activeCompanionId: "greyshade-cat",
    bond: 30,
    trust: 20,
    energy: 8,
    touchFatigue: 6,
    lastTouchAt: now - (5 * 60 * 1000),
    firstTouchCompleted: true
  });
  const result = evaluateTouchReaction(
    state,
    getTouchPersonality(getCompanionById("greyshade-cat")),
    "touch",
    now,
    "灰影貓"
  );
  assertEqual(result.statePatch.touchFatigue, 4, "recovered three then added one");
});

await runCase("offline recovery survives the runtime boot replacement", () => {
  const now = Date.now();
  const loaded = store.normalizeState({
    activeCompanionId: "greyshade-cat",
    bond: 16,
    trust: 14,
    energy: 1,
    touchFatigue: 6,
    lastTouchAt: now - (6 * 60 * 1000),
    lastSeenAt: now - (2 * 60 * 60 * 1000) - 1000
  });
  const recovered = applyOfflineRecovery(loaded);
  store.replaceRuntimeState(recovered);
  assertEqual(store.getState().energy >= 2, true, "offline energy recovered");
  assertEqual(store.getState().touchFatigue, 0, "offline fatigue recovered");
  assertMirrorMatchesCanonical(store.getState(), "offline canonical mirror");
});

await runCase("offline recovery applies to every established companion and survives reload", () => {
  localStorage.clear();
  const now = Date.now();
  const threeHoursAgo = now - (3 * 60 * 60 * 1000) - 1000;
  resetStore(store.normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "flame-flicker"],
    energy: 0,
    touchFatigue: 8,
    lastTouchAt: threeHoursAgo,
    lastSeenAt: threeHoursAgo
  }));
  store.setState({ activeCompanionId: "flame-flicker" });
  store.setState({ energy: 0, touchFatigue: 8, lastTouchAt: threeHoursAgo });
  store.setState({ activeCompanionId: "greyshade-cat" });
  store.setState({ lastSeenAt: threeHoursAgo });

  store.replaceRuntimeState(applyOfflineRecovery(store.getState()));
  assertEqual(store.getState().energy, 1, "active companion energy recovered once");
  assertEqual(store.getState().touchFatigue, 0, "active companion fatigue recovered");
  assertMirrorMatchesCanonical(store.getState(), "active offline mirror");

  assertEqual(saveState(store.getState()).ok, true, "recovered roster saved");
  resetStore(loadState());
  store.setState({ activeCompanionId: "flame-flicker" });
  assertEqual(store.getState().energy, 1, "inactive companion energy recovered before reload");
  assertEqual(store.getState().touchFatigue, 0, "inactive companion fatigue recovered before reload");
  assertMirrorMatchesCanonical(store.getState(), "inactive offline mirror after reload");
  clearState();
});

await runCase("legacy load migrates before defaults and round-trips in one storage key", () => {
  localStorage.clear();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker", "ice-talon"],
    bond: 33,
    trust: 22,
    energy: 5,
    lastSeenAt: 1784227200000
  }));
  const loaded = loadState();
  assertEqual(loaded.companionStates.byId["flame-flicker"].relationship.bond, 33, "load legacy bond");
  assertEqual(loaded.companionStates.byId["flame-flicker"].growth.stage, "resonant_mature", "load legacy floor");
  const saved = saveState(loaded);
  assertEqual(saved.ok, true, "save result");
  assertDeepEqual(storageKeys(), [STORAGE_KEY], "single storage key");
  const reloaded = loadState();
  assertEqual(
    JSON.stringify(reloaded.companionStates),
    JSON.stringify(loaded.companionStates),
    "companion states reload"
  );
  clearState();
});

await runCase("high-risk mutation changes only safety mode, never relationship or growth", () => {
  const baseline = store.normalizeState({
    activeCompanionId: "greyshade-cat",
    bond: 17,
    trust: 23,
    mood: "warm",
    energy: 0,
    defense: 31,
    touchFatigue: 4,
    reactionPreview: "baseline"
  });
  const beforeRelationship = JSON.stringify(baseline.companionStates.byId["greyshade-cat"]);
  const beforeMirror = pickMirror(baseline);
  const mutation = deriveStateMutation({
    state: baseline,
    safety: { isHighRisk: true, action: "safety_redirect" },
    plan: {
      mode: "safety_redirect",
      statePatch: { mood: "safe_harbor", energy: 1, reactionPreview: "mutated" }
    }
  });
  assertDeepEqual(Object.keys(mutation.statePatch), ["safeHarborMode"], "high-risk patch keys");
  resetStore(baseline);
  store.setState(mutation.statePatch);
  assertEqual(store.getState().safeHarborMode, true, "safety mode entered");
  assertEqual(
    JSON.stringify(store.getState().companionStates.byId["greyshade-cat"]),
    beforeRelationship,
    "high-risk canonical deep compare"
  );
  assertDeepEqual(pickMirror(store.getState()), beforeMirror, "high-risk mirror deep compare");
});

const failedCases = cases.filter((item) => item.status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failedCases.length, cases }, null, 2));
if (failedCases.length > 0) process.exitCode = 1;

async function runCase(name, fn) {
  try {
    await fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error?.stack || error?.message || String(error) });
  }
}

function resetStore(nextState) {
  store.replaceState(nextState);
}

function assertMirrorMatchesCanonical(state, label) {
  const relationship = state.companionStates?.byId?.[state.activeCompanionId]?.relationship;
  if (!relationship) throw new Error(`${label}: active canonical relationship missing`);
  for (const field of RELATION_MIRROR_FIELDS) {
    assertDeepEqual(state[field], relationship[field], `${label} ${field}`);
  }
}

function assertRelationshipBaseline(state, label) {
  assertEqual(state.bond, 0, `${label} bond`);
  assertEqual(state.trust, 5, `${label} trust`);
  assertEqual(state.mood, "calm", `${label} mood`);
  assertEqual(state.energy, 10, `${label} energy`);
  assertEqual(state.defense, 35, `${label} defense`);
  assertEqual(state.touchFatigue, 0, `${label} fatigue`);
  assertMirrorMatchesCanonical(state, label);
}

function pickMirror(state) {
  return Object.fromEntries(RELATION_MIRROR_FIELDS.map((field) => [field, state[field]]));
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertNotEqual(actual, expected, label) {
  if (actual === expected) throw new Error(`${label}: references unexpectedly match`);
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function assertIncludes(actual, expected, label) {
  if (!Array.isArray(actual) || !actual.includes(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(actual)} to include ${JSON.stringify(expected)}`);
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

function installFakeWindow() {
  globalThis.window = {
    setInterval: globalThis.setInterval,
    clearInterval: globalThis.clearInterval,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout
  };
}

function createTestInteractionController(companionId, {
  saveCurrentState = () => {},
  onStateChange = () => {},
  currentAnimation = "idle_calm"
} = {}) {
  const companionNode = {
    __animationController: {
      getCurrentAnimationName: () => currentAnimation
    }
  };
  return new InteractionController({
    companion: companionNode,
    creature: getCompanionById(companionId),
    store,
    saveCurrentState,
    statusText: { textContent: "" },
    onStateChange
  });
}

function storageKeys() {
  return Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).sort();
}
