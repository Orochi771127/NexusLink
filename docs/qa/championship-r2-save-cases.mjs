import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import test from "node:test";

import {
  CHAMPIONSHIP_SAVE_PORT_R2_POLICY,
  createChampionshipSaveFailureControllerR2,
  createChampionshipSavePortR2
} from "../../src/championship/kernel/ChampionshipSavePortR2.js";
import { createChampionshipSaveCoordinatorR2 } from "../../src/championship/kernel/ChampionshipSaveCoordinatorR2.js";
import { createNoopChampionshipSavePort } from "../../src/championship/kernel/ChampionshipSavePort.js";
import { createChampionshipR2Session } from "../../src/championship/r2/createChampionshipR2Session.js";
import { createRaisingHomeRuntime } from "../../src/championship/raising/createRaisingHomeRuntime.js";
import {
  RAISING_HOME_ADAPTATION_REF_R2,
  RAISING_HOME_SAVE_KIND_R2,
  captureRaisingHomeSnapshotR2,
  deserializeRaisingHomeSaveR2,
  digestCanonicalRaisingHomeDataR2,
  migrateRaisingHomeSaveV1ToV2,
  projectRaisingHomeDurableStateR2,
  restoreRaisingHomeSnapshotR2,
  serializeCanonicalRaisingHomeDataR2,
  serializeRaisingHomeSaveR2
} from "../../src/championship/raising/raisingHomePersistenceR2.js";
import {
  RAISING_HOME_COMMANDS,
  RAISING_HOME_FIELD,
  createRaisingHomeInitialState
} from "../../src/championship/raising/raisingHomeDefinition.js";

function advance(runtime, commandId) {
  return runtime.dispatch({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId,
    expectedRevision: runtime.getSnapshot().revision
  });
}

function write(port, slotId, requestId, expectedRevision, snapshot) {
  return port.requestWrite({ requestId, expectedRevision, slotId, snapshot });
}

function createV1Document(snapshot, revision = 3) {
  const payloadV2 = projectRaisingHomeDurableStateR2(snapshot);
  const { paused, ...payload } = structuredClone(payloadV2);
  assert.equal(typeof paused, "boolean");
  return {
    schemaVersion: 1,
    saveKind: RAISING_HOME_SAVE_KIND_R2,
    revision,
    payload
  };
}

test("v2 save schema serializes only minimal authoritative Raising data", () => {
  const snapshot = createRaisingHomeInitialState({ sessionId: "save-minimal-schema" });
  const encoded = serializeRaisingHomeSaveR2(snapshot, { revision: 7 });
  assert.equal(encoded.document.schemaVersion, 2);
  assert.equal(encoded.document.adaptationRef, RAISING_HOME_ADAPTATION_REF_R2);
  assert.equal(encoded.document.revision, 7);
  assert.deepEqual(Object.keys(encoded.document.payload).sort(), [
    "caretakerPosition", "clockMinutes", "paused", "residents",
    "selectedResidentId", "stateRevision", "tick"
  ]);
  assert.doesNotMatch(encoded.serialized, /sessionId|eventLog|feedback|obstacles|zones|fieldId|diagnostics|callback|timer/i);
});

test("canonical serialization ignores insertion order and uses domain-separated SHA-256", () => {
  const left = { z: 3, a: { y: 2, x: 1 } };
  const right = { a: { x: 1, y: 2 }, z: 3 };
  assert.equal(serializeCanonicalRaisingHomeDataR2(left), serializeCanonicalRaisingHomeDataR2(right));
  assert.equal(digestCanonicalRaisingHomeDataR2(left, "order-proof"), digestCanonicalRaisingHomeDataR2(right, "order-proof"));
  assert.notEqual(digestCanonicalRaisingHomeDataR2(left, "order-proof"), digestCanonicalRaisingHomeDataR2(left, "other-domain"));
  assert.notEqual(digestCanonicalRaisingHomeDataR2(left, "order-proof"), digestCanonicalRaisingHomeDataR2({ ...left, z: 4 }, "order-proof"));

  const input = "championship-r2:sha-proof\u0000moonlake-月湖";
  const expected = crypto.createHash("sha256").update(input).digest("hex");
  assert.equal(digestCanonicalRaisingHomeDataR2("moonlake-月湖", "sha-proof"), `championship-r2:sha-proof:sha256:${expected}`);
});

test("v2 serialization has deterministic round-trip bytes and digest", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "round-trip-save" });
  assert.equal(advance(runtime, "round-trip:advance:1").accepted, true);
  const first = serializeRaisingHomeSaveR2(runtime.getSnapshot(), { revision: 1 });
  const decoded = deserializeRaisingHomeSaveR2(first.serialized);
  assert.equal(decoded.serialized, first.serialized);
  assert.equal(decoded.digest, first.digest);
  const restored = restoreRaisingHomeSnapshotR2(decoded.document, { sessionId: "round-trip-remount" });
  const second = serializeRaisingHomeSaveR2(restored, { revision: 1 });
  assert.equal(second.serialized, first.serialized);
  assert.equal(second.digest, first.digest);
  assert.equal(restored.sessionId, "round-trip-remount");
  assert.deepEqual(restored.field, RAISING_HOME_FIELD);
  assert.deepEqual(restored.eventLog, []);
  assert.match(restored.feedback, /restored/i);
});

test("pure v1 to v2 migration adds adaptationRef and paused without mutating frozen input", () => {
  const v1 = createV1Document(createRaisingHomeInitialState({ sessionId: "migration-v1" }), 4);
  const before = structuredClone(v1);
  Object.freeze(v1.payload.residents);
  Object.freeze(v1.payload);
  Object.freeze(v1);
  const migrated = migrateRaisingHomeSaveV1ToV2(v1);
  assert.deepEqual(v1, before);
  assert.equal(migrated.schemaVersion, 2);
  assert.equal(migrated.adaptationRef, RAISING_HOME_ADAPTATION_REF_R2);
  assert.equal(migrated.payload.paused, false);
  assert.equal(Object.isFrozen(migrated), true);
  const decoded = deserializeRaisingHomeSaveR2(JSON.stringify(before));
  assert.equal(decoded.migratedFrom, 1);
  assert.equal(decoded.serialized, serializeCanonicalRaisingHomeDataR2(migrated));
});

test("exact schema rejects extras, forbidden recursive keys, unsafe numbers, and shared references", () => {
  const initial = structuredClone(createRaisingHomeInitialState({ sessionId: "hostile-schema" }));
  assert.throws(() => captureRaisingHomeSnapshotR2({ ...initial, extra: true }), /fields are not exact/);
  const dangerous = structuredClone(initial);
  dangerous.residents[0].poison = JSON.parse('{"constructor":{"prototype":{"owned":true}}}');
  assert.throws(() => captureRaisingHomeSnapshotR2(dangerous), /forbidden key/);
  const unsafe = structuredClone(initial);
  unsafe.residents[0].energy = -0;
  assert.throws(() => captureRaisingHomeSnapshotR2(unsafe), /other than -0/);
  unsafe.residents[0].energy = Number.NaN;
  assert.throws(() => captureRaisingHomeSnapshotR2(unsafe), /finite number/);
  const shared = structuredClone(initial);
  shared.residents[0].position = shared.caretakerPosition;
  assert.throws(() => captureRaisingHomeSnapshotR2(shared), /shared object reference/);
});

test("descriptor-safe validation never invokes hostile getters and fails closed on proxy traps", () => {
  const initial = structuredClone(createRaisingHomeInitialState({ sessionId: "hostile-descriptor" }));
  let getterCalls = 0;
  Object.defineProperty(initial, "feedback", {
    enumerable: true,
    get() {
      getterCalls += 1;
      return "should not run";
    }
  });
  assert.throws(() => captureRaisingHomeSnapshotR2(initial), /data property/);
  assert.equal(getterCalls, 0);

  const proxy = new Proxy(createRaisingHomeInitialState({ sessionId: "hostile-proxy" }), {
    ownKeys() {
      throw new Error("proxy ownKeys trap");
    }
  });
  assert.throws(() => captureRaisingHomeSnapshotR2(proxy), /not safely inspectable/);
});

test("bounded validation rejects sparse arrays, cycles, depth bombs, and oversized digest strings", () => {
  const sparse = structuredClone(createRaisingHomeInitialState({ sessionId: "hostile-sparse" }));
  delete sparse.residents[1];
  assert.throws(() => captureRaisingHomeSnapshotR2(sparse), /dense array/);
  const cycle = {};
  cycle.self = cycle;
  assert.throws(() => serializeCanonicalRaisingHomeDataR2(cycle), /cycle or shared/);
  let deep = { value: true };
  for (let index = 0; index < 24; index += 1) deep = { next: deep };
  assert.throws(() => serializeCanonicalRaisingHomeDataR2(deep), /depth budget/);
  assert.throws(() => digestCanonicalRaisingHomeDataR2("x".repeat(262145), "too-large"), /byte budget/);
});

test("runtime rejects an invalid restored snapshot before exposing state", () => {
  const hostile = structuredClone(createRaisingHomeInitialState({ sessionId: "runtime-invalid-restore" }));
  hostile.field.width = 999;
  assert.throws(() => createRaisingHomeRuntime({ initialSnapshot: hostile }), /current R2 field/);
  let getterCalls = 0;
  const options = {};
  Object.defineProperty(options, "initialSnapshot", {
    get() {
      getterCalls += 1;
      return hostile;
    }
  });
  assert.throws(() => createRaisingHomeRuntime(options), /own data property/);
  assert.equal(getterCalls, 0);
});

test("port revision conflict is fail-closed and leaves current data atomic", () => {
  const port = createChampionshipSavePortR2();
  const snapshot = createRaisingHomeInitialState({ sessionId: "port-revision" });
  const saved = write(port, "revision-slot", "revision:save:1", 0, snapshot);
  assert.equal(saved.accepted, true);
  const staleSnapshot = structuredClone(snapshot);
  staleSnapshot.revision = 1;
  const stale = write(port, "revision-slot", "revision:save:2", 0, staleSnapshot);
  assert.equal(stale.accepted, false);
  assert.equal(stale.code, "CHAMPIONSHIP_R2_SAVE_REVISION_CONFLICT");
  const read = port.readSnapshot({ slotId: "revision-slot" });
  assert.equal(read.accepted, true);
  assert.equal(read.revision, 1);
  assert.equal(read.document.payload.stateRevision, 0);
  assert.equal(port.inspect({ slotId: "revision-slot" }).selectedSlot.hasLastGood, false);
});

test("successful request IDs replay idempotently and reject payload reuse conflicts", () => {
  const port = createChampionshipSavePortR2();
  const snapshot = createRaisingHomeInitialState({ sessionId: "port-idempotency" });
  const first = write(port, "idempotent-slot", "idempotent:save:1", 0, snapshot);
  const replay = write(port, "idempotent-slot", "idempotent:save:1", 0, snapshot);
  assert.equal(first.accepted, true);
  assert.equal(replay.accepted, true);
  assert.equal(replay.idempotentReplay, true);
  assert.equal(replay.revision, 1);
  const changed = structuredClone(snapshot);
  changed.revision = 1;
  changed.tick = 1;
  const conflict = write(port, "idempotent-slot", "idempotent:save:1", 0, changed);
  assert.equal(conflict.accepted, false);
  assert.equal(conflict.code, "CHAMPIONSHIP_R2_SAVE_IDEMPOTENCY_CONFLICT");
  assert.equal(port.inspect().memoryCommits, 1);
});

test("injected and quota failures happen before slot swap or idempotency commit", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const snapshot = createRaisingHomeInitialState({ sessionId: "port-failure-atomic" });
  failures.failNextWrite("CHAMPIONSHIP_R2_SAVE_TEST_FAILURE");
  const injected = write(port, "atomic-slot", "atomic:save:1", 0, snapshot);
  assert.equal(injected.accepted, false);
  assert.equal(injected.code, "CHAMPIONSHIP_R2_SAVE_TEST_FAILURE");
  assert.equal(port.inspect().slotCount, 0);
  assert.equal(port.readSnapshot({ slotId: "atomic-slot" }).code, "CHAMPIONSHIP_R2_SAVE_EMPTY");

  failures.setQuotaBytes(1);
  const quota = write(port, "atomic-slot", "atomic:save:1", 0, snapshot);
  assert.equal(quota.accepted, false);
  assert.equal(quota.code, "CHAMPIONSHIP_R2_SAVE_QUOTA_EXCEEDED");
  assert.equal(port.inspect().slotCount, 0);
  failures.setQuotaBytes(262144);
  const retried = write(port, "atomic-slot", "atomic:save:1", 0, snapshot);
  assert.equal(retried.accepted, true, "a failed attempt must not consume the idempotency key");
  assert.equal(retried.revision, 1);
  assert.throws(() => failures.failNextWrite("CHAMPIONSHIP_R2_SAVE_OK"), /failure code is invalid/i);
});

test("failed overwrite preserves current and last-good records byte-for-byte", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const firstRuntime = createRaisingHomeRuntime({ sessionId: "port-preserve" });
  const first = write(port, "preserve-slot", "preserve:save:1", 0, firstRuntime.getSnapshot());
  assert.equal(first.accepted, true);
  advance(firstRuntime, "preserve:advance:1");
  const second = write(port, "preserve-slot", "preserve:save:2", 1, firstRuntime.getSnapshot());
  assert.equal(second.accepted, true);
  const before = port.exportRecovery({ slotId: "preserve-slot" });
  failures.failNextWrite();
  advance(firstRuntime, "preserve:advance:2");
  const failed = write(port, "preserve-slot", "preserve:save:3", 2, firstRuntime.getSnapshot());
  assert.equal(failed.accepted, false);
  const after = port.exportRecovery({ slotId: "preserve-slot" });
  assert.equal(after.serialized, before.serialized);
  assert.equal(after.digest, before.digest);
  assert.equal(port.inspect({ slotId: "preserve-slot" }).selectedSlot.revision, 2);
});

test("corrupt current data recovers the verified last-good snapshot", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const runtime = createRaisingHomeRuntime({ sessionId: "last-good" });
  advance(runtime, "last-good:advance:1");
  const revisionOne = runtime.getSnapshot().revision;
  assert.equal(write(port, "last-good-slot", "last-good:save:1", 0, runtime.getSnapshot()).accepted, true);
  advance(runtime, "last-good:advance:2");
  assert.equal(write(port, "last-good-slot", "last-good:save:2", 1, runtime.getSnapshot()).accepted, true);
  failures.corruptPrimaryOnNextRead("last-good-slot");
  const recovered = port.readSnapshot({ slotId: "last-good-slot" });
  assert.equal(recovered.accepted, true);
  assert.equal(recovered.code, "CHAMPIONSHIP_R2_SAVE_RECOVERED_LAST_GOOD");
  assert.equal(recovered.source, "LAST_GOOD");
  assert.equal(recovered.document.payload.stateRevision, revisionOne);
  assert.equal(port.inspect({ slotId: "last-good-slot" }).selectedSlot.currentVerified, false);
  assert.equal(port.inspect({ slotId: "last-good-slot" }).selectedSlot.lastGoodVerified, true);
});

test("port recovery export selects latest verified current then verified backup", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const runtime = createRaisingHomeRuntime({ sessionId: "port-export" });
  const first = write(port, "export-slot", "export:save:1", 0, runtime.getSnapshot());
  const currentExport = port.exportRecovery({ slotId: "export-slot" });
  assert.equal(currentExport.accepted, true);
  assert.equal(currentExport.source, "CURRENT");
  assert.equal(currentExport.digest, first.digest);
  advance(runtime, "export:advance:1");
  write(port, "export-slot", "export:save:2", 1, runtime.getSnapshot());
  failures.corruptPrimaryOnNextRead("export-slot");
  assert.equal(port.readSnapshot({ slotId: "export-slot" }).source, "LAST_GOOD");
  const backupExport = port.exportRecovery({ slotId: "export-slot" });
  assert.equal(backupExport.source, "LAST_GOOD");
  assert.equal(backupExport.digest, first.digest);
  assert.equal(deserializeRaisingHomeSaveR2(backupExport.serialized).digest, backupExport.digest);
});

test("coordinator marks exact state dirty, reports failure honestly, and retries", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const coordinator = createChampionshipSaveCoordinatorR2({
    sessionId: "coordinator-retry",
    slotId: "coordinator-slot",
    savePort: port
  });
  assert.equal(coordinator.getSaveStatus().dirty, true);
  assert.equal(coordinator.save().accepted, true);
  assert.equal(coordinator.getSaveStatus().dirty, false);
  assert.equal(advance({
    getSnapshot: coordinator.getRaisingHomeSnapshot,
    dispatch: coordinator.dispatchRaisingHome
  }, "coordinator:advance:1").accepted, true);
  assert.equal(coordinator.getSaveStatus().dirty, true);
  failures.failNextWrite();
  const failed = coordinator.save();
  assert.equal(failed.accepted, false);
  assert.doesNotMatch(failed.code, /_OK$/);
  assert.equal(coordinator.getSaveStatus().phase, "SAVE_FAILED");
  assert.equal(coordinator.getSaveStatus().canRetry, true);
  const retried = coordinator.retry();
  assert.equal(retried.accepted, true);
  assert.equal(retried.exactStateSaved, true);
  assert.equal(coordinator.getSaveStatus().dirty, false);
  coordinator.dispose();
});

test("dirty recovery export is canonical, verified, and never labelled committed", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const coordinator = createChampionshipSaveCoordinatorR2({
    sessionId: "coordinator-export",
    slotId: "coordinator-export-slot",
    savePort: port
  });
  failures.setQuotaBytes(1);
  assert.equal(coordinator.save().accepted, false);
  const recovery = coordinator.exportRecovery();
  assert.equal(recovery.accepted, true);
  assert.equal(recovery.source, "PENDING_DIRTY");
  assert.equal(recovery.committed, false);
  assert.equal(recovery.dirty, true);
  const decoded = deserializeRaisingHomeSaveR2(recovery.serialized);
  assert.equal(decoded.digest, recovery.digest);
  assert.equal(decoded.serialized, recovery.serialized);
  assert.equal(port.inspect().memoryCommits, 0);
  coordinator.dispose();
});

test("dirty clears only when the exact failed state is retried", () => {
  const failures = createChampionshipSaveFailureControllerR2();
  const port = createChampionshipSavePortR2({ failureController: failures });
  const coordinator = createChampionshipSaveCoordinatorR2({
    sessionId: "coordinator-exact-retry",
    slotId: "exact-retry-slot",
    savePort: port
  });
  failures.failNextWrite();
  assert.equal(coordinator.save().accepted, false);
  const runtimeFacade = {
    getSnapshot: coordinator.getRaisingHomeSnapshot,
    dispatch: coordinator.dispatchRaisingHome
  };
  assert.equal(advance(runtimeFacade, "exact-retry:advance:1").accepted, true);
  const retriedOlderState = coordinator.retry();
  assert.equal(retriedOlderState.accepted, true);
  assert.equal(retriedOlderState.exactStateSaved, false);
  assert.equal(coordinator.getSaveStatus().dirty, true);
  assert.equal(coordinator.save().exactStateSaved, true);
  assert.equal(coordinator.getSaveStatus().dirty, false);
  coordinator.dispose();
});

test("concurrent coordinators use unique writer tokens and reach revision conflict semantics", () => {
  const port = createChampionshipSavePortR2();
  const first = createChampionshipSaveCoordinatorR2({
    sessionId: "concurrent-writer-first",
    slotId: "concurrent-writer-slot",
    savePort: port
  });
  const second = createChampionshipSaveCoordinatorR2({
    sessionId: "concurrent-writer-second",
    slotId: "concurrent-writer-slot",
    savePort: port
  });
  advance({ getSnapshot: first.getRaisingHomeSnapshot, dispatch: first.dispatchRaisingHome }, "writer:first:advance");
  advance({ getSnapshot: second.getRaisingHomeSnapshot, dispatch: second.dispatchRaisingHome }, "writer:second:advance");
  assert.equal(first.save().accepted, true);
  const stale = second.save();
  assert.equal(stale.accepted, false);
  assert.equal(stale.code, "CHAMPIONSHIP_R2_SAVE_REVISION_CONFLICT");
  assert.equal(stale.canRetry, false);
  assert.equal(second.getSaveStatus().canRetry, false);
  assert.equal(second.retry().code, "CHAMPIONSHIP_R2_SAVE_RETRY_UNAVAILABLE");
  assert.equal(port.inspect().writerTokensIssued, 2);
  first.dispose();
  second.dispose();
});

test("20 action-save-dispose-remount cycles restore Raising state in one realm", () => {
  const port = createChampionshipSavePortR2();
  const slotId = "lifecycle-20-slot";
  for (let index = 0; index < 20; index += 1) {
    const coordinator = createChampionshipSaveCoordinatorR2({
      sessionId: `lifecycle-remount-${index}`,
      slotId,
      savePort: port
    });
    assert.equal(coordinator.getRaisingHomeSnapshot().revision, index);
    assert.equal(coordinator.getRaisingHomeSnapshot().sessionId, `lifecycle-remount-${index}`);
    assert.equal(advance({
      getSnapshot: coordinator.getRaisingHomeSnapshot,
      dispatch: coordinator.dispatchRaisingHome
    }, `lifecycle:advance:${index}`).accepted, true);
    const saved = coordinator.save();
    assert.equal(saved.accepted, true);
    assert.equal(saved.exactStateSaved, true);
    assert.equal(coordinator.dispose().accepted, true);
  }
  const remounted = createChampionshipSaveCoordinatorR2({
    sessionId: "lifecycle-remount-final",
    slotId,
    savePort: port
  });
  assert.equal(remounted.getRaisingHomeSnapshot().revision, 20);
  assert.equal(remounted.getRaisingHomeSnapshot().tick, 20);
  assert.equal(remounted.getSaveStatus().dirty, false);
  assert.equal(port.inspect({ slotId }).selectedSlot.revision, 20);
  remounted.dispose();
});

test("a new realm carrier loses state while a retained port survives remount", () => {
  const retainedPort = createChampionshipSavePortR2();
  const first = createChampionshipSaveCoordinatorR2({
    sessionId: "realm-retained-first",
    slotId: "realm-slot",
    savePort: retainedPort
  });
  advance({ getSnapshot: first.getRaisingHomeSnapshot, dispatch: first.dispatchRaisingHome }, "realm:advance:1");
  first.save();
  first.dispose();
  const retained = createChampionshipSaveCoordinatorR2({
    sessionId: "realm-retained-second",
    slotId: "realm-slot",
    savePort: retainedPort
  });
  assert.equal(retained.getRaisingHomeSnapshot().revision, 1);
  retained.dispose();

  const refreshed = createChampionshipSaveCoordinatorR2({
    sessionId: "realm-refreshed",
    slotId: "realm-slot",
    savePort: createChampionshipSavePortR2()
  });
  assert.equal(refreshed.getRaisingHomeSnapshot().revision, 0);
  assert.equal(refreshed.getSaveStatus().dirty, true);
  refreshed.dispose();
});

test("R2 session keeps zero-write ModeRouter proof separate from Raising memory saves", async () => {
  const zeroWritePort = createNoopChampionshipSavePort();
  const raisingSavePort = createChampionshipSavePortR2();
  const session = createChampionshipR2Session({
    sessionId: "session-boundary",
    savePort: zeroWritePort,
    raisingSavePort,
    raisingSaveSlotId: "session-boundary-slot"
  });
  await session.open();
  assert.equal(session.saveRaisingHome().accepted, true);
  assert.equal(session.getSaveStatus().dirty, false);
  assert.equal(session.inspectRaisingSaveBoundary().memoryCommits, 1);
  assert.equal(session.getSnapshot().saveBoundary.writeRequests, 0);
  assert.equal(session.getSnapshot().saveBoundary.committedWrites, 0);
  await session.dispose();
});

test("session teardown synchronously rejects stale action and save authority", async () => {
  const raisingSavePort = createChampionshipSavePortR2();
  const session = createChampionshipR2Session({
    sessionId: "session-dispose-race",
    raisingSavePort,
    raisingSaveSlotId: "session-dispose-race-slot"
  });
  await session.open();
  const before = session.getRaisingHomeSnapshot();
  const disposing = session.dispose();
  const actionDuringDispose = session.dispatchRaisingHome({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId: "session-dispose-race:advance",
    expectedRevision: before.revision
  });
  const saveDuringDispose = session.saveRaisingHome();
  const retryDuringDispose = session.retryRaisingHomeSave();
  const exportDuringDispose = session.exportRaisingHomeRecovery();
  assert.equal(actionDuringDispose.accepted, false);
  assert.equal(saveDuringDispose.accepted, false);
  assert.equal(retryDuringDispose.accepted, false);
  assert.equal(exportDuringDispose.accepted, false);
  assert.match(actionDuringDispose.code, /DISPOSING/);
  assert.throws(() => session.subscribeRaisingHome(() => {}), /disposing/);
  assert.throws(() => session.subscribeSaveStatus(() => {}), /disposing/);
  await disposing;
  assert.equal(raisingSavePort.inspect().memoryCommits, 0);
});

test("dispose cleans runtime listeners without disposing the retained realm port", () => {
  const port = createChampionshipSavePortR2();
  const coordinator = createChampionshipSaveCoordinatorR2({
    sessionId: "dispose-cleanup",
    slotId: "dispose-cleanup-slot",
    savePort: port
  });
  coordinator.save();
  assert.equal(coordinator.dispose().accepted, true);
  assert.equal(coordinator.dispose().code, "CHAMPIONSHIP_R2_SAVE_COORDINATOR_ALREADY_DISPOSED");
  assert.equal(coordinator.dispatchRaisingHome({}).accepted, false);
  assert.equal(port.readSnapshot({ slotId: "dispose-cleanup-slot" }).accepted, true);
  assert.equal(port.policy, CHAMPIONSHIP_SAVE_PORT_R2_POLICY);
});

test("R2 save implementation has no production persistence, protected-domain, network, or Pixi authority", () => {
  const files = [
    "../../src/championship/raising/raisingHomePersistenceR2.js",
    "../../src/championship/kernel/ChampionshipSavePortR2.js",
    "../../src/championship/kernel/ChampionshipSaveCoordinatorR2.js"
  ].map((relative) => fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
  const source = files.join("\n");
  for (const pattern of [
    /from\s+["'][^"']*\/state\//,
    /\bsaveManager\b/, /\bsaveQueue\b/, /localStorage\s*\./, /sessionStorage\s*\./,
    /indexedDB\s*\./, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /serviceWorker/,
    /raphaelCore/i, /emotional.?standoff/i, /heartcore.?orbit/i, /\bPIXI\b/
  ]) assert.doesNotMatch(source, pattern);
});
