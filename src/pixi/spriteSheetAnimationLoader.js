import { WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";

export const GREYSHADE_CAT_ANIMATIONS_PATH = "./assets/characters/greyshade-cat/metadata/animations.json";
export const GREYSHADE_CAT_ANIMATION_NAMES = [
  "idle_calm",
  "idle_defensive",
  "idle_distant",
  "blink",
  "touch_guarded",
  "touch_accept",
  "touch_reject"
];

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

    await Promise.all(
      GREYSHADE_CAT_ANIMATION_NAMES.map(async (name) => {
        const definition = metadata[name];
        if (!isValidAnimationDefinition(definition)) {
          status.missing.push(name);
          status.errors.push(`${name}: missing or invalid metadata`);
          return;
        }

        try {
          const texture = await PIXI.Assets.load(definition.sheet);
          const textures = sliceSpriteSheet(texture, definition);
          if (textures.length !== definition.frameCount) {
            throw new Error(`Expected ${definition.frameCount} frames, sliced ${textures.length}`);
          }

          animations.set(name, {
            ...definition,
            name,
            textures,
            durationMs: (definition.frameCount / Math.max(1, definition.fps || 8)) * 1000
          });
          status.available[name] = true;
        } catch (error) {
          console.warn(`Greyshade cat animation failed to load: ${name}`, error);
          status.missing.push(name);
          status.errors.push(`${name}: ${error.message}`);
        }
      })
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
  animatedSprite.animationSpeed = getAnimationSpeed(idleDefinition);

  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / idleDefinition.frameWidth, maxH / idleDefinition.frameHeight);
  animatedSprite.scale.set(scale);
  animatedSprite.play();
  companion.addChild(animatedSprite);

  const controller = createSpriteAnimationController(animationPack, animatedSprite, creature?.defaultMood || "calm");
  companion.__animationController = controller;
  companion.__isSpriteSheetCreature = true;
  companion.__isSpriteCreature = true;

  return companion;
}

export function getMoodAnimationName(mood) {
  const moodToAnimation = {
    calm: "idle_calm",
    happy: "idle_calm",
    warm: "idle_calm",
    defensive: "idle_defensive",
    distant: "idle_distant",
    sad: "idle_distant",
    tired: "idle_distant"
  };
  return moodToAnimation[mood] || "idle_calm";
}

function createSpriteAnimationController(animationPack, animatedSprite, initialMood) {
  let currentAnimationName = "idle_calm";
  let lastMood = initialMood;

  function play(animationName, options = {}) {
    lastMood = options.mood || lastMood;
    const definition = animationPack.animations.get(animationName);
    if (!definition) return false;

    if (currentAnimationName === animationName && animatedSprite.playing) return true;

    currentAnimationName = animationName;
    animatedSprite.textures = definition.textures;
    animatedSprite.loop = Boolean(definition.loop);
    animatedSprite.animationSpeed = getAnimationSpeed(definition);
    animatedSprite.gotoAndPlay(0);
    animatedSprite.onComplete = () => {
      if (definition.loop) return;
      play(getMoodAnimationName(lastMood), { mood: lastMood });
    };
    return true;
  }

  return {
    play,
    hasAnimation: (animationName) => animationPack.animations.has(animationName),
    getCurrentAnimationName: () => currentAnimationName,
    getStatus: () => animationPack.status,
    getAnimationDurationMs: (animationName) => animationPack.animations.get(animationName)?.durationMs || null
  };
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

function getAnimationSpeed(definition) {
  return (definition.fps || 8) / 60;
}
