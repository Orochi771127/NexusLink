import { createResearchResultEnvelope, stableDigest } from "../contracts/championshipContracts.js";
import { assertChampionshipStateInvariants, assertTransitionResult } from "./invariants.js";

export function runAtomicChampionshipTransition(state, command, reducer, context) {
  const beforeDigest = stableDigest(state);
  try {
    const reduced = reducer(state, command, context);
    if (!reduced || typeof reduced !== "object") throw new Error("Reducer returned no transition result");
    assertChampionshipStateInvariants(reduced.nextState);
    assertTransitionResult(reduced.result);
    if (stableDigest(state) !== beforeDigest) throw new Error("Reducer mutated the input snapshot");
    return { accepted: true, ...reduced };
  } catch (error) {
    if (stableDigest(state) !== beforeDigest) throw new Error("Failed transaction mutated the input snapshot");
    return {
      accepted: false,
      nextState: state,
      events: [],
      result: createResearchResultEnvelope({
        accepted: false,
        code: "CHAMPIONSHIP_TRANSACTION_REJECTED",
        message: error instanceof Error ? error.message : String(error),
        sessionEventDigest: stableDigest(state.eventLog)
      })
    };
  }
}
