/**
 * 幽靈對手錄製（R3）
 *
 * 只記上一場玩家的拉動向量與基本 stats 縮放用快照。
 * session-only，不做網路同步。
 */

/** @type {{ pullDx: number, pullDy: number, recordedAt: number } | null} */
let lastGhostPull = null;

export function resetOrbitGhostForTests() {
  lastGhostPull = null;
}

export function hasOrbitGhostRecording() {
  return Boolean(lastGhostPull);
}

export function getOrbitGhostRecording() {
  return lastGhostPull ? { ...lastGhostPull } : null;
}

/**
 * 玩家發射時錄下一筆（對決用）。
 */
export function recordOrbitGhostPull(pullDx, pullDy) {
  lastGhostPull = {
    pullDx: Number(pullDx) || 0,
    pullDy: Number(pullDy) || 0,
    recordedAt: Date.now()
  };
  return getOrbitGhostRecording();
}
