import { selectResearchOpponentAction } from "./selectResearchOpponentAction.js";

function actionMagnitude(action) {
  const rule = action.effectRules.find((candidate) => candidate.value?.kind === "DAMAGE");
  if (!rule || rule.ruleAuthority !== "NEXUS_ADAPTATION" || rule.originalParityClaim !== false) {
    throw new Error("R1 battle requires an explicit project-native non-parity damage rule");
  }
  return rule.value.magnitude;
}

export function resolveResearchTurn(battleSession, actionId, catalog) {
  if (!battleSession || battleSession.status !== "ACTIVE") throw new Error("Battle is not active");
  if (!battleSession.player.actionIds.includes(actionId)) throw new Error("Action is not available to the player fixture");
  const playerAction = catalog.actions.find((action) => action.actionId === actionId);
  if (!playerAction) throw new Error("Player action is missing from the catalog");

  const next = {
    ...battleSession,
    round: battleSession.round + 1,
    player: { ...battleSession.player },
    opponent: { ...battleSession.opponent },
    timeline: [...battleSession.timeline]
  };

  const playerDamage = actionMagnitude(playerAction);
  next.opponent.hp = Math.max(0, next.opponent.hp - playerDamage);
  next.timeline.push({ round: next.round, actor: "PLAYER", actionId, damage: playerDamage, targetHp: next.opponent.hp });

  if (next.opponent.hp === 0) {
    next.status = "PLAYER_WIN";
    next.turn = "COMPLETE";
    return next;
  }

  const opponentAction = selectResearchOpponentAction(next, catalog);
  const opponentDamage = actionMagnitude(opponentAction);
  next.player.hp = Math.max(0, next.player.hp - opponentDamage);
  next.timeline.push({ round: next.round, actor: "OPPONENT", actionId: opponentAction.actionId, damage: opponentDamage, targetHp: next.player.hp });
  if (next.player.hp === 0) {
    next.status = "OPPONENT_WIN";
    next.turn = "COMPLETE";
  } else {
    next.turn = "PLAYER";
  }
  return next;
}
