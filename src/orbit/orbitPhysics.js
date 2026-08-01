/**
 * 心核迴旋戰 — 簡化軌道物理（純函式／可單測）
 *
 * 不做完整物理引擎：圓形場、轉速衰減、彈性碰撞、出場判定。
 * 單位：正規化座標，場心 (0,0)，半徑約 1。
 */

export const ARENA_RADIUS = 1;
export const AVATAR_RADIUS = 0.09;
export const DUMMY_RADIUS = 0.11;

/**
 * 手感常數（R6 手動調校：競技感提速）
 * 使用者反饋：R5.1 版仍不夠像「戰鬥陀螺」的高速對決感，Cursor 額度已用完，
 * 由 Claude 直接調校。方向：出手更快、彎軌更明顯、對撞更脆更有份量、
 * 場次時長更短促（不再是 70+ 秒的長時間漂移）。
 * 與 BALANCE_SHEET §9.1／§9.5 同步。
 */
export const LAUNCH_PULL_MIN = 0.04;
export const LAUNCH_PULL_MAX = 0.55;
export const LAUNCH_SPEED_BASE = 1.05; // R6：起手就有速度感，不再軟啟動
export const LAUNCH_SPEED_PULL = 4.3; // R6：短拉也能感覺到「甩出去」
export const LAUNCH_SPEED_IMPACT = 0.9;
export const LAUNCH_CHARGE_EXP = 0.82; // <1：短拉仍可控
export const DEFAULT_SPIN_DECAY = 5.4; // R6：轉速衰減加快，讓高潮更集中、不拖戲
export const DEFAULT_FRICTION = 0.05; // R6：平移衰減放鬆，高速能撐得更久
/** 自旋把路徑「甩彎」的強度（戰鬥陀螺感核心） */
export const SPIN_CURVE_STRENGTH = 1.9; // R6：彎軌更明顯，避免看起來像直線彈珠
/**
 * 高轉速時沿當前軌跡持續推進的加速度（每秒）。
 * 5.4/s 等價於舊 R6 在 60 Hz 每步加 0.09，但現在必須乘 dt，
 * 才不會因 FPS／子步數提高而憑空得到更多速度。
 */
export const SPIN_DRIVE = 5.4;
export const SPIN_TARGET_SPEED = 3.2;
export const DEFAULT_SPEED_CAP = 4.2;
export const WALL_BOUNCE = 0.82;
export const BODY_RESTITUTION = 0.78;
export const COLLISION_ENERGY_RETENTION = 0.96;
export const COLLIDE_DAMAGE_MAX_TO_B = 30; // R6：對撞份量加重，減少乾磨
export const COLLIDE_DAMAGE_MAX_TO_A = 26;
/**
 * R6 deterministic baseline：所有 Orbit engine 共用 120 Hz 固定物理步。
 * 一個畫面幀最多補 6 步（50 ms），避免背景分頁恢復時一次追太久。
 */
export const PHYSICS_FIXED_DT = 1 / 120;
export const PHYSICS_MAX_STEPS_PER_FRAME = 6;

export const ORBIT_PHYSICS_MODELS = Object.freeze({
  baseline: "orbit-r6",
  hybridSpin: "hybrid-spin-v1"
});

export const HYBRID_SPIN_PHASES = Object.freeze({
  launch: "launch",
  stable: "stable",
  curving: "curving",
  wobbling: "wobbling",
  stopped: "stopped"
});

const HYBRID_LAUNCH_SECONDS = 0.28;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function capBodySpeed(body) {
  const speed = Math.hypot(body.vx, body.vy);
  if (!body.speedCap || speed <= body.speedCap) return body;
  const scale = body.speedCap / speed;
  return {
    ...body,
    vx: body.vx * scale,
    vy: body.vy * scale
  };
}

function isHybridSpinBody(body) {
  return body?.physicsModel === ORBIT_PHYSICS_MODELS.hybridSpin;
}

/**
 * 將不固定的畫面 dt 轉成固定物理步數。
 *
 * @param {number} accumulator 上一幀未滿一個固定步的剩餘秒數
 * @param {number} frameDt 本幀秒數
 * @returns {{ steps: number, accumulator: number, simulatedDt: number }}
 */
export function planFixedPhysicsSteps(accumulator = 0, frameDt = 0) {
  const safeAccumulator = clamp(
    Number.isFinite(accumulator) ? accumulator : 0,
    0,
    PHYSICS_FIXED_DT
  );
  const maxFrameDt = PHYSICS_FIXED_DT * PHYSICS_MAX_STEPS_PER_FRAME;
  const safeFrameDt = clamp(Number.isFinite(frameDt) ? frameDt : 0, 0, maxFrameDt);
  const total = safeAccumulator + safeFrameDt;
  const steps = Math.min(
    PHYSICS_MAX_STEPS_PER_FRAME,
    Math.floor((total + Number.EPSILON * 8) / PHYSICS_FIXED_DT)
  );
  const simulatedDt = steps * PHYSICS_FIXED_DT;
  const remainder = Math.max(0, total - simulatedDt);
  return {
    steps,
    accumulator: remainder < 1e-12 ? 0 : remainder,
    simulatedDt
  };
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
  inertiaScale = 1,
  team = "player",
  physicsModel = ORBIT_PHYSICS_MODELS.baseline,
  spinDirection = 1,
  tilt = 0.06,
  wobble = 0,
  driveScale = 1,
  driveTargetSpeed = SPIN_TARGET_SPEED,
  speedCap = DEFAULT_SPEED_CAP
} = {}) {
  const hybridSpin = physicsModel === ORBIT_PHYSICS_MODELS.hybridSpin;
  return {
    id,
    x,
    y,
    vx,
    vy,
    spin,
    stability,
    radius,
    inertiaScale: clamp(
      Number.isFinite(inertiaScale) ? inertiaScale : 1,
      0.5,
      1.5
    ),
    team,
    physicsModel,
    spinDirection: spinDirection < 0 ? -1 : 1,
    tilt: clamp(tilt, 0, 1),
    wobble: clamp(wobble, 0, 1),
    driveScale: Math.max(0, Number.isFinite(driveScale) ? driveScale : 1),
    driveTargetSpeed:
      Number.isFinite(driveTargetSpeed) && driveTargetSpeed > 0
        ? driveTargetSpeed
        : SPIN_TARGET_SPEED,
    speedCap:
      Number.isFinite(speedCap) && speedCap > 0
        ? speedCap
        : DEFAULT_SPEED_CAP,
    spinAge: 0,
    spinPhase: hybridSpin
      ? HYBRID_SPIN_PHASES.launch
      : HYBRID_SPIN_PHASES.stable,
    out: false
  };
}

function deriveHybridSpinPhase(body, speed) {
  if (body.out || (body.spin <= 1 && speed < 0.03)) {
    return HYBRID_SPIN_PHASES.stopped;
  }
  if (body.spinAge < HYBRID_LAUNCH_SECONDS) {
    return HYBRID_SPIN_PHASES.launch;
  }
  if (body.spin >= 55 && body.wobble < 0.28) {
    return HYBRID_SPIN_PHASES.stable;
  }
  if (body.spin >= 18 && body.wobble < 0.72) {
    return HYBRID_SPIN_PHASES.curving;
  }
  return HYBRID_SPIN_PHASES.wobbling;
}

function stepHybridSpinLifecycle(body, dt, speed) {
  if (!isHybridSpinBody(body)) return body;

  const next = { ...body, spinAge: body.spinAge + dt };
  const spinRatio = clamp(next.spin / 100, 0, 1);
  const stabilityRatio = clamp(next.stability / 100, 0, 1);
  const targetWobble = clamp(
    (1 - spinRatio) * 0.78 + (1 - stabilityRatio) * 0.38,
    0,
    1
  );
  const wobbleResponse = 1 - Math.exp(-2.4 * dt);
  next.wobble += (targetWobble - next.wobble) * wobbleResponse;

  const targetTilt = clamp(
    0.04 + (1 - spinRatio) * 0.3 + next.wobble * 0.2,
    0,
    1
  );
  const tiltResponse = 1 - Math.exp(-1.8 * dt);
  next.tilt += (targetTilt - next.tilt) * tiltResponse;
  next.spinPhase = deriveHybridSpinPhase(next, speed);
  return next;
}

function disturbHybridSpin(body, severity) {
  if (!isHybridSpinBody(body)) return body;
  const impact = clamp(severity, 0, 1);
  const next = {
    ...body,
    tilt: clamp(body.tilt + impact * 0.12, 0, 1),
    wobble: clamp(body.wobble + impact * 0.2, 0, 1)
  };
  next.spinPhase = deriveHybridSpinPhase(
    next,
    Math.hypot(next.vx, next.vy)
  );
  return next;
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
 * @param {{ spinDecay?: number, friction?: number, arenaRadius?: number, containAtBoundary?: boolean }} [opts]
 */
export function stepBody(body, dt, opts = {}) {
  if (body.out) return body;
  const spinDecay = opts.spinDecay ?? DEFAULT_SPIN_DECAY;
  const friction = opts.friction ?? DEFAULT_FRICTION;
  const arenaRadius = opts.arenaRadius ?? ARENA_RADIUS;
  const containAtBoundary = opts.containAtBoundary === true;

  let next = { ...body };
  next.x += next.vx * dt;
  next.y += next.vy * dt;

  // 轉速自然衰減（比舊版慢咬，讓高速段更長）
  next.spin = Math.max(0, next.spin - spinDecay * dt);
  let speed = Math.hypot(next.vx, next.vy);
  const drag = Math.exp(-Math.max(0, friction) * dt);
  next.vx *= drag;
  next.vy *= drag;
  speed = Math.hypot(next.vx, next.vy);
  next = stepHybridSpinLifecycle(next, dt, speed);

  // 自旋彎軌：路徑會跟著轉，而不是直線彈珠
  if (speed > 0.04 && next.spin > 8) {
    const hybridSpin = isHybridSpinBody(next);
    const wobbleWave = hybridSpin
      ? Math.sin(next.spinAge * 9.5) * next.wobble
      : 0;
    const curve =
      (next.spin / 100) *
      SPIN_CURVE_STRENGTH *
      (hybridSpin ? next.spinDirection : 1) *
      (hybridSpin ? 1 + next.tilt * 1.4 + wobbleWave * 0.32 : 1);
    const turn = curve * dt * 2.4;
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    const vx = next.vx;
    const vy = next.vy;
    next.vx = vx * cos - vy * sin;
    next.vy = vx * sin + vy * cos;
    speed = Math.hypot(next.vx, next.vy);
  }

  // 自旋只把速度維持到目標值，不會越過上限持續製造能量。
  if (next.spin > 18 && speed > 0.02) {
    const wobbleDriveScale = isHybridSpinBody(next)
      ? 1 - next.wobble * 0.35
      : 1;
    const targetSpeed = Math.min(
      next.speedCap || DEFAULT_SPEED_CAP,
      next.driveTargetSpeed || SPIN_TARGET_SPEED
    );
    if (speed < targetSpeed) {
      const response =
        1 -
        Math.exp(
          -SPIN_DRIVE *
            (next.spin / 100) *
            wobbleDriveScale *
            (Number.isFinite(next.driveScale) ? next.driveScale : 1) *
            dt
        );
      const boost = (targetSpeed - speed) * response;
      const ang = Math.atan2(next.vy, next.vx);
      next.vx += Math.cos(ang) * boost;
      next.vy += Math.sin(ang) * boost;
    }
  } else if (next.spin > 28 && speed < 0.12) {
    // 幾乎停住但仍在轉：給一點起步，避免「轉了卻不動」
    const targetSpeed = Math.min(
      next.speedCap || DEFAULT_SPEED_CAP,
      next.driveTargetSpeed || SPIN_TARGET_SPEED
    );
    const response = 1 - Math.exp(-SPIN_DRIVE * 0.5 * dt);
    const boost = Math.max(0, targetSpeed - speed) * response;
    const ang = Math.atan2(next.y || -0.2, next.x || 0.01) + Math.PI * 0.5;
    next.vx += Math.cos(ang) * boost;
    next.vy += Math.sin(ang) * boost;
  }

  const dist = Math.hypot(next.x, next.y);
  if (dist > arenaRadius - next.radius * 0.35) {
    // 一般牆面只耗能反彈；未來只有明示導流環可以提供加速。
    if (!containAtBoundary && dist > arenaRadius + next.radius * 0.15) {
      next.out = true;
      next.vx = 0;
      next.vy = 0;
      if (isHybridSpinBody(next)) {
        next.spinPhase = HYBRID_SPIN_PHASES.stopped;
      }
    } else {
      const nx = next.x / (dist || 1);
      const ny = next.y / (dist || 1);
      const push = arenaRadius - next.radius * 0.5;
      next.x = nx * push;
      next.y = ny * push;
      const dot = next.vx * nx + next.vy * ny;
      if (dot > 0) {
        next.vx = (next.vx - 2 * dot * nx) * WALL_BOUNCE;
        next.vy = (next.vy - 2 * dot * ny) * WALL_BOUNCE;
        next.spin = Math.max(0, next.spin - 2);
        next = disturbHybridSpin(next, Math.min(1, Math.abs(dot) / 4));
      }
    }
  }

  return capBodySpeed(next);
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
      next.vx = (next.vx - 2 * dot * nx) * WALL_BOUNCE;
      next.vy = (next.vy - 2 * dot * ny) * WALL_BOUNCE;
      next.spin = Math.max(0, next.spin - 1);
      next = disturbHybridSpin(next, Math.min(1, Math.abs(dot) / 4));
    }
  }
  return capBodySpeed(next);
}

/**
 * 兩球彈性碰撞；回傳更新後的兩體與對穩定性的衝擊。
 */
export function collideBodies(
  a,
  b,
  impactA = 50,
  impactB = 40,
  guardA = 50,
  guardB = 50,
  options = {}
) {
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
  let a2 = { ...a };
  let b2 = { ...b };
  a2.x -= nx * overlap * 0.55;
  a2.y -= ny * overlap * 0.55;
  b2.x += nx * overlap * 0.55;
  b2.y += ny * overlap * 0.55;

  // 相對速度沿法線
  const rvx = b2.vx - a2.vx;
  const rvy = b2.vy - a2.vy;
  const velAlongNormal = rvx * nx + rvy * ny;
  if (velAlongNormal >= 0) {
    return { a: a2, b: b2, hit: false, damageToA: 0, damageToB: 0 };
  }

  const massA = clamp(
    Number.isFinite(a2.inertiaScale) ? a2.inertiaScale : 1,
    0.5,
    1.5
  );
  const massB = clamp(
    Number.isFinite(b2.inertiaScale) ? b2.inertiaScale : 1,
    0.5,
    1.5
  );
  const inverseMassA = 1 / massA;
  const inverseMassB = 1 / massB;
  const energyBefore =
    massA * (a2.vx * a2.vx + a2.vy * a2.vy) +
    massB * (b2.vx * b2.vx + b2.vy * b2.vy);
  const restitution = BODY_RESTITUTION;
  const j =
    (-(1 + restitution) * velAlongNormal) /
    (inverseMassA + inverseMassB);
  a2.vx -= j * inverseMassA * nx;
  a2.vy -= j * inverseMassA * ny;
  b2.vx += j * inverseMassB * nx;
  b2.vy += j * inverseMassB * ny;
  // 偏心一點：碰撞後帶側向甩，避免「撞完就對撞靜止」
  const tx = -ny;
  const ty = nx;
  const spinKick = ((a2.spin - b2.spin) / 100) * 0.12;
  a2.vx += tx * spinKick;
  a2.vy += ty * spinKick;
  b2.vx -= tx * spinKick;
  b2.vy -= ty * spinKick;

  const energyAfter =
    massA * (a2.vx * a2.vx + a2.vy * a2.vy) +
    massB * (b2.vx * b2.vx + b2.vy * b2.vy);
  const energyBudget = energyBefore * COLLISION_ENERGY_RETENTION;
  if (energyAfter > energyBudget && energyAfter > 1e-12) {
    const energyScale = Math.sqrt(energyBudget / energyAfter);
    a2.vx *= energyScale;
    a2.vy *= energyScale;
    b2.vx *= energyScale;
    b2.vy *= energyScale;
  }
  a2 = capBodySpeed(a2);
  b2 = capBodySpeed(b2);

  // 轉速參與撞擊力
  const spinBonus = (a2.spin + b2.spin) * 0.055;
  const rawToB = 6 + (impactA / 100) * 14 + spinBonus + Math.abs(velAlongNormal) * 8;
  const rawToA = 6 + (impactB / 100) * 12 + spinBonus * 0.8 + Math.abs(velAlongNormal) * 7;
  const damageScaleToA = clamp(options.damageScaleToA ?? 1, 0, 1);
  const damageScaleToB = clamp(options.damageScaleToB ?? 1, 0, 1);
  const damageToB = Math.round(
    clamp(
      rawToB * (1 - guardB / 180) * damageScaleToB,
      damageScaleToB > 0 ? 1 : 0,
      COLLIDE_DAMAGE_MAX_TO_B
    )
  );
  const damageToA = Math.round(
    clamp(
      rawToA * (1 - guardA / 180) * damageScaleToA,
      damageScaleToA > 0 ? 1 : 0,
      COLLIDE_DAMAGE_MAX_TO_A
    )
  );

  a2.stability = clamp(a2.stability - damageToA, 0, 100);
  b2.stability = clamp(b2.stability - damageToB, 0, 100);
  a2.spin = Math.max(0, a2.spin - 3);
  b2.spin = Math.max(0, b2.spin - 3);
  const impactSeverity = Math.min(1, Math.abs(velAlongNormal) / 4);
  a2 = disturbHybridSpin(a2, impactSeverity);
  b2 = disturbHybridSpin(b2, impactSeverity);

  if (a2.stability <= 0) {
    a2.out = true;
    if (isHybridSpinBody(a2)) a2.spinPhase = HYBRID_SPIN_PHASES.stopped;
  }
  if (b2.stability <= 0) {
    b2.out = true;
    if (isHybridSpinBody(b2)) b2.spinPhase = HYBRID_SPIN_PHASES.stopped;
  }

  return { a: a2, b: b2, hit: true, damageToA, damageToB };
}
