// Resonance Weave / 共鳴織痕：純 session 互動引擎。
//
// 微光與雜訊結只存在本場；本模組沒有 store/save/Growth/reward 入口，也沒有
// 倒數計時器。30–45 秒是體驗節奏提示，不是期限。日相只改視覺，不改幾何、
// 步驟或結果。

export const RESONANCE_WEAVE_PHASES = Object.freeze([
  Object.freeze({ id: "dawn", labelKey: "weave.phase.dawn", visualTone: "pearl_mist" }),
  Object.freeze({ id: "day", labelKey: "weave.phase.day", visualTone: "clear_water" }),
  Object.freeze({ id: "dusk", labelKey: "weave.phase.dusk", visualTone: "amber_tide" }),
  Object.freeze({ id: "night", labelKey: "weave.phase.night", visualTone: "moon_indigo" })
]);

export const RESONANCE_WEAVE_STEPS = Object.freeze([
  "circle",
  "drag_against_current",
  "release",
  "completed"
]);

export const RESONANCE_WEAVE_DURATION_GUIDE = Object.freeze({
  minSeconds: 30,
  maxSeconds: 45,
  hasHardDeadline: false
});

const PHASE_ID_SET = new Set(RESONANCE_WEAVE_PHASES.map(({ id }) => id));
const MIN_KNOTS = 4;
const MAX_KNOTS = 7;
const MIN_AGAINST_CURRENT_DISTANCE = 0.06;
const MAX_VISUAL_DRAG = 0.12;

export function deriveDefaultResonanceWeavePhase(localHour = 0) {
  const hour = normalizeHour(localHour);
  if (hour >= 5 && hour < 10) return "dawn";
  if (hour >= 10 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}

/** 建立尚未開始的預覽；不讀取或回寫任何永久 state。 */
export function createResonanceWeavePreview({
  nodeId = "moonlake",
  seed = "moonlake-weave",
  phaseId = null,
  localHour = 0,
  companionId = null,
  reducedMotion = false
} = {}) {
  const normalizedNodeId = normalizeText(nodeId) || "moonlake";
  const normalizedSeed = normalizeText(seed) || "moonlake-weave";
  const defaultPhaseId = deriveDefaultResonanceWeavePhase(localHour);
  const selectedPhaseId = PHASE_ID_SET.has(phaseId) ? phaseId : defaultPhaseId;
  const seedHash = hashText(`${normalizedNodeId}|${normalizedSeed}`);
  const knots = generateKnots(seedHash, normalizedNodeId);
  const suggestedSeconds = RESONANCE_WEAVE_DURATION_GUIDE.minSeconds
    + ((seedHash >>> 4) % (
      RESONANCE_WEAVE_DURATION_GUIDE.maxSeconds
      - RESONANCE_WEAVE_DURATION_GUIDE.minSeconds
      + 1
    ));

  return okResult({
    version: 1,
    sessionKey: `weave:${normalizedNodeId}:${seedHash.toString(16)}`,
    nodeId: normalizedNodeId,
    seed: normalizedSeed,
    seedHash,
    companionId: normalizeText(companionId) || null,
    status: "preview",
    phaseId: selectedPhaseId,
    defaultPhaseId,
    selectablePhaseIds: RESONANCE_WEAVE_PHASES.map(({ id }) => id),
    durationGuide: {
      ...RESONANCE_WEAVE_DURATION_GUIDE,
      suggestedSeconds
    },
    hardDeadlineAt: null,
    reducedMotion: Boolean(reducedMotion),
    stepId: "circle",
    knots,
    activeKnotId: null,
    focusedKnotId: knots[0]?.id || null,
    completedKnotIds: [],
    releasedKnotIds: [],
    replayIndex: 0,
    lastInput: null
  });
}

export function startResonanceWeave(session) {
  if (!isWeaveSession(session)) return failResult("invalid-session", session);
  if (session.status !== "preview") return failResult("not-preview", session);
  return okResult({ ...cloneSession(session), status: "active" });
}

/** 日相可隨時切換；只改 phaseId，進度與程序化節點完全不變。 */
export function setResonanceWeavePhase(session, phaseId) {
  if (!isWeaveSession(session)) return failResult("invalid-session", session);
  if (!PHASE_ID_SET.has(phaseId)) return failResult("unknown-phase", session);
  return okResult({ ...cloneSession(session), phaseId });
}

export function exitResonanceWeave(session) {
  if (!isWeaveSession(session)) return failResult("invalid-session", session);
  return okResult({
    ...cloneSession(session),
    status: "exited",
    stepId: session.stepId === "completed" ? "completed" : session.stepId,
    activeKnotId: null,
    lastInput: { source: "system", action: "exit" }
  });
}

/** 同 seed 重玩會重建相同場景，但清空本場進度；仍不產生任何永久 delta。 */
export function replayResonanceWeave(session) {
  if (!isWeaveSession(session)) return failResult("invalid-session", session);
  const preview = createResonanceWeavePreview({
    nodeId: session.nodeId,
    seed: session.seed,
    phaseId: session.phaseId,
    companionId: session.companionId,
    reducedMotion: session.reducedMotion
  });
  return okResult({
    ...preview.session,
    status: "active",
    replayIndex: finiteInteger(session.replayIndex, 0) + 1,
    lastInput: { source: "system", action: "replay" }
  });
}

/**
 * Pointer API：
 *   circle  -> { targetId, targetType:"environment", path:[{x,y}, ...] }
 *   drag    -> { targetId, from:{x,y}, to:{x,y} }
 *   release -> { targetId }
 */
export function applyResonanceWeavePointer(session, input = {}) {
  if (!isActiveSession(session)) return failResult("not-active", session);
  if (isCompanionTarget(session, input)) return failResult("companion-target-forbidden", session);
  const action = normalizeText(input.action);
  if (action === "circle") {
    return circleKnot(session, input.targetId, {
      source: "pointer",
      path: input.path
    });
  }
  if (action === "drag") {
    return dragKnot(session, input.targetId, {
      source: "pointer",
      from: input.from,
      to: input.to
    });
  }
  if (action === "release") {
    return releaseKnot(session, input.targetId, "pointer");
  }
  return failResult("unknown-pointer-action", session);
}

/**
 * Keyboard API：focus_next/focus_previous 不改互動步驟；circle、
 * drag_against_current、release 與 pointer 走相同狀態機。
 */
export function applyResonanceWeaveKeyboard(session, input = {}) {
  if (!isActiveSession(session)) return failResult("not-active", session);
  if (isCompanionTarget(session, input)) return failResult("companion-target-forbidden", session);
  const action = normalizeText(input.action);

  if (action === "focus_next" || action === "focus_previous") {
    const direction = action === "focus_previous" ? -1 : 1;
    const focusedKnotId = cycleFocus(session, direction);
    return okResult({
      ...cloneSession(session),
      focusedKnotId,
      lastInput: { source: "keyboard", action }
    });
  }

  const targetId = normalizeText(input.targetId) || session.activeKnotId || session.focusedKnotId;
  if (action === "circle") {
    return circleKnot(session, targetId, { source: "keyboard", semantic: true });
  }
  if (action === "drag_against_current") {
    return dragKnot(session, targetId, { source: "keyboard", semantic: true });
  }
  if (action === "release") {
    return releaseKnot(session, targetId, "keyboard");
  }
  return failResult("unknown-keyboard-action", session);
}

export function getResonanceWeaveProgress(session) {
  const total = Array.isArray(session?.knots) ? session.knots.length : 0;
  const released = Array.isArray(session?.releasedKnotIds) ? session.releasedKnotIds.length : 0;
  return {
    total,
    released,
    remaining: Math.max(0, total - released),
    complete: total > 0 && released >= total,
    stepId: normalizeText(session?.stepId) || "circle"
  };
}

function circleKnot(session, targetId, { source, path = null, semantic = false } = {}) {
  if (session.stepId !== "circle") return failResult("wrong-step", session);
  const knot = findAvailableKnot(session, targetId);
  if (!knot) return failResult("invalid-environment-target", session);
  if (!semantic && !pathEnclosesKnot(path, knot)) return failResult("circle-does-not-enclose-target", session);

  const next = cloneSession(session);
  next.knots = next.knots.map((entry) => entry.id === knot.id
    ? { ...entry, status: "circled" }
    : entry);
  next.activeKnotId = knot.id;
  next.focusedKnotId = knot.id;
  next.stepId = "drag_against_current";
  next.lastInput = { source, action: "circle", targetId: knot.id };
  return okResult(next);
}

function dragKnot(session, targetId, {
  source,
  from = null,
  to = null,
  semantic = false
} = {}) {
  if (session.stepId !== "drag_against_current") return failResult("wrong-step", session);
  const knot = session.knots.find(({ id }) => id === targetId && id === session.activeKnotId);
  if (!knot || knot.status !== "circled") return failResult("invalid-active-target", session);

  let visualOffset;
  if (semantic) {
    visualOffset = session.reducedMotion
      ? { x: 0, y: 0 }
      : {
          x: round(-knot.current.x * 0.1),
          y: round(-knot.current.y * 0.1)
        };
  } else {
    const start = normalizePoint(from);
    const end = normalizePoint(to);
    if (!start || !end) return failResult("invalid-drag-path", session);
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const againstCurrent = dx * knot.current.x + dy * knot.current.y;
    if (againstCurrent > -MIN_AGAINST_CURRENT_DISTANCE) {
      return failResult("drag-not-against-current", session);
    }
    const length = Math.hypot(dx, dy) || 1;
    const scale = Math.min(MAX_VISUAL_DRAG, length) / length;
    visualOffset = session.reducedMotion
      ? { x: 0, y: 0 }
      : { x: round(dx * scale), y: round(dy * scale) };
  }

  const next = cloneSession(session);
  next.knots = next.knots.map((entry) => entry.id === knot.id
    ? { ...entry, status: "stable", visualOffset }
    : entry);
  next.stepId = "release";
  next.lastInput = { source, action: "drag_against_current", targetId: knot.id };
  return okResult(next);
}

function releaseKnot(session, targetId, source) {
  if (session.stepId !== "release") return failResult("wrong-step", session);
  const knot = session.knots.find(({ id }) => id === targetId && id === session.activeKnotId);
  if (!knot || knot.status !== "stable") return failResult("target-not-stable", session);

  const next = cloneSession(session);
  next.knots = next.knots.map((entry) => entry.id === knot.id
    ? { ...entry, status: "released", visualOffset: { x: 0, y: 0 } }
    : entry);
  next.completedKnotIds = appendUnique(next.completedKnotIds, knot.id);
  next.releasedKnotIds = appendUnique(next.releasedKnotIds, knot.id);
  const complete = next.releasedKnotIds.length >= next.knots.length;
  next.status = complete ? "completed" : "active";
  next.stepId = complete ? "completed" : "circle";
  next.activeKnotId = null;
  next.focusedKnotId = complete ? null : next.knots.find(({ status }) => status !== "released")?.id || null;
  next.lastInput = { source, action: "release", targetId: knot.id };
  return okResult(next);
}

function generateKnots(seedHash, nodeId) {
  const random = createDeterministicRandom(seedHash);
  const count = MIN_KNOTS + (seedHash % (MAX_KNOTS - MIN_KNOTS + 1));
  const knots = [];
  for (let index = 0; index < count; index += 1) {
    const angle = random() * Math.PI * 2;
    knots.push({
      id: `${nodeId}:weave:${index + 1}`,
      targetType: "environment",
      kind: random() >= 0.48 ? "glimmer" : "noise_knot",
      x: round(0.14 + random() * 0.72),
      y: round(0.16 + random() * 0.68),
      radius: round(0.045 + random() * 0.025),
      current: {
        x: round(Math.cos(angle)),
        y: round(Math.sin(angle))
      },
      status: "waiting",
      visualOffset: { x: 0, y: 0 }
    });
  }
  return knots;
}

function pathEnclosesKnot(path, knot) {
  if (!Array.isArray(path) || path.length < 5) return false;
  const points = path.map(normalizePoint);
  if (points.some((point) => !point)) return false;
  const first = points[0];
  const last = points[points.length - 1];
  if (Math.hypot(last.x - first.x, last.y - first.y) > Math.max(0.03, knot.radius * 0.6)) return false;
  return pointInPolygon({ x: knot.x, y: knot.y }, points);
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    const intersects = (a.y > point.y) !== (b.y > point.y)
      && point.x < ((b.x - a.x) * (point.y - a.y)) / ((b.y - a.y) || Number.EPSILON) + a.x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function cycleFocus(session, direction) {
  const candidates = session.knots.filter(({ status }) => status !== "released");
  if (!candidates.length) return null;
  const currentIndex = candidates.findIndex(({ id }) => id === session.focusedKnotId);
  const start = currentIndex >= 0 ? currentIndex : 0;
  const nextIndex = (start + direction + candidates.length) % candidates.length;
  return candidates[nextIndex].id;
}

function isCompanionTarget(session, input) {
  const targetId = normalizeText(input?.targetId);
  return input?.targetType === "companion"
    || Boolean(targetId && session.companionId && targetId === session.companionId);
}

function findAvailableKnot(session, targetId) {
  const normalizedId = normalizeText(targetId);
  return session.knots.find(({ id, targetType, status }) => (
    id === normalizedId
    && targetType === "environment"
    && status === "waiting"
  )) || null;
}

function isWeaveSession(session) {
  return Boolean(
    session
    && session.version === 1
    && typeof session.sessionKey === "string"
    && Array.isArray(session.knots)
    && session.knots.length >= MIN_KNOTS
    && session.knots.length <= MAX_KNOTS
  );
}

function isActiveSession(session) {
  return isWeaveSession(session) && session.status === "active";
}

function cloneSession(session) {
  return {
    ...session,
    selectablePhaseIds: [...(session.selectablePhaseIds || [])],
    durationGuide: { ...(session.durationGuide || {}) },
    knots: (session.knots || []).map((knot) => ({
      ...knot,
      current: { ...knot.current },
      visualOffset: { ...knot.visualOffset }
    })),
    completedKnotIds: [...(session.completedKnotIds || [])],
    releasedKnotIds: [...(session.releasedKnotIds || [])],
    lastInput: session.lastInput ? { ...session.lastInput } : null
  };
}

function okResult(session) {
  return { ok: true, reason: null, session, permanentDelta: null };
}

function failResult(reason, session) {
  return {
    ok: false,
    reason,
    session: isWeaveSession(session) ? cloneSession(session) : null,
    permanentDelta: null
  };
}

function appendUnique(values, value) {
  return values.includes(value) ? values : [...values, value];
}

function normalizePoint(value) {
  const x = Number(value?.x);
  const y = Number(value?.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function normalizeHour(value) {
  const hour = Number(value);
  if (!Number.isFinite(hour)) return 0;
  return ((Math.floor(hour) % 24) + 24) % 24;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function finiteInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : fallback;
}

function round(value) {
  return Number(value.toFixed(6));
}

function hashText(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createDeterministicRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}
