import { applyResponsiveLayout, registerSceneEditorObject, WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";
import { FALLBACK_CREATURE } from "../engine/personalityProfile.js";
import { SCENE_LAYOUT } from "../data/sceneLayout.js";
import { createAnimatedCompanionNode, loadGreyshadeCatAnimationPack } from "./spriteSheetAnimationLoader.js";

export async function createCreatureNode(creature, statusText) {
  if (creature.id === "greyshade-cat") {
    const animationPack = await loadGreyshadeCatAnimationPack();
    const animatedCompanion = createAnimatedCompanionNode(animationPack, creature);
    if (animatedCompanion) {
      statusText.textContent = `${creature.name}已載入 idle_calm 動畫棲地。`;
      return registerCompanionEditorObject(animatedCompanion);
    }
    statusText.textContent = `${creature.name}動畫載入失敗，已保留預設動態。`;
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
      requestAnimationFrame(() => applyCompanionResponsiveLayout(companion, app));
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
  sprite.anchor.set(0.5, 1);

  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
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

  const shadow = new PIXI.Graphics();
  shadow.ellipse(0, 48, 54, 13).fill({ color: 0x000000, alpha: 0.28 });
  companion.addChild(shadow);

  const body = new PIXI.Graphics();
  body.roundRect(-42, -28, 84, 70, 24).fill("#d85f32");
  body.roundRect(-29, -18, 58, 52, 18).fill("#f28b43");
  companion.addChild(body);

  const head = new PIXI.Graphics();
  head.roundRect(-36, -76, 72, 58, 22).fill("#e86d34");
  head.moveTo(-28, -70).lineTo(-48, -104).lineTo(-4, -84).closePath().fill("#e86d34");
  head.moveTo(28, -70).lineTo(48, -104).lineTo(4, -84).closePath().fill("#e86d34");
  head.moveTo(-31, -78).lineTo(-41, -96).lineTo(-12, -84).closePath().fill("#ffd29b");
  head.moveTo(31, -78).lineTo(41, -96).lineTo(12, -84).closePath().fill("#ffd29b");
  companion.addChild(head);

  const face = new PIXI.Graphics();
  face.circle(-14, -51, 4).fill("#1f1f2e");
  face.circle(14, -51, 4).fill("#1f1f2e");
  face.roundRect(-10, -39, 20, 10, 5).fill("#ffe0b5");
  face.circle(0, -39, 2.5).fill("#1f1f2e");
  companion.addChild(face);

  const tail = new PIXI.Graphics();
  tail
    .moveTo(38, 0)
    .quadraticCurveTo(92, -32, 66, -82)
    .quadraticCurveTo(110, -40, 78, 22)
    .closePath()
    .fill("#f9733a");
  tail
    .moveTo(76, -72)
    .quadraticCurveTo(104, -38, 76, 2)
    .quadraticCurveTo(94, -42, 76, -72)
    .fill("#ffd166");
  companion.addChildAt(tail, 1);

  if (creature.element === "fire") {
    const flame = createFlameAccent();
    companion.addChild(flame);
    companion.__accentFlame = flame;
  }

  return companion;
}

function createFlameAccent() {
  const flame = new PIXI.Graphics();
  flame.moveTo(0, -108).lineTo(-15, -76).lineTo(15, -76).closePath().fill("#ff7a2f");
  flame.moveTo(2, -98).lineTo(-6, -77).lineTo(10, -77).closePath().fill("#ffd166");
  return flame;
}
