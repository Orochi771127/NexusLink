import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";
import {
  FIELD_COLLISION_PROFILE_IDS,
  FIELD_COLLISION_RULES,
  FIELD_FAMILIES,
  createFieldDefinition
} from "../field/index.js";
import { getFieldFamilyProfile } from "../../data/championship/r2/fields/fieldInventoryR2.js";

export const RAISING_HOME_COMMANDS = Object.freeze({
  MOVE_CARETAKER: "RAISING_HOME_MOVE_CARETAKER",
  ADVANCE: "RAISING_HOME_ADVANCE",
  SELECT_RESIDENT: "RAISING_HOME_SELECT_RESIDENT",
  INVITE: "RAISING_HOME_INVITE",
  CARE: "RAISING_HOME_CARE",
  TRAIN: "RAISING_HOME_TRAIN",
  REST: "RAISING_HOME_REST",
  TOGGLE_PAUSE: "RAISING_HOME_TOGGLE_PAUSE"
});

const DIRECTIONS = Object.freeze({
  up: Object.freeze({ x: 0, y: -1 }),
  down: Object.freeze({ x: 0, y: 1 }),
  left: Object.freeze({ x: -1, y: 0 }),
  right: Object.freeze({ x: 1, y: 0 })
});

const CM_R2_HOME = {
  fieldId: "nexus:championship:r2:field:raising-home",
  family: "CM",
  width: 24,
  height: 14,
  tileSize: 32,
  evidenceStatus: "NEXUS_ADAPTATION",
  originalParityClaim: false,
  collisionProfile: "CM_AUTHORED_GRID_R2",
  zones: [
    { zoneId: "moonwell", label: "Moonwell Care", x: 2, y: 2, width: 5, height: 4, tone: "water" },
    { zoneId: "quiet-nest", label: "Quiet Nest", x: 16, y: 2, width: 5, height: 4, tone: "rest" },
    { zoneId: "resonance-yard", label: "Resonance Yard", x: 15, y: 9, width: 6, height: 3, tone: "training" },
    { zoneId: "heart-garden", label: "Heart Garden", x: 3, y: 9, width: 7, height: 3, tone: "garden" }
  ],
  obstacles: [
    { x: 0, y: 0, width: 24, height: 1 },
    { x: 0, y: 13, width: 24, height: 1 },
    { x: 0, y: 0, width: 1, height: 14 },
    { x: 23, y: 0, width: 1, height: 14 },
    { x: 10, y: 1, width: 4, height: 3 },
    { x: 11, y: 4, width: 2, height: 3 },
    { x: 7, y: 6, width: 2, height: 2 },
    { x: 16, y: 6, width: 2, height: 2 }
  ]
};

export const RAISING_HOME_FIELD = deepFreeze(clonePlainData(CM_R2_HOME));

export const RAISING_HOME_KERNEL_FIELD_DEFINITION = createFieldDefinition({
  schemaVersion: 2,
  fieldId: RAISING_HOME_FIELD.fieldId,
  family: FIELD_FAMILIES.CM,
  collisionProfileId: FIELD_COLLISION_PROFILE_IDS.CM,
  dimensions: { widthTiles: RAISING_HOME_FIELD.width, heightTiles: RAISING_HOME_FIELD.height },
  tileSizePx: RAISING_HOME_FIELD.tileSize,
  chunkSizeTiles: 8,
  collisionData: { kind: FIELD_COLLISION_RULES.UNKNOWN_NOT_EXECUTABLE }
}, getFieldFamilyProfile(FIELD_FAMILIES.CM));

const RESIDENT_TEMPLATES = deepFreeze([
  {
    residentId: "resident:greyshade-cat",
    speciesId: "greyshade-cat",
    name: "Greyshade",
    position: { x: 5, y: 7 },
    temperament: "watchful",
    satiety: 72,
    energy: 68,
    ease: 64,
    readiness: 58
  },
  {
    residentId: "resident:blazetail-kit",
    speciesId: "blazetail-kit",
    name: "Blazetail",
    position: { x: 18, y: 8 },
    temperament: "bright",
    satiety: 66,
    energy: 76,
    ease: 59,
    readiness: 70
  },
  {
    residentId: "resident:crystalfin-seahorse",
    speciesId: "crystalfin-seahorse",
    name: "Crystalfin",
    position: { x: 6, y: 4 },
    temperament: "gentle",
    satiety: 80,
    energy: 62,
    ease: 74,
    readiness: 52
  }
]);

function clamp(value, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, value));
}

function isInsideObstacle(position, field = RAISING_HOME_FIELD) {
  return field.obstacles.some((obstacle) => (
    position.x >= obstacle.x
    && position.x < obstacle.x + obstacle.width
    && position.y >= obstacle.y
    && position.y < obstacle.y + obstacle.height
  ));
}

export function canEnterRaisingHome(position, field = RAISING_HOME_FIELD) {
  if (!Number.isInteger(position?.x) || !Number.isInteger(position?.y)) return false;
  if (position.x < 0 || position.y < 0 || position.x >= field.width || position.y >= field.height) return false;
  return !isInsideObstacle(position, field);
}

function movePosition(position, direction, field) {
  const delta = DIRECTIONS[direction];
  if (!delta) throw new TypeError(`Unknown raising-home direction: ${direction}`);
  const target = { x: position.x + delta.x, y: position.y + delta.y };
  return canEnterRaisingHome(target, field) ? target : position;
}

function manhattan(left, right) {
  return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}

function deterministicDirection(tick, residentIndex) {
  return ["up", "right", "down", "left"][(tick * 3 + residentIndex * 5) % 4];
}

function selectedResident(state) {
  return state.residents.find((resident) => resident.residentId === state.selectedResidentId);
}

function updateResident(state, resident, residentIndex) {
  const direction = deterministicDirection(state.tick, residentIndex);
  const shouldWander = (state.tick + residentIndex) % 2 === 0;
  const nextPosition = shouldWander ? movePosition(resident.position, direction, state.field) : resident.position;
  return {
    ...resident,
    position: nextPosition,
    facing: direction,
    satiety: clamp(resident.satiety - (state.tick % 5 === 0 ? 1 : 0)),
    energy: clamp(resident.energy - (state.tick % 4 === 0 ? 1 : 0)),
    ease: clamp(resident.ease + (resident.intent === "resting" ? 1 : 0)),
    readiness: clamp(resident.readiness + (resident.intent === "training" ? 1 : 0))
  };
}

function feedback(state, message, eventType) {
  return {
    ...state,
    feedback: message,
    eventLog: [...state.eventLog, { sequence: state.revision + 1, tick: state.tick, type: eventType, message }].slice(-48)
  };
}

export function createRaisingHomeInitialState({ sessionId = "championship-r2-home", field = RAISING_HOME_FIELD } = {}) {
  if (typeof sessionId !== "string" || !/^[a-z0-9:_-]{3,96}$/i.test(sessionId)) throw new TypeError("A sanitized raising-home sessionId is required");
  const state = {
    schemaVersion: 2,
    modeId: "raising-home",
    sessionId,
    revision: 0,
    tick: 0,
    paused: false,
    clockMinutes: 8 * 60,
    caretakerPosition: { x: 12, y: 10 },
    selectedResidentId: RESIDENT_TEMPLATES[0].residentId,
    residents: RESIDENT_TEMPLATES.map((resident) => ({ ...clonePlainData(resident), facing: "down", intent: "wandering", lastResponse: "settled" })),
    field: clonePlainData(field),
    feedback: "The Raising Home is awake. Move through the grid and listen before acting.",
    eventLog: []
  };
  if (!canEnterRaisingHome(state.caretakerPosition, state.field)) throw new Error("Raising-home caretaker start is blocked");
  for (const resident of state.residents) {
    if (!canEnterRaisingHome(resident.position, state.field)) throw new Error(`Raising-home resident start is blocked: ${resident.residentId}`);
  }
  return deepFreeze(state);
}

export function reduceRaisingHome(state, command) {
  if (!state || state.modeId !== "raising-home") throw new TypeError("A raising-home state is required");
  if (!command || typeof command.type !== "string") throw new TypeError("A raising-home command is required");
  let next = clonePlainData(state);

  if (command.type === RAISING_HOME_COMMANDS.TOGGLE_PAUSE) {
    next.paused = !next.paused;
    next = feedback(next, next.paused ? "The habitat rhythm is paused." : "The habitat rhythm resumes.", "PAUSE_CHANGED");
  } else if (command.type === RAISING_HOME_COMMANDS.MOVE_CARETAKER) {
    const moved = movePosition(next.caretakerPosition, command.direction, next.field);
    const blocked = moved === next.caretakerPosition;
    next.caretakerPosition = { ...moved };
    next = feedback(next, blocked ? "A habitat boundary blocks that step." : "You move one tile through the Raising Home.", blocked ? "MOVEMENT_BLOCKED" : "CARETAKER_MOVED");
  } else if (command.type === RAISING_HOME_COMMANDS.SELECT_RESIDENT) {
    const target = next.residents.find((resident) => resident.residentId === command.residentId);
    if (!target) throw new TypeError(`Unknown raising-home resident: ${command.residentId}`);
    next.selectedResidentId = target.residentId;
    next = feedback(next, `${target.name} is now in focus.`, "RESIDENT_SELECTED");
  } else if (command.type === RAISING_HOME_COMMANDS.ADVANCE) {
    if (next.paused) return state;
    next.tick += 1;
    next.clockMinutes = (next.clockMinutes + Math.max(1, Math.min(30, Number(command.minutes) || 5))) % 1440;
    next.residents = next.residents.map((resident, index) => updateResident(next, resident, index));
    next = feedback(next, "The habitat takes another quiet breath.", "HABITAT_ADVANCED");
  } else {
    const resident = selectedResident(next);
    if (!resident) throw new Error("Selected raising-home resident is missing");
    const index = next.residents.findIndex((entry) => entry.residentId === resident.residentId);
    const distance = manhattan(next.caretakerPosition, resident.position);
    let replacement = { ...resident };
    let message = "";
    let type = "";
    if (command.type === RAISING_HOME_COMMANDS.INVITE) {
      const willing = resident.ease >= 35 && resident.energy >= 20;
      replacement.intent = willing ? "approaching" : "resting";
      replacement.lastResponse = willing ? "accepted" : "not-now";
      if (willing && distance > 1) {
        const dx = next.caretakerPosition.x - resident.position.x;
        const dy = next.caretakerPosition.y - resident.position.y;
        const direction = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
        replacement.position = movePosition(resident.position, direction, next.field);
        replacement.facing = direction;
      }
      message = willing ? `${resident.name} chooses to come a little closer.` : `${resident.name} asks for more space right now.`;
      type = willing ? "INVITATION_ACCEPTED" : "INVITATION_REFUSED";
    } else if (command.type === RAISING_HOME_COMMANDS.CARE) {
      const closeEnough = distance <= 2;
      replacement.satiety = clamp(resident.satiety + (closeEnough ? 14 : 0));
      replacement.ease = clamp(resident.ease + (closeEnough ? 5 : 0));
      replacement.lastResponse = closeEnough ? "received-care" : "out-of-reach";
      message = closeEnough ? `${resident.name} accepts the care offering.` : `Move within two tiles before offering care to ${resident.name}.`;
      type = closeEnough ? "CARE_ACCEPTED" : "CARE_OUT_OF_RANGE";
    } else if (command.type === RAISING_HOME_COMMANDS.TRAIN) {
      const willing = resident.energy >= 35 && resident.ease >= 30;
      replacement.intent = willing ? "training" : "resting";
      replacement.energy = clamp(resident.energy - (willing ? 8 : 0));
      replacement.readiness = clamp(resident.readiness + (willing ? 7 : 0));
      replacement.lastResponse = willing ? "trained" : "declined-training";
      message = willing ? `${resident.name} practices a short resonance pattern.` : `${resident.name} declines training and keeps its own pace.`;
      type = willing ? "TRAINING_COMPLETED" : "TRAINING_REFUSED";
    } else if (command.type === RAISING_HOME_COMMANDS.REST) {
      replacement.intent = "resting";
      replacement.energy = clamp(resident.energy + 12);
      replacement.ease = clamp(resident.ease + 6);
      replacement.lastResponse = "rested";
      message = `${resident.name} settles into a protected rest rhythm.`;
      type = "REST_COMPLETED";
    } else {
      throw new TypeError(`Unknown raising-home command: ${command.type}`);
    }
    next.residents[index] = replacement;
    next = feedback(next, message, type);
  }

  next.revision = state.revision + 1;
  return deepFreeze(clonePlainData(next));
}

export function formatRaisingHomeClock(minutes) {
  const normalized = ((Math.trunc(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, "0")}:${String(normalized % 60).padStart(2, "0")}`;
}
