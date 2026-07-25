/**
 * 心核迴旋戰 — 對決對手設定（R3）
 *
 * CPU：鏡像人機；Ghost：重播玩家上一場拉動。
 * 不涉及網路、排行榜、永久關係加減。
 */

export const DUEL_MODES = Object.freeze({
  cpu: "cpu",
  ghost: "ghost"
});

export const CPU_DUEL_PROFILES = Object.freeze({
  mirror: Object.freeze({
    id: "cpu-mirror",
    mode: DUEL_MODES.cpu,
    name: "鏡像雜訊核",
    copy: "人機對決：拉動發射後旋轉撞擊。核散或出場定勝負——化身散了，夥伴還在。",
    /** 相對玩家 stats 的縮放 */
    impactScale: 0.92,
    spinScale: 0.95,
    guardScale: 0.9,
    burstScale: 0.85,
    /** 發射延遲（秒）與拉動強度偏好 */
    launchDelaySec: 0.35,
    pullStrength: 0.38,
    aimJitter: 0.08
  }),
  pressure: Object.freeze({
    id: "cpu-pressure",
    mode: DUEL_MODES.cpu,
    name: "急轉雜訊核",
    copy: "對手比較敢衝。記得過熱了可以先休息，不必連打。",
    impactScale: 1.05,
    spinScale: 1.0,
    guardScale: 0.85,
    burstScale: 0.9,
    launchDelaySec: 0.2,
    pullStrength: 0.45,
    aimJitter: 0.12
  })
});

export const GHOST_DUEL_PROFILE = Object.freeze({
  id: "ghost-last",
  mode: DUEL_MODES.ghost,
  name: "上一場的幽靈",
  copy: "重播你上一場的拉動節奏。沒有錄過場次時，會改用人機鏡像。",
  impactScale: 1,
  spinScale: 1,
  guardScale: 1,
  burstScale: 1,
  launchDelaySec: 0.25,
  pullStrength: 0.4,
  aimJitter: 0
});

export function listDuelProfiles() {
  return [CPU_DUEL_PROFILES.mirror, CPU_DUEL_PROFILES.pressure, GHOST_DUEL_PROFILE];
}

export function getDuelProfile(id) {
  if (id === GHOST_DUEL_PROFILE.id) return GHOST_DUEL_PROFILE;
  if (id === CPU_DUEL_PROFILES.pressure.id || id === "pressure") {
    return CPU_DUEL_PROFILES.pressure;
  }
  if (id === CPU_DUEL_PROFILES.mirror.id || id === "mirror") {
    return CPU_DUEL_PROFILES.mirror;
  }
  return CPU_DUEL_PROFILES.mirror;
}

/**
 * 從玩家投影 stats 生成對手 stats（仍是投影縮放，不是獨立 ATK 帳）。
 */
export function scaleStatsForOpponent(playerStats, profile) {
  const p = profile || CPU_DUEL_PROFILES.mirror;
  return {
    impact: Math.round((playerStats.impact || 40) * (p.impactScale ?? 1)),
    spin: Math.round((playerStats.spin || 40) * (p.spinScale ?? 1)),
    guard: Math.round((playerStats.guard || 40) * (p.guardScale ?? 1)),
    burst: Math.round((playerStats.burst || 20) * (p.burstScale ?? 1)),
    overheat: Math.round((playerStats.overheat || 10) * 0.85)
  };
}
