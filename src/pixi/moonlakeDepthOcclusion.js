import {
  MOONLAKE_DEPTH_OCCLUDERS,
  MOONLAKE_VISUAL_MASTER,
  MOONLAKE_WORLD_WAYPOINTS
} from "../three/moonlakeLive3dConfig.js";

const OPAQUE_ALPHA_THRESHOLD = 16;
const NIGHT_MULTIPLIER = Object.freeze({
  red: 0.34 * 0.78,
  green: 0.46 * 0.78,
  blue: 0.68 * 0.78
});
const NIGHT_LIFT = Object.freeze({
  red: 0.006,
  green: 0.014,
  blue: 0.045
});
const opaqueTextureBoundsCache = new WeakMap();

export async function createMoonlakeDepthOcclusion(PIXI, {
  parent,
  live3d,
  getCompanion,
  getEnvironmentState,
  getRoamingSnapshot
}) {
  const root = new PIXI.Container();
  root.name = "moonlake_depth_occlusion";
  root.eventMode = "none";
  root.visible = false;
  parent.addChild(root);

  const entries = [];
  for (const spec of MOONLAKE_DEPTH_OCCLUDERS) {
    try {
      const texture = await PIXI.Assets.load(spec.texture);
      const sprite = new PIXI.Sprite(texture);
      sprite.name = `moonlake_occluder_${spec.id}`;
      sprite.anchor.set(0, 0);
      sprite.eventMode = "none";
      sprite.visible = false;
      sprite.tint = 0xffffff;
      const colorFilter = createOccluderColorFilter(PIXI);
      if (colorFilter) sprite.filters = [colorFilter];
      root.addChild(sprite);
      const clipMask = new PIXI.Graphics();
      clipMask.name = `moonlake_occluder_clip_${spec.id}`;
      clipMask.eventMode = "none";
      root.addChild(clipMask);
      sprite.mask = clipMask;
      entries.push({
        spec,
        sprite,
        colorFilter,
        colorNightAlpha: null,
        clipMask,
        visible: false,
        intersects: false,
        behind: false,
        intersectionArea: 0,
        overlapRatio: 0,
        projectedRect: null,
        projectedBaselineY: null
      });
    } catch (error) {
      console.warn(`Moonlake depth occluder unavailable: ${spec.id}`, error);
    }
  }

  let active = false;
  let lastFoot = null;
  let lastArea = null;
  let companionBoundsSnapshot = null;

  function setActive(nextActive) {
    active = Boolean(nextActive);
    root.visible = active;
    if (!active) {
      entries.forEach((entry) => {
        entry.sprite.visible = false;
        entry.visible = false;
      });
    }
  }

  function update() {
    if (!active || !live3d?.ready) return;
    const companion = getCompanion?.();
    const companionBounds = getGlobalCompanionBounds(companion);
    const foot = getGlobalCompanionFoot(companion, companionBounds);
    const roamingSnapshot = getRoamingSnapshot?.() || null;
    const area = resolveRoamingArea(roamingSnapshot);
    const nightAlpha = clamp01(getEnvironmentState?.()?.nightAlpha);
    lastFoot = foot;
    lastArea = area;
    companionBoundsSnapshot = companionBounds ? { ...companionBounds } : null;

    entries.forEach((entry) => {
      const projected = projectOccluder(entry.spec, live3d);
      entry.projectedRect = projected?.rect || null;
      entry.projectedBaselineY = projected?.baselineY ?? null;
      if (!projected || !companionBounds || !foot) {
        entry.sprite.visible = false;
        entry.visible = false;
        entry.intersects = false;
        entry.behind = false;
        entry.intersectionArea = 0;
        entry.overlapRatio = 0;
        return;
      }

      const topLeft = root.toLocal({
        x: projected.rect.left,
        y: projected.rect.top
      });
      const bottomRight = root.toLocal({
        x: projected.rect.right,
        y: projected.rect.bottom
      });
      entry.sprite.position.set(topLeft.x, topLeft.y);
      entry.sprite.width = bottomRight.x - topLeft.x;
      entry.sprite.height = bottomRight.y - topLeft.y;
      applyOccluderColor(entry, nightAlpha);

      const padding = (Number(entry.spec.boundsPaddingPx390) || 0)
        * projected.referenceScale390;
      const intersects = rectanglesIntersect(
        companionBounds,
        expandRect(projected.rect, padding)
      );
      const behind = entry.spec.mode === "surface"
        ? Boolean(area && entry.spec.surfaces?.includes(area))
        : foot.y <= projected.baselineY;
      const intersection = intersectRect(companionBounds, projected.rect);
      const intersectionArea = intersection
        ? rectArea(intersection)
        : 0;
      const overlapRatio = intersectionArea / Math.max(1, rectArea(companionBounds));
      const visible = Boolean(intersection && intersects && behind);
      entry.sprite.visible = visible;
      entry.visible = visible;
      entry.intersects = intersects;
      entry.behind = behind;
      entry.intersectionArea = intersectionArea;
      entry.overlapRatio = overlapRatio;
      entry.clipMask.clear();
      if (visible) {
        const clipTopLeft = root.toLocal({
          x: intersection.left - 1,
          y: intersection.top - 1
        });
        const clipBottomRight = root.toLocal({
          x: intersection.right + 1,
          y: intersection.bottom + 1
        });
        entry.clipMask
          .rect(
            clipTopLeft.x,
            clipTopLeft.y,
            clipBottomRight.x - clipTopLeft.x,
            clipBottomRight.y - clipTopLeft.y
          )
          .fill({ color: 0xffffff });
      }
    });
  }

  function getDiagnostics() {
    return {
      active,
      loadedCount: entries.length,
      configuredCount: MOONLAKE_DEPTH_OCCLUDERS.length,
      area: lastArea,
      foot: lastFoot ? { ...lastFoot } : null,
      companionBounds: companionBoundsSnapshot,
      visibleIds: entries.filter((entry) => entry.visible).map((entry) => entry.spec.id),
      entries: entries.map((entry) => ({
        id: entry.spec.id,
        mode: entry.spec.mode || "baseline",
        visible: entry.visible,
        intersects: entry.intersects,
        behind: entry.behind,
        intersectionArea: entry.intersectionArea,
        overlapRatio: entry.overlapRatio,
        colorMode: entry.colorFilter ? "matrix-filter" : "tint-fallback",
        colorNightAlpha: entry.colorNightAlpha,
        projectedBaselineY: entry.projectedBaselineY,
        projectedRect: entry.projectedRect ? { ...entry.projectedRect } : null
      }))
    };
  }

  function destroy() {
    parent.removeChild(root);
    root.destroy({ children: true });
  }

  return {
    root,
    setActive,
    update,
    getDiagnostics,
    destroy
  };
}

export function shouldMoonlakeOccluderCover({
  companionBounds,
  foot,
  projectedRect,
  projectedBaselineY,
  mode = "baseline",
  area = null,
  surfaces = [],
  padding = 0
}) {
  if (!companionBounds || !foot || !projectedRect) return false;
  const intersects = rectanglesIntersect(
    companionBounds,
    expandRect(projectedRect, padding)
  );
  if (!intersects) return false;
  if (mode === "surface") return Boolean(area && surfaces.includes(area));
  return Number.isFinite(projectedBaselineY) && foot.y <= projectedBaselineY;
}

function projectOccluder(spec, live3d) {
  const imageRect = spec.imageRect;
  const width = MOONLAKE_VISUAL_MASTER.width;
  const height = MOONLAKE_VISUAL_MASTER.height;
  const topLeft = live3d.projectImageToScreen({
    imageX: imageRect.x / width,
    imageY: imageRect.y / height
  });
  const bottomRight = live3d.projectImageToScreen({
    imageX: (imageRect.x + imageRect.width) / width,
    imageY: (imageRect.y + imageRect.height) / height
  });
  if (!topLeft || !bottomRight) return null;
  const baseline = Number.isFinite(spec.baselineImageY)
    ? live3d.projectImageToScreen({
      imageX: (imageRect.x + imageRect.width / 2) / width,
      imageY: spec.baselineImageY
    })
    : null;
  return {
    rect: {
      left: topLeft.x,
      top: topLeft.y,
      right: bottomRight.x,
      bottom: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    },
    baselineY: baseline?.y ?? bottomRight.y,
    referenceScale390: Number(topLeft.referenceScale390) || 1
  };
}

function getGlobalCompanionBounds(companion) {
  const visual = companion?.__animationController?.getAnimatedSprite?.()
    || companion?.children?.find?.((child) => child?.texture)
    || companion;
  const opaqueBounds = getOpaqueTextureLocalBounds(visual);
  if (opaqueBounds && typeof visual?.toGlobal === "function") {
    try {
      const corners = [
        visual.toGlobal({ x: opaqueBounds.left, y: opaqueBounds.top }),
        visual.toGlobal({ x: opaqueBounds.right, y: opaqueBounds.top }),
        visual.toGlobal({ x: opaqueBounds.left, y: opaqueBounds.bottom }),
        visual.toGlobal({ x: opaqueBounds.right, y: opaqueBounds.bottom })
      ];
      const xs = corners.map((point) => Number(point?.x));
      const ys = corners.map((point) => Number(point?.y));
      if (xs.every(Number.isFinite) && ys.every(Number.isFinite)) {
        const left = Math.min(...xs);
        const top = Math.min(...ys);
        const right = Math.max(...xs);
        const bottom = Math.max(...ys);
        return {
          left,
          top,
          right,
          bottom,
          width: right - left,
          height: bottom - top,
          source: "opaque-frame"
        };
      }
    } catch {
      // Fall through to Pixi bounds when a texture cannot be projected.
    }
  }
  try {
    const bounds = visual?.getBounds?.() || companion?.getBounds?.();
    const left = Number(bounds?.x);
    const top = Number(bounds?.y);
    const width = Number(bounds?.width);
    const height = Number(bounds?.height);
    if (
      !Number.isFinite(left)
      || !Number.isFinite(top)
      || !Number.isFinite(width)
      || !Number.isFinite(height)
      || width <= 0
      || height <= 0
    ) {
      return null;
    }
    return {
      left,
      top,
      right: left + width,
      bottom: top + height,
      width,
      height,
      source: "visual-frame-fallback"
    };
  } catch {
    return null;
  }
}

function getOpaqueTextureLocalBounds(visual) {
  const texture = visual?.texture;
  if (!texture || typeof document === "undefined") return null;
  if (opaqueTextureBoundsCache.has(texture)) {
    return opaqueTextureBoundsCache.get(texture);
  }

  const source = texture.source?.resource;
  const frame = texture.frame;
  const frameWidth = Math.round(Number(frame?.width));
  const frameHeight = Math.round(Number(frame?.height));
  if (
    !source
    || !Number.isFinite(frameWidth)
    || !Number.isFinite(frameHeight)
    || frameWidth <= 0
    || frameHeight <= 0
    || texture.rotate
  ) {
    opaqueTextureBoundsCache.set(texture, null);
    return null;
  }

  let result = null;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = frameWidth;
    canvas.height = frameHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      opaqueTextureBoundsCache.set(texture, null);
      return null;
    }
    context.drawImage(
      source,
      Number(frame.x) || 0,
      Number(frame.y) || 0,
      frameWidth,
      frameHeight,
      0,
      0,
      frameWidth,
      frameHeight
    );
    const opaque = measureOpaquePixelBounds(
      context.getImageData(0, 0, frameWidth, frameHeight).data,
      frameWidth,
      frameHeight,
      OPAQUE_ALPHA_THRESHOLD
    );
    if (opaque) {
      const originalWidth = Number(texture.orig?.width) || frameWidth;
      const originalHeight = Number(texture.orig?.height) || frameHeight;
      const trimX = Number(texture.trim?.x) || 0;
      const trimY = Number(texture.trim?.y) || 0;
      const anchorX = Number(visual.anchor?.x) || 0;
      const anchorY = Number(visual.anchor?.y) || 0;
      result = {
        left: opaque.left + trimX - anchorX * originalWidth,
        top: opaque.top + trimY - anchorY * originalHeight,
        right: opaque.right + trimX - anchorX * originalWidth,
        bottom: opaque.bottom + trimY - anchorY * originalHeight
      };
    }
  } catch (error) {
    console.warn("Moonlake opaque-frame bounds fell back to visual bounds:", error);
  }
  opaqueTextureBoundsCache.set(texture, result);
  return result;
}

export function measureOpaquePixelBounds(
  pixels,
  width,
  height,
  alphaThreshold = OPAQUE_ALPHA_THRESHOLD
) {
  if (
    !pixels
    || !Number.isInteger(width)
    || !Number.isInteger(height)
    || width <= 0
    || height <= 0
    || pixels.length < width * height * 4
  ) {
    return null;
  }
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  const threshold = Math.max(0, Math.min(255, Number(alphaThreshold) || 0));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (pixels[(y * width + x) * 4 + 3] < threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return null;
  return {
    left: minX,
    top: minY,
    right: maxX + 1,
    bottom: maxY + 1,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  };
}

function getGlobalCompanionFoot(companion, bounds) {
  if (!companion || !bounds) return null;
  try {
    const opaque = companion.__opaqueFoot;
    if (opaque && typeof companion.toGlobal === "function") {
      const point = companion.toGlobal({
        x: Number(opaque.x) || 0,
        y: Number(opaque.y) || 0
      });
      if (Number.isFinite(point?.x) && Number.isFinite(point?.y)) {
        return { x: Number(point.x), y: Number(point.y) };
      }
    }
  } catch {
    // Fall back to the rendered bounds when a sprite has no audited opaque foot.
  }
  return {
    x: bounds.left + bounds.width / 2,
    y: bounds.bottom
  };
}

function resolveRoamingArea(snapshot) {
  const waypointId = snapshot?.targetId || snapshot?.currentId;
  return MOONLAKE_WORLD_WAYPOINTS[waypointId]?.area || null;
}

function rectanglesIntersect(a, b) {
  return (
    a.left < b.right
    && a.right > b.left
    && a.top < b.bottom
    && a.bottom > b.top
  );
}

function intersectRect(a, b) {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  const right = Math.min(a.right, b.right);
  const bottom = Math.min(a.bottom, b.bottom);
  if (right <= left || bottom <= top) return null;
  return { left, top, right, bottom };
}

function expandRect(rect, padding) {
  const safePadding = Math.max(0, Number(padding) || 0);
  return {
    left: rect.left - safePadding,
    top: rect.top - safePadding,
    right: rect.right + safePadding,
    bottom: rect.bottom + safePadding
  };
}

function rectArea(rect) {
  return Math.max(0, Number(rect?.right) - Number(rect?.left))
    * Math.max(0, Number(rect?.bottom) - Number(rect?.top));
}

function createOccluderColorFilter(PIXI) {
  if (typeof PIXI?.ColorMatrixFilter !== "function") return null;
  return new PIXI.ColorMatrixFilter();
}

function applyOccluderColor(entry, nightAlpha) {
  const amount = clamp01(nightAlpha);
  if (entry.colorNightAlpha === amount) return;
  entry.colorNightAlpha = amount;
  if (entry.colorFilter) {
    entry.colorFilter.matrix = getMoonlakeOccluderColorMatrix(amount);
    entry.sprite.tint = 0xffffff;
    return;
  }

  const matrix = getMoonlakeOccluderColorMatrix(amount);
  const red = Math.round(clamp01(matrix[0]) * 255);
  const green = Math.round(clamp01(matrix[6]) * 255);
  const blue = Math.round(clamp01(matrix[12]) * 255);
  entry.sprite.tint = (red << 16) | (green << 8) | blue;
}

export function getMoonlakeOccluderColorMatrix(nightAlpha) {
  const amount = clamp01(nightAlpha);
  return [
    mix(1, NIGHT_MULTIPLIER.red, amount), 0, 0, 0, NIGHT_LIFT.red * amount,
    0, mix(1, NIGHT_MULTIPLIER.green, amount), 0, 0, NIGHT_LIFT.green * amount,
    0, 0, mix(1, NIGHT_MULTIPLIER.blue, amount), 0, NIGHT_LIFT.blue * amount,
    0, 0, 0, 1, 0
  ];
}

function mix(from, to, amount) {
  return from + (to - from) * amount;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}
