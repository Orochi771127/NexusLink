/**
 * Moonlake 天氣 FX 原型（TP-HAB-WEATHER-1）。
 * 純 PixiJS：tint overlay + 霧 + 雨線；尊重 reduced-motion / quality。
 */

import { getActiveSceneProfile } from "../data/sceneProfiles/index.js";

const DEFAULT_WEATHER_ID = "clear";

/** @type {string} */
let activeWeatherId = DEFAULT_WEATHER_ID;

/** @type {((id: string) => void) | null} */
let weatherChangeListener = null;

function readQuality() {
  return typeof document !== "undefined"
    ? document.documentElement?.dataset?.quality || "high"
    : "high";
}

function readReducedMotion() {
  return typeof document !== "undefined"
    && document.documentElement?.dataset?.reducedMotionPreference === "reduced";
}

function resolvePreset(weatherId) {
  const profile = getActiveSceneProfile();
  const presets = profile.weatherPresets || {};
  return presets[weatherId] || presets[DEFAULT_WEATHER_ID] || {
    ambientTint: 0xffffff,
    tintAlpha: 0,
    rainLines: false,
    fog: false,
    fogAlpha: 0
  };
}

function rainBudget() {
  const profile = getActiveSceneProfile();
  const max = profile.fxBudget?.maxRainParticles ?? 90;
  const quality = readQuality();
  if (quality === "low") return Math.min(24, max);
  if (quality === "medium") return Math.min(48, max);
  return max;
}

/**
 * 建立天氣層（掛在 layerFX）。
 * @param {typeof import("pixi.js")} PIXI
 * @param {{ width?: number, height?: number }} [options]
 */
export function createHabitatWeatherFx(PIXI, options = {}) {
  const width = options.width || 390;
  const height = options.height || 844;

  const root = new PIXI.Container();
  root.name = "habitat_weather_fx";
  root.eventMode = "none";

  const tint = new PIXI.Graphics();
  tint.name = "weather_tint";
  tint.rect(0, 0, width, height).fill({ color: 0xffffff, alpha: 1 });
  tint.alpha = 0;
  root.addChild(tint);

  const fog = new PIXI.Graphics();
  fog.name = "weather_fog";
  // 湖面帶霧：中段半透明橢圓，避開頂部 HUD 與底部 dock
  fog.ellipse(width * 0.5, height * 0.48, width * 0.42, height * 0.12)
    .fill({ color: 0xa8c0d8, alpha: 0.55 });
  fog.ellipse(width * 0.45, height * 0.42, width * 0.28, height * 0.08)
    .fill({ color: 0xb8d0e8, alpha: 0.35 });
  fog.alpha = 0;
  root.addChild(fog);

  const rainLayer = new PIXI.Container();
  rainLayer.name = "weather_rain";
  root.addChild(rainLayer);

  const wetness = new PIXI.Graphics();
  wetness.name = "weather_wetness";
  wetness.rect(0, height * 0.42, width, height * 0.34)
    .fill({ color: 0x79a8cb, alpha: 1 });
  wetness.blendMode = PIXI.BLEND_MODES?.SCREEN ?? "screen";
  wetness.alpha = 0;
  root.addChild(wetness);

  const rippleLayer = new PIXI.Container();
  rippleLayer.name = "weather_water_ripples";
  rippleLayer.eventMode = "none";
  root.addChild(rippleLayer);

  const ripples = [];
  for (let index = 0; index < 8; index += 1) {
    const ripple = new PIXI.Graphics();
    ripple.ellipse(0, 0, 13 + (index % 3) * 4, 4 + (index % 2) * 2)
      .stroke({ width: 1.2, color: 0xbfe7ff, alpha: 0.72 });
    ripple.x = width * (0.25 + ((index * 0.137) % 0.5));
    ripple.y = height * (0.43 + ((index * 0.071) % 0.14));
    ripple.__phase = index / 8;
    ripple.visible = false;
    rippleLayer.addChild(ripple);
    ripples.push(ripple);
  }

  const drops = [];
  const maxDrops = rainBudget();
  for (let i = 0; i < maxDrops; i += 1) {
    const drop = new PIXI.Graphics();
    drop.rect(0, 0, 1.2, 8 + Math.random() * 10).fill({ color: 0xb8d4ee, alpha: 0.55 });
    drop.x = Math.random() * width;
    drop.y = Math.random() * height * 0.7;
    drop.__speed = 4.2 + Math.random() * 3.5;
    drop.__drift = -0.4 + Math.random() * 0.2;
    drop.visible = false;
    rainLayer.addChild(drop);
    drops.push(drop);
  }

  const state = {
    root,
    tint,
    fog,
    rainLayer,
    wetness,
    rippleLayer,
    ripples,
    drops,
    width,
    height,
    weatherId: activeWeatherId
  };

  applyWeatherVisuals(state, activeWeatherId);
  return state;
}

function applyWeatherVisuals(state, weatherId) {
  const preset = resolvePreset(weatherId);
  const reduced = readReducedMotion();
  const quality = readQuality();

  state.weatherId = weatherId;
  state.tint.tint = preset.ambientTint ?? 0xffffff;
  state.tint.alpha = Number(preset.tintAlpha) || 0;

  const wantFog = Boolean(preset.fog) && quality !== "low";
  state.fog.alpha = wantFog ? Number(preset.fogAlpha) || 0.2 : 0;

  const wantRain = Boolean(preset.rainLines) && !reduced && quality !== "low";
  state.rainLayer.visible = wantRain;
  state.drops.forEach((drop) => {
    drop.visible = wantRain;
  });

  const rippleMode = preset.waterRipple || "low";
  const rippleAlpha = rippleMode === "medium" ? 0.7 : rippleMode === "high" ? 0.9 : 0.24;
  state.rippleLayer.alpha = quality === "low" ? 0 : rippleAlpha;
  state.ripples.forEach((ripple, index) => {
    ripple.visible = quality !== "low" && (rippleMode !== "low" || index < 3);
  });
  state.wetness.alpha = preset.rainLines ? 0.1 : 0;
}

/**
 * 切換天氣 preset（氛圍 only，無獎勵／FOMO）。
 * @param {string} weatherId
 */
export function setHabitatWeather(weatherId) {
  const profile = getActiveSceneProfile();
  const next = profile.weatherPresets?.[weatherId] ? weatherId : DEFAULT_WEATHER_ID;
  activeWeatherId = next;
  if (typeof weatherChangeListener === "function") {
    weatherChangeListener(next);
  }
  return next;
}

export function getHabitatWeather() {
  return activeWeatherId;
}

/**
 * @param {ReturnType<typeof createHabitatWeatherFx>} weatherState
 * @param {{ deltaMS?: number, deltaTime?: number }} [ticker]
 */
export function updateHabitatWeatherFx(weatherState, ticker) {
  if (!weatherState) return;

  // 若外部 setHabitatWeather 改變了 id，同步視覺
  if (weatherState.weatherId !== activeWeatherId) {
    applyWeatherVisuals(weatherState, activeWeatherId);
  }

  if (readReducedMotion() || readQuality() === "low") {
    weatherState.rainLayer.visible = false;
    return;
  }

  const preset = resolvePreset(activeWeatherId);
  const delta = ticker?.deltaTime ?? 1;
  const { width, height, drops } = weatherState;
  const rainTop = height * 0.12;
  const rainBottom = height * 0.72;

  if (preset.rainLines) {
    for (let i = 0; i < drops.length; i += 1) {
      const drop = drops[i];
      if (!drop.visible) continue;
      drop.y += drop.__speed * delta;
      drop.x += drop.__drift * delta;
      if (drop.y > rainBottom || drop.x < -4 || drop.x > width + 4) {
        drop.y = rainTop + Math.random() * 40;
        drop.x = Math.random() * width;
      }
    }
  }

  const time = (typeof performance !== "undefined" ? performance.now() : Date.now()) / 1000;
  weatherState.ripples.forEach((ripple) => {
    if (!ripple.visible) return;
    const progress = (time * 0.28 + ripple.__phase) % 1;
    ripple.scale.set(0.72 + progress * 0.75);
    ripple.alpha = (1 - progress) * 0.72;
  });

  // 霧輕微呼吸
  if (weatherState.fog.alpha > 0.01) {
    const base = Number(preset.fogAlpha) || 0.2;
    weatherState.fog.alpha = base * (0.85 + Math.sin(time * 0.4) * 0.15);
  }
}

/**
 * 讓 app ticker 在天氣變更時立即套用。
 * @param {(id: string) => void} listener
 */
export function onHabitatWeatherChange(listener) {
  weatherChangeListener = listener;
}

/** Soul Talk / 對峙等氛圍鉤子（只改天氣 id）。 */
export const HABITAT_WEATHER_HOOKS = Object.freeze({
  afterSoulTalk: "quiet_after_talk",
  afterStandoffPressure: "rift_pressure",
  afterRepair: "after_repair",
  clear: "clear",
  rain: "rain",
  mist: "mist"
});
