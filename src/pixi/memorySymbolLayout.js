import { MEMORY_ACTIVE_STATUSES } from "./memoryVisualContract.js";

export const MEMORY_PLACE_LAYOUT = Object.freeze({
  sky_air: Object.freeze({
    xRange: Object.freeze([80, 310]),
    yRange: Object.freeze([150, 310]),
    columns: 4,
    rows: 3
  }),

  lake_surface: Object.freeze({
    xRange: Object.freeze([90, 310]),
    yRange: Object.freeze([390, 500]),
    columns: 4,
    rows: 2
  }),

  campfire_side: Object.freeze({
    xRange: Object.freeze([170, 260]),
    yRange: Object.freeze([530, 620]),
    columns: 3,
    rows: 2
  }),

  shore_side: Object.freeze({
    xRange: Object.freeze([70, 170]),
    yRange: Object.freeze([540, 650]),
    columns: 3,
    rows: 2
  }),

  lake_bottom: Object.freeze({
    xRange: Object.freeze([110, 300]),
    yRange: Object.freeze([500, 620]),
    columns: 4,
    rows: 2
  }),

  magic_circle: Object.freeze({
    xRange: Object.freeze([150, 250]),
    yRange: Object.freeze([460, 560]),
    columns: 3,
    rows: 2
  })
});

const ACTIVE_STATUS_SET = new Set(MEMORY_ACTIVE_STATUSES);
const DEFAULT_PLACE = "lake_surface";

export function resolveMemoryPosition(memory, samePlaceMemories = []) {
  const layout = MEMORY_PLACE_LAYOUT[memory?.place] || MEMORY_PLACE_LAYOUT[DEFAULT_PLACE];
  const slots = buildSlots(layout);
  const activeSamePlaceMemories = samePlaceMemories
    .filter((item) => item && item.place === memory.place && item.isVisibleInHabitat !== false && ACTIVE_STATUS_SET.has(item.status))
    .slice()
    .sort(compareMemoriesByStableOrder);

  const index = Math.max(0, activeSamePlaceMemories.findIndex((item) => item.id === memory.id));
  const slot = slots[index % slots.length] || slots[0];
  const jitter = getDeterministicJitter(memory.id);

  return {
    x: snapPixel(slot.x + jitter.x),
    y: snapPixel(slot.y + jitter.y),
    slotIndex: index,
    place: memory.place || DEFAULT_PLACE
  };
}

export function buildSlots(layout) {
  const columns = Math.max(1, Number(layout.columns) || 1);
  const rows = Math.max(1, Number(layout.rows) || 1);
  const [minX, maxX] = layout.xRange;
  const [minY, maxY] = layout.yRange;
  const slots = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const xRatio = columns === 1 ? 0.5 : column / (columns - 1);
      const yRatio = rows === 1 ? 0.5 : row / (rows - 1);
      slots.push({
        x: snapPixel(lerp(minX, maxX, xRatio)),
        y: snapPixel(lerp(minY, maxY, yRatio))
      });
    }
  }

  return slots;
}

export function getVisibleActiveMemories(memories = []) {
  return memories.filter((memory) => {
    return memory && memory.isVisibleInHabitat !== false && ACTIVE_STATUS_SET.has(memory.status);
  });
}

export function getMemoriesByPlace(memories = [], place) {
  return getVisibleActiveMemories(memories).filter((memory) => memory.place === place);
}

export function getDeterministicJitter(id) {
  const hash = stableHash(id);

  return {
    x: snapPixel(((hash % 7) - 3) * 2),
    y: snapPixel((((hash >>> 3) % 7) - 3) * 2)
  };
}

export function stableHash(value) {
  let hash = 2166136261;

  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function snapPixel(value) {
  return Math.round(Number(value) || 0);
}

function compareMemoriesByStableOrder(a, b) {
  const createdDiff = Number(a.createdAt || 0) - Number(b.createdAt || 0);
  if (createdDiff !== 0) return createdDiff;
  return String(a.id || "").localeCompare(String(b.id || ""));
}

function lerp(min, max, ratio) {
  return min + (max - min) * ratio;
}
