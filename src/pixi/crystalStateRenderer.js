import { ASSET_MANIFEST } from "../data/assetManifest.js";
import { resolveCrystalVisualState } from "../engine/crystalVisualState.js";

const DEFAULT_TRANSITION_MS = 200;

export function createCrystalStateRenderer(PIXI, options = {}) {
  const crystal = options.crystal || null;
  const stateAssets = options.stateAssets || ASSET_MANIFEST.props.crystalStates;
  const loadTexture = options.loadTexture || ((assetPath) => PIXI.Assets.load(assetPath));
  const isReducedMotion = options.isReducedMotion || (() => false);
  const requestFrame = options.requestFrame || ((callback) => globalThis.requestAnimationFrame(callback));
  const cancelFrame = options.cancelFrame || ((frameId) => globalThis.cancelAnimationFrame(frameId));
  const readNow = options.now || (() => globalThis.performance?.now?.() ?? Date.now());
  const warn = options.warn || ((...args) => console.warn(...args));
  const transitionMs = Math.max(1, Number(options.transitionMs) || DEFAULT_TRANSITION_MS);

  let generation = 0;
  let currentState = null;
  let desiredState = null;
  let pendingSync = null;
  let transition = null;
  let frameId = null;
  let destroyed = false;
  const warnedKeys = new Set();

  function warnOnce(key, message, error) {
    if (warnedKeys.has(key)) return;
    warnedKeys.add(key);
    warn(message, error);
  }

  function cancelTransition({ rollback = true } = {}) {
    const activeTransition = transition;
    transition = null;

    if (frameId !== null) {
      try {
        cancelFrame(frameId);
      } catch (error) {
        warnOnce("cancel-frame", "Crystal state transition cancellation failed.", error);
      }
      frameId = null;
    }

    if (crystal) {
      if (rollback && activeTransition?.textureSwapped) {
        crystal.texture = activeTransition.previousTexture;
      }
      crystal.alpha = 1;
    }

    activeTransition?.resolve?.(false);
    return Boolean(activeTransition);
  }

  function transitionTo(texture, stateKey, token) {
    if (!crystal || destroyed || token !== generation) return Promise.resolve(false);

    const isInitialTransition = currentState === null;
    const previousTexture = crystal.texture;
    cancelTransition();

    let reduceMotion = false;
    try {
      reduceMotion = Boolean(isReducedMotion());
    } catch (error) {
      warnOnce("reduced-motion", "Crystal reduced-motion preference could not be read.", error);
    }

    if (reduceMotion || crystal.texture === texture) {
      crystal.texture = texture;
      crystal.alpha = 1;
      currentState = stateKey;
      return Promise.resolve(true);
    }

    return new Promise((resolve) => {
      const startedAt = readNow();
      transition = {
        previousTexture,
        nextTexture: texture,
        stateKey,
        textureSwapped: isInitialTransition,
        isInitialTransition,
        resolve
      };

      if (isInitialTransition) {
        crystal.texture = texture;
        crystal.alpha = 0;
      }

      const failTransition = (error) => {
        if (transition?.stateKey !== stateKey) return;
        cancelTransition({ rollback: true });
        warnOnce(`raf:${stateKey}`, `Crystal state transition failed for "${stateKey}".`, error);
      };

      const tick = (timestamp) => {
        if (destroyed || token !== generation || transition?.stateKey !== stateKey) {
          cancelTransition({ rollback: true });
          return;
        }

        const frameTime = Number.isFinite(timestamp) ? timestamp : readNow();
        const progress = Math.min(1, Math.max(0, (frameTime - startedAt) / transitionMs));

        if (transition.isInitialTransition) {
          crystal.alpha = progress;
        } else if (progress < 0.5) {
          crystal.alpha = 1 - progress * 2;
        } else {
          if (!transition.textureSwapped) {
            crystal.texture = texture;
            transition.textureSwapped = true;
          }
          crystal.alpha = (progress - 0.5) * 2;
        }

        if (progress >= 1) {
          const completedTransition = transition;
          transition = null;
          frameId = null;
          crystal.texture = texture;
          crystal.alpha = 1;
          currentState = stateKey;
          completedTransition.resolve(true);
          return;
        }

        try {
          frameId = requestFrame(tick);
        } catch (error) {
          failTransition(error);
        }
      };

      try {
        frameId = requestFrame(tick);
      } catch (error) {
        failTransition(error);
      }
    });
  }

  function sync(emotionalMemories = []) {
    if (!crystal || destroyed) return Promise.resolve(false);

    const nextState = resolveCrystalVisualState(emotionalMemories);
    if (nextState === desiredState) {
      return pendingSync || Promise.resolve(nextState === currentState);
    }

    desiredState = nextState;
    const token = ++generation;
    cancelTransition({ rollback: true });
    const fallbackTexture = crystal.texture;
    const isInitialLoad = currentState === null;
    if (isInitialLoad) crystal.alpha = 0;

    const assetPath = stateAssets?.[nextState];
    if (!assetPath) {
      if (isInitialLoad) crystal.alpha = 1;
      warnOnce(`asset:${nextState}`, `Crystal state asset is missing for "${nextState}".`);
      return Promise.resolve(false);
    }

    pendingSync = Promise.resolve()
      .then(() => loadTexture(assetPath))
      .then((texture) => {
        if (!texture) throw new Error(`Texture loader returned no texture for ${assetPath}`);
        if (destroyed || token !== generation) return false;
        return transitionTo(texture, nextState, token);
      })
      .catch((error) => {
        if (!destroyed && token === generation) {
          if (isInitialLoad) crystal.texture = fallbackTexture;
          crystal.alpha = 1;
          warnOnce(`load:${assetPath}`, `Crystal state texture failed to load: ${assetPath}`, error);
        }
        return false;
      })
      .finally(() => {
        if (token === generation) pendingSync = null;
      });

    return pendingSync;
  }

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    generation += 1;
    desiredState = null;
    pendingSync = null;
    cancelTransition({ rollback: true });
  }

  return Object.freeze({
    sync,
    destroy,
    getCurrentState: () => currentState,
    getDesiredState: () => desiredState
  });
}
