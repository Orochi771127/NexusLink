/**
 * 遠征個性權重（Utility AI 用）。
 * 與棲地 personality 分離：這裡只描述「在外探索時」的行為偏好。
 */
export const COMPANION_ADVENTURE_PROFILES = Object.freeze({
  "greyshade-cat": Object.freeze({
    id: "greyshade-cat",
    label: "灰影貓",
    /** 勇氣：越高越願意接戰（Phase C 用）。 */
    aggression: 0.35,
    /** 好奇心：越高越愛探 hidden corner。 */
    curiosity: 0.85,
    /** 風險厭惡：越高越易撤退（Phase C 用）。 */
    riskAversion: 0.72,
    /** 探索半径偏好（世界像素）。 */
    exploreRadius: 420,
    /** 低血量脫離阈值（Phase C 用）。 */
    retreatHpRatio: 0.35
  })
});

export function getAdventureProfile(companionId) {
  return COMPANION_ADVENTURE_PROFILES[companionId] || COMPANION_ADVENTURE_PROFILES["greyshade-cat"];
}
