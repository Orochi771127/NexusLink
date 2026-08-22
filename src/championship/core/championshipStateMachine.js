import { CHAMPIONSHIP_PHASES } from "../contracts/championshipContracts.js";

const TRANSITIONS = Object.freeze({
  HEARTLAKE_PROFILE: Object.freeze(["GATE_SELECT"]),
  GATE_SELECT: Object.freeze(["HUNT_FIELD"]),
  HUNT_FIELD: Object.freeze(["WILD_ENCOUNTER"]),
  WILD_ENCOUNTER: Object.freeze(["CAPTURE"]),
  CAPTURE: Object.freeze(["COLLECTION"]),
  COLLECTION: Object.freeze(["SHOP"]),
  SHOP: Object.freeze(["ARENA"]),
  ARENA: Object.freeze(["BATTLE"]),
  BATTLE: Object.freeze(["BATTLE_RESULT"]),
  BATTLE_RESULT: Object.freeze(["COMPLETE"]),
  COMPLETE: Object.freeze([])
});

export function assertChampionshipPhase(phase) {
  if (!CHAMPIONSHIP_PHASES.includes(phase)) throw new Error(`Unknown Championship phase: ${phase}`);
  return phase;
}

export function canTransitionChampionshipPhase(from, to) {
  assertChampionshipPhase(from);
  assertChampionshipPhase(to);
  return TRANSITIONS[from].includes(to);
}

export function assertChampionshipPhaseTransition(from, to) {
  if (!canTransitionChampionshipPhase(from, to)) throw new Error(`Invalid Championship phase transition: ${from} -> ${to}`);
  return true;
}
