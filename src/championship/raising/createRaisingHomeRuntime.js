import { clonePlainData, deepFreeze } from "../contracts/championshipContracts.js";
import { createRaisingHomeInitialState, reduceRaisingHome } from "./raisingHomeDefinition.js";

const ACCEPTED_COMMAND_ID_LIMIT = 256;
const OBSERVER_FAILURE_LIMIT = 256;
const BASE_COMMAND_KEYS = Object.freeze(["commandId", "expectedRevision", "type"]);
const COMMAND_KEYS = Object.freeze({
  RAISING_HOME_MOVE_CARETAKER: Object.freeze([...BASE_COMMAND_KEYS, "direction"]),
  RAISING_HOME_ADVANCE: Object.freeze([...BASE_COMMAND_KEYS, "minutes"]),
  RAISING_HOME_SELECT_RESIDENT: Object.freeze([...BASE_COMMAND_KEYS, "residentId"]),
  RAISING_HOME_INVITE: BASE_COMMAND_KEYS,
  RAISING_HOME_CARE: BASE_COMMAND_KEYS,
  RAISING_HOME_TRAIN: BASE_COMMAND_KEYS,
  RAISING_HOME_REST: BASE_COMMAND_KEYS,
  RAISING_HOME_TOGGLE_PAUSE: BASE_COMMAND_KEYS
});

function rejection(snapshot, code, message = null) {
  return deepFreeze({ accepted: false, code, message, snapshot });
}

function validateEnvelope(command) {
  if (!command || typeof command !== "object" || Array.isArray(command)) throw new TypeError("Raising Home command must be an object");
  if (typeof command.commandId !== "string" || !/^[a-z0-9][a-z0-9:_-]{0,95}$/i.test(command.commandId)) {
    throw new TypeError("Raising Home commandId is invalid");
  }
  if (!Number.isSafeInteger(command.expectedRevision) || command.expectedRevision < 0) {
    throw new TypeError("Raising Home expectedRevision must be a non-negative safe integer");
  }
  const expectedKeys = COMMAND_KEYS[command.type];
  if (!expectedKeys) throw new TypeError("Raising Home command type is invalid");
  const actualKeys = Object.keys(command).sort();
  const allowedKeys = [...expectedKeys].sort();
  if (actualKeys.length !== allowedKeys.length || actualKeys.some((key, index) => key !== allowedKeys[index])) {
    throw new TypeError("Raising Home command contains missing or unsupported fields");
  }
}

export function createRaisingHomeRuntime(options = {}) {
  let snapshot = createRaisingHomeInitialState(options);
  let disposed = false;
  let observerFailureCount = 0;
  let lastObserverFailureRevision = null;
  const listeners = new Set();
  const acceptedCommandIds = new Set();

  return Object.freeze({
    getSnapshot() {
      return snapshot;
    },
    getDiagnostics() {
      return deepFreeze({ disposed, observerFailureCount, lastObserverFailureRevision });
    },
    dispatch(command) {
      if (disposed) return deepFreeze({ accepted: false, code: "RAISING_HOME_DISPOSED", snapshot: null });
      try {
        const envelope = clonePlainData(command);
        validateEnvelope(envelope);
        if (acceptedCommandIds.has(envelope.commandId)) {
          return rejection(snapshot, "RAISING_HOME_DUPLICATE_COMMAND", "Duplicate Raising Home commandId");
        }
        if (envelope.expectedRevision !== snapshot.revision) {
          return rejection(snapshot, "RAISING_HOME_STALE_REVISION", "Stale Raising Home revision");
        }
        if (acceptedCommandIds.size >= ACCEPTED_COMMAND_ID_LIMIT) {
          return rejection(snapshot, "RAISING_HOME_COMMAND_BUDGET_EXHAUSTED", "Raising Home session command budget is exhausted");
        }
        const { commandId, expectedRevision, ...domainCommand } = envelope;
        const next = reduceRaisingHome(snapshot, domainCommand);
        if (next === snapshot) return deepFreeze({ accepted: false, code: "RAISING_HOME_PAUSED", snapshot });
        snapshot = next;
        acceptedCommandIds.add(commandId);
        const publication = deepFreeze({ accepted: true, code: "RAISING_HOME_OK", snapshot, persistenceAttempted: false, playerStatePatch: null });
        for (const listener of [...listeners]) {
          try {
            listener(publication);
          } catch {
            // Observer failures cannot roll back an already accepted domain transition.
            observerFailureCount = Math.min(OBSERVER_FAILURE_LIMIT, observerFailureCount + 1);
            lastObserverFailureRevision = snapshot.revision;
          }
        }
        return publication;
      } catch (error) {
        return rejection(snapshot, "RAISING_HOME_REJECTED", error instanceof Error ? error.message : String(error));
      }
    },
    subscribe(listener) {
      if (disposed) throw new Error("Raising Home runtime is disposed");
      if (typeof listener !== "function") throw new TypeError("Raising Home listener must be a function");
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      listeners.clear();
      snapshot = null;
      acceptedCommandIds.clear();
    }
  });
}
