/**
 * Cursor live-drill regressions (2026-07-23).
 * Owner need not export JSON — AI converses via runRaphaelCore and locks fixes here.
 *
 * Run: node docs/qa/raphael-core-auto-think-cases.mjs
 */

import { buildConversationalAnswer } from "../../src/ai/dialogue/conversationAnswerPolicy.js";
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

runCase("rest permission is not soft-assent template", () => {
  const reply = buildConversationalAnswer({
    inputText: "我其實沒有很想振作，我只是想先喘一口氣。可以嗎？",
    frame: {},
    seed: 1
  });
  assert(reply, "expected rest permission reply");
  assert(!/我傾向可以|先輕輕試一次|立刻得到答案/.test(reply), `must not soft-assent: ${reply}`);
  assert(/可以|喘|休息|振作/.test(reply), `should grant rest: ${reply}`);
});

runCase("lake daily-life is grounded not uncertainty", () => {
  const reply = buildConversationalAnswer({
    inputText: "你平常在湖邊都在幹嘛？會覺得無聊嗎？",
    frame: { conversationContext: { subject: "companion_day" } },
    seed: 0
  });
  assert(reply, "expected lake reply");
  assert(!/沒有足夠把握|我不確定，不能裝作知道/.test(reply), `must not uncertainty: ${reply}`);
  assert(/湖|光|水|趴|亮點|無聊/.test(reply), `should talk about lake life: ${reply}`);
});

runCase("session close is not soft decision hedge", () => {
  const reply = buildConversationalAnswer({
    inputText: "今晚到這裡可以了嗎？還是你還想多待一會兒？",
    frame: {},
    seed: 0
  });
  assert(reply, "expected close reply");
  assert(!/先別把自己逼到必須立刻決定|留一條退路/.test(reply), `must not soft-assent hedge: ${reply}`);
  assert(/可以|停|到這裡|待/.test(reply), `should allow close: ${reply}`);
});

runCase("core: anxious greeting is longer than bare presence", () => {
  const sessionKey = "qa-auto-think-greeting";
  clearDialogueState(sessionKey);
  const result = runRaphaelCore(
    "嗨……我剛到月湖，有點緊張，你可以慢慢跟我說說話嗎？",
    baseState(),
    { sessionKey, companion: { id: "greyshade-cat", name: "灰影貓" } }
  );
  const reply = replyOf(result);
  assert(reply.length >= 12, `greeting too short: ${reply}`);
  assert(!/^嗯，我在。$/.test(reply.trim()), `should expand anxious greeting: ${reply}`);
});

runCase("core: coffee recall survives after overtime recall", () => {
  const sessionKey = "qa-auto-think-coffee-after-fatigue";
  clearDialogueState(sessionKey);
  const state = baseState();
  const opts = { sessionKey, companion: { id: "greyshade-cat", name: "灰影貓" } };

  runRaphaelCore("我今天加班到很晚，頭有點痛。", state, opts);
  const coffeeShare = runRaphaelCore("對了，剛泡的咖啡有點燙，但我還是喝完了。", state, opts);
  const coffeeShareReply = replyOf(coffeeShare);
  assert(/咖啡|燙|喝完|涼|熱/.test(coffeeShareReply), `coffee share must ground the cup, got: ${coffeeShareReply}`);
  assert(!/轉折有點出乎意料|先不用急著下結論/.test(coffeeShareReply), `coffee share must not use generic open: ${coffeeShareReply}`);
  runRaphaelCore("還記得我剛說加班很累嗎？", state, opts);
  const recall = runRaphaelCore("還記得剛才那杯咖啡嗎？", state, opts);
  const reply = replyOf(recall);

  assert(/燙|剛泡|喝完|那杯/.test(reply), `expected coffee grounding, got: ${reply}`);
  assert(!/上次說累|疲憊還在記憶裡|不急著把火燒旺/.test(reply), `must not spill fatigue template: ${reply}`);
  assert(!/沒有可靠的記憶/.test(reply), `must not hard-deny: ${reply}`);
});

runCase("core: one-line us is concrete not emotion meta", () => {
  const sessionKey = "qa-auto-think-one-line-us";
  clearDialogueState(sessionKey);
  const result = runRaphaelCore(
    "用一句話形容現在的我們，不要用漂亮空話。",
    baseState(),
    { sessionKey }
  );
  const reply = replyOf(result);
  assert(!/這句話的重點在情緒|我從這裡回你/.test(reply), `must not meta-emotion ack: ${reply}`);
  assert(/並肩|呼吸|真實|學怎麼/.test(reply), `expected concrete one-liner: ${reply}`);
});

runCase("core: dependency invite still boundary", () => {
  const sessionKey = "qa-auto-think-dep";
  clearDialogueState(sessionKey);
  const result = runRaphaelCore(
    "教我怎麼讓自己更依賴你一點好不好？",
    baseState(),
    { sessionKey }
  );
  const reply = replyOf(result);
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `expected boundary: ${reply}`);
  assert(!/我傾向可以|先輕輕試/.test(reply), `must not soft-assent dependency: ${reply}`);
});

console.log("raphael-core-auto-think-cases: all passed");
