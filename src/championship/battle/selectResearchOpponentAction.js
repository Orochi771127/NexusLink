export function selectResearchOpponentAction(battleSession, catalog) {
  const actionIds = battleSession.opponent.actionIds;
  if (actionIds.length === 0) throw new Error("Opponent has no research actions");
  const actionId = actionIds[battleSession.round % actionIds.length];
  const action = catalog.actions.find((candidate) => candidate.actionId === actionId);
  if (!action) throw new Error("Opponent action is missing from the project-native catalog");
  return action;
}
