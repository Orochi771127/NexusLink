import { clonePlainData } from "../contracts/championshipContracts.js";

export function selectResearchGate(state, gate, field) {
  if (!gate || !field || gate.fieldDefinitionId !== field.battleFieldId) throw new Error("Gate and Hunt Field are not cross-referenced");
  const topology = field.topologyRule?.value;
  if (!topology || topology.kind !== "GRID_COLLISION") throw new Error("Hunt Field topology rule is unavailable");
  const runtimeField = clonePlainData({
    fieldId: field.battleFieldId,
    projectNativePresentationRef: field.projectNativePresentationRef,
    encounterSpeciesId: field.encounterSpeciesId,
    width: topology.width,
    height: topology.height,
    playerStart: topology.playerStart,
    encounterPoint: topology.encounterPoint,
    obstacles: topology.obstacles,
    topologyRule: field.topologyRule,
    presentationLayerRules: field.presentationLayerRules
  });
  return {
    ...state,
    hunt: {
      ...state.hunt,
      gateId: gate.gateId,
      fieldId: field.battleFieldId,
      field: runtimeField,
      hunterPosition: clonePlainData(topology.playerStart),
      encounter: null,
      selectedToolIds: [],
      lastCollision: null
    }
  };
}
