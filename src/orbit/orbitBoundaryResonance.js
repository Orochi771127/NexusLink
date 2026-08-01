/**
 * Stored-charge Boundary Resonance for the Moonlake V1 slice.
 *
 * The rail may redirect existing motion but cannot create translational or
 * rotational energy. It never advances objectives directly.
 */

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function isAngleInside(angle, start, end) {
  const normalizedAngle = normalizeDegrees(angle);
  const normalizedStart = normalizeDegrees(start);
  const normalizedEnd = normalizeDegrees(end);
  if (normalizedStart <= normalizedEnd) {
    return normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd;
  }
  return normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

export function applyOrbitBoundaryResonance(session, playerBeforeBoundary) {
  if (
    !session?.boundaryResonance ||
    session.attunement?.confirmed !== true ||
    !session.player ||
    session.player.out
  ) {
    return session;
  }

  const flashSeconds = Math.max(
    0.01,
    session.boundaryResonance.flashSeconds || 0.28
  );
  const base = {
    ...session,
    lastBoundaryFlash: Math.max(
      0,
      (session.lastBoundaryFlash || 0) - (session.physicsStepSeconds || 1 / 120)
    )
  };
  if (
    !playerBeforeBoundary ||
    (base.boundaryChargesRemaining || 0) <= 0
  ) {
    return base;
  }

  const player = base.player;
  const distance = Math.hypot(player.x, player.y);
  const contactRadius =
    (base.arenaRadius ?? 1) - Math.max(0, player.radius || 0) * 0.5;
  const tolerance = Math.max(
    0.012,
    base.boundaryResonance.contactTolerance || 0.024
  );
  if (Math.abs(distance - contactRadius) > tolerance) return base;

  const nx = player.x / (distance || 1);
  const ny = player.y / (distance || 1);
  const outwardSpeed =
    (playerBeforeBoundary.vx || 0) * nx +
    (playerBeforeBoundary.vy || 0) * ny;
  const inputSpeed = Math.hypot(
    playerBeforeBoundary.vx || 0,
    playerBeforeBoundary.vy || 0
  );
  const minSpeed = Math.max(0, base.boundaryResonance.minSpeed || 0);
  if (outwardSpeed <= 0 || inputSpeed < minSpeed) return base;

  const angleDeg = normalizeDegrees(Math.atan2(player.y, player.x) * 180 / Math.PI);
  const rail = (base.boundaryResonance.rails || []).find((candidate) =>
    isAngleInside(angleDeg, candidate.startDeg, candidate.endDeg)
  );
  if (!rail) return base;

  const postWallSpeed = Math.hypot(player.vx || 0, player.vy || 0);
  const retention = clamp(
    Number.isFinite(base.boundaryResonance.speedRetention)
      ? base.boundaryResonance.speedRetention
      : 0.96,
    0,
    1
  );
  const outputSpeed = Math.min(inputSpeed, postWallSpeed) * retention;
  const direction = rail.direction < 0 ? -1 : 1;
  const tangentX = -ny * direction;
  const tangentY = nx * direction;
  const spinRetention = clamp(
    Number.isFinite(base.boundaryResonance.spinRetention)
      ? base.boundaryResonance.spinRetention
      : 0.94,
    0,
    1
  );
  const inputSpin = Math.max(0, playerBeforeBoundary.spin || 0);
  const outputSpin = Math.min(inputSpin, Math.max(0, player.spin || 0)) * spinRetention;

  return {
    ...base,
    player: {
      ...player,
      vx: tangentX * outputSpeed,
      vy: tangentY * outputSpeed,
      spin: outputSpin
    },
    boundaryChargesRemaining: base.boundaryChargesRemaining - 1,
    boundaryChargeSpent: (base.boundaryChargeSpent || 0) + 1,
    boundaryResonanceCount: (base.boundaryResonanceCount || 0) + 1,
    lastBoundaryFlash: flashSeconds,
    lastBoundaryRailId: rail.id,
    boundaryResonanceTrace: Object.freeze({
      railId: rail.id,
      inputSpeed,
      outputSpeed,
      inputSpin,
      outputSpin
    })
  };
}
