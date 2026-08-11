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
  }),
  "blazetail-kit": Object.freeze({
    id: "blazetail-kit",
    label: "Blazetail Kit",
    // Brisk and expressive, but still able to refuse pressure and retreat.
    aggression: 0.52,
    curiosity: 0.76,
    riskAversion: 0.48,
    exploreRadius: 400,
    retreatHpRatio: 0.42
  }),
  "crystalfin-seahorse": Object.freeze({
    id: "crystalfin-seahorse",
    label: "Crystalfin Seahorse",
    // Quiet and sensitive: it reads the current before committing to contact.
    aggression: 0.28,
    curiosity: 0.74,
    riskAversion: 0.7,
    exploreRadius: 390,
    retreatHpRatio: 0.48
  })
});

/**
 * 正式遠征人格查詢（fail-closed）。
 * 未知角色回 null——禁止默默變成灰影貓（RE-1 E-PERSONA）。
 */
export function getAdventureProfile(companionId) {
  if (!companionId) return null;
  return COMPANION_ADVENTURE_PROFILES[companionId] || null;
}

/** 是否具備可開遠征的正式 adventure profile。 */
export function hasAdventureProfile(companionId) {
  return Boolean(getAdventureProfile(companionId));
}
