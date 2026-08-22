const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 })
});

function pointInsideRect(point, rect) {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

export function isHunterPositionWalkable(field, point) {
  if (!Number.isInteger(point.x) || !Number.isInteger(point.y)) return false;
  if (point.x < 0 || point.y < 0 || point.x >= field.width || point.y >= field.height) return false;
  return !field.obstacles.some((obstacle) => pointInsideRect(point, obstacle));
}

export function moveResearchHunter(state, directionName) {
  const direction = DIRECTIONS[directionName];
  if (!direction) throw new Error(`Unknown Hunt movement direction: ${directionName}`);
  const field = state.hunt.field;
  if (!field) throw new Error("Hunt Field is not initialized");

  const candidate = {
    x: state.hunt.hunterPosition.x + direction.x,
    y: state.hunt.hunterPosition.y + direction.y
  };
  if (!isHunterPositionWalkable(field, candidate)) {
    return {
      state: {
        ...state,
        hunt: { ...state.hunt, lastCollision: { direction: directionName, candidate } }
      },
      moved: false,
      reachedEncounter: false,
      position: state.hunt.hunterPosition
    };
  }

  const reachedEncounter = candidate.x === field.encounterPoint.x && candidate.y === field.encounterPoint.y;
  return {
    state: {
      ...state,
      hunt: { ...state.hunt, hunterPosition: candidate, lastCollision: null }
    },
    moved: true,
    reachedEncounter,
    position: candidate
  };
}

export function getHuntDirections() {
  return Object.keys(DIRECTIONS);
}
