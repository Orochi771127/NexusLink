import {
  RESONANCE_WEAVE_DURATION_GUIDE,
  RESONANCE_WEAVE_PHASES,
  applyResonanceWeaveKeyboard,
  applyResonanceWeavePointer,
  createResonanceWeavePreview,
  deriveDefaultResonanceWeavePhase,
  exitResonanceWeave,
  getResonanceWeaveProgress,
  replayResonanceWeave,
  setResonanceWeavePhase,
  startResonanceWeave
} from "../../src/engine/resonanceWeaveEngine.js";

const cases = [];

runCase("local hour selects only the default visual phase", () => {
  assertEqual(deriveDefaultResonanceWeavePhase(5), "dawn", "dawn");
  assertEqual(deriveDefaultResonanceWeavePhase(12), "day", "day");
  assertEqual(deriveDefaultResonanceWeavePhase(18), "dusk", "dusk");
  assertEqual(deriveDefaultResonanceWeavePhase(23), "night", "night");
  assertEqual(deriveDefaultResonanceWeavePhase(29), "dawn", "wrapped hour");
});

runCase("all four phases are selectable and switching changes no mechanic", () => {
  const preview = makePreview({ localHour: 12 });
  const baseline = withoutPhase(preview.session);
  for (const { id } of RESONANCE_WEAVE_PHASES) {
    const switched = setResonanceWeavePhase(preview.session, id);
    assertEqual(switched.ok, true, `${id} selectable`);
    assertEqual(switched.session.phaseId, id, `${id} selected`);
    assertDeepEqual(withoutPhase(switched.session), baseline, `${id} mechanics equal`);
    assertEqual(switched.permanentDelta, null, `${id} zero delta`);
  }
});

runCase("invalid phase fails closed without changing the session", () => {
  const preview = makePreview();
  const before = JSON.stringify(preview.session);
  const result = setResonanceWeavePhase(preview.session, "winter_only");
  assertEqual(result.ok, false, "invalid rejected");
  assertEqual(result.reason, "unknown-phase", "reason");
  assertEqual(JSON.stringify(preview.session), before, "input unchanged");
});

runCase("duration is a 30-45 second guide with no hard deadline", () => {
  const preview = makePreview();
  assertBetween(preview.session.durationGuide.suggestedSeconds, 30, 45, "suggested duration");
  assertDeepEqual(
    {
      minSeconds: preview.session.durationGuide.minSeconds,
      maxSeconds: preview.session.durationGuide.maxSeconds,
      hasHardDeadline: preview.session.durationGuide.hasHardDeadline
    },
    RESONANCE_WEAVE_DURATION_GUIDE,
    "duration guide"
  );
  assertEqual(preview.session.hardDeadlineAt, null, "no deadline timestamp");
  assertEqual(Object.prototype.hasOwnProperty.call(preview.session, "remainingSeconds"), false, "no countdown");
});

runCase("same seed creates the same 4-7 environment knots", () => {
  const first = makePreview({ seed: "same-seed", companionId: "greyshade-cat" });
  const second = makePreview({ seed: "same-seed", companionId: "greyshade-cat", phaseId: "dusk" });
  assertBetween(first.session.knots.length, 4, 7, "knot count");
  assertDeepEqual(first.session.knots, second.session.knots, "phase-independent geometry");
  assertEqual(first.session.knots.every(({ targetType }) => targetType === "environment"), true, "environment only");
  assertEqual(first.session.knots.some(({ id }) => id === "greyshade-cat"), false, "no companion id");
});

runCase("different seeds create different deterministic layouts", () => {
  const first = makePreview({ seed: "layout-a" });
  const second = makePreview({ seed: "layout-b" });
  assertNotEqual(JSON.stringify(first.session.knots), JSON.stringify(second.session.knots), "different layout");
});

runCase("preview and start are pure zero-delta transitions", () => {
  const preview = makePreview();
  const before = JSON.stringify(preview.session);
  const started = startResonanceWeave(preview.session);
  assertEqual(started.ok, true, "started");
  assertEqual(started.session.status, "active", "active status");
  assertEqual(started.session.stepId, "circle", "first step");
  assertEqual(started.permanentDelta, null, "zero delta");
  assertEqual(JSON.stringify(preview.session), before, "preview input unchanged");
});

runCase("pointer circle must close around the environment target", () => {
  const session = makeActive().session;
  const knot = session.knots[0];
  const before = JSON.stringify(session);
  const circled = applyResonanceWeavePointer(session, {
    action: "circle",
    targetId: knot.id,
    targetType: "environment",
    path: circlePath(knot)
  });
  assertEqual(circled.ok, true, "circle accepted");
  assertEqual(circled.session.stepId, "drag_against_current", "drag step");
  assertEqual(circled.session.activeKnotId, knot.id, "active target");
  assertEqual(statusOf(circled.session, knot.id), "circled", "circled status");
  assertEqual(JSON.stringify(session), before, "input unchanged");
});

runCase("open or misplaced pointer loops fail without progress", () => {
  const session = makeActive().session;
  const knot = session.knots[0];
  const open = circlePath(knot).slice(0, -1);
  const openResult = applyResonanceWeavePointer(session, {
    action: "circle",
    targetId: knot.id,
    path: open
  });
  assertEqual(openResult.ok, false, "open loop rejected");
  assertEqual(openResult.reason, "circle-does-not-enclose-target", "open reason");

  const misplaced = circlePath({ ...knot, x: knot.x + 0.35 });
  const misplacedResult = applyResonanceWeavePointer(session, {
    action: "circle",
    targetId: knot.id,
    path: misplaced
  });
  assertEqual(misplacedResult.ok, false, "misplaced loop rejected");
  assertEqual(getResonanceWeaveProgress(session).released, 0, "no progress");
});

runCase("companion targets are forbidden for pointer and keyboard", () => {
  const session = makeActive({ companionId: "greyshade-cat" }).session;
  const pointer = applyResonanceWeavePointer(session, {
    action: "circle",
    targetId: "greyshade-cat",
    targetType: "companion",
    path: []
  });
  const keyboard = applyResonanceWeaveKeyboard(session, {
    action: "circle",
    targetId: "greyshade-cat",
    targetType: "companion"
  });
  assertEqual(pointer.reason, "companion-target-forbidden", "pointer forbidden");
  assertEqual(keyboard.reason, "companion-target-forbidden", "keyboard forbidden");
  assertEqual(pointer.permanentDelta, null, "pointer zero delta");
  assertEqual(keyboard.permanentDelta, null, "keyboard zero delta");
});

runCase("dragging with the current is rejected", () => {
  const circled = pointerCircleFirst(makeActive().session);
  const knot = circled.session.knots.find(({ id }) => id === circled.session.activeKnotId);
  const result = applyResonanceWeavePointer(circled.session, {
    action: "drag",
    targetId: knot.id,
    from: { x: knot.x, y: knot.y },
    to: { x: knot.x + knot.current.x * 0.12, y: knot.y + knot.current.y * 0.12 }
  });
  assertEqual(result.ok, false, "with-current rejected");
  assertEqual(result.reason, "drag-not-against-current", "drag reason");
  assertEqual(statusOf(result.session, knot.id), "circled", "still circled");
});

runCase("pointer drag against current stabilizes the knot", () => {
  const circled = pointerCircleFirst(makeActive().session);
  const knot = circled.session.knots.find(({ id }) => id === circled.session.activeKnotId);
  const stable = pointerDragAgainstCurrent(circled.session, knot);
  assertEqual(stable.ok, true, "drag accepted");
  assertEqual(stable.session.stepId, "release", "release step");
  assertEqual(statusOf(stable.session, knot.id), "stable", "stable status");
  const offset = stable.session.knots.find(({ id }) => id === knot.id).visualOffset;
  assertEqual(Math.hypot(offset.x, offset.y) > 0, true, "visual displacement retained");
});

runCase("reduced motion cancels displacement but preserves the stable step", () => {
  const active = makeActive({ reducedMotion: true }).session;
  const circled = pointerCircleFirst(active);
  const knot = circled.session.knots.find(({ id }) => id === circled.session.activeKnotId);
  const stable = pointerDragAgainstCurrent(circled.session, knot);
  const resolved = stable.session.knots.find(({ id }) => id === knot.id);
  assertEqual(stable.session.stepId, "release", "step preserved");
  assertEqual(resolved.status, "stable", "stable preserved");
  assertDeepEqual(resolved.visualOffset, { x: 0, y: 0 }, "displacement removed");
});

runCase("release completes one knot and returns to circle", () => {
  const circled = pointerCircleFirst(makeActive().session);
  const knot = circled.session.knots.find(({ id }) => id === circled.session.activeKnotId);
  const stable = pointerDragAgainstCurrent(circled.session, knot);
  const released = applyResonanceWeavePointer(stable.session, { action: "release", targetId: knot.id });
  assertEqual(released.ok, true, "released");
  assertEqual(statusOf(released.session, knot.id), "released", "released status");
  assertEqual(released.session.stepId, "circle", "returns to circle");
  assertEqual(getResonanceWeaveProgress(released.session).released, 1, "one released");
  assertEqual(released.permanentDelta, null, "zero permanent delta");
});

runCase("keyboard offers the same circle-drag-release state machine", () => {
  let session = makeActive().session;
  const targetId = session.focusedKnotId;
  session = expectOk(applyResonanceWeaveKeyboard(session, { action: "circle" })).session;
  assertEqual(session.activeKnotId, targetId, "focused knot circled");
  session = expectOk(applyResonanceWeaveKeyboard(session, { action: "drag_against_current" })).session;
  assertEqual(statusOf(session, targetId), "stable", "keyboard stable");
  session = expectOk(applyResonanceWeaveKeyboard(session, { action: "release" })).session;
  assertEqual(statusOf(session, targetId), "released", "keyboard released");
});

runCase("keyboard focus cycles only through unreleased knots", () => {
  let session = makeActive().session;
  const first = session.focusedKnotId;
  const next = applyResonanceWeaveKeyboard(session, { action: "focus_next" });
  assertNotEqual(next.session.focusedKnotId, first, "focus advanced");
  const previous = applyResonanceWeaveKeyboard(next.session, { action: "focus_previous" });
  assertEqual(previous.session.focusedKnotId, first, "focus returned");
});

runCase("all knots can be released without a timer or reward", () => {
  let session = makeActive().session;
  let guard = 0;
  while (session.status === "active" && guard < 10) {
    session = expectOk(applyResonanceWeaveKeyboard(session, { action: "circle" })).session;
    session = expectOk(applyResonanceWeaveKeyboard(session, { action: "drag_against_current" })).session;
    session = expectOk(applyResonanceWeaveKeyboard(session, { action: "release" })).session;
    guard += 1;
  }
  const progress = getResonanceWeaveProgress(session);
  assertEqual(session.status, "completed", "completed status");
  assertEqual(session.stepId, "completed", "completed step");
  assertEqual(progress.complete, true, "progress complete");
  assertEqual(progress.released, session.knots.length, "all released");
  assertEqual(hasProgressionField(session), false, "no reward/growth/stage fields");
});

runCase("exit is always zero-delta and preserves completed progress", () => {
  const active = makeActive().session;
  const before = JSON.stringify(active);
  const exited = exitResonanceWeave(active);
  assertEqual(exited.ok, true, "exit succeeds");
  assertEqual(exited.session.status, "exited", "exited status");
  assertEqual(exited.permanentDelta, null, "zero delta");
  assertEqual(JSON.stringify(active), before, "input unchanged");
});

runCase("replay resets progress with the same layout and no permanent delta", () => {
  let session = makeActive({ seed: "replay-layout" }).session;
  const originalGeometry = geometryOf(session);
  const circled = pointerCircleFirst(session);
  const knot = circled.session.knots.find(({ id }) => id === circled.session.activeKnotId);
  const stable = pointerDragAgainstCurrent(circled.session, knot);
  session = expectOk(applyResonanceWeavePointer(stable.session, { action: "release", targetId: knot.id })).session;
  const replayed = replayResonanceWeave(session);
  assertEqual(replayed.ok, true, "replay succeeds");
  assertEqual(replayed.session.status, "active", "replay active");
  assertEqual(replayed.session.releasedKnotIds.length, 0, "progress reset");
  assertDeepEqual(geometryOf(replayed.session), originalGeometry, "layout preserved");
  assertEqual(replayed.session.replayIndex, 1, "session replay metadata only");
  assertEqual(replayed.permanentDelta, null, "zero delta");
});

runCase("every public transition reports no permanent delta", () => {
  const preview = makePreview();
  const started = startResonanceWeave(preview.session);
  const phased = setResonanceWeavePhase(started.session, "night");
  const focused = applyResonanceWeaveKeyboard(phased.session, { action: "focus_next" });
  const exited = exitResonanceWeave(focused.session);
  const replayed = replayResonanceWeave(exited.session);
  for (const result of [preview, started, phased, focused, exited, replayed]) {
    assertEqual(result.permanentDelta, null, "zero permanent delta");
  }
});

const failed = cases.filter(({ status }) => status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failed.length, cases }, null, 2));
if (failed.length > 0) process.exitCode = 1;

function makePreview(overrides = {}) {
  return createResonanceWeavePreview({
    nodeId: "rift_observatory",
    seed: "weave-r2-test",
    localHour: 12,
    ...overrides
  });
}

function makeActive(overrides = {}) {
  return startResonanceWeave(makePreview(overrides).session);
}

function pointerCircleFirst(session) {
  const knot = session.knots.find(({ status }) => status === "waiting");
  return applyResonanceWeavePointer(session, {
    action: "circle",
    targetId: knot.id,
    targetType: "environment",
    path: circlePath(knot)
  });
}

function pointerDragAgainstCurrent(session, knot) {
  return applyResonanceWeavePointer(session, {
    action: "drag",
    targetId: knot.id,
    from: { x: knot.x, y: knot.y },
    to: { x: knot.x - knot.current.x * 0.14, y: knot.y - knot.current.y * 0.14 }
  });
}

function circlePath(knot) {
  const radius = Math.max(0.09, knot.radius * 1.8);
  const path = [];
  for (let index = 0; index <= 12; index += 1) {
    const angle = (Math.PI * 2 * index) / 12;
    path.push({
      x: knot.x + Math.cos(angle) * radius,
      y: knot.y + Math.sin(angle) * radius
    });
  }
  return path;
}

function withoutPhase(session) {
  const copy = JSON.parse(JSON.stringify(session));
  delete copy.phaseId;
  return copy;
}

function geometryOf(session) {
  return session.knots.map(({ id, targetType, kind, x, y, radius, current }) => ({
    id,
    targetType,
    kind,
    x,
    y,
    radius,
    current
  }));
}

function statusOf(session, targetId) {
  return session.knots.find(({ id }) => id === targetId)?.status || null;
}

function hasProgressionField(session) {
  return ["reward", "rewards", "growth", "stageId", "ranking", "score"]
    .some((key) => Object.prototype.hasOwnProperty.call(session, key));
}

function expectOk(result) {
  if (!result.ok) throw new Error(`expected ok result, received ${result.reason}`);
  if (result.permanentDelta !== null) throw new Error("expected zero permanent delta");
  return result;
}

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error.message });
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
  }
}

function assertNotEqual(actual, expected, label) {
  if (actual === expected) throw new Error(`${label}: values unexpectedly matched`);
}

function assertDeepEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}

function assertBetween(value, min, max, label) {
  if (value < min || value > max) {
    throw new Error(`${label}: expected ${min}-${max}, received ${value}`);
  }
}
