import { createDefaultState, normalizeState } from "../../src/state/store.js";
import { getCompanionRuntimeEligibility } from "../../src/data/companionRuntimePolicy.js";

const RUNTIME_READY_LEGACY_UNLOCKS = [
  "greyshade-cat",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit"
];

const cases = [];

runCase("fresh default state unlocks Greyshade only", () => {
  const state = createDefaultState();
  assertEqual(state.activeCompanionId, "greyshade-cat", "fresh active companion");
  assertArrayEqual(state.unlockedCompanionIds, ["greyshade-cat"], "fresh unlocked companions");
  assertEqual(state.playerProfile.displayName, "", "fresh profile display name");
  assertEqual(state.playerProfile.identitySkipped, false, "fresh identity skipped");
  assertEqual(state.onboarding.completed, false, "fresh onboarding completed");
  assertEqual(state.onboarding.status, "pending", "fresh onboarding status");
});

runCase("fresh non-Greyshade runtime companions are locked", () => {
  const state = createDefaultState();
  const greyshade = getCompanionRuntimeEligibility("greyshade-cat", state);
  const flametail = getCompanionRuntimeEligibility("flame-flicker", state);

  assertEqual(greyshade.canSelect, true, "fresh Greyshade selectability");
  assertEqual(flametail.isUnlocked, false, "fresh Flametail unlock state");
  assertEqual(flametail.canSelect, false, "fresh Flametail selectability");
});

runCase("legacy runtime-ready unlocks and active companion are preserved", () => {
  const state = normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: RUNTIME_READY_LEGACY_UNLOCKS,
    bond: 12
  });

  assertEqual(state.activeCompanionId, "flame-flicker", "legacy active companion");
  RUNTIME_READY_LEGACY_UNLOCKS.forEach((companionId) => {
    assertIncludes(state.unlockedCompanionIds, companionId, `legacy unlocked ${companionId}`);
  });
  assertEqual(state.onboarding.completed, true, "legacy veteran onboarding completed");
  assertEqual(state.onboarding.status, "completed", "legacy veteran onboarding status");
  assertEqual(state.onboarding.veteranAutoCompleted, true, "legacy veteran flag");
});

runCase("legacy active companion without unlock array is kept selectable", () => {
  const state = normalizeState({
    activeCompanionId: "flame-flicker"
  });
  const eligibility = getCompanionRuntimeEligibility("flame-flicker", state);

  assertEqual(state.activeCompanionId, "flame-flicker", "active-only legacy companion");
  assertIncludes(state.unlockedCompanionIds, "flame-flicker", "active-only legacy unlock");
  assertEqual(eligibility.canSelect, true, "active-only legacy selectability");
});

runCase("partial player profile and onboarding deep-merge safely", () => {
  const state = normalizeState({
    playerProfile: {
      displayName: "  星夜   旅人  "
    },
    onboarding: {
      status: "identity",
      identityCompleted: true
    }
  });

  assertEqual(state.playerProfile.displayName, "星夜 旅人", "normalized display name");
  assertEqual(state.playerProfile.identitySkipped, false, "profile default skipped flag");
  assertEqual(state.onboarding.status, "identity", "partial onboarding status");
  assertEqual(state.onboarding.identityCompleted, true, "partial identity complete");
  assertEqual(state.onboarding.guidanceCompleted, false, "partial guidance default");
});

runCase("damaged save values normalize to safe defaults", () => {
  const state = normalizeState({
    playerProfile: "bad-profile",
    onboarding: "bad-onboarding",
    unlockedCompanionIds: "bad-unlocks",
    activeCompanionId: "unknown-companion",
    bond: "bad-bond",
    energy: "bad-energy"
  });

  assertEqual(state.activeCompanionId, "greyshade-cat", "damaged active companion fallback");
  assertArrayEqual(state.unlockedCompanionIds, ["greyshade-cat"], "damaged unlock fallback");
  assertEqual(state.playerProfile.displayName, "", "damaged profile fallback");
  assertEqual(state.onboarding.completed, false, "damaged onboarding fallback");
  assertEqual(state.bond, 0, "damaged bond clamp");
  assertEqual(state.energy, 0, "damaged energy clamp");
});

runCase("veteran heuristic accepts traces, memories, battles, and exploration", () => {
  const variants = [
    { label: "memory", state: { memories: [{ text: "remembered" }] } },
    { label: "trace", state: { habitatTraces: [{ id: "trace-1" }] } },
    { label: "emotional memory", state: { emotionalMemories: [{ text: "echo" }] } },
    { label: "battle", state: { battleRecord: { retreats: 1 } } },
    { label: "exploration", state: { explorationProgress: { totalExplorations: 1, visitCounts: {} } } },
    { label: "touch", state: { firstTouchCompleted: true } }
  ];

  variants.forEach(({ label, state: rawState }) => {
    const state = normalizeState(rawState);
    assertEqual(state.onboarding.completed, true, `${label} veteran completed`);
    assertEqual(state.onboarding.status, "completed", `${label} veteran status`);
  });
});

const failedCases = cases.filter((item) => item.status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failedCases.length, cases }, null, 2));

if (failedCases.length > 0) {
  process.exitCode = 1;
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

function assertArrayEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function assertIncludes(actual, expected, label) {
  if (!Array.isArray(actual) || !actual.includes(expected)) {
    throw new Error(`${label}: expected ${JSON.stringify(actual)} to include ${JSON.stringify(expected)}`);
  }
}
