/**
 * First-session motivation Pack 1 cases (Node, no browser).
 * Run: node docs/qa/first-session-motivation-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  deriveResonanceThread,
  canEnterUnguidedStandoff,
  isLifetimeFirstStandoff,
  RESONANCE_THREAD_KINDS
} = await import(pathToFileURL(path.join(repoRoot, "src/engine/resonanceThreadEngine.js")).href);

const { buildStandoffCausalityLayers } = await import(
  pathToFileURL(path.join(repoRoot, "src/engine/battleEngine.js")).href
);

function ok(name) {
  console.log(`PASS  ${name}`);
}

function baseState(over = {}) {
  return {
    onboarding: { completed: true, firstLoop: {} },
    firstTouchCompleted: false,
    chatHistory: [],
    habitatTraces: [],
    explorationProgress: { totalExplorations: 0 },
    battleRecord: { wins: 0, losses: 0, retreats: 0 },
    activeCompanionId: "greyshade-cat",
    ...over
  };
}

const cases = [];

cases.push(() => {
  assert.equal(deriveResonanceThread(baseState({ onboarding: { completed: false } })), null);
  ok("onboarding incomplete → no thread");
});

cases.push(() => {
  const thread = deriveResonanceThread(baseState());
  assert.equal(thread?.kind, RESONANCE_THREAD_KINDS.FIRST_TOUCH);
  assert.match(thread.title, /觀察|灰影/);
  assert.ok(thread.why && thread.consequence);
  ok("first-loop touch stage → first_touch thread");
});

cases.push(() => {
  const thread = deriveResonanceThread(
    baseState({
      firstTouchCompleted: true,
      chatHistory: [{ role: "player", text: "嗨" }],
      habitatTraces: [{ id: "t1", memoryId: "m1", type: "em_fresh_warm" }]
    }),
    {}
  );
  // loop still active without completedAt — touch/talk/trace satisfied → null inside loop
  assert.equal(thread, null);
  ok("loop active but touch/talk/trace done → null until loop completes");
});

cases.push(() => {
  const emotional = { id: "trace_1", memoryId: "m1", type: "em_fresh_warm" };
  const state = baseState({
    onboarding: { completed: true, firstLoop: { completedAt: 1 } },
    firstTouchCompleted: true,
    chatHistory: [{ role: "player", text: "嗨" }],
    habitatTraces: [emotional],
    explorationProgress: { totalExplorations: 0 }
  });
  const thread = deriveResonanceThread(state);
  assert.equal(thread?.kind, RESONANCE_THREAD_KINDS.SAFE_EXPLORE);
  ok("after first-loop + trace, no explore → safe_explore");
});

cases.push(() => {
  const thread = deriveResonanceThread(
    baseState({
      onboarding: { completed: true, firstLoop: { completedAt: 1 } },
      firstTouchCompleted: true,
      habitatTraces: [{ id: "trace_1", memoryId: "m1", type: "em_fresh_warm" }],
      explorationProgress: { totalExplorations: 0 }
    }),
    { dismissedKinds: [RESONANCE_THREAD_KINDS.SAFE_EXPLORE] }
  );
  assert.equal(thread, null);
  ok("dismissed kind does not repeat");
});

cases.push(() => {
  assert.equal(canEnterUnguidedStandoff(baseState()), false);
  assert.equal(
    canEnterUnguidedStandoff(
      baseState({
        onboarding: { completed: true, firstLoop: { completedAt: 1 } },
        habitatTraces: [{ id: "trace_1", memoryId: "m1", type: "em_fresh_warm" }]
      })
    ),
    true
  );
  ok("standoff gate requires first-loop done + emotional trace");
});

cases.push(() => {
  assert.equal(isLifetimeFirstStandoff(baseState()), true);
  assert.equal(isLifetimeFirstStandoff(baseState({ battleRecord: { wins: 1 } })), false);
  ok("lifetime first standoff detection");
});

cases.push(() => {
  const layers = buildStandoffCausalityLayers("retreated");
  assert.ok(layers.immediate && layers.event && layers.longTerm && layers.returnPreview);
  assert.equal(layers.immediate.includes("+2"), false);
  ok("three-layer causality has no grind numeric reward language");
});

let failed = 0;
for (const run of cases) {
  try {
    run();
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${error.message}`);
    console.error(error);
  }
}

if (failed) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} first-session motivation cases passed`);
