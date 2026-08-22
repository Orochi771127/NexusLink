import { deepFreeze } from "./contracts/championshipContracts.js";
import { createChampionshipInitialState, championshipReducer } from "./core/championshipReducer.js";
import { createChampionshipResearchStore } from "./core/createChampionshipResearchStore.js";

export function createChampionshipResearchRuntime({
  profilePort,
  catalogPort,
  clockPort,
  seed,
  presentationPort = null
}) {
  if (!profilePort || typeof profilePort.read !== "function") throw new TypeError("profilePort.read is required");
  if (!catalogPort || typeof catalogPort.read !== "function") throw new TypeError("catalogPort.read is required");
  if (!clockPort || typeof clockPort.now !== "function") throw new TypeError("clockPort.now is required");
  if (!Number.isInteger(seed)) throw new TypeError("An integer deterministic seed is required");

  const profile = profilePort.read();
  const catalog = catalogPort.read();
  const sessionId = `championship-r1-${seed >>> 0}`;
  const initialState = createChampionshipInitialState({ profile, catalog, seed: seed >>> 0, sessionId });
  const store = createChampionshipResearchStore({ initialState, reducer: championshipReducer, catalog, clockPort });
  const unsubscribePresentation = presentationPort?.publish
    ? store.subscribe((publication) => presentationPort.publish(publication))
    : null;

  return Object.freeze({
    dispatch(command) {
      return store.dispatch(command);
    },
    getSnapshot() {
      return store.getSnapshot();
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    dispose() {
      unsubscribePresentation?.();
      presentationPort?.dispose?.();
      store.dispose();
    }
  });
}

export function createDeterministicClock(start = 0) {
  let tick = Number(start);
  if (!Number.isFinite(tick)) throw new TypeError("Clock start must be finite");
  return deepFreeze({
    now() {
      tick += 1;
      return tick;
    }
  });
}

export * from "./core/championshipCommands.js";
export * from "./contracts/championshipContracts.js";
