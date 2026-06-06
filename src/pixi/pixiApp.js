import EnvironmentController from "../engine/environmentController.js";
import { ASSET_MANIFEST } from "../data/assetManifest.js";
import { SCENE_LAYOUT } from "../data/sceneLayout.js";

export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 844;
export const WORLD_WIDTH = GAME_WIDTH;
export const WORLD_HEIGHT = GAME_HEIGHT;
export const BACKGROUND_DESIGN_WIDTH = 1080;
export const BACKGROUND_DESIGN_HEIGHT = 1920;
export const PLATFORM_Y = 540;

export const SCENE_ASSETS = Object.freeze({
  bgDay: ASSET_MANIFEST.backgrounds.lakeDay,
  bgNight: ASSET_MANIFEST.backgrounds.lakeNight,
  magicCircle: ASSET_MANIFEST.platforms.magicCircle,
  campfire: ASSET_MANIFEST.props.campfire,
  crystal: ASSET_MANIFEST.props.crystal,
  sun: ASSET_MANIFEST.props.sun,
  moon: ASSET_MANIFEST.props.moon
});

const SCENE_LAYER_NAMES = [
  "layerBackground",
  "layerCelestial",
  "layerPlatform",
  "layerEntity",
  "layerForeground",
  "layerFX"
];
const CELESTIAL_START_X = -42;
const CELESTIAL_END_X = WORLD_WIDTH + 42;
const CELESTIAL_BASE_Y = getSceneLayoutObject("sun")?.y ?? 180;
const CELESTIAL_ARC_HEIGHT = 118;
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
    resolution: Math.min(window.devicePixelRatio || 1, 2),
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
  world.__resizeScene();
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

  const magicCircle = await createSceneSprite("magic_circle", SCENE_ASSETS.magicCircle, {
    anchor: 0.5,
    editorEnabled: true
  });
  applyResponsiveLayout(magicCircle, "magic_circle");
  magicCircle.alpha = 0.76;
  layers.layerPlatform.addChild(magicCircle);

  const campfire = await createScenePropContainer("campfire", SCENE_ASSETS.campfire, {
    anchor: 0.5
  });
  applyResponsiveLayout(campfire.container, "campfire");
  campfire.container.alpha = 0;
  layers.layerForeground.addChild(campfire.container);

  const crystal = await createSceneSprite("crystal", SCENE_ASSETS.crystal, {
    anchor: 0.5,
    editorEnabled: true
  });
  applyResponsiveLayout(crystal, "crystal");
  crystal.alpha = 0.86;
  layers.layerForeground.addChild(crystal);

  const environmentLayer = {
    bgDay,
    bgNight,
    sun,
    moon,
    magicCircle,
    campfire,
    crystal
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
  particles.children.forEach((particle, index) => {
    particle.y -= (0.15 + index * 0.002) * ticker.deltaTime;
    particle.alpha = 0.25 + Math.sin(timeSeconds + index) * 0.12;
    if (particle.y < 110) particle.y = 760;
  });
}

export function applyResponsiveLayout(sprite, objectId) {
  const layout = getSceneLayoutObject(objectId);
  if (!layout || !sprite) return sprite;

  sprite.__layoutScreenWidth = GAME_WIDTH;
  sprite.__layoutScreenHeight = GAME_HEIGHT;
  sprite.scale.set(layout.scale.x, layout.scale.y);
  sprite.x = layout.x;
  sprite.y = layout.y;
  return sprite;
}

export function updateEnvironmentLayer(environmentLayer, ticker) {
  if (!environmentLayer) return;

  const state = EnvironmentController.getEnvironmentState();
  const nightAlpha = state.nightAlpha;
  const isEditor = isSceneEditorMode();
  environmentLayer.bgNight.alpha = nightAlpha;

  updateCelestialSprite(environmentLayer.sun, "sun", state.celestialProgress, 1 - nightAlpha);
  updateCelestialSprite(environmentLayer.moon, "moon", state.celestialProgress, state.phase === "night" ? 1 : nightAlpha);
  updateCampfireLayer(environmentLayer.campfire, nightAlpha, ticker);
  if (!environmentLayer.crystal.__sceneEditorSelected) {
    if (isEditor) {
      environmentLayer.crystal.alpha = 1;
    } else {
      environmentLayer.crystal.alpha = 0.58 + nightAlpha * 0.36;
    }
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

  const bgScale = Math.max(
    app.screen.width / BACKGROUND_DESIGN_WIDTH,
    app.screen.height / BACKGROUND_DESIGN_HEIGHT
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

function resizeEnvironmentLayout(environmentLayer, app) {
  if (!environmentLayer) return;

  applyResponsiveLayout(environmentLayer.sun, "sun");
  applyResponsiveLayout(environmentLayer.moon, "moon");
  applyResponsiveLayout(environmentLayer.magicCircle, "magic_circle");
  applyResponsiveLayout(environmentLayer.campfire.container, "campfire");
  applyResponsiveLayout(environmentLayer.crystal, "crystal");
}

function readGameRootSize(gameRoot) {
  const bounds = gameRoot?.getBoundingClientRect?.();
  return {
    width: Math.max(MIN_SCREEN_WIDTH, Math.round(window.innerWidth || bounds?.width || GAME_WIDTH)),
    height: Math.max(MIN_SCREEN_HEIGHT, Math.round(window.innerHeight || bounds?.height || GAME_HEIGHT))
  };
}

async function createSceneSprite(id, texturePath, options = {}) {
  const texture = await PIXI.Assets.load(texturePath);
  const sprite = new PIXI.Sprite(texture);
  sprite.name = id;
  sprite.anchor?.set?.(options.anchor ?? 0);
  sprite.x = options.x ?? 0;
  sprite.y = options.y ?? 0;

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
    const referenceWidth = SCENE_LAYOUT.referenceWidth;
    const referenceHeight = SCENE_LAYOUT.referenceHeight;
    const screenWidth = sprite.__layoutScreenWidth || referenceWidth;
    const screenHeight = sprite.__layoutScreenHeight || referenceHeight;
    const scaleRatio = screenWidth / referenceWidth;
    const baseY = layout
      ? (layout.y / referenceHeight) * screenHeight
      : CELESTIAL_BASE_Y;
    const startX = CELESTIAL_START_X * scaleRatio;
    const endX = screenWidth + (CELESTIAL_END_X - WORLD_WIDTH) * scaleRatio;

    sprite.x = startX + (endX - startX) * progress;
    sprite.y = baseY - Math.sin(progress * Math.PI) * CELESTIAL_ARC_HEIGHT * scaleRatio;
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
