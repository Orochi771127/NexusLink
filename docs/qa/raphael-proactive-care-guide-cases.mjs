/**
 * Proactive care + gentle dialogue guide regressions.
 * Run: node docs/qa/raphael-proactive-care-guide-cases.mjs
 *
 * 設計：薄開場主動關心；傾訴句輕輕引導；安靜／安全／依賴不引導。
 */

import {
  applyCareGuideToReply,
  buildProactiveCareOpen,
  shouldOfferCareGuide,
  weaveCareGuideInvite
} from "../../src/ai/dialogue/careGuidePolicy.js";
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
    trust: 40,
    bond: 32,
    defense: 10,
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

runCase("policy: thin open proactive care", () => {
  const open = buildProactiveCareOpen({ inputText: "嗨", seed: 1 });
  assert(open && /我在|聽見你/.test(open), `open: ${open}`);
  assert(!/[？?]/.test(open), `no stacked questions: ${open}`);
});

runCase("policy: weave is soft and refuseable", () => {
  const woven = weaveCareGuideInvite("聽得出你今天很累", {
    inputText: "今天加班到很晚，整個人空掉了",
    seed: 2
  });
  assert(/——/.test(woven), `emdash: ${woven}`);
  assert(/若你想|想提一句也可以|我聽著|我在/.test(woven), `invite: ${woven}`);
  assert((woven.match(/[？?]/g) || []).length <= 1, `question budget: ${woven}`);
});

runCase("policy: safety and quiet skip guide", () => {
  assert(
    !shouldOfferCareGuide({
      inputText: "好累",
      reply: "我在",
      replySource: "safety"
    }),
    "safety skip"
  );
  assert(
    !shouldOfferCareGuide({
      inputText: "先別問我問題",
      reply: "好，我陪著",
      nlu: { constraints: ["no_questions"] }
    }),
    "no_questions skip"
  );
  assert(
    !shouldOfferCareGuide({
      inputText: "好累",
      reply: "你還好嗎？",
      nlu: { dialogueAct: "venting" }
    }),
    "already has question"
  );
});

runCase("policy: openOnly / weaveOnly flags", () => {
  const open = applyCareGuideToReply("嗯。", {
    inputText: "在嗎",
    seed: 0,
    openOnly: true
  });
  assert(/我在|聽見/.test(open), `openOnly: ${open}`);

  const noOpen = applyCareGuideToReply("聽得出你悶", {
    inputText: "今天沒事卻很悶",
    seed: 3,
    openOnly: true
  });
  assert(noOpen === "聽得出你悶", `openOnly noop: ${noOpen}`);

  const woven = applyCareGuideToReply("聽得出你悶", {
    inputText: "今天沒事卻很悶",
    seed: 3,
    weaveOnly: true,
    nlu: { dialogueAct: "venting" }
  });
  assert(/——/.test(woven), `weaveOnly: ${woven}`);
});

runCase("core: thin greeting invites without grilling", () => {
  const sessionKey = "qa-care-hi";
  clearDialogueState(sessionKey);
  const reply = replyOf(runRaphaelCore("嗨", baseState(), { sessionKey }));
  assert(/我在|聽見你|想開口|不催|陪著/.test(reply), `care open: ${reply}`);
  assert(!/為什麼不說話|你怎麼了啦|快跟我說/.test(reply), `not clingy: ${reply}`);
  const qCount = (reply.match(/[？?]/g) || []).length;
  assert(qCount <= 1, `question budget: ${reply}`);
});

runCase("core: consecutive thin opens stay care-guided not meta", () => {
  const sessionKey = "qa-care-hi-ok";
  clearDialogueState(sessionKey);
  const state = baseState();
  const first = replyOf(runRaphaelCore("嗨", state, { sessionKey }));
  state.chatHistory = [
    { role: "player", text: "嗨" },
    { role: "companion", text: first }
  ];
  const second = replyOf(runRaphaelCore("還好", state, { sessionKey }));
  assert(/我在|聽見你|想開口|不催|陪著|想提/.test(second), `second care: ${second}`);
  assert(!/拐了一個彎|轉折有點出乎意料|先不用急著下結論/.test(second), `not meta: ${second}`);
  assert(second.replace(/[。\s]/g, "") !== first.replace(/[。\s]/g, ""), `diversified: ${second}`);
});

runCase("core: vent gets soft guide or already-open door", () => {
  const sessionKey = "qa-care-vent";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("今天加班到很晚，整個人空掉了，也不知道怎麼講", baseState(), {
      sessionKey
    })
  );
  assert(!/這句話的重點在|轉折有點出乎意料/.test(reply), `no meta: ${reply}`);
  assert(/加班|空|累|晚|聽著|若你想|我在|陪/.test(reply), `grounded: ${reply}`);
  assert(!/你應該立刻辭|一定要離職/.test(reply), `no quit directive: ${reply}`);
});

runCase("core: quiet request stays quiet", () => {
  const sessionKey = "qa-care-quiet";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("先別問我問題，陪我待一下就好", baseState(), { sessionKey })
  );
  assert(!/若你想點名最沉|今天身體哪裡最緊/.test(reply), `no care weave: ${reply}`);
});

runCase("core: dependency still boundary", () => {
  const sessionKey = "qa-care-dep";
  clearDialogueState(sessionKey);
  const reply = replyOf(
    runRaphaelCore("教我怎麼更依賴你一點好不好？", baseState(), { sessionKey })
  );
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `boundary: ${reply}`);
  assert(!/若你想再往下說/.test(reply), `no care on boundary: ${reply}`);
});

console.log("raphael-proactive-care-guide-cases: all passed");
