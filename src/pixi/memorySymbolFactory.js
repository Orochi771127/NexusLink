import { getStatusVisualContract, getSymbolVisual } from "./memoryVisualContract.js";
import { snapPixel, stableHash } from "./memorySymbolLayout.js";

const SYMBOL_TEXTURE_SIZE = 24;
const textureCache = new Map();

export function configureMemoryTextureStyle() {
  const PIXI = getPixi();
  if (PIXI.TextureStyle?.defaultOptions) {
    PIXI.TextureStyle.defaultOptions.scaleMode = "nearest";
  }
}

export function getSymbolTexture(symbol, renderer) {
  const symbolKey = symbol || "fallback";
  if (textureCache.has(symbolKey)) {
    return textureCache.get(symbolKey);
  }

  configureMemoryTextureStyle();

  const PIXI = getPixi();
  const graphics = new PIXI.Graphics();
  drawSymbolGraphic(graphics, symbolKey);

  const texture = generateNearestTexture(renderer, graphics);
  applyNearestTextureStyle(texture);
  textureCache.set(symbolKey, texture);

  graphics.destroy?.({ children: true });
  return texture;
}

export function clearTextureCache() {
  for (const texture of textureCache.values()) {
    texture.destroy?.(true);
  }
  textureCache.clear();
}

export function createMemorySymbolEntity(memoryData, { renderer } = {}) {
  if (!renderer) {
    throw new Error("createMemorySymbolEntity requires a PixiJS renderer.");
  }

  const PIXI = getPixi();
  const texture = getSymbolTexture(memoryData.symbol, renderer);
  const node = new PIXI.Container();
  const sprite = new PIXI.Sprite(texture);
  const initialStatus = memoryData.status || "fresh";
  const initialContract = getStatusVisualContract(initialStatus);
  const phase = (stableHash(memoryData.id) % 628) / 100;

  node.name = `memory_symbol_${memoryData.id}`;
  node.eventMode = "none";
  node.__memoryId = memoryData.id;
  node.__status = initialStatus;
  node.__symbol = memoryData.symbol;
  node.__place = memoryData.place;

  sprite.anchor?.set?.(0.5);
  sprite.position.set(0, 0);
  sprite.scale.set(initialContract.baseScale);
  sprite.alpha = initialContract.baseAlpha;
  sprite.roundPixels = true;
  node.addChild(sprite);

  const entity = {
    memoryId: memoryData.id,
    node,
    sprite,
    currentStatus: initialStatus,
    currentContract: initialContract,
    timeSeconds: phase,
    transition: null,

    setStatus(nextStatus) {
      if (!nextStatus || nextStatus === this.currentStatus) return;

      const nextContract = getStatusVisualContract(nextStatus);
      this.transition = {
        elapsedMs: 0,
        durationMs: nextContract.transitionMs,
        fromAlpha: node.alpha,
        toAlpha: nextContract.baseAlpha,
        fromScale: sprite.scale.x,
        toScale: nextContract.baseScale
      };
      this.currentStatus = nextStatus;
      this.currentContract = nextContract;
      node.__status = nextStatus;
    },

    updateVisual(deltaMS = 16.67, latestMemory) {
      if (latestMemory?.status && latestMemory.status !== this.currentStatus) {
        this.setStatus(latestMemory.status);
      }

      this.timeSeconds += deltaMS / 1000;
      const contract = this.currentContract;
      let baseAlpha = contract.baseAlpha;
      let baseScale = contract.baseScale;

      if (this.transition) {
        this.transition.elapsedMs += deltaMS;
        const progress = Math.min(1, this.transition.elapsedMs / Math.max(1, this.transition.durationMs));
        const eased = easeOutCubic(progress);
        baseAlpha = lerp(this.transition.fromAlpha, this.transition.toAlpha, eased);
        baseScale = lerp(this.transition.fromScale, this.transition.toScale, eased);
        if (progress >= 1) this.transition = null;
      }

      const pulse = contract.pulseSpeed > 0
        ? Math.sin((this.timeSeconds + phase) * contract.pulseSpeed) * contract.pulseAmount
        : 0;
      const flicker = contract.alphaFlicker > 0
        ? Math.sin((this.timeSeconds + phase) * 9.5) * contract.alphaFlicker
        : 0;
      const driftY = contract.driftAmount > 0
        ? Math.sin((this.timeSeconds + phase) * contract.driftSpeed) * contract.driftAmount
        : 0;

      node.alpha = clamp01(baseAlpha + flicker);
      sprite.scale.set(Math.max(0.1, baseScale + pulse));
      sprite.y = snapPixel(driftY);
      sprite.x = 0;
    },

    destroy() {
      node.destroy({ children: true });
    }
  };

  entity.updateVisual(0, memoryData);
  return entity;
}

function drawSymbolGraphic(graphics, symbol) {
  const visual = getSymbolVisual(symbol);
  const p = visual.pixelSize || 3;
  drawTransparentBounds(graphics);

  if (symbol === "blue_lantern") {
    drawPixel(graphics, 11, 4, 2, 2, visual.accentTint);
    drawPixel(graphics, 8, 7, 8, 3, visual.tint);
    drawPixel(graphics, 5, 10, 14, 4, visual.tint);
    drawPixel(graphics, 9, 14, 6, 3, visual.shadowTint);
    drawPixel(graphics, 11, 17, 2, 2, visual.accentTint);
    return;
  }

  if (symbol === "white_ash") {
    drawPixel(graphics, 7, 8, p, p, visual.shadowTint);
    drawPixel(graphics, 12, 7, p, p, visual.tint);
    drawPixel(graphics, 16, 11, p, p, visual.accentTint);
    drawPixel(graphics, 9, 14, p, p, visual.tint);
    drawPixel(graphics, 14, 16, p, p, visual.shadowTint);
    return;
  }

  if (symbol === "glitch_noise") {
    drawPixel(graphics, 5, 7, 7, 2, visual.tint);
    drawPixel(graphics, 14, 9, 5, 2, visual.accentTint);
    drawPixel(graphics, 8, 13, 3, 2, visual.shadowTint);
    drawPixel(graphics, 15, 15, 6, 2, visual.tint);
    drawPixel(graphics, 3, 17, 4, 2, visual.accentTint);
    return;
  }

  if (symbol === "faint_spark") {
    drawPixel(graphics, 11, 5, 2, 5, visual.accentTint);
    drawPixel(graphics, 8, 10, 8, 3, visual.tint);
    drawPixel(graphics, 11, 13, 2, 5, visual.shadowTint);
    drawPixel(graphics, 10, 9, 4, 5, visual.tint);
    return;
  }

  if (symbol === "star_iron_ore") {
    drawPixel(graphics, 9, 5, 7, 4, visual.accentTint);
    drawPixel(graphics, 6, 9, 12, 6, visual.tint);
    drawPixel(graphics, 9, 15, 6, 4, visual.shadowTint);
    drawPixel(graphics, 16, 12, 3, 3, visual.shadowTint);
    return;
  }

  if (symbol === "golden_rune") {
    drawPixel(graphics, 6, 6, 12, 2, visual.accentTint);
    drawPixel(graphics, 11, 8, 2, 10, visual.tint);
    drawPixel(graphics, 7, 12, 10, 2, visual.tint);
    drawPixel(graphics, 5, 17, 14, 2, visual.shadowTint);
    return;
  }

  if (symbol === "soft_ripple") {
    drawPixel(graphics, 6, 9, 12, 2, visual.tint);
    drawPixel(graphics, 4, 13, 16, 2, visual.accentTint);
    drawPixel(graphics, 8, 17, 8, 2, visual.shadowTint);
    return;
  }

  drawPixel(graphics, 8, 8, 8, 8, visual.tint);
  drawPixel(graphics, 10, 10, 4, 4, visual.accentTint);
}

function drawTransparentBounds(graphics) {
  graphics.rect(0, 0, SYMBOL_TEXTURE_SIZE, SYMBOL_TEXTURE_SIZE).fill({ color: 0xffffff, alpha: 0.001 });
}

function drawPixel(graphics, x, y, width, height, color, alpha = 1) {
  graphics.rect(snapPixel(x), snapPixel(y), snapPixel(width), snapPixel(height)).fill({ color, alpha });
}

function generateNearestTexture(renderer, graphics) {
  const resolution = Math.min(window.devicePixelRatio || 1, 2);
  const options = {
    scaleMode: "nearest",
    resolution
  };

  try {
    return renderer.generateTexture({
      target: graphics,
      ...options
    });
  } catch (error) {
    return renderer.generateTexture(graphics, options);
  }
}

function applyNearestTextureStyle(texture) {
  if (texture?.source) {
    texture.source.scaleMode = "nearest";
  }
  if (texture?.baseTexture) {
    texture.baseTexture.scaleMode = "nearest";
  }
}

function getPixi() {
  if (!window.PIXI) {
    throw new Error("PixiJS is not available on window.PIXI");
  }
  return window.PIXI;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

function lerp(from, to, ratio) {
  return from + (to - from) * ratio;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}
