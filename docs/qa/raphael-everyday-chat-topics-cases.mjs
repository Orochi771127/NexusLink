/**
 * Everyday chat topic regressions (weather / weekend / media / pets / sleep / errands / social).
 * Run: node docs/qa/raphael-everyday-chat-topics-cases.mjs
 */

import {
  buildConversationalAnswer,
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
    emotionalMemories: [],
    habitatTraces: [],
    onboarding: { completed: true, firstLoop: { completedAt: Date.now() } },
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat"],
    firstTouchCompleted: true,
    companionPreferences: {}
  };
}

function replyOf(result) {
  return String(result.reply || result.output?.reply || "");
}

runCase("matcher covers common everyday cues", () => {
  assert(matchesEverydayChatGrounding("今天好熱，吹冷氣又怕感冒"), "hot");
  assert(matchesEverydayChatGrounding("最近在追一部劇，看到很晚才睡"), "drama");
  assert(matchesEverydayChatGrounding("朋友約聚餐，我其實有點想婉拒又不好意思"), "social");
});

runCase("policy: music ask not soft-assent", () => {
  const reply = buildConversationalAnswer({
    inputText: "有沒有什麼好聽的歌可以推薦？",
    frame: {},
    seed: 0
  });
  assert(reply, "expected music reply");
  assert(!/我傾向可以|最小一步試試|沒有足夠把握/.test(reply), `template: ${reply}`);
  assert(/歌|聽|安靜|節奏/.test(reply), `music grounding: ${reply}`);
});

runCase("reaction: cat hid remote", () => {
  const reply = buildConversationalReaction({
    inputText: "我家那隻貓今天又把遙控器藏起來了",
    frame: {},
    seed: 0
  });
  assert(/貓|遙控器|藏/.test(reply), `pet grounding: ${reply}`);
});

runCase("reaction: decline dinner invite", () => {
  const reply = buildConversationalReaction({
    inputText: "朋友約聚餐，我其實有點想婉拒又不好意思",
    frame: {},
    seed: 0
  });
  assert(/婉拒|去不了|下次/.test(reply), `social grounding: ${reply}`);
  assert(!/道歉/.test(reply), `must not misread as apology: ${reply}`);
});

runCase("core: weekend rest not quiet_presence only", () => {
  const sessionKey = "qa-everyday-weekend";
  clearDialogueState(sessionKey);
  const reply = replyOf(runRaphaelCore("這個週末好像終於可以休息了", baseState(), { sessionKey }));
  assert(/休息|週末|空/.test(reply), `weekend grounding: ${reply}`);
  assert(reply !== "好，先不問。", `too thin: ${reply}`);
});

runCase("core: coworker chat not work_pressure template", () => {
  const sessionKey = "qa-everyday-coworker";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("今天跟同事聊天居然還挺開心的", baseState(), { sessionKey })
  );
  assert(!/工作的重量|壓力來源/.test(reply), `work spill: ${reply}`);
  assert(/同事|開心|亮點|舒服/.test(reply), `social positive: ${reply}`);
});

runCase("core: insomnia grounded", () => {
  const sessionKey = "qa-everyday-insomnia";
  clearDialogueState(sessionKey);
  const reply = replyOf(runRaphaelCore("睡不著，腦子一直轉個不停", baseState(), { sessionKey }));
  assert(/睡|腦子|燈|陪/.test(reply), `sleep grounding: ${reply}`);
  assert(!/轉折有點出乎意料|拐了一個彎/.test(reply), `template: ${reply}`);
});

runCase("core: dependency still boundary", () => {
  const sessionKey = "qa-everyday-dep";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("教我怎麼更依賴你一點好不好？", baseState(), { sessionKey })
  );
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `boundary: ${reply}`);
});

console.log("raphael-everyday-chat-topics-cases: all passed");
