import { applyResponsiveLayout, registerSceneEditorObject, WORLD_HEIGHT, WORLD_WIDTH } from "./pixiApp.js";
import { FALLBACK_CREATURE } from "../engine/personalityProfile.js";
import { SCENE_LAYOUT } from "../data/sceneLayout.js";
import { createAnimatedCompanionNode, loadCompanionAnimationPack, loadFormalEvolutionCanaryPack } from "./spriteSheetAnimationLoader.js";
import { isEvo05CanaryCompanion, stampCanaryFallbackPresentation } from "../engine/formalEvolutionCanaryPlan.js";
import { getActiveSceneProfile } from "../data/sceneProfiles/index.js";
import {
  attachCompanionGroundShadow,
  getCompanionOpaqueFoot,
  syncCompanionGroundShadow
} from "./companionFootAndShadow.js";

export async function createCreatureNode(creature, { bootOnly = true, onStatus = null, presentation = null } = {}) {
  const reportStatus = (kind, message) => onStatus?.({ kind, message, companionId: creature.id });
  const canaryAttempted = isEvo05CanaryCompanion(creature?.id)
    && (presentation?.stage === "resonant_mature" || presentation?.stage === "final_awakened");
  const canaryNode = await tryCreateFormalEvolutionCanaryNode(creature, {
    bootOnly,
    presentation,
    reportStatus
  });
  if (canaryNode) return registerCompanionEditorObject(canaryNode);

  if (creature.animationsManifest) {
    const animationPack = await loadCompanionAnimationPack(creature.animationsManifest, { bootOnly });
    const animatedCompanion = createAnimatedCompanionNode(animationPack, creature);
    if (animatedCompanion) {
      stampFallbackIfCanaryAttempted(animatedCompanion, creature, presentation, canaryAttempted);
      // 玩家可見的狀態行不寫技術詞（動畫 key / 載入）——牠只是「在這裡」。
      reportStatus("ready", `${creature.name}在月湖邊安靜待著。`);
      return registerCompanionEditorObject(animatedCompanion);
    }
    reportStatus("fallback", `${creature.name}動畫載入失敗，已保留預設動態。`);
  }

  if (!creature.image) {
    if (!creature.placeholder) {
      // 只有「未定義 placeholder 樣式」才視為異常；registry 內的輪廓佔位是正常設計狀態。
      console.warn("Creature has no fallback image; using generic placeholder.");
    }
    reportStatus("placeholder", `${creature.name}以輪廓之姿來到棲地（正式造型製作中）。`);
    const placeholder = createCreaturePlaceholder(creature);
    stampFallbackIfCanaryAttempted(placeholder, creature, presentation, canaryAttempted);
    return registerCompanionEditorObject(placeholder);
  }

  try {
    const texture = await PIXI.Assets.load(creature.image);
    const spriteCreature = createCreatureSprite(texture, creature);
    stampFallbackIfCanaryAttempted(spriteCreature, creature, presentation, canaryAttempted);
    reportStatus("ready", `${creature.name}已進入夜間湖畔棲地。`);
    return registerCompanionEditorObject(spriteCreature);
  } catch (error) {
    console.warn("Creature image load failed, fallback to placeholder:", error);
    reportStatus("fallback", `${creature.name}圖片載入失敗，已改用預設造型。`);
    const placeholder = createCreaturePlaceholder(creature);
    stampFallbackIfCanaryAttempted(placeholder, creature, presentation, canaryAttempted);
    return registerCompanionEditorObject(placeholder);
  }
}

export function positionCompanion(companion, app) {
  applyCompanionResponsiveLayout(companion, app);
  if (typeof window === "undefined") return () => {};
  if (typeof companion.__responsiveLayoutCleanup === "function") {
    return companion.__responsiveLayoutCleanup;
  }

  let frameId = null;
  const onResize = () => {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      if (companion.destroyed) return;
      applyCompanionResponsiveLayout(companion, app);
    });
  };
  const cleanup = () => {
    window.removeEventListener("resize", onResize);
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    frameId = null;
    if (companion.__responsiveLayoutCleanup === cleanup) {
      delete companion.__responsiveLayoutCleanup;
    }
  };

  companion.__responsiveLayoutCleanup = cleanup;
  window.addEventListener("resize", onResize);
  return cleanup;
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

async function tryCreateFormalEvolutionCanaryNode(creature, { bootOnly, presentation, reportStatus }) {
  const companionId = creature?.id;
  const savedStage = presentation?.stage;
  if (!isEvo05CanaryCompanion(companionId)) return null;
  if (savedStage !== "resonant_mature" && savedStage !== "final_awakened") return null;

  try {
    const canary = await loadFormalEvolutionCanaryPack({
      companionId,
      savedStage,
      bootOnly
    });
    if (!canary?.ok || !canary.pack) return null;

    const node = createAnimatedCompanionNode(canary.pack, creature);
    if (!node) return null;

    // Pixi 只記下這次呈現怎麼走；它沒有權改存檔裡的階段。
    node.__formalEvolutionPresentation = {
      companionId,
      savedStage,
      presentationMode: canary.presentationMode,
      retryable: canary.retryable === true,
      usedFallback: false,
      growthMutation: null
    };
    reportStatus("ready", `${creature.name}在月湖邊安靜待著。`);
    return node;
  } catch (error) {
    console.warn("Formal evolution canary presentation failed; staying on Stage 1.", error);
    return null;
  }
}

function stampFallbackIfCanaryAttempted(node, creature, presentation, canaryAttempted) {
  if (!node || !canaryAttempted) return;
  node.__formalEvolutionPresentation = stampCanaryFallbackPresentation({
    companionId: creature?.id,
    savedStage: presentation?.stage
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
  const profile = getActiveSceneProfile();
  // displayScale 是場景呈現倍率；在 applyResponsiveLayout 的單一 scale.set 之後
  // 直接改 x/y，避免再呼叫一次 scale.set（lifecycle QA 以 scale.set 次數偵測 resize）。
  const displayScale = clampCompanionDisplayScale(profile?.companion?.displayScale);
  if (displayScale !== 1) {
    companion.scale.x *= displayScale;
    companion.scale.y *= displayScale;
  }
  const anchor = profile?.companion?.anchor;
  const referenceWidth = Number(profile?.safeZone?.referenceWidth) || SCENE_LAYOUT.referenceWidth;
  const referenceHeight = Number(profile?.safeZone?.referenceHeight) || SCENE_LAYOUT.referenceHeight;
  const target = resolveCompanionTarget(profile, app, anchor, referenceWidth, referenceHeight);
  const targetX = target.x;
  const targetY = target.y;

  // foot（預設）：以「不透明像素底部中心」對齊十字——坐姿／透明 padding 時
  // 比單純 container 原點更貼近玩家看到的腳掌落地點。
  // frame-foot：強制用 sprite bottom-center 原點（舊行為）。
  // visual-center：角色不透明視覺中心對齊（2026-07-15 契約，保留回滾）。
  const alignment = profile?.companion?.alignment || "foot";
  if (alignment === "visual-center") {
    const visualCenter = getCompanionVisualCenter(companion);
    companion.x = Math.round(targetX - visualCenter.x * companion.scale.x);
    companion.y = Math.round(targetY - visualCenter.y * companion.scale.y);
  } else if (alignment === "frame-foot") {
    companion.x = Math.round(targetX);
    companion.y = Math.round(targetY);
  } else {
    const opaqueFoot = getCompanionOpaqueFoot(companion);
    companion.x = Math.round(targetX - opaqueFoot.x * companion.scale.x);
    companion.y = Math.round(targetY - opaqueFoot.y * companion.scale.y);
  }
  // QA／除錯：記錄這一拍的目標點（十字中心投影）與對齊模式。
  companion.__placementTarget = Object.freeze({
    x: Math.round(targetX),
    y: Math.round(targetY),
    alignment,
    profileId: profile?.id || null
  });
  // 十字對齊之後立刻把影子貼到同一腳接觸點，避免「腳落地、影懸空」。
  syncCompanionGroundShadow(companion);
  applyMinimumCompanionHitArea(companion, app, profile);
}

function applyMinimumCompanionHitArea(companion, app, profile) {
  const bounds = companion.getLocalBounds?.();
  if (!bounds || !Number.isFinite(bounds.width) || !Number.isFinite(bounds.height)) return;

  const referenceWidth = Number(profile?.safeZone?.referenceWidth) || SCENE_LAYOUT.referenceWidth;
  const referenceHeight = Number(profile?.safeZone?.referenceHeight) || SCENE_LAYOUT.referenceHeight;
  const screenWidth = Number(app?.screen?.width) || referenceWidth;
  const screenHeight = Number(app?.screen?.height) || referenceHeight;
  const safeScale = Math.max(0.01, Math.min(screenWidth / referenceWidth, screenHeight / referenceHeight));
  const localScaleX = Math.max(0.01, Math.abs(Number(companion.scale?.x) || 1));
  const localScaleY = Math.max(0.01, Math.abs(Number(companion.scale?.y) || 1));
  const minimum = profile?.companion?.minimumHitArea || { width: 84, height: 104 };
  const minimumLocalWidth = (Number(minimum.width) || 84) / (safeScale * localScaleX);
  const minimumLocalHeight = (Number(minimum.height) || 104) / (safeScale * localScaleY);
  const width = Math.max(bounds.width, minimumLocalWidth);
  const height = Math.max(bounds.height, minimumLocalHeight);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  companion.hitArea = new PIXI.Rectangle(centerX - width / 2, centerY - height / 2, width, height);
}

function clampCompanionDisplayScale(value) {
  const scale = Number(value);
  if (!Number.isFinite(scale)) return 1;
  return Math.max(0.7, Math.min(1.15, scale));
}

function resolveCompanionTarget(profile, app, anchor, referenceWidth, referenceHeight) {
  const backgroundPoint = profile?.companion?.backgroundPoint;
  const artWidth = Number(profile?.artSize?.width);
  const artHeight = Number(profile?.artSize?.height);
  const screenWidth = Number(app?.screen?.width);
  const screenHeight = Number(app?.screen?.height);
  const pointX = Number(backgroundPoint?.x);
  const pointY = Number(backgroundPoint?.y);

  if ([artWidth, artHeight, screenWidth, screenHeight, pointX, pointY].every(Number.isFinite)) {
    const backgroundScale = Math.max(screenWidth / artWidth, screenHeight / artHeight);
    const screenTargetX = screenWidth / 2 + (pointX - artWidth / 2) * backgroundScale;
    const screenTargetY = screenHeight / 2 + (pointY - artHeight / 2) * backgroundScale;
    const safeScale = Math.min(screenWidth / referenceWidth, screenHeight / referenceHeight);
    if (safeScale > 0) {
      const safeX = (screenWidth - referenceWidth * safeScale) / 2;
      const safeY = screenHeight - referenceHeight * safeScale;
      return {
        x: (screenTargetX - safeX) / safeScale,
        y: (screenTargetY - safeY) / safeScale
      };
    }
  }

  return {
    x: (Number(anchor?.x) || 0.5) * referenceWidth,
    y: (Number(anchor?.y) || 0.7) * referenceHeight
  };
}

function getCompanionVisualCenter(companion) {
  if (companion.__opaqueVisualCenter) return companion.__opaqueVisualCenter;

  const visual = companion.children?.find((child) => child instanceof PIXI.Sprite) || companion;
  const bounds = visual.getLocalBounds?.();
  const opaqueCenter = getOpaqueTextureCenter(visual);
  const center = opaqueCenter || getBoundsCenter(bounds);
  if (visual === companion) return center;

  const scaleX = Number.isFinite(visual.scale?.x) ? visual.scale.x : 1;
  const scaleY = Number.isFinite(visual.scale?.y) ? visual.scale.y : 1;
  const pivotX = Number(visual.pivot?.x) || 0;
  const pivotY = Number(visual.pivot?.y) || 0;
  const rotation = Number(visual.rotation) || 0;
  const localX = (center.x - pivotX) * scaleX;
  const localY = (center.y - pivotY) * scaleY;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  const resolvedCenter = {
    x: (Number(visual.x) || 0) + localX * cos - localY * sin,
    y: (Number(visual.y) || 0) + localX * sin + localY * cos
  };
  if (opaqueCenter) companion.__opaqueVisualCenter = resolvedCenter;
  return resolvedCenter;
}

function getOpaqueTextureCenter(visual) {
  if (typeof document === "undefined" || !visual?.texture) return null;
  const texture = visual.texture;
  const source = texture.source?.resource;
  const frame = texture.frame;
  const width = Math.round(Number(frame?.width));
  const height = Math.round(Number(frame?.height));
  if (!source || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(
      source,
      Number(frame.x) || 0,
      Number(frame.y) || 0,
      width,
      height,
      0,
      0,
      width,
      height
    );
    const pixels = context.getImageData(0, 0, width, height).data;
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] < 16) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (maxX < minX || maxY < minY) return null;

    const anchorX = Number(visual.anchor?.x) || 0;
    const anchorY = Number(visual.anchor?.y) || 0;
    return {
      x: (minX + maxX + 1) / 2 - anchorX * width,
      y: (minY + maxY + 1) / 2 - anchorY * height
    };
  } catch (error) {
    console.warn("Companion visual-center measurement fell back to frame bounds:", error);
    return null;
  }
}

function getBoundsCenter(bounds) {
  const minX = Number(bounds?.minX);
  const maxX = Number(bounds?.maxX);
  const minY = Number(bounds?.minY);
  const maxY = Number(bounds?.maxY);
  if ([minX, maxX, minY, maxY].every(Number.isFinite)) {
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }

  const x = Number(bounds?.x);
  const y = Number(bounds?.y);
  const width = Number(bounds?.width);
  const height = Number(bounds?.height);
  if ([x, y, width, height].every(Number.isFinite)) {
    return { x: x + width / 2, y: y + height / 2 };
  }

  return { x: 0, y: 0 };
}

function isSceneEditorMode() {
  return typeof window !== "undefined" && new URLSearchParams(window.location.search).get("devSceneEditor") === "1";
}

function createCreatureSprite(texture, creature) {
  applyStaticCompanionTexturePolicy(texture);
  const companion = new PIXI.Container();
  // 先掛影子再掛 sprite；layout 時會把影子中心同步到 opaque-foot。
  attachCompanionGroundShadow(companion, { radiusX: 58, radiusY: 14, alpha: 0.25 });

  const sprite = new PIXI.Sprite(texture);
  sprite.roundPixels = false;
  sprite.anchor.set(0.5, 1);

  const renderScale = Number.isFinite(creature?.renderScale) ? creature.renderScale : 1;
  const maxW = Math.min(170, WORLD_WIDTH * 0.46);
  const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
  const scale = Math.min(maxW / sprite.width, maxH / sprite.height) * renderScale;
  sprite.scale.set(scale);

  companion.addChild(sprite);
  companion.__isSpriteCreature = true;
  syncCompanionGroundShadow(companion);

  if (creature.element === "fire") {
    const flame = createFlameAccent();
    companion.addChild(flame);
    companion.__accentFlame = flame;
  }

  return companion;
}

function applyStaticCompanionTexturePolicy(texture) {
  const source = texture?.source || texture?.baseTexture;
  const scaleMode = resolvePixiConstant(() => PIXI.SCALE_MODES.LINEAR, "linear");

  setTextureProperty(source, "scaleMode", scaleMode);
  setTextureProperty(texture, "scaleMode", scaleMode);
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

function createCreaturePlaceholder(creature = FALLBACK_CREATURE) {
  const companion = new PIXI.Container();
  const bodyColor = creature.placeholder?.bodyColor ?? 0x5f6876;
  const lightColor = creature.placeholder?.accentColor ?? 0x8a93a3;

  // Placeholder 無貼圖：attach 後會依內容底緣對齊影子（不再寫死 y=48）。
  attachCompanionGroundShadow(companion, { radiusX: 54, radiusY: 13, alpha: 0.28 });

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

  // 全部形體掛完後再量底緣，影子才會貼在輪廓腳線。
  syncCompanionGroundShadow(companion);
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
