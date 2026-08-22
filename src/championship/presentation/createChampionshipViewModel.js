import { CHAMPIONSHIP_COMMANDS } from "../core/championshipCommands.js";

const COPY = Object.freeze({
  HEARTLAKE_PROFILE: ["Research Profile", "A sanitized, read-only companion identity enters this disposable session."],
  GATE_SELECT: ["Gate Select", "Choose the project-native Hunt Field gate."],
  HUNT_FIELD: ["Moonlit Reed Field", "Navigate the 2D field. Stone reeds and fallen roots block movement."],
  WILD_ENCOUNTER: ["Wild Encounter", "A Blazetail Kit watches from the reeds."],
  CAPTURE: ["Capture", "Register this encounter in the research-only collection."],
  COLLECTION: ["Collection", "Captured research instances are separate from player ownership and species sightings."],
  SHOP: ["Field Shop", "Spend only the disposable research wallet."],
  ARENA: ["Championship Arena", "Prepare an isolated HP-only research match."],
  BATTLE: ["Reedlight Battle", "Choose a project-native action. The opponent follows a fixed research policy."],
  BATTLE_RESULT: ["Battle Result", "Review the nonpersistent result before completing the slice."],
  COMPLETE: ["Research Complete", "The session can now be closed; no NexusLink save was changed."]
});

function action(label, type, payload = {}, tone = "primary") {
  return { label, type, payload, tone };
}

export function createChampionshipViewModel(state, catalog) {
  const [title, description] = COPY[state.session.phase];
  const model = {
    phase: state.session.phase,
    title,
    description,
    revision: state.revision,
    wallet: state.economy.wallet,
    collectionCount: state.collection.instanceOrder.length,
    eventCount: state.eventLog.length,
    actions: [],
    hunt: state.hunt.field ? {
      field: state.hunt.field,
      position: state.hunt.hunterPosition,
      collision: state.hunt.lastCollision
    } : null,
    encounter: state.hunt.encounter,
    battle: state.arena.battleSession,
    battleResult: state.arena.battleResult,
    researchComplete: state.session.phase === "COMPLETE"
  };

  switch (state.session.phase) {
    case "HEARTLAKE_PROFILE":
      model.actions.push(action("Enter research gate", CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE));
      break;
    case "GATE_SELECT":
      for (const gate of catalog.gates) model.actions.push(action(gate.displayName, CHAMPIONSHIP_COMMANDS.SELECT_GATE, { gateId: gate.gateId }));
      break;
    case "HUNT_FIELD":
      model.actions.push(
        action("Move up", CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "up" }, "direction"),
        action("Move left", CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "left" }, "direction"),
        action("Move down", CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "down" }, "direction"),
        action("Move right", CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "right" }, "direction")
      );
      break;
    case "WILD_ENCOUNTER":
      model.actions.push(action("Prepare capture", CHAMPIONSHIP_COMMANDS.BEGIN_CAPTURE));
      break;
    case "CAPTURE":
      if (state.hunt.encounter?.status === "AVAILABLE") model.actions.push(action("Register capture", CHAMPIONSHIP_COMMANDS.ATTEMPT_CAPTURE));
      else model.actions.push(action("Open research collection", CHAMPIONSHIP_COMMANDS.CONTINUE_TO_COLLECTION));
      break;
    case "COLLECTION":
      model.actions.push(action("Visit field shop", CHAMPIONSHIP_COMMANDS.OPEN_SHOP));
      break;
    case "SHOP":
      for (const record of catalog.shopRecords) {
        const stock = state.economy.shopAvailabilityByRecordId[record.shopRecordId] ?? 0;
        const price = record.priceRule.value.amount;
        model.actions.push(action(
          `${record.displayName} · ${price} mist`,
          CHAMPIONSHIP_COMMANDS.PURCHASE_RESEARCH_ITEM,
          { shopRecordId: record.shopRecordId },
          "secondary"
        ));
        model.actions.at(-1).disabled = stock <= 0 || state.economy.wallet < price;
      }
      model.actions.push(action("Leave for Arena", CHAMPIONSHIP_COMMANDS.LEAVE_SHOP));
      break;
    case "ARENA": {
      const match = catalog.titleMatches[0];
      if (!state.arena.match) model.actions.push(action(`Select ${match.displayName}`, CHAMPIONSHIP_COMMANDS.ENTER_ARENA, { matchId: match.matchId }));
      else model.actions.push(action("Begin match", CHAMPIONSHIP_COMMANDS.START_BATTLE));
      break;
    }
    case "BATTLE":
      for (const actionId of state.arena.battleSession.player.actionIds) {
        const definition = catalog.actions.find((entry) => entry.actionId === actionId);
        model.actions.push(action(definition.displayName, CHAMPIONSHIP_COMMANDS.RESOLVE_BATTLE_TURN, { actionId }));
      }
      break;
    case "BATTLE_RESULT":
      model.actions.push(action("Complete research run", CHAMPIONSHIP_COMMANDS.ACCEPT_BATTLE_RESULT));
      break;
    default:
      break;
  }
  return model;
}
