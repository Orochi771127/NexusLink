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
  assert.match(pixi, /isRenderGroup/);
  assert.match(pixi, /releaseGlobalResources/);
  assert.match(pixi, /webglcontextlost/);
  assert.doesNotMatch(pixi, /localStorage|saveState|relationshipDelta/);
  assert.match(entry, /championshipR2/);
  assert.doesNotMatch(entry, /saveManager|loadState|saveState/);
  assert.match(css, /safe-area-inset-/);
  assert.match(css, /prefers-reduced-motion/);
});
