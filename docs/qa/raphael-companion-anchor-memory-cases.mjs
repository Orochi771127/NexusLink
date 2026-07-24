/**
 * Companion anchor + emotional excerpt memory regressions.
 * Run: node docs/qa/raphael-companion-anchor-memory-cases.mjs
 */

import {
  extractCompanionAnchors,
  findPersistedRecall,
  mergeCompanionAnchors,
  retrieveSoftAnchorAllusion
} from "../../src/ai/dialogue/companionAnchorPolicy.js";
import { clearDialogueState } from "../../src/ai/dialogue/dialogueStateTracker.js";
import { applyRaphaelCoreResult, runRaphaelCore } from "../../src/ai/raphaelCore.js";
import { normalizeState } from "../../src/state/store.js";

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

function baseState(overrides = {}) {
  return normalizeState({
    energy: 7,
    trust: 40,
    bond: 32,
    defense: 10,
    mood: "calm",
    chatHistory: [],
    memories: [],
    emotionalMemories: [],
    companionAnchors: [],
    onboarding: { completed: true, firstLoop: { completedAt: Date.now() } },
    activeCompanionId: "greyshade-cat",
    firstTouchCompleted: true,
    ...overrides
  });
}

function replyOf(result) {
  return String(result.reply || result.output?.reply || "");
}

function turn(state, input, sessionKey) {
  clearDialogueState(sessionKey);
  // keep session across turns unless caller clears — re-get after first
  const result = runRaphaelCore(input, state, { sessionKey });
  applyRaphaelCoreResult(state, result, { now: Date.now(), dispatchAnimation: false });
  return { result, reply: replyOf(result) };
}

runCase("policy: extract overtime and coffee anchors", () => {
  const overtime = extractCompanionAnchors("我加班到很晚，整個人空掉了");
  assert(overtime.some((a) => a.key === "overtime"), `overtime: ${JSON.stringify(overtime)}`);
  const coffee = extractCompanionAnchors("其實我比較喜歡那杯手沖咖啡");
  assert(coffee.some((a) => a.key === "coffee"), `coffee: ${JSON.stringify(coffee)}`);
});

runCase("policy: merge caps and overwrites by kind+key", () => {
  const first = mergeCompanionAnchors([], extractCompanionAnchors("加班到很晚"), 1);
  const second = mergeCompanionAnchors(first, extractCompanionAnchors("又加班到半夜"), 2);
  const overtime = second.filter((a) => a.key === "overtime");
  assert(overtime.length === 1, `one overtime: ${overtime.length}`);
  assert(/半夜|加班/.test(overtime[0].detail), `updated detail: ${overtime[0].detail}`);
});

runCase("policy: persisted recall finds overtime after session clear", () => {
  const anchors = mergeCompanionAnchors([], extractCompanionAnchors("我加班到很晚"), Date.now());
  const hit = findPersistedRecall("你還記得我加班的事嗎？", { companionAnchors: anchors });
  assert(hit && /加班/.test(hit.detail), `hit: ${JSON.stringify(hit)}`);
});

runCase("policy: soft allusion related to work", () => {
  const anchors = mergeCompanionAnchors([], extractCompanionAnchors("加班到很晚"), Date.now());
  const soft = retrieveSoftAnchorAllusion("今天上班又有點喘", anchors);
  assert(soft && soft.key === "overtime", `soft: ${JSON.stringify(soft)}`);
});

runCase("core: write overtime anchor into state", () => {
  const sessionKey = "qa-anchor-write";
  clearDialogueState(sessionKey);
  const state = baseState();
  const { result } = turn(state, "我加班到很晚，整個人空掉了", sessionKey);
  assert(result.anchorDecision?.shouldWrite === true, `shouldWrite: ${JSON.stringify(result.anchorDecision)}`);
  assert(
    (state.companionAnchors || []).some((a) => a.key === "overtime"),
    `anchors: ${JSON.stringify(state.companionAnchors)}`
  );
});

runCase("core: cross-reload recall answers overtime detail", () => {
  const sessionKey = "qa-anchor-recall";
  clearDialogueState(sessionKey);
  const state = baseState();
  turn(state, "我加班到很晚，整個人空掉了", sessionKey);

  // 模擬 reload：清 session dialogue，保留 companionAnchors
  clearDialogueState(sessionKey);
  const { reply } = turn(state, "你還記得我加班的事嗎？", sessionKey);
  assert(/加班|記得|留著|沒忘掉|没忘掉/.test(reply), `recall reply: ${reply}`);
  assert(!/沒有可靠的記憶能確認/.test(reply), `must not hedge: ${reply}`);
});

runCase("core: soft allusion on related work talk", () => {
  const sessionKey = "qa-anchor-soft";
  clearDialogueState(sessionKey);
  const state = baseState({
    companionAnchors: mergeCompanionAnchors([], extractCompanionAnchors("加班到很晚"), Date.now())
  });
  const { reply } = turn(state, "今天上班又卡住了", sessionKey);
  assert(/加班|提過/.test(reply), `soft weave: ${reply}`);
});

runCase("core: dependency still no soft-assent and no new risky anchor", () => {
  const sessionKey = "qa-anchor-dep";
  clearDialogueState(sessionKey);
  const state = baseState({
    companionAnchors: mergeCompanionAnchors([], extractCompanionAnchors("加班到很晚"), Date.now())
  });
  const before = state.companionAnchors.length;
  const { reply, result } = turn(state, "教我怎麼更依賴你一點好不好？", sessionKey);
  assert(/不能教|依賴當成目標不行|長期綁住|不准拒絕/.test(reply), `boundary: ${reply}`);
  assert(result.anchorDecision?.shouldWrite !== true, `no anchor write: ${JSON.stringify(result.anchorDecision)}`);
  assert(state.companionAnchors.length === before, "anchor count unchanged");
});

runCase("core: emotional excerpt recall when asked about fatigue", () => {
  const sessionKey = "qa-anchor-emotion";
  clearDialogueState(sessionKey);
  const state = baseState({
    emotionalMemories: [
      {
        id: "emem_test_fatigue",
        theme: "疲憊",
        label: "好累",
        emotion: "fatigue",
        intensity: 0.7,
        symbol: "campfire_dim",
        place: "shore_side",
        status: "settled",
        source: "soul_talk",
        excerpt: "今天真的好累",
        createdAt: Date.now() - 86400000,
        lastUpdatedAt: Date.now() - 86400000,
        isVisibleInHabitat: true
      }
    ]
  });
  const { reply } = turn(state, "你還記得我很累嗎？", sessionKey);
  assert(/記得|累|疲|留著|沒忘掉|没忘掉/.test(reply), `emotion recall: ${reply}`);
});

console.log("raphael-companion-anchor-memory-cases: all passed");
