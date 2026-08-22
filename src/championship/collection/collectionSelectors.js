export function selectResearchCollection(state) {
  return state.collection.instanceOrder.map((instanceId) => state.collection.instancesById[instanceId]);
}

export function selectResearchSpeciesSeen(state) {
  return [...state.database.seenSpeciesIds];
}
