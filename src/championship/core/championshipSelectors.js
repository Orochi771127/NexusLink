export function selectChampionshipPhase(state) {
  return state.session.phase;
}

export function selectBattleActions(state, catalog) {
  const actionIds = state.arena.battleSession?.player?.actionIds ?? [];
  return actionIds.map((actionId) => catalog.actions.find((action) => action.actionId === actionId)).filter(Boolean);
}

export function selectResearchResult(state) {
  return state.results.at(-1) ?? null;
}
