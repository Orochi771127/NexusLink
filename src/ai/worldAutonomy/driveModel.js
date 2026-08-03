/**
 * driveModel.js
 * Evaluates the companion's biological and psychological needs
 * and outputs Drive values from 0.0 (no drive) to 1.0 (max drive).
 */

export function evaluateDrives(state = {}) {
  // Default needs if not yet initialized in state
  const needs = state.companion?.needs || { 
    energy: 100, // 100 = full energy, 0 = exhausted
    hunger: 0,   // 0 = full, 100 = starving
    boredom: 0,  // 0 = entertained, 100 = bored
    loneliness: 0 // 0 = accompanied, 100 = lonely
  };
  
  // Convert needs to normalized drives [0.0 - 1.0]
  // Higher drive means higher urgency to fulfill the need
  
  // Rest Drive: increases as energy drops. 
  // Non-linear curve to increase urgency sharply when energy is very low.
  const energyRatio = Math.max(0, Math.min(100, needs.energy)) / 100;
  const restDrive = Math.pow(1.0 - energyRatio, 1.5); 

  // Food Drive: increases as hunger goes up.
  const foodDrive = Math.max(0, Math.min(100, needs.hunger)) / 100;

  // Play Drive: increases as boredom goes up.
  const playDrive = Math.max(0, Math.min(100, needs.boredom)) / 100;

  // Social Drive: increases as loneliness goes up.
  const socialDrive = Math.max(0, Math.min(100, needs.loneliness)) / 100;

  // Explore Drive: driven by base curiosity + new objects, modulated by energy
  const exploreDrive = energyRatio * 0.4; // Base explore drive

  return {
    restDrive,
    foodDrive,
    playDrive,
    socialDrive,
    exploreDrive
  };
}
