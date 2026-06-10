import {
  applySceneBlendMode,
  PLATFORM_Y,
  registerSceneEditorObject,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "./pixiApp.js";

export const PLATFORM_LAKE_PATH = "./assets/platforms/LakeNightCamp_v2/magic_circle.png";

export async function createPlatformNode() {
  try {
    const texture = await PIXI.Assets.load(PLATFORM_LAKE_PATH);
    const platform = new PIXI.Sprite(texture);
    platform.name = "magic_circle";
    platform.anchor.set(0.5);
    platform.x = WORLD_WIDTH / 2;
    platform.y = PLATFORM_Y;
    platform.alpha = 0.76;
    applySceneBlendMode(platform, "magic_circle");
    registerSceneEditorObject(platform, {
      id: "magic_circle",
      texturePath: PLATFORM_LAKE_PATH,
      editorEnabled: true
    });

    const targetWidth = 252;
    const targetHeight = WORLD_HEIGHT * 0.13;
    const scale = Math.min(targetWidth / platform.width, targetHeight / platform.height);
    platform.scale.set(scale);
    return platform;
  } catch (error) {
    console.warn("Platform image load failed, fallback to platform glow:", error);
    const platform = new PIXI.Graphics();
    platform.name = "magic_circle";
    platform.ellipse(WORLD_WIDTH / 2, PLATFORM_Y, 118, 34).fill({ color: 0x8deeff, alpha: 0.14 });
    platform.ellipse(WORLD_WIDTH / 2, PLATFORM_Y, 82, 18).stroke({ color: 0xb7f7ff, alpha: 0.32, width: 2 });
    registerSceneEditorObject(platform, {
      id: "magic_circle",
      texturePath: PLATFORM_LAKE_PATH,
      editorEnabled: true
    });
    return platform;
  }
}
