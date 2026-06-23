import { runAllRaphaelSmokeCases } from "../testHarness/raphaelCoreSmokeCases.js";
import { detectFailurePatterns } from "./failurePatternDetector.js";
import { getSessionTraces } from "./interactionTraceCollector.js";

export function runEvolutionEval() {
  const smoke = runAllRaphaelSmokeCases();
  const smokePass = smoke.every((row) => !row.forbiddenPhraseDetected);
  const traces = getSessionTraces();
  const failures = detectFailurePatterns(traces);

  return {
    smokePass,
    smokeCount: smoke.length,
    smokeFailures: smoke.filter((row) => row.forbiddenPhraseDetected),
    traceFailures: failures,
    pass: smokePass && failures.length === 0
  };
}