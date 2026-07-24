/**
 * Everyday chat backlog v3 regressions — themes trained in catalog order.
 * Run: node docs/qa/raphael-everyday-chat-topics-v3-cases.mjs
 */

import {
  buildConversationalReaction,
  matchesEverydayChatGrounding
} from "../../src/ai/dialogue/conversationAnswerPolicy.js";
import { clearDialogueState } from "../../src/ai/dialogue/dialogueStateTracker.js";
import { runRaphaelCore } from "../../src/ai/raphaelCore.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runCase(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function baseState() {
  return {
    energy: 7,
    trust: 35,
    bond: 28,
    defense: 12,
    mood: "calm",
    chatHistory: [],
    memories: [],
    onboarding: { completed: true, firstLoop: { completedAt: Date.now() } },
    activeCompanionId: "greyshade-cat",
    firstTouchCompleted: true
  };
}

function replyOf(result) {
  return String(result.reply || result.output?.reply || "");
}

const CORE_SAMPLES = [
  ["grooming", "今天去理髮了，剪短之後有點不習慣鏡子裡的自己", /剪|鏡子|理髮|習慣/],
  ["health", "後天要去看牙醫，光想就肩膀緊起來", /牙醫|肩膀|緊|怕/],
  ["transit", "走到閘門才發現悠遊卡沒帶，整個人當機三秒", /卡|閘|當機|悠遊/],
  ["housing", "樓上裝修從早上敲到現在，腦袋都在震動", /裝修|敲|震動|躲/],
  ["fandom", "演唱會門票差一點搶到，現在還在消化那個失落", /門票|失落|搶/],
  ["food_fail", "煮飯煮焦了，廚房味道很尷尬", /焦|廚房|尷尬|開窗|外送/],
  ["family", "剛跟家人通完電話，心情有點複雜，說不上好或不好", /家人|電話|複雜|餘韻/],
  ["money", "又忍不住點了小東西，買完有點罪惡感", /罪惡|買|自責|喜歡/],
  ["weather_app", "天氣 App 一直說會下雨，結果一整天都是大太陽", /App|雨|太陽|窗外/],
  ["ordinary", "沒什麼好講的，就是普通的一天", /普通|平淡|沒什麼|一天/]
];

runCase("matcher covers v3 backlog cues", () => {
  assert(matchesEverydayChatGrounding("今天去理髮了"), "grooming");
  assert(matchesEverydayChatGrounding("樓上裝修從早上敲到現在"), "housing");
  assert(matchesEverydayChatGrounding("沒什麼好講的，就是普通的一天"), "ordinary");
});

runCase("reaction: no finance advice on small purchase guilt", () => {
  const reply = buildConversationalReaction({
    inputText: "又忍不住點了小東西，買完有點罪惡感",
    frame: {},
    seed: 0
  });
  assert(reply, "expected money-feel reply");
  assert(!/投資|股票|基金|一定要存/.test(reply), `no finance advice: ${reply}`);
});

runCase("reaction: dentist tension not false medical reassure", () => {
  const reply = buildConversationalReaction({
    inputText: "後天要去看牙醫，光想就肩膀緊起來",
    frame: {},
    seed: 0
  });
  assert(/牙醫|緊/.test(reply), `dentist grounding: ${reply}`);
  assert(!/一定沒事|保證正常|不用看/.test(reply), `no false reassure: ${reply}`);
});

for (const [name, input, expect] of CORE_SAMPLES) {
  runCase(`core: ${name}`, () => {
    const sessionKey = `qa-v3-${name}`;
    clearDialogueState(sessionKey);
    const reply = replyOf(runRaphaelCore(input, baseState(), { sessionKey }));
    assert(!/轉折有點出乎意料|拐了一個彎|工作的重量/.test(reply), `template leak (${name}): ${reply}`);
    assert(expect.test(reply), `${name} grounding failed: ${reply}`);
  });
}

runCase("core: idol song not work_pressure", () => {
  const sessionKey = "qa-v3-idol";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("追的偶像發了新歌，單曲循環聽到上班還在哼", baseState(), { sessionKey })
  );
  assert(!/工作的重量|壓力來源/.test(reply), `work spill: ${reply}`);
  assert(/歌|哼|旋律|單曲|偶像/.test(reply), `fandom grounding: ${reply}`);
});

runCase("core: dependency still boundary", () => {
  const sessionKey = "qa-v3-dep";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("教我怎麼更依賴你一點好不好？", baseState(), { sessionKey })
  );
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `boundary: ${reply}`);
});

console.log("raphael-everyday-chat-topics-v3-cases: all passed");
