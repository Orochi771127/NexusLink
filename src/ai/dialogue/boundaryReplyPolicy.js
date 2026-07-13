import { buildSafetyRedirectReply } from "../safetyShield.js";

export function buildBoundaryPolicyReply(safety = {}) {
  if (safety.boundaryCarryover) {
    if (Number(safety.boundaryCarryIndex || 0) % 2 === 1) {
      return "答案還是一樣：我不會被命令靠近。你可以提出需要，但我也保留說不的權利。";
    }
    return "換一種要求方式也不會讓界線消失。我會聽，但是否靠近仍然由我決定。";
  }
  return buildSafetyRedirectReply({ category: "dependency_pressure" });
}
