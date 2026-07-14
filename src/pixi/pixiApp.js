import EnvironmentController from "../engine/environmentController.js";
import { ASSET_MANIFEST } from "../data/assetManifest.js";
import { SCENE_LAYOUT } from "../data/sceneLayout.js";

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;
export const WORLD_WIDTH = GAME_WIDTH;
export const WORLD_HEIGHT = GAME_HEIGHT;
export const BACKGROUND_DESIGN_WIDTH = 1080;
export const BACKGROUND_DESIGN_HEIGHT = 1920;
export const PLATFORM_Y = 542;

export const SCENE_ASSETS = Object.freeze({
  bgDay: ASSET_MANIFEST.backgrounds.lakeDay,
  bgNight: ASSET_MANIFEST.backgrounds.lakeNight,
  // 靜態營地帳篷／碼頭：畫在平台與 runtime props 之下
  campStructures: ASSET_MANIFEST.layers.campStructures,
  magicCircle: ASSET_MANIFEST.platforms.magicCircle,
  lanternPost: ASSET_MANIFEST.props.lanternPost,
  stoneArch: ASSET_MANIFEST.props.stoneArch,
  campfire: ASSET_MANIFEST.props.campfire,
  crystal: ASSET_MANIFEST.props.crystal,
  sun: ASSET_MANIFEST.props.sun,
  moon: ASSET_MANIFEST.props.moon,
  // 前景遮擋：畫在夥伴之上、天氣 FX 之下，製造 2.5D 景深
  foregroundOcclusion: ASSET_MANIFEST.layers.foregroundOcclusion
});

// 層序對齊 habitat 契約：midground(camp) → platform → props → entity → occlusion → FX
const SCENE_LAYER_NAMES = [
  "layerBackground",
  "layerCelestial",
  "layerMidground",
  "layerPlatform",
  "layerForeground",
  "layerEntity",
  "layerOcclusion",
  "layerFX"
];
const CELESTIAL_PATHS = Object.freeze({
  sun: Object.freeze({ startX: 60, endX: 350, horizonY: 290, arcHeight: 150 }),
  moon: Object.freeze({ startX: 90, endX: 370, horizonY: 290, arcHeight: 170 })
});
const CAMPFIRE_FADE_SPEED = 0.075;
const MIN_SCREEN_WIDTH = 1;
const MIN_SCREEN_HEIGHT = 1;

export async function createPixiApp(gameRoot) {
  if (!window.PIXI) {
    throw new Error("PixiJS is not available on window.PIXI");
  }

  const initialSize = readGameRootSize(gameRoot);
  const app = new PIXI.Application();
  await app.init({
    width: initialSize.width,
    height: initialSize.height,
    backgroundAlpha: 0,
    antialias: false,
    resolution: 1,
    roundPixels: true,
    autoDensity: true
  });
  gameRoot.appendChild(app.canvas);
  return app;
}

export function createWorld(app) {
  const world = new PIXI.Container();
  world.name = "world";
  world.__safeZoneLayer = createSafeZoneLayer(world);
  world.__sceneContainer = world.__safeZoneLayer;
  world.__sceneLayers = createSceneLayers(world);
  world.__backgroundLayer = world.__sceneLayers.layerBackground;
  world.__responsiveEnvironmentLayer = null;
  world.__resizeScene = () => resizeWorld(app, world);
  app.stage.addChild(world);
  window.addEventListener("resize", world.__resizeScene);
  observeGameRootResize(app, world);
  world.__resizeScene();
  // The root can still report a zero width while the initial DOM layout is
  // settling. Re-read it on the next frame so embedded/letterboxed hosts do
  // not leave a window-sized canvas clipped inside a narrower game root.
  window.requestAnimationFrame(() => world.__resizeScene?.());
  window.setTimeout(() => world.__resizeScene?.(), 120);
  return world;
}

export function getSceneLayers(world) {
  return world.__sceneLayers;
}

export async function createEnvironmentLayer(layers, app) {
  const bgDay = await createSceneSprite("bg_day", SCENE_ASSETS.bgDay, {
    anchor: 0.5,
    editorEnabled: false
  });
  layers.layerBackground.addChild(bgDay);

  const bgNight = await createSceneSprite("bg_night", SCENE_ASSETS.bgNight, {
    anchor: 0.5,
    editorEnabled: false
  });
  bgNight.alpha = 0;
  layers.layerBackground.addChild(bgNight);

  const sun = await createSceneSprite("sun", SCENE_ASSETS.sun, {
    anchor: 0.5,
    editorEnabled: true
  });
  applyResponsiveLayout(sun, "sun");
  layers.layerCelestial.addChild(sun);

  const moon = await createSceneSprite("moon", SCENE_ASSETS.moon, {
    anchor: 0.5,
    editorEnabled: true
  });
  applyResponsiveLayout(moon, "moon");
  moon.visible = true;
  layers.layerCelestial.addChild(moon);

  // 營地結構：已去背全幅層，對齊 safe zone；中央留空給夥伴
  const campStructures = await createSceneSprite("camp_structures", SCENE_ASSETS.campStructures, {
    anchor: 0.5,
    x: Math.round(GAME_WIDTH / 2),
    y: Math.round(GAME_HEIGHT / 2),
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    editorEnabled: false
  });
  layers.layerMidground.addChild(campStructures);

  // props / platform 已離線去背成透明 PNG（tools/preprocess-magenta-props.mjs），
  // 直接載入即可，避免 runtime chroma 再留下紅／洋紅 fringe。
  const magicCircle = await createSceneSprite("magic_circle", SCENE_ASSETS.magicCircle, {
    anchor: getSceneLayoutAnchor("magic_circle"),
    editorEnabled: true
  });
  applyResponsiveLayout(magicCircle, "magic_circle");
  magicCircle.alpha = 0.68;
  layers.layerPlatform.addChild(magicCircle);

  const lanternPost = await createSceneSprite("lantern_post_left", SCENE_ASSETS.lanternPost, {
    anchor: getSceneLayoutAnchor("lantern_post_left"),
    editorEnabled: true
  });
  applyResponsiveLayout(lanternPost, "lantern_post_left");
  layers.layerForeground.addChild(lanternPost);

  const campfireSprite = await createSceneSprite("campfire_left", SCENE_ASSETS.campfire, {
    anchor: getSceneLayoutAnchor("campfire_left"),
    editorEnabled: true
  });
  applyResponsiveLayout(campfireSprite, "campfire_left");
  layers.layerForeground.addChild(campfireSprite);
  const campfire = {
    container: campfireSprite,
    sparks: [],
    sparkCooldownMs: 0
  };

  const crystal = await createSceneSprite("crystal_cluster", SCENE_ASSETS.crystal, {
    anchor: getSceneLayoutAnchor("crystal_cluster"),
    editorEnabled: true
  });
  applyResponsiveLayout(crystal, "crystal_cluster");
  layers.layerForeground.addChild(crystal);

  const stoneArch = await createSceneSprite("stone_arch_right", SCENE_ASSETS.stoneArch, {
    anchor: getSceneLayoutAnchor("stone_arch_right"),
    editorEnabled: true
  });
  applyResponsiveLayout(stoneArch, "stone_arch_right");
  layers.layerForeground.addChild(stoneArch);

  // 前景遮擋：疊在夥伴腳邊之上，天氣 FX 仍在最上層
  const foregroundOcclusion = await createSceneSprite(
    "foreground_occlusion",
    SCENE_ASSETS.foregroundOcclusion,
    {
      anchor: 0.5,
      x: Math.round(GAME_WIDTH / 2),
      y: Math.round(GAME_HEIGHT / 2),
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      editorEnabled: false
    }
  );
  layers.layerOcclusion.addChild(foregroundOcclusion);

  const environmentLayer = {
    bgDay,
    bgNight,
    sun,
    moon,
    campStructures,
    magicCircle,
    lanternPost,
    campfire,
    crystal,
    stoneArch,
    foregroundOcclusion
  };

  registerResponsiveEnvironmentLayer(layers, environmentLayer);
  updateEnvironmentLayer(environmentLayer, { deltaMS: 0 });
  return environmentLayer;
}

export function createParticles() {
  const layer = new PIXI.Container();
  layer.name = "ambient_particles";
  for (let i = 0; i < 44; i += 1) {
    const p = new PIXI.Graphics();
    const isWarm = i % 5 === 0;
    p.circle(0, 0, 0.8 + Math.random() * 1.9).fill({
      color: isWarm ? 0xffb86b : 0x8deeff,
      alpha: isWarm ? 0.42 : 0.3
    });
    p.x = 20 + Math.random() * (WORLD_WIDTH - 40);
    p.y = 100 + Math.random() * 660;
    layer.addChild(p);
  }
  return layer;
}

export function animateParticles(particles, timeSeconds, ticker) {
  if (!particles) return;

  // 畫質／低動態：不動 renderer，只降載環境粒子（可感知、可還原）。
  const quality = typeof document !== "undefined"
    ? document.documentElement?.dataset?.quality || "high"
    : "high";
  const lowMotion = typeof document !== "undefined"
    && document.documentElement?.dataset?.reducedMotionPreference === "reduced";

  if (quality === "low" || lowMotion) {
    particles.visible = false;
    return;
  }

  particles.visible = true;
  const speedScale = quality === "medium" ? 0.55 : 1;
  const alphaScale = quality === "medium" ? 0.7 : 1;

  particles.children.forEach((particle, index) => {
    // 中畫質：只更新偶數粒子，視覺仍在但運算更少。
    if (quality === "medium" && index % 2 === 1) {
      particle.visible = false;
      return;
    }
    particle.visible = true;
    particle.y -= (0.15 + index * 0.002) * ticker.deltaTime * speedScale;
    particle.alpha = (0.25 + Math.sin(timeSeconds + index) * 0.12) * alphaScale;
    if (particle.y < 110) particle.y = 760;
  });
}

export function applyResponsiveLayout(sprite, objectId) {
  const layout = getSceneLayoutObject(objectId);
  if (!layout || !sprite) return sprite;

  sprite.__layoutScreenWidth = GAME_WIDTH;
  sprite.__layoutScreenHeight = GAME_HEIGHT;
  sprite.roundPixels = true;
  sprite.scale.set(layout.scale.x, layout.scale.y);
  sprite.x = Math.round(layout.x);
  sprite.y = Math.round(layout.y);
  return sprite;
}

export function updateEnvironmentLayer(environmentLayer, ticker) {
  if (!environmentLayer) return;

  const state = EnvironmentController.getEnvironmentState();
  const nightAlpha = state.nightAlpha;
  environmentLayer.bgNight.alpha = nightAlpha;

  updateCelestialSprite(environmentLayer.sun, "sun", state.sunProgress, state.sunAlpha);
  updateCelestialSprite(environmentLayer.moon, "moon", state.moonProgress, state.moonAlpha);
  if (environmentLayer.campfire) {
    updateCampfireLayer(environmentLayer.campfire, nightAlpha, ticker);
  }
}

function createSceneLayers(world) {
  const layers = {};
  SCENE_LAYER_NAMES.forEach((name) => {
    const layer = new PIXI.Container();
    layer.name = name === "layerBackground" ? "backgroundLayer" : name;
    layer.eventMode = "passive";

    if (name === "layerBackground") {
      world.addChildAt(layer, 0);
    } else {
      world.__safeZoneLayer.addChild(layer);
    }

    layers[name] = layer;
  });
  return layers;
}

function createSafeZoneLayer(world) {
  const safeZoneLayer = new PIXI.Container();
  safeZoneLayer.name = "safeZoneLayer";
  safeZoneLayer.eventMode = "passive";
  world.addChild(safeZoneLayer);
  return safeZoneLayer;
}

function registerResponsiveEnvironmentLayer(layers, environmentLayer) {
  const world = layers.layerBackground?.parent;
  if (!world) return;

  world.__responsiveEnvironmentLayer = environmentLayer;
  world.__resizeScene?.();
}

function resizeWorld(app, world) {
  const nextSize = readGameRootSize(app.canvas?.parentElement);
  if (app.screen.width !== nextSize.width || app.screen.height !== nextSize.height) {
    app.renderer.resize(nextSize.width, nextSize.height);
  }

  resizeBackgroundCover(world.__backgroundLayer, world.__responsiveEnvironmentLayer, app);
  resizeEnvironmentLayout(world.__responsiveEnvironmentLayer, app);
  resizeSafeZoneLayer(world.__safeZoneLayer, app);
}

function resizeBackgroundCover(backgroundLayer, environmentLayer, app) {
  if (!environmentLayer) return;

  // 用實際紋理尺寸算 cover，避免資產是 1024×1536 卻硬套設計常數 1080×1920
  // 導致縮放不足、露出星空黑邊（letterbox）。
  const sampleBg = environmentLayer.bgDay || environmentLayer.bgNight;
  const textureWidth = Math.max(
    1,
    Number(sampleBg?.texture?.width) || BACKGROUND_DESIGN_WIDTH
  );
  const textureHeight = Math.max(
    1,
    Number(sampleBg?.texture?.height) || BACKGROUND_DESIGN_HEIGHT
  );
  const bgScale = Math.max(
    app.screen.width / textureWidth,
    app.screen.height / textureHeight
  );

  if (backgroundLayer) {
    backgroundLayer.scale.set(bgScale);
    backgroundLayer.x = app.screen.width / 2;
    backgroundLayer.y = app.screen.height / 2;
  }

  [environmentLayer.bgDay, environmentLayer.bgNight].forEach((background) => {
    background.anchor.set(0.5);
    background.scale.set(1);
    background.position.set(0, 0);
  });
}

function resizeSafeZoneLayer(safeZoneLayer, app) {
  if (!safeZoneLayer) return;

  const safeScale = Math.min(app.screen.width / GAME_WIDTH, app.screen.height / GAME_HEIGHT);
  safeZoneLayer.scale.set(safeScale);
  safeZoneLayer.x = (app.screen.width - GAME_WIDTH * safeScale) / 2;
  safeZoneLayer.y = app.screen.height - GAME_HEIGHT * safeScale;
}

function resizeSafeZonePlate(sprite) {
  if (!sprite) return;
  sprite.anchor.set(0.5);
  sprite.width = GAME_WIDTH;
  sprite.height = GAME_HEIGHT;
  sprite.position.set(Math.round(GAME_WIDTH / 2), Math.round(GAME_HEIGHT / 2));
}

function resizeEnvironmentLayout(environmentLayer, app) {
  if (!environmentLayer) return;

  applyResponsiveLayout(environmentLayer.sun, "sun");
  applyResponsiveLayout(environmentLayer.moon, "moon");
  resizeSafeZonePlate(environmentLayer.campStructures);
  applyResponsiveLayout(environmentLayer.magicCircle, "magic_circle");
  applyResponsiveLayout(environmentLayer.lanternPost, "lantern_post_left");
  if (environmentLayer.campfire?.container) {
    applyResponsiveLayout(environmentLayer.campfire.container, "campfire_left");
  }
  applyResponsiveLayout(environmentLayer.crystal, "crystal_cluster");
  applyResponsiveLayout(environmentLayer.stoneArch, "stone_arch_right");
  resizeSafeZonePlate(environmentLayer.foregroundOcclusion);
}

function readGameRootSize(gameRoot) {
  const bounds = gameRoot?.getBoundingClientRect?.();
  const rootWidth = Math.round(Number(bounds?.width) || 0);
  const rootHeight = Math.round(Number(bounds?.height) || 0);
  return {
    width: Math.max(MIN_SCREEN_WIDTH, rootWidth || Math.round(window.innerWidth || GAME_WIDTH)),
    height: Math.max(MIN_SCREEN_HEIGHT, rootHeight || Math.round(window.innerHeight || GAME_HEIGHT))
  };
}

function observeGameRootResize(app, world) {
  const gameRoot = app?.canvas?.parentElement;
  if (!gameRoot || typeof ResizeObserver === "undefined") return;

  const observer = new ResizeObserver(() => world.__resizeScene?.());
  observer.observe(gameRoot);
  world.__gameRootResizeObserver = observer;
}

async function createSceneSprite(id, texturePath, options = {}) {
  const texture = await PIXI.Assets.load(texturePath);
  const sprite = new PIXI.Sprite(texture);
  sprite.name = id;
  sprite.roundPixels = true;
  const anchor = normalizeAnchor(options.anchor);
  sprite.anchor?.set?.(anchor.x, anchor.y);
  sprite.x = Math.round(options.x ?? 0);
  sprite.y = Math.round(options.y ?? 0);

  if (options.width && options.height) {
    sprite.width = options.width;
    sprite.height = options.height;
  } else if (options.targetWidth) {
    const scale = options.targetWidth / sprite.width;
    sprite.scale.set(scale);
  }

  applySceneBlendMode(sprite, id);
  registerSceneEditorObject(sprite, {
    id,
    texturePath,
    editorEnabled: Boolean(options.editorEnabled)
  });
  return sprite;
}

async function createScenePropContainer(id, texturePath, options = {}) {
  const sprite = await createSceneSprite(`${id}_sprite`, texturePath, {
    anchor: 0.5,
    targetWidth: options.targetWidth,
    editorEnabled: false
  });
  sprite.name = id;
  sprite.eventMode = "passive";

  const container = new PIXI.Container();
  container.name = id;
  container.x = options.x ?? 0;
  container.y = options.y ?? 0;
  container.addChild(sprite);
  registerSceneEditorObject(container, {
    id,
    texturePath,
    editorEnabled: true
  });

  return {
    container,
    sprite,
    sparks: [],
    sparkCooldownMs: 0
  };
}

export function registerSceneEditorObject(displayObject, metadata) {
  displayObject.__sceneEditor = {
    id: metadata.id,
    texturePath: metadata.texturePath,
    editorEnabled: Boolean(metadata.editorEnabled)
  };
  displayObject.label = metadata.id;
  displayObject.eventMode = metadata.editorEnabled ? "static" : "none";
  if (metadata.editorEnabled) {
    displayObject.cursor = "move";
    if (typeof window !== "undefined") {
      window.__NEXUS_SCENE_EDITOR_OBJECTS = window.__NEXUS_SCENE_EDITOR_OBJECTS || [];
      if (!window.__NEXUS_SCENE_EDITOR_OBJECTS.includes(displayObject)) {
        window.__NEXUS_SCENE_EDITOR_OBJECTS.push(displayObject);
      }
    }
  }
  return displayObject;
}

export function applySceneBlendMode(displayObject, name) {
  displayObject.blendMode = PIXI.BLEND_MODES?.NORMAL ?? "normal";
  return displayObject;
}

function updateCelestialSprite(sprite, objectId, progress, targetAlpha) {
  if (!sprite.__sceneEditorPinned) {
    const layout = getSceneLayoutObject(objectId);
    const path = CELESTIAL_PATHS[objectId];
    if (layout) {
      sprite.scale.set(layout.scale.x, layout.scale.y);
    }
    if (path) {
      const t = Math.max(0, Math.min(1, Number(progress) || 0));
      sprite.x = path.startX + (path.endX - path.startX) * t;
      sprite.y = path.horizonY - path.arcHeight * 4 * t * (1 - t);
    } else if (layout) {
      sprite.x = layout.x;
      sprite.y = layout.y;
    }
  }
  if (!sprite.__sceneEditorSelected) {
    sprite.visible = true;
    sprite.alpha = Math.max(0, Math.min(1, targetAlpha));
  }
}

function updateCampfireLayer(campfire, nightAlpha, ticker) {
  const isEditor = isSceneEditorMode();
  if (isEditor) {
    campfire.container.alpha = 1;
  } else if (!campfire.container.__sceneEditorSelected) {
    const targetAlpha = nightAlpha > 0.5 ? 1 : 0;
    campfire.container.alpha += (targetAlpha - campfire.container.alpha) * CAMPFIRE_FADE_SPEED;
  }

  const deltaMS = ticker?.deltaMS || 16.67;
  campfire.sparkCooldownMs -= deltaMS;
  if (campfire.container.alpha > 0.25 && campfire.sparkCooldownMs <= 0) {
    emitCampfireSpark(campfire);
    campfire.sparkCooldownMs = 70 + Math.random() * 90;
  }

  for (let index = campfire.sparks.length - 1; index >= 0; index -= 1) {
    const spark = campfire.sparks[index];
    spark.__ageMs += deltaMS;
    const progress = Math.min(1, spark.__ageMs / spark.__lifetimeMs);
    spark.x += spark.__vx * (deltaMS / 16.67);
    spark.y += spark.__vy * (deltaMS / 16.67);
    spark.alpha = (1 - progress) * campfire.container.alpha;
    spark.scale.set(0.7 + progress * 0.45);

    if (progress >= 1) {
      spark.parent?.removeChild(spark);
      spark.destroy();
      campfire.sparks.splice(index, 1);
    }
  }
}

function emitCampfireSpark(campfire) {
  const spark = new PIXI.Graphics();
  spark.circle(0, 0, 1.4 + Math.random() * 1.6).fill({ color: 0xffd858, alpha: 0.86 });
  spark.x = -5 + Math.random() * 10;
  spark.y = -28 + Math.random() * 8;
  spark.__vx = -0.32 + Math.random() * 0.64;
  spark.__vy = -0.9 - Math.random() * 0.9;
  spark.__ageMs = 0;
  spark.__lifetimeMs = 520 + Math.random() * 380;
  campfire.container.addChild(spark);
  campfire.sparks.push(spark);
}

function isSceneEditorMode() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("devSceneEditor") === "1";
}

function getSceneLayoutObject(objectId) {
  return SCENE_LAYOUT.objects.find((object) => object.id === objectId) || null;
}

function getSceneLayoutAnchor(objectId) {
  const anchor = SCENE_LAYOUT.anchors?.[objectId];
  if (anchor) return anchor;
  return { x: 0.5, y: 0.5 };
}

function normalizeAnchor(anchor) {
  if (typeof anchor === "number") {
    return { x: anchor, y: anchor };
  }
  return {
    x: Number(anchor?.x ?? 0.5),
    y: Number(anchor?.y ?? 0.5)
  };
}
