const AWAKENING_SOURCE = "first_awakening";

export const AWAKENING_STAGES = Object.freeze({
  DORMANT: "dormant",
  STIRRING: "stirring",
  AWAKENED: "awakened"
});

export function hasAwakeningMemory(state = {}) {
  const memories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  return memories.some(
    (memory) =>
      memory?.source === AWAKENING_SOURCE ||
      memory?.type === "awakening_memory" ||
      memory?.theme === "心核初醒"
  );
}

export function getAwakeningStage(state = {}) {
  if (hasAwakeningMemory(state)) return AWAKENING_STAGES.AWAKENED;
  if (state.firstTouchCompleted) return AWAKENING_STAGES.STIRRING;
  return AWAKENING_STAGES.DORMANT;
}

export function isRaphaelAwakened(state = {}) {
  return getAwakeningStage(state) === AWAKENING_STAGES.AWAKENED;
}

export function canTriggerFirstAwakening(state = {}) {
  return !hasAwakeningMemory(state);
}

export function shouldGateSoulTalkUntilAwakened(state = {}) {
  return getAwakeningStage(state) === AWAKENING_STAGES.DORMANT;
}