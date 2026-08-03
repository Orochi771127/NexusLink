/**
 * utilityScorer.js
 * Evaluates possible goals and assigns a utility score to each based on Drives and Observations.
 * This is the core of the Deterministic Utility AI system.
 */

export function scoreGoals(drives, observations) {
  const goals = [
    { id: "restore_energy", score: 0, reasonCodes: [] },
    { id: "satisfy_hunger", score: 0, reasonCodes: [] },
    { id: "socialize", score: 0, reasonCodes: [] },
    { id: "explore_new_object", score: 0, reasonCodes: [] },
    { id: "idle_play", score: 0, reasonCodes: [] },
    { id: "wander", score: 0, reasonCodes: [] }
  ];

  // 1. Restore Energy (High priority if exhausted)
  if (drives.restDrive > 0.3) {
    let score = drives.restDrive * 1.5;
    const goal = goals.find(g => g.id === "restore_energy");
    goal.reasonCodes.push("energy_below_threshold");
    
    if (observations.nearbyRestSpots?.length > 0) {
      score += 0.2;
      goal.reasonCodes.push("rest_spot_available");
    }
    goal.score = score;
  }

  // 2. Satisfy Hunger
  if (drives.foodDrive > 0.4) {
    let score = drives.foodDrive * 1.2;
    const goal = goals.find(g => g.id === "satisfy_hunger");
    goal.reasonCodes.push("hunger_below_threshold");

    if (observations.availableFood?.length > 0) {
      score += 0.3;
      goal.reasonCodes.push("food_available");
    } else {
      score *= 0.5; // Harder to fulfill if no food nearby
    }
    goal.score = score;
  }

  // 3. Socialize
  if (drives.socialDrive > 0.3 && observations.isPlayerOnline) {
    let score = drives.socialDrive * 1.0;
    const goal = goals.find(g => g.id === "socialize");
    goal.reasonCodes.push("player_online_social_drive");

    if (observations.playerDistance < 100) {
      score += 0.4;
      goal.reasonCodes.push("player_nearby");
    }
    goal.score = score;
  }

  // 4. Explore New Objects
  if (observations.newObjects?.length > 0 && drives.exploreDrive > 0.2) {
    let score = drives.exploreDrive * 1.2 + 0.4;
    const goal = goals.find(g => g.id === "explore_new_object");
    goal.score = score;
    goal.reasonCodes.push("new_object_detected");
  }

  // 5. Idle Play
  if (drives.playDrive > 0.2) {
    const goal = goals.find(g => g.id === "idle_play");
    goal.score = drives.playDrive * 1.0;
    goal.reasonCodes.push("play_drive_active");
  }

  // 6. Wander (Default fallback activity)
  if (observations.safeZone) {
    const goal = goals.find(g => g.id === "wander");
    goal.score = drives.exploreDrive * 0.8 + 0.1; // Base score to ensure it's > 0
    goal.reasonCodes.push("safe_zone_exploration");
  }

  // Sort descending by score
  return goals.sort((a, b) => b.score - a.score);
}
