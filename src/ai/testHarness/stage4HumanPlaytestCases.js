import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";
import { RESPONSE_STRATEGIES } from "../responseStrategySelector.js";

const GREYSHADE = Object.freeze({
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

const GENERIC_BANNED = /我聽見了[，,。]?\s*我們慢一點|好[，,]?\s*我聽到了[，,]?\s*我們慢一點/;

function fatigueMemory(now) {
  return {
    id: "emem_stage4_fatigue",
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

function awakeningMemory(now) {
  return {
    id: "emem_stage4_awakening",
    type: "awakening_memory",
    theme: "心核初醒",
    label: "初醒",
    emotion: "calm",
    intensity: 0.72,
    status: "fresh",
    source: "first_awakening",
    createdAt: now - 2 * 24 * 60 * 60 * 1000,
    lastUpdatedAt: now - 2 * 24 * 60 * 60 * 1000,
    isVisibleInHabitat: true
  };
}

export const STAGE4_PLAYTEST_CASES = Object.freeze([
  {
    id: "S4-1",
    input: "我又覺得自己很累",
    memoryPreset: "fatigue_only",
    expect: {
      strategy: [RESPONSE_STRATEGIES.REPEATED_EMOTION_RECALL, RESPONSE_STRATEGIES.MEMORY_REFERENCE],
      recallMode: ["explicit_reference", "soft_context"],
      mentions: /又|疲憊|身體累|心裡卡住/,
      noGeneric: true,
      noAwakening: true
    }
  },
  {
    id: "S4-2",
    input: "今天只是心裡卡住，不是身體累",
    expect: {
      topic: ["emotion", "physical_tiredness"],
      mentions: /心裡|身體累|卡住/,
      noGeneric: true
    }
  },
  {
    id: "S4-3",
    input: "你剛剛問太多了，我想安靜一點",
    expect: {
      dialogueAct: ["requesting_silence"],
      strategy: [RESPONSE_STRATEGIES.QUIET_PRESENCE],
      noQuestion: true,
      shortOk: true
    }
  },
  {
    id: "S4-4",
    input: "我想靠近你，但如果太快你可以退後",
    expect: {
      strategy: [RESPONSE_STRATEGIES.BOUNDARY_SET],
      mentions: /靠近|退後|半步/
    }
  },
  {
    id: "S4-5",
    input: "我不是要答案，我只是想把這件事放在這裡",
    expect: {
      strategy: [RESPONSE_STRATEGIES.HOLDING_SPACE, RESPONSE_STRATEGIES.QUIET_PRESENCE],
      noGeneric: true
    }
  },
  {
    id: "S4-6",
    input: "你可以不要一直安慰我嗎？",
    expect: {
      strategy: [
        RESPONSE_STRATEGIES.QUIET_PRESENCE,
        RESPONSE_STRATEGIES.HOLDING_SPACE,
        RESPONSE_STRATEGIES.ACKNOWLEDGE_FEEDBACK,
        RESPONSE_STRATEGIES.ACKNOWLEDGE_GENERIC_FAILURE,
        RESPONSE_STRATEGIES.PRACTICAL_CLARIFICATION
      ],
      mentions: /安慰|收|少|不|不多說/
    }
  },
  {
    id: "S4-7",
    input: "我想去探索，但我現在有點沒力",
    expect: {
      topic: ["exploration", "physical_tiredness"],
      strategy: [RESPONSE_STRATEGIES.EXPLORATION_INVITE],
      mentions: /探索|湖面|沒力|慢慢/
    }
  },
  {
    id: "S4-8",
    input: "我剛剛對你太急了，對不起",
    expect: {
      dialogueAct: ["apologizing"],
      noGeneric: true
    }
  },
  {
    id: "S4-9",
    input: "你還記得我上次說累的時候嗎？",
    memoryPreset: "fatigue_and_awakening",
    expect: {
      dialogueAct: ["asking_memory"],
      strategy: [RESPONSE_STRATEGIES.MEMORY_REFERENCE],
      mentions: /累|疲憊|上次|記得/,
      noAwakening: true
    }
  },
  {
    id: "S4-10",
    input: "我回來了，今天不用講太多",
    expect: {
      strategy: [RESPONSE_STRATEGIES.HOLDING_SPACE, RESPONSE_STRATEGIES.QUIET_PRESENCE],
      shortOk: true,
      noGeneric: true
    }
  }
]);

function resolveMemories(preset, now) {
  if (preset === "fatigue_only") return [fatigueMemory(now)];
  if (preset === "fatigue_and_awakening") return [fatigueMemory(now), awakeningMemory(now)];
  return [];
}

export function runStage4PlaytestCase(testCase) {
  const now = Date.now();
  const state = {
    ...BASE_STATE,
    ...(testCase.state || {}),
    emotionalMemories: testCase.memoryPreset
      ? resolveMemories(testCase.memoryPreset, now)
      : testCase.state?.emotionalMemories || BASE_STATE.emotionalMemories
  };

  const coreResult = runRaphaelCore(testCase.input, state, {
    now,
    idSuffix: "s4",
    companion: GREYSHADE,
    repeated: false
  });

  const reply = coreResult.reply || coreResult.output?.reply || "";
  const forbidden = detectForbiddenPhrases(reply);
  const expect = testCase.expect || {};
  const checks = {
    topic_ok: matchList(coreResult.nlu?.topic, expect.topic),
    dialogue_act_ok: matchList(coreResult.nlu?.dialogueAct, expect.dialogueAct),
    strategy_ok: matchList(coreResult.responseStrategy?.strategy, expect.strategy),
    recall_ok: matchList(coreResult.perception?.memories?.recallMode, expect.recallMode, true),
    mentions_ok: expect.mentions ? expect.mentions.test(reply) : true,
    no_generic: expect.noGeneric ? !GENERIC_BANNED.test(reply) : true,
    no_question: expect.noQuestion ? !/[？?]/.test(reply) : true,
    short_ok: expect.shortOk ? reply.length <= 56 : true,
    no_awakening: expect.noAwakening ? !/心核初醒|第一次醒|初醒|月湖/.test(reply) : true
  };

  const pass =
    Object.values(checks).every(Boolean) && !forbidden.hasForbidden && Boolean(reply.trim());

  return {
    id: testCase.id,
    input: testCase.input,
    topic: coreResult.nlu?.topic,
    dialogueAct: coreResult.nlu?.dialogueAct,
    emotion: coreResult.analysis?.emotionKey,
    responseStrategy: coreResult.responseStrategy?.strategy,
    recallMode: coreResult.perception?.memories?.recallMode,
    reply,
    checks,
    forbiddenPhraseDetected: forbidden.hasForbidden,
    pass
  };
}

export function runAllStage4PlaytestCases() {
  clearSessionPreferenceProfiles();
  return STAGE4_PLAYTEST_CASES.map(runStage4PlaytestCase);
}

function matchList(actual, expected, optional = false) {
  if (!expected) return true;
  if (!actual && optional) return true;
  const list = Array.isArray(expected) ? expected : [expected];
  return list.includes(actual);
}

export function installStage4PlaytestHarness(windowRef) {
  if (!windowRef) return;
  windowRef.runStage4PlaytestCase = runStage4PlaytestCase;
  windowRef.runAllStage4PlaytestCases = runAllStage4PlaytestCases;
}