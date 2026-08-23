import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { createRaisingHomeRuntime } from "../../src/championship/raising/createRaisingHomeRuntime.js";
import {
  canEnterRaisingHome,
  createRaisingHomeInitialState,
  RAISING_HOME_COMMANDS,
  RAISING_HOME_FIELD,
  RAISING_HOME_KERNEL_FIELD_DEFINITION,
  reduceRaisingHome
} from "../../src/championship/raising/raisingHomeDefinition.js";
import { createFieldCollisionAdapter, getFieldWorldSize } from "../../src/championship/field/index.js";

function runtimeCommand(runtime, commandId, command) {
  return {
    ...command,
    commandId,
    expectedRevision: runtime.getSnapshot()?.revision ?? 0
  };
}

test("Raising Home uses a variable CM field rather than the R1 12x8 fixture", () => {
  assert.equal(RAISING_HOME_FIELD.family, "CM");
  assert.equal(RAISING_HOME_FIELD.width, 24);
  assert.equal(RAISING_HOME_FIELD.height, 14);
  assert.notDeepEqual([RAISING_HOME_FIELD.width, RAISING_HOME_FIELD.height], [12, 8]);
  assert.equal(RAISING_HOME_FIELD.originalParityClaim, false);
  assert.deepEqual(RAISING_HOME_KERNEL_FIELD_DEFINITION.dimensions, { widthTiles: 24, heightTiles: 14 });
  assert.deepEqual(getFieldWorldSize(RAISING_HOME_KERNEL_FIELD_DEFINITION), { widthPx: 768, heightPx: 448 });
  const originalCollisionBoundary = createFieldCollisionAdapter(RAISING_HOME_KERNEL_FIELD_DEFINITION).evaluate({ x: 12, y: 2 });
  assert.equal(originalCollisionBoundary.traversalDecision, "UNKNOWN");
  assert.equal(originalCollisionBoundary.traversalAllowed, null);
  assert.equal(canEnterRaisingHome({ x: 12, y: 2 }), false, "project-native authored collision is separate from unresolved original CM semantics");
});

test("Raising Home collision rejects out-of-bounds, obstacles, and non-integers", () => {
  assert.equal(canEnterRaisingHome({ x: -1, y: 4 }), false);
  assert.equal(canEnterRaisingHome({ x: 24, y: 4 }), false);
  assert.equal(canEnterRaisingHome({ x: 0, y: 0 }), false);
  assert.equal(canEnterRaisingHome({ x: 12, y: 2 }), false);
  assert.equal(canEnterRaisingHome({ x: 2.5, y: 4 }), false);
  assert.equal(canEnterRaisingHome({ x: 12, y: 10 }), true);
});

test("Raising Home movement is one-tile, immutable, and revisioned", () => {
  const initial = createRaisingHomeInitialState({ sessionId: "raising-test-move" });
  const moved = reduceRaisingHome(initial, { type: RAISING_HOME_COMMANDS.MOVE_CARETAKER, direction: "left" });
  assert.deepEqual(initial.caretakerPosition, { x: 12, y: 10 });
  assert.deepEqual(moved.caretakerPosition, { x: 11, y: 10 });
  assert.equal(moved.revision, 1);
  assert.equal(Object.isFrozen(moved), true);
  assert.equal(Object.isFrozen(moved.residents), true);
});

test("resident invitation can accept or refuse without ownership mutation", () => {
  const initial = structuredClone(createRaisingHomeInitialState({ sessionId: "raising-test-agency" }));
  initial.residents[0].energy = 10;
  const refused = reduceRaisingHome(initial, { type: RAISING_HOME_COMMANDS.INVITE });
  assert.equal(refused.residents[0].lastResponse, "not-now");
  assert.equal(refused.eventLog.at(-1).type, "INVITATION_REFUSED");
  assert.doesNotMatch(JSON.stringify(refused), /owned|captured|unlock|relationshipDelta/i);
});

test("care has a spatial requirement and training respects resident limits", () => {
  const initial = structuredClone(createRaisingHomeInitialState({ sessionId: "raising-test-care" }));
  const outOfRange = reduceRaisingHome(initial, { type: RAISING_HOME_COMMANDS.CARE });
  assert.equal(outOfRange.eventLog.at(-1).type, "CARE_OUT_OF_RANGE");
  const near = structuredClone(initial);
  near.caretakerPosition = { x: 5, y: 8 };
  const cared = reduceRaisingHome(near, { type: RAISING_HOME_COMMANDS.CARE });
  assert.equal(cared.eventLog.at(-1).type, "CARE_ACCEPTED");
  assert.ok(cared.residents[0].satiety > near.residents[0].satiety);
  near.residents[0].energy = 20;
  const declined = reduceRaisingHome(near, { type: RAISING_HOME_COMMANDS.TRAIN });
  assert.equal(declined.eventLog.at(-1).type, "TRAINING_REFUSED");
});

test("runtime is session-only and cannot publish player state patches", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-runtime" });
  const publication = runtime.dispatch(runtimeCommand(runtime, "runtime:advance:1", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
  assert.equal(publication.accepted, true);
  assert.equal(publication.persistenceAttempted, false);
  assert.equal(publication.playerStatePatch, null);
  const afterAdvance = runtime.getSnapshot();
  const duplicate = runtime.dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5, commandId: "runtime:advance:1", expectedRevision: afterAdvance.revision });
  assert.equal(duplicate.code, "RAISING_HOME_DUPLICATE_COMMAND");
  assert.equal(runtime.getSnapshot(), afterAdvance);
  const stale = runtime.dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5, commandId: "runtime:advance:2", expectedRevision: 0 });
  assert.equal(stale.code, "RAISING_HOME_STALE_REVISION");
  assert.equal(runtime.getSnapshot(), afterAdvance);
  const missingEnvelope = runtime.dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 });
  assert.equal(missingEnvelope.code, "RAISING_HOME_REJECTED");
  assert.equal(runtime.getSnapshot(), afterAdvance);
  runtime.dispose();
  assert.equal(runtime.dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE }).code, "RAISING_HOME_DISPOSED");
});

test("listener failure cannot turn an accepted domain transition into a rejection", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-listener-failure" });
  let delivered = null;
  runtime.subscribe(() => {
    throw new Error("injected presentation observer failure");
  });
  runtime.subscribe(() => {
    throw "injected non-error observer failure";
  });
  runtime.subscribe((publication) => {
    delivered = publication;
  });

  const result = runtime.dispatch(runtimeCommand(runtime, "listener:advance:1", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
  assert.equal(result.accepted, true);
  assert.equal(result.code, "RAISING_HOME_OK");
  assert.equal(result.snapshot.revision, 1);
  assert.equal(runtime.getSnapshot(), result.snapshot);
  assert.equal(delivered, result);
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: false,
    observerFailureCount: 2,
    lastObserverFailureRevision: 1
  });

  const duplicate = runtime.dispatch({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId: "listener:advance:1",
    expectedRevision: 1
  });
  assert.equal(duplicate.code, "RAISING_HOME_DUPLICATE_COMMAND");
  assert.equal(runtime.getSnapshot(), result.snapshot);
  runtime.dispose();
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: true,
    observerFailureCount: 2,
    lastObserverFailureRevision: 1
  });
});

test("synchronous listener dispatch fails busy while every observer revision stays monotonic", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-listener-reentry" });
  const deliveries = [];
  const nestedResults = [];
  runtime.subscribe((publication) => {
    deliveries.push(["first", publication.snapshot.revision]);
    const attemptNestedDispatch = (depth) => {
      nestedResults.push(runtime.dispatch({
        type: RAISING_HOME_COMMANDS.ADVANCE,
        minutes: 5,
        commandId: `listener:nested:${publication.snapshot.revision}:${depth}`,
        expectedRevision: publication.snapshot.revision
      }));
      if (depth < 3) attemptNestedDispatch(depth + 1);
    };
    attemptNestedDispatch(1);
  });
  runtime.subscribe((publication) => {
    deliveries.push(["second", publication.snapshot.revision]);
  });

  const first = runtime.dispatch(runtimeCommand(runtime, "listener:outer:1", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
  const second = runtime.dispatch(runtimeCommand(runtime, "listener:outer:2", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));

  assert.equal(first.accepted, true);
  assert.equal(second.accepted, true);
  assert.deepEqual(deliveries, [["first", 1], ["second", 1], ["first", 2], ["second", 2]]);
  assert.equal(nestedResults.length, 6);
  assert.deepEqual(nestedResults.map((result) => result.code), Array(6).fill("RAISING_HOME_NOTIFICATION_BUSY"));
  assert.deepEqual(nestedResults.map((result) => result.snapshot.revision), [1, 1, 1, 2, 2, 2]);
  assert.equal(nestedResults.every((result) => result.accepted === false && Object.isFrozen(result)), true);
  assert.equal(runtime.getSnapshot().revision, 2);
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: false,
    observerFailureCount: 0,
    lastObserverFailureRevision: null
  });
});

test("throwing reentrant listener cannot roll back acceptance or consume the busy command ID", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-throw-reentry" });
  const healthyRevisions = [];
  let busyResult = null;
  const unsubscribeThrowingListener = runtime.subscribe((publication) => {
    busyResult = runtime.dispatch({
      type: RAISING_HOME_COMMANDS.ADVANCE,
      minutes: 5,
      commandId: "listener:throw-reentry:retry",
      expectedRevision: publication.snapshot.revision
    });
    throw new Error("injected throw after reentrant dispatch");
  });
  runtime.subscribe((publication) => {
    healthyRevisions.push(publication.snapshot.revision);
  });

  const accepted = runtime.dispatch(runtimeCommand(runtime, "listener:throw-reentry:outer", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.snapshot.revision, 1);
  assert.equal(busyResult.code, "RAISING_HOME_NOTIFICATION_BUSY");
  assert.equal(busyResult.snapshot, accepted.snapshot);
  assert.deepEqual(healthyRevisions, [1]);
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: false,
    observerFailureCount: 1,
    lastObserverFailureRevision: 1
  });

  unsubscribeThrowingListener();
  const retried = runtime.dispatch({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId: "listener:throw-reentry:retry",
    expectedRevision: 1
  });
  assert.equal(retried.accepted, true, "a busy rejection must not consume its command ID");
  assert.equal(retried.snapshot.revision, 2);
  assert.deepEqual(healthyRevisions, [1, 2]);
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: false,
    observerFailureCount: 1,
    lastObserverFailureRevision: 1
  });
});

test("unsubscribe during notification affects only later publications", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-listener-unsubscribe" });
  const deliveries = [];
  let unsubscribeSecond = () => {};
  runtime.subscribe((publication) => {
    deliveries.push(["first", publication.snapshot.revision]);
    unsubscribeSecond();
  });
  unsubscribeSecond = runtime.subscribe((publication) => {
    deliveries.push(["second", publication.snapshot.revision]);
  });

  assert.equal(runtime.dispatch(runtimeCommand(runtime, "listener:unsubscribe:1", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 })).accepted, true);
  assert.equal(runtime.dispatch(runtimeCommand(runtime, "listener:unsubscribe:2", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 })).accepted, true);
  assert.deepEqual(deliveries, [["first", 1], ["second", 1], ["first", 2]]);
});

test("dispose during notification preserves the accepted publication and bounded observer diagnostics", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-listener-dispose" });
  const deliveries = [];
  let busyAfterDispose = null;
  runtime.subscribe((publication) => {
    deliveries.push(["disposer", publication.snapshot.revision]);
    runtime.dispose();
  });
  runtime.subscribe((publication) => {
    deliveries.push(["remaining", publication.snapshot.revision]);
    busyAfterDispose = runtime.dispatch({
      type: RAISING_HOME_COMMANDS.ADVANCE,
      minutes: 5,
      commandId: "listener:disposed-reentry",
      expectedRevision: publication.snapshot.revision
    });
    throw new Error("injected observer failure after dispose");
  });

  const accepted = runtime.dispatch(runtimeCommand(runtime, "listener:dispose:outer", { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
  assert.equal(accepted.accepted, true);
  assert.equal(accepted.snapshot.revision, 1);
  assert.deepEqual(deliveries, [["disposer", 1], ["remaining", 1]]);
  assert.equal(busyAfterDispose.code, "RAISING_HOME_NOTIFICATION_BUSY");
  assert.equal(busyAfterDispose.snapshot, accepted.snapshot);
  assert.equal(runtime.getSnapshot(), null);
  assert.deepEqual(runtime.getDiagnostics(), {
    disposed: true,
    observerFailureCount: 1,
    lastObserverFailureRevision: 1
  });
  assert.equal(runtime.dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE }).code, "RAISING_HOME_DISPOSED");
});

test("runtime command identity is duplicate-safe while the gameplay event log stays bounded", () => {
  const runtime = createRaisingHomeRuntime({ sessionId: "raising-test-history" });
  for (let index = 0; index < 60; index += 1) {
    const result = runtime.dispatch(runtimeCommand(runtime, `history:advance:${index}`, { type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 }));
    assert.equal(result.accepted, true);
  }
  assert.equal(runtime.getSnapshot().revision, 60);
  assert.equal(runtime.getSnapshot().eventLog.length, 48);
  const sequences = runtime.getSnapshot().eventLog.map((event) => event.sequence);
  assert.equal(new Set(sequences).size, 48);
  assert.deepEqual(sequences, Array.from({ length: 48 }, (_, index) => index + 13));
  const beforeDuplicate = runtime.getSnapshot();
  const duplicate = runtime.dispatch({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId: "history:advance:0",
    expectedRevision: beforeDuplicate.revision
  });
  assert.equal(duplicate.code, "RAISING_HOME_DUPLICATE_COMMAND");
  assert.equal(runtime.getSnapshot(), beforeDuplicate);
  runtime.dispose();
});

test("R2 presentation keeps semantic DOM controls and bounded Pixi lifecycle", () => {
  const dom = fs.readFileSync(new URL("../../src/championship/presentation/r2/createRaisingHomeDomView.js", import.meta.url), "utf8");
  const pixi = fs.readFileSync(new URL("../../src/championship/presentation/r2/createRaisingHomePixiView.js", import.meta.url), "utf8");
  const entry = fs.readFileSync(new URL("../../research/championship-r2/entry.js", import.meta.url), "utf8");
  const css = fs.readFileSync(new URL("../../research/championship-r2/styles.css", import.meta.url), "utf8");
  assert.match(dom, /aria-live/);
  assert.match(dom, /ArrowUp/);
  assert.match(dom, /"Save"/);
  assert.match(dom, /"Retry"/);
  assert.match(dom, /"Export recovery"/);
  assert.match(dom, /"Remount session"/);
  assert.match(dom, /remountButton\.disabled = busy \|\| Boolean\(latestSaveStatus\?\.dirty\)/);
  assert.match(pixi, /isRenderGroup/);
  assert.match(pixi, /releaseGlobalResources/);
  assert.match(pixi, /webglcontextlost/);
  assert.doesNotMatch(pixi, /localStorage|saveState|relationshipDelta/);
  assert.match(entry, /championshipR2/);
  assert.match(entry, /raisingSavePort: realmSavePort/);
  assert.match(entry, /r2SaveFailure/);
  assert.doesNotMatch(entry, /saveManager|saveQueue|loadState|saveState|localStorage|sessionStorage|indexedDB/);
  assert.match(css, /safe-area-inset-/);
  assert.match(css, /prefers-reduced-motion/);
});
