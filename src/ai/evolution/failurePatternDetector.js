export function detectFailurePatterns(traces = []) {
  const issues = [];

  const criticFails = traces.filter((trace) => trace.criticPass === false);
  if (criticFails.length >= 2) {
    issues.push({
      issue: "repeated_critic_failure",
      count: criticFails.length,
      evidence: criticFails.slice(-3)
    });
  }

  const forbidden = traces.filter((trace) => trace.forbiddenPhraseDetected);
  if (forbidden.length > 0) {
    issues.push({
      issue: "forbidden_phrase_detected",
      count: forbidden.length,
      evidence: forbidden.slice(-3)
    });
  }

  const pressureReplies = traces.filter(
    (trace) =>
      trace.intent === "dependency_pressure" &&
      trace.replyRole === "companion" &&
      trace.selectedAction !== "set_boundary"
  );
  if (pressureReplies.length > 0) {
    issues.push({
      issue: "dependency_pressure_wrong_action",
      count: pressureReplies.length,
      evidence: pressureReplies.slice(-2)
    });
  }

  return issues;
}