import {
  clonePlainData,
  deepFreeze,
  stableDigest
} from "../contracts/championshipContracts.js";
import {
  CHAMPIONSHIP_MODE_ACTIVATION_POLICIES,
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
const MODE_REGISTRY_DEFINITION_LIMIT = 256;
const MODE_ID_PATTERN = /^championship:mode:[a-z0-9-]+$/;
const REGISTRY_REQUIRED_KEYS = Object.freeze(["list", "get", "load"]);
const REGISTRY_ALLOWED_KEYS = new Set(["size", "has", ...REGISTRY_REQUIRED_KEYS]);
const MODE_DEFINITION_KEYS = Object.freeze([
  "modeId",
  "activationPolicy",
  "authority",
  "parityScope",
  "simulationAuthority",
  "rendererAuthority",
  "persistenceAuthority",
  "load"
]);
const MODE_ACTIVATION_POLICIES = new Set(Object.values(CHAMPIONSHIP_MODE_ACTIVATION_POLICIES));

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

function readSafePrototype(value, boundaryName) {
  try {
    return Object.getPrototypeOf(value);
  } catch {
    throw new TypeError(`${boundaryName} prototype could not be inspected safely`);
  }
}

function readSafeOwnKeys(value, boundaryName) {
  try {
    return Reflect.ownKeys(value);
  } catch {
    throw new TypeError(`${boundaryName} keys could not be inspected safely`);
  }
}

function assertPlainBoundaryObject(value, boundaryName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${boundaryName} must be a plain object`);
  }
  const prototype = readSafePrototype(value, boundaryName);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${boundaryName} cannot inherit registry authority`);
  }
}

function captureExactDataRecord(value, boundaryName, requiredKeys, allowedKeys = new Set(requiredKeys)) {
  assertPlainBoundaryObject(value, boundaryName);
  const ownKeys = readSafeOwnKeys(value, boundaryName);
  const captured = Object.create(null);
  for (const key of ownKeys) {
    if (typeof key !== "string") throw new TypeError(`${boundaryName} cannot contain symbol keys`);
    if (!allowedKeys.has(key)) throw new TypeError(`${boundaryName} contains an unexpected key: ${key}`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor)) {
      throw new TypeError(`${boundaryName}.${key} must be an own data property`);
    }
    if (!descriptor.enumerable) throw new TypeError(`${boundaryName}.${key} cannot be hidden`);
    captured[key] = descriptor.value;
  }
  for (const key of requiredKeys) {
    if (!Object.prototype.hasOwnProperty.call(captured, key)) {
      throw new TypeError(`${boundaryName}.${key} must be an own data property`);
    }
  }
  return captured;
}

function captureDefinition(entry, index) {
  const boundaryName = `Championship mode definition ${index}`;
  const captured = captureExactDataRecord(entry, boundaryName, MODE_DEFINITION_KEYS);
  if (typeof captured.modeId !== "string" || !MODE_ID_PATTERN.test(captured.modeId)) {
    throw new TypeError(`${boundaryName} has an invalid mode ID`);
  }
  if (!MODE_ACTIVATION_POLICIES.has(captured.activationPolicy)) {
    throw new TypeError(`${boundaryName} has an invalid activation policy`);
  }
  if (captured.authority !== "PROJECT_NATIVE_SHELL") {
    throw new TypeError(`${boundaryName} has invalid authority`);
  }
  if (captured.parityScope !== "VERIFIED_FAMILY_PRESENCE_ONLY") {
    throw new TypeError(`${boundaryName} has invalid parity scope`);
  }
  for (const key of ["simulationAuthority", "rendererAuthority", "persistenceAuthority"]) {
    if (captured[key] !== false) throw new TypeError(`${boundaryName}.${key} must be false`);
  }
  if (typeof captured.load !== "function") throw new TypeError(`${boundaryName}.load must be a function`);

  const activationPolicy = captured.modeId === CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL
    ? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NETWORK_GATE_REQUIRED
    : captured.modeId === CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL
      ? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NON_ROUTABLE_STUB
      : captured.activationPolicy;
  return deepFreeze({
    modeId: captured.modeId,
    activationPolicy,
    authority: captured.authority,
    parityScope: captured.parityScope,
    simulationAuthority: captured.simulationAuthority,
    rendererAuthority: captured.rendererAuthority,
    persistenceAuthority: captured.persistenceAuthority
  });
}

function captureDenseDefinitionList(listed) {
  if (!Array.isArray(listed)) throw new TypeError("Championship mode registry list must be an array");
  if (readSafePrototype(listed, "Championship mode registry list") !== Array.prototype) {
    throw new TypeError("Championship mode registry list must use the standard array prototype");
  }
  const length = readOwnDataProperty(listed, "length", "Championship mode registry list");
  if (!Number.isSafeInteger(length) || length < 1) {
    throw new TypeError("Championship mode registry requires at least one definition");
  }
  if (length > MODE_REGISTRY_DEFINITION_LIMIT) {
    throw new TypeError(`Championship mode registry cannot exceed ${MODE_REGISTRY_DEFINITION_LIMIT} definitions`);
  }
  const expectedKeys = new Set(["length", ...Array.from({ length }, (_, index) => String(index))]);
  const ownKeys = readSafeOwnKeys(listed, "Championship mode registry list");
  if (ownKeys.some((key) => typeof key !== "string" || !expectedKeys.has(key)) || ownKeys.length !== expectedKeys.size) {
    throw new TypeError("Championship mode registry list must be dense and cannot contain extra, hidden, or symbol keys");
  }

  const entries = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(listed, String(index));
    if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor) || !descriptor.enumerable) {
      throw new TypeError(`Championship mode registry list.${index} must be an enumerable data property`);
    }
    const captured = captureDefinition(descriptor.value, index);
    entries.push(captured);
  }
  return entries;
}

function captureRegistry(registry) {
  const capturedRegistry = captureExactDataRecord(
    registry,
    "Championship mode registry",
    REGISTRY_REQUIRED_KEYS,
    REGISTRY_ALLOWED_KEYS
  );
  const { list, get, load } = capturedRegistry;
  if (typeof list !== "function" || typeof get !== "function" || typeof load !== "function") {
    throw new TypeError("Championship mode registry is invalid");
  }

  let listed;
  try {
    listed = Reflect.apply(list, registry, []);
  } catch {
    throw new TypeError("Championship mode registry list could not be evaluated safely");
  }
  const entries = captureDenseDefinitionList(listed);
  const seenModeIds = new Set();
  for (const entry of entries) {
    if (seenModeIds.has(entry.modeId)) throw new TypeError("Championship mode IDs must be unique");
    seenModeIds.add(entry.modeId);
  }

  const capturedEntries = Object.freeze(entries);
  const capturedById = new Map(entries.map((entry) => [entry.modeId, entry]));
  return Object.freeze({
    registeredModeIds: Object.freeze(entries.map((entry) => entry.modeId)),
    list: () => capturedEntries,
    lookup: (modeId) => capturedById.get(modeId) ?? null,
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
        const capturedDefinition = this.#registry.lookup(command.modeId);
        if (!capturedDefinition) throw new Error(`Unknown Championship mode: ${command.modeId}`);
        if (capturedDefinition.activationPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED) {
          throw new Error(`Championship mode is not activatable: ${command.modeId} (${capturedDefinition.activationPolicy})`);
        }
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
