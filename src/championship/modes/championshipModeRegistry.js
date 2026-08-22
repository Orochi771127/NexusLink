import { deepFreeze } from "../contracts/championshipContracts.js";

export const CHAMPIONSHIP_MODE_IDS = deepFreeze({
  HUNT_CAPTURE: "championship:mode:hunt-capture",
  SEASONAL_CALENDAR: "championship:mode:seasonal-calendar",
  MATCH_INTERSTITIAL: "championship:mode:match-interstitial",
  STARTUP_SPLASH: "championship:mode:startup-splash",
  PROFILE_REPORT: "championship:mode:profile-report",
  HELP_CENTER: "championship:mode:help-center",
  BATTLE_NAVIGATION: "championship:mode:battle-navigation",
  LIST_BROWSER: "championship:mode:list-browser",
  BATTLE_RESULT: "championship:mode:battle-result",
  NETWORK_ARENA_SHELL: "championship:mode:network-arena-shell",
  MATCH_SELECT: "championship:mode:match-select",
  ENDING: "championship:mode:ending",
  GATE_LOADOUT: "championship:mode:gate-loadout",
  TITLE_ENTRY: "championship:mode:title-entry",
  TRAINING_SELECT: "championship:mode:training-select",
  HABITAT_EDITOR: "championship:mode:habitat-editor",
  CREATURE_DATABASE: "championship:mode:creature-database",
  SUPPLY_SHOP: "championship:mode:supply-shop",
  RAISING_HOME: "championship:mode:raising-home",
  ARENA_BATTLE: "championship:mode:arena-battle",
  RESERVED_SHELL: "championship:mode:reserved-shell",
  CINEMATIC_PLAYER: "championship:mode:cinematic-player"
});

export const CHAMPIONSHIP_MODE_ACTIVATION_POLICIES = deepFreeze({
  ENABLED: "ENABLED",
  NETWORK_GATE_REQUIRED: "DISABLED_REQUIRES_NETWORK_GATE",
  NON_ROUTABLE_STUB: "NON_ROUTABLE_VERIFIED_STUB"
});

const MODE_ID_PATTERN = /^championship:mode:[a-z0-9-]+$/;
const MODE_REGISTRY_DEFINITION_LIMIT = 256;
const DEFINITION_REQUIRED_KEYS = Object.freeze(["modeId", "load"]);
const DEFINITION_ALLOWED_KEYS = new Set([
  "modeId",
  "activationPolicy",
  "authority",
  "parityScope",
  "simulationAuthority",
  "rendererAuthority",
  "persistenceAuthority",
  "load"
]);
const ACTIVATION_POLICIES = new Set(Object.values(CHAMPIONSHIP_MODE_ACTIVATION_POLICIES));
const CANONICAL_AUTHORITY = "PROJECT_NATIVE_SHELL";
const CANONICAL_PARITY_SCOPE = "VERIFIED_FAMILY_PRESENCE_ONLY";

function createLazyShellLoader(modeId) {
  return async function loadProjectNativeModeShell() {
    const module = await import("./createChampionshipModeShell.js");
    return module.createChampionshipModeShell({ modeId });
  };
}

function defaultActivationPolicy(modeId) {
  if (modeId === CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL) {
    return CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NETWORK_GATE_REQUIRED;
  }
  if (modeId === CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL) {
    return CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NON_ROUTABLE_STUB;
  }
  return CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED;
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

function readSafeDescriptor(value, key, boundaryName) {
  try {
    return Object.getOwnPropertyDescriptor(value, key);
  } catch {
    throw new TypeError(`${boundaryName}.${String(key)} could not be inspected safely`);
  }
}

function captureDefinitionInput(entry, index) {
  const boundaryName = `Championship mode definition ${index}`;
  let isArray;
  try {
    isArray = Array.isArray(entry);
  } catch {
    throw new TypeError(`${boundaryName} could not be inspected safely`);
  }
  if (!entry || typeof entry !== "object" || isArray) {
    throw new TypeError(`${boundaryName} must be a plain object`);
  }
  const prototype = readSafePrototype(entry, boundaryName);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${boundaryName} cannot inherit registry authority`);
  }

  const captured = Object.create(null);
  for (const key of readSafeOwnKeys(entry, boundaryName)) {
    if (typeof key !== "string") throw new TypeError(`${boundaryName} cannot contain symbol keys`);
    if (!DEFINITION_ALLOWED_KEYS.has(key)) throw new TypeError(`${boundaryName} contains an unexpected key: ${key}`);
    const descriptor = readSafeDescriptor(entry, key, boundaryName);
    if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor)) {
      throw new TypeError(`${boundaryName}.${key} must be an own data property`);
    }
    if (!descriptor.enumerable) throw new TypeError(`${boundaryName}.${key} cannot be hidden`);
    captured[key] = descriptor.value;
  }
  for (const key of DEFINITION_REQUIRED_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(captured, key)) {
      throw new TypeError(`${boundaryName}.${key} must be an own data property`);
    }
  }

  const { modeId, load } = captured;
  if (typeof modeId !== "string" || !MODE_ID_PATTERN.test(modeId)) {
    throw new TypeError(`${boundaryName} has an invalid mode ID`);
  }
  if (typeof load !== "function") throw new TypeError(`Championship mode ${modeId} requires a lazy loader`);

  const lockedPolicy = defaultActivationPolicy(modeId);
  const requestedPolicy = Object.prototype.hasOwnProperty.call(captured, "activationPolicy")
    ? captured.activationPolicy
    : lockedPolicy;
  if (!ACTIVATION_POLICIES.has(requestedPolicy)) {
    throw new TypeError(`Championship mode ${modeId} has an invalid activation policy`);
  }
  if (
    lockedPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
    && requestedPolicy !== lockedPolicy
  ) throw new Error(`Championship mode activation policy is locked: ${modeId}`);
  const activationPolicy = lockedPolicy === CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
    ? requestedPolicy
    : lockedPolicy;

  if (
    Object.prototype.hasOwnProperty.call(captured, "authority")
    && captured.authority !== CANONICAL_AUTHORITY
  ) throw new TypeError(`Championship mode ${modeId} has invalid authority`);
  if (
    Object.prototype.hasOwnProperty.call(captured, "parityScope")
    && captured.parityScope !== CANONICAL_PARITY_SCOPE
  ) throw new TypeError(`Championship mode ${modeId} has invalid parity scope`);
  for (const key of ["simulationAuthority", "rendererAuthority", "persistenceAuthority"]) {
    if (Object.prototype.hasOwnProperty.call(captured, key) && captured[key] !== false) {
      throw new TypeError(`Championship mode ${modeId}.${key} must be false`);
    }
  }

  return {
    modeId,
    activationPolicy,
    authority: CANONICAL_AUTHORITY,
    parityScope: CANONICAL_PARITY_SCOPE,
    simulationAuthority: false,
    rendererAuthority: false,
    persistenceAuthority: false,
    sourceLoader: load
  };
}

function captureDefinitionInputs(definitions) {
  let isArray;
  try {
    isArray = Array.isArray(definitions);
  } catch {
    throw new TypeError("Championship mode registry definitions could not be inspected safely");
  }
  if (!isArray) throw new TypeError("Championship mode registry requires a definition array");
  if (readSafePrototype(definitions, "Championship mode registry definitions") !== Array.prototype) {
    throw new TypeError("Championship mode registry definitions must use the standard array prototype");
  }
  const lengthDescriptor = readSafeDescriptor(definitions, "length", "Championship mode registry definitions");
  const length = lengthDescriptor?.value;
  if (!Number.isSafeInteger(length) || length < 1) {
    throw new TypeError("Championship mode registry requires at least one definition");
  }
  if (length > MODE_REGISTRY_DEFINITION_LIMIT) {
    throw new TypeError(`Championship mode registry cannot exceed ${MODE_REGISTRY_DEFINITION_LIMIT} definitions`);
  }
  const expectedKeys = new Set(["length", ...Array.from({ length }, (_, index) => String(index))]);
  const ownKeys = readSafeOwnKeys(definitions, "Championship mode registry definitions");
  if (ownKeys.some((key) => typeof key !== "string" || !expectedKeys.has(key)) || ownKeys.length !== expectedKeys.size) {
    throw new TypeError("Championship mode registry definitions must be dense and cannot contain extra, hidden, or symbol keys");
  }

  const captured = [];
  for (let index = 0; index < length; index += 1) {
    const descriptor = readSafeDescriptor(definitions, String(index), "Championship mode registry definitions");
    if (!descriptor || descriptor.get || descriptor.set || !("value" in descriptor) || !descriptor.enumerable) {
      throw new TypeError(`Championship mode registry definitions.${index} must be an enumerable data property`);
    }
    captured.push(captureDefinitionInput(descriptor.value, index));
  }
  return captured;
}

function definition(modeId) {
  return Object.freeze({
    modeId,
    activationPolicy: defaultActivationPolicy(modeId),
    authority: CANONICAL_AUTHORITY,
    parityScope: CANONICAL_PARITY_SCOPE,
    simulationAuthority: false,
    rendererAuthority: false,
    persistenceAuthority: false,
    load: createLazyShellLoader(modeId)
  });
}

const DEFAULT_DEFINITIONS = Object.values(CHAMPIONSHIP_MODE_IDS).map(definition);

export function createChampionshipModeRegistry(definitions = DEFAULT_DEFINITIONS) {
  const entries = captureDefinitionInputs(definitions).map((captured) => {
    const {
      modeId,
      activationPolicy,
      authority,
      parityScope,
      simulationAuthority,
      rendererAuthority,
      persistenceAuthority,
      sourceLoader
    } = captured;
    return Object.freeze({
      modeId,
      activationPolicy,
      authority,
      parityScope,
      simulationAuthority,
      rendererAuthority,
      persistenceAuthority,
      async load() {
        if (activationPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED) {
          throw new Error(`Championship mode is not activatable: ${modeId} (${activationPolicy})`);
        }
        return sourceLoader();
      }
    });
  });
  const byId = new Map(entries.map((entry) => [entry.modeId, entry]));
  if (byId.size !== entries.length) throw new Error("Championship mode IDs must be unique");

  return Object.freeze({
    size: entries.length,
    has(modeId) {
      return byId.has(modeId);
    },
    get(modeId) {
      return byId.get(modeId) ?? null;
    },
    list() {
      return Object.freeze([...entries]);
    },
    async load(modeId) {
      const entry = byId.get(modeId);
      if (!entry) throw new Error(`Unknown Championship mode: ${modeId}`);
      return entry.load();
    }
  });
}

export const championshipModeRegistry = createChampionshipModeRegistry();
