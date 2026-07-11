// CH-5b 共鳴邀請引擎驗證（純函數，離線可跑）。
// 執行：NEXUS_NODE docs/qa/_resonance_invite_cases.mjs
import {
  canAskResonance,
  evaluateResonanceInvite,
  listAskableChapters,
  getChapterCompanionId,
  RESONANCE_WILLING,
  DECLINE_LINES
} from "../../src/engine/resonanceInviteEngine.js";
import { getChapterNarrative } from "../../src/data/chapterNarrative.js";

const cases = [];

// 章 2 = sprigfawn。基準：相遇時快照 bond/trust=10/8，尚未通關。
function stateFor({ completed = [], met = true, joined = false, bond = 10, trust = 8, blocked = 0, markOverrides = {} } = {}) {
  const companionId = getChapterCompanionId(2);
  const companions = {};
  if (met || joined) {
    companions[companionId] = { metAt: 1751000000000, joinedAt: joined ? 1751000009999 : null };
  }
  return {
    bond,
    trust,
    blockedTouchCount: blocked,
    chapterProgress: { current: 3, completed },
    resonance: {
      chapterMarks: {
        2: { bondAtStart: 10, trustAtStart: 8, blockedTouchAtStart: 0, overwhelmedCount: 0, enteredAt: 1751000000000, reaskedAt: null, ...markOverrides }
      },
      companions
    }
  };
}

runCase("not eligible before chapter cleared", () => {
  assertEqual(canAskResonance(stateFor({ completed: [] }), 2).eligible, false, "eligible before clear");
});

runCase("not eligible before meeting", () => {
  assertEqual(canAskResonance(stateFor({ completed: [2], met: false }), 2).eligible, false, "eligible before meet");
});

runCase("eligible after clear + met + not joined", () => {
  assertEqual(canAskResonance(stateFor({ completed: [2], met: true }), 2).eligible, true, "eligible after clear+met");
});

runCase("not eligible once joined", () => {
  assertEqual(canAskResonance(stateFor({ completed: [2], joined: true }), 2).eligible, false, "eligible after joined");
});

runCase("willing when affinity gain reached, boundary respected, no overwhelmed", () => {
  // bond 10->14 (+4), trust 8->12 (+4) => delta 8 >= 6
  const result = evaluateResonanceInvite(stateFor({ completed: [2], bond: 14, trust: 12 }), 2);
  assertEqual(result.willing, true, "willing flag");
  assertEqual(result.cause, null, "no decline cause");
  assertEqual(result.line, getChapterNarrative(2).willingLine, "willing line from narrative");
});

runCase("declines 'early' when affinity gain too small", () => {
  // bond 10->12 (+2), trust 8->9 (+1) => delta 3 < 6
  const result = evaluateResonanceInvite(stateFor({ completed: [2], bond: 12, trust: 9 }), 2);
  assertEqual(result.willing, false, "not willing early");
  assertEqual(result.cause, "early", "cause early");
  assertEqual(result.line, DECLINE_LINES.early, "early decline line");
});

runCase("declines 'boundary' when blocked touch delta exceeds max", () => {
  // affinity ok (+8) but blocked 0->5 (delta 5 > 2)
  const result = evaluateResonanceInvite(stateFor({ completed: [2], bond: 14, trust: 12, blocked: 5 }), 2);
  assertEqual(result.willing, false, "not willing boundary");
  assertEqual(result.cause, "boundary", "cause boundary");
  assertEqual(result.line, DECLINE_LINES.boundary, "boundary decline line");
});

runCase("declines 'overwhelmed' when chapter standoff overwhelmed the companion", () => {
  // affinity ok (+8), boundary ok, but overwhelmedCount 1 > 0
  const result = evaluateResonanceInvite(
    stateFor({ completed: [2], bond: 14, trust: 12, markOverrides: { overwhelmedCount: 1 } }),
    2
  );
  assertEqual(result.willing, false, "not willing overwhelmed");
  assertEqual(result.cause, "overwhelmed", "cause overwhelmed");
  assertEqual(result.line, DECLINE_LINES.overwhelmed, "overwhelmed decline line");
});

runCase("boundary takes priority over affinity when both fail", () => {
  // low affinity AND high blocked → boundary wins (ordering)
  const result = evaluateResonanceInvite(stateFor({ completed: [2], bond: 10, trust: 8, blocked: 5 }), 2);
  assertEqual(result.cause, "boundary", "boundary priority");
});

runCase("missing chapter mark falls back to zero delta (declines early, never auto-willing)", () => {
  const state = stateFor({ completed: [2], bond: 99, trust: 99 });
  delete state.resonance.chapterMarks[2];
  const result = evaluateResonanceInvite(state, 2);
  assertEqual(result.willing, false, "no auto-willing without mark");
  assertEqual(result.cause, "early", "fallback early");
});

runCase("listAskableChapters returns only eligible chapters ascending", () => {
  const companion2 = getChapterCompanionId(2);
  const companion3 = getChapterCompanionId(3);
  const state = {
    bond: 10,
    trust: 8,
    blockedTouchCount: 0,
    chapterProgress: { current: 4, completed: [2, 3] },
    resonance: {
      chapterMarks: {},
      companions: {
        [companion2]: { metAt: 1, joinedAt: null },
        [companion3]: { metAt: 1, joinedAt: 999 } // already joined → excluded
      }
    }
  };
  assertArrayEqual(listAskableChapters(state), [2], "only ch2 askable");
});

runCase("willing threshold constant is the documented 6", () => {
  assertEqual(RESONANCE_WILLING.affinityGain, 6, "affinity gain constant");
});

const failed = cases.filter((c) => c.status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failed.length, cases }, null, 2));
if (failed.length > 0) process.exitCode = 1;

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error.message });
  }
}
function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
function assertArrayEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}
