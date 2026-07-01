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

runCase("first-session meet step survives normalization", () => {
  const state = normalizeState({
    onboarding: {
      status: "meet",
      startedAt: 1782600000000,
      identityCompleted: true,
      guidanceCompleted: true
    }
  });

  assertEqual(state.onboarding.completed, false, "meet step remains incomplete");
  assertEqual(state.onboarding.status, "meet", "meet status preserved");
  assertEqual(state.onboarding.identityCompleted, true, "meet identity complete");
  assertEqual(state.onboarding.guidanceCompleted, true, "meet guidance complete");
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

runCase("fresh default state starts first loop un-run", () => {
  const state = createDefaultState();
  assertEqual(state.onboarding.firstLoop.skippedAt, null, "fresh firstLoop skippedAt");
  assertEqual(state.onboarding.firstLoop.completedAt, null, "fresh firstLoop completedAt");
});

runCase("pre-firstLoop completed save is backfilled and never re-runs the loop", () => {
  // 本欄位出現前寫入的存檔：onboarding 完成但沒有 firstLoop 物件 → 回填 completedAt。
  const state = normalizeState({
    bond: 8,
    onboarding: {
      status: "completed",
      completed: true,
      completedAt: 1782600000000
    }
  });
  assertEqual(state.onboarding.firstLoop.completedAt, 1782600000000, "legacy firstLoop backfill uses completedAt");
  assertEqual(state.onboarding.firstLoop.skippedAt, null, "legacy firstLoop skippedAt stays null");
});

runCase("mid-loop save keeps first loop running despite veteran heuristic", () => {
  // 新玩家第一次觸碰後 isVeteranSave 即為 true，但存檔「有」firstLoop 物件（nulls）
  // → 不得被回填成完成，閉環必須照常進行。
  const state = normalizeState({
    firstTouchCompleted: true,
    onboarding: {
      status: "completed",
      completed: true,
      completedAt: 1782600000000,
      firstLoop: { skippedAt: null, completedAt: null }
    }
  });
  assertEqual(state.onboarding.completed, true, "mid-loop onboarding stays completed");
  assertEqual(state.onboarding.firstLoop.completedAt, null, "mid-loop firstLoop not auto-completed");
  assertEqual(state.onboarding.firstLoop.skippedAt, null, "mid-loop firstLoop not auto-skipped");
});

runCase("skipped first loop persists across normalization", () => {
  const state = normalizeState({
    onboarding: {
      status: "completed",
      completed: true,
      firstLoop: { skippedAt: 1782600001000, completedAt: null }
    }
  });
  assertEqual(state.onboarding.firstLoop.skippedAt, 1782600001000, "skippedAt preserved");
  assertEqual(state.onboarding.firstLoop.completedAt, null, "completedAt untouched");
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
