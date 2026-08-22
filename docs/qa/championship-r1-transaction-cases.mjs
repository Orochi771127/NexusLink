import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { CHAMPIONSHIP_COMMANDS, createChampionshipResearchRuntime, createDeterministicClock, createResearchResultEnvelope, stableDigest } from "../../src/championship/index.js";
import { createCanonicalCatalogAdapter } from "../../src/championship/adapters/createCanonicalCatalogAdapter.js";
import { createNexusProfileReadAdapter } from "../../src/championship/adapters/createNexusProfileReadAdapter.js";
import { assertTransitionResult } from "../../src/championship/core/invariants.js";
import { CHAMPIONSHIP_SESSION_LIMITS } from "../../src/championship/core/createChampionshipResearchStore.js";
import { runAtomicChampionshipTransition } from "../../src/championship/core/transaction.js";

const catalog = JSON.parse(fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-content.json", import.meta.url), "utf8"));
const profile = JSON.parse(fs.readFileSync(new URL("../../src/data/championship/fixtures/championship-r1-profile.json", import.meta.url), "utf8"));

function runtime() {
  return createChampionshipResearchRuntime({
    profilePort: createNexusProfileReadAdapter(() => profile),
    catalogPort: createCanonicalCatalogAdapter(catalog),
    clockPort: createDeterministicClock(),
    seed: 19
  });
}

test("stale, duplicate, malformed, and wrong-phase commands reject without state mutation", () => {
  const research = runtime();
  const initialDigest = stableDigest(research.getSnapshot());
  const accepted = research.dispatch({ commandId: "transaction-001", type: CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE, expectedRevision: 0, payload: {} });
  assert.equal(accepted.accepted, true);
  const acceptedDigest = stableDigest(research.getSnapshot());
  const rejected = [
    research.dispatch({ commandId: "transaction-001", type: CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE, expectedRevision: 1, payload: {} }),
    research.dispatch({ commandId: "transaction-002", type: CHAMPIONSHIP_COMMANDS.SELECT_GATE, expectedRevision: 0, payload: { gateId: catalog.gates[0].gateId } }),
    research.dispatch({ commandId: "x", type: CHAMPIONSHIP_COMMANDS.SELECT_GATE, expectedRevision: 1, payload: {} }),
    research.dispatch({ commandId: "transaction-004", type: CHAMPIONSHIP_COMMANDS.START_BATTLE, expectedRevision: 1, payload: {} })
  ];
  assert.notEqual(initialDigest, acceptedDigest);
  assert.deepEqual(rejected.map((entry) => entry.accepted), [false, false, false, false]);
  assert.deepEqual(rejected.map((entry) => entry.result.code), [
    "CHAMPIONSHIP_DUPLICATE_COMMAND",
    "CHAMPIONSHIP_STALE_REVISION",
    "CHAMPIONSHIP_INVALID_COMMAND",
    "CHAMPIONSHIP_TRANSACTION_REJECTED"
  ]);
  assert.equal(stableDigest(research.getSnapshot()), acceptedDigest);
  research.dispose();
});

test("atomic transition rolls back a reducer failure", () => {
  const research = runtime();
  const state = research.getSnapshot();
  const before = stableDigest(state);
  const output = runAtomicChampionshipTransition(
    state,
    { commandId: "rollback-001", type: CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE, expectedRevision: 0, payload: {} },
    () => { throw new Error("synthetic failure"); },
    { catalog }
  );
  assert.equal(output.accepted, false);
  assert.equal(output.nextState, state);
  assert.equal(stableDigest(state), before);
  assert.equal(output.result.playerStatePatch, null);
  assert.equal(output.result.persistenceAttempted, false);
  research.dispose();
});

test("research result envelope cannot become a root save patch", () => {
  const envelope = createResearchResultEnvelope({ accepted: true, code: "TEST", playerStatePatch: { wallet: 999 }, persistenceAttempted: true });
  assert.equal(envelope.committable, false);
  assert.equal(envelope.playerStatePatch, null);
  assert.equal(envelope.persistenceAttempted, false);
  assert.doesNotThrow(() => assertTransitionResult(envelope));
  assert.throws(() => assertTransitionResult({ ...envelope, playerStatePatch: {} }), /player-state patch/);
  assert.throws(() => assertTransitionResult({ ...envelope, saveCommand: "write" }), /Forbidden result field/);
});

test("dispose is idempotent and rejects future work without persistence", () => {
  const research = runtime();
  research.dispose();
  research.dispose();
  const rejected = research.dispatch({ commandId: "disposed-001", type: CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE, expectedRevision: 0, payload: {} });
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.result.code, "CHAMPIONSHIP_DISPOSED");
  assert.equal(rejected.result.persistenceAttempted, false);
});

test("prototype-bearing commands reject without inheriting hidden payload authority", () => {
  const research = runtime();
  const accepted = research.dispatch({ commandId: "prototype-setup", type: CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE, expectedRevision: 0, payload: {} });
  assert.equal(accepted.accepted, true);
  const poisonedPayload = {};
  Object.defineProperty(poisonedPayload, "__proto__", { enumerable: true, value: { gateId: catalog.gates[0].gateId } });
  const rejected = research.dispatch({ commandId: "prototype-poison", type: CHAMPIONSHIP_COMMANDS.SELECT_GATE, expectedRevision: 1, payload: poisonedPayload });
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.result.code, "CHAMPIONSHIP_INVALID_COMMAND");
  assert.equal(research.getSnapshot().session.phase, "GATE_SELECT");
  assert.equal(research.getSnapshot().hunt.gateId, null);
  research.dispose();
});

test("disposable session budgets bound accepted command IDs and event history", () => {
  const research = runtime();
  let commandSequence = 0;
  const send = (type, payload = {}) => research.dispatch({
    commandId: `budget-${++commandSequence}`,
    type,
    expectedRevision: research.getSnapshot().revision,
    payload
  });
  assert.equal(send(CHAMPIONSHIP_COMMANDS.ACCEPT_PROFILE).accepted, true);
  assert.equal(send(CHAMPIONSHIP_COMMANDS.SELECT_GATE, { gateId: catalog.gates[0].gateId }).accepted, true);
  while (research.getSnapshot().revision < CHAMPIONSHIP_SESSION_LIMITS.acceptedCommands) {
    assert.equal(send(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "left" }).accepted, true);
  }
  const before = stableDigest(research.getSnapshot());
  const rejected = send(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction: "left" });
  assert.equal(rejected.accepted, false);
  assert.equal(rejected.result.code, "CHAMPIONSHIP_SESSION_LIMIT");
  assert.equal(stableDigest(research.getSnapshot()), before);
  assert.ok(research.getSnapshot().eventLog.length <= CHAMPIONSHIP_SESSION_LIMITS.eventLogEntries);

  const overlong = research.dispatch({
    commandId: `x${"y".repeat(96)}`,
    type: CHAMPIONSHIP_COMMANDS.MOVE_HUNTER,
    expectedRevision: research.getSnapshot().revision,
    payload: { direction: "left" }
  });
  assert.equal(overlong.accepted, false);
  assert.equal(overlong.result.code, "CHAMPIONSHIP_INVALID_COMMAND");
  research.dispose();
});
