/**
 * worldActionPlanner.js
 * Maps a Goal ID to a specific Action ID and determines the target using Procedural Memory (Skills).
 */
import { SKILL_CONTRACTS } from "./skillContracts.js";

export function planWorldAction(goal, observations) {
  if (!goal || !goal.id) {
    return { actionId: "idle", targetId: null };
  }

  // Phase 4: Procedural Memory - Skill Contract Evaluation
  const candidateSkills = SKILL_CONTRACTS.filter(skill => skill.goalId === goal.id);
  
  for (const skill of candidateSkills) {
    if (skill.preconditions(observations)) {
      return {
        actionId: skill.id,
        targetId: skill.getTarget(observations)
      };
    }
  }

  // Fallback if no skill is valid
  return { actionId: "idle", targetId: null };
}
