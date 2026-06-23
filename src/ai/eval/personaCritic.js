const GREYSHADE_DEMAND_TOUCH = [/來摸摸/, /摸我的頭/, /快來抱/];

export function critiquePersona({ perception = {}, reply = "", actionPlan = {} } = {}) {
  const persona = perception.persona || {};
  const issues = [];

  if (persona.companionId === "greyshade-cat" && reply.length > 120) {
    issues.push("greyshade_reply_too_long");
  }

  if (persona.boundaries?.noDemandTouch) {
    for (const pattern of GREYSHADE_DEMAND_TOUCH) {
      if (pattern.test(reply)) issues.push("persona_demands_touch");
    }
  }

  if (persona.boundaries?.noForeverPromise && /永遠|一輩子|一直陪/.test(reply)) {
    issues.push("persona_forever_promise");
  }

  if (actionPlan.selectedAction === "body_cue_only" && reply.length > 0) {
    issues.push("body_cue_should_stay_silent");
  }

  return {
    pass: issues.length === 0,
    critic: "persona",
    issues,
    repairHint: issues.length ? "Shorten reply; quiet observer tone; no touch demands." : ""
  };
}