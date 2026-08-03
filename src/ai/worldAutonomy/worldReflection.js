/**
 * worldReflection.js
 * Generates a structured decision trace (Event Journal entry)
 * replacing verbose, expensive LLM 'Thoughts'.
 */

export function buildDecisionTrace({ drives, observations, goal, plannedAction, executionResult }) {
  // Compress drives into simple High/Medium/Low bands for easier reading later
  const compressDrive = (val) => val > 0.6 ? "HIGH" : (val > 0.3 ? "MED" : "LOW");

  return {
    timestamp: Date.now(),
    context: {
      timeOfDay: observations?.timeOfDay,
      weather: observations?.weather
    },
    drivesSnapshot: {
      rest: compressDrive(drives?.restDrive || 0),
      food: compressDrive(drives?.foodDrive || 0),
      play: compressDrive(drives?.playDrive || 0),
      social: compressDrive(drives?.socialDrive || 0)
    },
    decision: {
      goalId: goal?.id || "idle",
      reasonCodes: goal?.reasonCodes || [],
      actionId: plannedAction?.actionId || "none",
      targetId: plannedAction?.targetId || null
    },
    executionType: executionResult?.type || "unknown"
  };
}
