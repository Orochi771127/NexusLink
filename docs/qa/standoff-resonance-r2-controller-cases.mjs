import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  MAX_AUTONOMOUS_BEATS,
  deriveStandoffPreparation
} from "../../src/engine/standoffAutonomyEngine.js";

// AudioManager creates an Audio instance at module evaluation time. The
// controller contract itself is otherwise safe to import in Node.
globalThis.Audio = class AudioStub {
  addEventListener() {}
  removeEventListener() {}
  load() {}
  pause() {}
  play() { return Promise.resolve(); }
};

const {
  STANDOFF_COMPANION_INTENT_EVENT,
  createBattleController
} = await import("../../src/ui/battleController.js");

const source = await readFile(new URL("../../src/ui/battleController.js", import.meta.url), "utf8");
const cases = [];

runCase("controller imports and publishes a dedicated circle intent event", () => {
  assert.equal(typeof createBattleController, "function");
  assert.equal(STANDOFF_COMPANION_INTENT_EVENT, "STANDOFF_COMPANION_INTENT");

  const emitSection = section("  function emitCircleIntent(", "  function ensureAutonomyControls(");
  assert.match(emitSection, /EventBus\.emit\(STANDOFF_COMPANION_INTENT_EVENT, payload\)/);
  for (const field of ["sessionKey", "beatIndex", "companionId", "role", "intent", "reasonId", "bodyCueId"]) {
    assert.match(emitSection, new RegExp(`\\b${field}\\b`), `missing ${field}`);
  }
});

runCase("preparation is explicit, capped at two supporters, and never engine-auto-fills", () => {
  const state = makeState({
    joined: { sprigfawn: 100, auriowl: 200, "starstripe-cub": 300 }
  });
  const empty = deriveStandoffPreparation(state, {
    preferredIds: [],
    controlMode: "entrusted",
    approach: "adaptive"
  });
  assert.equal(empty.ok, true);
  assert.deepEqual(empty.companions, []);
  assert.deepEqual(empty.participation, []);

  const capped = deriveStandoffPreparation(state, {
    preferredIds: ["starstripe-cub", "auriowl", "sprigfawn"],
    controlMode: "entrusted",
    approach: "adaptive"
  });
  assert.deepEqual(capped.participation.map(({ companionId }) => companionId), ["starstripe-cub", "auriowl"]);
  assert.equal(capped.companions.length <= 2, true);
});

runCase("opening preparation starts with an empty invitation, not a legacy auto-circle", () => {
  const startSection = section("  function startBattle(", "  function beginPreparedBattle(");
  assert.match(startSection, /selectedInviteIds\s*=\s*\[\s*\]\s*;/);
  assert.doesNotMatch(startSection, /selectedInviteIds\s*=\s*eligible\.slice\(/);
});

runCase("preparation requires an explicit mode and enforces the two-invite UI cap", () => {
  const preparationSection = section("  function renderPreparation(", "  function clearPreparationState(");
  assert.match(preparationSection, /id:\s*"entrusted"/);
  assert.match(preparationSection, /id:\s*"manual"/);
  assert.match(preparationSection, /start\.disabled\s*=\s*!selectedControlMode/);
  assert.match(preparationSection, /selectedInviteIds\.length\s*<\s*2/);
  assert.match(preparationSection, /selectedInviteIds\s*=\s*selectedInviteIds\.filter/);
});

runCase("entrusted mode hides manual actions while preserving pause, takeover, request, and retreat", () => {
  const controlsSection = section("  function ensureAutonomyControls(", "  function openRequestSheet(");
  for (const role of ["pause", "takeover", "request", "retreat"]) {
    assert.match(controlsSection, new RegExp(`data-role=["']${role}["']`), `missing ${role}`);
  }
  assert.match(controlsSection, /takeOverStandoff/);
  assert.match(controlsSection, /openRequestSheet/);
  assert.match(controlsSection, /handleAction\("retreat"\)/);

  const renderSection = section("  function render()", "\n  return { bind, startBattle }");
  assert.match(renderSection, /const entrusted\s*=\s*autonomyState\?\.controlMode\s*===\s*"entrusted"/);
  assert.match(renderSection, /actionRowEl\.hidden\s*=\s*session\.turn\s*===\s*"ended"\s*\|\|\s*entrusted/);
});

runCase("autonomy exposes at least 1.2 seconds of telegraph and stops at twenty beats", () => {
  assert.equal(MAX_AUTONOMOUS_BEATS, 20);
  assert.match(source, /const AUTONOMOUS_TELEGRAPH_MS\s*=\s*1200\s*;/);
  const scheduleSection = section("  function scheduleAutonomousTurn(", "  function runAutonomousLead(");
  assert.match(scheduleSection, /metadata\.limitReached/);
  assert.match(scheduleSection, /Math\.max\(AUTONOMOUS_TELEGRAPH_MS, Number\(delayMs\) \|\| 0\)/);
});

runCase("safeHarbor is terminal and all persistence remains behind its settlement guard", () => {
  const state = makeState({ joined: { sprigfawn: 100 }, safeHarborMode: true });
  const preparation = deriveStandoffPreparation(state, {
    preferredIds: ["sprigfawn"],
    controlMode: "entrusted",
    approach: "adaptive"
  });
  assert.equal(preparation.ok, false);
  assert.equal(preparation.reason, "safety-paused");
  assert.deepEqual(preparation.participation, []);
  assert.deepEqual(preparation.companions, []);

  const terminalSection = section("  function enterSafeHarborTerminal(", "  function pauseAutonomy(");
  assert.match(terminalSection, /if \(!pendingBattle\) return false/);
  assert.match(terminalSection, /clearPreparationState\(\)/);
  assert.match(terminalSection, /panelManager\.closePanel\(\{ force: true \}\)/);
  assert.match(terminalSection, /session\.growthSafetyExcluded\s*=\s*true/);
  assert.match(terminalSection, /window\.clearTimeout\(autonomyTimer\)/);
  assert.match(terminalSection, /window\.clearTimeout\(noiseTurnTimer\)/);
  assert.match(terminalSection, /closeRequestSheet\(\)/);
  assert.match(terminalSection, /pauseReason:\s*"safe-harbor-terminal"/);
  assert.doesNotMatch(terminalSection, /applyPlayerAction|applyNoiseTurn|session\.log\.push|emitCircleIntent/);

  const executeSection = section("  function executeLeadAction(", "  function scheduleNoiseTurn(");
  assert.ok(
    executeSection.indexOf("if (guardSafeHarborTerminal()) return false")
      < executeSection.indexOf("session = applyPlayerAction"),
    "lead action must fail closed before gameplay mutation"
  );
  const noiseSection = section("  function scheduleNoiseTurn(", "  function snapshotCircleBreath(");
  assert.ok(
    noiseSection.lastIndexOf("if (guardSafeHarborTerminal()) return")
      < noiseSection.indexOf("session = applyNoiseTurn"),
    "delayed noise callback must fail closed before gameplay mutation"
  );

  const bindSection = section("  function bind()", "  function startBattle(");
  assert.match(bindSection, /store\.subscribe\(\(nextState\)/);
  assert.match(bindSection, /nextState\?\.safeHarborMode === true/);

  const settlementSection = section("  function endStandoff(", "  function render()");
  assert.match(settlementSection, /const persistenceExcluded = safetyTerminal \|\| practiceOnly/);
  assert.match(settlementSection, /if \(!persistenceExcluded\) store\.updateState/);
  assert.match(settlementSection, /if \(!persistenceExcluded\) saveCurrentState\?\.\(\)/);
});

runCase("visibility loss and panel close pause or tear down every session-owned resource", () => {
  const visibilitySection = section("  function handleVisibilityChange(", "  function ensureTelegraphElement(");
  assert.match(visibilitySection, /document\.visibilityState\s*===\s*"hidden"/);
  assert.match(visibilitySection, /pauseAutonomy\(/);

  const bindSection = section("  function bind()", "  function startBattle(");
  assert.match(bindSection, /document\.addEventListener\("visibilitychange", handleVisibilityChange\)/);
  assert.match(bindSection, /panelManager\.registerOnClose\("battle"/);
  assert.match(bindSection, /window\.clearTimeout\(noiseTurnTimer\)/);
  assert.match(bindSection, /window\.clearTimeout\(autonomyTimer\)/);
  assert.match(bindSection, /destroyCircleRenderer\(\)/);
  assert.match(bindSection, /closeRequestSheet\(\)/);
  assert.match(bindSection, /session\s*=\s*null/);
  assert.match(bindSection, /autonomyState\s*=\s*null/);
});

runCase("taking over preserves the current session and next telegraph", () => {
  const takeoverSection = section("  function takeOverStandoff(", "  function scheduleAutonomousTurn(");
  assert.match(takeoverSection, /controlMode:\s*"manual"/);
  assert.doesNotMatch(takeoverSection, /createStandoffSession|deriveStandoffPreparation|nextIntent\s*=/);
});

runCase("lead animation completion is captured before the existing noise turn runs", () => {
  const executeSection = section("  function executeLeadAction(", "  function scheduleNoiseTurn(");
  assert.match(executeSection, /const leadAnimationDuration\s*=\s*emitCircleIntent\(/);
  assert.match(executeSection, /Promise\.resolve\(leadAnimationDuration\)\.then/);
});

report();

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `missing source marker: ${startMarker}`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, `missing source marker: ${endMarker}`);
  return source.slice(start, end);
}

function makeState({ activeId = "greyshade-cat", joined = {}, safeHarborMode = false } = {}) {
  const ids = new Set([activeId, ...Object.keys(joined)]);
  return {
    activeCompanionId: activeId,
    unlockedCompanionIds: [...ids],
    resonance: {
      chapterMarks: {},
      companions: Object.fromEntries(
        Object.entries(joined).map(([id, joinedAt]) => [id, { metAt: 1, joinedAt }])
      )
    },
    companionStates: {
      version: 1,
      byId: Object.fromEntries([...ids].map((id) => [id, {
        companionId: id,
        relationship: {
          bond: 0,
          trust: 5,
          mood: "calm",
          energy: 10,
          defense: 35,
          touchFatigue: 0,
          lastTouchAt: null,
          lastRejectAt: null,
          blockedTouchCount: 0,
          lastBlockedTouchAt: null,
          firstTouchCompleted: false,
          firstHugCompleted: false,
          reactionPreview: "",
          lastTouchReaction: ""
        }
      }]))
    },
    safeHarborMode,
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    touchFatigue: 0
  };
}

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, ok: true });
  } catch (error) {
    cases.push({ name, ok: false, error });
  }
}

function report() {
  const failed = cases.filter(({ ok }) => !ok);
  for (const testCase of cases) {
    console.log(`${testCase.ok ? "PASS" : "FAIL"}  ${testCase.name}`);
    if (!testCase.ok) console.error(`      ${testCase.error?.stack || testCase.error}`);
  }
  console.log(`\n${cases.length - failed.length}/${cases.length} cases passed`);
  if (failed.length) process.exitCode = 1;
}
