import { WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";
import { ANIMATION_NAMES, CORE_ANIMATION_NAMES } from "../engine/interactionController.js";
import { ASSET_MANIFEST, ILLUSTRATED_COMPANION_RUNTIME_POLICY } from "../data/assetManifest.js";
import { getAnimationProfileForCreature, getMoodIdleAnimationName, resolveMoodIdleAnimationName } from "../engine/animationProfile.js";

export const GREYSHADE_CAT_ANIMATIONS_PATH = ASSET_MANIFEST.characters.greyshadeCat.animations;
export const GREYSHADE_CAT_ANIMATION_NAMES = ANIMATION_NAMES;
export const GREYSHADE_CAT_CORE_ANIMATION_NAMES = CORE_ANIMATION_NAMES;
export const ILLUSTRATED_SHEET_MAX_EDGE = ILLUSTRATED_COMPANION_RUNTIME_POLICY.maxSheetEdge;

// These five semantic intents are allowed to resolve through the explicit
// animation-profile fallback chain. Every other registry action is part of
// the full-runtime asset contract and must have its own metadata entry.
export const PROFILE_FALLBACK_ANIMATION_NAMES = Object.freeze([
  "front_walk",
  "back_walk",
  "special_wake",
  "special_left_walk",
  "special_wash"
]);
export const REQUIRED_RUNTIME_ANIMATION_NAMES = Object.freeze(
  GREYSHADE_CAT_ANIMATION_NAMES.filter(
    (name) => !PROFILE_FALLBACK_ANIMATION_NAMES.includes(name)
  )
);

// Keep first paint focused on the companion's visible idle state; interaction
// animations continue to lazy-load through the existing controller.
export const BOOT_ANIMATION_NAMES = Object.freeze(["idle_calm", "sleep"]);

export function getPixiAnimationSpeed(definition) {
  const fps = Number.isFinite(definition?.fps) ? definition.fps : 8;
  return Math.max(0.01, fps / 60);
}

// Back-compat thin wrapper: greyshade-cat is just the first companion to use the
// generic sprite-sheet pack loader. Any companion with an animations manifest path
// loads through loadCompanionAnimationPack below.
export function loadGreyshadeCatAnimationPack() {
  return loadCompanionAnimationPack(GREYSHADE_CAT_ANIMATIONS_PATH);
}

export async function loadCompanionAnimationPack(animationsPath, { bootOnly = false } = {}) {
  const status = {
    metadataLoaded: false,
    available: Object.fromEntries(GREYSHADE_CAT_ANIMATION_NAMES.map((name) => [name, false])),
    missing: [],
    errors: [],
    policyWarnings: []
  };

  try {
    const response = await fetch(animationsPath, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const metadata = await response.json();
    status.metadataLoaded = true;
    const animations = new Map();

    const requiredRuntimeAnimations = new Set(REQUIRED_RUNTIME_ANIMATION_NAMES);
    GREYSHADE_CAT_ANIMATION_NAMES.forEach((name) => {
      if (!isValidAnimationDefinition(metadata[name])) {
        status.missing.push(name);
        // Only the five declared profile aliases may be absent. A missing
        // battle, interaction, daily or core action invalidates full-runtime.
        if (requiredRuntimeAnimations.has(name)) {
          status.errors.push(`${name}: missing or invalid metadata`);
        }
      }
    });

    const initialAnimationNames = bootOnly ? BOOT_ANIMATION_NAMES : GREYSHADE_CAT_CORE_ANIMATION_NAMES;
    await Promise.all(
      initialAnimationNames.map((name) => loadAnimationDefinition({
        animations,
        metadata,
        status,
        name
      }).catch(() => null))
    );

    const pack = { animations, metadata, status };
    if (bootOnly) scheduleAnimationWarmup(pack);
    return pack;
  } catch (error) {
    console.warn("Companion animations metadata failed to load", error);
    status.errors.push(`metadata: ${error.message}`);
    status.missing = [...GREYSHADE_CAT_ANIMATION_NAMES];
    return { animations: new Map(), metadata: null, status };
  }
}

function scheduleAnimationWarmup(pack) {
  const warm = () => preloadAnimationNames(pack, GREYSHADE_CAT_CORE_ANIMATION_NAMES)
    .catch((error) => console.warn("[animations] warm preload failed:", error));

  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(warm, { timeout: 5000 });
  } else if (typeof window !== "undefined") {
    window.setTimeout(warm, 1200);
  }
}

async function preloadAnimationNames(pack, names = []) {
  if (!pack?.metadata || !pack?.animations) return;
  await Promise.all(
    names
      .filter((name) => !pack.animations.has(name))
      .map((name) => loadAnimationDefinition({
        animations: pack.animations,
        metadata: pack.metadata,
        status: pack.status,
        name
      }).catch(() => null))
  );
}

export function createAnimatedCompanionNode(animationPack, creature) {
  const idleDefinition = animationPack?.animations?.get("idle_calm");
  if (!idleDefinition) return null;

  const companion = new PIXI.Container();

  // 真人回報：影子跟角色底部有明顯落差，看起來像懸空。
  // Sprite anchor 固定 bottom-center（見上方 anchor 驗證），container 原點 y=0 已是腳底基準線；
  // 影子應貼齊腳底、只留極小接地位移，不應遠離 y=0。
  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 6, 54, 13).fill({ color: 0x000000, alpha: 0.28 });
  companion.addChild(shadow);

  const animatedSprite = new PIXI.AnimatedSprite(idleDefinition.textures);
  animatedSprite.roundPixels = false;
  animatedSprite.anchor.set(idleDefinition.anchor.x, idleDefinition.anchor.y);
  animatedSprite.loop = true;
  animatedSprite.animationSpeed = getPixiAnimationSpeed(idleDefinition);

  const renderScale = Number.isFinite(creature?.renderScale) ? creature.renderScale : 1;
  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / idleDefinition.frameWidth, maxH / idleDefinition.frameHeight) * renderScale;
  animatedSprite.scale.set(scale);
  animatedSprite.__baseFrameScale = scale;
  animatedSprite.play();
  companion.addChild(animatedSprite);

  const animationProfile = getAnimationProfileForCreature(creature);
  const controller = createSpriteAnimationController(animationPack, animatedSprite, creature?.defaultMood || "calm", animationProfile);
  companion.__animationController = controller;
  companion.__animationProfile = animationProfile;
  companion.__isSpriteSheetCreature = true;
  companion.__isSpriteCreature = true;

  return companion;
}

export function getMoodAnimationName(mood) {
  return getMoodIdleAnimationName(mood);
}

function createSpriteAnimationController(animationPack, animatedSprite, initialMood, profile) {
  let currentAnimationName = "idle_calm";
  let currentMirrorX = false;
  let lastMood = initialMood;
  const pendingLoads = new Map();

  function loadAnimation(animationName) {
    if (animationPack.animations.has(animationName)) {
      return Promise.resolve(animationPack.animations.get(animationName));
    }
    if (pendingLoads.has(animationName)) return pendingLoads.get(animationName);

    const pendingLoad = loadAnimationDefinition({
      animations: animationPack.animations,
      metadata: animationPack.metadata,
      status: animationPack.status,
      name: animationName
    }).finally(() => pendingLoads.delete(animationName));
    pendingLoads.set(animationName, pendingLoad);
    return pendingLoad;
  }

  function play(animationName, options = {}) {
    lastMood = options.mood || lastMood;
    const definition = animationPack.animations.get(animationName);
    if (!definition) return false;

    const mirrorX = Boolean(options.mirrorX);
    if (currentAnimationName === animationName && currentMirrorX === mirrorX && animatedSprite.playing) return true;

    currentAnimationName = animationName;
    currentMirrorX = mirrorX;
    animatedSprite.textures = definition.textures;
    animatedSprite.anchor.set(definition.anchor.x, definition.anchor.y);
    const baseFrameScale = animatedSprite.__baseFrameScale || 1;
    animatedSprite.scale.set(mirrorX ? -baseFrameScale : baseFrameScale, baseFrameScale);
    animatedSprite.loop = options.loop === undefined ? Boolean(definition.loop) : Boolean(options.loop);
    animatedSprite.animationSpeed = getPixiAnimationSpeed(definition);
    animatedSprite.gotoAndPlay(0);
    animatedSprite.onComplete = () => {
      if (animatedSprite.loop) return;
      play(resolveMoodIdleAnimationName(lastMood, (name) => animationPack.animations.has(name), profile), { mood: lastMood });
    };
    return true;
  }

  return {
    loadAnimation,
    play,
    hasAnimation: (animationName) => animationPack.animations.has(animationName),
    // 已載入 OR metadata 內有合法定義（可被 lazy load）都算「解析得到」——
    // intent resolver 用這個探針，才不會因為尚未 lazy load 就誤判 async 戰鬥動畫不存在。
    canResolve: (animationName) =>
      animationPack.animations.has(animationName) ||
      isValidAnimationDefinition(animationPack.metadata?.[animationName]),
    getCurrentAnimationName: () => currentAnimationName,
    getStatus: () => animationPack.status,
    getAnimatedSprite: () => animatedSprite,
    getAnimationDurationMs: (animationName) => animationPack.animations.get(animationName)?.durationMs || null
  };
}

async function loadAnimationDefinition({ animations, metadata, status, name }) {
  if (animations.has(name)) return animations.get(name);

  const definition = metadata?.[name];
  if (!isValidAnimationDefinition(definition)) {
    status.available[name] = false;
    if (!status.missing.includes(name)) status.missing.push(name);
    throw new Error(`${name}: missing or invalid metadata`);
  }

  try {
    const anchor = resolveFrameAnchor(definition, name);
    const texture = await PIXI.Assets.load(definition.sheet);
    applyIllustratedTexturePolicy(texture, status, name);
    const textures = sliceSpriteSheet(texture, definition, name);
    if (textures.length !== definition.frameCount) {
      throw new Error(`Expected ${definition.frameCount} frames, sliced ${textures.length}`);
    }

    const loadedDefinition = {
      ...definition,
      name,
      textures,
      anchor,
      animationSpeed: getPixiAnimationSpeed(definition),
      durationMs: (definition.frameCount / Math.max(0.01, Number.isFinite(definition.fps) ? definition.fps : 8)) * 1000
    };
    animations.set(name, loadedDefinition);
    status.available[name] = true;
    status.missing = status.missing.filter((missingName) => missingName !== name);
    return loadedDefinition;
  } catch (error) {
    console.warn(`Companion animation failed to load: ${name}`, error);
    status.available[name] = false;
    if (!status.missing.includes(name)) status.missing.push(name);
    status.errors.push(`${name}: ${error.message}`);
    throw error;
  }
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function resolveGridDefinition(texture, definition) {
  const frameWidth = definition.frameWidth;
  const frameHeight = definition.frameHeight;
  const frameCount = definition.frameCount;

  if (!isPositiveInteger(frameWidth)) {
    throw new Error("frameWidth must be a positive integer");
  }
  if (!isPositiveInteger(frameHeight)) {
    throw new Error("frameHeight must be a positive integer");
  }
  if (!isPositiveInteger(frameCount)) {
    throw new Error("frameCount must be a positive integer");
  }

  const hasRows = definition.rows !== undefined && definition.rows !== null;
  const hasColumns = definition.columns !== undefined && definition.columns !== null;

  if (hasRows && !isPositiveInteger(definition.rows)) {
    throw new Error("rows must be a positive integer");
  }
  if (hasColumns && !isPositiveInteger(definition.columns)) {
    throw new Error("columns must be a positive integer");
  }

  let rows;
  let columns;

  if (hasRows && hasColumns) {
    rows = definition.rows;
    columns = definition.columns;
    if (rows * columns < frameCount) {
      throw new Error(
        `rows x columns (${rows} x ${columns}) must contain at least ${frameCount} frames`
      );
    }
  } else if (!hasRows && !hasColumns) {
    columns = Math.max(1, Math.floor(texture.width / frameWidth));
    rows = Math.max(1, Math.ceil(frameCount / columns));
  } else if (hasColumns) {
    columns = definition.columns;
    rows = Math.max(1, Math.ceil(frameCount / columns));
  } else {
    rows = definition.rows;
    columns = Math.max(1, Math.floor(texture.width / frameWidth));
    if (rows * columns < frameCount) {
      throw new Error(
        `rows x columns (${rows} x ${columns}) must contain at least ${frameCount} frames`
      );
    }
  }

  return {
    frameWidth,
    frameHeight,
    frameCount,
    rows,
    columns
  };
}

function validateSpriteSheetDimensions(texture, grid, animationName = "animation") {
  const expectedWidth = grid.columns * grid.frameWidth;
  const expectedHeight = grid.rows * grid.frameHeight;

  if (texture.width > ILLUSTRATED_SHEET_MAX_EDGE || texture.height > ILLUSTRATED_SHEET_MAX_EDGE) {
    throw new Error(
      `${animationName}: sheet edge ${texture.width}x${texture.height} exceeds ${ILLUSTRATED_SHEET_MAX_EDGE}px`
    );
  }

  if (texture.width !== expectedWidth || texture.height !== expectedHeight) {
    throw new Error(
      `${animationName}: sheet is ${texture.width}x${texture.height}, expected exact grid ${expectedWidth}x${expectedHeight}`
    );
  }
}

function resolveFrameAnchor(definition, animationName = "animation") {
  const anchor = definition.anchor || ILLUSTRATED_COMPANION_RUNTIME_POLICY.anchor;
  const x = Number(anchor.x);
  const y = Number(anchor.y);

  if (x !== ILLUSTRATED_COMPANION_RUNTIME_POLICY.anchor.x || y !== ILLUSTRATED_COMPANION_RUNTIME_POLICY.anchor.y) {
    throw new Error(`${animationName}: companion anchor must be bottom-center (0.5, 1)`);
  }

  return Object.freeze({ x, y });
}

function applyIllustratedTexturePolicy(texture, status, animationName = "animation") {
  const source = texture?.source || texture?.baseTexture;
  const scaleMode = resolvePixiConstant(() => PIXI.SCALE_MODES.LINEAR, "linear");
  const mipmapMode = resolvePixiConstant(() => PIXI.MIPMAP_MODES.ON, "on");
  const applied = [];

  if (setTextureProperty(source, "scaleMode", scaleMode)) applied.push("source.scaleMode");
  if (setTextureProperty(texture, "scaleMode", scaleMode)) applied.push("texture.scaleMode");
  if (setTextureProperty(source, "mipmap", mipmapMode)) applied.push("source.mipmap");
  if (setTextureProperty(source, "autoGenerateMipmaps", true)) applied.push("source.autoGenerateMipmaps");

  if (!applied.length && status?.policyWarnings) {
    status.policyWarnings.push(`${animationName}: Pixi texture source did not expose linear/mipmap properties`);
  }
}

function resolvePixiConstant(read, fallback) {
  try {
    return read() ?? fallback;
  } catch {
    return fallback;
  }
}

function setTextureProperty(target, propertyName, value) {
  if (!target || !(propertyName in target)) return false;

  try {
    target[propertyName] = value;
    return true;
  } catch {
    return false;
  }
}

function sliceSpriteSheet(texture, definition, animationName = "animation") {
  const grid = resolveGridDefinition(texture, definition);
  validateSpriteSheetDimensions(texture, grid, animationName);

  const textures = [];
  const source = texture.source || texture.baseTexture;

  for (let index = 0; index < grid.frameCount; index += 1) {
    const col = index % grid.columns;
    const row = Math.floor(index / grid.columns);

    if (row >= grid.rows) {
      throw new Error(
        `${animationName}: frame index ${index} maps to row ${row}, but rows is ${grid.rows}`
      );
    }

    const x = col * grid.frameWidth;
    const y = row * grid.frameHeight;
    textures.push(
      new PIXI.Texture({
        source,
        frame: new PIXI.Rectangle(x, y, grid.frameWidth, grid.frameHeight)
      })
    );
  }

  return textures;
}

function isValidAnimationDefinition(definition) {
  if (
    !definition ||
    !definition.sheet ||
    !isPositiveInteger(definition.frameWidth) ||
    !isPositiveInteger(definition.frameHeight) ||
    !isPositiveInteger(definition.frameCount)
  ) {
    return false;
  }

  const hasRows = definition.rows !== undefined && definition.rows !== null;
  const hasColumns = definition.columns !== undefined && definition.columns !== null;

  if (hasRows && !isPositiveInteger(definition.rows)) {
    return false;
  }
  if (hasColumns && !isPositiveInteger(definition.columns)) {
    return false;
  }
  if (hasRows && hasColumns && definition.rows * definition.columns < definition.frameCount) {
    return false;
  }

  return true;
}
