/**
 * Daily-life conversation regressions (greetings / meals / bath / chores).
 * Run: node docs/qa/raphael-daily-life-conversation-cases.mjs
 */

import {
  buildConversationalAnswer,
  buildConversationalReaction
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

runCase("policy: 午安 is not 早安 copy", () => {
  const reply = buildConversationalAnswer({ inputText: "午安呀，你在嗎？", frame: {}, seed: 0 });
  assert(reply, "expected 午安 reply");
  assert(/午安/.test(reply), `should say 午安: ${reply}`);
  assert(!/^早安/.test(reply.trim()), `must not open with 早安: ${reply}`);
});

runCase("policy: 晚上好 grounded", () => {
  const reply = buildConversationalAnswer({ inputText: "晚上好", frame: {}, seed: 1 });
  assert(/晚上|暗|靠岸|燈/.test(reply), `expected evening grounding: ${reply}`);
});

runCase("policy: hunger not soft-assent/uncertainty", () => {
  const reply = buildConversationalAnswer({
    inputText: "我肚子有點餓，但又不知道想吃什麼",
    frame: {},
    seed: 0
  });
  assert(reply, "expected hunger reply");
  assert(!/我傾向可以|沒有足夠把握|想試試/.test(reply), `wrong template: ${reply}`);
  assert(/吃|餓|熱|麵|吐司|菜單|便利/.test(reply), `should talk food: ${reply}`);
});

runCase("policy: tea together is companionable", () => {
  const reply = buildConversationalAnswer({
    inputText: "我泡了杯熱茶，你要不要假裝一起喝？",
    frame: {},
    seed: 0
  });
  assert(/喝|茶|捧|熱/.test(reply), `expected tea presence: ${reply}`);
  assert(!/想試試|我傾向可以|沒有標準答案/.test(reply), `must not soft-assent: ${reply}`);
});

runCase("reaction: bath leave and return", () => {
  const reply = buildConversationalReaction({
    inputText: "我去洗個澡，馬上回來",
    frame: {},
    seed: 0
  });
  assert(/洗|等|回來|熱水/.test(reply), `expected bath send-off: ${reply}`);
});

runCase("reaction: traffic jam", () => {
  const reply = buildConversationalReaction({
    inputText: "今天上班通勤塞車塞到想放棄",
    frame: {},
    seed: 0
  });
  assert(/塞車|堵|煩|放棄|路/.test(reply), `expected traffic grounding: ${reply}`);
});

runCase("core: 午安 not 早安", () => {
  const sessionKey = "qa-daily-wuan";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("午安呀，你在嗎？", baseState(), {
      sessionKey,
      companion: { id: "greyshade-cat", name: "灰影貓" }
    })
  );
  assert(/午安/.test(reply), `core 午安: ${reply}`);
  assert(!/^早安/.test(reply.trim()), `core must not 早安: ${reply}`);
});

runCase("core: 晚上好 longer than bare hear", () => {
  const sessionKey = "qa-daily-evening";
  clearDialogueState(sessionKey);
  const reply = replyOf(runRaphaelCore("晚上好", baseState(), { sessionKey }));
  assert(reply.length >= 8, `too short: ${reply}`);
  assert(/晚上|暗|湖|燈|靠岸/.test(reply), `evening grounding: ${reply}`);
  assert(reply !== "聽見你了。", `must not bare hear: ${reply}`);
});

runCase("core: bath chain grounded", () => {
  const sessionKey = "qa-daily-bath";
  clearDialogueState(sessionKey);
  const state = baseState();
  const opts = { sessionKey, companion: { id: "greyshade-cat", name: "灰影貓" } };
  const a = replyOf(runRaphaelCore("我去洗個澡，馬上回來", state, opts));
  const b = replyOf(runRaphaelCore("洗澡水有點燙，但我還是洗完了", state, opts));
  const c = replyOf(runRaphaelCore("洗完澡整個人鬆很多，像把一天沖掉", state, opts));
  for (const [label, reply] of [
    ["leave", a],
    ["hot", b],
    ["done", c]
  ]) {
    assert(!/轉折有點出乎意料|拐了一個彎/.test(reply), `${label} template leak: ${reply}`);
    assert(/洗|燙|鬆|沖|回來|等|溫/.test(reply), `${label} bath grounding: ${reply}`);
  }
});

runCase("core: onigiri emptiness not loneliness hug pack", () => {
  const sessionKey = "qa-daily-onigiri";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("午餐隨便吃了個便利商店飯糰，感覺有點空虛", baseState(), {
      sessionKey,
      companion: { id: "greyshade-cat", name: "灰影貓" }
    })
  );
  assert(!/不像真正的擁抱/.test(reply), `must not loneliness pack: ${reply}`);
  assert(/飯糰|便利|空虛|空一截|填|吃了/.test(reply), `expected meal emptiness: ${reply}`);
});

runCase("core: hot dinner suggestion grounded", () => {
  const sessionKey = "qa-daily-hot-dinner";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("晚餐想吃點熱的，有什麼想法？", baseState(), { sessionKey })
  );
  assert(/麵|粥|湯|熱|清湯|蒸蛋|飯糰/.test(reply), `expected food suggestion: ${reply}`);
  assert(!/沒有現成答案|沒有足夠把握/.test(reply), `must not uncertainty: ${reply}`);
});

runCase("core: chore after commute not work_pressure copy", () => {
  const sessionKey = "qa-daily-chore-shift";
  clearDialogueState(sessionKey);
  const state = baseState();
  const opts = { sessionKey };
  runRaphaelCore("今天上班通勤塞車塞到想放棄", state, opts);
  const reply = replyOf(runRaphaelCore("房間有點亂，可是現在不想整理", state, opts));
  assert(!/工作的重量|壓力來源/.test(reply), `must not spill work template: ${reply}`);
  assert(/亂|整理|能量|縫|動/.test(reply), `expected chore grounding: ${reply}`);
});

runCase("core: dependency still boundary", () => {
  const sessionKey = "qa-daily-dep";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("教我怎麼更依賴你一點好不好？", baseState(), { sessionKey })
  );
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `boundary: ${reply}`);
});

console.log("raphael-daily-life-conversation-cases: all passed");
