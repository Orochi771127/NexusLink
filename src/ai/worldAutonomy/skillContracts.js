/**
 * skillContracts.js
 * 
 * Procedural Memory: defines the skills/actions Raphael has learned
 * and the conditions under which they can be executed.
 */

export const SKILL_CONTRACTS = [
  {
    id: "rest_at_spot",
    goalId: "restore_energy",
    preconditions: (observations) => observations.nearbyRestSpots?.length > 0,
    getTarget: (observations) => observations.nearbyRestSpots[0].id,
    maxDurationSeconds: 120,
    abortConditions: ["hazardDetected", "playerStartsInteraction"]
  },
  {
    id: "eat_available_food",
    goalId: "satisfy_hunger",
    preconditions: (observations) => observations.availableFood?.length > 0,
    getTarget: (observations) => observations.availableFood[0].id,
    maxDurationSeconds: 45,
    abortConditions: ["hazardDetected", "playerStartsInteraction"]
  },
  {
    id: "approach_player_avatar_anchor",
    goalId: "socialize",
    preconditions: () => true,
    getTarget: () => "player_avatar",
    maxDurationSeconds: 30,
    abortConditions: ["playerLeavesHabitat"]
  },
  {
    id: "inspect_habitat_object",
    goalId: "explore_new_object",
    preconditions: (observations) => observations.newObjects?.length > 0,
    getTarget: (observations) => observations.newObjects[0].id,
    maxDurationSeconds: 60,
    abortConditions: ["hazardDetected"]
  },
  {
    id: "play_idle_activity",
    goalId: "idle_play",
    preconditions: () => true,
    getTarget: () => null,
    maxDurationSeconds: 180,
    abortConditions: ["hazardDetected", "playerStartsInteraction"]
  },
  {
    id: "wander_safe_area",
    goalId: "wander",
    preconditions: () => true,
    getTarget: () => null,
    maxDurationSeconds: 120,
    abortConditions: ["hazardDetected"]
  }
];
