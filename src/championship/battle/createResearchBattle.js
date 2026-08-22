export function createResearchBattle(state, catalog) {
  const match = state.arena.match;
  if (!match) throw new Error("Arena match must be selected before battle");
  const playerPreset = catalog.battlePresets.find((preset) => preset.presetId === match.playerPresetId);
  const opponentPreset = catalog.battlePresets.find((preset) => preset.presetId === match.opponentPresetId);
  if (!playerPreset || !opponentPreset) throw new Error("Arena match references a missing battle preset");

  const materialize = (preset) => {
    const hp = preset.arenaStatRules.find((rule) => rule.value?.kind === "HP")?.value?.amount;
    const actionIds = preset.actionLoadoutRules.find((rule) => rule.value?.kind === "ACTION_LOADOUT")?.value?.actionIds;
    if (!Number.isInteger(hp) || hp < 1 || !Array.isArray(actionIds) || actionIds.length === 0) {
      throw new Error("Battle preset requires explicit HP and action-loadout research rules");
    }
    return { hp, actionIds };
  };
  const playerFixture = materialize(playerPreset);
  const opponentFixture = materialize(opponentPreset);

  return {
    battleId: `${state.session.sessionId}:battle:1`,
    round: 0,
    turn: "PLAYER",
    status: "ACTIVE",
    player: {
      presetId: playerPreset.presetId,
      speciesId: playerPreset.speciesId,
      hp: playerFixture.hp,
      maxHp: playerFixture.hp,
      actionIds: [...playerFixture.actionIds]
    },
    opponent: {
      presetId: opponentPreset.presetId,
      speciesId: opponentPreset.speciesId,
      hp: opponentFixture.hp,
      maxHp: opponentFixture.hp,
      actionIds: [...opponentFixture.actionIds]
    },
    timeline: [],
    authority: "NEXUS_ADAPTATION",
    parityStatus: "RESEARCH_NON_PARITY"
  };
}
