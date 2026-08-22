export const CHAMPIONSHIP_COMMANDS = Object.freeze({
  ACCEPT_PROFILE: "ACCEPT_PROFILE",
  SELECT_GATE: "SELECT_GATE",
  MOVE_HUNTER: "MOVE_HUNTER",
  BEGIN_CAPTURE: "BEGIN_CAPTURE",
  ATTEMPT_CAPTURE: "ATTEMPT_CAPTURE",
  CONTINUE_TO_COLLECTION: "CONTINUE_TO_COLLECTION",
  OPEN_SHOP: "OPEN_SHOP",
  PURCHASE_RESEARCH_ITEM: "PURCHASE_RESEARCH_ITEM",
  LEAVE_SHOP: "LEAVE_SHOP",
  ENTER_ARENA: "ENTER_ARENA",
  START_BATTLE: "START_BATTLE",
  RESOLVE_BATTLE_TURN: "RESOLVE_BATTLE_TURN",
  ACCEPT_BATTLE_RESULT: "ACCEPT_BATTLE_RESULT"
});

const COMMAND_KEYS = new Set(["commandId", "type", "expectedRevision", "payload"]);

function isPlainRecord(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

export function assertChampionshipCommand(command) {
  if (!isPlainRecord(command)) throw new TypeError("Command must be a plain object");
  for (const key of Object.keys(command)) if (!COMMAND_KEYS.has(key)) throw new TypeError(`Unsupported command field: ${key}`);
  if (typeof command.commandId !== "string" || !/^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$/.test(command.commandId)) {
    throw new TypeError("commandId must be a sanitized identifier between 3 and 96 characters");
  }
  if (!Object.values(CHAMPIONSHIP_COMMANDS).includes(command.type)) throw new TypeError(`Unknown Championship command: ${command.type}`);
  if (!Number.isInteger(command.expectedRevision) || command.expectedRevision < 0) throw new TypeError("expectedRevision must be a non-negative integer");
  if (command.payload !== undefined && !isPlainRecord(command.payload)) {
    throw new TypeError("Command payload must be a plain object");
  }
  return true;
}
