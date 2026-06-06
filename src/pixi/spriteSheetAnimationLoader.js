import { WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";
import { ANIMATION_NAMES, CORE_ANIMATION_NAMES } from "../engine/interactionController.js";
import { ASSET_MANIFEST } from "../data/assetManifest.js";
import { getMoodIdleAnimationName, resolveMoodIdleAnimationName } from "../engine/animationProfile.js";

export const GREYSHADE_CAT_ANIMATIONS_PATH = ASSET_MANIFEST.characters.greyshadeCat.animations;
export const GREYSHADE_CAT_ANIMATION_NAMES = ANIMATION_NAMES;
export const GREYSHADE_CAT_CORE_ANIMATION_NAMES = CORE_ANIMATION_NAMES;

export function getPixiAnimationSpeed(definition) {
  const fps = Number.isFinite(definition?.fps) ? definition.fps : 8;
  return Math.max(0.01, fps / 60);
}

export async function loadGreyshadeCatAnimationPack() {
  const status = {
    metadataLoaded: false,
    available: Object.fromEntries(GREYSHADE_CAT_ANIMATION_NAMES.map((name) => [name, false])),
    missing: [],
    errors: []
  };

  try {
    const response = await fetch(GREYSHADE_CAT_ANIMATIONS_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const metadata = await response.json();
    status.metadataLoaded = true;
    const animations = new Map();

    GREYSHADE_CAT_ANIMATION_NAMES.forEach((name) => {
      if (!isValidAnimationDefinition(metadata[name])) {
        status.missing.push(name);
        status.errors.push(`${name}: missing or invalid metadata`);
      }
    });

    await Promise.all(
      GREYSHADE_CAT_CORE_ANIMATION_NAMES.map((name) => loadAnimationDefinition({
        animations,
        metadata,
        status,
        name
      }).catch(() => null))
    );

    return { animations, metadata, status };
  } catch (error) {
    console.warn("Greyshade cat animations metadata failed to load", error);
    status.errors.push(`metadata: ${error.message}`);
    status.missing = [...GREYSHADE_CAT_ANIMATION_NAMES];
    return { animations: new Map(), metadata: null, status };
  }
}

export function createAnimatedCompanionNode(animationPack, creature) {
  const idleDefinition = animationPack?.animations?.get("idle_calm");
  if (!idleDefinition) return null;

  const companion = new PIXI.Container();

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 48, 54, 13).fill({ color: 0x000000, alpha: 0.28 });
  companion.addChild(shadow);

  const animatedSprite = new PIXI.AnimatedSprite(idleDefinition.textures);
  animatedSprite.anchor.set(0.5, 1);
  animatedSprite.loop = true;
  animatedSprite.animationSpeed = getPixiAnimationSpeed(idleDefinition);

  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / idleDefinition.frameWidth, maxH / idleDefinition.frameHeight);
  animatedSprite.scale.set(scale);
  animatedSprite.__baseFrameScale = scale;
  animatedSprite.play();
  companion.addChild(animatedSprite);

  const controller = createSpriteAnimationController(animationPack, animatedSprite, creature?.defaultMood || "calm");
  companion.__animationController = controller;
  companion.__isSpriteSheetCreature = true;
  companion.__isSpriteCreature = true;

  return companion;
}

export function getMoodAnimationName(mood) {
  return getMoodIdleAnimationName(mood);
}

function createSpriteAnimationController(animationPack, animatedSprite, initialMood) {
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
    animatedSprite.anchor.set(0.5, 1);
    const baseFrameScale = animatedSprite.__baseFrameScale || 1;
    animatedSprite.scale.set(mirrorX ? -baseFrameScale : baseFrameScale, baseFrameScale);
    animatedSprite.loop = options.loop === undefined ? Boolean(definition.loop) : Boolean(options.loop);
    animatedSprite.animationSpeed = getPixiAnimationSpeed(definition);
    animatedSprite.gotoAndPlay(0);
    animatedSprite.onComplete = () => {
      if (animatedSprite.loop) return;
      play(resolveMoodIdleAnimationName(lastMood, (name) => animationPack.animations.has(name)), { mood: lastMood });
    };
    return true;
  }

  return {
    loadAnimation,
    play,
    hasAnimation: (animationName) => animationPack.animations.has(animationName),
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
    const texture = await PIXI.Assets.load(definition.sheet);
    const textures = sliceSpriteSheet(texture, definition);
    if (textures.length !== definition.frameCount) {
      throw new Error(`Expected ${definition.frameCount} frames, sliced ${textures.length}`);
    }

    const loadedDefinition = {
      ...definition,
      name,
      textures,
      animationSpeed: getPixiAnimationSpeed(definition),
      durationMs: (definition.frameCount / Math.max(0.01, Number.isFinite(definition.fps) ? definition.fps : 8)) * 1000
    };
    animations.set(name, loadedDefinition);
    status.available[name] = true;
    status.missing = status.missing.filter((missingName) => missingName !== name);
    return loadedDefinition;
  } catch (error) {
    console.warn(`Greyshade cat animation failed to load: ${name}`, error);
    status.available[name] = false;
    if (!status.missing.includes(name)) status.missing.push(name);
    status.errors.push(`${name}: ${error.message}`);
    throw error;
  }
}

function sliceSpriteSheet(texture, definition) {
  const textures = [];
  const columns = Math.max(1, Math.floor(texture.width / definition.frameWidth));
  const source = texture.source || texture.baseTexture;

  for (let index = 0; index < definition.frameCount; index += 1) {
    const x = (index % columns) * definition.frameWidth;
    const y = Math.floor(index / columns) * definition.frameHeight;
    textures.push(
      new PIXI.Texture({
        source,
        frame: new PIXI.Rectangle(x, y, definition.frameWidth, definition.frameHeight)
      })
    );
  }

  return textures;
}

function isValidAnimationDefinition(definition) {
  return Boolean(
    definition &&
      definition.sheet &&
      Number.isFinite(definition.frameWidth) &&
      Number.isFinite(definition.frameHeight) &&
      Number.isFinite(definition.frameCount) &&
      definition.frameWidth > 0 &&
      definition.frameHeight > 0 &&
      definition.frameCount > 0
  );
}
