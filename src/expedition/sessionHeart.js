import { clamp } from "../utils/clamp.js";

/**
 * Session Heart（RE-2）：遠征場內情緒力學。
 *
 * 設計理念（給初階開發者）：
 * - 這些欄位只活在「這一趟遠征」的 session 裡，結束後不寫進存檔。
 * - Core 的 bond/trust 是長期關係；heart 是當場的累／慌／安心。
 * - Utility AI 讀 heart 來調整「下一步想做什麼」，不是拿來刷等級。
 */

/** @typedef {{
 *   fatigue: number,
 *   stress: number,
 *   feltSafety: number,
 *   curiosityDrive: number,
 *   interventionPressure: number
 * }} SessionHeart */

export function createSessionHeart(relationship = {}, profile = {}) {
  const energy = Number(relationship.energy) || 0;
  const defense = Number(relationship.defense) || 0;
  const curiosity = Number(profile.curiosity) || 0.5;

  // 出發時依 Core 快照推一個合理起點（仍屬 session-only）。
  return {
    fatigue: energy <= 2 ? 0.45 : energy <= 4 ? 0.25 : 0.1,
    stress: defense >= 70 ? 0.35 : 0.12,
    feltSafety: defense >= 70 ? 0.35 : 0.62,
    curiosityDrive: clamp(0.35 + curiosity * 0.5, 0.15, 0.95),
    interventionPressure: 0
  };
}

function ensureHeart(session) {
  if (!session.heart) {
    session.heart = createSessionHeart(session.relationship, session.profile);
  }
  return session.heart;
}

function bump(heart, key, delta, min = 0, max = 1) {
  heart[key] = clamp((Number(heart[key]) || 0) + delta, min, max);
}

/** 察覺到敵人靠近／進入警戒。 */
export function heartOnEnemyAlert(session) {
  const heart = ensureHeart(session);
  bump(heart, "stress", 0.06);
  bump(heart, "feltSafety", -0.04);
}

/** 夥伴受傷。 */
export function heartOnDamageTaken(session, damage = 1) {
  const heart = ensureHeart(session);
  const scale = Math.min(0.18, 0.04 + damage * 0.02);
  bump(heart, "stress", scale);
  bump(heart, "fatigue", scale * 0.7);
  bump(heart, "feltSafety", -scale);
}

/** 擊殺／驅散後：壓力略降，但會累一點疲勞。 */
export function heartOnKill(session) {
  const heart = ensureHeart(session);
  bump(heart, "stress", -0.08);
  bump(heart, "fatigue", 0.05);
  bump(heart, "feltSafety", 0.04);
}

/** 觸發探索記憶：安心與好奇心回升。 */
export function heartOnMemoryEvent(session) {
  const heart = ensureHeart(session);
  bump(heart, "feltSafety", 0.1);
  bump(heart, "curiosityDrive", 0.06);
  bump(heart, "stress", -0.05);
}

/**
 * REST 每秒恢復速率（純時間積分，與 FPS 無關）。
 * 例：連續休息 1 秒 → fatigue 約 -0.08，無論拆成 1 幀或 60 幀。
 */
export const REST_HEART_RATES = Object.freeze({
  fatigue: -0.08,
  stress: -0.06,
  feltSafety: 0.05
});

/**
 * REST 意圖真正有用：降疲勞／壓力、抬安心。
 * P1 fix：只用 deltaMs/1000，禁止每 frame 地板秒數（否則 60FPS 會一秒清零）。
 * @param {number} deltaMs 本幀真實經過毫秒
 */
export function heartOnRestTick(session, deltaMs = 0) {
  const heart = ensureHeart(session);
  const t = Math.max(0, Number(deltaMs) || 0) / 1000;
  if (t <= 0) return heart;
  bump(heart, "fatigue", REST_HEART_RATES.fatigue * t);
  bump(heart, "stress", REST_HEART_RATES.stress * t);
  bump(heart, "feltSafety", REST_HEART_RATES.feltSafety * t);
  return heart;
}

/** 非強制戰術（保守／平衡）：略增安心、略降壓力。 */
export function heartOnGentleTactic(session) {
  const heart = ensureHeart(session);
  bump(heart, "feltSafety", 0.04);
  bump(heart, "stress", -0.03);
}

/** 強制型介入（積極／集火）：提高被強迫感。 */
export function heartOnCoerciveIntervention(session) {
  const heart = ensureHeart(session);
  bump(heart, "interventionPressure", 0.18);
  bump(heart, "stress", 0.05);
  bump(heart, "feltSafety", -0.06);
  // 與既有 playerInterventions 計數對齊（brain 紅線仍可用整數）。
  session.playerInterventions = (session.playerInterventions || 0) + 1;
}

/** 巡邏走動的輕微疲勞（每 brain tick 可呼叫）。 */
export function heartOnPatrolTick(session) {
  const heart = ensureHeart(session);
  bump(heart, "fatigue", 0.015);
  bump(heart, "curiosityDrive", -0.008);
}

export function readSessionHeart(session) {
  return ensureHeart(session);
}
