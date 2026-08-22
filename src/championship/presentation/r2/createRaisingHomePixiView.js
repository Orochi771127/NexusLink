const ZONE_COLORS = Object.freeze({ water: 0x2a7181, rest: 0x514f75, training: 0x8c5c3f, garden: 0x35694f });

function palette(speciesId) {
  if (speciesId === "blazetail-kit") return { body: 0xf47a4b, light: 0xffd166, shade: 0x5b2637 };
  if (speciesId === "crystalfin-seahorse") return { body: 0x60cbd1, light: 0xd0fbef, shade: 0x1d5261 };
  return { body: 0x72809c, light: 0xdce4ef, shade: 0x262d45 };
}

function makeResidentNode(PIXI, speciesId) {
  const group = new PIXI.Container();
  const colors = palette(speciesId);
  const shadow = new PIXI.Graphics().ellipse(0, 13, 15, 5).fill({ color: colors.shade, alpha: 0.35 });
  const body = new PIXI.Graphics()
    .ellipse(0, 0, 13, 11).fill(colors.body).stroke({ color: colors.shade, width: 2 })
    .circle(10, -8, 7).fill(colors.body).stroke({ color: colors.shade, width: 2 })
    .poly([4, -12, 8, -21, 13, -12]).fill(colors.light).stroke({ color: colors.shade, width: 1.5 })
    .circle(12, -9, 1.5).fill(0x101727);
  const signal = new PIXI.Graphics().circle(0, 0, 19).stroke({ color: 0xf5d47b, width: 2, alpha: 0.9 });
  signal.visible = false;
  group.addChild(shadow, body, signal);
  return { group, signal };
}

export function createRaisingHomePixiView({ PIXI, app, canvasHost, onTileIntent, onFallback }) {
  if (!PIXI?.Container || !PIXI?.Graphics) throw new TypeError("Pixi v8 presentation API is required");
  if (!app?.stage || !app?.renderer || !app?.canvas) throw new TypeError("An initialized Pixi Application is required");
  const scene = new PIXI.Container({ isRenderGroup: true });
  const staticLayer = new PIXI.Container();
  const actorLayer = new PIXI.Container();
  actorLayer.sortableChildren = true;
  scene.addChild(staticLayer, actorLayer);
  app.stage.addChild(scene);
  app.canvas.classList.add("r2-pixi-canvas");
  app.canvas.setAttribute("aria-hidden", "true");
  app.canvas.tabIndex = -1;
  let latest = null;
  let disposed = false;
  let layout = { scale: 1, offsetX: 0, offsetY: 0 };
  const residents = new Map();
  const caretaker = new PIXI.Container();
  caretaker.zIndex = 1000;
  const caretakerShadow = new PIXI.Graphics().ellipse(0, 10, 12, 4).fill({ color: 0x07131e, alpha: 0.5 });
  const caretakerMark = new PIXI.Graphics()
    .circle(0, 0, 9).fill(0xf0d083).stroke({ color: 0x172c3b, width: 2 })
    .moveTo(0, -5).lineTo(0, 5).stroke({ color: 0x172c3b, width: 2 })
    .moveTo(-5, 0).lineTo(5, 0).stroke({ color: 0x172c3b, width: 2 });
  caretaker.addChild(caretakerShadow, caretakerMark);
  actorLayer.addChild(caretaker);

  function tilePosition(position, field) {
    const tile = field.tileSize * layout.scale;
    return {
      x: layout.offsetX + (position.x + 0.5) * tile,
      y: layout.offsetY + (position.y + 0.62) * tile
    };
  }

  function rebuildStatic(state) {
    staticLayer.removeChildren().forEach((child) => child.destroy());
    const { field } = state;
    const width = Math.max(1, app.screen.width);
    const height = Math.max(1, app.screen.height);
    const baseTile = field.tileSize;
    layout.scale = Math.min((width - 32) / (field.width * baseTile), (height - 32) / (field.height * baseTile));
    const tile = baseTile * layout.scale;
    const mapWidth = field.width * tile;
    const mapHeight = field.height * tile;
    layout.offsetX = (width - mapWidth) / 2;
    layout.offsetY = (height - mapHeight) / 2;

    const backdrop = new PIXI.Graphics().rect(0, 0, width, height).fill(0x071722);
    const floor = new PIXI.Graphics()
      .roundRect(layout.offsetX, layout.offsetY, mapWidth, mapHeight, Math.max(8, tile * 0.35))
      .fill(0x163b3d).stroke({ color: 0x79cdb4, width: 2, alpha: 0.65 });
    const zones = new PIXI.Graphics();
    for (const zone of field.zones) {
      zones.roundRect(
        layout.offsetX + zone.x * tile + 2,
        layout.offsetY + zone.y * tile + 2,
        zone.width * tile - 4,
        zone.height * tile - 4,
        Math.max(5, tile * 0.22)
      ).fill({ color: ZONE_COLORS[zone.tone] ?? 0x31554c, alpha: 0.72 })
        .stroke({ color: 0xc6eadb, width: 1, alpha: 0.38 });
    }
    const obstacles = new PIXI.Graphics();
    for (const obstacle of field.obstacles) {
      obstacles.roundRect(
        layout.offsetX + obstacle.x * tile,
        layout.offsetY + obstacle.y * tile,
        obstacle.width * tile,
        obstacle.height * tile,
        Math.max(2, tile * 0.12)
      ).fill(0x0c242d).stroke({ color: 0x315b5e, width: 1 });
    }
    const grid = new PIXI.Graphics();
    for (let x = 1; x < field.width; x += 1) {
      grid.moveTo(layout.offsetX + x * tile, layout.offsetY).lineTo(layout.offsetX + x * tile, layout.offsetY + mapHeight)
        .stroke({ color: 0xc9eee3, width: 1, alpha: 0.055 });
    }
    for (let y = 1; y < field.height; y += 1) {
      grid.moveTo(layout.offsetX, layout.offsetY + y * tile).lineTo(layout.offsetX + mapWidth, layout.offsetY + y * tile)
        .stroke({ color: 0xc9eee3, width: 1, alpha: 0.055 });
    }
    staticLayer.addChild(backdrop, floor, zones, grid, obstacles);
  }

  function ensureResidents(state) {
    const liveIds = new Set(state.residents.map((resident) => resident.residentId));
    for (const [residentId, entry] of residents) {
      if (!liveIds.has(residentId)) {
        actorLayer.removeChild(entry.group);
        entry.group.destroy({ children: true });
        residents.delete(residentId);
      }
    }
    for (const resident of state.residents) {
      if (!residents.has(resident.residentId)) {
        const entry = makeResidentNode(PIXI, resident.speciesId);
        actorLayer.addChild(entry.group);
        residents.set(resident.residentId, entry);
      }
    }
  }

  function sync(state) {
    if (disposed) return;
    const fieldChanged = latest?.field?.fieldId !== state.field.fieldId;
    latest = state;
    if (fieldChanged || staticLayer.children.length === 0) rebuildStatic(state);
    ensureResidents(state);
    const caretakerPoint = tilePosition(state.caretakerPosition, state.field);
    caretaker.position.set(caretakerPoint.x, caretakerPoint.y);
    caretaker.zIndex = state.caretakerPosition.y * 10 + 5;
    const actorScale = Math.max(0.55, Math.min(1.3, layout.scale));
    caretaker.scale.set(actorScale);
    for (const resident of state.residents) {
      const entry = residents.get(resident.residentId);
      const point = tilePosition(resident.position, state.field);
      entry.group.position.set(point.x, point.y);
      entry.group.scale.set(actorScale * (resident.facing === "left" ? -1 : 1), actorScale);
      entry.group.zIndex = resident.position.y * 10;
      entry.signal.visible = resident.residentId === state.selectedResidentId;
      entry.signal.alpha = state.paused ? 0.45 : 1;
    }
  }

  function resize() {
    if (disposed) return;
    const rect = canvasHost.getBoundingClientRect();
    app.renderer.resize(Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)));
    if (latest) {
      rebuildStatic(latest);
      sync(latest);
    }
  }

  function handlePointer(event) {
    if (!latest || typeof onTileIntent !== "function") return;
    const rect = app.canvas.getBoundingClientRect();
    const scaleX = app.screen.width / Math.max(1, rect.width);
    const scaleY = app.screen.height / Math.max(1, rect.height);
    const localX = (event.clientX - rect.left) * scaleX;
    const localY = (event.clientY - rect.top) * scaleY;
    const tile = latest.field.tileSize * layout.scale;
    const x = Math.floor((localX - layout.offsetX) / tile);
    const y = Math.floor((localY - layout.offsetY) / tile);
    if (x >= 0 && y >= 0 && x < latest.field.width && y < latest.field.height) onTileIntent({ x, y });
  }

  function handleContextLost(event) {
    event.preventDefault();
    app.stop?.();
    app.canvas.hidden = true;
    onFallback?.("The 2D context was lost. Semantic controls remain active; reload to restore the field.");
  }

  app.canvas.addEventListener("pointerdown", handlePointer);
  app.canvas.addEventListener("webglcontextlost", handleContextLost);
  const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  resizeObserver?.observe(canvasHost);
  if (!resizeObserver) window.addEventListener("resize", resize);
  resize();

  return Object.freeze({
    sync,
    profileFrameWorkload(iterations = 60) {
      if (disposed || !latest) return null;
      const count = Math.max(1, Math.min(240, Math.trunc(iterations) || 60));
      const samples = [];
      for (let index = 0; index < count; index += 1) {
        const startedAt = performance.now();
        sync(latest);
        app.render();
        samples.push(performance.now() - startedAt);
      }
      const ordered = [...samples].sort((left, right) => left - right);
      return Object.freeze({
        iterations: count,
        averageMs: samples.reduce((sum, value) => sum + value, 0) / count,
        medianMs: ordered[Math.floor(ordered.length / 2)],
        p95Ms: ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))],
        targetFrameBudgetMs: 16.67
      });
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      resizeObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", resize);
      app.canvas.removeEventListener("pointerdown", handlePointer);
      app.canvas.removeEventListener("webglcontextlost", handleContextLost);
      if (scene.parent) scene.parent.removeChild(scene);
      scene.destroy({ children: true });
      app.destroy({ removeView: true, releaseGlobalResources: true }, { children: true });
      residents.clear();
      latest = null;
    }
  });
}
