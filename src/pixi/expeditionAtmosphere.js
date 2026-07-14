/**
 * 遠征區域氛圍（Phase 4A：輕量 Pixi FX，非全局天候引擎）。
 *
 * 設計理念：
 * - 每張遠征地圖在 region.atmosphere 定義色調 + 粒子風格
 * - 粒子數量刻意壓低，避免搶走「夥伴像活的」視線焦點
 * - 純 Pixi Graphics，不依賴外部貼圖或 Three.js
 */

/** @typedef {"drift" | "rise" | "mist"} AtmosphereMotion */

/**
 * @param {typeof PIXI} PIXI
 * @param {{ atmosphere?: object, worldWidth?: number, worldHeight?: number }} region
 */
export function createExpeditionAtmosphere(PIXI, region) {
  const config = region?.atmosphere;
  if (!config) return null;

  const worldW = region.worldWidth || 1170;
  const worldH = region.worldHeight || 780;
  const layer = new PIXI.Container();
  layer.name = "atmosphere";
  layer.zIndex = 2;

  // 全地圖色調薄霧（像 diorama 上的濾鏡紙）
  const tint = new PIXI.Graphics();
  tint.rect(0, 0, worldW, worldH).fill({
    color: config.tint ?? 0xffffff,
    alpha: config.tintAlpha ?? 0.05
  });
  layer.addChild(tint);

  const particles = [];
  const count = config.particleCount ?? 10;
  for (let i = 0; i < count; i += 1) {
    particles.push(spawnParticle(PIXI, config, worldW, worldH, Math.random()));
  }

  layer.__atmosphereState = {
    config,
    worldW,
    worldH,
    particles,
    elapsed: 0
  };

  particles.forEach((particle) => {
    layer.addChild(particle.g);
  });

  return layer;
}

function spawnParticle(PIXI, config, worldW, worldH, seed = Math.random()) {
  const motion = config.motion || "drift";
  const g = new PIXI.Graphics();
  const size = 1.5 + seed * 2.5;
  g.circle(0, 0, size).fill({
    color: config.particleColor ?? 0xffffff,
    alpha: 0.15 + seed * 0.25
  });

  return {
    g,
    motion,
    seed,
    x: seed * worldW,
    y: seed * worldH,
    phase: seed * Math.PI * 2,
    life: seed
  };
}

function wrapParticle(particle, worldW, worldH) {
  if (particle.x > worldW + 20) particle.x = -20;
  if (particle.x < -20) particle.x = worldW + 20;
  if (particle.y > worldH + 20) particle.y = -20;
  if (particle.y < -20) particle.y = worldH + 20;
}

/**
 * 每幀更新粒子位置（由 expeditionController.update 呼叫）。
 */
export function updateExpeditionAtmosphere(layer, deltaMs = 16) {
  const state = layer?.__atmosphereState;
  if (!state) return;

  const dt = Math.min(deltaMs, 50) / 1000;
  state.elapsed += dt;
  const { config, worldW, worldH } = state;

  state.particles.forEach((particle) => {
    particle.life += dt;
    const wobble = Math.sin(state.elapsed * 1.4 + particle.phase);

    if (particle.motion === "drift") {
      // 風歇草坡：草籽隨風向右飄
      particle.x += (28 + particle.seed * 18) * dt;
      particle.y += wobble * 12 * dt;
    } else if (particle.motion === "rise") {
      // 餘燼小徑：火星緩緩上升後在頂部重生
      particle.y -= (22 + particle.seed * 16) * dt;
      particle.x += wobble * 8 * dt;
      if (particle.y < -16) {
        particle.y = worldH + 10;
        particle.x = particle.seed * worldW;
      }
    } else {
      // 靜泊碼頭：薄霧水平漂移
      particle.x += (14 + particle.seed * 10) * dt;
      particle.y += wobble * 6 * dt;
    }

    wrapParticle(particle, worldW, worldH);
    particle.g.x = particle.x;
    particle.g.y = particle.y;

    // 呼吸式透明度，避免粒子看起來像靜態污點
    const pulse = 0.55 + Math.sin(state.elapsed * 2 + particle.phase) * 0.25;
    particle.g.alpha = (config.particleAlpha ?? 0.35) * pulse;
  });
}

export function destroyExpeditionAtmosphere(layer) {
  layer?.destroy?.({ children: true });
}
