import assert from "node:assert/strict";

import {
  CRYSTAL_VISUAL_STATES,
  resolveCrystalVisualState
} from "../../src/engine/crystalVisualState.js";
import { createCrystalStateRenderer } from "../../src/pixi/crystalStateRenderer.js";

const STATE_ASSETS = Object.freeze({
  glimmer: "glimmer.png",
  seed: "seed.png",
  cluster: "cluster.png",
  attuned: "attuned.png",
  transformed: "transformed.png",
  released: "released.png"
});

const checks = [];

async function runCheck(id, test) {
  try {
    await test();
    checks.push({ id, ok: true });
  } catch (error) {
    checks.push({ id, ok: false, error: error?.message || String(error) });
  }
}

function createCrystal(texture = { id: "original" }) {
  return { texture, alpha: 1 };
}

function createRafHarness() {
  let nextId = 1;
  const callbacks = new Map();
  const cancelled = [];
  return {
    request(callback) {
      const id = nextId;
      nextId += 1;
      callbacks.set(id, callback);
      return id;
    },
    cancel(id) {
      callbacks.delete(id);
      cancelled.push(id);
    },
    step(timestamp) {
      const scheduled = [...callbacks.values()];
      callbacks.clear();
      scheduled.forEach((callback) => callback(timestamp));
    },
    pendingCount: () => callbacks.size,
    cancelled
  };
}

function createDeferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

async function flushMicrotasks(rounds = 6) {
  for (let index = 0; index < rounds; index += 1) {
    await Promise.resolve();
  }
}

await runCheck("resolver-lifecycle-priority", () => {
  assert.equal(resolveCrystalVisualState([]), CRYSTAL_VISUAL_STATES.GLIMMER);
  assert.equal(resolveCrystalVisualState([null, "corrupt", []]), CRYSTAL_VISUAL_STATES.GLIMMER);
  assert.equal(resolveCrystalVisualState([{ status: "fresh" }]), CRYSTAL_VISUAL_STATES.SEED);
  assert.equal(
    resolveCrystalVisualState([{ status: "fresh" }, { status: "unknown" }]),
    CRYSTAL_VISUAL_STATES.CLUSTER
  );
  assert.equal(
    resolveCrystalVisualState([{ status: "fresh" }, { status: "settled" }]),
    CRYSTAL_VISUAL_STATES.ATTUNED
  );
  assert.equal(
    resolveCrystalVisualState([{ status: "settled" }, { status: "transformed" }]),
    CRYSTAL_VISUAL_STATES.TRANSFORMED
  );
  assert.equal(
    resolveCrystalVisualState([
      { status: "released", isVisibleInHabitat: false },
      { status: "archived" },
      { status: "unknown", isVisible: false }
    ]),
    CRYSTAL_VISUAL_STATES.RELEASED
  );
});

await runCheck("resolver-is-pure", () => {
  const memories = [
    { id: "one", status: "fresh", nested: { stable: true } },
    { id: "two", status: "settled" }
  ];
  const before = JSON.stringify(memories);
  resolveCrystalVisualState(memories);
  assert.equal(JSON.stringify(memories), before);
});

await runCheck("reduced-motion-direct-swap", async () => {
  const crystal = createCrystal();
  const loadedTexture = { id: "seed" };
  let frameRequests = 0;
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async () => loadedTexture,
    isReducedMotion: () => true,
    requestFrame: () => { frameRequests += 1; }
  });

  assert.equal(await renderer.sync([{ status: "fresh" }]), true);
  assert.equal(crystal.texture, loadedTexture);
  assert.equal(crystal.alpha, 1);
  assert.equal(frameRequests, 0);
  renderer.destroy();
});

await runCheck("animated-200ms-transition", async () => {
  const originalTexture = { id: "glimmer" };
  const nextTexture = { id: "attuned" };
  const crystal = createCrystal({ id: "base-cluster" });
  const raf = createRafHarness();
  let reducedMotion = true;
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async (assetPath) => assetPath === "glimmer.png" ? originalTexture : nextTexture,
    isReducedMotion: () => reducedMotion,
    now: () => 0,
    requestFrame: (callback) => raf.request(callback),
    cancelFrame: (frameId) => raf.cancel(frameId),
    transitionMs: 200
  });

  assert.equal(await renderer.sync([]), true);
  reducedMotion = false;
  const pending = renderer.sync([{ status: "settled" }]);
  await flushMicrotasks();
  raf.step(0);
  assert.equal(crystal.texture, originalTexture);
  assert.equal(crystal.alpha, 1);
  raf.step(50);
  assert.equal(crystal.texture, originalTexture);
  assert.equal(crystal.alpha, 0.5);
  raf.step(100);
  assert.equal(crystal.texture, nextTexture);
  assert.equal(crystal.alpha, 0);
  raf.step(150);
  assert.equal(crystal.alpha, 0.5);
  raf.step(200);
  assert.equal(await pending, true);
  assert.equal(crystal.texture, nextTexture);
  assert.equal(crystal.alpha, 1);
  assert.equal(renderer.getCurrentState(), "attuned");
  renderer.destroy();
});

await runCheck("initial-load-hides-base-until-ready", async () => {
  const baseTexture = { id: "base-cluster" };
  const seedTexture = { id: "seed" };
  const crystal = createCrystal(baseTexture);
  const raf = createRafHarness();
  const deferred = createDeferred();
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: () => deferred.promise,
    now: () => 0,
    requestFrame: (callback) => raf.request(callback),
    cancelFrame: (frameId) => raf.cancel(frameId),
    transitionMs: 200
  });

  const pending = renderer.sync([{ status: "fresh" }]);
  assert.equal(crystal.texture, baseTexture);
  assert.equal(crystal.alpha, 0, "base cluster must stay hidden while the first state loads");
  await flushMicrotasks();
  deferred.resolve(seedTexture);
  await flushMicrotasks();
  assert.equal(crystal.texture, seedTexture);
  assert.equal(crystal.alpha, 0);
  raf.step(100);
  assert.equal(crystal.alpha, 0.5);
  raf.step(200);
  assert.equal(await pending, true);
  assert.equal(crystal.alpha, 1);
  renderer.destroy();

  const failingBaseTexture = { id: "base-cluster-fallback" };
  const failingCrystal = createCrystal(failingBaseTexture);
  const failingRenderer = createCrystalStateRenderer({}, {
    crystal: failingCrystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async () => { throw new Error("missing initial texture"); },
    warn: () => {}
  });
  const failedLoad = failingRenderer.sync([]);
  assert.equal(failingCrystal.alpha, 0);
  assert.equal(await failedLoad, false);
  assert.equal(failingCrystal.texture, failingBaseTexture);
  assert.equal(failingCrystal.alpha, 1);
  failingRenderer.destroy();
});

await runCheck("latest-request-wins", async () => {
  const crystal = createCrystal();
  const loads = new Map();
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture(assetPath) {
      const deferred = createDeferred();
      loads.set(assetPath, deferred);
      return deferred.promise;
    },
    isReducedMotion: () => true
  });

  const seedRequest = renderer.sync([{ status: "fresh" }]);
  const clusterRequest = renderer.sync([{ status: "fresh" }, { status: "unknown" }]);
  await flushMicrotasks();
  loads.get("seed.png").resolve({ id: "seed" });
  await flushMicrotasks();
  assert.notEqual(crystal.texture?.id, "seed");
  loads.get("cluster.png").resolve({ id: "cluster" });
  assert.equal(await seedRequest, false);
  assert.equal(await clusterRequest, true);
  assert.equal(crystal.texture.id, "cluster");
  assert.equal(renderer.getCurrentState(), "cluster");
  renderer.destroy();
});

await runCheck("missing-texture-fallback-warns-once", async () => {
  const originalTexture = { id: "original" };
  const crystal = createCrystal(originalTexture);
  const warnings = [];
  let loadCount = 0;
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async () => {
      loadCount += 1;
      throw new Error("missing");
    },
    warn: (...args) => warnings.push(args)
  });

  assert.equal(await renderer.sync([{ status: "fresh" }]), false);
  assert.equal(await renderer.sync([{ status: "fresh" }]), false);
  assert.equal(loadCount, 1);
  assert.equal(warnings.length, 1);
  assert.equal(crystal.texture, originalTexture);
  assert.equal(crystal.alpha, 1);
  renderer.destroy();
});

await runCheck("destroy-cancels-and-rolls-back", async () => {
  const originalTexture = { id: "original" };
  const nextTexture = { id: "transformed" };
  const crystal = createCrystal(originalTexture);
  const raf = createRafHarness();
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async () => nextTexture,
    now: () => 0,
    requestFrame: (callback) => raf.request(callback),
    cancelFrame: (frameId) => raf.cancel(frameId)
  });

  const pending = renderer.sync([{ status: "transformed" }]);
  await flushMicrotasks();
  raf.step(100);
  assert.equal(crystal.texture, nextTexture);
  assert.equal(crystal.alpha, 0.5);
  renderer.destroy();
  assert.equal(await pending, false);
  assert.equal(crystal.texture, originalTexture);
  assert.equal(crystal.alpha, 1);
  assert.ok(raf.cancelled.length > 0);
});

await runCheck("raf-failure-restores-current-texture", async () => {
  const originalTexture = { id: "original" };
  const crystal = createCrystal(originalTexture);
  const warnings = [];
  const renderer = createCrystalStateRenderer({}, {
    crystal,
    stateAssets: STATE_ASSETS,
    loadTexture: async () => ({ id: "seed" }),
    requestFrame: () => { throw new Error("raf unavailable"); },
    warn: (...args) => warnings.push(args)
  });

  assert.equal(await renderer.sync([{ status: "fresh" }]), false);
  assert.equal(crystal.texture, originalTexture);
  assert.equal(crystal.alpha, 1);
  assert.equal(warnings.length, 1);
  renderer.destroy();
});

const failed = checks.filter((check) => !check.ok).length;
console.log(JSON.stringify({ total: checks.length, failed, checks }, null, 2));
if (failed > 0) process.exitCode = 1;
