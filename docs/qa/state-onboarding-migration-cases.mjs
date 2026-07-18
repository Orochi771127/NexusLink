import { createDefaultState, normalizeState } from "../../src/state/store.js";
import { getCompanionRuntimeEligibility } from "../../src/data/companionRuntimePolicy.js";
import { evaluateActionEffect } from "../../src/engine/actionEffectEngine.js";
import { advanceChapterProgress } from "../../src/data/chapterRegistry.js";

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
  assertEqual(state.energy, 10, "damaged energy uses relationship safe baseline");
});

runCase("CH-3 initial bond: chosen-only unlock survives normalization (no greyshade backfill)", () => {
  // 初遇選了焰紋狐（fresh 嚴格模型 unlocked=[flame-flicker]）→ 每次 boot 的
  // normalizeState 不得把灰影貓塞回來（「選後即唯一」）。
  const state = normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker"],
    onboarding: { status: "meet", identityCompleted: true, guidanceCompleted: true }
  });
  assertEqual(state.activeCompanionId, "flame-flicker", "chosen active preserved");
  assertArrayEqual(state.unlockedCompanionIds, ["flame-flicker"], "chosen-only unlock preserved");
});

runCase("CH-3 initial bond: unchosen greyshade is chapter_locked, chosen fox selectable", () => {
  const state = normalizeState({
    activeCompanionId: "flame-flicker",
    unlockedCompanionIds: ["flame-flicker"]
  });
  const fox = getCompanionRuntimeEligibility("flame-flicker", state);
  const greyshade = getCompanionRuntimeEligibility("greyshade-cat", state);
  assertEqual(fox.canSelect, true, "chosen fox selectable");
  assertEqual(greyshade.canSelect, false, "unchosen greyshade locked");
  assertEqual(greyshade.reason, "chapter_locked", "unchosen greyshade reason");
});

runCase("CH-3 veteran saves keep their full unlock list (no confiscation)", () => {
  const state = normalizeState({
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "ice-talon"],
    bond: 20
  });
  assertIncludes(state.unlockedCompanionIds, "greyshade-cat", "veteran greyshade kept");
  assertIncludes(state.unlockedCompanionIds, "ice-talon", "veteran ice-talon kept");
});

runCase("CH-3 empty unlock list falls back to default companion", () => {
  const state = normalizeState({
    unlockedCompanionIds: []
  });
  assertArrayEqual(state.unlockedCompanionIds, ["greyshade-cat"], "empty unlock fallback");
  assertEqual(state.activeCompanionId, "greyshade-cat", "empty unlock active fallback");
});

runCase("CH-3 active companion outside unlock list is preserved via active-preserve", () => {
  // 壞存檔：active 不在 unlocked → normalize 用 preserveActiveCompanion 補進，
  // 玩家的現任夥伴不會憑空消失。
  const state = normalizeState({
    activeCompanionId: "ice-talon",
    unlockedCompanionIds: ["flame-flicker"]
  });
  assertIncludes(state.unlockedCompanionIds, "ice-talon", "active preserved into unlocks");
  assertEqual(state.activeCompanionId, "ice-talon", "active kept");
});

runCase("CH-4 fresh state starts at chapter 1 with none completed", () => {
  const state = createDefaultState();
  assertEqual(state.chapterProgress.current, 1, "fresh chapter current");
  assertArrayEqual(state.chapterProgress.completed, [], "fresh chapter completed");
});

runCase("CH-4 legacy save without chapterProgress is backfilled to chapter 1", () => {
  const state = normalizeState({ bond: 30, firstTouchCompleted: true });
  assertEqual(state.chapterProgress.current, 1, "legacy chapter backfill current");
  assertArrayEqual(state.chapterProgress.completed, [], "legacy chapter backfill completed");
});

runCase("CH-4 damaged chapterProgress values clamp and clean", () => {
  const state = normalizeState({
    chapterProgress: { current: 99, completed: [3, "bad", 3, 0, 8, 1.7, 2] }
  });
  assertEqual(state.chapterProgress.current, 7, "chapter current clamped to max");
  // "bad"→濾掉、0/8→越界濾掉、1.7→round 2、重複 3 與(1.7→2 vs 2)→去重 → [2,3]
  assertArrayEqual(state.chapterProgress.completed, [2, 3], "chapter completed cleaned");
});

runCase("CH-4 advanceChapterProgress moves current forward and records completion", () => {
  const step1 = advanceChapterProgress({ current: 1, completed: [] }, 1);
  assertEqual(step1.current, 2, "advance to chapter 2");
  assertArrayEqual(step1.completed, [1], "chapter 1 recorded");
  const replay = advanceChapterProgress(step1, 1); // 重打舊章：不回退、不重複
  assertEqual(replay.current, 2, "replay does not regress");
  assertArrayEqual(replay.completed, [1], "replay does not duplicate");
  const final = advanceChapterProgress({ current: 7, completed: [1, 2, 3, 4, 5, 6] }, 7);
  assertEqual(final.current, 7, "final chapter caps");
  assertArrayEqual(final.completed, [1, 2, 3, 4, 5, 6, 7], "final chapter recorded");
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

runCase("calm sync creates one care memory and quiet recovery deltas", () => {
  const state = createCalmSyncState({ energy: 1, touchFatigue: 5, trust: 10, defense: 20 });
  const result = evaluateActionEffect(state, "care", "calm_sync", { syncedCycles: 0 });

  assertEqual(result.statePatch.energy, 3, "quiet calm sync energy delta");
  assertEqual(result.statePatch.touchFatigue, 3, "quiet calm sync touch fatigue delta");
  assertEqual(result.statePatch.mood, "tired", "low-energy calm sync stays tired");
  assertEqual(result.statePatch.memories.some((memory) => memory.type === "care_calm_sync"), true, "calm sync memory");
});

runCase("calm sync synced cycles can grant trust and a breath trace", () => {
  const state = createCalmSyncState({ energy: 4, touchFatigue: 4, trust: 10, defense: 20 });
  const result = evaluateActionEffect(state, "care", "calm_sync", { syncedCycles: 4 });

  assertEqual(result.statePatch.energy, 9, "synced calm sync energy delta");
  assertEqual(result.statePatch.touchFatigue, 2, "synced calm sync fatigue delta");
  assertEqual(result.statePatch.defense, 19, "synced calm sync boundary delta");
  assertEqual(result.statePatch.trust, 11, "synced calm sync trust grant");
  assertEqual(result.statePatch.habitatTraces.some((trace) => trace.type === "calm_breath_trace"), true, "calm breath trace");
});

runCase("calm sync trust cooldown blocks repeat trust and trace", () => {
  const state = createCalmSyncState({
    energy: 4,
    trust: 10,
    defense: 20,
    memories: [{ type: "care_calm_sync", createdAt: Date.now() }]
  });
  const result = evaluateActionEffect(state, "care", "calm_sync", { syncedCycles: 4 });

  assertEqual(result.statePatch.trust, 10, "cooldown trust unchanged");
  assertEqual(Boolean(result.statePatch.habitatTraces?.some((trace) => trace.type === "calm_breath_trace")), false, "cooldown trace blocked");
});

runCase("calm sync respects refusal state boundaries", () => {
  const state = createCalmSyncState({
    energy: 4,
    trust: 10,
    defense: 50,
    mood: "defensive",
    lastTouchReaction: "reject"
  });
  const result = evaluateActionEffect(state, "care", "calm_sync", { syncedCycles: 4 });

  assertEqual(result.statePatch.trust, 10, "refusal trust unchanged");
  assertEqual(result.statePatch.defense, 50, "refusal defense unchanged");
  assertEqual(result.statePatch.mood, "calm", "refusal can settle without reward");
});

runCase("calm sync action alias resolves safely", () => {
  const state = createCalmSyncState({ energy: 4, touchFatigue: 4, trust: 10, defense: 20 });
  const result = evaluateActionEffect(state, "care", "Calm sync", { syncedCycles: 2 });

  assertEqual(result.statePatch.energy, 8, "calm sync alias energy delta");
  assertEqual(result.statePatch.memories.some((memory) => memory.type === "care_calm_sync"), true, "calm sync alias memory");
});

runCase("fresh default state has empty resonance", () => {
  const state = createDefaultState();
  assertEqual(JSON.stringify(state.resonance), JSON.stringify({ chapterMarks: {}, companions: {} }), "fresh resonance shape");
});

runCase("old save without resonance backfills empty objects", () => {
  const state = normalizeState({ bond: 12, chapterProgress: { current: 2, completed: [1] } });
  assertEqual(typeof state.resonance, "object", "resonance backfilled");
  assertEqual(JSON.stringify(state.resonance.chapterMarks), "{}", "chapterMarks backfilled empty");
  assertEqual(JSON.stringify(state.resonance.companions), "{}", "companions backfilled empty");
});

runCase("valid resonance data survives normalize", () => {
  const state = normalizeState({
    resonance: {
      chapterMarks: { 2: { bondAtStart: 10, trustAtStart: 8, blockedTouchAtStart: 1, overwhelmedCount: 1, enteredAt: 1751000000000, reaskedAt: null } },
      companions: { sprigfawn: { metAt: 1751000000001, lastAskAt: 1751000000002, declinedCount: 1, joinedAt: null } }
    }
  });
  assertEqual(state.resonance.chapterMarks[2].bondAtStart, 10, "mark bondAtStart kept");
  assertEqual(state.resonance.chapterMarks[2].overwhelmedCount, 1, "mark overwhelmedCount kept");
  assertEqual(state.resonance.companions.sprigfawn.declinedCount, 1, "companion declinedCount kept");
  assertEqual(state.resonance.companions.sprigfawn.joinedAt, null, "companion joinedAt kept null");
});

runCase("dirty resonance data is cleaned by normalize", () => {
  const state = normalizeState({
    resonance: {
      chapterMarks: {
        0: { bondAtStart: 5 },
        9: { bondAtStart: 5 },
        3: { bondAtStart: -20, trustAtStart: "abc", overwhelmedCount: 99999 }
      },
      companions: {
        "not-a-real-companion": { metAt: 123 },
        auriowl: { metAt: "bad", declinedCount: -3 }
      }
    }
  });
  assertEqual(state.resonance.chapterMarks[0], undefined, "chapter 0 dropped");
  assertEqual(state.resonance.chapterMarks[9], undefined, "chapter 9 dropped");
  assertEqual(state.resonance.chapterMarks[3].bondAtStart, 0, "negative bondAtStart clamped");
  assertEqual(state.resonance.chapterMarks[3].trustAtStart, 0, "non-numeric trustAtStart cleaned");
  assertEqual(state.resonance.chapterMarks[3].overwhelmedCount, 999, "overwhelmedCount clamped");
  assertEqual(state.resonance.companions["not-a-real-companion"], undefined, "unknown companion dropped");
  assertEqual(state.resonance.companions.auriowl.metAt, null, "bad metAt cleaned to null");
  assertEqual(state.resonance.companions.auriowl.declinedCount, 0, "negative declinedCount clamped");
});

runCase("canonical state owns audio mute and companion preferences", () => {
  const state = createDefaultState();
  assertEqual(state.settings.audioMuted, false, "fresh audio mute default");
  assertEqual(state.companionPreferences.version, 1, "preference store version");
  assertEqual(Object.keys(state.companionPreferences.companions).length, 0, "fresh preference store empty");
});

runCase("lastSeenAt accepts only positive finite timestamps", () => {
  const valid = 1782600000000;
  assertEqual(normalizeState({ lastSeenAt: valid }).lastSeenAt, valid, "valid lastSeenAt preserved");
  for (const damaged of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "bad"]) {
    const before = Date.now();
    const migrated = normalizeState({ lastSeenAt: damaged }).lastSeenAt;
    const after = Date.now();
    if (!Number.isFinite(migrated) || migrated < before || migrated > after) {
      throw new Error(`damaged lastSeenAt ${String(damaged)} did not migrate to now: ${migrated}`);
    }
  }
});

runCase("companion preferences normalize inside the main state", () => {
  const state = normalizeState({
    companionPreferences: {
      version: 1,
      updatedAt: 1782600000000,
      companions: {
        "greyshade-cat": {
          replyLengthBias: "short",
          boundarySensitivity: 2,
          interactionPace: -2,
          learnedSignals: Array.from({ length: 16 }, (_, index) => `signal-${index}`)
        },
        "unknown-companion": { replyLengthBias: "short" }
      }
    }
  });
  const profile = state.companionPreferences.companions["greyshade-cat"];
  assertEqual(profile.replyLengthBias, "short", "reply length preserved");
  assertEqual(profile.boundarySensitivity, 1, "boundary sensitivity clamped");
  assertEqual(profile.interactionPace, -1, "interaction pace clamped");
  assertEqual(profile.learnedSignals.length, 12, "learned signals rolling limit");
  assertEqual(state.companionPreferences.companions["unknown-companion"], undefined, "unknown companion dropped");
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

function createCalmSyncState(overrides = {}) {
  return {
    ...createDefaultState(),
    energy: 4,
    touchFatigue: 4,
    trust: 10,
    defense: 20,
    mood: "warm",
    memories: [],
    habitatTraces: [],
    ...overrides
  };
}
