import {
  CHAMPIONSHIP_RULESET_ID,
  CHAMPIONSHIP_SCHEMA_VERSION,
  clonePlainData,
  createResearchResultEnvelope
} from "../contracts/championshipContracts.js";
import { CHAMPIONSHIP_COMMANDS } from "./championshipCommands.js";
import { CHAMPIONSHIP_EVENTS, createEventDescriptor } from "./championshipEvents.js";
import { assertChampionshipPhaseTransition } from "./championshipStateMachine.js";
import { selectResearchGate } from "../gate/selectGate.js";
import { moveResearchHunter } from "../hunt/startHunt.js";
import { createWildEncounter } from "../encounter/createWildEncounter.js";
import { resolveCaptureTransaction } from "../capture/resolveCaptureTransaction.js";
import { resolveShopTransaction } from "../shop/resolveShopTransaction.js";
import { createArenaMatch } from "../arena/createArenaMatch.js";
import { createResearchBattle } from "../battle/createResearchBattle.js";
import { resolveResearchTurn } from "../battle/resolveResearchTurn.js";
import { buildResearchBattleResult } from "../battle/buildResearchBattleResult.js";

function transitionPhase(state, phase) {
  assertChampionshipPhaseTransition(state.session.phase, phase);
  return { ...state, session: { ...state.session, phase } };
}

function result(code, detail = {}) {
  return createResearchResultEnvelope({ accepted: true, code, ...detail });
}

export function createChampionshipInitialState({ profile, catalog, seed, sessionId }) {
  const shopAvailabilityByRecordId = Object.fromEntries(catalog.shopRecords.map((record) => [
    record.shopRecordId,
    record.initialStockRule.value.count
  ]));
  return {
    schemaVersion: CHAMPIONSHIP_SCHEMA_VERSION,
    revision: 0,
    session: {
      sessionId,
      rulesetId: CHAMPIONSHIP_RULESET_ID,
      seed,
      sequence: 0,
      phase: "HEARTLAKE_PROFILE",
      committable: false,
      persistencePolicy: "MEMORY_ONLY_DISCARD_ON_EXIT"
    },
    sourceProfileProjection: clonePlainData(profile),
    economy: {
      source: "RESEARCH_FIXTURE",
      wallet: catalog.fixtureEconomy.wallet,
      inventoryByItemId: {},
      cageOwnershipById: {},
      shopAvailabilityByRecordId
    },
    hunt: {
      gateId: null,
      fieldId: null,
      field: null,
      hunterPosition: null,
      encounter: null,
      selectedToolIds: [],
      lastCollision: null
    },
    collection: {
      authority: "RESEARCH_FIXTURE",
      capacity: 3,
      instanceOrder: [],
      instancesById: {}
    },
    database: { seenSpeciesIds: [] },
    arena: { matchId: null, match: null, battleSession: null, battleResult: null },
    results: [],
    eventLog: []
  };
}

export function championshipReducer(state, command, context) {
  const catalog = context.catalog;
  switch (command.type) {
    case CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE: {
      if (state.session.phase !== "HEARTLAKE_PROFILE") throw new Error("Profile can only be accepted from HEARTLAKE_PROFILE");
      const nextState = transitionPhase(state, "GATE_SELECT");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.PROFILE_ACCEPTED)], result: result("PROFILE_ACCEPTED") };
    }
    case CHAMPIONSHIP_COMMANDS.SELECT_GATE: {
      if (state.session.phase !== "GATE_SELECT") throw new Error("Gate selection is not active");
      const gate = catalog.gates.find((entry) => entry.gateId === command.payload?.gateId);
      const field = catalog.battleFields.find((entry) => entry.battleFieldId === gate?.fieldDefinitionId);
      let nextState = selectResearchGate(state, gate, field);
      nextState = transitionPhase(nextState, "HUNT_FIELD");
      return {
        nextState,
        events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.GATE_SELECTED, { gateId: gate.gateId, fieldId: field.battleFieldId })],
        result: result("GATE_SELECTED")
      };
    }
    case CHAMPIONSHIP_COMMANDS.MOVE_HUNTER: {
      if (state.session.phase !== "HUNT_FIELD") throw new Error("Hunter movement is not active");
      const movement = moveResearchHunter(state, command.payload?.direction);
      const events = [createEventDescriptor(
        movement.moved ? CHAMPIONSHIP_EVENTS.HUNTER_MOVED : CHAMPIONSHIP_EVENTS.HUNTER_BLOCKED,
        { direction: command.payload?.direction, position: movement.position }
      )];
      let nextState = movement.state;
      if (movement.reachedEncounter) {
        const species = catalog.entities.find((entry) => entry.speciesId === nextState.hunt.field.encounterSpeciesId);
        nextState = {
          ...nextState,
          hunt: { ...nextState.hunt, encounter: createWildEncounter(nextState, species) }
        };
        nextState = transitionPhase(nextState, "WILD_ENCOUNTER");
        events.push(createEventDescriptor(CHAMPIONSHIP_EVENTS.WILD_ENCOUNTER_STARTED, { speciesId: species.speciesId }));
      }
      return { nextState, events, result: result(movement.moved ? "HUNTER_MOVED" : "HUNTER_BLOCKED") };
    }
    case CHAMPIONSHIP_COMMANDS.BEGIN_CAPTURE: {
      if (state.session.phase !== "WILD_ENCOUNTER") throw new Error("Capture preparation requires a wild encounter");
      const nextState = transitionPhase(state, "CAPTURE");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.CAPTURE_PREPARED)], result: result("CAPTURE_PREPARED") };
    }
    case CHAMPIONSHIP_COMMANDS.ATTEMPT_CAPTURE: {
      if (state.session.phase !== "CAPTURE") throw new Error("Capture is not active");
      const nextState = resolveCaptureTransaction(state);
      const instanceId = nextState.collection.instanceOrder.at(-1);
      return {
        nextState,
        events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.CAPTURE_COMPLETED, { instanceId })],
        result: result("CAPTURE_COMPLETED", { researchInstanceId: instanceId })
      };
    }
    case CHAMPIONSHIP_COMMANDS.CONTINUE_TO_COLLECTION: {
      if (state.session.phase !== "CAPTURE" || state.collection.instanceOrder.length === 0) throw new Error("A completed research capture is required");
      const nextState = transitionPhase(state, "COLLECTION");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.COLLECTION_OPENED)], result: result("COLLECTION_OPENED") };
    }
    case CHAMPIONSHIP_COMMANDS.OPEN_SHOP: {
      if (state.session.phase !== "COLLECTION") throw new Error("Shop can only open from COLLECTION");
      const nextState = transitionPhase(state, "SHOP");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.SHOP_OPENED)], result: result("SHOP_OPENED") };
    }
    case CHAMPIONSHIP_COMMANDS.PURCHASE_RESEARCH_ITEM: {
      if (state.session.phase !== "SHOP") throw new Error("Research shop is not active");
      const record = catalog.shopRecords.find((entry) => entry.shopRecordId === command.payload?.shopRecordId);
      const nextState = resolveShopTransaction(state, record);
      return {
        nextState,
        events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.RESEARCH_PURCHASED, { shopRecordId: record.shopRecordId })],
        result: result("RESEARCH_PURCHASED")
      };
    }
    case CHAMPIONSHIP_COMMANDS.LEAVE_SHOP: {
      if (state.session.phase !== "SHOP") throw new Error("Research shop is not active");
      const nextState = transitionPhase(state, "ARENA");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.ARENA_OPENED)], result: result("ARENA_OPENED") };
    }
    case CHAMPIONSHIP_COMMANDS.ENTER_ARENA: {
      if (state.session.phase !== "ARENA") throw new Error("Arena is not active");
      const match = catalog.titleMatches.find((entry) => entry.matchId === command.payload?.matchId);
      const nextState = createArenaMatch(state, match);
      return { nextState, events: [], result: result("ARENA_MATCH_SELECTED") };
    }
    case CHAMPIONSHIP_COMMANDS.START_BATTLE: {
      if (state.session.phase !== "ARENA" || !state.arena.match) throw new Error("Select an Arena match first");
      const battleSession = createResearchBattle(state, catalog);
      let nextState = { ...state, arena: { ...state.arena, battleSession } };
      nextState = transitionPhase(nextState, "BATTLE");
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.BATTLE_STARTED)], result: result("BATTLE_STARTED") };
    }
    case CHAMPIONSHIP_COMMANDS.RESOLVE_BATTLE_TURN: {
      if (state.session.phase !== "BATTLE") throw new Error("Battle is not active");
      const battleSession = resolveResearchTurn(state.arena.battleSession, command.payload?.actionId, catalog);
      let nextState = { ...state, arena: { ...state.arena, battleSession } };
      const events = [createEventDescriptor(CHAMPIONSHIP_EVENTS.BATTLE_TURN_RESOLVED, {
        round: battleSession.round,
        playerHp: battleSession.player.hp,
        opponentHp: battleSession.opponent.hp
      })];
      if (battleSession.status !== "ACTIVE") {
        const battleResult = buildResearchBattleResult(battleSession);
        nextState = { ...nextState, arena: { ...nextState.arena, battleResult } };
        nextState = transitionPhase(nextState, "BATTLE_RESULT");
        events.push(createEventDescriptor(CHAMPIONSHIP_EVENTS.BATTLE_COMPLETED, { outcome: battleResult.outcome }));
      }
      return { nextState, events, result: result("BATTLE_TURN_RESOLVED") };
    }
    case CHAMPIONSHIP_COMMANDS.ACCEPT_BATTLE_RESULT: {
      if (state.session.phase !== "BATTLE_RESULT" || !state.arena.battleResult) throw new Error("Battle result is unavailable");
      let nextState = transitionPhase(state, "COMPLETE");
      const completion = {
        authority: "RESEARCH_FIXTURE",
        outcome: state.arena.battleResult.outcome,
        rankWrite: false,
        badgeWrite: false,
        committable: false,
        persistenceAttempted: false
      };
      nextState = { ...nextState, results: [...nextState.results, completion] };
      return { nextState, events: [createEventDescriptor(CHAMPIONSHIP_EVENTS.RESEARCH_COMPLETED)], result: result("RESEARCH_COMPLETED") };
    }
    default:
      throw new Error(`Unhandled Championship command: ${command.type}`);
  }
}
