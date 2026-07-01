import { getSessionTraces } from "./interactionTraceCollector.js";
import { detectFailurePatterns } from "./failurePatternDetector.js";
import { proposeCorpusPatch, proposePolicyPatch } from "./patchProposers.js";
import { formatPatchForReview } from "./humanApprovalGate.js";
import { runEvolutionEval } from "./evalRunner.js";

/**
 * Proposes patches only — never auto-merges production code.
 */
export function runSelfEvolutionPipeline() {
  const traces = getSessionTraces();
  const failures = detectFailurePatterns(traces);
  const proposals = [];

  for (const failure of failures) {
    proposals.push(proposeCorpusPatch(failure));
    proposals.push(proposePolicyPatch(failure));
  }

  const evalResult = runEvolutionEval();

  return {
    eval: evalResult,
    failures,
    proposals: formatPatchForReview(proposals),
    canAutoMerge: false,
    message: "All proposals require human approval before PR."
  };
}