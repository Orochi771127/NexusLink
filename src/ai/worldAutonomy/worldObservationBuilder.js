/**
 * worldObservationBuilder.js
 * Scans the canonical game state and extracts relevant World Observations
 * for the World Autonomy Runtime.
 */

export function buildWorldObservation(state = {}, perception = {}) {
  // Extract environment states
  const timeOfDay = state.environment?.timeOfDay || "day";
  const weather = state.environment?.weather || "clear";
  
  // Extract player status
  const isPlayerOnline = state.player?.isOnline || false;
  const playerDistance = state.player?.position && state.companion?.position 
    ? calculateDistance(state.player.position, state.companion.position) 
    : Infinity;

  // Extract habitat objects
  const habitatObjects = Array.isArray(state.habitat?.objects) ? state.habitat.objects : [];
  const nearbyRestSpots = habitatObjects.filter(obj => obj.tags?.includes("rest_spot") || obj.type === "campfire");
  const availableFood = habitatObjects.filter(obj => obj.tags?.includes("food") && !obj.isDepleted);
  const newObjects = habitatObjects.filter(obj => obj.isNew);

  return {
    timeOfDay,
    weather,
    isPlayerOnline,
    playerDistance,
    nearbyRestSpots,
    availableFood,
    newObjects,
    safeZone: state.habitat?.isSafeZone !== false
  };
}

function calculateDistance(posA, posB) {
  const dx = posA.x - posB.x;
  const dy = posA.y - posB.y;
  return Math.sqrt(dx * dx + dy * dy);
}
