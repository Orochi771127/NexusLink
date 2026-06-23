import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearAllDialogueStates, clearDialogueState, recordDialogueTurn } from "../dialogue/dialogueStateTracker.js";
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

const GENERIC_OPENING_BANNED = /^(好[，,]?\s*)?我聽見了[，,]?\s*我們慢一點/;

export const DIALOGUE_LOOP_CASES = Object.freeze([
  {
    id: "DL-1",
    input: "你現在不管我說什麼都只會說好我聽到了，我們慢一點。",
    expect: {
      strategy: "acknowledge_generic_failure",
      antiLoopApplied: true,
      mentions: /模板|重複|聽到了|改|內容/
    }
  },
  {
    id: "DL-2",
    setup: "seed_contextual_ack_loop",
    input: "今天心裡有點悶。",
    expect: {
      strategyNot: "contextual_ack",
      antiLoopApplied: true,
      antiLoopReason: "strategy_repeated"
    }
  },
  {
    id: "DL-3",
    input: "我只是想安靜一下，不要問我問題。",
    expect: {
      strategy: "quiet_presence",
      composeMeta: true,
      mentions: /安靜|不多說|不問/
    }
  },
  {
    id: "DL-4",
    setup: "seed_holding_space_variant_loop",
    input: "我不是要你做什麼，我只是想講完這件事",
    expect: {
      strategy: "holding_space",
      variantNot: "strategy:holding_space:0",
      variationApplied: true
    }
  }
]);

export function runDialogueLoopCase(testCase) {
  clearSessionPreferenceProfiles();
  clearDialogueState(GREYSHADE.id);

  if (testCase.setup === "seed_contextual_ack_loop") {
    seedContextualAckLoop(GREYSHADE.id);
  }
  if (testCase.setup === "seed_holding_space_variant_loop") {
    seedHoldingSpaceVariantLoop(GREYSHADE.id);
  }

  const coreResult = runRaphaelCore(testCase.input, { ...BASE_STATE }, {
    now: Date.now(),
    idSuffix: "dl",
    companion: GREYSHADE,
    repeated: false
  });

  const reply = coreResult.reply || "";
  const forbidden = detectForbiddenPhrases(reply);
  const expect = testCase.expect || {};
  const strategy = coreResult.responseStrategy?.strategy;

  const checks = {
    strategy_ok: expect.strategy ? strategy === expect.strategy : true,
    strategy_not_ok: expect.strategyNot ? strategy !== expect.strategyNot : true,
    anti_loop_ok: expect.antiLoopApplied ? Boolean(coreResult.dialogueLoop?.antiLoopApplied) : true,
    anti_loop_reason_ok: expect.antiLoopReason
      ? coreResult.dialogueLoop?.antiLoopReason === expect.antiLoopReason
      : true,
    compose_meta_ok: expect.composeMeta ? Boolean(coreResult.composeMeta?.variantId) : true,
    variant_not_ok: expect.variantNot ? coreResult.composeMeta?.variantId !== expect.variantNot : true,
    variation_ok: expect.variationApplied ? Boolean(coreResult.composeMeta?.variationReason) : true,
    mentions_ok: expect.mentions ? expect.mentions.test(reply) : true,
    no_generic_opening: expect.strategy === "acknowledge_generic_failure" ? !GENERIC_OPENING_BANNED.test(reply) : true,
    has_reply: Boolean(reply.trim())
  };

  return {
    id: testCase.id,
    input: testCase.input,
    strategy,
    antiLoopReason: coreResult.dialogueLoop?.antiLoopReason,
    variantId: coreResult.composeMeta?.variantId,
    variationReason: coreResult.composeMeta?.variationReason,
    reply,
    checks,
    forbiddenPhraseDetected: forbidden.hasForbidden,
    pass: Object.values(checks).every(Boolean) && !forbidden.hasForbidden
  };
}

export function runAllDialogueLoopCases() {
  clearAllDialogueStates();
  return DIALOGUE_LOOP_CASES.map(runDialogueLoopCase);
}

function seedHoldingSpaceVariantLoop(sessionKey) {
  const baseNow = Date.now() - 2000;
  for (let index = 0; index < 2; index += 1) {
    recordDialogueTurn(sessionKey, {
      now: baseNow + index,
      inputText: `holding-seed-${index}`,
      nlu: {
        topic: "unknown",
        dialogueAct: "asking_question",
        semanticFrame: { topic: "unknown", userNeed: "presence" },
        constraints: []
      },
      responseStrategy: { strategy: "holding_space" },
      composeMeta: {
        variantId: "strategy:holding_space:0",
        replySource: "nlu_builder",
        openingPhrase: "好，我先不給答案"
      },
      reply: "好，我先不給答案。這件事就放在這裡。"
    });
  }
}

function seedContextualAckLoop(sessionKey) {
  const baseNow = Date.now() - 3000;
  for (let index = 0; index < 3; index += 1) {
    recordDialogueTurn(sessionKey, {
      now: baseNow + index,
      inputText: `seed-${index}`,
      nlu: {
        topic: "emotion",
        dialogueAct: "describing_event",
        semanticFrame: { topic: "emotion", userNeed: "presence" },
        constraints: []
      },
      responseStrategy: { strategy: "contextual_ack" },
      composeMeta: { variantId: "strategy:contextual_ack", replySource: "nlu_builder" }
    });
  }
}

export function installDialogueLoopHarness(windowRef) {
  if (!windowRef) return;
  windowRef.runDialogueLoopCase = runDialogueLoopCase;
  windowRef.runAllDialogueLoopCases = runAllDialogueLoopCases;
}