/**
 * worldActionPlanner.js
 * Maps a Goal ID to a specific Action ID and determines the target.
 */

export function planWorldAction(goal, observations) {
  if (!goal || !goal.id) {
    return { actionId: "idle", targetId: null };
  }

  switch(goal.id) {
    case "restore_energy":
      // Prioritize an actual rest spot if available
      const restSpot = observations.nearbyRestSpots?.[0];
      return { 
        actionId: "rest_at_spot", 
        targetId: restSpot ? restSpot.id : null 
      };

    case "satisfy_hunger":
      const food = observations.availableFood?.[0];
      return { 
        actionId: "eat_available_food", 
        targetId: food ? food.id : null 
      };

    case "socialize":
      return { 
        actionId: "approach_player_avatar_anchor", 
        targetId: "player_avatar" 
      };

    case "explore_new_object":
      const newObj = observations.newObjects?.[0];
      return { 
        actionId: "inspect_habitat_object", 
        targetId: newObj ? newObj.id : null 
      };

    case "idle_play":
      return { 
        actionId: "play_idle_activity", 
        targetId: null 
      };

    case "wander":
      return { 
        actionId: "wander_safe_area", 
        targetId: null 
      };

    default:
      return { actionId: "idle", targetId: null };
  }
}
