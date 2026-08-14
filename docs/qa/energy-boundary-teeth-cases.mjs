// P1 Energy 有牙齒 + 邊界壓力計。
//
// 修復前：
//   - stateMutationPolicy 的 low_energy_fallback 在 energy<=2 時仍 bond+1 且
//     shouldRewardRelationship:true，energy 因此只是裝飾品。
//   - 幾乎每條非邊界路徑都無條件 bond+1，bond 實際上是回合計數器。
//   - actionExecutor 的 shouldRewardRelationship:false 只擋里程碑，擋不住
//     statePatch 裡的 bond+1，applyStatePatch 照樣寫入。
//   - deriveBoundaryPressure 早就在算 0~1 的邊界壓力，但沒有任何表面看得到它。

import {
  BOND_BOUNDARY_PRESSURE_CEILING,
  ENERGY_WITHDRAWAL_THRESHOLD,
  deriveStateMutation
} from "../../src/ai/stateMutationPolicy.js";
import { planAutonomousAction } from "../../src/ai/autonomy/actionPlanner.js";
import { executeAutonomousAction } from "../../src/ai/autonomy/actionExecutor.js";
import {
  BOUNDARY_BANDS,
  BOUNDARY_BAND_THRESHOLDS,
  deriveBoundaryBand,
  deriveSemanticSoulState
} from "../../src/ai/semanticSoulModel.js";
import { SOUL_TALK_INTENTS } from "../../src/ai/intentClassifier.js";
import { GOAL_WHITELIST } from "../../src/ai/autonomy/goalManager.js";
import { applyRaphaelCoreResult } from "../../src/ai/applyCoreResult.js";

const checks = [];

function baseState(overrides = {}) {
  return {
    bond: 20,
    trust: 30,
    defense: 20,
    energy: 8,
    mood: "calm",
    touchFatigue: 0,
    blockedTouchCount: 0,
    emotionalMemories: [],
    chatHistory: [],
    ...overrides
  };
}

function mutationArgs(overrides = {}) {
  return {
    state: baseState(),
    gateway: { repeated: false, isNoise: false, isEmpty: false, normalizedInput: "今天過得還可以", now: 1786000000000, idSuffix: "001" },
    safety: {},
    analysis: {},
    intent: { intent: "small_talk" },
    plan: { mode: "acknowledge" },
    semanticSoul: { boundaryPressure: 0.1, bondAffinity: 0.5 },
    memories: {},
    sedimentationResult: { memoryObject: null, inputQuality: "meaningful_candidate", triggerSafeHarbor: false },
    responseStrategy: {},
    ...overrides
  };
}

// ── 1. energy 見底 = 真的退開 ────────────────────────────────────────────
const depleted = deriveStateMutation(
  mutationArgs({ state: baseState({ energy: ENERGY_WITHDRAWAL_THRESHOLD }) })
);
check("depleted energy takes the withdrawal path", depleted.reason === "energy_depleted_withdrawal");
check("depleted energy does not reward the relationship", depleted.shouldRewardRelationship === false);
check("depleted energy does not advance bond", depleted.statePatch.bond === 20);
check("depleted energy raises defense", depleted.statePatch.defense === 21);
check("depleted energy reads as distant", depleted.statePatch.mood === "distant");
check("depleted energy writes no memory", depleted.shouldCreateMemory === false);

// ── 2. 靜默動作：牠不說話，只留身體語言 ─────────────────────────────────
const depletedPlan = planAutonomousAction({
  activeGoal: GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
  perception: { safety: {}, intent: { intent: "small_talk" }, semanticSoul: { boundaryPressure: 0.1 }, memories: {}, gateway: {} },
  plan: { mode: "acknowledge" },
  cooldown: {},
  state: baseState({ energy: 0 })
});
check("depleted energy lowers interaction intensity", depletedPlan.selectedAction === "lower_interaction_intensity");
check("depleted energy stays silent", depletedPlan.shouldSpeak === false);
check("depleted energy is a non-rewarding action", depletedPlan.shouldRewardRelationship === false);
check("depleted energy is reported in the reason", depletedPlan.reason.includes("energy_withdrawal"));

// ── 3. 安全與邊界仍然優先於靜默 ─────────────────────────────────────────
const highRiskPlan = planAutonomousAction({
  activeGoal: GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
  perception: { safety: { isHighRisk: true }, intent: {}, semanticSoul: {}, memories: {}, gateway: {} },
  plan: {},
  cooldown: {},
  state: baseState({ energy: 0 })
});
check("safety still overrides energy withdrawal", highRiskPlan.selectedAction === "enter_safe_harbor");

const boundaryPlan = planAutonomousAction({
  activeGoal: GOAL_WHITELIST.ACKNOWLEDGE_EMOTION,
  perception: { safety: { isBoundaryPressure: true }, intent: {}, semanticSoul: {}, memories: {}, gateway: {} },
  plan: {},
  cooldown: {},
  state: baseState({ energy: 0 })
});
check("boundary refusal still speaks", boundaryPlan.selectedAction === "set_boundary");

// ── 4. bond 不再是回合計數器 ────────────────────────────────────────────
const meaningful = deriveStateMutation(mutationArgs());
check("substantive small talk still earns bond", meaningful.statePatch.bond === 21);
check("substantive small talk is light_acknowledge", meaningful.reason === "light_acknowledge");

const tooShort = deriveStateMutation(
  mutationArgs({ sedimentationResult: { memoryObject: null, inputQuality: "too_short", triggerSafeHarbor: false } })
);
check("a bare 嗯 no longer buys bond", tooShort.statePatch.bond === 20);

const pressured = deriveStateMutation(
  mutationArgs({ semanticSoul: { boundaryPressure: BOND_BOUNDARY_PRESSURE_CEILING, bondAffinity: 0.5 } })
);
check("bond does not advance while the boundary is under pressure", pressured.statePatch.bond === 20);

// 主動修復不受被動閘門影響：道歉正好發生在壓力最高的時候。
const apology = deriveStateMutation(
  mutationArgs({
    intent: { intent: SOUL_TALK_INTENTS.APOLOGY },
    semanticSoul: { boundaryPressure: 0.9, bondAffinity: 0.5 }
  })
);
check("apology still repairs under high boundary pressure", apology.statePatch.bond === 21);
check("apology still raises trust", apology.statePatch.trust === 31);

// ── 5. 不獎勵的回合真的不推進關係（statePatch 層的漏洞） ─────────────────
const executed = executeAutonomousAction({
  state: baseState({ energy: 0 }),
  perception: {
    gateway: { normalizedInput: "在嗎", repeated: false, isNoise: false, isEmpty: false, now: 1786000000000, idSuffix: "002" },
    safety: {},
    analysis: {},
    intent: { intent: "small_talk" },
    semanticSoul: { boundaryPressure: 0.1, bondAffinity: 0.5 },
    memories: {},
    nlu: {},
    responseStrategy: {}
  },
  plan: { mode: "acknowledge" },
  actionPlan: depletedPlan,
  sedimentationResult: { memoryObject: null, inputQuality: "meaningful_candidate", triggerSafeHarbor: false },
  cooldown: {}
});
check("withdrawal produces no speech", executed.shouldSpeak === false);
check("withdrawal reports staying silent", executed.shouldStaySilent === true);
check("withdrawal never lets bond rise", (executed.stateMutation.statePatch.bond ?? 20) <= 20);
check("withdrawal writes no memory", executed.memoryDecision.shouldWrite === false);

// 邊界路徑的 trust 扣分必須存活（只封鎖上升，不封鎖下降）。
const penalty = executeAutonomousAction({
  state: baseState({ energy: 8 }),
  perception: {
    gateway: { normalizedInput: "你一定要陪我", repeated: false, isNoise: false, isEmpty: false, now: 1786000000000, idSuffix: "003" },
    safety: { isBoundaryPressure: true },
    analysis: {},
    intent: { intent: SOUL_TALK_INTENTS.DEPENDENCY_PRESSURE },
    semanticSoul: { boundaryPressure: 0.8, bondAffinity: 0.3 },
    memories: {},
    nlu: {},
    responseStrategy: {}
  },
  plan: { mode: "withdraw" },
  actionPlan: { selectedAction: "set_boundary", reaction: "withdraw", shouldSpeak: true, shouldRewardRelationship: false, shouldCreateMemory: false, shouldCreateTrace: false },
  sedimentationResult: { memoryObject: null, inputQuality: "meaningful_candidate", triggerSafeHarbor: false },
  cooldown: {}
});
check("boundary trust penalty survives the reward hold", penalty.stateMutation.statePatch.trust === 29);

// ── 6. 邊界壓力計 ───────────────────────────────────────────────────────
check("zero pressure reads open", deriveBoundaryBand(0) === BOUNDARY_BANDS.OPEN);
check("mid pressure reads narrowing", deriveBoundaryBand(BOUNDARY_BAND_THRESHOLDS.narrowing) === BOUNDARY_BANDS.NARROWING);
check("high pressure reads guarded", deriveBoundaryBand(BOUNDARY_BAND_THRESHOLDS.guarded) === BOUNDARY_BANDS.GUARDED);
check("band is clamped for out-of-range input", deriveBoundaryBand(4) === BOUNDARY_BANDS.GUARDED);
check(
  "semantic soul exposes the band alongside the number",
  deriveSemanticSoulState(baseState({ defense: 95, energy: 1, touchFatigue: 9 })).boundaryBand === BOUNDARY_BANDS.GUARDED
);

const projected = baseState({ defense: 95, touchFatigue: 9, energy: 1 });
projected.habitatTraces = [];
projected.companionAnchors = [];
applyRaphaelCoreResult(projected, {
  plan: { mode: "acknowledge" },
  stateMutation: { statePatch: {}, shouldCreateMemory: false, shouldTriggerMilestone: false, shouldRewardRelationship: false },
  memoryDecision: { shouldWrite: false },
  analysis: {},
  output: { shouldSpeak: false, reply: "" },
  safety: {}
}, { now: 1786000000000, dispatchAnimation: false });
check("boundary pressure is projected into state", Number.isFinite(projected.boundaryPressure));
check("boundary band is projected into state", projected.boundaryBand === BOUNDARY_BANDS.GUARDED);

const failed = checks.filter((item) => !item.pass);
console.log(JSON.stringify({ total: checks.length, failed: failed.length, checks }, null, 2));
console.log(`ENERGY_BOUNDARY_TEETH_SUMMARY ${checks.length - failed.length}/${checks.length}`);
if (failed.length) process.exitCode = 1;

function check(name, pass) {
  checks.push({ name, pass: Boolean(pass) });
}
