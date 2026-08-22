import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  CHAMPIONSHIP_COMMANDS,
  createChampionshipResearchRuntime,
  createDeterministicClock,
  stableDigest
} from "../../src/championship/index.js";
import { createCanonicalCatalogAdapter } from "../../src/championship/adapters/createCanonicalCatalogAdapter.js";
import { createNexusProfileReadAdapter } from "../../src/championship/adapters/createNexusProfileReadAdapter.js";

const catalog = JSON.parse(fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-content.json", import.meta.url), "utf8"));
const profile = JSON.parse(fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-profile.json", import.meta.url), "utf8"));

function createRuntime({ seed = 0x43485231, clockStart = 100, profileSource = profile } = {}) {
  return createChampionshipResearchRuntime({
    profilePort: createNexusProfileReadAdapter(() => profileSource),
    catalogPort: createCanonicalCatalogAdapter(catalog),
    clockPort: createDeterministicClock(clockStart),
    seed
  });
}

function playFullFlow(presentationMode = "60hz", { profileSource = profile } = {}) {
  const runtime = createRuntime({ profileSource });
  let commandSequence = 0;
  let lastPublication = null;
  const dispatch = (type, payload = {}) => {
    lastPublication = runtime.dispatch({
      commandId: `${presentationMode}-${++commandSequence}`,
      type,
      expectedRevision: runtime.getSnapshot().revision,
      payload
    });
    assert.equal(lastPublication.accepted, true, lastPublication.result.message);
    return lastPublication;
  };

  dispatch(CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE);
  dispatch(CHAMPIONSHIP_COMMANDS.SELECT_GATE, { gateId: catalog.gates[0].gateId });
  for (const direction of ["down", ...Array(9).fill("right"), "up", "up"]) {
    dispatch(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction });
  }
  dispatch(CHAMPIONSHIP_COMMANDS.BEGIN_CAPTURE);
  dispatch(CHAMPIONSHIP_COMMANDS.ATTEMPT_CAPTURE);
  dispatch(CHAMPIONSHIP_COMMANDS.CONTINUE_TO_COLLECTION);
  dispatch(CHAMPIONSHIP_COMMANDS.OPEN_SHOP);
  dispatch(CHAMPIONSHIP_COMMANDS.PURCHASE_RESEARCH_ITEM, { shopRecordId: catalog.shopRecords[0].shopRecordId });
  dispatch(CHAMPIONSHIP_COMMANDS.LEAVE_SHOP);
  dispatch(CHAMPIONSHIP_COMMANDS.ENTER_ARENA, { matchId: catalog.titleMatches[0].matchId });
  dispatch(CHAMPIONSHIP_COMMANDS.START_BATTLE);
  while (runtime.getSnapshot().session.phase === "BATTLE") {
    dispatch(CHAMPIONSHIP_COMMANDS.RESOLVE_BATTLE_TURN, { actionId: catalog.actions[0].actionId });
  }
  dispatch(CHAMPIONSHIP_COMMANDS.ACCEPT_BATTLE_RESULT);
  return { runtime, snapshot: runtime.getSnapshot(), publication: lastPublication };
}

test("R1 complete vertical slice reaches a nonpersistent completion", () => {
  const { runtime, snapshot, publication } = playFullFlow();
  assert.equal(snapshot.session.phase, "COMPLETE");
  assert.equal(snapshot.revision, 27);
  assert.equal(snapshot.economy.source, "RESEARCH_FIXTURE");
  assert.equal(snapshot.economy.wallet, 100);
  assert.equal(snapshot.collection.instanceOrder.length, 1);
  const instance = snapshot.collection.instancesById[snapshot.collection.instanceOrder[0]];
  assert.equal(instance.playerOwned, false);
  assert.equal(instance.relationshipAuthority, "NONE");
  assert.deepEqual(snapshot.database.seenSpeciesIds, ["nexus:creature:blazetail-kit"]);
  assert.equal(snapshot.arena.battleResult.outcome, "PLAYER_WIN");
  assert.equal(snapshot.arena.battleResult.rounds, 4);
  assert.equal(snapshot.results[0].committable, false);
  assert.equal(snapshot.results[0].persistenceAttempted, false);
  assert.equal(publication.result.playerStatePatch, null);
  assert.equal(publication.result.sessionEventDigest, "fnv1a32:92e19b47");
  assert.equal(stableDigest(snapshot), "fnv1a32:9f018910");
  assert.equal(snapshot.eventLog.length, 28);
  runtime.dispose();
});

test("Hunt golden vector enforces bounds, obstacle collision, and encounter trigger", () => {
  const runtime = createRuntime({ seed: 7, clockStart: 0 });
  let sequence = 0;
  const send = (type, payload = {}) => runtime.dispatch({
    commandId: `hunt-golden-${++sequence}`,
    type,
    expectedRevision: runtime.getSnapshot().revision,
    payload
  });
  send(CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE);
  send(CHAMPIONSHIP_COMMANDS.SELECT_GATE, { gateId: catalog.gates[0].gateId });
  send(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "right" });
  send(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "right" });
  const blocked = send(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "right" });
  assert.equal(blocked.accepted, true);
  assert.deepEqual(runtime.getSnapshot().hunt.hunterPosition, { x: 3, y: 4 });
  assert.deepEqual(runtime.getSnapshot().hunt.lastCollision, { direction: "right", candidate: { x: 4, y: 4 } });
  assert.equal(blocked.events[0].type, "HUNTER_BLOCKED");
  runtime.dispose();

  const completed = playFullFlow("hunt-golden-path");
  assert.deepEqual(completed.snapshot.hunt.hunterPosition, { x: 10, y: 3 });
  assert.equal(completed.snapshot.hunt.encounter.status, "CAPTURED_RESEARCH_ONLY");
  completed.runtime.dispose();
});

test("Battle golden vector is deterministic and explicitly non-parity", () => {
  const { runtime, snapshot } = playFullFlow("battle-golden");
  assert.equal(snapshot.arena.battleSession.authority, "NEXUS_ADAPTATION");
  assert.equal(snapshot.arena.battleSession.parityStatus, "RESEARCH_NON_PARITY");
  assert.deepEqual(snapshot.arena.battleSession.timeline, [
    { round: 1, actor: "PLAYER", actionId: "nexus:championship:action:comet-pounce", damage: 18, targetHp: 40 },
    { round: 1, actor: "OPPONENT", actionId: "nexus:championship:action:tide-arc", damage: 14, targetHp: 58 },
    { round: 2, actor: "PLAYER", actionId: "nexus:championship:action:comet-pounce", damage: 18, targetHp: 22 },
    { round: 2, actor: "OPPONENT", actionId: "nexus:championship:action:tide-arc", damage: 14, targetHp: 44 },
    { round: 3, actor: "PLAYER", actionId: "nexus:championship:action:comet-pounce", damage: 18, targetHp: 4 },
    { round: 3, actor: "OPPONENT", actionId: "nexus:championship:action:tide-arc", damage: 14, targetHp: 30 },
    { round: 4, actor: "PLAYER", actionId: "nexus:championship:action:comet-pounce", damage: 18, targetHp: 0 }
  ]);
  runtime.dispose();
});

test("30/60/120 Hz and paused presentation labels cannot alter gameplay state", () => {
  const modes = ["30hz", "60hz", "120hz", "paused"];
  const runs = modes.map((mode) => playFullFlow(mode));
  const digests = runs.map(({ snapshot }) => stableDigest(snapshot));
  assert.equal(new Set(digests).size, 1);
  assert.deepEqual(runs.map(({ publication }) => publication.result.sessionEventDigest), Array(4).fill("fnv1a32:92e19b47"));
  runs.forEach(({ runtime }) => runtime.dispose());
});

test("profile projection is whitelisted, deeply frozen, and rejects accessors", () => {
  const protectedSource = {
    activeCompanionId: "greyshade-cat",
    unlockedCompanionIds: ["greyshade-cat", "greyshade-cat"],
    settings: { locale: "zh-TW", reducedMotion: true, analyticsConsent: true },
    wallet: 999999,
    inventory: { productionItem: 7 },
    progression: { titleRank: 99 },
    relationship: { bond: 100 },
    emotionalMemory: [{ id: "must-not-project" }],
    raphael: { authority: "must-not-project" }
  };
  const projection = createNexusProfileReadAdapter(() => protectedSource).read();
  assert.deepEqual(Object.keys(projection).sort(), [
    "activeCompanionId", "locale", "presentationRefs", "reducedMotion", "sourceDigest", "unlockedCompanionIds"
  ]);
  assert.deepEqual(projection.unlockedCompanionIds, ["greyshade-cat"]);
  assert.equal(projection.locale, "zh-TW");
  assert.equal(projection.reducedMotion, true);
  assert.equal(Object.isFrozen(projection), true);
  assert.equal(Object.isFrozen(projection.unlockedCompanionIds), true);
  assert.equal(Object.isFrozen(projection.presentationRefs), true);
  assert.equal("wallet" in projection, false);
  assert.equal("relationship" in projection, false);
  assert.throws(() => {
    const accessorSource = {};
    Object.defineProperty(accessorSource, "activeCompanionId", { enumerable: true, get: () => "greyshade-cat" });
    createNexusProfileReadAdapter(() => accessorSource).read();
  }, /rejects accessor/);
});

test("locale and reduced-motion projection cannot alter the deterministic gameplay event vector", () => {
  const variants = [
    { locale: "en", reducedMotion: false },
    { locale: "zh-TW", reducedMotion: false },
    { locale: "en", reducedMotion: true },
    { locale: "ja", reducedMotion: true }
  ];
  const runs = variants.map((settings, index) => playFullFlow(`profile-variant-${index}`, {
    profileSource: { ...profile, settings }
  }));
  assert.deepEqual(
    runs.map(({ publication }) => publication.result.sessionEventDigest),
    Array(variants.length).fill("fnv1a32:92e19b47")
  );
  assert.equal(new Set(runs.map(({ snapshot }) => stableDigest(snapshot.arena.battleSession.timeline))).size, 1);
  runs.forEach(({ runtime }) => runtime.dispose());
});
