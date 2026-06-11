import { GAME_HEIGHT, GAME_WIDTH } from "./pixiApp.js";

const LAYER_KEYS = Object.freeze({
  fx: "fx",
  foreground: "foreground",
  platform: "platform"
});

export function createHabitatTraceRenderer(PIXI, layerTargets = {}) {
  const nodes = new Map();
  const bounds = {
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  };

  function resolveLayer(layerName) {
    if (layerName === LAYER_KEYS.platform) return layerTargets.platform;
    if (layerName === LAYER_KEYS.foreground) return layerTargets.foreground;
    return layerTargets.fx;
  }

  function sync(visuals = []) {
    const nextIds = new Set();

    for (const visual of visuals) {
      if (!visual?.id) continue;
      nextIds.add(visual.id);

      const existing = nodes.get(visual.id);
      if (!existing) {
        const layer = resolveLayer(visual.layer);
        if (!layer) continue;

        const node = createTraceNode(PIXI, visual, bounds);
        layer.addChild(node.container);
        nodes.set(visual.id, node);
        continue;
      }

      if (existing.kind !== visual.kind) {
        existing.container.parent?.removeChild(existing.container);
        existing.container.destroy({ children: true });
        nodes.delete(visual.id);

        const layer = resolveLayer(visual.layer);
        if (!layer) continue;

        const node = createTraceNode(PIXI, visual, bounds);
        layer.addChild(node.container);
        nodes.set(visual.id, node);
        continue;
      }

      migrateTraceLayer(existing, visual.layer, resolveLayer);
      updateTraceNode(existing, visual, bounds);
    }

    for (const [traceId, node] of nodes.entries()) {
      if (nextIds.has(traceId)) continue;
      node.container.parent?.removeChild(node.container);
      node.container.destroy({ children: true });
      nodes.delete(traceId);
    }
  }

  function update(timeSeconds = 0) {
    for (const node of nodes.values()) {
      const pulse = 1 + Math.sin(timeSeconds * node.pulseSpeed) * 0.06;
      node.container.alpha = clamp01(node.baseAlpha * pulse);
    }
  }

  function dispose() {
    for (const node of nodes.values()) {
      node.container.parent?.removeChild(node.container);
      node.container.destroy({ children: true });
    }
    nodes.clear();
  }

  return {
    sync,
    update,
    dispose
  };
}

function createTraceNode(PIXI, visual, bounds) {
  const container = new PIXI.Container();
  container.name = `habitat_trace_${visual.id}`;
  container.eventMode = "none";
  container.roundPixels = true;

  const graphics = drawTraceGraphics(PIXI, visual.kind);
  graphics.eventMode = "none";
  container.addChild(graphics);

  const node = {
    container,
    graphics,
    kind: visual.kind,
    layerName: visual.layer,
    pulseSpeed: visual.pulseSpeed,
    baseAlpha: visual.alpha
  };

  updateTraceNode(node, visual, bounds);
  return node;
}

function migrateTraceLayer(node, layerName, resolveLayer) {
  if (!node || node.layerName === layerName) return;

  const targetLayer = resolveLayer(layerName);
  if (!targetLayer) return;

  node.container.parent?.removeChild(node.container);
  targetLayer.addChild(node.container);
  node.layerName = layerName;
}

function updateTraceNode(node, visual, bounds) {
  node.kind = visual.kind;
  node.layerName = visual.layer;
  node.pulseSpeed = visual.pulseSpeed;
  node.baseAlpha = visual.alpha;
  node.container.x = Math.round(visual.xRatio * bounds.width);
  node.container.y = Math.round(visual.yRatio * bounds.height);
  node.container.scale.set(visual.scale || 1);
  node.container.alpha = visual.alpha;
}

function drawTraceGraphics(PIXI, kind) {
  const graphics = new PIXI.Graphics();

  switch (kind) {
    case "mist":
      graphics.ellipse(0, 0, 16, 10).fill({ color: 0x8aa0b8, alpha: 0.55 });
      break;
    case "repaired_light":
      graphics.circle(-3, 0, 1.6).fill({ color: 0xd8c27a, alpha: 0.7 });
      graphics.circle(3, -1, 1.4).fill({ color: 0x8fd0ff, alpha: 0.65 });
      graphics.moveTo(-4, 1).lineTo(4, 0).stroke({ color: 0xb7d9ff, width: 1, alpha: 0.45 });
      break;
    case "leaf":
      graphics.ellipse(0, 0, 5, 3).fill({ color: 0x8a7350, alpha: 0.75 });
      break;
    case "ripple":
      graphics.circle(0, 0, 7).stroke({ color: 0x9ed8ff, width: 1, alpha: 0.55 });
      graphics.circle(0, 0, 4).stroke({ color: 0xc8ecff, width: 1, alpha: 0.35 });
      break;
    case "ember":
      graphics.circle(-1, 0, 1.8).fill({ color: 0xffa45c, alpha: 0.8 });
      graphics.circle(2, -1, 1.2).fill({ color: 0xffd38a, alpha: 0.7 });
      break;
    case "blue_lantern":
      // 悲傷：湖面上的藍色漂流盞
      graphics.roundRect(-4, -7, 8, 11, 2).fill({ color: 0x2d6db8, alpha: 0.55 });
      graphics.roundRect(-2.5, -5, 5, 6, 1.5).fill({ color: 0x9ed2ff, alpha: 0.75 });
      graphics.circle(0, -2, 1.4).fill({ color: 0xe8f6ff, alpha: 0.85 });
      graphics.ellipse(0, 6, 6, 1.6).fill({ color: 0x6db8ff, alpha: 0.25 });
      break;
    case "white_ash":
      // 疲憊：營火邊的幾撮白燼
      graphics.circle(-4, 1, 1.6).fill({ color: 0xe9e4da, alpha: 0.6 });
      graphics.circle(1, -2, 1.3).fill({ color: 0xf4f1ea, alpha: 0.55 });
      graphics.circle(4, 2, 1.1).fill({ color: 0xd8d2c6, alpha: 0.5 });
      break;
    case "glitch_noise":
      // 焦慮：晶簇旁的細小雜訊線
      graphics.moveTo(-6, -3).lineTo(-1, -3).stroke({ color: 0xff6b8a, width: 1.4, alpha: 0.65 });
      graphics.moveTo(-3, 0).lineTo(5, 0).stroke({ color: 0x9b59ff, width: 1.2, alpha: 0.6 });
      graphics.moveTo(-5, 3).lineTo(0, 3).stroke({ color: 0x6de0ff, width: 1, alpha: 0.55 });
      graphics.rect(2, -4, 2, 2).fill({ color: 0xff6b8a, alpha: 0.5 });
      break;
    case "golden_rune":
      // 感謝：魔法陣上的金色符文
      graphics
        .moveTo(0, -6)
        .lineTo(5, 0)
        .lineTo(0, 6)
        .lineTo(-5, 0)
        .closePath()
        .stroke({ color: 0xffd700, width: 1.4, alpha: 0.75 });
      graphics.circle(0, 0, 1.6).fill({ color: 0xffe9a3, alpha: 0.85 });
      break;
    case "glow":
    default:
      graphics.circle(0, 0, 5).fill({ color: 0xb8e8ff, alpha: 0.75 });
      graphics.circle(0, 0, 2.2).fill({ color: 0xf2fbff, alpha: 0.55 });
      break;
  }

  return graphics;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}