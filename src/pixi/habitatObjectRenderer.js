const LAYER_ORDER = Object.freeze({
  farStructures: 0,
  midStructures: 1,
  nearStructures: 2
});

const DAY_TINT = 0xffffff;
const DAWN_TINT = 0xffe4c4;
const DUSK_TINT = 0xd8b5c5;
const NIGHT_TINT = 0x8796bd;

export async function createHabitatObjectRenderer(PIXI, options = {}) {
  const world = options.world;
  const objectPack = options.objectPack;
  if (!world || !objectPack) return null;

  const grid = objectPack.placementGrid;
  const root = new PIXI.Container();
  root.name = objectPack.id;
  root.eventMode = "passive";
  root.sortableChildren = true;

  const safeZoneIndex = world.__safeZoneLayer
    ? world.getChildIndex(world.__safeZoneLayer)
    : world.children.length;
  world.addChildAt(root, Math.max(1, safeZoneIndex));

  const slots = new Map(objectPack.slots.map((entry) => [entry.id, entry]));
  const items = await Promise.all(objectPack.placements.map(async (entry) => {
    const slot = slots.get(entry.slotId);
    if (!slot) throw new Error(`Missing habitat object slot: ${entry.slotId}`);
    return createObjectItem(PIXI, root, grid, slot, entry, options.registerEditorObject);
  }));

  const placementGrid = shouldShowPlacementGrid()
    ? createPlacementGrid(PIXI, root, grid, objectPack.slots)
    : null;

  const state = {
    root,
    items,
    grid: placementGrid,
    objectPack,
    activeProfileId: options.profileId || "moonlake"
  };
  setHabitatObjectProfile(state, state.activeProfileId);
  return state;
}

async function createObjectItem(PIXI, root, grid, slot, entry, registerEditorObject) {
  const [baseTexture, emissiveTexture] = await Promise.all([
    PIXI.Assets.load(entry.asset.base),
    PIXI.Assets.load(entry.asset.emissive)
  ]);

  const artPoint = resolveSlotArtPoint(grid, slot);
  const container = new PIXI.Container();
  container.name = `habitat_object_${entry.assetId}`;
  container.x = artPoint.x - grid.artWidth / 2;
  container.y = artPoint.y - grid.artHeight / 2;
  container.zIndex = (LAYER_ORDER[slot.renderLayer] ?? 0) * 10000 + artPoint.y;

  const shadow = new PIXI.Graphics();
  shadow.name = `${entry.assetId}_shadow`;
  shadow.ellipse(0, 0, slot.shadowFootprint.width / 2, slot.shadowFootprint.height / 2)
    .fill({ color: 0x101829, alpha: 1 });
  shadow.y = -Math.max(1, slot.shadowFootprint.height * 0.08);
  container.addChild(shadow);

  const localLight = createLocalLightSprite(PIXI, entry.light);
  localLight.name = `${entry.assetId}_light`;
  localLight.position.set(entry.light.offsetPx.x, entry.light.offsetPx.y);
  container.addChild(localLight);

  const base = new PIXI.Sprite(baseTexture);
  base.name = `${entry.assetId}_base`;
  base.anchor.set(entry.visibleAnchor.x, entry.visibleAnchor.y);
  base.scale.set(entry.scale);
  base.roundPixels = true;
  container.addChild(base);

  const emissive = new PIXI.Sprite(emissiveTexture);
  emissive.name = `${entry.assetId}_emissive`;
  emissive.anchor.set(entry.visibleAnchor.x, entry.visibleAnchor.y);
  emissive.scale.set(entry.scale);
  emissive.alpha = 0;
  emissive.blendMode = PIXI.BLEND_MODES?.SCREEN ?? "screen";
  emissive.roundPixels = true;
  container.addChild(emissive);

  root.addChild(container);
  registerEditorObject?.(container, {
    id: entry.assetId,
    texturePath: entry.asset.base,
    editorEnabled: true,
    placement: true,
    placementGrid: grid,
    slotId: slot.id,
    cell: slot.cell,
    offsetPx: slot.offsetPx,
    renderLayer: slot.renderLayer,
    sortY: artPoint.y,
    baseScale: entry.scale,
    initialArtPosition: artPoint
  });

  return { entry, slot, artPoint, container, shadow, localLight, base, emissive };
}

function createLocalLightSprite(PIXI, light) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  const cssColor = `#${Number(light.color).toString(16).padStart(6, "0")}`;
  gradient.addColorStop(0, `${cssColor}b8`);
  gradient.addColorStop(0.34, `${cssColor}52`);
  gradient.addColorStop(1, `${cssColor}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const sprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
  sprite.anchor.set(0.5);
  sprite.width = light.radius * 2;
  sprite.height = light.radius * 2;
  sprite.alpha = 0;
  sprite.blendMode = PIXI.BLEND_MODES?.SCREEN ?? "screen";
  return sprite;
}

function createPlacementGrid(PIXI, root, grid, slots) {
  const graphics = new PIXI.Graphics();
  graphics.name = "moonlake_dev_placement_grid";
  graphics.eventMode = "none";
  graphics.zIndex = 999999;

  const left = -grid.artWidth / 2;
  const top = -grid.artHeight / 2;
  for (let column = 0; column <= grid.columns; column += 1) {
    const x = left + column * grid.cellWidth;
    graphics.moveTo(x, top).lineTo(x, top + grid.artHeight);
  }
  for (let row = 0; row <= grid.rows; row += 1) {
    const y = top + row * grid.cellHeight;
    graphics.moveTo(left, y).lineTo(left + grid.artWidth, y);
  }
  graphics.stroke({ width: 2, color: 0x62d9ff, alpha: 0.32 });

  slots.forEach((slot) => {
    const point = resolveSlotArtPoint(grid, slot);
    graphics.circle(point.x - grid.artWidth / 2, point.y - grid.artHeight / 2, 11)
      .fill({ color: 0xffd66b, alpha: 0.62 });
  });
  root.addChild(graphics);
  return graphics;
}

export function updateHabitatObjectRenderer(state, environmentState) {
  if (!state || !environmentState) return;
  const phaseTint = resolvePhaseTint(environmentState.phase, environmentState.nightAlpha);
  const shadowDirection = 0.5 - environmentState.sunProgress;
  const shadowStrength = Math.max(0.12, environmentState.sunAlpha * (1 - environmentState.nightAlpha * 0.72));
  const emissiveAlpha = clamp01((environmentState.nightAlpha - 0.08) / 0.92);

  state.items.forEach((item) => {
    const depthMix = item.slot.depthBand === "far" ? 0.26 : item.slot.depthBand === "mid" ? 0.1 : 0;
    item.base.tint = mixColor(phaseTint, 0xcddde5, depthMix);
    item.base.alpha = item.slot.depthBand === "far" ? 0.9 : item.slot.depthBand === "mid" ? 0.96 : 1;
    item.emissive.alpha = emissiveAlpha;
    item.localLight.alpha = emissiveAlpha * item.entry.light.intensity;
    item.shadow.alpha = item.slot.shadowFootprint.opacity * shadowStrength;
    item.shadow.x = shadowDirection * item.slot.shadowFootprint.width * 0.38;
    item.shadow.rotation = shadowDirection * 0.72;
    item.shadow.scale.x = 0.82 + Math.abs(shadowDirection) * 1.2;
  });
}

export function resizeHabitatObjectRenderer(state, viewWidth, viewHeight) {
  if (!state) return;
  const { artWidth, artHeight } = state.objectPack.placementGrid;
  const scale = Math.max(viewWidth / artWidth, viewHeight / artHeight);
  state.root.scale.set(scale);
  state.root.position.set(viewWidth / 2, viewHeight / 2);
}

export function setHabitatObjectProfile(state, profileId) {
  if (!state) return;
  state.activeProfileId = profileId;
  state.root.visible = profileId === "moonlake";
}

function resolveSlotArtPoint(grid, slot) {
  return {
    x: (slot.cell.column + 0.5) * grid.cellWidth + slot.offsetPx.x,
    y: (slot.cell.row + 0.5) * grid.cellHeight + slot.offsetPx.y
  };
}

function resolvePhaseTint(phase, nightAlpha) {
  if (phase === "dawn") return mixColor(DAWN_TINT, DAY_TINT, 1 - nightAlpha);
  if (phase === "dusk") return mixColor(DAY_TINT, DUSK_TINT, clamp01(nightAlpha + 0.15));
  if (phase === "night") return NIGHT_TINT;
  return DAY_TINT;
}

function mixColor(from, to, amount) {
  const t = clamp01(amount);
  const fr = (from >> 16) & 0xff;
  const fg = (from >> 8) & 0xff;
  const fb = from & 0xff;
  const tr = (to >> 16) & 0xff;
  const tg = (to >> 8) & 0xff;
  const tb = to & 0xff;
  return (Math.round(fr + (tr - fr) * t) << 16)
    | (Math.round(fg + (tg - fg) * t) << 8)
    | Math.round(fb + (tb - fb) * t);
}

function shouldShowPlacementGrid() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("devSceneEditor") === "1" && params.get("showPlacementGrid") === "1";
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}
