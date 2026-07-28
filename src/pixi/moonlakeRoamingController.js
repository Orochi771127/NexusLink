import {
  MOONLAKE_WORLD_EDGES,
  MOONLAKE_WORLD_WAYPOINTS
} from "../three/moonlakeLive3dConfig.js";

const NORMAL_SPEED_PER_SECOND = 1.05;
const BRIDGE_SPEED_PER_SECOND = 0.68;
const DIRECTION_HYSTERESIS = 0.16;
const IDLE_DWELL_MIN_MS = 2_500;
const IDLE_DWELL_MAX_MS = 8_000;
const ORIGIN_ID = "platform_center";

const REQUIRED_DIRECTIONAL_ANIMATIONS = Object.freeze([
  "left_walk",
  "right_walk",
  "front_walk",
  "back_walk"
]);

const MOOD_ROUTE_POLICY = Object.freeze({
  calm: Object.freeze({ allowBridge: true, dwellMultiplier: 1 }),
  warm: Object.freeze({ allowBridge: true, dwellMultiplier: 0.85 }),
  happy: Object.freeze({ allowBridge: true, dwellMultiplier: 0.75 }),
  defensive: Object.freeze({ allowBridge: false, dwellMultiplier: 1.4 }),
  distant: Object.freeze({ allowBridge: false, dwellMultiplier: 1.35 }),
  sad: Object.freeze({ allowBridge: false, dwellMultiplier: 1.35 }),
  tired: Object.freeze({ allowBridge: false, dwellMultiplier: 2 })
});

export function createMoonlakeRoamingState(nowMs = 0) {
  const origin = MOONLAKE_WORLD_WAYPOINTS[ORIGIN_ID];
  return {
    currentId: ORIGIN_ID,
    targetId: null,
    x: origin.x,
    y: origin.y,
    z: origin.z,
    dwellUntil: nowMs + IDLE_DWELL_MIN_MS,
    direction: null,
    lastDirection: "front",
    distanceTravelled: 0,
    bridgeTraversals: 0
  };
}

export function resetMoonlakeRoamingState(state, nowMs = 0) {
  if (!state) return createMoonlakeRoamingState(nowMs);
  Object.assign(state, createMoonlakeRoamingState(nowMs));
  return state;
}

export function hasFourDirectionAnimations(canResolve) {
  return typeof canResolve === "function"
    && REQUIRED_DIRECTIONAL_ANIMATIONS.every((name) => Boolean(canResolve(name)));
}

export function updateMoonlakeRoaming(state, {
  deltaMs = 0,
  nowMs = 0,
  mood = "calm",
  canRoam = true,
  reducedMotion = false,
  canResolve,
  projectWorldPoint,
  random = Math.random
} = {}) {
  const roaming = state || createMoonlakeRoamingState(nowMs);
  const ready = hasFourDirectionAnimations(canResolve);
  if (!canRoam || reducedMotion || !ready || mood === "tired") {
    roaming.direction = null;
    return buildResult(roaming, {
      enabled: canRoam && !reducedMotion,
      ready,
      reason: !canRoam
        ? "blocked"
        : reducedMotion
          ? "reduced_motion"
          : !ready
            ? "missing_directional_assets"
            : "tired",
      projectWorldPoint
    });
  }

  if (!roaming.targetId && nowMs >= roaming.dwellUntil) {
    roaming.targetId = chooseNextWaypoint(roaming.currentId, mood, random);
  }

  if (!roaming.targetId) {
    roaming.direction = null;
    return buildResult(roaming, {
      enabled: true,
      ready: true,
      reason: "dwell",
      projectWorldPoint
    });
  }

  const target = MOONLAKE_WORLD_WAYPOINTS[roaming.targetId];
  const dx = target.x - roaming.x;
  const dy = target.y - roaming.y;
  const dz = target.z - roaming.z;
  const distance = Math.hypot(dx, dy, dz);
  const speed = isBridgeSegment(roaming.currentId, roaming.targetId)
    ? BRIDGE_SPEED_PER_SECOND
    : NORMAL_SPEED_PER_SECOND;
  const step = Math.max(0, deltaMs) / 1000 * speed;
  roaming.direction = selectDirection(dx, dz, roaming.lastDirection);
  roaming.lastDirection = roaming.direction;

  if (distance <= Math.max(step, 0.00001)) {
    const previousArea = MOONLAKE_WORLD_WAYPOINTS[roaming.currentId].area;
    const nextArea = target.area;
    roaming.x = target.x;
    roaming.y = target.y;
    roaming.z = target.z;
    roaming.distanceTravelled += distance;
    if (previousArea === "bridge" && nextArea === "fishing_spot") {
      roaming.bridgeTraversals += 1;
    }
    roaming.currentId = roaming.targetId;
    roaming.targetId = null;
    roaming.direction = null;
    const policy = MOOD_ROUTE_POLICY[mood] || MOOD_ROUTE_POLICY.calm;
    roaming.dwellUntil = nowMs + randomBetween(
      IDLE_DWELL_MIN_MS,
      IDLE_DWELL_MAX_MS,
      random
    ) * policy.dwellMultiplier;
  } else if (step > 0) {
    const ratio = step / distance;
    roaming.x += dx * ratio;
    roaming.y += dy * ratio;
    roaming.z += dz * ratio;
    roaming.distanceTravelled += step;
  }

  return buildResult(roaming, {
    enabled: true,
    ready: true,
    reason: roaming.direction ? "walking" : "arrived",
    projectWorldPoint
  });
}

export function getMoonlakeRoamingSnapshot(state) {
  if (!state) return null;
  return {
    currentId: state.currentId,
    targetId: state.targetId,
    x: state.x,
    y: state.y,
    z: state.z,
    direction: state.direction,
    distanceTravelled: state.distanceTravelled,
    bridgeTraversals: state.bridgeTraversals
  };
}

function chooseNextWaypoint(currentId, mood, random) {
  const policy = MOOD_ROUTE_POLICY[mood] || MOOD_ROUTE_POLICY.calm;
  const candidates = (MOONLAKE_WORLD_EDGES[currentId] || []).filter((id) => {
    if (policy.allowBridge) return true;
    return MOONLAKE_WORLD_WAYPOINTS[id]?.area !== "bridge"
      && MOONLAKE_WORLD_WAYPOINTS[id]?.area !== "far_bank"
      && MOONLAKE_WORLD_WAYPOINTS[id]?.area !== "fishing_spot";
  });
  if (!candidates.length) return ORIGIN_ID;
  const index = Math.min(candidates.length - 1, Math.floor(clamp01(random()) * candidates.length));
  return candidates[index];
}

function isBridgeSegment(fromId, toId) {
  return MOONLAKE_WORLD_WAYPOINTS[fromId]?.area === "bridge"
    || MOONLAKE_WORLD_WAYPOINTS[toId]?.area === "bridge";
}

function selectDirection(dx, screenDepthDelta, lastDirection) {
  const horizontal = Math.abs(dx);
  const vertical = Math.abs(screenDepthDelta);
  const lastWasHorizontal = lastDirection === "left" || lastDirection === "right";
  if (
    horizontal > vertical + DIRECTION_HYSTERESIS
    || (lastWasHorizontal && horizontal + DIRECTION_HYSTERESIS >= vertical)
  ) {
    return dx < 0 ? "left" : "right";
  }
  return screenDepthDelta < 0 ? "back" : "front";
}

function buildResult(state, {
  enabled,
  ready,
  reason,
  projectWorldPoint
}) {
  const area = MOONLAKE_WORLD_WAYPOINTS[state.targetId || state.currentId]?.area || "platform";
  const worldPosition = { x: state.x, y: state.y, z: state.z };
  const projected = typeof projectWorldPoint === "function"
    ? projectWorldPoint(worldPosition)
    : null;
  return {
    enabled,
    ready,
    reason,
    moving: Boolean(state.direction),
    animationName: state.direction ? `${state.direction}_walk` : null,
    worldPosition,
    projected,
    projectionReady: Boolean(projected),
    scaleMultiplier: Number(projected?.scale) || 1,
    area,
    isFishingSpot: area === "fishing_spot" && !state.direction
  };
}

function randomBetween(min, max, random) {
  return min + clamp01(random()) * (max - min);
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}

export const MOONLAKE_ROAMING_WAYPOINTS = MOONLAKE_WORLD_WAYPOINTS;
export const MOONLAKE_ROAMING_EDGES = MOONLAKE_WORLD_EDGES;
export const MOONLAKE_DIRECTIONAL_ANIMATIONS = REQUIRED_DIRECTIONAL_ANIMATIONS;
