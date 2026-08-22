export function buildResearchBattleResult(battleSession) {
  if (!battleSession || battleSession.status === "ACTIVE") throw new Error("Cannot build a result for an active battle");
  return {
    battleId: battleSession.battleId,
    outcome: battleSession.status,
    rounds: battleSession.round,
    authority: "RESEARCH_FIXTURE",
    rankWrite: false,
    badgeWrite: false,
    committable: false,
    persistenceAttempted: false
  };
}
