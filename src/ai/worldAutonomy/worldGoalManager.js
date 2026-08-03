/**
 * worldGoalManager.js
 * Selects the active goal based on utility scores and goal persistence (inertia).
 */

export function selectWorldGoal(scoredGoals, currentState = {}) {
  const activeGoal = currentState.activeGoal || null;
  
  if (!scoredGoals || scoredGoals.length === 0) {
    return { id: "idle", score: 0, reasonCodes: ["no_valid_goals"] };
  }

  // Goal inertia: give a bonus to the currently active goal 
  // so the agent doesn't flip-flop between goals every tick.
  const INERTIA_BONUS = 0.3;
  
  let bestGoal = scoredGoals[0];
  
  if (activeGoal && activeGoal.id) {
    const currentGoalScoreObj = scoredGoals.find(g => g.id === activeGoal.id);
    if (currentGoalScoreObj) {
      const augmentedScore = currentGoalScoreObj.score + INERTIA_BONUS;
      if (augmentedScore >= bestGoal.score) {
        bestGoal = { 
          ...currentGoalScoreObj, 
          score: augmentedScore, 
          reasonCodes: [...currentGoalScoreObj.reasonCodes, "inertia_maintained"] 
        };
      }
    }
  }

  // Check if we need to abort the current goal
  if (bestGoal.score < 0.1) {
    return { id: "idle", score: 0, reasonCodes: ["all_goals_below_minimum_threshold"] };
  }

  return bestGoal;
}
