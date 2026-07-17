export const CRYSTAL_VISUAL_STATES = Object.freeze({
  GLIMMER: "glimmer",
  SEED: "seed",
  CLUSTER: "cluster",
  ATTUNED: "attuned",
  TRANSFORMED: "transformed",
  RELEASED: "released"
});

const HIDDEN_MEMORY_STATUSES = new Set(["released", "archived"]);

/**
 * Resolve the Moonlake crystal's visual state from emotional memory lifecycle
 * data. This is intentionally presentation-only: the input is never mutated
 * and no gameplay value is derived from the result.
 */
export function resolveCrystalVisualState(emotionalMemories = []) {
  const memories = (Array.isArray(emotionalMemories) ? emotionalMemories : [])
    .filter((memory) => memory && typeof memory === "object" && !Array.isArray(memory));

  if (memories.length === 0) {
    return CRYSTAL_VISUAL_STATES.GLIMMER;
  }

  const visibleMemories = memories.filter((memory) => {
    if (memory.isVisible === false || memory.isVisibleInHabitat === false) return false;
    return !HIDDEN_MEMORY_STATUSES.has(memory.status);
  });

  if (visibleMemories.length === 0) {
    return CRYSTAL_VISUAL_STATES.RELEASED;
  }

  if (visibleMemories.some((memory) => memory.status === "transformed")) {
    return CRYSTAL_VISUAL_STATES.TRANSFORMED;
  }

  if (visibleMemories.some((memory) => memory.status === "settled")) {
    return CRYSTAL_VISUAL_STATES.ATTUNED;
  }

  return visibleMemories.length >= 2
    ? CRYSTAL_VISUAL_STATES.CLUSTER
    : CRYSTAL_VISUAL_STATES.SEED;
}
