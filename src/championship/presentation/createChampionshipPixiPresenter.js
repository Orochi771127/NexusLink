function creaturePalette(speciesId) {
  if (speciesId?.includes("blazetail")) return { body: 0xf07a4d, accent: 0xffd166, shadow: 0x622d3f };
  if (speciesId?.includes("crystalfin")) return { body: 0x63c7d8, accent: 0xb9f4f2, shadow: 0x1d5261 };
  return { body: 0x6f7d9c, accent: 0xd6deef, shadow: 0x283044 };
}

export function createChampionshipPixiPresenter({ app, canvasHost, catalog, onFallback }) {
  if (!app || !window.PIXI) throw new Error("Injected Pixi application is unavailable");
  const PIXI = window.PIXI;
  const scene = new PIXI.Container();
  const background = new PIXI.Graphics();
  const terrain = new PIXI.Graphics();
  const actors = new PIXI.Graphics();
  const foreground = new PIXI.Graphics();
  scene.addChild(background, terrain, actors, foreground);
  app.stage.addChild(scene);
  app.canvas.classList.add("championship-pixi-canvas");
  app.canvas.setAttribute("aria-hidden", "true");
  app.canvas.tabIndex = -1;
  let latestState = null;
  let disposed = false;

  function drawCreature(graphics, x, y, speciesId, facing = 1) {
    const palette = creaturePalette(speciesId);
    graphics.ellipse(x, y + 18, 32, 10).fill({ color: palette.shadow, alpha: 0.28 });
    graphics.ellipse(x, y, 26, 20).fill(palette.body).stroke({ color: palette.shadow, width: 3 });
    graphics.circle(x + 18 * facing, y - 10, 13).fill(palette.body).stroke({ color: palette.shadow, width: 3 });
    graphics.poly([
      x + 9 * facing, y - 19,
      x + 16 * facing, y - 32,
      x + 23 * facing, y - 18
    ]).fill(palette.accent).stroke({ color: palette.shadow, width: 2 });
    graphics.circle(x + 23 * facing, y - 12, 2.5).fill(0x171b2b);
    graphics.moveTo(x - 24 * facing, y - 2).quadraticCurveTo(x - 48 * facing, y - 26, x - 52 * facing, y - 2)
      .stroke({ color: palette.accent, width: 9, cap: "round" });
  }

  function drawHunt(state, width, height) {
    const field = state.hunt.field;
    const margin = 24;
    const cell = Math.min((width - margin * 2) / field.width, (height - margin * 2) / field.height);
    const fieldWidth = field.width * cell;
    const fieldHeight = field.height * cell;
    const offsetX = (width - fieldWidth) / 2;
    const offsetY = (height - fieldHeight) / 2;

    terrain.roundRect(offsetX, offsetY, fieldWidth, fieldHeight, 22)
      .fill({ color: 0x173a46, alpha: 0.95 })
      .stroke({ color: 0x7bd7c4, width: 3, alpha: 0.75 });
    for (let column = 0; column <= field.width; column += 1) {
      terrain.moveTo(offsetX + column * cell, offsetY).lineTo(offsetX + column * cell, offsetY + fieldHeight)
        .stroke({ color: 0x8acdc3, width: 1, alpha: 0.12 });
    }
    for (let row = 0; row <= field.height; row += 1) {
      terrain.moveTo(offsetX, offsetY + row * cell).lineTo(offsetX + fieldWidth, offsetY + row * cell)
        .stroke({ color: 0x8acdc3, width: 1, alpha: 0.12 });
    }
    for (const obstacle of field.obstacles) {
      terrain.roundRect(
        offsetX + obstacle.x * cell + 3,
        offsetY + obstacle.y * cell + 3,
        obstacle.width * cell - 6,
        obstacle.height * cell - 6,
        8
      ).fill(0x315a4b).stroke({ color: 0x9dcf92, width: 2 });
    }
    const encounterX = offsetX + (field.encounterPoint.x + 0.5) * cell;
    const encounterY = offsetY + (field.encounterPoint.y + 0.55) * cell;
    foreground.circle(encounterX, encounterY, Math.max(14, cell * 0.3))
      .stroke({ color: 0xffcf6e, width: 3, alpha: state.session.phase === "HUNT_FIELD" ? 0.65 : 1 });
    drawCreature(foreground, encounterX, encounterY, field.encounterSpeciesId, -1);

    const hunterX = offsetX + (state.hunt.hunterPosition.x + 0.5) * cell;
    const hunterY = offsetY + (state.hunt.hunterPosition.y + 0.55) * cell;
    actors.circle(hunterX, hunterY, Math.max(10, cell * 0.24)).fill(0xb9f4f2).stroke({ color: 0x183448, width: 3 });
    actors.moveTo(hunterX, hunterY - 8).lineTo(hunterX, hunterY + 8).stroke({ color: 0x183448, width: 3 });
    actors.moveTo(hunterX - 7, hunterY).lineTo(hunterX + 7, hunterY).stroke({ color: 0x183448, width: 3 });
  }

  function drawArena(state, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    terrain.ellipse(centerX, centerY + 28, width * 0.42, height * 0.3)
      .fill({ color: 0x24445b, alpha: 0.92 })
      .stroke({ color: 0xe3ba68, width: 4 });
    terrain.ellipse(centerX, centerY + 28, width * 0.23, height * 0.15)
      .stroke({ color: 0x8fd6cc, width: 2, alpha: 0.8 });
    drawCreature(actors, width * 0.31, height * 0.58, state.arena.battleSession?.player.speciesId ?? "nexus:creature:greyshade-cat", 1);
    drawCreature(actors, width * 0.69, height * 0.42, state.arena.battleSession?.opponent.speciesId ?? "nexus:creature:blazetail-kit", -1);
  }

  function drawIdle(width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    terrain.circle(centerX, centerY, Math.min(width, height) * 0.3)
      .fill({ color: 0x183d4b, alpha: 0.86 })
      .stroke({ color: 0x91e0cf, width: 4, alpha: 0.8 });
    terrain.circle(centerX, centerY, Math.min(width, height) * 0.19)
      .stroke({ color: 0xe9c979, width: 2, alpha: 0.85 });
    drawCreature(actors, centerX, centerY + 18, "nexus:creature:greyshade-cat", 1);
  }

  function redraw() {
    if (disposed || !latestState) return;
    const width = Math.max(1, app.screen.width);
    const height = Math.max(1, app.screen.height);
    background.clear().rect(0, 0, width, height).fill(0x0a1b2b);
    background.circle(width * 0.16, height * 0.2, Math.min(width, height) * 0.24).fill({ color: 0x1a5361, alpha: 0.24 });
    background.circle(width * 0.82, height * 0.1, Math.min(width, height) * 0.14).fill({ color: 0xe0b35f, alpha: 0.14 });
    terrain.clear();
    actors.clear();
    foreground.clear();
    if (latestState.hunt.field && ["HUNT_FIELD", "WILD_ENCOUNTER", "CAPTURE", "COLLECTION", "SHOP"].includes(latestState.session.phase)) {
      drawHunt(latestState, width, height);
    } else if (["ARENA", "BATTLE", "BATTLE_RESULT", "COMPLETE"].includes(latestState.session.phase)) {
      drawArena(latestState, width, height);
    } else {
      drawIdle(width, height);
    }
  }

  function resize() {
    if (disposed) return;
    const rect = canvasHost.getBoundingClientRect();
    app.renderer.resize(Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)));
    redraw();
  }

  function onContextLost(event) {
    event.preventDefault();
    app.stop?.();
    app.canvas.hidden = true;
    onFallback?.("Canvas context lost. Full DOM controls remain available.");
  }

  app.canvas.addEventListener("webglcontextlost", onContextLost);
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvasHost);
  if (!resizeObserver) window.addEventListener("resize", resize);
  resize();

  return Object.freeze({
    sync(state) {
      latestState = state;
      redraw();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);
      app.canvas.removeEventListener("webglcontextlost", onContextLost);
      if (scene.parent) scene.parent.removeChild(scene);
      scene.destroy({ children: true });
      app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
      latestState = null;
    }
  });
}
