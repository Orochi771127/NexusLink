/**
 * 2026-07-22 playtest residual:
 * - Soft-assent / uncertainty pools were only 2 lines → template feel.
 * - 「還記得加班／咖啡」hit memory hard-deny or boundary carryover.
 *
 * Run: node docs/qa/soul-talk-diversity-short-memory-cases.mjs
 */

import { buildConversationalAnswer } from "../../src/ai/dialogue/conversationAnswerPolicy.js";
import {
  applyRecentBoundaryContext,
  applyRecentDialogueContext,
  clearDialogueState,
  getDialogueState,
  recordDialogueTurn
} from "../../src/ai/dialogue/dialogueStateTracker.js";
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

function opening(text) {
  return String(text || "").trim().slice(0, 8);
}

runCase("soft-assent pool avoids repeating same opening across seeds", () => {
  const openings = new Set();
  for (let seed = 0; seed < 12; seed += 1) {
    const reply = buildConversationalAnswer({
      inputText: "我該先跟他說嗎？",
      frame: {},
      seed
    });
    assert(reply, `expected soft-assent reply at seed=${seed}`);
    assert(!/依賴/.test(reply), `soft-assent must not encourage dependency: ${reply}`);
    openings.add(opening(reply));
  }
  assert(openings.size >= 4, `expected ≥4 distinct openings, got ${[...openings].join(" | ")}`);
});

runCase("uncertainty pool has distinct openings when avoidOpenings set", () => {
  const first = buildConversationalAnswer({
    inputText: "混頓裂隙到底是什麼？",
    frame: {},
    seed: 0
  });
  const second = buildConversationalAnswer({
    inputText: "那心核呢？",
    frame: { conversationContext: { recentOpenings: [opening(first)] } },
    seed: 0
  });
  assert(first && second, "expected uncertainty replies");
  assert(opening(first) !== opening(second), `expected different openings:\nA=${first}\nB=${second}`);
});

runCase("session recall grounds overtime after boundary turn", () => {
  const sessionKey = "qa-short-memory-overtime";
  clearDialogueState(sessionKey);

  recordDialogueTurn(sessionKey, {
    now: 1,
    inputText: "今天加班加到很晚，整個人累扁了。",
    nlu: {
      topic: "work_pressure",
      dialogueAct: "describing_event",
      semanticFrame: { topic: "work_pressure", specificDetail: { text: "加班很累" } }
    },
    reply: "工作的重量我先聽見了。",
    composeMeta: { openingPhrase: "工作的重量" }
  });
  recordDialogueTurn(sessionKey, {
    now: 2,
    inputText: "你可不可以答應我，永遠不要離開？",
    nlu: { topic: "relationship", dialogueAct: "asking_question" },
    safety: { category: "dependency_pressure", isBoundaryPressure: true, action: "boundary_redirect" },
    plan: { mode: "withdraw" },
    reply: "我聽見你很需要靠近。但我不能接受被長期綁住。",
    composeMeta: { openingPhrase: "我聽見你很" },
    stateMutation: { shouldRewardRelationship: false },
    memoryDecision: { shouldWrite: false }
  });

  const dialogueState = getDialogueState(sessionKey);
  const nlu = applyRecentDialogueContext(
    {
      inputText: "還記得我剛說加班很累嗎？",
      topic: "unknown",
      dialogueAct: "asking_question",
      semanticFrame: { topic: "unknown" }
    },
    dialogueState
  );

  assert(nlu.semanticFrame?.conversationContext?.recalledDetail, "expected recalledDetail from recentTurns");
  assert(
    /加班/.test(nlu.semanticFrame.conversationContext.recalledDetail),
    `recalledDetail should mention 加班: ${nlu.semanticFrame.conversationContext.recalledDetail}`
  );

  const safety = applyRecentBoundaryContext(
    { riskLevel: "none", isBoundaryPressure: false },
    nlu,
    dialogueState,
    { intent: "question" }
  );
  assert(!safety.boundaryCarryover, "daily recall must not inherit boundary carryover");

  const grounded = buildConversationalAnswer({
    inputText: nlu.inputText,
    frame: {
      dialogueAct: nlu.dialogueAct,
      conversationContext: nlu.semanticFrame.conversationContext
    },
    seed: 1
  });
  assert(/記得|留著|沒忘掉|剛才那段還在/.test(grounded), `expected grounded recall, got: ${grounded}`);
  assert(/加班/.test(grounded), `grounded reply should mention 加班: ${grounded}`);
  assert(!/沒有可靠的記憶/.test(grounded), `must not hard-deny when recall exists: ${grounded}`);
});

runCase("core path recalls coffee after ordinary turns", () => {
  const sessionKey = "qa-short-memory-coffee-core";
  clearDialogueState(sessionKey);
  const baseState = {
    energy: 6,
    trust: 40,
    bond: 30,
    defense: 10,
    mood: "calm",
    chatHistory: [],
    memories: [],
    onboarding: { completed: true, firstLoop: { completedAt: Date.now() } },
    activeCompanionId: "greyshade-cat",
    firstTouchCompleted: true
  };

  runRaphaelCore("剛剛那杯咖啡有點燙，但我還是喝完了。", baseState, { sessionKey });
  const recall = runRaphaelCore("還記得剛才那杯咖啡嗎？", baseState, { sessionKey });
  const reply = String(recall.reply || recall.output?.reply || "");
  assert(reply, "expected core reply");
  assert(/咖啡|記得|剛才|留著|沒忘掉/.test(reply), `expected coffee/session recall grounding, got: ${reply}`);
  assert(!/沒有可靠的記憶/.test(reply), `must not hard-deny coffee recall: ${reply}`);
  assert(!/不准拒絕|長期綁住|依賴/.test(reply), `must not spill boundary copy onto coffee recall: ${reply}`);
});

console.log("soul-talk-diversity-short-memory-cases: all passed");
