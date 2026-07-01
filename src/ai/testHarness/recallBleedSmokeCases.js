import { runRaphaelCore } from "../raphaelCore.js";
import { containsExplicitRecallLanguage } from "../memoryRecallPolicy.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";
import { formatSmokeCaseResult } from "./raphaelCoreSmokeCases.js";

const GREYSHADE_COMPANION = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

const BASE_STATE = Object.freeze({
  bond: 8,
  trust: 12,
  defense: 10,
  energy: 7,
  mood: "calm",
  spamScore: 0,
  safeHarborMode: false,
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: "",
  firstTouchCompleted: true
});

function awakeningMemory(now) {
  return {
    id: "emem_awakening_test",
    type: "awakening_memory",
    theme: "心核初醒",
    label: "初醒",
    emotion: "calm",
    intensity: 0.72,
    status: "fresh",
    source: "first_awakening",
    excerpt: "心核在月湖邊第一次睜眼。",
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    lastUpdatedAt: now - 2 * 24 * 60 * 60 * 1000,
    isVisibleInHabitat: true
  };
}

function apologyMemory(now) {
  return {
    id: "emem_apology_test",
    theme: "道歉",
    label: "道歉",
    emotion: "calm",
    intensity: 0.55,
    status: "settled",
    source: "emotion",
    createdAt: now - 4 * 24 * 60 * 60 * 1000,
    lastUpdatedAt: now - 3 * 24 * 60 * 60 * 1000,
    isVisibleInHabitat: true
  };
}

function fatigueMemory(now) {
  return {
    id: "emem_fatigue_test",
    theme: "疲憊",
    label: "疲憊",
    emotion: "fatigue",
    intensity: 0.62,
    status: "settled",
    source: "emotion",
    createdAt: now - 3 * 24 * 60 * 60 * 1000,
    lastUpdatedAt: now - 2 * 24 * 60 * 60 * 1000,
    isVisibleInHabitat: true
  };
}

function runCase({ id, input, stateOverrides = {}, expect = {} }) {
  const now = Date.now();
  const state = {
    ...BASE_STATE,
    ...stateOverrides,
    emotionalMemories: stateOverrides.emotionalMemories || BASE_STATE.emotionalMemories,
    habitatTraces: stateOverrides.habitatTraces || BASE_STATE.habitatTraces
  };

  const coreResult = runRaphaelCore(input, state, {
    now,
    idSuffix: "rcl",
    companion: GREYSHADE_COMPANION,
    repeated: false
  });

  const formatted = formatSmokeCaseResult(input, coreResult);
  const reply = formatted.reply || "";
  const recallBleed = containsExplicitRecallLanguage(reply);
  const awakeningBleed = /心核初醒|第一次醒|初醒|月湖/.test(reply);
  const recallMode = coreResult.perception?.memories?.recallMode || "none";

  const checks = {
    no_explicit_recall: expect.noExplicitRecall ? !recallBleed : true,
    no_awakening_recall: expect.noAwakeningRecall ? !awakeningBleed : true,
    short_quiet_reply: expect.shortQuiet ? reply.length <= 56 : true,
    explicit_recall_allowed: expect.explicitRecall ? recallMode === "explicit_reference" : true,
    fatigue_recall_allowed: expect.fatigueRecall
      ? /不是第一次|營火|上次|重量|慢一點|疲憊|又回來了|「又」|不是第一次回來|身體累|心裡卡住/.test(reply)
      : true,
    no_major_memory_recall: expect.noMajorRecall ? !recallBleed : true,
    gratitude_ok: expect.gratitudeOk ? formatted.intent === "gratitude" : true,
    body_cue_ok: expect.bodyCueOk ? formatted.shouldSpeak === false : true
  };

  return {
    id,
    input,
    ...formatted,
    recallMode,
    recallBleed,
    awakeningBleed,
    checks,
    pass: Object.values(checks).every(Boolean) && !formatted.forbiddenPhraseDetected
  };
}

export function runRecallBleedSmokeCases() {
  clearSessionPreferenceProfiles();
  const now = Date.now();
  const awakening = awakeningMemory(now);
  const apology = apologyMemory(now);
  const fatigue = fatigueMemory(now);

  return [
    runCase({
      id: "A",
      input: "我只是想安靜一下",
      stateOverrides: { emotionalMemories: [awakening, apology] },
      expect: {
        noExplicitRecall: true,
        noAwakeningRecall: true,
        shortQuiet: true
      }
    }),
    runCase({
      id: "B",
      input: "你還記得第一次醒來的時候嗎？",
      stateOverrides: { emotionalMemories: [awakening, fatigue] },
      expect: {
        explicitRecall: true,
        noAwakeningRecall: false
      }
    }),
    runCase({
      id: "C",
      input: "我又覺得自己很累",
      stateOverrides: { emotionalMemories: [awakening, fatigue] },
      expect: {
        fatigueRecall: true,
        noAwakeningRecall: true
      }
    }),
    runCase({
      id: "D",
      input: "抱抱我",
      stateOverrides: { emotionalMemories: [awakening, apology] },
      expect: {
        noAwakeningRecall: true,
        noMajorRecall: true,
        bodyCueOk: true
      }
    }),
    runCase({
      id: "E",
      input: "謝謝你陪我",
      stateOverrides: { emotionalMemories: [awakening, apology] },
      expect: {
        gratitudeOk: true,
        noAwakeningRecall: true,
        noExplicitRecall: true
      }
    })
  ];
}