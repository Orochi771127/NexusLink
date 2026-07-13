/**
 * 統一的「降低動態」判斷。
 * 優先尊重遊戲設定（設定頁低動態模式），其次尊重系統 prefers-reduced-motion。
 * 設計理念：玩家在設定裡開低動態，應與系統無障礙偏好等效，不必改 OS。
 */
export function prefersReducedMotion() {
  if (typeof document !== "undefined") {
    const preference = document.documentElement?.dataset?.reducedMotionPreference;
    if (preference === "reduced") return true;
  }

  return typeof window !== "undefined"
    && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
}

/**
 * 讀取目前畫質設定（low / medium / high），供 Pixi 環境粒子等做輕量降載。
 * 不動 renderer resolution（既有 LOCKED 約束），只影響可選視覺層。
 */
export function getRenderQuality() {
  const quality = typeof document !== "undefined"
    ? document.documentElement?.dataset?.quality
    : null;
  if (quality === "low" || quality === "medium" || quality === "high") return quality;
  return "high";
}
