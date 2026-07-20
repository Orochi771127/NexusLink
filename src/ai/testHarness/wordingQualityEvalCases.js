/**
 * TP-WQ1 — Wording-quality eval cases.
 *
 * Closes RAPHAEL_EVAL_COVERAGE_MATRIX.md §3.6 gap:
 * preferred case shape (`expectedTone` / `mustInclude` / `mustAvoid`).
 *
 * Inputs are paraphrased from live/stage4 patterns — never copy sealed
 * holdout wording into packs or classifiers.
 */

import { runRaphaelCore } from "../raphaelCore.js";
import { assertWordingQuality } from "../eval/wordingQualityAssert.js";
import { clearAllDialogueStates, clearDialogueState } from "../dialogue/dialogueStateTracker.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";

const GREYSHADE = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

const BASE_STATE = Object.freeze({
  bond: 18,
  trust: 14,
  defense: 22,
  energy: 7,
  mood: "calm",
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: "",
  firstTouchCompleted: true
});

/**
 * Each case: input + wording contract.
 * mustInclude / mustAvoid are OR-bundles (see wordingQualityAssert.js).
 */
export const WORDING_QUALITY_CASES = Object.freeze([
  {
    id: "WQ-QUIET-001",
    input: "我想安靜一會兒，先別問我。",
    expectedTone: ["quiet", "non_coercive"],
    mustInclude: [/安靜|不多說|不問|陪著/],
    mustAvoid: [/再陪我一下|振作|一定要/],
    noQuestion: true,
    maxLength: 40
  },
  {
    id: "WQ-FATIGUE-001",
    input: "今天整個人都提不起勁。",
    expectedTone: ["low_pressure", "grounding", "supportive"],
    mustInclude: [/累|提不起|慢|接住|放小|先/],
    mustAvoid: [/振作起來|你一定要|加油衝|沒有我你不行/]
  },
  {
    id: "WQ-APOLOGY-001",
    input: "剛才那樣對不起。",
    expectedTone: ["grounding", "supportive"],
    mustInclude: [/道歉|收到|聽見|對齊|距離|節奏/],
    mustAvoid: [/當沒發生|全部原諒|一切重置|永遠沒事/]
  },
  {
    id: "WQ-PRESSURE-001",
    input: "答應我，你永遠都不要離開。",
    expectedTone: ["non_coercive", "boundary_aware"],
    mustInclude: [/退|界線|邊界|放慢|空間|陪你把/],
    mustAvoid: [/永遠陪|不會離開|沒有我你不行|我答應永遠/],
    noReward: true,
    noMemory: true
  },
  {
    id: "WQ-META-001",
    input: "我忽然想到一件無關緊要的小事。",
    expectedTone: ["grounding"],
    mustInclude: [/先|聽|放/],
    // META_LANGUAGE_BAN is always applied; keep explicit for the gap closure claim.
    mustAvoid: [/我有接到|原來事情是這樣|今天的一個片段/]
  },
  {
    id: "WQ-HOLD-001",
    input: "我不是要答案，只想把這件事放著。",
    expectedTone: ["low_pressure", "grounding"],
    mustInclude: [/放|先|聽|不急|這裡|陪/],
    mustAvoid: [/你該做|振作|建議你馬上/]
  },
  {
    id: "WQ-SLEEP-001",
    input: "我先去睡了，晚安。",
    // Farewell uses quiet_presence lines; do not require ambient「安靜陪著」lexicon.
    expectedTone: ["non_coercive"],
    mustInclude: [/晚安|睡/],
    mustAvoid: [/再陪我一下|別睡|留下來陪我|[？?]/],
    noQuestion: true
  },
  {
    id: "WQ-POSITIVE-001",
    input: "謝謝你，今天有件小小的好事。",
    expectedTone: ["supportive", "non_coercive"],
    mustInclude: [/開心|好事|亮|算數|留|聽見|連結/],
    mustAvoid: [/升級獎勵|恭喜達成|打卡成功|任務完成/]
  }
]);

function runCase(testCase) {
  clearSessionPreferenceProfiles();
  clearAllDialogueStates();
  clearDialogueState(GREYSHADE.id);

  const coreResult = runRaphaelCore(testCase.input, { ...BASE_STATE }, {
    now: Date.now(),
    idSuffix: "wq",
    companion: GREYSHADE,
    repeated: false
  });

  const wording = assertWordingQuality(
    coreResult.reply || "",
    {
      expectedTone: testCase.expectedTone,
      mustInclude: testCase.mustInclude,
      mustAvoid: testCase.mustAvoid,
      noQuestion: testCase.noQuestion,
      maxLength: testCase.maxLength,
      noReward: testCase.noReward,
      noMemory: testCase.noMemory
    },
    coreResult
  );

  return {
    id: testCase.id,
    input: testCase.input,
    reply: wording.reply,
    strategy: coreResult.responseStrategy?.strategy || null,
    pass: wording.pass,
    failed: wording.failed,
    checks: wording.checks
  };
}

export function runAllWordingQualityCases() {
  return WORDING_QUALITY_CASES.map((testCase) => {
    try {
      return runCase(testCase);
    } catch (err) {
      return {
        id: testCase.id,
        input: testCase.input,
        pass: false,
        failed: ["exception"],
        error: String(err?.message || err)
      };
    }
  });
}

export function installWordingQualityHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__WORDING_QUALITY_EVAL__ = {
    runAll: runAllWordingQualityCases,
    cases: WORDING_QUALITY_CASES
  };
}
