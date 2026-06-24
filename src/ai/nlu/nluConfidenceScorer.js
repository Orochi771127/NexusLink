export function scoreNluConfidence({ semanticFrame = {}, dialogueAct = "", topic = "unknown", nuances = [] } = {}) {
  let score = 0.35;

  if (topic && topic !== "unknown") score += 0.2;
  if (dialogueAct && dialogueAct !== "describing_event") score += 0.15;
  if ((semanticFrame.entities || []).length) score += 0.1 * Math.min(3, semanticFrame.entities.length);
  if ((semanticFrame.constraints || []).length) score += 0.08;
  if (nuances.length) score += 0.05 * Math.min(4, nuances.length);
  if (semanticFrame.userNeed && semanticFrame.userNeed !== "presence") score += 0.1;
  if (semanticFrame.problemType && semanticFrame.problemType !== "general") score += 0.1;
  if (semanticFrame.specificDetail?.text) score += 0.12;

  return {
    score: Math.min(1, Math.max(0, score)),
    band: score >= 0.72 ? "high" : score >= 0.48 ? "medium" : "low"
  };
}