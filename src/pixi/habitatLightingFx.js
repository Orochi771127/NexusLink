import EnvironmentController from "../engine/environmentController.js";

const PHASES = Object.freeze({
  day: Object.freeze({ color: 0xffffff, alpha: 0 }),
  dawn: Object.freeze({ color: 0xffcda8, alpha: 0.11 }),
  dusk: Object.freeze({ color: 0x8e729b, alpha: 0.2 }),
  night: Object.freeze({ color: 0x31466d, alpha: 0.38 })
});

export function createHabitatLightingFx(PIXI, options = {}) {
  const width = options.width || 390;
  const height = options.height || 844;
  const root = new PIXI.Container();
  root.name = "habitat_dynamic_lighting";
  root.eventMode = "none";

  const ambient = new PIXI.Graphics();
  ambient.name = "habitat_phase_ambient";
  ambient.rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 1 });
  ambient.blendMode = PIXI.BLEND_MODES?.MULTIPLY ?? "multiply";
  root.addChild(ambient);

  const sunGlow = createRadialGlow(PIXI, 0xffd59a, width * 0.9);
  sunGlow.name = "habitat_sun_key_light";
  sunGlow.blendMode = PIXI.BLEND_MODES?.SCREEN ?? "screen";
  root.addChild(sunGlow);

  const moonGlow = createRadialGlow(PIXI, 0x8fc8ff, width * 0.72);
  moonGlow.name = "habitat_moon_fill_light";
  moonGlow.blendMode = PIXI.BLEND_MODES?.SCREEN ?? "screen";
  root.addChild(moonGlow);

  const state = { root, ambient, sunGlow, moonGlow, width, height };
  updateHabitatLightingFx(state);
  return state;
}

export function updateHabitatLightingFx(state) {
  if (!state) return;
  const environment = EnvironmentController.getEnvironmentState();
  const phase = PHASES[environment.phase] || PHASES.day;
  const lowQuality = readQuality() === "low";

  state.ambient.tint = phase.color;
  state.ambient.alpha = phase.alpha;

  const sunT = clamp01(environment.sunProgress);
  state.sunGlow.position.set(
    state.width * (0.12 + sunT * 0.76),
    state.height * (0.2 + Math.abs(0.5 - sunT) * 0.16)
  );
  state.sunGlow.alpha = lowQuality ? 0 : environment.sunAlpha * 0.13;

  const moonT = clamp01(environment.moonProgress);
  state.moonGlow.position.set(
    state.width * (0.12 + moonT * 0.76),
    state.height * (0.19 + Math.abs(0.5 - moonT) * 0.14)
  );
  state.moonGlow.alpha = lowQuality ? 0 : environment.moonAlpha * 0.11;
}

function createRadialGlow(PIXI, color, diameter) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  const cssColor = `#${Number(color).toString(16).padStart(6, "0")}`;
  gradient.addColorStop(0, `${cssColor}9c`);
  gradient.addColorStop(0.4, `${cssColor}3d`);
  gradient.addColorStop(1, `${cssColor}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const sprite = new PIXI.Sprite(PIXI.Texture.from(canvas));
  sprite.anchor.set(0.5);
  sprite.width = diameter;
  sprite.height = diameter;
  return sprite;
}

function readQuality() {
  return typeof document !== "undefined"
    ? document.documentElement?.dataset?.quality || "high"
    : "high";
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}
