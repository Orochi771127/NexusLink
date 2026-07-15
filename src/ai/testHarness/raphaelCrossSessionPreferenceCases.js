import { runRaphaelCore } from "../raphaelCore.js";
import {
  clearAllCompanionPreferences,
  clearSessionPreferenceProfiles,
  getCompanionPreferenceProfile
} from "../companionPreferenceProfile.js";
import {
  getPersistedCompanionProfile,
  loadPreferenceStore,
  replacePreferenceStore
} from "../companionPreferenceStore.js";

const GREYSHADE = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

const BASE_STATE = Object.freeze({
  bond: 5,
  trust: 8,
  defense: 10,
  energy: 7,
  mood: "calm",
  spamScore: 0,
  safeHarborMode: false,
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: ""
});

export function runCrossSessionPreferenceTest(companion = GREYSHADE) {
  clearAllCompanionPreferences();

  const state = {
    ...BASE_STATE,
    companionPreferences: { version: 1, updatedAt: 0, companions: {} }
  };
  replacePreferenceStore(state.companionPreferences);
  runRaphaelCore("我只是想安靜一下", state, {
    now: Date.now(),
    idSuffix: "xs1",
    companion
  });
  state.companionPreferences = loadPreferenceStore();

  const sessionProfile = getCompanionPreferenceProfile(companion.id);
  const persistedAfterTurn = getPersistedCompanionProfile(companion.id);

  clearSessionPreferenceProfiles();
  // 模擬重新載入頁面：只從 canonical state snapshot 還原，不讀額外 localStorage key。
  replacePreferenceStore(JSON.parse(JSON.stringify(state.companionPreferences)));

  const rehydrated = getCompanionPreferenceProfile(companion.id);
  const persistedAfterHydrate = getPersistedCompanionProfile(companion.id);

  const checks = {
    session_short_bias: sessionProfile.replyLengthBias === "short",
    session_rest_affinity: Boolean(sessionProfile.restAffinity),
    persisted_written: Boolean(persistedAfterTurn),
    canonical_state_snapshot_written:
      state.companionPreferences.companions?.[companion.id]?.replyLengthBias === "short",
    persisted_short_bias: persistedAfterTurn?.replyLengthBias === "short",
    rehydrated_short_bias: rehydrated.replyLengthBias === "short",
    rehydrated_rest_affinity: Boolean(rehydrated.restAffinity),
    store_intact: persistedAfterHydrate?.replyLengthBias === "short"
  };

  return {
    companionId: companion.id,
    sessionProfile: {
      replyLengthBias: sessionProfile.replyLengthBias,
      restAffinity: sessionProfile.restAffinity,
      learnedSignals: [...sessionProfile.learnedSignals]
    },
    rehydratedProfile: {
      replyLengthBias: rehydrated.replyLengthBias,
      restAffinity: rehydrated.restAffinity,
      learnedSignals: [...rehydrated.learnedSignals]
    },
    checks,
    pass: Object.values(checks).every(Boolean)
  };
}

export function installCrossSessionPreferenceHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_CROSS_SESSION_PREF__ = {
    run: runCrossSessionPreferenceTest
  };
}
