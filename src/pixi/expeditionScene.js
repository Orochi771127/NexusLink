/**
 * 心域遠征 Pixi 場景（Phase C + 4A 區域氛圍）。
 * 美術：3D 微縮／黏土樹脂 diorama placeholder。
 */
import {
  createExpeditionAtmosphere,
  destroyExpeditionAtmosphere,
  updateExpeditionAtmosphere
} from "./expeditionAtmosphere.js";
import {
  getEnemyRiftSilhouettePath,
  getIllustratedCompanionAssetById
} from "../data/assetManifest.js";
import { getExpeditionGameplayVisualProfile } from "../data/gameplayVisualProfiles.js";
import {
  EXPEDITION_WALK_DIRECTIONS,
  getExpeditionSpritePilotProfile,
  isExpeditionSpritePilotRequested
} from "../data/expeditionSpriteProfiles.js";

function drawRoundedRect(g, x, y, w, h, r, fill) {
  g.roundRect(x, y, w, h, r).fill(fill);
}

function addClayShadow(PIXI, parent, x, y, rx, ry, color, alpha = 0.22) {
  const shadow = new PIXI.Graphics();
  shadow.ellipse(x, y, rx, ry).fill({ color, alpha });
  parent.addChild(shadow);
  return shadow;
}

function attachFoundationSprite(PIXI, root, ground, obstacles, region, visual) {
  const source = visual.assetSlots?.foundation;
  if (!source || !PIXI?.Assets?.load) return null;
  const worldW = region.worldWidth || 1170;
  const worldH = region.worldHeight || 780;
  const focalY = visual.assetSlots?.foundationFocalY ?? 0.5;
  const loading = PIXI.Assets.load(source)
    .then((texture) => {
      if (!texture || root.destroyed || ground.destroyed) return null;
      const sprite = new PIXI.Sprite(texture);
      sprite.name = "authored_foundation";
      const sourceW = texture.width || visual.assetSlots?.foundationWidth || 1;
      const sourceH = texture.height || visual.assetSlots?.foundationHeight || 1;
      const scale = Math.max(worldW / sourceW, worldH / sourceH);
      const renderedW = sourceW * scale;
      const renderedH = sourceH * scale;
      sprite.scale.set(scale);
      sprite.x = (worldW - renderedW) * 0.5;
      sprite.y = Math.max(worldH - renderedH, Math.min(0, worldH * 0.5 - renderedH * focalY));
      ground.addChildAt(sprite, 0);
      if (ground.__proceduralFallback) ground.__proceduralFallback.alpha = 0.035;
      if (obstacles) obstacles.alpha = 0.035;
      root.__foundationSprite = sprite;
      return sprite;
    })
    .catch(() => null);
  root.__foundationPromise = loading;
  return loading;
}

function sliceIdleTextures(PIXI, texture, definition) {
  const columns = Number(definition?.columns) || 1;
  const rows = Number(definition?.rows) || 1;
  const frameWidth = Number(definition?.frameWidth) || 0;
  const frameHeight = Number(definition?.frameHeight) || 0;
  const frameCount = Math.min(Number(definition?.frameCount) || 1, columns * rows);
  if (!texture || !frameWidth || !frameHeight || frameCount < 1) return [];
  const source = texture.source || texture.baseTexture;
  return Array.from({ length: frameCount }, (_, index) => new PIXI.Texture({
    source,
    frame: new PIXI.Rectangle(
      (index % columns) * frameWidth,
      Math.floor(index / columns) * frameHeight,
      frameWidth,
      frameHeight
    )
  }));
}

function attachIllustratedCompanion(PIXI, node, companionId) {
  const asset = getIllustratedCompanionAssetById(companionId);
  if (!asset?.animations || !PIXI?.Assets?.load || typeof fetch !== "function") return null;
  const loading = fetch(asset.animations, { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((metadata) => {
      const definition = metadata?.idle_calm;
      if (!definition?.sheet) return null;
      return PIXI.Assets.load(definition.sheet).then((texture) => ({ definition, texture }));
    })
    .then((loaded) => {
      if (!loaded || node.destroyed) return null;
      const textures = sliceIdleTextures(PIXI, loaded.texture, loaded.definition);
      if (!textures.length) return null;
      const sprite = new PIXI.AnimatedSprite(textures);
      sprite.name = "illustrated_companion";
      sprite.anchor.set(loaded.definition.anchor?.x ?? 0.5, loaded.definition.anchor?.y ?? 1);
      sprite.animationSpeed = Math.max(0.01, (Number(loaded.definition.fps) || 3) / 60);
      sprite.loop = loaded.definition.loop !== false;
      const frameHeight = Number(loaded.definition.frameHeight) || 512;
      sprite.scale.set(112 / frameHeight);
      sprite.y = 18;
      sprite.roundPixels = false;
      sprite.visible = !node.__eightDirectionSprite;
      node.addChildAt(sprite, Math.min(1, node.children.length));
      const fallback = node.getChildByName?.("procedural_body_fallback");
      if (fallback) fallback.visible = false;
      sprite.play();
      node.__illustratedSprite = sprite;
      return sprite;
    })
    .catch(() => null);
  node.__illustratedPromise = loading;
  return loading;
}

export function quantizeExpeditionWalkDirection(dx, dy, fallback = "south") {
  if (!Number.isFinite(dx) || !Number.isFinite(dy) || Math.hypot(dx, dy) < 0.2) {
    return EXPEDITION_WALK_DIRECTIONS.includes(fallback) ? fallback : "south";
  }
  const octants = [
    "east",
    "southeast",
    "south",
    "southwest",
    "west",
    "northwest",
    "north",
    "northeast"
  ];
  const normalized = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);
  return octants[Math.round(normalized / (Math.PI / 4)) % octants.length];
}

function attachEightDirectionCompanionPilot(PIXI, node, companionId) {
  const profile = getExpeditionSpritePilotProfile(companionId);
  if (
    !profile ||
    !isExpeditionSpritePilotRequested(companionId) ||
    !PIXI?.Assets?.load
  ) {
    node.__eightDirectionPilotStatus = "not_requested";
    return null;
  }

  node.__eightDirectionPilotStatus = "loading";
  const loading = Promise.all(EXPEDITION_WALK_DIRECTIONS.map(async (direction) => {
    const texture = await PIXI.Assets.load(profile.directions[direction]);
    return [direction, sliceIdleTextures(PIXI, texture, profile)];
  }))
    .then((entries) => {
      if (node.destroyed) return null;
      const texturesByDirection = Object.fromEntries(entries);
      if (EXPEDITION_WALK_DIRECTIONS.some((direction) => texturesByDirection[direction]?.length !== 8)) {
        throw new Error("incomplete_eight_direction_candidate");
      }
      const sprite = new PIXI.AnimatedSprite(texturesByDirection.south);
      sprite.name = "greyshade_eight_direction_candidate";
      sprite.anchor.set(profile.anchor.x, profile.anchor.y);
      sprite.scale.set(profile.onScreenHeight / profile.frameHeight);
      sprite.animationSpeed = Math.max(0.01, profile.fps / 60);
      sprite.loop = true;
      sprite.y = 18;
      sprite.roundPixels = false;
      sprite.stop();
      sprite.gotoAndStop(0);
      node.addChildAt(sprite, Math.min(1, node.children.length));

      const fallback = node.getChildByName?.("procedural_body_fallback");
      if (fallback) fallback.visible = false;
      if (node.__illustratedSprite) node.__illustratedSprite.visible = false;
      node.__eightDirectionSprite = sprite;
      node.__eightDirectionTextures = texturesByDirection;
      node.__eightDirectionDirection = "south";
      node.__eightDirectionPilotStatus = "ready";
      return sprite;
    })
    .catch(() => {
      node.__eightDirectionPilotStatus = "fallback";
      return null;
    });
  node.__eightDirectionPilotPromise = loading;
  return loading;
}

export function syncEightDirectionCompanionPilot(node, x, y) {
  const previous = node?.__eightDirectionPilotPosition;
  node.__eightDirectionPilotPosition = { x, y };
  const sprite = node?.__eightDirectionSprite;
  const texturesByDirection = node?.__eightDirectionTextures;
  if (!sprite || !texturesByDirection) return false;

  const dx = previous ? x - previous.x : 0;
  const dy = previous ? y - previous.y : 0;
  const moving = Number.isFinite(dx) && Number.isFinite(dy) && Math.hypot(dx, dy) >= 0.2;
  const direction = quantizeExpeditionWalkDirection(
    dx,
    dy,
    node.__eightDirectionDirection || "south"
  );
  if (direction !== node.__eightDirectionDirection) {
    sprite.textures = texturesByDirection[direction];
    node.__eightDirectionDirection = direction;
  }
  if (moving) {
    if (!sprite.playing) sprite.play();
  } else if (sprite.playing) {
    sprite.stop();
    sprite.gotoAndStop(0);
  }
  return true;
}

function attachRiftSilhouette(PIXI, node, enemy) {
  const source = getEnemyRiftSilhouettePath(enemy?.enemyId);
  if (!source || !PIXI?.Assets?.load) return null;
  const loading = PIXI.Assets.load(source)
    .then((texture) => {
      if (!texture || node.destroyed) return null;
      const sprite = new PIXI.Sprite(texture);
      sprite.name = "rift_silhouette";
      sprite.anchor.set(0.5);
      const maxEdge = Math.max(texture.width || 1, texture.height || 1);
      sprite.scale.set(58 / maxEdge);
      sprite.y = -5;
      node.addChildAt(sprite, Math.min(1, node.children.length));
      const fallback = node.getChildByName?.("procedural_rift_fallback");
      if (fallback) fallback.visible = false;
      node.__riftSprite = sprite;
      return sprite;
    })
    .catch(() => null);
  node.__riftPromise = loading;
  return loading;
}

function buildPathLayer(PIXI, region, visual) {
  const layer = new PIXI.Container();
  layer.name = "clay_paths";
  const shadows = new PIXI.Graphics();
  const stones = new PIXI.Graphics();
  const highlights = new PIXI.Graphics();
  const palette = visual.palette;
  const worldW = region.worldWidth || 1170;
  const worldH = region.worldHeight || 780;

  (visual.pathPolylines || []).forEach((polyline, pathIndex) => {
    const points = polyline.map((point) => ({ x: point.x * worldW, y: point.y * worldH }));
    for (let i = 1; i < points.length; i += 1) {
      const from = points[i - 1];
      const to = points[i];
      const distance = Math.hypot(to.x - from.x, to.y - from.y);
      const steps = Math.max(1, Math.ceil(distance / 30));
      for (let step = 0; step <= steps; step += 1) {
        const ratio = step / steps;
        const x = from.x + (to.x - from.x) * ratio;
        const y = from.y + (to.y - from.y) * ratio;
        const seed = pathIndex * 37 + i * 17 + step;
        const rx = 11 + (seed % 4);
        const ry = 7 + (seed % 3);
        const rotation = ((seed % 7) - 3) * 0.04;
        shadows.ellipse(x + 2, y + 4, rx + 2, ry + 2, rotation).fill({ color: palette.shadow, alpha: 0.24 });
        stones.ellipse(x, y, rx, ry, rotation).fill({ color: seed % 3 === 0 ? palette.pathLight : palette.path, alpha: 1 });
        highlights.ellipse(x - rx * 0.22, y - ry * 0.25, rx * 0.42, ry * 0.26, rotation).fill({ color: palette.pathLight, alpha: 0.42 });
      }
    }
  });
  layer.addChild(shadows, stones, highlights);
  return layer;
}

function buildGroundLayer(PIXI, region, visual) {
  const layer = new PIXI.Container();
  layer.name = "ground";
  const fallback = new PIXI.Container();
  fallback.name = "procedural_foundation_fallback";
  const { palette } = visual;
  const worldW = region.worldWidth || 1170;
  const worldH = region.worldHeight || 780;
  const base = new PIXI.Graphics();
  base.rect(0, 0, worldW, worldH).fill({ color: palette.ground, alpha: 1 });
  fallback.addChild(base);

  const mounds = new PIXI.Graphics();
  const moundSpecs = [
    [0.1, 0.1, 0.23, 0.2],
    [0.88, 0.14, 0.22, 0.24],
    [0.16, 0.74, 0.25, 0.25],
    [0.88, 0.78, 0.24, 0.22],
    [0.5, 0.48, 0.2, 0.15]
  ];
  moundSpecs.forEach(([x, y, rx, ry], index) => {
    mounds.ellipse(x * worldW + 8, y * worldH + 12, rx * worldW, ry * worldH).fill({ color: palette.shadow, alpha: 0.15 });
    mounds.ellipse(x * worldW, y * worldH, rx * worldW, ry * worldH).fill({ color: index % 2 ? palette.groundDark : palette.groundLight, alpha: 0.54 });
  });
  fallback.addChild(mounds, buildPathLayer(PIXI, region, visual));
  layer.addChild(fallback);
  layer.__proceduralFallback = fallback;
  return layer;
}

function buildBush(PIXI, obs, palette) {
  const node = new PIXI.Container();
  addClayShadow(PIXI, node, 4, obs.r * 0.52, obs.r * 0.9, obs.r * 0.34, palette.shadow, 0.23);
  const body = new PIXI.Graphics();
  const pieces = [
    [-0.48, 0.05, 0.52],
    [0, -0.3, 0.62],
    [0.48, 0.05, 0.52],
    [-0.22, 0.35, 0.46],
    [0.25, 0.35, 0.46]
  ];
  pieces.forEach(([x, y, r], index) => {
    body.circle(x * obs.r, y * obs.r, r * obs.r).fill({ color: index === 1 ? palette.bushLight : palette.bush, alpha: 1 });
  });
  const flower = Math.max(2, obs.r * 0.08);
  body.circle(-obs.r * 0.34, -obs.r * 0.05, flower).fill({ color: palette.flower, alpha: 0.9 });
  body.circle(obs.r * 0.28, obs.r * 0.2, flower).fill({ color: palette.flower, alpha: 0.82 });
  node.addChild(body);
  node.x = obs.x;
  node.y = obs.y;
  return node;
}

function buildRock(PIXI, obs, palette) {
  const node = new PIXI.Container();
  addClayShadow(PIXI, node, 4, obs.r * 0.58, obs.r * 0.88, obs.r * 0.34, palette.shadow, 0.25);
  const rock = new PIXI.Graphics();
  rock.ellipse(0, 0, obs.r, obs.r * 0.78).fill({ color: palette.rock, alpha: 1 });
  rock.ellipse(-obs.r * 0.25, -obs.r * 0.28, obs.r * 0.48, obs.r * 0.2, -0.2).fill({ color: palette.rockLight, alpha: 0.48 });
  node.addChild(rock);
  node.x = obs.x;
  node.y = obs.y;
  return node;
}

function buildObstacleLayer(PIXI, region, visual) {
  const layer = new PIXI.Container();
  layer.name = "obstacles";
  const { palette } = visual;

  (region.circleObstacles || []).forEach((obs) => {
    layer.addChild(obs.id.includes("bush") ? buildBush(PIXI, obs, palette) : buildRock(PIXI, obs, palette));
  });

  (region.rectObstacles || []).forEach((obs) => {
    const r = obs.r ?? 12;
    addClayShadow(PIXI, layer, obs.x + obs.w / 2, obs.y + obs.h + 6, obs.w * 0.42, 10, palette.shadow, 0.24);
    const g = new PIXI.Graphics();
    drawRoundedRect(g, obs.x, obs.y, obs.w, obs.h, r, { color: palette.rock, alpha: 1 });
    drawRoundedRect(g, obs.x + 8, obs.y + 5, obs.w - 16, Math.max(8, obs.h * 0.28), Math.max(4, r - 4), { color: palette.rockLight, alpha: 0.38 });
    layer.addChild(g);
  });

  return layer;
}

function buildExploreMarkers(PIXI, region, visual) {
  const layer = new PIXI.Container();
  layer.name = "explore_markers";
  const { palette } = visual;

  (region.explorePoints || []).forEach((point) => {
    const marker = new PIXI.Container();
    marker.name = `marker_${point.id}`;
    marker.x = point.x;
    marker.y = point.y;
    addClayShadow(PIXI, marker, 0, 10, 11, 4, palette.shadow, 0.2);
    const halo = new PIXI.Graphics();
    halo.circle(0, 0, 17).fill({ color: palette.resin, alpha: 0.12 });
    const crystal = new PIXI.Graphics();
    crystal
      .moveTo(0, -13)
      .lineTo(8, -1)
      .lineTo(3, 11)
      .lineTo(-6, 7)
      .lineTo(-8, -1)
      .closePath()
      .fill({ color: palette.resin, alpha: 0.88 });
    crystal.moveTo(0, -11).lineTo(1, 8).lineTo(7, -1).closePath().fill({ color: palette.resinDeep, alpha: 0.42 });
    marker.addChild(halo, crystal);
    layer.addChild(marker);
  });

  return layer;
}

function buildEnemyNode(PIXI, enemy, visual) {
  const node = new PIXI.Container();
  node.name = `enemy_${enemy.id}`;
  const { palette } = visual;

  addClayShadow(PIXI, node, 0, 15, 19, 7, palette.shadow, 0.28);
  const aura = new PIXI.Graphics();
  aura.circle(0, -2, 23).fill({ color: palette.riftLight, alpha: 0.1 });
  const ribbons = new PIXI.Graphics();
  ribbons.name = "procedural_rift_fallback";
  for (let i = 0; i < 3; i += 1) {
    const offset = (i - 1) * 7;
    ribbons
      .moveTo(offset, 15)
      .bezierCurveTo(offset - 11, 5, offset + 13, -5, offset - 2, -21)
      .stroke({ color: i === 1 ? palette.riftLight : palette.rift, width: 6 - i, alpha: 0.78, cap: "round" });
  }
  ribbons.circle(0, -4, 6).fill({ color: palette.riftLight, alpha: 0.7 });
  node.addChild(aura, ribbons);

  const hpBg = new PIXI.Graphics();
  hpBg.roundRect(-16, -34, 32, 4, 2).fill({ color: palette.hpBarBg, alpha: 0.82 });
  const hpFill = new PIXI.Graphics();
  hpFill.name = "hp_fill";
  hpFill.roundRect(-16, -34, 32, 4, 2).fill({ color: palette.hpBar, alpha: 1 });
  node.addChild(hpBg, hpFill);

  node.x = enemy.x;
  node.y = enemy.y;
  attachRiftSilhouette(PIXI, node, enemy);
  return node;
}

function buildLootNode(PIXI, piece, visual) {
  const node = new PIXI.Container();
  node.name = `loot_${piece.id}`;
  const g = new PIXI.Graphics();
  g.moveTo(0, -6).lineTo(5, 0).lineTo(0, 6).lineTo(-5, 0).closePath().fill({
    color: piece.color ?? visual.palette.resin,
    alpha: 0.95
  });
  node.addChild(g);
  node.x = piece.x;
  node.y = piece.y;
  return node;
}

function buildCompanionNode(PIXI, visual) {
  const node = new PIXI.Container();
  node.name = "companion";
  const { palette } = visual;

  addClayShadow(PIXI, node, 0, 14, 16, 7, palette.shadow, 0.28);
  const body = new PIXI.Graphics();
  body.name = "procedural_body_fallback";
  body.roundRect(-14, -18, 28, 26, 12).fill({ color: palette.companion, alpha: 1 });
  body.roundRect(-10, -14, 20, 16, 8).fill({ color: palette.companionAccent, alpha: 0.24 });
  body.moveTo(0, -8).lineTo(5, -2).lineTo(0, 5).lineTo(-5, -2).closePath().fill({ color: palette.companionAccent, alpha: 0.9 });
  node.addChild(body);

  const hpBg = new PIXI.Graphics();
  hpBg.roundRect(-18, -32, 36, 5, 2).fill({ color: palette.hpBarBg, alpha: 0.9 });
  const hpFill = new PIXI.Graphics();
  hpFill.name = "hp_fill";
  hpFill.roundRect(-18, -32, 36, 5, 2).fill({ color: palette.hpBar, alpha: 1 });
  node.addChild(hpBg, hpFill);

  return node;
}

export function createExpeditionScene(PIXI, region, session) {
  const root = new PIXI.Container();
  root.name = "expedition_scene";
  root.sortableChildren = true;

  const visual = getExpeditionGameplayVisualProfile(region?.id || session?.regionId || session?.nodeId);
  const atmosphereRegion = {
    ...region,
    atmosphere: {
      ...(region?.atmosphere || {}),
      ...(visual.atmosphere || {})
    }
  };

  const ground = buildGroundLayer(PIXI, region, visual);
  const atmosphere = createExpeditionAtmosphere(PIXI, atmosphereRegion);
  const obstacles = buildObstacleLayer(PIXI, region, visual);
  const markers = buildExploreMarkers(PIXI, region, visual);
  const lootLayer = new PIXI.Container();
  lootLayer.name = "loot";
  const enemyLayer = new PIXI.Container();
  enemyLayer.name = "enemies";

  (session.enemies || []).forEach((enemy) => {
    if (enemy.hp > 0) enemyLayer.addChild(buildEnemyNode(PIXI, enemy, visual));
  });

  const companion = buildCompanionNode(PIXI, visual);
  companion.zIndex = 10;
  companion.x = session.companion.x;
  companion.y = session.companion.y;
  attachIllustratedCompanion(PIXI, companion, session.companionId);
  attachEightDirectionCompanionPilot(PIXI, companion, session.companionId);
  companion.__eightDirectionPilotPosition = {
    x: session.companion.x,
    y: session.companion.y
  };

  root.addChild(ground);
  if (atmosphere) root.addChild(atmosphere);
  root.addChild(obstacles, markers, lootLayer, enemyLayer, companion);
  root.__companionNode = companion;
  root.__markerLayer = markers;
  root.__enemyLayer = enemyLayer;
  root.__lootLayer = lootLayer;
  root.__atmosphereLayer = atmosphere;
  root.__PIXI = PIXI;
  root.__visualProfile = visual;
  attachFoundationSprite(PIXI, root, ground, obstacles, region, visual);

  return root;
}

function updateHpBar(node, hp, hpMax, palette) {
  const fill = node?.getChildByName?.("hp_fill");
  if (!fill) return;
  const ratio = hpMax > 0 ? Math.max(0, hp / hpMax) : 0;
  fill.clear();
  fill.roundRect(-16, -34, 32 * ratio, 4, 2).fill({ color: palette.hpBar, alpha: 1 });
}

function updateCompanionHpBar(node, hp, hpMax, palette) {
  const fill = node?.getChildByName?.("hp_fill");
  if (!fill) return;
  const ratio = hpMax > 0 ? Math.max(0, hp / hpMax) : 0;
  fill.clear();
  fill.roundRect(-18, -32, 36 * ratio, 5, 2).fill({ color: palette.hpBar, alpha: 1 });
}

export function syncExpeditionScene(sceneRoot, session, deltaMs = 16) {
  if (!sceneRoot || !session) return;
  const PIXI = sceneRoot.__PIXI;
  const visual = sceneRoot.__visualProfile || getExpeditionGameplayVisualProfile(session.regionId || session.nodeId);

  if (sceneRoot.__atmosphereLayer) {
    updateExpeditionAtmosphere(sceneRoot.__atmosphereLayer, deltaMs);
  }

  const companion = sceneRoot.__companionNode;
  if (companion) {
    const usesEightDirectionPilot = syncEightDirectionCompanionPilot(
      companion,
      session.companion.x,
      session.companion.y
    );
    companion.x = session.companion.x;
    companion.y = session.companion.y;
    companion.scale.x = usesEightDirectionPilot || session.companion.facing >= 0 ? 1 : -1;
    updateCompanionHpBar(companion, session.companion.hp, session.companion.hpMax, visual.palette);
  }

  const markers = sceneRoot.__markerLayer;
  if (markers) {
    markers.children.forEach((marker) => {
      const id = marker.name?.replace("marker_", "");
      if (!id) return;
      marker.alpha = session.visitedExplorePoints.includes(id) ? 0.45 : 1;
    });
  }

  const enemyLayer = sceneRoot.__enemyLayer;
  if (enemyLayer) {
    const livingIds = new Set((session.enemies || []).filter((e) => e.hp > 0).map((e) => e.id));
    [...enemyLayer.children].forEach((child) => {
      const id = child.name?.replace("enemy_", "");
      if (!livingIds.has(id)) {
        child.alpha -= 0.08;
        if (child.alpha <= 0) enemyLayer.removeChild(child);
      }
    });
    (session.enemies || []).forEach((enemy) => {
      if (enemy.hp <= 0) return;
      let node = enemyLayer.getChildByName(`enemy_${enemy.id}`);
      if (!node) {
        node = buildEnemyNode(PIXI, enemy, visual);
        enemyLayer.addChild(node);
      }
      node.x = enemy.x;
      node.y = enemy.y;
      updateHpBar(node, enemy.hp, enemy.hpMax, visual.palette);
      node.alpha = enemy.state === "alert" ? 1 : 0.72;
    });
  }

  const lootLayer = sceneRoot.__lootLayer;
  if (lootLayer) {
    const activeIds = new Set((session.loot || []).filter((p) => !p.collected).map((p) => p.id));
    [...lootLayer.children].forEach((child) => {
      const id = child.name?.replace("loot_", "");
      if (!activeIds.has(id)) lootLayer.removeChild(child);
    });
    (session.loot || []).forEach((piece) => {
      if (piece.collected) return;
      let node = lootLayer.getChildByName(`loot_${piece.id}`);
      if (!node) {
        node = buildLootNode(PIXI, piece, visual);
        lootLayer.addChild(node);
      }
      node.x = piece.x;
      node.y = piece.y;
      node.scale.set(piece.phase === "magnet" ? 1.1 : 1);
    });
  }
}

export function destroyExpeditionScene(sceneRoot) {
  if (sceneRoot?.__atmosphereLayer) {
    destroyExpeditionAtmosphere(sceneRoot.__atmosphereLayer);
  }
  sceneRoot?.destroy({ children: true });
}
