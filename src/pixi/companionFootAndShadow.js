/**
 * 夥伴「可見腳接觸點」與地面影子。
 *
 * 設計理念（給維護者）：
 * - Sprite 常在 frame 底部留透明 padding，container 原點 ≠ 看得見的腳掌。
 * - 十字對齊用 opaque-foot；影子也必須跟著同一點，否則腳已落地、影子還在下方 → 看起來懸空。
 * - 橢圓中心就畫在腳接觸點（local 0,0），不再往下硬推固定像素。
 */

const SHADOW_NAME = "companion_ground_shadow";

/** 不透明像素底部中心（相對 companion container 原點）。 */
export function getCompanionOpaqueFoot(companion) {
  if (companion?.__opaqueFoot) return companion.__opaqueFoot;

  const visual = findCompanionVisualSprite(companion) || companion;
  const foot = getOpaqueTextureFoot(visual);
  if (!foot) return { x: 0, y: 0 };
  if (visual === companion) {
    companion.__opaqueFoot = foot;
    return foot;
  }

  const resolved = mapChildLocalToCompanion(visual, foot);
  companion.__opaqueFoot = resolved;
  return resolved;
}

export function invalidateCompanionFootCache(companion) {
  if (!companion) return;
  delete companion.__opaqueFoot;
  delete companion.__opaqueVisualCenter;
  delete companion.__shadowFoot;
}

/**
 * 建立地面影子並掛到 companion（最底層）。
 * 之後呼叫 syncCompanionGroundShadow / __resyncGroundShadow 即可貼齊腳底。
 */
export function attachCompanionGroundShadow(companion, {
  radiusX = 54,
  radiusY = 13,
  alpha = 0.28
} = {}) {
  const shadow = new PIXI.Graphics();
  shadow.name = SHADOW_NAME;
  // 橢圓中心 = Graphics 原點；把 Graphics 移到腳接觸點即貼齊、無間隙。
  shadow.ellipse(0, 0, radiusX, radiusY).fill({ color: 0x000000, alpha });
  companion.__groundShadow = shadow;
  companion.addChildAt(shadow, 0);
  companion.__resyncGroundShadow = () => {
    invalidateCompanionFootCache(companion);
    return syncCompanionGroundShadow(companion);
  };
  syncCompanionGroundShadow(companion);
  return shadow;
}

/** 把影子中心移到可見腳接觸點（或 placeholder 內容底緣）。 */
export function syncCompanionGroundShadow(companion) {
  const shadow = companion?.__groundShadow;
  if (!shadow || shadow.destroyed) return null;

  const foot = getCompanionShadowAnchor(companion);
  shadow.x = Math.round(foot.x);
  shadow.y = Math.round(foot.y);
  companion.__shadowFoot = Object.freeze({ x: shadow.x, y: shadow.y });
  return companion.__shadowFoot;
}

/**
 * 影子錨點：有貼圖就用 opaque-foot；輪廓 placeholder 則用內容底緣中心。
 */
export function getCompanionShadowAnchor(companion) {
  const visual = findCompanionVisualSprite(companion);
  if (visual?.texture) {
    const foot = getCompanionOpaqueFoot(companion);
    // 量得到真實貼圖腳（有 cache 或非「量測失敗的 0,0」）時直接用。
    if (companion.__opaqueFoot) return foot;
  }
  return getContentBottomCenter(companion);
}

function findCompanionVisualSprite(companion) {
  return companion?.children?.find(
    (child) => child
      && child !== companion.__groundShadow
      && child.name !== SHADOW_NAME
      && child instanceof PIXI.Sprite
  ) || null;
}

function getContentBottomCenter(companion) {
  const shadow = companion?.__groundShadow;
  const wasVisible = shadow ? shadow.visible : true;
  if (shadow) shadow.visible = false;
  let bounds = null;
  try {
    bounds = companion.getLocalBounds?.();
  } finally {
    if (shadow) shadow.visible = wasVisible;
  }
  if (!bounds || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) {
    return { x: 0, y: 0 };
  }
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height
  };
}

function mapChildLocalToCompanion(visual, localPoint) {
  const scaleX = Number.isFinite(visual.scale?.x) ? visual.scale.x : 1;
  const scaleY = Number.isFinite(visual.scale?.y) ? visual.scale.y : 1;
  const pivotX = Number(visual.pivot?.x) || 0;
  const pivotY = Number(visual.pivot?.y) || 0;
  const rotation = Number(visual.rotation) || 0;
  const localX = (localPoint.x - pivotX) * scaleX;
  const localY = (localPoint.y - pivotY) * scaleY;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  return {
    x: (Number(visual.x) || 0) + localX * cos - localY * sin,
    y: (Number(visual.y) || 0) + localX * sin + localY * cos
  };
}

function getOpaqueTextureFoot(visual) {
  if (typeof document === "undefined" || !visual?.texture) return null;
  const texture = visual.texture;
  const source = texture.source?.resource;
  const frame = texture.frame;
  const width = Math.round(Number(frame?.width));
  const height = Math.round(Number(frame?.height));
  if (!source || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(
      source,
      Number(frame.x) || 0,
      Number(frame.y) || 0,
      width,
      height,
      0,
      0,
      width,
      height
    );
    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let maxX = -1;
    let maxY = -1;
    for (let y = height - 1; y >= 0; y -= 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] < 16) continue;
        if (maxY < 0) maxY = y;
        if (y === maxY) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
      if (maxY >= 0 && y < maxY) break;
    }
    if (maxY < 0 || maxX < minX) return null;

    const anchorX = Number(visual.anchor?.x) || 0;
    const anchorY = Number(visual.anchor?.y) || 0;
    // 相對 sprite local（已扣 anchor）：底部中心。
    return {
      x: (minX + maxX + 1) / 2 - anchorX * width,
      y: (maxY + 0.5) - anchorY * height
    };
  } catch (error) {
    console.warn("Companion opaque-foot measurement fell back to frame origin:", error);
    return null;
  }
}
