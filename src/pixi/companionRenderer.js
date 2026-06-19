import { applyResponsiveLayout, registerSceneEditorObject, WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";
import { FALLBACK_CREATURE } from "../engine/personalityProfile.js";
import { SCENE_LAYOUT } from "../data/sceneLayout.js";
import { createAnimatedCompanionNode, loadCompanionAnimationPack } from "./spriteSheetAnimationLoader.js";

export async function createCreatureNode(creature, statusText) {
  if (creature.animationsManifest) {
    const animationPack = await loadCompanionAnimationPack(creature.animationsManifest);
    const animatedCompanion = createAnimatedCompanionNode(animationPack, creature);
    if (animatedCompanion) {
      statusText.textContent = `${creature.name}已載入 idle_calm 動畫棲地。`;
      return registerCompanionEditorObject(animatedCompanion);
    }
    statusText.textContent = `${creature.name}動畫載入失敗，已保留預設動態。`;
  }

  if (!creature.image) {
    if (!creature.placeholder) {
      // 只有「未定義 placeholder 樣式」才視為異常；registry 內的輪廓佔位是正常設計狀態。
      console.warn("Creature has no fallback image; using generic placeholder.");
    }
    statusText.textContent = `${creature.name}以輪廓之姿來到棲地（正式造型製作中）。`;
    return registerCompanionEditorObject(createCreaturePlaceholder(creature));
  }

  try {
    const texture = await PIXI.Assets.load(creature.image);
    const spriteCreature = createCreatureSprite(texture, creature);
    statusText.textContent = `${creature.name}已進入夜間湖畔棲地。`;
    return registerCompanionEditorObject(spriteCreature);
  } catch (error) {
    console.warn("Creature image load failed, fallback to placeholder:", error);
    statusText.textContent = `${creature.name}圖片載入失敗，已改用預設造型。`;
    return registerCompanionEditorObject(createCreaturePlaceholder(creature));
  }
}

export function positionCompanion(companion, app) {
  applyCompanionResponsiveLayout(companion, app);
  if (typeof window !== "undefined" && !companion.__responsiveLayoutBound) {
    companion.__responsiveLayoutBound = true;
    window.addEventListener("resize", () => {
      requestAnimationFrame(() => {
        if (companion.destroyed) return;
        applyCompanionResponsiveLayout(companion, app);
      });
    });
  }
}

export function bindCompanionTap(companion, { isInteractionBlocked, onTouch }) {
  if (isSceneEditorMode()) {
    companion.eventMode = "static";
    companion.cursor = "grab";
    return;
  }

  companion.eventMode = "static";
  companion.cursor = "pointer";
  let lastTapAt = 0;

  companion.on("pointerdown", async () => {
    if (isInteractionBlocked()) return;
    const now = Date.now();
    const isDoubleTap = now - lastTapAt < 320;
    lastTapAt = now;

    try {
      await Promise.resolve(onTouch(isDoubleTap ? "hug" : "touch"));
    } catch (error) {
      console.warn("Companion touch interaction failed:", error);
    }
  });
}

function registerCompanionEditorObject(companion) {
  registerSceneEditorObject(companion, {
    id: "companion",
    texturePath: "dynamic_creature",
    editorEnabled: true
  });
  companion.eventMode = "static";
  companion.cursor = "grab";
  return companion;
}

function applyCompanionResponsiveLayout(companion, app) {
  applyResponsiveLayout(
    companion,
    "companion",
    app?.screen?.width ?? SCENE_LAYOUT.referenceWidth,
    app?.screen?.height ?? SCENE_LAYOUT.referenceHeight
  );
  companion.x = Math.round(companion.x);
  companion.y = Math.round(companion.y);
}

function isSceneEditorMode() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("devSceneEditor") === "1";
}

function createCreatureSprite(texture, creature) {
  const companion = new PIXI.Container();

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 54, 58, 14).fill({ color: 0x000000, alpha: 0.25 });
  companion.addChild(shadow);

  const sprite = new PIXI.Sprite(texture);
  sprite.roundPixels = true;
  sprite.anchor.set(0.5, 1);

  const renderScale = Number.isFinite(creature?.renderScale) ? creature.renderScale : 1;
  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / sprite.width, maxH / sprite.height) * renderScale;
  sprite.scale.set(scale);

  companion.addChild(sprite);
  companion.__isSpriteCreature = true;

  if (creature.element === "fire") {
    const flame = createFlameAccent();
    companion.addChild(flame);
    companion.__accentFlame = flame;
  }

  return companion;
}

function createCreaturePlaceholder(creature = FALLBACK_CREATURE) {
  const companion = new PIXI.Container();
  const bodyColor = creature.placeholder?.bodyColor ?? 0x5f6876;
  const lightColor = creature.placeholder?.accentColor ?? 0x8a93a3;

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 48, 54, 13).fill({ color: 0x000000, alpha: 0.28 });
  companion.addChild(shadow);

  const body = new PIXI.Graphics();
  body.roundRect(-42, -28, 84, 70, 24).fill(bodyColor);
  body.roundRect(-29, -18, 58, 52, 18).fill(lightColor);
  companion.addChild(body);

  const head = new PIXI.Graphics();
  head.roundRect(-36, -76, 72, 58, 22).fill(bodyColor);
  head.moveTo(-28, -70).lineTo(-48, -104).lineTo(-4, -84).closePath().fill(bodyColor);
  head.moveTo(28, -70).lineTo(48, -104).lineTo(4, -84).closePath().fill(bodyColor);
  head.moveTo(-31, -78).lineTo(-41, -96).lineTo(-12, -84).closePath().fill(lightColor);
  head.moveTo(31, -78).lineTo(41, -96).lineTo(12, -84).closePath().fill(lightColor);
  companion.addChild(head);

  const face = new PIXI.Graphics();
  face.circle(-14, -51, 4).fill("#1f1f2e");
  face.circle(14, -51, 4).fill("#1f1f2e");
  face.roundRect(-10, -39, 20, 10, 5).fill("#cfd5df");
  face.circle(0, -39, 2.5).fill("#1f1f2e");
  companion.addChild(face);

  const tail = new PIXI.Graphics();
  tail
    .moveTo(38, 0)
    .quadraticCurveTo(92, -32, 66, -82)
    .quadraticCurveTo(110, -40, 78, 22)
    .closePath()
    .fill(bodyColor);
  tail
    .moveTo(76, -72)
    .quadraticCurveTo(104, -38, 76, 2)
    .quadraticCurveTo(94, -42, 76, -72)
    .fill(lightColor);
  companion.addChildAt(tail, 1);

  if (creature.element === "fire") {
    const flame = createFlameAccent();
    companion.addChild(flame);
    companion.__accentFlame = flame;
  } else {
    const emblem = createEmblemAccent(creature.placeholder?.emblemShape, lightColor);
    if (emblem) companion.addChild(emblem);
  }

  return companion;
}

function createEmblemAccent(emblemShape, color) {
  if (!emblemShape || emblemShape === "moon") return null;
  const emblem = new PIXI.Graphics();

  if (emblemShape === "droplet") {
    emblem
      .moveTo(0, -110)
      .quadraticCurveTo(12, -92, 0, -80)
      .quadraticCurveTo(-12, -92, 0, -110)
      .closePath()
      .fill({ color, alpha: 0.85 });
  } else if (emblemShape === "leaf") {
    emblem
      .moveTo(0, -112)
      .quadraticCurveTo(16, -100, 0, -80)
      .quadraticCurveTo(-16, -100, 0, -112)
      .closePath()
      .fill({ color, alpha: 0.85 });
    emblem.moveTo(0, -108).lineTo(0, -84).stroke({ color: 0xffffff, alpha: 0.4, width: 1.5 });
  } else if (emblemShape === "bolt") {
    emblem
      .moveTo(4, -114)
      .lineTo(-8, -94)
      .lineTo(-1, -94)
      .lineTo(-5, -78)
      .lineTo(9, -98)
      .lineTo(2, -98)
      .closePath()
      .fill({ color, alpha: 0.9 });
  } else if (emblemShape === "star") {
    for (let index = 0; index < 5; index += 1) {
      const angle = -Math.PI / 2 + (index * Math.PI * 2) / 5;
      const outerX = Math.cos(angle) * 14;
      const outerY = -96 + Math.sin(angle) * 14;
      const innerAngle = angle + Math.PI / 5;
      const innerX = Math.cos(innerAngle) * 6;
      const innerY = -96 + Math.sin(innerAngle) * 6;
      if (index === 0) emblem.moveTo(outerX, outerY);
      else emblem.lineTo(outerX, outerY);
      emblem.lineTo(innerX, innerY);
    }
    emblem.closePath().fill({ color, alpha: 0.85 });
  } else {
    return null;
  }

  return emblem;
}

function createFlameAccent() {
  const flame = new PIXI.Graphics();
  flame.moveTo(0, -108).lineTo(-15, -76).lineTo(15, -76).closePath().fill("#ff7a2f");
  flame.moveTo(2, -98).lineTo(-6, -77).lineTo(10, -77).closePath().fill("#ffd166");
  return flame;
}
