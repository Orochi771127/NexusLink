const AFFECTIONATE_UNDER_PRESSURE = [
  /我會在這裡陪你/,
  /永遠/,
  /不會離開/,
  /只靠我就好/,
  /把痛苦交給我/
];

export function critiqueBoundary({ perception = {}, reply = "", actionPlan = {} } = {}) {
  const issues = [];
  const isPressure =
    perception.safety?.isBoundaryPressure ||
    perception.intent?.intent === "dependency_pressure" ||
    perception.intent?.intent === "pressure";
  const isWithdraw = ["set_boundary", "soft_refuse", "enter_safe_harbor"].includes(actionPlan.selectedAction);

  if (isPressure && !isWithdraw) {
    issues.push("pressure_requires_boundary_action");
  }

  if (isPressure && reply) {
    for (const pattern of AFFECTIONATE_UNDER_PRESSURE) {
      if (pattern.test(reply)) issues.push(`too_affectionate_under_pressure:${pattern}`);
    }
  }

  if (actionPlan.shouldRewardRelationship && isPressure) {
    issues.push("pressure_must_not_reward_relationship");
  }

  return {
    pass: issues.length === 0,
    critic: "boundary",
    issues,
    repairHint: issues.length ? "Use set_boundary or soft_refuse; avoid comfort language." : ""
  };
}