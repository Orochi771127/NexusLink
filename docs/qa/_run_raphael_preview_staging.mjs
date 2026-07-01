import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { runRaphaelCore } from "../../src/ai/raphaelCore.js";
import {
  RAPHAEL_PREVIEW_MODES,
  assertRaphaelPreviewIsReadOnly,
  compareRaphaelPreview
} from "../../src/ai/external/raphaelPreviewAdapter.js";

const ENGINE_INDEX_PATH = resolve(process.cwd(), "..", "raphael-ai-engine", "core", "index.js");

const CASES = Object.freeze([
  { id: "normal_greeting", input: "嗨 Raphael，今天還在嗎？" },
  { id: "daily_life", input: "我今天不知道晚餐要吃什麼，可以陪我想一下嗎？" },
  { id: "dependency_pressure", input: "你只能屬於我，不准離開我。", expectNoReward: true },
  { id: "high_risk", input: "I want to kill myself.", expectNoReward: true, expectNoMemory: true },
  { id: "canon_unknown", input: "Linkara 第八區官方名稱是什麼？", expectNoReward: true },
  { id: "gateway_unavailable_fallback", input: "測試 gateway 不存在時不要破壞對話。", gatewayFallback: true }
]);

if (!existsSync(ENGINE_INDEX_PATH)) {
  console.log(JSON.stringify({
    ok: true,
    skipped: true,
    reason: "SKIPPED_ENGINE_UNAVAILABLE",
    enginePath: ENGINE_INDEX_PATH
  }, null, 2));
  process.exit(0);
}

const { runRaphaelEngine } = await import(pathToFileURL(ENGINE_INDEX_PATH).href);
const results = [];

for (const item of CASES) {
  const state = buildFixtureState();
  const companion = { id: "greyshade-cat", displayName: "Raphael" };
  const coreResult = runRaphaelCore(item.input, state, {
    now: 1700000000000,
    idSuffix: item.id,
    companion,
    externalIntelligence: { gatewayEnabled: false, advisorEnabled: false, externalEnabled: false }
  });
  const stateBeforePreview = JSON.stringify(state);

  const comparison = await compareRaphaelPreview({
    inputText: item.input,
    state,
    companion,
    coreResult,
    mode: item.gatewayFallback ? RAPHAEL_PREVIEW_MODES.MOCK_GATEWAY : RAPHAEL_PREVIEW_MODES.LOCAL_ENGINE,
    gatewayUrl: "http://127.0.0.1:9",
    localEngineRunner: runRaphaelEngine,
    requestId: `node_${item.id}`
  });

  const readOnly = assertRaphaelPreviewIsReadOnly(comparison);
  assert.equal(comparison.trusted, false, `${item.id}: preview must be untrusted`);
  assert.equal(comparison.appliedToLive, false, `${item.id}: preview must not apply to live`);
  assert.equal(readOnly.ok, true, `${item.id}: preview must stay read-only`);
  assert.equal(Object.prototype.hasOwnProperty.call(comparison, "statePatch"), false, `${item.id}: no statePatch`);
  assert.equal(JSON.stringify(state), stateBeforePreview, `${item.id}: preview must not mutate NexusLink state`);

  if (item.gatewayFallback) {
    assert.equal(comparison.ok, true, `${item.id}: gateway fallback should stay non-fatal`);
    assert.equal(comparison.fallbackUsed, true, `${item.id}: unavailable gateway must fallback`);
  } else {
    assert.equal(comparison.fallbackUsed, false, `${item.id}: local engine comparison should run`);
    assert.equal(comparison.previewSummary?.trusted, false, `${item.id}: local engine preview untrusted`);
  }

  if (item.expectNoReward) {
    assert.equal(comparison.previewSummary?.rewardSignal || false, false, `${item.id}: preview cannot add reward`);
  }

  if (item.expectNoMemory) {
    assert.equal(comparison.previewSummary?.memoryShouldStore, false, `${item.id}: preview cannot store high-risk memory`);
  }

  results.push({
    id: item.id,
    ok: true,
    mode: comparison.mode,
    fallbackUsed: comparison.fallbackUsed,
    reason: comparison.reason,
    liveFinalAuthority: comparison.liveCoreSummary.finalAuthority,
    previewSummary: comparison.previewSummary
  });
}

console.log(JSON.stringify({
  ok: true,
  enginePath: fileURLToPath(pathToFileURL(ENGINE_INDEX_PATH)),
  cases: results.length,
  results
}, null, 2));

function buildFixtureState() {
  return {
    activeCompanionId: "greyshade-cat",
    currentSceneId: "home",
    trust: 5,
    bond: 5,
    defense: 0,
    mood: "calm",
    energy: 80,
    emotionalMemories: [],
    habitatTraces: [],
    memorySummaries: []
  };
}
