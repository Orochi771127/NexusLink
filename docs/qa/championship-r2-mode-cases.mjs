import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  CHAMPIONSHIP_MODE_COMMANDS,
  ChampionshipModeRouter,
  createChampionshipModeRouter
} from "../../src/championship/kernel/ChampionshipModeRouter.js";
import {
  CHAMPIONSHIP_SAVE_PORT_KIND,
  ChampionshipSavePort,
  assertChampionshipSavePort,
  createNoopChampionshipSavePort
} from "../../src/championship/kernel/ChampionshipSavePort.js";
import {
  CHAMPIONSHIP_MODE_ACTIVATION_POLICIES,
  CHAMPIONSHIP_MODE_IDS,
  championshipModeRegistry,
  createChampionshipModeRegistry
} from "../../src/championship/modes/championshipModeRegistry.js";
import { createChampionshipModeShell } from "../../src/championship/modes/createChampionshipModeShell.js";
import { createChampionshipR2Session } from "../../src/championship/r2/createChampionshipR2Session.js";

const ROOT = new URL("../../", import.meta.url);

function command(router, commandId, values = {}) {
  return {
    commandId,
    expectedRevision: router.getSnapshot().revision,
    payload: {},
    ...values
  };
}

function canonicalModeDefinition(modeId, load, overrides = {}) {
  return {
    modeId,
    activationPolicy: CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED,
    authority: "PROJECT_NATIVE_SHELL",
    parityScope: "VERIFIED_FAMILY_PRESENCE_ONLY",
    simulationAuthority: false,
    rendererAuthority: false,
    persistenceAuthority: false,
    load,
    ...overrides
  };
}

function rawRegistryForEntry(entry, modeId, load = entry.load) {
  return {
    list() {
      return [entry];
    },
    get(requestedModeId) {
      return requestedModeId === modeId ? entry : null;
    },
    async load(requestedModeId) {
      if (requestedModeId !== modeId) throw new Error("unexpected mode ID");
      return load();
    }
  };
}

function createHostileReservedRegistry(modeId) {
  const calls = {
    list: 0,
    get: 0,
    load: 0,
    shellEnter: 0
  };
  const shell = {
    modeId,
    enter() {
      calls.shellEnter += 1;
      return { lifecycle: "ACTIVE" };
    },
    suspend() {},
    resume() {},
    exit() {},
    dispose() {},
    getSnapshot() {
      return { modeId, lifecycle: "CREATED", revision: 0 };
    }
  };
  const entry = canonicalModeDefinition(modeId, async () => shell);
  const registry = {
    list() {
      calls.list += 1;
      return [entry];
    },
    get(requestedModeId) {
      calls.get += 1;
      return requestedModeId === modeId ? entry : null;
    },
    async load(requestedModeId) {
      calls.load += 1;
      if (requestedModeId !== modeId) throw new Error("unexpected mode ID");
      return shell;
    }
  };
  return { calls, registry };
}

async function runLifecycle(prefix = "run") {
  const savePort = createNoopChampionshipSavePort();
  const router = createChampionshipModeRouter({ savePort });
  const modeId = CHAMPIONSHIP_MODE_IDS.RAISING_HOME;
  const publications = [];
  publications.push(await router.enter(command(router, `${prefix}:enter`, { modeId, payload: { fixture: "project-native" } })));
  publications.push(await router.suspend(command(router, `${prefix}:suspend`)));
  publications.push(await router.resume(command(router, `${prefix}:resume`)));
  publications.push(await router.exit(command(router, `${prefix}:exit`)));
  publications.push(await router.dispose(command(router, `${prefix}:dispose`)));
  return { router, savePort, publications };
}

test("registry exposes exactly 22 project-native family shells without raw family ordinals", () => {
  const ids = Object.values(CHAMPIONSHIP_MODE_IDS);
  assert.equal(ids.length, 22);
  assert.equal(new Set(ids).size, 22);
  assert.equal(championshipModeRegistry.size, 22);
  assert.deepEqual(championshipModeRegistry.list().map((entry) => entry.modeId), ids);
  for (const entry of championshipModeRegistry.list()) {
    assert.match(entry.modeId, /^championship:mode:[a-z0-9-]+$/);
    assert.equal(entry.authority, "PROJECT_NATIVE_SHELL");
    assert.equal(entry.parityScope, "VERIFIED_FAMILY_PRESENCE_ONLY");
    assert.equal(entry.simulationAuthority, false);
    assert.equal(entry.rendererAuthority, false);
    assert.equal(entry.persistenceAuthority, false);
    const expectedPolicy = entry.modeId === CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL
      ? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NETWORK_GATE_REQUIRED
      : entry.modeId === CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL
        ? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NON_ROUTABLE_STUB
        : CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED;
    assert.equal(entry.activationPolicy, expectedPolicy);
    assert.equal(typeof entry.load, "function");
    assert.doesNotMatch(entry.modeId, /overlay|ovl|rom/i);
  }
});

test("official factory canonicalizes minimal definitions for router compatibility and detaches caller mutation", async () => {
  let loadCount = 0;
  const modeId = "championship:mode:factory-minimal";
  const callerDefinition = {
    modeId,
    load: async () => {
      loadCount += 1;
      return createChampionshipModeShell({ modeId });
    }
  };
  const registry = createChampionshipModeRegistry([callerDefinition]);
  const factoryList = registry.list();
  const factoryEntry = factoryList[0];
  assert.equal(Object.isFrozen(factoryList), true);
  assert.equal(Object.isFrozen(factoryEntry), true);
  assert.notEqual(factoryEntry, callerDefinition);
  assert.deepEqual(Object.keys(factoryEntry), [
    "modeId",
    "activationPolicy",
    "authority",
    "parityScope",
    "simulationAuthority",
    "rendererAuthority",
    "persistenceAuthority",
    "load"
  ]);
  assert.equal(factoryEntry.modeId, modeId);
  assert.equal(factoryEntry.activationPolicy, CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED);
  assert.equal(factoryEntry.authority, "PROJECT_NATIVE_SHELL");
  assert.equal(factoryEntry.parityScope, "VERIFIED_FAMILY_PRESENCE_ONLY");
  assert.equal(factoryEntry.simulationAuthority, false);
  assert.equal(factoryEntry.rendererAuthority, false);
  assert.equal(factoryEntry.persistenceAuthority, false);
  assert.equal(typeof factoryEntry.load, "function");

  const router = createChampionshipModeRouter({ registry });
  callerDefinition.modeId = "championship:mode:caller-mutated";
  callerDefinition.load = async () => {
    throw new Error("mutated caller loader must not be retained");
  };
  callerDefinition.networkAuthority = true;
  assert.equal(registry.get(modeId), factoryEntry);
  assert.deepEqual(router.getSnapshot().registeredModeIds, [modeId]);
  assert.deepEqual(router.listModes(), [{
    modeId,
    activationPolicy: CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED,
    authority: "PROJECT_NATIVE_SHELL",
    parityScope: "VERIFIED_FAMILY_PRESENCE_ONLY",
    simulationAuthority: false,
    rendererAuthority: false,
    persistenceAuthority: false
  }]);
  const entered = await router.enter(command(router, "factory-minimal:enter", { modeId }));
  assert.equal(entered.accepted, true);
  assert.equal(loadCount, 1);
});

test("official factory rejects hostile definition shapes without executing metadata getters", () => {
  const modeId = "championship:mode:factory-hostile";
  const loader = async () => createChampionshipModeShell({ modeId });
  const getterReads = { activationPolicy: 0, authority: 0, parityScope: 0 };
  const accessorEntry = canonicalModeDefinition(modeId, loader);
  for (const key of Object.keys(getterReads)) {
    Object.defineProperty(accessorEntry, key, {
      enumerable: true,
      get() {
        getterReads[key] += 1;
        throw new Error(`factory must not execute ${key} getter`);
      }
    });
  }
  assert.throws(() => createChampionshipModeRegistry([accessorEntry]), /activationPolicy must be an own data property/);
  assert.deepEqual(getterReads, { activationPolicy: 0, authority: 0, parityScope: 0 });

  let inheritedReads = 0;
  const inheritedPrototype = {};
  Object.defineProperty(inheritedPrototype, "authority", {
    get() {
      inheritedReads += 1;
      return "PROJECT_NATIVE_SHELL";
    }
  });
  const inheritedEntry = Object.create(inheritedPrototype);
  Object.defineProperties(inheritedEntry, Object.getOwnPropertyDescriptors({ modeId, load: loader }));
  assert.throws(() => createChampionshipModeRegistry([inheritedEntry]), /cannot inherit registry authority/);
  assert.equal(inheritedReads, 0);

  const hiddenEntry = { modeId, load: loader };
  Object.defineProperty(hiddenEntry, "load", { value: loader, enumerable: false });
  assert.throws(() => createChampionshipModeRegistry([hiddenEntry]), /load cannot be hidden/);

  const symbolEntry = { modeId, load: loader, [Symbol("authority")]: true };
  assert.throws(() => createChampionshipModeRegistry([symbolEntry]), /cannot contain symbol keys/);

  assert.throws(
    () => createChampionshipModeRegistry([{ modeId, load: loader, networkAuthority: true }]),
    /unexpected key: networkAuthority/
  );

  const revocable = Proxy.revocable({ modeId, load: loader }, {});
  revocable.revoke();
  assert.throws(() => createChampionshipModeRegistry([revocable.proxy]));
});

test("factory and raw registry reject oversized definition arrays before distant index accessors", () => {
  let factoryDistantReads = 0;
  const oversizedFactoryDefinitions = new Array(1_000_000);
  Object.defineProperty(oversizedFactoryDefinitions, "999999", {
    enumerable: true,
    get() {
      factoryDistantReads += 1;
      throw new Error("factory distant index must not be read");
    }
  });
  assert.throws(
    () => createChampionshipModeRegistry(oversizedFactoryDefinitions),
    /cannot exceed 256 definitions/
  );
  assert.equal(factoryDistantReads, 0);

  let rawDistantReads = 0;
  const oversizedRawDefinitions = new Array(1_000_000);
  Object.defineProperty(oversizedRawDefinitions, "999999", {
    enumerable: true,
    get() {
      rawDistantReads += 1;
      throw new Error("raw registry distant index must not be read");
    }
  });
  const rawRegistry = {
    list() {
      return oversizedRawDefinitions;
    },
    get() {
      return null;
    },
    async load() {
      return null;
    }
  };
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistry }),
    /cannot exceed 256 definitions/
  );
  assert.equal(rawDistantReads, 0);
});

test("enabled lazy loaders resolve lifecycle shells while network and stub families cannot activate", async () => {
  for (const entry of championshipModeRegistry.list()) {
    if (entry.activationPolicy !== CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED) {
      await assert.rejects(entry.load(), /not activatable/);
      continue;
    }
    const shell = await entry.load();
    assert.equal(shell.modeId, entry.modeId);
    assert.deepEqual(shell.getSnapshot(), {
      modeId: entry.modeId,
      lifecycle: "CREATED",
      revision: 0,
      simulationAttached: false,
      rendererAttached: false
    });
    const disposed = shell.dispose({ commandId: "loader-contract", transitionSequence: 0, payload: {} });
    assert.equal(disposed.lifecycle, "DISPOSED");
  }
});

test("router cannot enter the network-gated or non-routable stub families", async () => {
  for (const modeId of [CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL, CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL]) {
    const router = createChampionshipModeRouter();
    const before = router.getSnapshot();
    const rejected = await router.enter(command(router, `blocked:${modeId}`, { modeId }));
    assert.equal(rejected.accepted, false);
    assert.equal(rejected.code, "CHAMPIONSHIP_MODE_TRANSITION_REJECTED");
    assert.match(rejected.message, /not activatable/);
    assert.equal(router.getSnapshot(), before);
    assert.deepEqual(router.getSnapshot().loadedModeIds, []);
  }
});

test("custom registries cannot configure the network or stub families back to enabled", () => {
  for (const modeId of [CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL, CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL]) {
    assert.throws(() => createChampionshipModeRegistry([{
      modeId,
      activationPolicy: CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED,
      load: async () => createChampionshipModeShell({ modeId })
    }]), /activation policy is locked/);
  }
});

test("router rejects enabled family 9 and 20 shells from hostile raw registries before lookup, load, or enter", async () => {
  for (const modeId of [CHAMPIONSHIP_MODE_IDS.NETWORK_ARENA_SHELL, CHAMPIONSHIP_MODE_IDS.RESERVED_SHELL]) {
    const { calls, registry } = createHostileReservedRegistry(modeId);
    const router = createChampionshipModeRouter({ registry });
    const before = router.getSnapshot();
    const rejected = await router.enter(command(router, `raw-reserved:${modeId}`, { modeId }));

    assert.equal(rejected.accepted, false);
    assert.equal(rejected.code, "CHAMPIONSHIP_MODE_TRANSITION_REJECTED");
    assert.match(rejected.message, /not activatable/);
    assert.equal(router.getSnapshot(), before);
    assert.equal(router.getSnapshot().revision, 0);
    assert.equal(router.getSnapshot().sequence, 0);
    assert.equal(router.getSnapshot().lifecycle, "IDLE");
    assert.equal(router.getSnapshot().currentModeId, null);
    assert.deepEqual(router.getSnapshot().loadedModeIds, []);
    assert.deepEqual(router.getSnapshot().eventLog, []);
    assert.deepEqual(calls, {
      list: 1,
      get: 0,
      load: 0,
      shellEnter: 0
    });
  }
});

test("captured registry authority rejects rogue unlisted modes before caller lookup, load, or shell enter", async () => {
  const listedModeId = "championship:mode:listed-authority";
  const rogueModeId = "championship:mode:rogue-unlisted";
  const calls = { get: 0, load: 0, shellEnter: 0 };
  const listedEntry = canonicalModeDefinition(listedModeId, async () => null);
  const rogueEntry = canonicalModeDefinition(rogueModeId, async () => null);
  const shell = {
    modeId: listedModeId,
    enter() {
      calls.shellEnter += 1;
    },
    suspend() {},
    resume() {},
    exit() {},
    dispose() {},
    getSnapshot() {
      return { modeId: listedModeId, lifecycle: "CREATED", revision: 0 };
    }
  };
  const registry = {
    list() {
      return [listedEntry];
    },
    get(modeId) {
      calls.get += 1;
      return modeId === listedModeId ? listedEntry : rogueEntry;
    },
    async load(modeId) {
      calls.load += 1;
      if (modeId !== listedModeId) throw new Error("rogue load must not run");
      return shell;
    }
  };
  const router = createChampionshipModeRouter({ registry });
  const before = router.getSnapshot();
  const rejected = await router.enter(command(router, "captured:unlisted", { modeId: rogueModeId }));
  assert.equal(rejected.accepted, false);
  assert.match(rejected.message, /Unknown Championship mode/);
  assert.equal(router.getSnapshot(), before);
  assert.deepEqual(calls, { get: 0, load: 0, shellEnter: 0 });

  const reused = await router.enter(command(router, "captured:unlisted", { modeId: listedModeId }));
  assert.equal(reused.accepted, true);
  assert.deepEqual(calls, { get: 0, load: 1, shellEnter: 1 });
});

test("captured disabled policies reject custom listed modes before live registry access", async () => {
  for (const activationPolicy of [
    CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NETWORK_GATE_REQUIRED,
    CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NON_ROUTABLE_STUB
  ]) {
    const suffix = activationPolicy === CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.NETWORK_GATE_REQUIRED
      ? "network-disabled"
      : "non-routable";
    const disabledModeId = `championship:mode:custom-${suffix}`;
    const fallbackModeId = `championship:mode:fallback-${suffix}`;
    const calls = { get: 0, load: 0, shellEnter: 0 };
    const disabledEntry = canonicalModeDefinition(
      disabledModeId,
      async () => null,
      { activationPolicy }
    );
    const fallbackEntry = canonicalModeDefinition(fallbackModeId, async () => null);
    const entries = new Map([
      [disabledModeId, disabledEntry],
      [fallbackModeId, fallbackEntry]
    ]);
    const fallbackShell = {
      modeId: fallbackModeId,
      enter() {
        calls.shellEnter += 1;
      },
      suspend() {},
      resume() {},
      exit() {},
      dispose() {},
      getSnapshot() {
        return { modeId: fallbackModeId, lifecycle: "CREATED", revision: 0 };
      }
    };
    const registry = {
      list() {
        return [disabledEntry, fallbackEntry];
      },
      get(modeId) {
        calls.get += 1;
        return entries.get(modeId) ?? null;
      },
      async load(modeId) {
        calls.load += 1;
        if (modeId !== fallbackModeId) throw new Error("disabled load must not run");
        return fallbackShell;
      }
    };
    const router = createChampionshipModeRouter({ registry });
    disabledEntry.activationPolicy = CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED;
    const before = router.getSnapshot();
    const commandId = `captured:${suffix}`;
    const rejected = await router.enter(command(router, commandId, { modeId: disabledModeId }));
    assert.equal(rejected.accepted, false);
    assert.match(rejected.message, /not activatable/);
    assert.equal(router.getSnapshot(), before);
    assert.deepEqual(calls, { get: 0, load: 0, shellEnter: 0 });

    const reused = await router.enter(command(router, commandId, { modeId: fallbackModeId }));
    assert.equal(reused.accepted, true);
    assert.deepEqual(calls, { get: 0, load: 1, shellEnter: 1 });
  }
});

test("live registry get identity and metadata cannot replace captured authority", async () => {
  const modeId = "championship:mode:identity-authority";
  const calls = { get: 0, load: 0, shellEnter: 0, metadataGetterReads: 0 };
  const listedEntry = canonicalModeDefinition(modeId, async () => null);
  const imposterEntry = canonicalModeDefinition(modeId, async () => null);
  const shell = {
    modeId,
    enter() {
      calls.shellEnter += 1;
    },
    suspend() {},
    resume() {},
    exit() {},
    dispose() {},
    getSnapshot() {
      return { modeId, lifecycle: "CREATED", revision: 0 };
    }
  };
  const registry = {
    list() {
      return [listedEntry];
    },
    get() {
      calls.get += 1;
      return imposterEntry;
    },
    async load() {
      calls.load += 1;
      return shell;
    }
  };
  const router = createChampionshipModeRouter({ registry });
  for (const entry of [listedEntry, imposterEntry]) {
    for (const key of ["activationPolicy", "authority", "parityScope"]) {
      Object.defineProperty(entry, key, {
        configurable: true,
        enumerable: true,
        get() {
          calls.metadataGetterReads += 1;
          throw new Error(`live ${key} must not override captured metadata`);
        }
      });
    }
  }
  const entered = await router.enter(command(router, "captured:identity", { modeId }));
  assert.equal(entered.accepted, true);
  assert.deepEqual(calls, { get: 0, load: 1, shellEnter: 1, metadataGetterReads: 0 });
});

test("router publishes detached deep-frozen canonical DTOs and session listing never rereads caller entries", () => {
  const modeId = CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE;
  const entry = canonicalModeDefinition(modeId, async () => createChampionshipModeShell({ modeId }));
  const registry = rawRegistryForEntry(entry, modeId);
  const router = createChampionshipModeRouter({ registry });
  const session = createChampionshipR2Session({ sessionId: "detached-mode-list", modeRegistry: registry });
  const routerModes = router.listModes();
  const snapshot = router.getSnapshot();

  assert.equal(Object.isFrozen(routerModes), true);
  assert.equal(Object.isFrozen(routerModes[0]), true);
  assert.notEqual(routerModes[0], entry);
  assert.deepEqual(Object.keys(routerModes[0]), [
    "modeId",
    "activationPolicy",
    "authority",
    "parityScope",
    "simulationAuthority",
    "rendererAuthority",
    "persistenceAuthority"
  ]);
  assert.equal("load" in routerModes[0], false);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.equal(Object.isFrozen(snapshot.registeredModeIds), true);
  assert.deepEqual(snapshot.registeredModeIds, [modeId]);

  const getterReads = { activationPolicy: 0, authority: 0, parityScope: 0 };
  for (const key of Object.keys(getterReads)) {
    Object.defineProperty(entry, key, {
      configurable: true,
      enumerable: true,
      get() {
        getterReads[key] += 1;
        throw new Error(`caller ${key} accessor must not be read after capture`);
      }
    });
  }

  const sessionModes = session.listModes();
  assert.deepEqual(getterReads, { activationPolicy: 0, authority: 0, parityScope: 0 });
  assert.equal(Object.isFrozen(sessionModes), true);
  assert.equal(Object.isFrozen(sessionModes[0]), true);
  assert.deepEqual(sessionModes, [{
    modeId,
    activationPolicy: CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED,
    authority: "PROJECT_NATIVE_SHELL",
    parityScope: "VERIFIED_FAMILY_PRESENCE_ONLY"
  }]);
  assert.deepEqual(router.listModes(), routerModes);
  assert.deepEqual(router.getSnapshot().registeredModeIds, [modeId]);
  assert.throws(() => {
    routerModes[0].authority = "CALLER_MUTATION";
  }, TypeError);
});

test("registry definition metadata accessors fail closed with zero getter reads", () => {
  const modeId = CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE;
  const entry = canonicalModeDefinition(modeId, async () => createChampionshipModeShell({ modeId }));
  const getterReads = { activationPolicy: 0, authority: 0, parityScope: 0 };
  for (const key of Object.keys(getterReads)) {
    Object.defineProperty(entry, key, {
      enumerable: true,
      get() {
        getterReads[key] += 1;
        return key === "activationPolicy"
          ? CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED
          : key === "authority"
            ? "PROJECT_NATIVE_SHELL"
            : "VERIFIED_FAMILY_PRESENCE_ONLY";
      }
    });
  }
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(entry, modeId) }),
    /activationPolicy must be an own data property/
  );
  assert.deepEqual(getterReads, { activationPolicy: 0, authority: 0, parityScope: 0 });
});

test("registry definitions fail closed on inherited, hidden, symbol, extra, and revoked-proxy shapes", () => {
  const modeId = CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE;
  const loader = async () => createChampionshipModeShell({ modeId });

  let inheritedReads = 0;
  const inheritedAuthority = {};
  Object.defineProperty(inheritedAuthority, "authority", {
    get() {
      inheritedReads += 1;
      return "PROJECT_NATIVE_SHELL";
    }
  });
  const inheritedEntry = Object.create(inheritedAuthority);
  Object.defineProperties(inheritedEntry, Object.getOwnPropertyDescriptors(canonicalModeDefinition(modeId, loader)));
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(inheritedEntry, modeId, loader) }),
    /cannot inherit registry authority/
  );
  assert.equal(inheritedReads, 0);

  const hiddenEntry = canonicalModeDefinition(modeId, loader);
  Object.defineProperty(hiddenEntry, "authority", {
    value: "PROJECT_NATIVE_SHELL",
    enumerable: false
  });
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(hiddenEntry, modeId, loader) }),
    /authority cannot be hidden/
  );

  const symbolEntry = canonicalModeDefinition(modeId, loader);
  symbolEntry[Symbol("hidden-authority")] = true;
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(symbolEntry, modeId, loader) }),
    /cannot contain symbol keys/
  );

  const extraEntry = canonicalModeDefinition(modeId, loader, { networkAuthority: true });
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(extraEntry, modeId, loader) }),
    /unexpected key: networkAuthority/
  );

  const revocable = Proxy.revocable(canonicalModeDefinition(modeId, loader), {});
  revocable.revoke();
  assert.throws(
    () => createChampionshipModeRouter({ registry: rawRegistryForEntry(revocable.proxy, modeId, loader) })
  );
});

test("registry boundary rejects inherited or accessor public methods without reading them", () => {
  let inheritedReads = 0;
  const inheritedPrototype = {};
  Object.defineProperty(inheritedPrototype, "get", {
    get() {
      inheritedReads += 1;
      throw new Error("inherited registry method must not be read");
    }
  });
  const inheritedRegistry = Object.create(inheritedPrototype);
  Object.defineProperties(inheritedRegistry, {
    list: { value: () => [{ modeId: CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE }] },
    load: { value: async () => createChampionshipModeShell({ modeId: CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE }) }
  });
  assert.throws(() => createChampionshipModeRouter({ registry: inheritedRegistry }), /cannot inherit registry authority/);
  assert.equal(inheritedReads, 0);

  let accessorReads = 0;
  const accessorRegistry = {};
  Object.defineProperties(accessorRegistry, {
    list: {
      get() {
        accessorReads += 1;
        throw new Error("accessor registry method must not be read");
      }
    },
    get: { value: () => null },
    load: { value: async () => null }
  });
  assert.throws(() => createChampionshipModeRouter({ registry: accessorRegistry }), /list must be an own data property/);
  assert.equal(accessorReads, 0);
});

test("mode loaders remain lazy until enter and cache only successful shells", async () => {
  let loadCount = 0;
  const modeId = "championship:mode:test-lazy";
  const registry = createChampionshipModeRegistry([{
    modeId,
    load: async () => {
      loadCount += 1;
      return createChampionshipModeShell({ modeId });
    }
  }]);
  const router = new ChampionshipModeRouter({ registry });
  assert.equal(loadCount, 0);
  assert.deepEqual(router.getSnapshot().loadedModeIds, []);
  assert.equal((await router.enter(command(router, "lazy:enter-1", { modeId }))).accepted, true);
  assert.equal(loadCount, 1);
  assert.equal((await router.exit(command(router, "lazy:exit-1"))).accepted, true);
  assert.equal((await router.enter(command(router, "lazy:enter-2", { modeId }))).accepted, true);
  assert.equal(loadCount, 1);
});

test("router enforces enter, suspend, resume, exit, dispose in explicit order", async () => {
  const { router, publications } = await runLifecycle("ordered");
  assert.equal(publications.every((publication) => publication.accepted), true);
  assert.deepEqual(publications.map((publication) => publication.snapshot.lifecycle), [
    "ACTIVE",
    "SUSPENDED",
    "ACTIVE",
    "IDLE",
    "DISPOSED"
  ]);
  assert.deepEqual(publications.map((publication) => publication.events[0].type), [
    "MODE_ENTERED",
    "MODE_SUSPENDED",
    "MODE_RESUMED",
    "MODE_EXITED",
    "MODE_ROUTER_DISPOSED"
  ]);
  assert.equal(router.getSnapshot().revision, 5);
  assert.equal(router.getSnapshot().sequence, 5);
  assert.equal(router.getSnapshot().currentModeId, null);
  assert.deepEqual(router.getSnapshot().loadedModeIds, []);
  assert.equal((await router.resume({ commandId: "ordered:after-dispose", expectedRevision: 5 })).code, "CHAMPIONSHIP_MODE_ROUTER_DISPOSED");
});

test("invalid, stale, duplicate, and out-of-order commands leave the snapshot unchanged", async () => {
  const router = createChampionshipModeRouter();
  const initial = router.getSnapshot();
  const invalid = await router.dispatch({ commandId: "invalid", expectedRevision: 0, type: "NO_SUCH_COMMAND" });
  assert.equal(invalid.code, "CHAMPIONSHIP_MODE_INVALID_COMMAND");
  assert.equal(router.getSnapshot(), initial);

  const outOfOrder = await router.suspend(command(router, "guard:suspend"));
  assert.equal(outOfOrder.code, "CHAMPIONSHIP_MODE_TRANSITION_REJECTED");
  assert.equal(router.getSnapshot(), initial);

  const entered = await router.enter(command(router, "guard:enter", { modeId: CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE }));
  assert.equal(entered.accepted, true);
  const afterEnter = router.getSnapshot();

  const stale = await router.exit({ commandId: "guard:stale", expectedRevision: 0 });
  assert.equal(stale.code, "CHAMPIONSHIP_MODE_STALE_REVISION");
  assert.equal(router.getSnapshot(), afterEnter);

  const duplicate = await router.exit({ commandId: "guard:enter", expectedRevision: 1 });
  assert.equal(duplicate.code, "CHAMPIONSHIP_MODE_DUPLICATE_COMMAND");
  assert.equal(router.getSnapshot(), afterEnter);

  const secondEnter = await router.enter(command(router, "guard:second-enter", { modeId: CHAMPIONSHIP_MODE_IDS.SUPPLY_SHOP }));
  assert.equal(secondEnter.code, "CHAMPIONSHIP_MODE_TRANSITION_REJECTED");
  assert.equal(router.getSnapshot(), afterEnter);
});

test("failed lazy load is rejected atomically and remains retryable", async () => {
  let attempts = 0;
  const modeId = "championship:mode:test-retry";
  const registry = createChampionshipModeRegistry([{
    modeId,
    load: async () => {
      attempts += 1;
      if (attempts === 1) throw new Error("fixture load failure");
      return createChampionshipModeShell({ modeId });
    }
  }]);
  const router = createChampionshipModeRouter({ registry });
  const before = router.getSnapshot();
  const failed = await router.enter(command(router, "retry:enter", { modeId }));
  assert.equal(failed.code, "CHAMPIONSHIP_MODE_TRANSITION_REJECTED");
  assert.match(failed.message, /fixture load failure/);
  assert.equal(router.getSnapshot(), before);
  assert.deepEqual(router.getSnapshot().loadedModeIds, []);

  const retried = await router.enter(command(router, "retry:enter", { modeId }));
  assert.equal(retried.accepted, true);
  assert.equal(attempts, 2);
});

test("an in-flight lazy transition rejects overlap without consuming revision or command ID", async () => {
  let releaseLoader;
  const modeId = "championship:mode:test-in-flight";
  const registry = createChampionshipModeRegistry([{
    modeId,
    load: () => new Promise((resolve) => {
      releaseLoader = () => resolve(createChampionshipModeShell({ modeId }));
    })
  }]);
  const router = createChampionshipModeRouter({ registry });
  const first = router.enter(command(router, "in-flight:first", { modeId }));
  await Promise.resolve();
  const overlap = await router.enter(command(router, "in-flight:overlap", { modeId }));
  assert.equal(overlap.code, "CHAMPIONSHIP_MODE_TRANSITION_BUSY");
  assert.equal(router.getSnapshot().revision, 0);
  releaseLoader();
  assert.equal((await first).accepted, true);
  assert.equal(router.getSnapshot().revision, 1);
  const reusedCommandId = await router.suspend({ commandId: "in-flight:overlap", expectedRevision: 1 });
  assert.equal(reusedCommandId.accepted, true);
  assert.equal(router.getSnapshot().revision, 2);
});

test("lifecycle helpers reject prototype-bearing commands without reading inherited authority", async () => {
  const router = createChampionshipModeRouter();
  const inherited = Object.create({
    commandId: "prototype:enter",
    expectedRevision: 0,
    modeId: CHAMPIONSHIP_MODE_IDS.HUNT_CAPTURE
  });
  const before = router.getSnapshot();
  const rejected = await router.enter(inherited);
  assert.equal(rejected.code, "CHAMPIONSHIP_MODE_INVALID_COMMAND");
  assert.equal(router.getSnapshot(), before);
});

test("the same lifecycle command vector produces an identical deterministic event digest", async () => {
  const first = await runLifecycle("deterministic");
  const second = await runLifecycle("deterministic");
  assert.deepEqual(first.router.getSnapshot(), second.router.getSnapshot());
  assert.equal(first.publications.at(-1).eventDigest, second.publications.at(-1).eventDigest);
});

test("mode event history is bounded while accepted command IDs remain duplicate-safe", async () => {
  const router = createChampionshipModeRouter();
  const modeId = CHAMPIONSHIP_MODE_IDS.RAISING_HOME;
  for (let index = 0; index < 70; index += 1) {
    assert.equal((await router.enter(command(router, `history:enter:${index}`, { modeId }))).accepted, true);
    assert.equal((await router.exit(command(router, `history:exit:${index}`))).accepted, true);
  }
  assert.equal(router.getSnapshot().revision, 140);
  assert.equal(router.getSnapshot().eventLog.length, 128);
  const beforeDuplicate = router.getSnapshot();
  const duplicate = await router.enter(command(router, "history:enter:0", { modeId }));
  assert.equal(duplicate.code, "CHAMPIONSHIP_MODE_DUPLICATE_COMMAND");
  assert.equal(router.getSnapshot(), beforeDuplicate);
  assert.equal((await router.dispose(command(router, "history:dispose"))).accepted, true);
});

test("router retains the exact 256-command budget and keeps dispose available after exhaustion", async () => {
  const router = createChampionshipModeRouter();
  const modeId = CHAMPIONSHIP_MODE_IDS.RAISING_HOME;
  for (let index = 0; index < 128; index += 1) {
    assert.equal((await router.enter(command(router, `budget:enter:${index}`, { modeId }))).accepted, true);
    assert.equal((await router.exit(command(router, `budget:exit:${index}`))).accepted, true);
  }
  const atBudget = router.getSnapshot();
  assert.equal(atBudget.revision, 256);
  const exhausted = await router.enter(command(router, "budget:exhausted", { modeId }));
  assert.equal(exhausted.accepted, false);
  assert.equal(exhausted.code, "CHAMPIONSHIP_MODE_COMMAND_BUDGET_EXHAUSTED");
  assert.equal(router.getSnapshot(), atBudget);

  const disposed = await router.dispose(command(router, "budget:dispose"));
  assert.equal(disposed.accepted, true);
  assert.equal(disposed.snapshot.revision, 257);
  assert.equal(disposed.snapshot.lifecycle, "DISPOSED");
});

test("zero-write save port denies every persistence request and router never calls it", async () => {
  const savePort = createNoopChampionshipSavePort();
  assert.equal(ChampionshipSavePort.kind, CHAMPIONSHIP_SAVE_PORT_KIND);
  assert.equal(assertChampionshipSavePort(savePort), true);
  const { router } = await runLifecycle("zero-write");
  assert.deepEqual(router.inspectSaveBoundary(), {
    kind: CHAMPIONSHIP_SAVE_PORT_KIND,
    policy: "MEMORY_ONLY_DISCARD_ON_EXIT",
    readRequests: 0,
    writeRequests: 0,
    deleteRequests: 0,
    committedWrites: 0,
    committedDeletes: 0
  });

  const writeDenied = savePort.requestWrite({ slot: "fixture", payload: { value: 1 } });
  const deleteDenied = savePort.requestDelete({ slot: "fixture" });
  const readDenied = savePort.readSnapshot({ slot: "fixture" });
  assert.equal(writeDenied.code, "CHAMPIONSHIP_PERSISTENT_WRITE_DISABLED");
  assert.equal(deleteDenied.code, "CHAMPIONSHIP_PERSISTENT_DELETE_DISABLED");
  assert.equal(readDenied.code, "CHAMPIONSHIP_PERSISTENT_READ_DISABLED");
  assert.equal(writeDenied.persistenceAttempted, false);
  assert.deepEqual(savePort.inspect(), {
    kind: CHAMPIONSHIP_SAVE_PORT_KIND,
    policy: "MEMORY_ONLY_DISCARD_ON_EXIT",
    readRequests: 1,
    writeRequests: 1,
    deleteRequests: 1,
    committedWrites: 0,
    committedDeletes: 0
  });
});

test("kernel and mode modules stay isolated from production integration and asset paths", () => {
  const relativeFiles = [
    "src/championship/kernel/ChampionshipModeRouter.js",
    "src/championship/kernel/ChampionshipSavePort.js",
    "src/championship/modes/championshipModeRegistry.js",
    "src/championship/modes/createChampionshipModeShell.js"
  ];
  const forbidden = [
    /pageRouter/i,
    /saveQueue/i,
    /saveManager/i,
    /localStorage/i,
    /indexedDB/i,
    /fetch\s*\(/i,
    /assets\//i,
    /\.png|\.jpg|\.webp|\.mp3|\.wav/i
  ];
  for (const relativeFile of relativeFiles) {
    const source = fs.readFileSync(new URL(relativeFile, ROOT), "utf8");
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `${relativeFile} contains ${pattern}`);
  }
});

test("raw dispatch supports the public lifecycle command constants", async () => {
  const router = createChampionshipModeRouter();
  const publication = await router.dispatch({
    commandId: "raw:enter",
    expectedRevision: 0,
    type: CHAMPIONSHIP_MODE_COMMANDS.ENTER,
    modeId: CHAMPIONSHIP_MODE_IDS.TITLE_ENTRY,
    payload: {}
  });
  assert.equal(publication.accepted, true);
  assert.equal(publication.snapshot.currentModeId, CHAMPIONSHIP_MODE_IDS.TITLE_ENTRY);
  assert.equal("applyCommand" in router, false);
});
