import {
  clonePlainData,
  deepFreeze,
  stableDigest
} from "../contracts/championshipContracts.js";
import {
  CHAMPIONSHIP_MODE_IDS,
  championshipModeRegistry
} from "../modes/championshipModeRegistry.js";
import {
  assertChampionshipSavePort,
  createNoopChampionshipSavePort
} from "./ChampionshipSavePort.js";

export const CHAMPIONSHIP_MODE_COMMANDS = deepFreeze({
  ENTER: "ENTER_MODE",
  SUSPEND: "SUSPEND_MODE",
  RESUME: "RESUME_MODE",
  EXIT: "EXIT_MODE",
  DISPOSE: "DISPOSE_ROUTER"
});

export const CHAMPIONSHIP_MODE_EVENTS = deepFreeze({
  ENTERED: "MODE_ENTERED",
  SUSPENDED: "MODE_SUSPENDED",
  RESUMED: "MODE_RESUMED",
  EXITED: "MODE_EXITED",
  ROUTER_DISPOSED: "MODE_ROUTER_DISPOSED"
});

const EVENT_BY_COMMAND = deepFreeze({
  [CHAMPIONSHIP_MODE_COMMANDS.ENTER]: CHAMPIONSHIP_MODE_EVENTS.ENTERED,
  [CHAMPIONSHIP_MODE_COMMANDS.SUSPEND]: CHAMPIONSHIP_MODE_EVENTS.SUSPENDED,
  [CHAMPIONSHIP_MODE_COMMANDS.RESUME]: CHAMPIONSHIP_MODE_EVENTS.RESUMED,
  [CHAMPIONSHIP_MODE_COMMANDS.EXIT]: CHAMPIONSHIP_MODE_EVENTS.EXITED,
  [CHAMPIONSHIP_MODE_COMMANDS.DISPOSE]: CHAMPIONSHIP_MODE_EVENTS.ROUTER_DISPOSED
});

const COMMAND_TYPES = new Set(Object.values(CHAMPIONSHIP_MODE_COMMANDS));
const MODE_METHODS = ["enter", "suspend", "resume", "exit", "dispose", "getSnapshot"];
const MODE_EVENT_LOG_LIMIT = 128;
const MODE_COMMAND_ID_LIMIT = 256;
const MODE_ID_PATTERN = /^championship:mode:[a-z0-9-]+$/;

function readOwnDataProperty(value, key, boundaryName) {
  if (!value || (typeof value !== "object" && typeof value !== "function")) {
    throw new TypeError(`${boundaryName} must be an object`);
  }
  let descriptor;
  try {
    descriptor = Object.getOwnPropertyDescriptor(value, key);
  } catch {
    throw new TypeError(`${boundaryName}.${String(key)} could not be inspected safely`);
  }
  if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor)) {
    throw new TypeError(`${boundaryName}.${String(key)} must be an own data property`);
  }
  return descriptor.value;
}

function captureRegistry(registry) {
  if (!registry || typeof registry !== "object" || Array.isArray(registry)) {
    throw new TypeError("Championship mode registry is invalid");
  }
  const list = readOwnDataProperty(registry, "list", "Championship mode registry");
  const get = readOwnDataProperty(registry, "get", "Championship mode registry");
  const load = readOwnDataProperty(registry, "load", "Championship mode registry");
  if (typeof list !== "function" || typeof get !== "function" || typeof load !== "function") {
    throw new TypeError("Championship mode registry is invalid");
  }

  const listed = Reflect.apply(list, registry, []);
  if (!Array.isArray(listed)) throw new TypeError("Championship mode registry list must be an array");
  const length = readOwnDataProperty(listed, "length", "Championship mode registry list");
  if (!Number.isSafeInteger(length) || length < 1) {
    throw new TypeError("Championship mode registry requires at least one definition");
  }

  const entries = [];
  const registeredModeIds = [];
  const seenModeIds = new Set();
  for (let index = 0; index < length; index += 1) {
    const entry = readOwnDataProperty(listed, String(index), "Championship mode registry list");
    const modeId = readOwnDataProperty(entry, "modeId", `Championship mode definition ${index}`);
    if (typeof modeId !== "string" || !MODE_ID_PATTERN.test(modeId)) {
      throw new TypeError(`Championship mode definition ${index} has an invalid mode ID`);
    }
    if (seenModeIds.has(modeId)) throw new TypeError("Championship mode IDs must be unique");
    seenModeIds.add(modeId);
    entries.push(entry);
    registeredModeIds.push(modeId);
  }

  const capturedEntries = Object.freeze(entries);
  return Object.freeze({
    registeredModeIds: Object.freeze(registeredModeIds),
    list: () => capturedEntries,
    get: (modeId) => Reflect.apply(get, registry, [modeId]),
    load: (modeId) => Reflect.apply(load, registry, [modeId])
  });
}

function assertRouterOwnedModeIsRoutable(modeId) {
  if (modeId === CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL) {
    throw new Error(`Championship mode is not activatable: ${modeId} (network gate required)`);
  }
  if (modeId === CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL) {
    throw new Error(`Championship mode is not activatable: ${modeId} (non-routable reserved family)`);
  }
}

function createInitialSnapshot(registry) {
  return deepFreeze({
    revision: 0,
    sequence: 0,
    lifecycle: "IDLE",
    currentModeId: null,
    loadedModeIds: [],
    registeredModeIds: [...registry.registeredModeIds],
    eventLog: [],
    committable: false,
    persistenceAttempted: false
  });
}

function rejection(snapshot, code, message) {
  return deepFreeze({
    accepted: false,
    code,
    message,
    events: [],
    snapshot,
    committable: false,
    persistenceAttempted: false
  });
}

function assertCommand(command) {
  if (!command || typeof command !== "object" || Array.isArray(command)) throw new TypeError("Mode command must be an object");
  if (typeof command.commandId !== "string" || !/^[a-z0-9][a-z0-9:_-]{0,95}$/i.test(command.commandId)) {
    throw new TypeError("Mode command ID is invalid");
  }
  if (!Number.isInteger(command.expectedRevision) || command.expectedRevision < 0) {
    throw new TypeError("Mode command expectedRevision must be a non-negative integer");
  }
  if (!COMMAND_TYPES.has(command.type)) throw new TypeError("Mode command type is invalid");
  if (command.type === CHAMPIONSHIP_MODE_COMMANDS.ENTER && typeof command.modeId !== "string") {
    throw new TypeError("Enter command requires a mode ID");
  }
}

function assertModeShell(shell, expectedModeId) {
  if (!shell || typeof shell !== "object" || shell.modeId !== expectedModeId) {
    throw new TypeError(`Lazy loader returned an invalid shell for ${expectedModeId}`);
  }
  for (const method of MODE_METHODS) {
    if (typeof shell[method] !== "function") throw new TypeError(`Mode shell ${expectedModeId} is missing ${method}()`);
  }
}

function contextFor(command, sequence) {
  return deepFreeze({
    commandId: command.commandId,
    transitionSequence: sequence,
    payload: clonePlainData(command.payload ?? {})
  });
}

export class ChampionshipModeRouter {
  #registry;
  #savePort;
  #snapshot;
  #loadedModes;
  #acceptedCommandIds;
  #transitionInFlight;

  constructor({ registry = championshipModeRegistry, savePort = createNoopChampionshipSavePort() } = {}) {
    const capturedRegistry = captureRegistry(registry);
    assertChampionshipSavePort(savePort);
    this.#registry = capturedRegistry;
    this.#savePort = savePort;
    this.#snapshot = createInitialSnapshot(capturedRegistry);
    this.#loadedModes = new Map();
    this.#acceptedCommandIds = new Set();
    this.#transitionInFlight = false;
    Object.freeze(this);
  }

  getSnapshot() {
    return this.#snapshot;
  }

  inspectSaveBoundary() {
    return this.#savePort.inspect();
  }

  listModes() {
    return this.#registry.list();
  }

  enter(command) {
    return this.#dispatchLifecycle(command, CHAMPIONSHIP_MODE_COMMANDS.ENTER);
  }

  suspend(command) {
    return this.#dispatchLifecycle(command, CHAMPIONSHIP_MODE_COMMANDS.SUSPEND);
  }

  resume(command) {
    return this.#dispatchLifecycle(command, CHAMPIONSHIP_MODE_COMMANDS.RESUME);
  }

  exit(command) {
    return this.#dispatchLifecycle(command, CHAMPIONSHIP_MODE_COMMANDS.EXIT);
  }

  dispose(command) {
    return this.#dispatchLifecycle(command, CHAMPIONSHIP_MODE_COMMANDS.DISPOSE);
  }

  #dispatchLifecycle(input, type) {
    try {
      return this.dispatch({ ...clonePlainData(input), type });
    } catch (error) {
      return Promise.resolve(rejection(
        this.#snapshot,
        "CHAMPIONSHIP_MODE_INVALID_COMMAND",
        error instanceof Error ? error.message : String(error)
      ));
    }
  }

  async dispatch(input) {
    if (this.#snapshot.lifecycle === "DISPOSED") {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_ROUTER_DISPOSED", "Mode router is disposed");
    }
    if (this.#transitionInFlight) {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_TRANSITION_BUSY", "Another mode transition is in flight");
    }

    let command;
    try {
      command = clonePlainData(input);
      assertCommand(command);
    } catch (error) {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_INVALID_COMMAND", error instanceof Error ? error.message : String(error));
    }
    if (this.#acceptedCommandIds.has(command.commandId)) {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_DUPLICATE_COMMAND", "Duplicate mode command ID");
    }
    if (command.expectedRevision !== this.#snapshot.revision) {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_STALE_REVISION", "Stale mode router revision");
    }
    if (
      this.#acceptedCommandIds.size >= MODE_COMMAND_ID_LIMIT
      && command.type !== CHAMPIONSHIP_MODE_COMMANDS.DISPOSE
    ) {
      return rejection(this.#snapshot, "CHAMPIONSHIP_MODE_COMMAND_BUDGET_EXHAUSTED", "Mode router session command budget is exhausted");
    }

    this.#transitionInFlight = true;
    try {
      const transition = await this.#applyCommand(command);
      const sequence = this.#snapshot.sequence + 1;
      const event = deepFreeze({
        sequence,
        type: EVENT_BY_COMMAND[command.type],
        modeId: transition.eventModeId,
        lifecycle: transition.lifecycle,
        parityScope: "VERIFIED_FAMILY_PRESENCE_ONLY"
      });
      const nextSnapshot = deepFreeze({
        ...this.#snapshot,
        revision: this.#snapshot.revision + 1,
        sequence,
        lifecycle: transition.lifecycle,
        currentModeId: transition.currentModeId,
        loadedModeIds: [...this.#loadedModes.keys()],
        eventLog: [...this.#snapshot.eventLog, event].slice(-MODE_EVENT_LOG_LIMIT)
      });
      this.#snapshot = nextSnapshot;
      if (command.type === CHAMPIONSHIP_MODE_COMMANDS.DISPOSE) this.#acceptedCommandIds.clear();
      this.#acceptedCommandIds.add(command.commandId);
      return deepFreeze({
        accepted: true,
        code: "CHAMPIONSHIP_MODE_OK",
        events: [event],
        snapshot: nextSnapshot,
        eventDigest: stableDigest(nextSnapshot.eventLog),
        committable: false,
        persistenceAttempted: false
      });
    } catch (error) {
      return rejection(
        this.#snapshot,
        "CHAMPIONSHIP_MODE_TRANSITION_REJECTED",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.#transitionInFlight = false;
    }
  }

  async #applyCommand(command) {
    const currentModeId = this.#snapshot.currentModeId;
    const currentMode = currentModeId ? this.#loadedModes.get(currentModeId) : null;
    const nextSequence = this.#snapshot.sequence + 1;
    const context = contextFor(command, nextSequence);

    switch (command.type) {
      case CHAMPIONSHIP_MODE_COMMANDS.ENTER: {
        if (this.#snapshot.lifecycle !== "IDLE") throw new Error("A mode can only enter while the router is idle");
        assertRouterOwnedModeIsRoutable(command.modeId);
        const definition = this.#registry.get(command.modeId);
        if (!definition) throw new Error(`Unknown Championship mode: ${command.modeId}`);
        let mode = this.#loadedModes.get(command.modeId);
        let newlyLoaded = false;
        if (!mode) {
          mode = await this.#registry.load(command.modeId);
          assertModeShell(mode, command.modeId);
          newlyLoaded = true;
        }
        try {
          await mode.enter(context);
        } catch (error) {
          if (newlyLoaded) {
            try {
              await mode.dispose(context);
            } catch {
              // The router snapshot remains unchanged; the failed candidate is discarded.
            }
          }
          throw error;
        }
        if (newlyLoaded) this.#loadedModes.set(command.modeId, mode);
        return { lifecycle: "ACTIVE", currentModeId: command.modeId, eventModeId: command.modeId };
      }
      case CHAMPIONSHIP_MODE_COMMANDS.SUSPEND:
        if (this.#snapshot.lifecycle !== "ACTIVE" || !currentMode) throw new Error("No active mode can be suspended");
        await currentMode.suspend(context);
        return { lifecycle: "SUSPENDED", currentModeId, eventModeId: currentModeId };
      case CHAMPIONSHIP_MODE_COMMANDS.RESUME:
        if (this.#snapshot.lifecycle !== "SUSPENDED" || !currentMode) throw new Error("No suspended mode can be resumed");
        await currentMode.resume(context);
        return { lifecycle: "ACTIVE", currentModeId, eventModeId: currentModeId };
      case CHAMPIONSHIP_MODE_COMMANDS.EXIT:
        if (!["ACTIVE", "SUSPENDED"].includes(this.#snapshot.lifecycle) || !currentMode) {
          throw new Error("No entered mode can exit");
        }
        await currentMode.exit(context);
        return { lifecycle: "IDLE", currentModeId: null, eventModeId: currentModeId };
      case CHAMPIONSHIP_MODE_COMMANDS.DISPOSE: {
        for (const mode of this.#loadedModes.values()) {
          if (mode.getSnapshot().lifecycle !== "DISPOSED") await mode.dispose(context);
        }
        this.#loadedModes.clear();
        return { lifecycle: "DISPOSED", currentModeId: null, eventModeId: currentModeId };
      }
      default:
        throw new Error(`Unhandled mode command: ${command.type}`);
    }
  }
}

export function createChampionshipModeRouter(options) {
  return new ChampionshipModeRouter(options);
}
