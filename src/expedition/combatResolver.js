import { clamp } from "../utils/clamp.js";

/** 攻擊距離（世界像素）。 */
export const ATTACK_RANGE = 38;
export const ATTACK_INTERVAL_MS = 880;
export const DETECT_RADIUS = 190;

/**
 * 由夥伴 radar 推導遠征戰鬥數值（與 Standoff 引擎無關）。
 */
export function deriveCompanionCombatStats(radar = {}) {
  const power = Number(radar.power) || 50;
  const defense = Number(radar.defense) || 50;
  const emotion = Number(radar.emotion) || 50;
  return {
    atk: Math.round(6 + power * 0.1),
    def: Math.round(3 + defense * 0.08),
    hpMax: Math.round(70 + emotion * 0.25),
    attackIntervalMs: ATTACK_INTERVAL_MS
  };
}

/**
 * 傷害：ATK × 倍率 − DEF × 係數，再 ±10% 浮動。
 */
export function resolveHit({ atk, def = 0, multiplier = 1, rng = Math.random } = {}) {
  const base = atk * multiplier - def * 0.45;
  const jitter = 0.9 + rng() * 0.2;
  return Math.max(1, Math.round(base * jitter));
}

export function canAttackNow(unit, now) {
  return !unit.lastAttackAt || now - unit.lastAttackAt >= (unit.attackIntervalMs || ATTACK_INTERVAL_MS);
}

export function applyAttack(attacker, target, now, rng = Math.random) {
  if (!canAttackNow(attacker, now)) return { hit: false, damage: 0 };
  const damage = resolveHit({
    atk: attacker.atk,
    def: target.def ?? 0,
    rng
  });
  target.hp = clamp((target.hp ?? 0) - damage, 0, target.hpMax ?? 100);
  attacker.lastAttackAt = now;
  return { hit: true, damage };
}

export function isInRange(ax, ay, bx, by, range = ATTACK_RANGE) {
  return Math.hypot(bx - ax, by - ay) <= range;
}

export function isDetected(cx, cy, ex, ey, radius = DETECT_RADIUS) {
  return Math.hypot(ex - cx, ey - cy) <= radius;
}
