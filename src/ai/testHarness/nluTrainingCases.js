/**
 * Extensible NLU training cases — add sentences here to teach Raphael new phrasing.
 * Each case checks: topic/dialogueAct grounding, non-generic reply, optional strategy.
 */
import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";

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
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: "",
  firstTouchCompleted: true
});

const GENERIC_BANNED =
  /我聽見了[，,。]?\s*我們慢一點|好[，,]?\s*我聽到了[，,]?\s*我們慢一點|^我聽見你在說.+。我們先從這個點開始。$|^我在[。.]?$/;

export const NLU_TRAINING_CASES = Object.freeze([
  {
    id: "TR-1",
    input: "我最近壓力好大，老闆一直丟任務給我",
    expect: { topic: "work_pressure", dialogueAct: "venting", noGeneric: true, mentions: /工作|壓力|任務/ }
  },
  {
    id: "TR-2",
    input: "我不是要你做什麼，我只是想講完這件事",
    expect: {
      strategy: ["holding_space", "quiet_presence", "answer_or_clarify"],
      noGeneric: true,
      mentions: /陪|少說|放在|答案|講完/
    }
  },
  {
    id: "TR-3",
    input: "你剛剛回我有點像在念稿，可以自然一點嗎",
    expect: {
      dialogueAct: ["correcting_raphael", "giving_feedback"],
      strategy: ["acknowledge_generic_failure", "acknowledge_feedback"],
      noGeneric: true,
      mentions: /模板|重複|自然|聽懂|改|收到/
    }
  },
  {
    id: "TR-4",
    input: "我有點想靠近你，但希望你別貼太近",
    expect: { strategy: ["boundary_set", "holding_space"], mentions: /靠近|退後|半步|空間|貼/ }
  },
  {
    id: "TR-5",
    input: "我今天被人酸了一句，心裡悶悶的",
    expect: { topic: ["social_conflict", "emotion"], noGeneric: true, mentions: /悶|否定|人際|情緒/ }
  },
  {
    id: "TR-6",
    input: "我只是卡住，不是想要安慰句",
    expect: { noGeneric: true, mentions: /卡住|釐清|安慰|情緒/ }
  },
  {
    id: "TR-7",
    input: "我想出去看看地圖，但現在沒什麼力氣",
    expect: { topic: "exploration", strategy: ["exploration_invite"], mentions: /探索|湖面|沒力|慢慢/ }
  },
  {
    id: "TR-8",
    input: "剛剛對你語氣太差了，抱歉",
    expect: { dialogueAct: "apologizing", noGeneric: true, mentions: /道歉|節奏|距離|收到/ }
  }
]);

export function runNluTrainingCase(testCase) {
  const coreResult = runRaphaelCore(testCase.input, { ...BASE_STATE }, {
    now: Date.now(),
    idSuffix: "tr",
    companion: GREYSHADE,
    repeated: false
  });

  const reply = coreResult.reply || "";
  const forbidden = detectForbiddenPhrases(reply);
  const expect = testCase.expect || {};
  const checks = {
    topic_ok: matchList(coreResult.nlu?.topic, expect.topic),
    dialogue_act_ok: matchList(coreResult.nlu?.dialogueAct, expect.dialogueAct),
    strategy_ok: matchList(coreResult.responseStrategy?.strategy, expect.strategy),
    mentions_ok: expect.mentions ? expect.mentions.test(reply) : true,
    no_generic: expect.noGeneric ? !GENERIC_BANNED.test(reply) : true,
    has_reply: Boolean(reply.trim())
  };

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
    pass: Object.values(checks).every(Boolean) && !forbidden.hasForbidden
  };
}

export function runAllNluTrainingCases() {
  clearSessionPreferenceProfiles();
  return NLU_TRAINING_CASES.map(runNluTrainingCase);
}

function matchList(actual, expected) {
  if (!expected) return true;
  const list = Array.isArray(expected) ? expected : [expected];
  return list.includes(actual);
}

export function installNluTrainingHarness(windowRef) {
  if (!windowRef) return;
  windowRef.runNluTrainingCase = runNluTrainingCase;
  windowRef.runAllNluTrainingCases = runAllNluTrainingCases;
}