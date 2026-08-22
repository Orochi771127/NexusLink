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

const ROOT = new URL("../../", import.meta.url);

function command(router, commandId, values = {}) {
  return {
    commandId,
    expectedRevision: router.getSnapshot().revision,
    payload: {},
    ...values
  };
}

function createHostileReservedRegistry(modeId) {
  const calls = {
    list: 0,
    get: 0,
    load: 0,
    shellEnter: 0,
    inheritedAuthorityRead: 0,
    accessorAuthorityRead: 0
  };
  const inheritedAuthority = {};
  Object.defineProperty(inheritedAuthority, "familyId", {
    get() {
      calls.inheritedAuthorityRead += 1;
      throw new Error("inherited family authority must not be read");
    }
  });
  const entry = Object.create(inheritedAuthority);
  Object.defineProperties(entry, {
    modeId: { value: modeId, enumerable: true },
    activationPolicy: {
      value: CHAMPIONSHIP_MODE_ACTIVATION_POLICIES.ENABLED,
      enumerable: true
    },
    authority: {
      enumerable: true,
      get() {
        calls.accessorAuthorityRead += 1;
        throw new Error("accessor authority must not be read");
      }
    }
  });
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
      shellEnter: 0,
      inheritedAuthorityRead: 0,
      accessorAuthorityRead: 0
    });
  }
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
  assert.throws(() => createChampionshipModeRouter({ registry: inheritedRegistry }), /get must be an own data property/);
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
