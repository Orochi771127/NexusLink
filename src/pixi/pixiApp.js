export const WORLD_WIDTH = 390;
export const WORLD_HEIGHT = 844;
export const COMPANION_GROUND_Y = 485;
export const PLATFORM_Y = 540;

export async function createPixiApp(gameRoot) {
  if (!window.PIXI) {
    throw new Error("PixiJS is not available on window.PIXI");
  }

  const app = new PIXI.Application();
  await app.init({
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    backgroundAlpha: 0,
    antialias: false,
    resolution: Math.min(window.devicePixelRatio || 1, 2),
    autoDensity: true
  });
  gameRoot.appendChild(app.canvas);
  return app;
}

export function createWorld(app) {
  const world = new PIXI.Container();
  app.stage.addChild(world);
  return world;
}

export function createParticles() {
  const layer = new PIXI.Container();
  for (let i = 0; i < 44; i += 1) {
    const p = new PIXI.Graphics();
    const isWarm = i % 5 === 0;
    p.circle(0, 0, 0.8 + Math.random() * 1.9).fill({
      color: isWarm ? 0xffb86b : 0x8deeff,
      alpha: isWarm ? 0.42 : 0.3
    });
    p.x = 20 + Math.random() * (WORLD_WIDTH - 40);
    p.y = 100 + Math.random() * 660;
    layer.addChild(p);
  }
  return layer;
}

export function animateParticles(particles, timeSeconds, ticker) {
  particles.children.forEach((particle, index) => {
    particle.y -= (0.15 + index * 0.002) * ticker.deltaTime;
    particle.alpha = 0.25 + Math.sin(timeSeconds + index) * 0.12;
    if (particle.y < 110) particle.y = 760;
  });
}
