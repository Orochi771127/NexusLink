/**
 * 心核迴旋戰 — 關係 → 戰鬥詞投影（純函式）
 *
 * 設計理念（給初階開發者）：
 * - 畫面上看得到「衝擊／旋轉／韌性…」，但底層不另開永久 ATK 帳本。
 * - 數值只「讀」羈絆／信任／精力／疲勞與近期共同經歷，再投影成戰鬥用縮放。
 * - 純聊天不得直接加 Impact（由呼叫端保證：recentSharedActions 不含純閒聊）。
 */

/** @typedef {{
 *  bond?: number,
 *  trust?: number,
 *  energy?: number,
 *  defense?: number,
 *  touchFatigue?: number,
 *  mood?: string
 * }} OrbitVitals */

/** @typedef {{
 *  sharedActionCount?: number,
 *  highTensionMemoryCount?: number,
 *  syncProxy?: number
 * }} OrbitRecentEvidence */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min));
}

/**
 * @param {OrbitVitals} vitals
 * @param {OrbitRecentEvidence} [recentEvidence]
 * @returns {{
 *  impact: number,
 *  spin: number,
 *  guard: number,
 *  burst: number,
 *  overheat: number,
 *  canLaunch: boolean,
 *  refuseReason: string | null,
 *  label: string
 * }}
 */
export function projectOrbitCombatStats(vitals = {}, recentEvidence = {}) {
  const bond = clamp(vitals.bond, 0, 100);
  const trust = clamp(vitals.trust, 0, 100);
  const energy = clamp(vitals.energy, 0, 10);
  const defense = clamp(vitals.defense, 0, 100);
  const touchFatigue = clamp(vitals.touchFatigue, 0, 10);

  const shared = clamp(recentEvidence.sharedActionCount ?? 0, 0, 12);
  const tension = clamp(recentEvidence.highTensionMemoryCount ?? 0, 0, 6);
  // 沒有頂層 sync 欄位時，用 trust/bond 推一個「默契代理值」0–1
  const syncProxy = clamp(
    recentEvidence.syncProxy ?? (trust * 0.55 + bond * 0.45) / 100,
    0,
    1
  );

  // 衝擊：羈絆 × 共同行動（聊天不進 sharedActionCount）
  const impact = Math.round(
    clamp(18 + bond * 0.42 + shared * 3.5, 12, 92)
  );
  // 旋轉：默契穩定
  const spin = Math.round(clamp(20 + syncProxy * 55 + bond * 0.12, 14, 90));
  // 韌性：信任 + 邊界健康（邊界過高＝戒心過重反而脆一點）
  const boundaryHealth = clamp(100 - Math.abs(defense - 35) * 0.85, 20, 100);
  const guard = Math.round(clamp(16 + trust * 0.48 + boundaryHealth * 0.22, 12, 90));
  // 爆發：高張力共同記憶
  const burst = Math.round(clamp(10 + tension * 9 + bond * 0.08, 8, 85));
  // 過熱：疲勞／低精力抬高風險
  const overheat = Math.round(
    clamp(touchFatigue * 8 + (energy <= 3 ? 18 : 0) + (energy <= 1 ? 12 : 0), 0, 95)
  );

  let canLaunch = true;
  let refuseReason = null;
  if (energy <= 1) {
    canLaunch = false;
    refuseReason = "太累了……化身現在穩不起來。先休息一下好嗎？";
  } else if (trust < 3 && touchFatigue >= 7) {
    canLaunch = false;
    refuseReason = "邊界還刺刺的。今天先不要硬轉，好嗎？";
  }

  return {
    impact,
    spin,
    guard,
    burst,
    overheat,
    canLaunch,
    refuseReason,
    label: "數值不是等級，是你們現在有多合得來。"
  };
}

/**
 * 從遊戲 state 抽出投影用 vitals（只讀）。
 * @param {object} state
 */
export function vitalsFromState(state = {}) {
  return {
    bond: state.bond,
    trust: state.trust,
    energy: state.energy,
    defense: state.defense,
    touchFatigue: state.touchFatigue,
    mood: state.mood
  };
}

/**
 * 粗估近期共同經歷（R1 暫用；不寫入存檔）。
 * 共同行動來源刻意排除純聊天次數。
 */
export function recentEvidenceFromState(state = {}) {
  const memories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  const traces = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];
  const highTension = memories.filter((m) => {
    const intensity = Number(m?.intensity ?? m?.baseIntensity ?? 0);
    return intensity >= 0.7;
  }).length;
  // 痕跡與探索痕跡當「一起經歷」代理；Soul Talk 回合數不計入
  const sharedActionCount = Math.min(12, traces.length + Math.floor(memories.length / 2));
  return {
    sharedActionCount,
    highTensionMemoryCount: Math.min(6, highTension),
    syncProxy: undefined
  };
}
