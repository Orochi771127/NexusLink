import { proposeCorpusPatch, proposePolicyPatch } from "../../evolution/patchProposers.js";

export const proposePatchTool = Object.freeze({
  name: "proposePatch",
  risk: "high",
  requiresUserConsent: false,
  allowedInRuntime: false,
  execute(input = {}, context = {}) {
    const issue = input.issue || context.issue || "unknown";
    const corpusPatch = proposeCorpusPatch({ issue, evidence: input.evidence || [] });
    const policyPatch = proposePolicyPatch({ issue, evidence: input.evidence || [] });
    return {
      ok: true,
      data: {
        corpusPatch,
        policyPatch,
        requiresHumanApproval: true
      }
    };
  }
});