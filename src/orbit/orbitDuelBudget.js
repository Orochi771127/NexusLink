/**
 * 對決 session budget（R3）
 *
 * 連續開戰會抬高過熱壓力；達門檻則拒戰／要求休息。
 * session-only，不寫存檔、不扣 bond。
 */

const MAX_CONSECUTIVE = 3;
const REST_COOLDOWN_MS = 45_000;

let consecutiveDuels = 0;
let lastDuelEndedAt = 0;
let forcedRestUntil = 0;

export function resetOrbitDuelBudgetForTests() {
  consecutiveDuels = 0;
  lastDuelEndedAt = 0;
  forcedRestUntil = 0;
}

export function getOrbitDuelBudgetSnapshot() {
  return {
    consecutiveDuels,
    lastDuelEndedAt,
    forcedRestUntil,
    maxConsecutive: MAX_CONSECUTIVE
  };
}

/**
 * @param {{ overheat?: number }} playerStats
 * @param {number} [now]
 */
export function canStartOrbitDuel(playerStats = {}, now = Date.now()) {
  if (now < forcedRestUntil) {
    const sec = Math.ceil((forcedRestUntil - now) / 1000);
    return {
      ok: false,
      reason: `化身還在降溫（約 ${sec} 秒）。先休息一下，不必連打。`
    };
  }

  // 自然冷卻：超過冷卻時間重置連戰計數
  if (lastDuelEndedAt && now - lastDuelEndedAt >= REST_COOLDOWN_MS) {
    consecutiveDuels = 0;
  }

  const overheat = Number(playerStats.overheat) || 0;
  if (overheat >= 70 && consecutiveDuels >= 2) {
    return {
      ok: false,
      reason: "過熱偏高，連打太多次了。先回棲地喘口氣再來。"
    };
  }
  if (consecutiveDuels >= MAX_CONSECUTIVE) {
    forcedRestUntil = now + REST_COOLDOWN_MS;
    consecutiveDuels = 0;
    return {
      ok: false,
      reason: "連續對決三次了。化身需要休息，先離開一下吧。"
    };
  }

  return { ok: true, reason: null };
}

/** 一場對決結束（含撤退）後呼叫 */
export function recordOrbitDuelFinished(now = Date.now()) {
  consecutiveDuels += 1;
  lastDuelEndedAt = now;
  if (consecutiveDuels >= MAX_CONSECUTIVE) {
    forcedRestUntil = now + REST_COOLDOWN_MS;
  }
}

/** 玩家主動休息（回地圖／關閉）可提早降連戰壓 */
export function easeOrbitDuelBudget() {
  consecutiveDuels = Math.max(0, consecutiveDuels - 1);
}
