/**
 * Extensible NLU training cases — add sentences here to teach Raphael new phrasing.
 * Each case checks: topic/dialogueAct grounding, non-generic reply, optional strategy.
 */
import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";
import { clearDialogueState } from "../dialogue/dialogueStateTracker.js";

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
    expect: {
      topic: "work_pressure",
      dialogueAct: "venting",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /工作|壓力|任務|老闆/
    }
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
    expect: {
      topic: ["social_conflict", "emotion"],
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /酸|悶|否定|人際|情緒/
    }
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
  },
  {
    id: "TR-9",
    input: "安安",
    expect: {
      dialogueAct: "greeting",
      strategy: "light_greeting",
      noGeneric: true,
      mentions: /在|安安|聽見/
    }
  },
  {
    id: "TR-10",
    input: "你好嗎",
    expect: {
      dialogueAct: "greeting",
      strategy: "light_greeting",
      noGeneric: true,
      mentions: /還好|你呢|怎麼樣|聽見/
    }
  },
  {
    id: "TR-11",
    input: "吃飯沒阿",
    expect: {
      dialogueAct: "greeting",
      strategy: "light_greeting",
      noGeneric: true,
      mentions: /吃|你呢|顧好/
    }
  },
  {
    id: "TR-12",
    input: "聽說妳很型喔",
    expect: {
      dialogueAct: "greeting",
      strategy: "light_greeting",
      noGeneric: true,
      mentions: /型|害羞|心情|夸/
    }
  },
  {
    id: "TR-13",
    input: "Soul Talk 面板被 HUD 擋住了，我現在沒辦法好好操作",
    expect: {
      topic: "hud_ui",
      strategy: "practical_clarification",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /Soul Talk|HUD|擋|面板/
    }
  },
  {
    id: "TR-14",
    input: "今天只是有點懶懶的",
    expect: {
      topic: "daily_life",
      strategy: "contextual_ack",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /懶懶|日子|今天|用力|慢慢/
    }
  },
  {
    id: "TR-15",
    input: "我下班了，腦袋空空的",
    expect: {
      topic: "daily_life",
      strategy: "contextual_ack",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /下班|腦袋空|放空|肩膀|復盤/
    }
  },
  {
    id: "TR-16",
    input: "剛吃完飯，有點想躺一下",
    expect: {
      topic: "daily_life",
      strategy: "contextual_ack",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /吃|躺|身體|安靜|慢慢/
    }
  },

  // ── 訓練批次 2026-07-13（詞庫/NLU 擴充：日常質感、正向分享、失眠、簡體、社交細節）──
  {
    id: "TR-17",
    input: "今天整天都在追劇耍廢",
    expect: {
      topic: "daily_life",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /追劇|耍廢|日子|日常|放|算數/
    }
  },
  {
    id: "TR-18",
    input: "週末咻一下就沒了，想到明天要上班就悶",
    expect: {
      topic: "daily_life",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /週末|收假|明天|慢慢|悶/
    }
  },
  {
    id: "TR-19",
    input: "下雨天整個人懶懶的，不想出門",
    expect: {
      topic: "daily_life",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /雨|懶|出門|日子|窩/
    }
  },
  {
    id: "TR-20",
    input: "睡前滑手機滑太久了，現在有點空空的",
    expect: {
      topic: "daily_life",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /滑|手機|放|空|睡/
    }
  },
  {
    id: "TR-21",
    input: "今天小小的完成了一件事，有點開心",
    expect: {
      noGeneric: true,
      mentions: /完成|開心|算數|收下|亮/
    }
  },
  {
    id: "TR-22",
    input: "好無聊喔，不知道要幹嘛",
    expect: {
      topic: "daily_life",
      noGeneric: true,
      mentions: /無聊|發呆|不用|待著|幹嘛/
    }
  },
  {
    id: "TR-23",
    input: "心好累，感覺被掏空",
    expect: {
      topic: "emotion",
      noGeneric: true,
      mentions: /接住|累|放|慢/
    }
  },
  {
    id: "TR-24",
    input: "我今天压力好大，工作都做不完",
    expect: {
      topic: "work_pressure",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /壓力|压力|工作|做不完|卡|煩/
    }
  },
  {
    id: "TR-25",
    input: "我好难过，想哭",
    expect: {
      noGeneric: true,
      mentions: /悶|接住|哭|難過|难过|慢/
    }
  },
  {
    id: "TR-26",
    input: "跟朋友冷戰中，好煩",
    expect: {
      topic: "social_conflict",
      noGeneric: true,
      mentions: /人際|悶|放|結論|冷戰/
    }
  },
  {
    id: "TR-27",
    input: "被同事已讀不回，覺得被排擠了",
    expect: {
      topic: "social_conflict",
      noGeneric: true,
      hasSpecificDetail: true,
      mentions: /人際|悶|放|結論|排擠|已讀/
    }
  },
  {
    id: "TR-28",
    input: "我要去睡了，晚安",
    expect: {
      strategy: ["quiet_presence", "holding_space"],
      noGeneric: true,
      mentions: /晚安|睡|燈|看著/
    }
  },
  {
    id: "TR-29",
    input: "失眠，躺很久都睡不著",
    expect: {
      noGeneric: true,
      mentions: /睡|夜|呼吸|逼|慢/
    }
  },
  {
    id: "TR-30",
    input: "早安",
    expect: {
      dialogueAct: "greeting",
      strategy: "light_greeting",
      noGeneric: true,
      mentions: /早|慢慢|亮|在/
    }
  },
]);

export function runNluTrainingCase(testCase) {
  clearDialogueState(GREYSHADE.id);
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
    has_reply: Boolean(reply.trim()),
    specific_detail_ok: expect.hasSpecificDetail
      ? Boolean(coreResult.nlu?.semanticFrame?.specificDetail?.text)
      : true
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
