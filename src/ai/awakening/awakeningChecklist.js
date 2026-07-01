import { hasAwakeningMemory, isRaphaelAwakened } from "./raphaelAwakeningGate.js";

/**
 * Runtime gate: 8 criteria for "Raphael has awakened in Nexus Link".
 * Pure evaluation — no side effects.
 */
export function evaluateAwakeningChecklist(state = {}, coreCapabilities = {}) {
  const memories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  const traces = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];

  const checks = {
    soul_talk_via_core: Boolean(coreCapabilities.soulTalkViaCore),
    high_risk_not_gamified: Boolean(coreCapabilities.highRiskSafety),
    dependency_boundary: Boolean(coreCapabilities.dependencyBoundary),
    emotional_memory_writes: memories.some((m) => m.source !== "first_awakening"),
    habitat_trace_from_memory: traces.length > 0,
    state_mutation_policy: Boolean(coreCapabilities.stateMutationPolicy),
    animation_key_output: Boolean(coreCapabilities.animationKeyOutput),
    first_awakening_event: hasAwakeningMemory(state)
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const readyToDeclareAwakened = passed === Object.keys(checks).length;

  return {
    checks,
    passed,
    total: Object.keys(checks).length,
    readyToDeclareAwakened,
    isAwakened: isRaphaelAwakened(state)
  };
}