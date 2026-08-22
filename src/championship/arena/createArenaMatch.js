import { clonePlainData } from "../contracts/championshipContracts.js";

export function createArenaMatch(state, matchDefinition) {
  if (!matchDefinition) throw new Error("Arena match fixture is required");
  return {
    ...state,
    arena: {
      ...state.arena,
      matchId: matchDefinition.matchId,
      match: clonePlainData(matchDefinition),
      battleSession: null,
      battleResult: null
    }
  };
}
