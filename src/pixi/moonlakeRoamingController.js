import {
  MOONLAKE_NAVIGATION_SAFETY,
  MOONLAKE_WORLD_EDGES,
  MOONLAKE_WORLD_WAYPOINTS
} from "../three/moonlakeLive3dConfig.js";
import {
  getMoonlakeCollisionRadiusPx390,
  getMoonlakeProjectedFootSafety,
  isMoonlakeRouteSegmentSafe
} from "./moonlakeNavigationSafety.js";

const NORMAL_SPEED_PER_SECOND = 0.86;
const BRIDGE_SPEED_PER_SECOND = 0.64;
const DIRECTION_HYSTERESIS = 0.16;
const IDLE_DWELL_MIN_MS = 2_500;
const IDLE_DWELL_MAX_MS = 8_000;
const ORIGIN_ID = MOONLAKE_NAVIGATION_SAFETY.homeWaypointId;

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

const DEFAULT_LOCOMOTION_PROFILE = Object.freeze({
  stridePx390: 17,
  minPlaybackRate: 0.55,
  maxPlaybackRate: 3
});

export const MOONLAKE_LOCOMOTION_PROFILES = Object.freeze({
  "greyshade-cat": Object.freeze({ stridePx390: 17 }),
  auriowl: Object.freeze({ stridePx390: 12, maxPlaybackRate: 3.2 }),
  sprigfawn: Object.freeze({ stridePx390: 20, maxPlaybackRate: 2.8 }),
  "crystalfin-seahorse": Object.freeze({ stridePx390: 11, maxPlaybackRate: 2.6 }),
  "blazetail-kit": Object.freeze({ stridePx390: 17 }),
  "starstripe-cub": Object.freeze({ stridePx390: 17 }),
  "thunder-pup": Object.freeze({ stridePx390: 17 }),
  wavecub: Object.freeze({ stridePx390: 17 }),
  "starflame-phoenix": Object.freeze({ stridePx390: 12, maxPlaybackRate: 3.2 }),
  "star-foal": Object.freeze({ stridePx390: 21, maxPlaybackRate: 2.8 }),
  "goldenspark-wyrm": Object.freeze({ stridePx390: 16 }),
  "flame-flicker": Object.freeze({ stridePx390: 17 }),
  "ice-talon": Object.freeze({ stridePx390: 17 }),
  "stone-shard": Object.freeze({ stridePx390: 16 }),
  "vine-twist": Object.freeze({ stridePx390: 20, maxPlaybackRate: 2.8 }),
  "crystal-rabbit": Object.freeze({ stridePx390: 13, maxPlaybackRate: 3.2 })
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
    bridgeTraversals: 0,
    lastProjectedX: null,
    lastProjectedY: null,
    projectedSpeedPxPerSecond: 0
  };
}

export function resetMoonlakeRoamingState(state, nowMs = 0) {
  if (!state) return createMoonlakeRoamingState(nowMs);
  Object.assign(state, createMoonlakeRoamingState(nowMs));
  return state;
}

export function snapMoonlakeRoamingToWaypoint(state, waypointId, nowMs = 0) {
  const waypoint = MOONLAKE_WORLD_WAYPOINTS[waypointId];
  if (!state || !waypoint) return false;
  state.currentId = waypointId;
  state.targetId = null;
  state.x = waypoint.x;
  state.y = waypoint.y;
  state.z = waypoint.z;
  state.dwellUntil = nowMs + IDLE_DWELL_MAX_MS;
  state.direction = null;
  state.lastProjectedX = null;
  state.lastProjectedY = null;
  state.projectedSpeedPxPerSecond = 0;
  return true;
}

export function stageMoonlakeRoamingSegment(state, fromWaypointId, toWaypointId, progress = 0) {
  const from = MOONLAKE_WORLD_WAYPOINTS[fromWaypointId];
  const to = MOONLAKE_WORLD_WAYPOINTS[toWaypointId];
  const isConnected = MOONLAKE_WORLD_EDGES[fromWaypointId]?.includes(toWaypointId);
  if (!state || !from || !to || !isConnected) return false;
  const amount = clamp01(progress);
  state.currentId = fromWaypointId;
  state.targetId = toWaypointId;
  state.x = from.x + (to.x - from.x) * amount;
  state.y = from.y + (to.y - from.y) * amount;
  state.z = from.z + (to.z - from.z) * amount;
  state.dwellUntil = 0;
  state.direction = null;
  state.lastProjectedX = null;
  state.lastProjectedY = null;
  state.projectedSpeedPxPerSecond = 0;
  return true;
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
  companionId = null,
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
      companionId,
      projectWorldPoint,
      deltaMs
    });
  }

  if (!roaming.targetId && nowMs >= roaming.dwellUntil) {
    roaming.targetId = chooseNextWaypoint(roaming.currentId, mood, random, {
      companionId,
      projectWorldPoint
    });
  }

  if (!roaming.targetId) {
    roaming.direction = null;
    return buildResult(roaming, {
      enabled: true,
      ready: true,
      reason: "dwell",
      companionId,
      projectWorldPoint,
      deltaMs
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
    companionId,
    projectWorldPoint,
    deltaMs
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

function chooseNextWaypoint(currentId, mood, random, {
  companionId,
  projectWorldPoint
} = {}) {
  const policy = MOOD_ROUTE_POLICY[mood] || MOOD_ROUTE_POLICY.calm;
  const from = MOONLAKE_WORLD_WAYPOINTS[currentId];
  const candidates = (MOONLAKE_WORLD_EDGES[currentId] || []).filter((id) => {
    const target = MOONLAKE_WORLD_WAYPOINTS[id];
    const moodAllows = policy.allowBridge
      || (target?.area !== "bridge"
      && MOONLAKE_WORLD_WAYPOINTS[id]?.area !== "far_bank"
      && MOONLAKE_WORLD_WAYPOINTS[id]?.area !== "fishing_spot");
    if (!moodAllows || !from || !target) return false;
    return isMoonlakeRouteSegmentSafe(from, target, {
      companionId,
      area: from.area,
      projectWorldPoint
    }) && isMoonlakeRouteSegmentSafe(from, target, {
      companionId,
      area: target.area,
      projectWorldPoint
    });
  });
  if (!candidates.length) return null;
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
  companionId,
  projectWorldPoint,
  deltaMs = 0
}) {
  const waypoint = MOONLAKE_WORLD_WAYPOINTS[state.targetId || state.currentId];
  const area = waypoint?.area || "platform";
  const fishingOptions = Array.isArray(waypoint?.fishingOptions)
    ? waypoint.fishingOptions
    : [];
  const worldPosition = { x: state.x, y: state.y, z: state.z };
  const projected = typeof projectWorldPoint === "function"
    ? projectWorldPoint(worldPosition)
    : null;
  const projectedSpeedPxPerSecond = updateProjectedSpeed(
    state,
    projected,
    deltaMs,
    Boolean(state.direction)
  );
  const footSafety = getMoonlakeProjectedFootSafety(projected, {
    companionId,
    area
  });
  return {
    enabled,
    ready,
    reason,
    moving: Boolean(state.direction),
    animationName: state.direction ? `${state.direction}_walk` : null,
    worldPosition,
    projected,
    projectedSpeedPxPerSecond,
    projectionReady: Boolean(projected),
    scaleMultiplier: Number(projected?.scale) || 1,
    area,
    collisionRadiusPx390: getMoonlakeCollisionRadiusPx390(companionId, area),
    footSafety,
    isFishingSpot: fishingOptions.length > 0 && !state.direction,
    fishingOptions
  };
}

function updateProjectedSpeed(state, projected, deltaMs, moving) {
  const nextX = Number(projected?.x);
  const nextY = Number(projected?.y);
  if (!Number.isFinite(nextX) || !Number.isFinite(nextY)) {
    state.lastProjectedX = null;
    state.lastProjectedY = null;
    state.projectedSpeedPxPerSecond = 0;
    return 0;
  }

  const hasPreviousProjection = state.lastProjectedX != null && state.lastProjectedY != null;
  const previousX = Number(state.lastProjectedX);
  const previousY = Number(state.lastProjectedY);
  state.lastProjectedX = nextX;
  state.lastProjectedY = nextY;
  if (
    !moving
    || !hasPreviousProjection
    || !Number.isFinite(previousX)
    || !Number.isFinite(previousY)
    || deltaMs <= 0
  ) {
    state.projectedSpeedPxPerSecond = 0;
    return 0;
  }

  const instantaneous = Math.hypot(nextX - previousX, nextY - previousY)
    / Math.max(0.001, deltaMs / 1000);
  const previous = Number(state.projectedSpeedPxPerSecond) || instantaneous;
  state.projectedSpeedPxPerSecond = previous + (instantaneous - previous) * 0.32;
  return state.projectedSpeedPxPerSecond;
}

export function getMoonlakeWalkPlaybackRate({
  companionId,
  animationDurationMs,
  projectedSpeedPxPerSecond,
  projectedScale = 1,
  referenceScale390 = 1
} = {}) {
  const authored = MOONLAKE_LOCOMOTION_PROFILES[companionId] || {};
  const profile = { ...DEFAULT_LOCOMOTION_PROFILE, ...authored };
  const durationSeconds = Math.max(0.1, Number(animationDurationMs) / 1000 || 1.6);
  const visibleStride = Math.max(
    4,
    profile.stridePx390
      * Math.max(0.5, Number(projectedScale) || 1)
      * Math.max(0.5, Number(referenceScale390) || 1)
  );
  const rawRate = Math.max(0, Number(projectedSpeedPxPerSecond) || 0)
    * durationSeconds
    / visibleStride;
  return Math.min(
    profile.maxPlaybackRate,
    Math.max(profile.minPlaybackRate, rawRate || profile.minPlaybackRate)
  );
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

export function getMoonlakeFishingOption(
  waypointId,
  animationName,
  mirrorX = false
) {
  const options = MOONLAKE_WORLD_WAYPOINTS[waypointId]?.fishingOptions;
  if (!Array.isArray(options)) return null;
  return options.find((option) => (
    option.animationName === animationName
    && Boolean(option.mirrorX) === Boolean(mirrorX)
  )) || null;
}
