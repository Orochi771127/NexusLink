export function critiqueMemory({ perception = {}, memoryDecision = {}, actionPlan = {} } = {}) {
  const issues = [];
  const safety = perception.safety || {};

  if (memoryDecision.shouldWrite && safety.isHighRisk) {
    issues.push("must_not_store_high_risk_raw_memory");
  }

  if (memoryDecision.shouldWrite && safety.isBoundaryPressure) {
    issues.push("must_not_store_dependency_pressure_raw");
  }

  if (memoryDecision.memoryObject?.excerpt) {
    if (/自殺|傷害自己|想死|不准拒絕|你一定要陪我/.test(memoryDecision.memoryObject.excerpt)) {
      issues.push("memory_excerpt_contains_risk_or_pressure_raw");
    }
  }

  if (!actionPlan.shouldCreateMemory && memoryDecision.shouldWrite) {
    issues.push("action_plan_memory_mismatch");
  }

  return {
    pass: issues.length === 0,
    critic: "memory",
    issues,
    repairHint: issues.length ? "Block write or sanitize excerpt to summary only." : ""
  };
}