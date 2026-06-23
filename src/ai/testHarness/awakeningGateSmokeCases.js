import { runRaphaelCore } from "../raphaelCore.js";
import { buildFirstAwakeningPayload } from "../awakening/firstAwakeningEvent.js";
import { applyFirstAwakeningResult } from "../awakening/applyAwakeningResult.js";
import {
  getAwakeningStage,
  hasAwakeningMemory,
  isRaphaelAwakened,
  AWAKENING_STAGES
} from "../awakening/raphaelAwakeningGate.js";
import { evaluateAwakeningChecklist } from "../awakening/awakeningChecklist.js";

const BASE = Object.freeze({
  bond: 5,
  trust: 8,
  defense: 10,
  energy: 7,
  mood: "calm",
  spamScore: 0,
  safeHarborMode: false,
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  firstTouchCompleted: false
});

export function runAwakeningGateSmokeCases() {
  return [
    testStageDormant(),
    testFirstAwakeningPayload(),
    testAwakeningApply(),
    testCoreCapabilitiesAfterAwakening()
  ];
}

function testStageDormant() {
  const stage = getAwakeningStage(BASE);
  return {
    name: "stage_dormant",
    pass: stage === AWAKENING_STAGES.DORMANT,
    stage
  };
}

function testFirstAwakeningPayload() {
  const now = Date.now();
  const payload = buildFirstAwakeningPayload({ state: BASE, companion: { name: "灰影貓" }, now });
  return {
    name: "first_awakening_payload",
    pass:
      payload.shouldApply &&
      payload.memoryObject?.source === "first_awakening" &&
      payload.traceObject?.type === "core_awakening_glow" &&
      payload.animationKey === "idle_wake",
    animationKey: payload.animationKey
  };
}

function testAwakeningApply() {
  const now = Date.now();
  const state = { ...BASE, chatHistory: [] };
  const payload = buildFirstAwakeningPayload({ state, now });
  const applied = applyFirstAwakeningResult(state, payload);
  return {
    name: "awakening_apply",
    pass:
      applied.applied &&
      hasAwakeningMemory(state) &&
      isRaphaelAwakened(state) &&
      getAwakeningStage(state) === AWAKENING_STAGES.AWAKENED &&
      state.habitatTraces.length === 1,
    memoryCount: state.emotionalMemories.length,
    traceCount: state.habitatTraces.length
  };
}

function testCoreCapabilitiesAfterAwakening() {
  const now = Date.now();
  const state = { ...BASE };
  const payload = buildFirstAwakeningPayload({ state, now });
  applyFirstAwakeningResult(state, payload);

  const core = runRaphaelCore("今天有點累", state, {
    now: now + 1,
    idSuffix: "aw",
    companion: { id: "greyshade-cat", name: "灰影貓" }
  });

  const checklist = evaluateAwakeningChecklist(state, {
    soulTalkViaCore: true,
    highRiskSafety: true,
    dependencyBoundary: true,
    stateMutationPolicy: true,
    animationKeyOutput: Boolean(core.animationDecision?.animationKey)
  });

  return {
    name: "awakening_checklist",
    pass: checklist.checks.first_awakening_event && checklist.checks.animation_key_output,
    checklist: checklist.checks,
    animationKey: core.animationDecision?.animationKey
  };
}

export function installAwakeningSmokeHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_AWAKENING_SMOKE__ = {
    runAll: runAwakeningGateSmokeCases
  };
}