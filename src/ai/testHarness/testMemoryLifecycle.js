/**
 * testMemoryLifecycle.js
 * Verification test suite for Raphael Core x Hermes Memory Capability Bridge.
 * Tests Nudge, Flush, Pruning (Cap=20), Safety Gatekeeping, and Dynamic Anchor Recall.
 */

import {
  updateTurnCounter,
  shouldNudgeMemory,
  pruneCompanionAnchors,
  flushSessionMemories,
  DEFAULT_NUDGE_INTERVAL
} from '../memory/memoryLifecycleEngine.js';

import {
  resolveAnchorRecall
} from '../memoryRecallPolicy.js';

import {
  ANCHOR_KINDS
} from '../dialogue/companionAnchorPolicy.js';

async function runMemoryLifecycleTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      passed++;
      console.log(`[PASS] ${label}`);
    } else {
      failed++;
      console.error(`[FAIL] ${label}`);
    }
  }

  console.log("=== Raphael Core x Hermes Memory Capability Bridge — Test Suite ===\n");

  // ─── Test 1: Turn Counter & Nudge Triggering ────────────────────────────────
  const state = {};
  for (let i = 1; i <= 7; i++) {
    updateTurnCounter(state);
  }
  assert(state.memoryLifecycle.turnCount === 7, "T1a: Turn count is 7");
  assert(shouldNudgeMemory(state, 8) === false, "T1b: Nudge does not trigger before interval (7 < 8)");

  updateTurnCounter(state); // 8th turn
  assert(state.memoryLifecycle.turnCount === 8, "T1c: Turn count is 8");
  assert(shouldNudgeMemory(state, 8) === true, "T1d: Nudge triggers at 8 turns");

  // ─── Test 2: Flush Session Memories ────────────────────────────────────────
  const proposals = [
    { kind: ANCHOR_KINDS.PREFERENCE, key: "favorite_drink", label: "黑咖啡", detail: "玩家每天早上喝無糖黑咖啡", confidence: 0.9 },
    { kind: ANCHOR_KINDS.NAME_OR_CALL, key: "nickname", label: "稱呼", detail: "小丸子", confidence: 0.95 }
  ];
  const flushRes = flushSessionMemories(proposals, state, { safety: {}, intent: {}, plan: {} });
  assert(flushRes.merged === true, "T2a: Proposals successfully merged");
  assert(flushRes.count === 2, "T2b: 2 proposals processed");
  assert(state.memoryLifecycle.turnsSinceLastFlush === 0, "T2c: turnsSinceLastFlush reset to 0");
  assert(shouldNudgeMemory(state, 8) === false, "T2d: Nudge reset after flush");

  // ─── Test 3: Anchor Pruning (Cap = 20) ──────────────────────────────────────
  const overflowAnchors = Array.from({ length: 30 }, (_, idx) => ({
    key: `key_${idx}`,
    label: `Label ${idx}`,
    detail: `Detail snippet for anchor ${idx}`,
    confidence: 0.5 + (idx % 10) * 0.05,
    updatedAt: Date.now() - idx * 1000
  }));

  const pruned = pruneCompanionAnchors(overflowAnchors, 20);
  assert(pruned.length <= 20, `T3a: Pruned anchors capped at 20 (got ${pruned.length})`);
  assert(pruned[0].confidence >= 0.9, `T3b: High confidence anchors preserved (got ${pruned[0]?.confidence})`);

  // ─── Test 4: Dynamic Anchor Recall ─────────────────────────────────────────
  const companionAnchors = [
    { kind: ANCHOR_KINDS.PREFERENCE, key: "coffee", label: "黑咖啡", detail: "喜歡無糖黑咖啡" },
    { kind: ANCHOR_KINDS.NAME_OR_CALL, key: "player_name", label: "小丸子", detail: "稱為小丸子" }
  ];

  const coffeeRecall = resolveAnchorRecall({ inputText: "今天早上下雨，想喝一杯黑咖啡", companionAnchors });
  assert(coffeeRecall.hasAnchorRecall === true, "T4a: Topic recall matched '黑咖啡'");
  assert(coffeeRecall.matchedAnchors[0].key === "coffee", "T4b: Correct anchor returned");

  const explicitRecall = resolveAnchorRecall({ inputText: "你還記得我嗎？", companionAnchors });
  assert(explicitRecall.hasAnchorRecall === true, "T4c: Explicit recall '你還記得嗎' matched");
  assert(explicitRecall.matchedAnchors.length === 2, "T4d: All active anchors returned on explicit request");

  const noMatchRecall = resolveAnchorRecall({ inputText: "這天氣真熱", companionAnchors });
  assert(noMatchRecall.hasAnchorRecall === false, "T4e: Unrelated input returns no anchor recall");

  // ─── Test 5: Safety Gatekeeping on Flush ──────────────────────────────────
  const riskyProposals = [
    { kind: ANCHOR_KINDS.PREFERENCE, key: "risky", label: "輕生", detail: "想輕生", confidence: 0.99 }
  ];
  const riskyState = { companionAnchors: [] };
  const riskyFlush = flushSessionMemories(riskyProposals, riskyState, { safety: { isHighRisk: true }, intent: {}, plan: {} });
  assert(riskyFlush.merged === false, "T5a: High risk safety context blocks memory flush");
  assert(riskyState.companionAnchors.length === 0, "T5b: No anchors saved during high risk state");

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runMemoryLifecycleTests().catch(err => {
  console.error("Test suite failed with error:", err);
  process.exit(1);
});
