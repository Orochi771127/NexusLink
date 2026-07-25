/**
 * 心核迴旋戰 — 簡化軌道物理（純函式／可單測）
 *
 * 不做完整物理引擎：圓形場、轉速衰減、彈性碰撞、出場判定。
 * 單位：正規化座標，場心 (0,0)，半徑約 1。
 */

export const ARENA_RADIUS = 1;
export const AVATAR_RADIUS = 0.09;
export const DUMMY_RADIUS = 0.11;

/** R5 手感常數（與 BALANCE_SHEET §9.5 同步） */
export const LAUNCH_PULL_MIN = 0.04;
export const LAUNCH_PULL_MAX = 0.52;
export const LAUNCH_SPEED_BASE = 0.48;
export const LAUNCH_SPEED_PULL = 2.05;
export const LAUNCH_SPEED_IMPACT = 0.48;
export const LAUNCH_CHARGE_EXP = 0.85; // <1：短拉更可控
export const DEFAULT_SPIN_DECAY = 6.2;
export const DEFAULT_FRICTION = 0.15;
export const COLLIDE_DAMAGE_MAX_TO_B = 24;
export const COLLIDE_DAMAGE_MAX_TO_A = 22;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function createBody({
  id,
  x = 0,
  y = 0,
  vx = 0,
  vy = 0,
  spin = 40,
  stability = 100,
  radius = AVATAR_RADIUS,
  team = "player"
} = {}) {
  return {
    id,
    x,
    y,
    vx,
    vy,
    spin,
    stability,
    radius,
    team,
    out: false
  };
}

/**
 * 拉動向量 → 初速（拉力越長越快，但有上限）。
 * pullDx/pullDy：從發射點「往後拉」的螢幕相對量（已正規化）。
 */
export function launchVelocityFromPull(pullDx, pullDy, impactStat = 50) {
  const len = Math.hypot(pullDx, pullDy);
  const capped = clamp(len, LAUNCH_PULL_MIN, LAUNCH_PULL_MAX);
  // 短拉更可控：電荷做緩和曲線，長拉仍有爆發
  const charge = Math.pow(capped / LAUNCH_PULL_MAX, LAUNCH_CHARGE_EXP) * LAUNCH_PULL_MAX;
  // 往反方向發射（放開橡皮筋）
  const nx = len > 1e-6 ? -pullDx / len : 0;
  const ny = len > 1e-6 ? -pullDy / len : -1;
  const speed =
    LAUNCH_SPEED_BASE +
    charge * LAUNCH_SPEED_PULL +
    (clamp(impactStat, 0, 100) / 100) * LAUNCH_SPEED_IMPACT;
  return { vx: nx * speed, vy: ny * speed, charge };
}

/**
 * @param {ReturnType<typeof createBody>} body
 * @param {number} dt 秒
 * @param {{ spinDecay?: number, friction?: number, arenaRadius?: number }} [opts]
 */
export function stepBody(body, dt, opts = {}) {
  if (body.out) return body;
  const spinDecay = opts.spinDecay ?? DEFAULT_SPIN_DECAY;
  const friction = opts.friction ?? DEFAULT_FRICTION;
  const arenaRadius = opts.arenaRadius ?? ARENA_RADIUS;

  const next = { ...body };
  next.x += next.vx * dt;
  next.y += next.vy * dt;

  // 轉速提供一點向心「貼場」感，並自然衰減
  next.spin = Math.max(0, next.spin - spinDecay * dt);
  const speed = Math.hypot(next.vx, next.vy);
  const drag = Math.max(0, 1 - friction * dt);
  next.vx *= drag;
  next.vy *= drag;

  // 轉得越快，越不容易被摩擦咬死
  if (next.spin > 20 && speed < 0.15) {
    const boost = (next.spin / 100) * 0.02;
    const ang = Math.atan2(next.vy || -0.01, next.vx || 0.01);
    next.vx += Math.cos(ang) * boost;
    next.vy += Math.sin(ang) * boost;
  }

  const dist = Math.hypot(next.x, next.y);
  if (dist > arenaRadius - next.radius * 0.35) {
    // 擦邊可加速一點（彈珠手感），過頭則出場
    if (dist > arenaRadius + next.radius * 0.15) {
      next.out = true;
      next.vx = 0;
      next.vy = 0;
    } else {
      const nx = next.x / (dist || 1);
      const ny = next.y / (dist || 1);
      const push = arenaRadius - next.radius * 0.5;
      next.x = nx * push;
      next.y = ny * push;
      // 反射
      const dot = next.vx * nx + next.vy * ny;
      next.vx = (next.vx - 2 * dot * nx) * 0.92;
      next.vy = (next.vy - 2 * dot * ny) * 0.92;
      next.spin = Math.min(100, next.spin + 4);
    }
  }

  return next;
}

/**
 * 與靜態護盾柱碰撞（柱不動，只彈開身體）。
 * @param {ReturnType<typeof createBody>} body
 * @param {{ x: number, y: number, r: number }[]} pillars
 */
export function collidePillars(body, pillars = []) {
  if (!body || body.out || !pillars.length) return body;
  let next = { ...body };
  for (const pillar of pillars) {
    const dx = next.x - pillar.x;
    const dy = next.y - pillar.y;
    const dist = Math.hypot(dx, dy);
    const minDist = next.radius + pillar.r;
    if (dist >= minDist || dist < 1e-8) continue;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;
    next.x += nx * overlap;
    next.y += ny * overlap;
    const dot = next.vx * nx + next.vy * ny;
    if (dot < 0) {
      next.vx = (next.vx - 2 * dot * nx) * 0.9;
      next.vy = (next.vy - 2 * dot * ny) * 0.9;
      next.spin = Math.min(100, next.spin + 2);
    }
  }
  return next;
}

/**
 * 兩球彈性碰撞；回傳更新後的兩體與對穩定性的衝擊。
 */
export function collideBodies(a, b, impactA = 50, impactB = 40, guardA = 50, guardB = 50) {
  if (a.out || b.out) return { a, b, hit: false, damageToA: 0, damageToB: 0 };

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const minDist = a.radius + b.radius;
  if (dist >= minDist || dist < 1e-8) {
    return { a, b, hit: false, damageToA: 0, damageToB: 0 };
  }

  const nx = dx / dist;
  const ny = dy / dist;
  // 位置分離
  const overlap = minDist - dist;
  const a2 = { ...a };
  const b2 = { ...b };
  a2.x -= nx * overlap * 0.55;
  a2.y -= ny * overlap * 0.55;
  b2.x += nx * overlap * 0.55;
  b2.y += ny * overlap * 0.55;

  // 相對速度沿法線
  const rvx = a2.vx - b2.vx;
  const rvy = a2.vy - b2.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal > 0) {
    return { a: a2, b: b2, hit: false, damageToA: 0, damageToB: 0 };
  }

  const restitution = 0.78;
  const j = -(1 + restitution) * velAlongNormal * 0.5;
  a2.vx -= j * nx;
  a2.vy -= j * ny;
  b2.vx += j * nx;
  b2.vy += j * ny;

  // 轉速參與撞擊力
  const spinBonus = (a2.spin + b2.spin) * 0.04;
  const rawToB = 6 + (impactA / 100) * 14 + spinBonus + Math.abs(velAlongNormal) * 8;
  const rawToA = 6 + (impactB / 100) * 12 + spinBonus * 0.8 + Math.abs(velAlongNormal) * 7;
  const damageToB = Math.round(clamp(rawToB * (1 - guardB / 180), 2, COLLIDE_DAMAGE_MAX_TO_B));
  const damageToA = Math.round(clamp(rawToA * (1 - guardA / 180), 2, COLLIDE_DAMAGE_MAX_TO_A));

  a2.stability = clamp(a2.stability - damageToA, 0, 100);
  b2.stability = clamp(b2.stability - damageToB, 0, 100);
  a2.spin = Math.max(0, a2.spin - 3);
  b2.spin = Math.max(0, b2.spin - 3);

  if (a2.stability <= 0) a2.out = true;
  if (b2.stability <= 0) b2.out = true;

  return { a: a2, b: b2, hit: true, damageToA, damageToB };
}
