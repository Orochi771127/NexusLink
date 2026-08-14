import {
  MOONLAKE_COMPANION_PRESENTATION,
  MOONLAKE_NAVIGATION_SAFETY
} from "../three/moonlakeLive3dConfig.js";

export function getMoonlakeCompanionPresentation(companionId) {
  return MOONLAKE_COMPANION_PRESENTATION[companionId]
    || MOONLAKE_COMPANION_PRESENTATION.default;
}

export function getMoonlakePresentationScale(companionId, area, animationName) {
  const profile = getMoonlakeCompanionPresentation(companionId);
  let scale = Number(profile.habitatScale) || 1;
  if (area === "bridge" || area === "fishing_spot") {
    scale *= Number(profile.bridgeScale) || 1;
  }
  if (String(animationName || "").startsWith("fishing_")) {
    scale *= Number(profile.fishingScale) || 1;
  }
  return scale;
}

export function getMoonlakeCollisionRadiusPx390(companionId, area) {
  const profile = getMoonlakeCompanionPresentation(companionId);
  const radius = Math.max(8, Number(profile.collisionRadiusPx390) || 22);
  return area === "bridge" || area === "fishing_spot"
    ? radius * MOONLAKE_NAVIGATION_SAFETY.bridgeCollisionMultiplier
    : radius;
}

export function getMoonlakeProjectedFootSafety(projected, {
  companionId,
  area
} = {}) {
  const x = Number(projected?.x);
  const y = Number(projected?.y);
  const referenceScale390 = Math.max(0.01, Number(projected?.referenceScale390) || 1);
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return {
      safe: false,
      reason: "projection_unavailable",
      clearanceRadiusPx390: getMoonlakeCollisionRadiusPx390(companionId, area),
      violations: []
    };
  }

  const navigationX390 = Number(projected?.navigationX390);
  const navigationY390 = Number(projected?.navigationY390);
  const pointX390 = Number.isFinite(navigationX390)
    ? navigationX390
    : x / referenceScale390;
  const pointY390 = Number.isFinite(navigationY390)
    ? navigationY390
    : y / referenceScale390;
  const clearanceRadiusPx390 = getMoonlakeCollisionRadiusPx390(companionId, area);
  const walkableSurface = MOONLAKE_NAVIGATION_SAFETY.walkableSurfaces
    .filter((surface) => surface.areas.includes(area))
    .find((surface) => containsWalkableSurface(
      pointX390,
      pointY390,
      clearanceRadiusPx390,
      surface
    ));
  const violations = MOONLAKE_NAVIGATION_SAFETY.footprints
    .filter((footprint) => footprint.areas.includes(area))
    .filter((footprint) => intersectsFootprint(
      pointX390,
      pointY390,
      clearanceRadiusPx390,
      footprint
    ))
    .map((footprint) => footprint.id);

  return {
    safe: Boolean(walkableSurface) && violations.length === 0,
    reason: !walkableSurface
      ? "outside_walkable_surface"
      : violations.length === 0
        ? "clear"
        : "prop_clearance",
    pointX390,
    pointY390,
    clearanceRadiusPx390,
    walkableSurfaceId: walkableSurface?.id || null,
    violations
  };
}

export function isMoonlakeRouteSegmentSafe(fromWorld, toWorld, {
  companionId,
  area,
  projectWorldPoint
} = {}) {
  if (typeof projectWorldPoint !== "function") return true;
  const sampleCount = Math.max(2, MOONLAKE_NAVIGATION_SAFETY.segmentSamples);
  for (let index = 0; index <= sampleCount; index += 1) {
    const progress = index / sampleCount;
    const projected = projectWorldPoint({
      x: lerp(fromWorld.x, toWorld.x, progress),
      y: lerp(fromWorld.y, toWorld.y, progress),
      z: lerp(fromWorld.z, toWorld.z, progress)
    });
    const safety = getMoonlakeProjectedFootSafety(projected, {
      companionId,
      area
    });
    if (!safety.safe) return false;
  }
  return true;
}

function intersectsFootprint(x, y, clearance, footprint) {
  if (footprint.shape === "ellipse") {
    const radiusX = Math.max(1, Number(footprint.radiusXPx390) + clearance);
    const radiusY = Math.max(1, Number(footprint.radiusYPx390) + clearance * 0.56);
    const normalizedX = (x - Number(footprint.x390)) / radiusX;
    const normalizedY = (y - Number(footprint.y390)) / radiusY;
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }
  const radius = Math.max(1, Number(footprint.radiusPx390) + clearance);
  return Math.hypot(
    x - Number(footprint.x390),
    y - Number(footprint.y390)
  ) <= radius;
}

function containsWalkableSurface(x, y, clearance, surface) {
  if (surface.shape === "ellipse") {
    const radiusX = Math.max(1, Number(surface.radiusXPx390) - clearance);
    const radiusY = Math.max(1, Number(surface.radiusYPx390) - clearance * 0.56);
    const normalizedX = (x - Number(surface.x390)) / radiusX;
    const normalizedY = (y - Number(surface.y390)) / radiusY;
    return normalizedX * normalizedX + normalizedY * normalizedY <= 1;
  }
  if (surface.shape === "polyline") {
    const points = Array.isArray(surface.points) ? surface.points : [];
    const radius = Math.max(1, Number(surface.radiusPx390) - clearance);
    for (let index = 0; index < points.length - 1; index += 1) {
      const from = points[index];
      const to = points[index + 1];
      if (distanceToSegment(
        x,
        y,
        Number(from.x390),
        Number(from.y390),
        Number(to.x390),
        Number(to.y390)
      ) <= radius) {
        return true;
      }
    }
  }
  return false;
}

function distanceToSegment(pointX, pointY, fromX, fromY, toX, toY) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 0.000001) return Math.hypot(pointX - fromX, pointY - fromY);
  const progress = Math.min(1, Math.max(
    0,
    ((pointX - fromX) * dx + (pointY - fromY) * dy) / lengthSquared
  ));
  return Math.hypot(
    pointX - (fromX + dx * progress),
    pointY - (fromY + dy * progress)
  );
}

function lerp(from, to, progress) {
  return Number(from) + (Number(to) - Number(from)) * progress;
}
