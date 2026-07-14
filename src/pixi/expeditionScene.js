/**
 * 心域遠征 Pixi 場景（Phase C + 4A 區域氛圍）。
 * 美術：3D 微縮／黏土樹脂 diorama placeholder。
 */
import {
  createExpeditionAtmosphere,
  destroyExpeditionAtmosphere,
  updateExpeditionAtmosphere
} from "./expeditionAtmosphere.js";

const CLAY = Object.freeze({
  grass: 0x4a6741,
  grassLight: 0x5c7a52,
  grassDark: 0x3d5238,
  rock: 0x6b5d52,
  rockHighlight: 0x8a7b6e,
  bush: 0x456340,
  companion: 0x5f6876,
  companionAccent: 0x8a93a3,
  crystal: 0x6ecfd4,
  forestShard: 0x7ecf8a,
  enemy: 0x4a5568,
  enemyCore: 0x9aa5b5,
  shadow: 0x1a2418,
  hpBar: 0x7ecf8a,
  hpBarBg: 0x2a3a28
});

function drawRoundedRect(g, x, y, w, h, r, fill) {
  g.roundRect(x, y, w, h, r).fill(fill);
}

function addClayShadow(parent, x, y, rx, ry, alpha = 0.22) {
  const shadow = new PIXI.Graphics();
  shadow.ellipse(x, y, rx, ry).fill({ color: CLAY.shadow, alpha });
  parent.addChild(shadow);
  return shadow;
}

function buildGroundLayer(region) {
  const layer = new PIXI.Container();
  layer.name = "ground";
  (region.groundPatches || []).forEach((patch) => {
    const g = new PIXI.Graphics();
    drawRoundedRect(g, patch.x, patch.y, patch.w, patch.h, 24, {
      color: patch.color ?? CLAY.grass,
      alpha: 1
    });
    layer.addChild(g);
  });
  return layer;
}

function buildObstacleLayer(region) {
  const layer = new PIXI.Container();
  layer.name = "obstacles";

  (region.circleObstacles || []).forEach((obs) => {
    addClayShadow(layer, obs.x + 4, obs.y + obs.r * 0.55, obs.r * 0.85, obs.r * 0.35);
    const g = new PIXI.Graphics();
    g.circle(obs.x, obs.y, obs.r).fill({ color: obs.id.startsWith("bush") ? CLAY.bush : CLAY.rock, alpha: 1 });
    layer.addChild(g);
  });

  (region.rectObstacles || []).forEach((obs) => {
    const r = obs.r ?? 12;
    addClayShadow(layer, obs.x + obs.w / 2, obs.y + obs.h + 6, obs.w * 0.42, 10);
    const g = new PIXI.Graphics();
    drawRoundedRect(g, obs.x, obs.y, obs.w, obs.h, r, { color: CLAY.rock, alpha: 1 });
    layer.addChild(g);
  });

  return layer;
}

function buildExploreMarkers(region) {
  const layer = new PIXI.Container();
  layer.name = "explore_markers";

  (region.explorePoints || []).forEach((point) => {
    const marker = new PIXI.Container();
    marker.name = `marker_${point.id}`;
    marker.x = point.x;
    marker.y = point.y;
    addClayShadow(marker, 0, 8, 10, 4, 0.18);
    const crystal = new PIXI.Graphics();
    crystal
      .moveTo(0, -10)
      .lineTo(7, 0)
      .lineTo(0, 10)
      .lineTo(-7, 0)
      .closePath()
      .fill({ color: CLAY.crystal, alpha: 0.85 });
    marker.addChild(crystal);
    layer.addChild(marker);
  });

  return layer;
}

function buildEnemyNode(enemy) {
  const node = new PIXI.Container();
  node.name = `enemy_${enemy.id}`;

  addClayShadow(node, 0, 12, 18, 8, 0.25);
  const body = new PIXI.Graphics();
  body.circle(0, 0, 16).fill({ color: CLAY.enemy, alpha: 0.92 });
  body.circle(0, -2, 8).fill({ color: CLAY.enemyCore, alpha: 0.55 });
  node.addChild(body);

  const hpBg = new PIXI.Graphics();
  hpBg.roundRect(-16, -28, 32, 5, 2).fill({ color: CLAY.hpBarBg, alpha: 0.9 });
  const hpFill = new PIXI.Graphics();
  hpFill.name = "hp_fill";
  hpFill.roundRect(-16, -28, 32, 5, 2).fill({ color: CLAY.hpBar, alpha: 1 });
  node.addChild(hpBg, hpFill);

  node.x = enemy.x;
  node.y = enemy.y;
  return node;
}

function buildLootNode(piece) {
  const node = new PIXI.Container();
  node.name = `loot_${piece.id}`;
  const g = new PIXI.Graphics();
  g.moveTo(0, -6).lineTo(5, 0).lineTo(0, 6).lineTo(-5, 0).closePath().fill({
    color: piece.color ?? CLAY.forestShard,
    alpha: 0.95
  });
  node.addChild(g);
  node.x = piece.x;
  node.y = piece.y;
  return node;
}

function buildCompanionNode() {
  const node = new PIXI.Container();
  node.name = "companion";

  addClayShadow(node, 0, 14, 16, 7, 0.28);
  const body = new PIXI.Graphics();
  body.roundRect(-14, -18, 28, 26, 12).fill({ color: CLAY.companion, alpha: 1 });
  body.roundRect(-10, -14, 20, 16, 8).fill({ color: CLAY.companionAccent, alpha: 0.35 });
  node.addChild(body);

  const hpBg = new PIXI.Graphics();
  hpBg.roundRect(-18, -32, 36, 5, 2).fill({ color: CLAY.hpBarBg, alpha: 0.9 });
  const hpFill = new PIXI.Graphics();
  hpFill.name = "hp_fill";
  hpFill.roundRect(-18, -32, 36, 5, 2).fill({ color: CLAY.hpBar, alpha: 1 });
  node.addChild(hpBg, hpFill);

  return node;
}

export function createExpeditionScene(PIXI, region, session) {
  const root = new PIXI.Container();
  root.name = "expedition_scene";
  root.sortableChildren = true;

  const ground = buildGroundLayer(region);
  const atmosphere = createExpeditionAtmosphere(PIXI, region);
  const obstacles = buildObstacleLayer(region);
  const markers = buildExploreMarkers(region);
  const lootLayer = new PIXI.Container();
  lootLayer.name = "loot";
  const enemyLayer = new PIXI.Container();
  enemyLayer.name = "enemies";

  (session.enemies || []).forEach((enemy) => {
    if (enemy.hp > 0) enemyLayer.addChild(buildEnemyNode(enemy));
  });

  const companion = buildCompanionNode();
  companion.zIndex = 10;
  companion.x = session.companion.x;
  companion.y = session.companion.y;

  root.addChild(ground);
  if (atmosphere) root.addChild(atmosphere);
  root.addChild(obstacles, markers, lootLayer, enemyLayer, companion);
  root.__companionNode = companion;
  root.__markerLayer = markers;
  root.__enemyLayer = enemyLayer;
  root.__lootLayer = lootLayer;
  root.__atmosphereLayer = atmosphere;

  return root;
}

function updateHpBar(node, hp, hpMax) {
  const fill = node?.getChildByName?.("hp_fill");
  if (!fill) return;
  const ratio = hpMax > 0 ? Math.max(0, hp / hpMax) : 0;
  fill.clear();
  fill.roundRect(-16, -28, 32 * ratio, 5, 2).fill({ color: CLAY.hpBar, alpha: 1 });
}

function updateCompanionHpBar(node, hp, hpMax) {
  const fill = node?.getChildByName?.("hp_fill");
  if (!fill) return;
  const ratio = hpMax > 0 ? Math.max(0, hp / hpMax) : 0;
  fill.clear();
  fill.roundRect(-18, -32, 36 * ratio, 5, 2).fill({ color: CLAY.hpBar, alpha: 1 });
}

export function syncExpeditionScene(sceneRoot, session, deltaMs = 16) {
  if (!sceneRoot || !session) return;

  if (sceneRoot.__atmosphereLayer) {
    updateExpeditionAtmosphere(sceneRoot.__atmosphereLayer, deltaMs);
  }

  const companion = sceneRoot.__companionNode;
  if (companion) {
    companion.x = session.companion.x;
    companion.y = session.companion.y;
    companion.scale.x = session.companion.facing >= 0 ? 1 : -1;
    updateCompanionHpBar(companion, session.companion.hp, session.companion.hpMax);
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
        node = buildEnemyNode(enemy);
        enemyLayer.addChild(node);
      }
      node.x = enemy.x;
      node.y = enemy.y;
      updateHpBar(node, enemy.hp, enemy.hpMax);
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
        node = buildLootNode(piece);
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
