import {
  MOONLAKE_DEPTH_OCCLUDERS,
  MOONLAKE_VISUAL_MASTER,
  MOONLAKE_WORLD_WAYPOINTS
} from "../three/moonlakeLive3dConfig.js";

const NIGHT_TINT = 0x5d759f;
const DAY_TINT = 0xd4d4d4;

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
      root.addChild(sprite);
      const clipMask = new PIXI.Graphics();
      clipMask.name = `moonlake_occluder_clip_${spec.id}`;
      clipMask.eventMode = "none";
      root.addChild(clipMask);
      sprite.mask = clipMask;
      entries.push({
        spec,
        sprite,
        clipMask,
        visible: false,
        intersects: false,
        behind: false,
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

    entries.forEach((entry) => {
      const projected = projectOccluder(entry.spec, live3d);
      entry.projectedRect = projected?.rect || null;
      entry.projectedBaselineY = projected?.baselineY ?? null;
      if (!projected || !companionBounds || !foot) {
        entry.sprite.visible = false;
        entry.visible = false;
        entry.intersects = false;
        entry.behind = false;
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
      entry.sprite.tint = mixColor(
        Number(entry.spec.dayTint) || DAY_TINT,
        NIGHT_TINT,
        nightAlpha
      );

      const padding = (Number(entry.spec.boundsPaddingPx390) || 0)
        * projected.referenceScale390;
      const intersects = rectanglesIntersect(
        companionBounds,
        expandRect(projected.rect, padding)
      );
      const behind = entry.spec.mode === "surface"
        ? Boolean(area && entry.spec.surfaces?.includes(area))
        : foot.y <= projected.baselineY;
      const visible = intersects && behind;
      entry.sprite.visible = visible;
      entry.visible = visible;
      entry.intersects = intersects;
      entry.behind = behind;
      entry.clipMask.clear();
      if (visible) {
        const intersection = intersectRect(companionBounds, projected.rect);
        if (intersection) {
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
      visibleIds: entries.filter((entry) => entry.visible).map((entry) => entry.spec.id),
      entries: entries.map((entry) => ({
        id: entry.spec.id,
        mode: entry.spec.mode || "baseline",
        visible: entry.visible,
        intersects: entry.intersects,
        behind: entry.behind,
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
  try {
    const bounds = companion?.getBounds?.();
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
      height
    };
  } catch {
    return null;
  }
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

function mixColor(from, to, progress) {
  const amount = clamp01(progress);
  const fromR = (from >> 16) & 0xff;
  const fromG = (from >> 8) & 0xff;
  const fromB = from & 0xff;
  const toR = (to >> 16) & 0xff;
  const toG = (to >> 8) & 0xff;
  const toB = to & 0xff;
  const r = Math.round(fromR + (toR - fromR) * amount);
  const g = Math.round(fromG + (toG - fromG) * amount);
  const b = Math.round(fromB + (toB - fromB) * amount);
  return (r << 16) | (g << 8) | b;
}

function clamp01(value) {
  return Math.min(1, Math.max(0, Number(value) || 0));
}
