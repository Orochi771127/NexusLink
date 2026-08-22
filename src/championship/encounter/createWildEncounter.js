import { clonePlainData } from "../contracts/championshipContracts.js";

export function createWildEncounter(state, speciesDefinition) {
  if (!speciesDefinition) throw new Error("A project-native species fixture is required");
  return {
    encounterId: `${state.session.sessionId}:encounter:1`,
    speciesId: speciesDefinition.speciesId,
    presentationRef: speciesDefinition.assetRef,
    sourceAuthority: "NEXUS_PRODUCT",
    status: "AVAILABLE",
    capturedInstanceId: null,
    snapshot: clonePlainData({ speciesId: speciesDefinition.speciesId, formKind: speciesDefinition.formKind })
  };
}
