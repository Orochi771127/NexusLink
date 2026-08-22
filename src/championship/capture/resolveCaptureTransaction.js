import { clonePlainData } from "../contracts/championshipContracts.js";

export function resolveCaptureTransaction(state) {
  const encounter = state.hunt.encounter;
  if (!encounter || encounter.status !== "AVAILABLE") throw new Error("No capturable research encounter is available");
  if (state.collection.instanceOrder.length >= state.collection.capacity) throw new Error("Research collection capacity reached");

  const instanceId = `${state.session.sessionId}:capture:${state.collection.instanceOrder.length + 1}`;
  const capturedInstance = {
    instanceId,
    speciesId: encounter.speciesId,
    sourceEncounterId: encounter.encounterId,
    authority: "RESEARCH_FIXTURE",
    playerOwned: false,
    relationshipAuthority: "NONE",
    persistencePolicy: "MEMORY_ONLY_DISCARD_ON_EXIT",
    capturedSnapshot: clonePlainData(encounter.snapshot)
  };

  return {
    ...state,
    hunt: {
      ...state.hunt,
      encounter: { ...encounter, status: "CAPTURED_RESEARCH_ONLY", capturedInstanceId: instanceId }
    },
    collection: {
      ...state.collection,
      instanceOrder: [...state.collection.instanceOrder, instanceId],
      instancesById: { ...state.collection.instancesById, [instanceId]: capturedInstance }
    },
    database: {
      ...state.database,
      seenSpeciesIds: [...new Set([...state.database.seenSpeciesIds, encounter.speciesId])]
    }
  };
}
