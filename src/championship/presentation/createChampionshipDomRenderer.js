function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeMeter(label, current, maximum) {
  const wrapper = element("div", "championship-meter");
  const text = element("div", "championship-meter__label", `${label} ${current}/${maximum}`);
  const meter = document.createElement("meter");
  meter.min = "0";
  meter.max = String(maximum);
  meter.value = String(current);
  meter.setAttribute("aria-label", `${label} ${current} of ${maximum}`);
  wrapper.append(text, meter);
  return wrapper;
}

export function createChampionshipDomRenderer({ root, onIntent }) {
  root.replaceChildren();
  root.classList.add("championship-shell");

  const header = element("header", "championship-header");
  header.append(
    element("p", "championship-eyebrow", "NEXUS LINK · CHAMPIONSHIP CORE R1"),
    element("h1", "championship-title", "Moonlit Championship Research")
  );
  const warning = element("p", "championship-warning", "Isolated · Default-off · Memory-only · No player rewards");
  warning.setAttribute("role", "note");
  header.append(warning);

  const playfield = element("section", "championship-playfield");
  playfield.setAttribute("aria-label", "2D Championship field presentation");
  const canvasHost = element("div", "championship-canvas-host");
  canvasHost.id = "championship-canvas-host";
  const canvasFallback = element("div", "championship-canvas-fallback", "DOM field telemetry active");
  canvasFallback.id = "championship-canvas-fallback";
  canvasHost.append(canvasFallback);

  const hud = element("aside", "championship-hud");
  hud.setAttribute("aria-label", "Research HUD");
  const phasePill = element("p", "championship-phase-pill");
  const hudStats = element("dl", "championship-hud-stats");
  const battleMeters = element("div", "championship-battle-meters");
  hud.append(phasePill, hudStats, battleMeters);
  playfield.append(canvasHost, hud);

  const panel = element("main", "championship-panel");
  const screenHeading = element("h2", "championship-screen-heading");
  screenHeading.tabIndex = -1;
  const screenDescription = element("p", "championship-screen-description");
  const telemetry = element("p", "championship-telemetry");
  const actionRegion = element("div", "championship-actions");
  actionRegion.setAttribute("aria-label", "Available actions");
  panel.append(screenHeading, screenDescription, telemetry, actionRegion);

  const live = element("div", "championship-live");
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  root.append(header, playfield, panel, live);

  function renderStats(model) {
    hudStats.replaceChildren();
    const entries = [
      ["Research mist", String(model.wallet)],
      ["Captured", String(model.collectionCount)],
      ["Revision", String(model.revision)]
    ];
    for (const [term, value] of entries) {
      hudStats.append(element("dt", "", term), element("dd", "", value));
    }
    battleMeters.replaceChildren();
    if (model.battle) {
      battleMeters.append(
        makeMeter("Ally HP", model.battle.player.hp, model.battle.player.maxHp),
        makeMeter("Rival HP", model.battle.opponent.hp, model.battle.opponent.maxHp)
      );
    }
  }

  function renderActions(model) {
    actionRegion.replaceChildren();
    actionRegion.classList.toggle("championship-actions--directional", model.phase === "HUNT_FIELD");
    for (const available of model.actions) {
      const button = element("button", `championship-action championship-action--${available.tone}`, available.label);
      button.type = "button";
      button.disabled = available.disabled === true;
      button.dataset.championshipAction = available.type;
      button.dataset.direction = available.payload?.direction ?? "";
      button.addEventListener("click", () => onIntent(available.type, available.payload));
      actionRegion.append(button);
    }
  }

  return Object.freeze({
    canvasHost,
    render(model, publication = null) {
      phasePill.textContent = model.phase.replaceAll("_", " ");
      screenHeading.textContent = model.title;
      screenDescription.textContent = model.description;
      telemetry.textContent = model.hunt
        ? `Field coordinate ${model.hunt.position.x}, ${model.hunt.position.y}${model.hunt.collision ? " · obstacle blocked the last move" : ""}`
        : `Event sequence ${model.eventCount}`;
      renderStats(model);
      renderActions(model);
      if (publication?.events?.length) live.textContent = publication.events.map((event) => event.type.replaceAll("_", " ")).join(". ");
      else live.textContent = `${model.title} ready`;
      root.dataset.phase = model.phase;
    },
    report(message) {
      live.textContent = message;
    },
    setCanvasFallback(message) {
      canvasFallback.hidden = false;
      canvasFallback.textContent = message;
    },
    setCanvasReady() {
      canvasFallback.hidden = true;
    },
    dispose() {
      root.replaceChildren();
      root.classList.remove("championship-shell");
    }
  });
}
