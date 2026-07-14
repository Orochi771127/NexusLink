import { clamp } from "../utils/clamp.js";

/**
 * 俯視相機：跟隨夥伴，clamp 在世界邊界內。
 */
export function createExpeditionCamera(viewWidth, viewHeight) {
  return {
    viewWidth,
    viewHeight,
    x: 0,
    y: 0,
    /** 平滑係數（越大越緊跟）。 */
    followStrength: 6
  };
}

export function resizeExpeditionCamera(camera, viewWidth, viewHeight) {
  if (!camera) return;
  camera.viewWidth = viewWidth;
  camera.viewHeight = viewHeight;
}

export function updateExpeditionCamera(camera, targetX, targetY, worldWidth, worldHeight, deltaSec) {
  if (!camera) return;
  const idealX = targetX - camera.viewWidth / 2;
  const idealY = targetY - camera.viewHeight / 2;
  const maxX = Math.max(0, worldWidth - camera.viewWidth);
  const maxY = Math.max(0, worldHeight - camera.viewHeight);
  const clampedIdealX = clamp(idealX, 0, maxX);
  const clampedIdealY = clamp(idealY, 0, maxY);
  const t = 1 - Math.exp(-camera.followStrength * deltaSec);
  camera.x += (clampedIdealX - camera.x) * t;
  camera.y += (clampedIdealY - camera.y) * t;
}

export function applyCameraToRoot(root, camera) {
  if (!root || !camera) return;
  root.x = -camera.x;
  root.y = -camera.y;
}
