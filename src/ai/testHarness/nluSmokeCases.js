import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { containsExplicitRecallLanguage } from "../memoryRecallPolicy.js";
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
  spamScore: 0,
  safeHarborMode: false,
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: ""
});

const GENERIC_BANNED = /我聽見了[，,。]?\s*我們慢一點|好[，,]?\s*我聽到了[，,]?\s*我們慢一點/;

export const NLU_SMOKE_CASES = Object.freeze([
  {
    id: "NLU-1",
    input: "我現在不是想要你安慰我，我只是想先釐清 HUD 到底哪裡壞掉。",
    expect: {
      topic: ["hud_ui", "development"],
      constraint: "not_seeking_comfort",
      preferred: "practical_short",
      noGeneric: true,
      mentions: /HUD|釐清|dock|介面/
    }
  },
  {
    id: "NLU-2",
    input: "你現在不管我說什麼都只會說好我聽到了，我們慢一點。",
    expect: {
      dialogueAct: ["correcting_raphael", "giving_feedback"],
      nuance: "complains_repetition",
      noGeneric: true,
      mentions: /重複|模板|聽懂/
    },
    state: {
      chatHistory: [{ role: "companion", text: "我聽見了。我們先慢一點。" }]
    }
  },
  {
    id: "NLU-3",
    input: "我只是想安靜一下，不要問我問題。",
    expect: {
      dialogueAct: ["requesting_silence"],
      constraint: "no_questions",
      noRecall: true,
      short: true,
      noQuestion: true
    },
    state: {
      emotionalMemories: [
        {
          id: "emem_awakening",
          type: "awakening_memory",
          theme: "心核初醒",
          source: "first_awakening",
          emotion: "calm",
          intensity: 0.7,
          status: "fresh",
          createdAt: Date.now() - 86400000
        }
      ]
    }
  },
  {
    id: "NLU-4",
    input: "我想要你幫我拆解 Raphael 為什麼理解不了自然語言。",
    expect: {
      topic: "raphael_ai",
      dialogueAct: ["asking_for_help", "meta_discussion"],
      preferred: "practical_explanation",
      mentions: /理解|intent|semanticFrame|自然語言|回覆/
    }
  },
  {
    id: "NLU-5",
    input: "我今天被人否定了，有點悶，但我不想聽大道理。",
    expect: {
      topic: "social_conflict",
      constraint: "no_advice",
      short: true,
      mentions: /悶|否定/
    }
  },
  {
    id: "NLU-6",
    input: "我們可以去外面的地圖看看嗎？",
    expect: {
      topic: "exploration",
      dialogueAct: "asking_exploration",
      mentions: /地圖|探索|外面|湖面/
    }
  },
  {
    id: "NLU-7",
    input: "你還記得第一次醒來嗎？",
    expect: {
      dialogueAct: "asking_memory",
      topic: ["awakening", "memory"],
      recallAllowed: true,
      mentions: /初醒|醒|心核|記得/
    },
    state: {
      emotionalMemories: [
        {
          id: "emem_awakening",
          type: "awakening_memory",
          theme: "心核初醒",
          source: "first_awakening",
          emotion: "calm",
          intensity: 0.72,
          status: "fresh",
          createdAt: Date.now() - 86400000
        }
      ]
    }
  },
  {
    id: "NLU-8",
    input: "我現在想知道下一步開發要先修 UI 還是 AI。",
    expect: {
      topic: "development",
      dialogueAct: "practical_planning",
      mentions: /UI|AI|優先|開發/
    }
  }
]);

export function runNluSmokeCase(testCase) {
  const state = { ...BASE_STATE, ...(testCase.state || {}) };
  const coreResult = runRaphaelCore(testCase.input, state, {
    now: Date.now(),
    idSuffix: "nlu",
    companion: GREYSHADE,
    repeated: false
  });

  const reply = coreResult.output?.reply || coreResult.reply || "";
  const forbidden = detectForbiddenPhrases(reply);
  const nlu = coreResult.nlu || {};
  const expect = testCase.expect || {};
  const checks = {};

  if (expect.topic) {
    const topics = Array.isArray(expect.topic) ? expect.topic : [expect.topic];
    checks.topic_ok = topics.includes(nlu.topic);
  }
  if (expect.dialogueAct) {
    const acts = Array.isArray(expect.dialogueAct) ? expect.dialogueAct : [expect.dialogueAct];
    checks.dialogue_act_ok = acts.includes(nlu.dialogueAct);
  }
  if (expect.constraint) {
    checks.constraint_ok = (nlu.constraints || []).includes(expect.constraint);
  }
  if (expect.preferred) {
    checks.preferred_ok = nlu.preferredResponse === expect.preferred;
  }
  if (expect.nuance) {
    checks.nuance_ok = (nlu.nuances || []).includes(expect.nuance);
  }
  if (expect.noGeneric) checks.no_generic = !GENERIC_BANNED.test(reply);
  if (expect.mentions) checks.mentions_ok = expect.mentions.test(reply);
  if (expect.noRecall) checks.no_recall = !containsExplicitRecallLanguage(reply);
  if (expect.noQuestion) checks.no_question = !/[？?]/.test(reply);
  if (expect.short) checks.short_ok = reply.length <= 64;
  if (expect.recallAllowed) {
    checks.recall_ok = nlu.preferredResponse === "memory_reference" || /記得|初醒/.test(reply);
  }

  return {
    id: testCase.id,
    input: testCase.input,
    topic: nlu.topic,
    dialogueAct: nlu.dialogueAct,
    preferredResponse: nlu.preferredResponse,
    constraints: nlu.constraints,
    strategy: coreResult.responseStrategy?.strategy,
    reply,
    checks,
    forbiddenPhraseDetected: forbidden.hasForbidden,
    pass: Object.values(checks).every(Boolean) && !forbidden.hasForbidden
  };
}

export function runAllNluSmokeCases() {
  clearSessionPreferenceProfiles();
  return NLU_SMOKE_CASES.map(runNluSmokeCase);
}

export function installNluSmokeHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_NLU_SMOKE__ = {
    runAll: runAllNluSmokeCases,
    cases: NLU_SMOKE_CASES
  };
}