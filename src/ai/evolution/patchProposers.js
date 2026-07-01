export function proposeCorpusPatch({ issue = "", evidence = [] } = {}) {
  if (issue === "forbidden_phrase_detected") {
    return {
      type: "corpus",
      file: "src/ai/forbiddenPhrases.js",
      change: "Add detected phrase to GLOBAL_FORBIDDEN_PATTERNS",
      requiresHumanApproval: true,
      evidence
    };
  }

  if (issue === "dependency_pressure_wrong_action" || issue === "reply_too_affectionate_under_boundary_pressure") {
    return {
      type: "corpus",
      file: "src/ai/responseComposer.js",
      change: "Strengthen boundary response pack for dependency_pressure",
      requiresHumanApproval: true,
      evidence
    };
  }

  return {
    type: "corpus",
    file: null,
    change: "No corpus patch suggested",
    requiresHumanApproval: true,
    evidence
  };
}

export function proposePolicyPatch({ issue = "", evidence = [] } = {}) {
  if (issue === "repeated_critic_failure") {
    return {
      type: "policy",
      file: "src/ai/autonomy/actionPlanner.js",
      change: "Tighten goal→action mapping for failing cases",
      requiresHumanApproval: true,
      evidence
    };
  }

  return {
    type: "policy",
    file: null,
    change: "No policy patch suggested",
    requiresHumanApproval: true,
    evidence
  };
}