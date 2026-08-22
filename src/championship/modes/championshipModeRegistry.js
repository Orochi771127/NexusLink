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

function definition(modeId) {
  return Object.freeze({
    modeId,
    activationPolicy: defaultActivationPolicy(modeId),
    authority: "PROJECT_NATIVE_SHELL",
    parityScope: "VERIFIED_FAMILY_PRESENCE_ONLY",
    simulationAuthority: false,
    rendererAuthority: false,
    persistenceAuthority: false,
    load: createLazyShellLoader(modeId)
  });
}

const DEFAULT_DEFINITIONS = Object.values(CHAMPIONSHIP_MODE_IDS).map(definition);

function assertDefinition(entry) {
  if (!entry || typeof entry !== "object") throw new TypeError("Championship mode definition must be an object");
  if (typeof entry.modeId !== "string" || !/^championship:mode:[a-z0-9-]+$/.test(entry.modeId)) {
    throw new TypeError("Championship mode definition has an invalid mode ID");
  }
  if (typeof entry.load !== "function") throw new TypeError(`Championship mode ${entry.modeId} requires a lazy loader`);
  if (!Object.values(CHAMPIONSHIP_MODE_ACTIVATION_POLICIES).includes(
    entry.activationPolicy ?? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
  )) throw new TypeError(`Championship mode ${entry.modeId} has an invalid activation policy`);
}

export function createChampionshipModeRegistry(definitions = DEFAULT_DEFINITIONS) {
  if (!Array.isArray(definitions) || definitions.length === 0) {
    throw new TypeError("Championship mode registry requires at least one definition");
  }
  const entries = definitions.map((entry) => {
    assertDefinition(entry);
    const lockedPolicy = defaultActivationPolicy(entry.modeId);
    const requestedPolicy = entry.activationPolicy ?? lockedPolicy;
    if (
      lockedPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
      && requestedPolicy !== lockedPolicy
    ) throw new Error(`Championship mode activation policy is locked: ${entry.modeId}`);
    const activationPolicy = lockedPolicy === CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
      ? requestedPolicy
      : lockedPolicy;
    const sourceLoader = entry.load;
    return Object.freeze({
      ...entry,
      activationPolicy,
      async load() {
        if (activationPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED) {
          throw new Error(`Championship mode is not activatable: ${entry.modeId} (${activationPolicy})`);
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
