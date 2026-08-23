import { formatRaisingHomeClock, RAISING_HOME_COMMANDS } from "../../raising/raisingHomeDefinition.js";

const SAVE_PHASE_COPY = Object.freeze({
  DIRTY: "Unsaved Raising changes are held in this page session.",
  CLEAN: "The in-memory save matches the current Raising state.",
  SAVED: "Saved in memory for this page session.",
  RESTORED: "Restored from this page session's in-memory save.",
  RECOVERED: "Recovered the last good in-memory Raising save.",
  DISPOSED: "This Raising save session is disposed."
});

const SAVE_FAILURE_COPY = Object.freeze({
  CHAMPIONSHIP_R2_SAVE_INJECTED_FAILURE: "Save failed in the research failure simulation. Raising changes remain unsaved.",
  CHAMPIONSHIP_R2_SAVE_QUOTA_EXCEEDED: "Save failed because the in-memory quota was exceeded. Raising changes remain unsaved.",
  CHAMPIONSHIP_R2_SAVE_REVISION_CONFLICT: "Save failed because the in-memory revision changed. Raising changes remain unsaved.",
  CHAMPIONSHIP_R2_SAVE_IDEMPOTENCY_CONFLICT: "Save failed because the request identity conflicted. Raising changes remain unsaved.",
  CHAMPIONSHIP_R2_SAVE_COORDINATOR_DISPOSED: "Save failed because this Raising session is disposed."
});

function node(tag, className = "", text = undefined) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function meter(label, value, tone) {
  const wrapper = node("div", `r2-meter r2-meter--${tone}`);
  const caption = node("div", "r2-meter__caption");
  caption.append(node("span", "", label), node("strong", "", String(value)));
  const bar = document.createElement("meter");
  bar.min = "0";
  bar.max = "100";
  bar.value = String(value);
  bar.setAttribute("aria-label", `${label}: ${value} of 100`);
  wrapper.append(caption, bar);
  return wrapper;
}

function commandButton(label, command, tone = "plain") {
  const button = node("button", `r2-command r2-command--${tone}`, label);
  button.type = "button";
  button.dataset.command = command;
  return button;
}

function spatialSummary(state, resident) {
  if (!resident) return "No resident position is selected.";
  const dx = resident.position.x - state.caretakerPosition.x;
  const dy = resident.position.y - state.caretakerPosition.y;
  const directions = [];
  if (dx !== 0) directions.push(`${Math.abs(dx)} tile${Math.abs(dx) === 1 ? "" : "s"} ${dx < 0 ? "left" : "right"}`);
  if (dy !== 0) directions.push(`${Math.abs(dy)} tile${Math.abs(dy) === 1 ? "" : "s"} ${dy < 0 ? "up" : "down"}`);
  const distance = Math.abs(dx) + Math.abs(dy);
  const route = directions.length ? `Relative route: ${directions.join(", then ")}.` : "You share the same tile.";
  return `Caretaker tile ${state.caretakerPosition.x}, ${state.caretakerPosition.y}. ${resident.name} tile ${resident.position.x}, ${resident.position.y}. Distance ${distance}. ${route}`;
}

export function createRaisingHomeDomView({
  root,
  onCommand,
  onModeRequest = null,
  onSave = null,
  onRetry = null,
  onExportRecovery = null,
  onRemount = null
}) {
  if (!(root instanceof HTMLElement)) throw new TypeError("Raising Home requires a DOM root");
  if (typeof onCommand !== "function") throw new TypeError("Raising Home requires an onCommand callback");
  root.replaceChildren();
  root.classList.add("championship-r2-shell");

  const topbar = node("header", "r2-topbar");
  const identity = node("div", "r2-identity");
  identity.append(node("p", "r2-eyebrow", "NEXUS LINK · CHAMPIONSHIP R2"), node("h1", "", "Moonlake Raising Home"));
  const clock = node("div", "r2-clock", "08:00");
  clock.setAttribute("aria-label", "Habitat time");
  topbar.append(identity, clock);

  const layout = node("div", "r2-layout");
  const modeRail = node("nav", "r2-mode-rail");
  modeRail.setAttribute("aria-label", "Championship modes");
  const modeEntries = [
    ["raising-home", "Home", false],
    ["hunt-world", "Hunt", false],
    ["battle-menu", "Battle", false],
    ["database", "Database", false],
    ["shop", "Shop", false]
  ];
  for (const [modeId, label, disabled] of modeEntries) {
    const button = node("button", `r2-mode${modeId === "raising-home" ? " is-active" : ""}`, label);
    button.type = "button";
    button.dataset.mode = modeId;
    button.disabled = disabled;
    button.addEventListener("click", () => onModeRequest?.(modeId));
    modeRail.append(button);
  }

  const playColumn = node("main", "r2-play-column");
  const fieldFrame = node("section", "r2-field-frame");
  fieldFrame.setAttribute("aria-label", "Raising Home grid field");
  const canvasHost = node("div", "r2-canvas-host");
  const fallback = node("div", "r2-canvas-fallback", "The semantic controls remain playable while the 2D field loads.");
  fallback.setAttribute("role", "status");
  canvasHost.append(fallback);
  const fieldCaption = node("div", "r2-field-caption");
  fieldCaption.append(node("span", "", "CM · 24 × 14 authored grid"), node("span", "", "Arrow keys / D-pad / tap field"));
  fieldFrame.append(canvasHost, fieldCaption);

  const touchPad = node("div", "r2-touch-pad");
  touchPad.setAttribute("aria-label", "Caretaker movement");
  for (const [direction, label] of [["up", "↑"], ["left", "←"], ["down", "↓"], ["right", "→"]]) {
    const button = commandButton(label, RAISING_HOME_COMMANDS.MOVE_CARETAKER, "direction");
    button.dataset.direction = direction;
    button.setAttribute("aria-label", `Move ${direction}`);
    touchPad.append(button);
  }
  playColumn.append(fieldFrame, touchPad);

  const hud = node("aside", "r2-hud");
  hud.setAttribute("aria-label", "Raising Home HUD");
  const residence = node("section", "r2-card");
  residence.append(node("p", "r2-card__eyebrow", "RESIDENT SIGNAL"));
  const residentName = node("h2", "r2-resident-name");
  const temperament = node("p", "r2-temperament");
  const spatialStatus = node("p", "r2-spatial-status");
  const residentPicker = node("div", "r2-resident-picker");
  const meters = node("div", "r2-meters");
  residence.append(residentName, temperament, spatialStatus, residentPicker, meters);

  const actions = node("section", "r2-card r2-action-card");
  actions.append(node("p", "r2-card__eyebrow", "LISTEN, THEN ACT"));
  const actionGrid = node("div", "r2-action-grid");
  actionGrid.append(
    commandButton("Invite closer", RAISING_HOME_COMMANDS.INVITE, "primary"),
    commandButton("Offer care", RAISING_HOME_COMMANDS.CARE, "water"),
    commandButton("Short practice", RAISING_HOME_COMMANDS.TRAIN, "ember"),
    commandButton("Protect rest", RAISING_HOME_COMMANDS.REST, "quiet")
  );
  const timeGrid = node("div", "r2-time-grid");
  timeGrid.append(
    commandButton("Advance 5 min", RAISING_HOME_COMMANDS.ADVANCE),
    commandButton("Pause rhythm", RAISING_HOME_COMMANDS.TOGGLE_PAUSE)
  );
  actions.append(actionGrid, timeGrid);

  const persistenceEnabled = [onSave, onRetry, onExportRecovery, onRemount].some((callback) => typeof callback === "function");
  let saveCard = null;
  let saveStatus = null;
  let saveCode = null;
  let saveButton = null;
  let retryButton = null;
  let exportButton = null;
  let remountButton = null;
  let recoveryOutput = null;
  let recoveryText = null;
  let latestSaveStatus = null;
  let persistenceBusy = null;

  if (persistenceEnabled) {
    saveCard = node("section", "r2-card r2-save-card");
    saveCard.setAttribute("aria-labelledby", "r2-save-title");
    const saveEyebrow = node("p", "r2-card__eyebrow", "REALM-LOCAL SAVE");
    const saveTitle = node("h2", "r2-save-title", "Save and remount");
    saveTitle.id = "r2-save-title";
    const saveBoundary = node("p", "r2-save-boundary", "Schema v2 · memory only · browser refresh clears this state");
    saveStatus = node("p", "r2-save-status", "Reading in-memory save status…");
    saveStatus.setAttribute("role", "status");
    saveStatus.setAttribute("aria-live", "polite");
    saveStatus.setAttribute("aria-atomic", "true");
    saveCode = node("code", "r2-save-code", "CHAMPIONSHIP_R2_SAVE_STATUS_PENDING");
    const saveControls = node("div", "r2-save-controls");
    saveButton = commandButton("Save", "", "primary");
    retryButton = commandButton("Retry", "", "ember");
    exportButton = commandButton("Export recovery", "", "water");
    remountButton = commandButton("Remount session", "", "quiet");
    for (const button of [saveButton, retryButton, exportButton, remountButton]) delete button.dataset.command;
    saveButton.dataset.persistenceAction = "save";
    retryButton.dataset.persistenceAction = "retry";
    exportButton.dataset.persistenceAction = "export";
    remountButton.dataset.persistenceAction = "remount";
    saveControls.append(saveButton, retryButton, exportButton, remountButton);

    recoveryOutput = node("div", "r2-recovery-output");
    recoveryOutput.hidden = true;
    const recoveryLabel = node("label", "r2-recovery-label", "Recovery JSON — copy this before refreshing");
    recoveryLabel.htmlFor = "r2-recovery-json";
    recoveryText = node("textarea", "r2-recovery-text");
    recoveryText.id = "r2-recovery-json";
    recoveryText.readOnly = true;
    recoveryText.rows = 7;
    recoveryText.spellcheck = false;
    recoveryOutput.append(recoveryLabel, recoveryText);
    saveCard.append(saveEyebrow, saveTitle, saveBoundary, saveStatus, saveCode, saveControls, recoveryOutput);
  }

  const feedback = node("section", "r2-feedback");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  hud.append(residence, actions, ...(saveCard ? [saveCard] : []), feedback);
  layout.append(modeRail, playColumn, hud);
  root.append(topbar, layout);

  function dispatchFromButton(event) {
    const persistenceButton = event.target.closest("[data-persistence-action]");
    if (persistenceButton instanceof HTMLButtonElement && root.contains(persistenceButton)) {
      const callbacks = { save: onSave, retry: onRetry, export: onExportRecovery, remount: onRemount };
      callbacks[persistenceButton.dataset.persistenceAction]?.();
      return;
    }
    const button = event.target.closest("[data-command]");
    if (!(button instanceof HTMLButtonElement) || !root.contains(button)) return;
    const command = { type: button.dataset.command };
    if (button.dataset.direction) command.direction = button.dataset.direction;
    onCommand(command);
  }

  function onKeyDown(event) {
    const direction = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }[event.key];
    if (!direction || event.repeat || event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    onCommand({ type: RAISING_HOME_COMMANDS.MOVE_CARETAKER, direction });
  }

  root.addEventListener("click", dispatchFromButton);
  window.addEventListener("keydown", onKeyDown);

  function updatePersistenceControls() {
    if (!saveCard) return;
    const busy = persistenceBusy !== null;
    saveButton.disabled = busy || !latestSaveStatus?.dirty;
    retryButton.disabled = busy || !latestSaveStatus?.canRetry;
    exportButton.disabled = busy || !latestSaveStatus?.canExportRecovery;
    remountButton.disabled = busy || Boolean(latestSaveStatus?.dirty);
    saveCard.setAttribute("aria-busy", String(busy));
  }

  function presentStatus(message, { tone = "neutral" } = {}) {
    if (!saveStatus) return;
    saveStatus.classList.remove("is-success", "is-failure", "is-busy", "is-neutral");
    saveStatus.classList.add(`is-${tone}`);
    saveStatus.setAttribute("role", tone === "failure" ? "alert" : "status");
    saveStatus.setAttribute("aria-live", tone === "failure" ? "assertive" : "polite");
    saveStatus.textContent = message;
  }

  function statusMessage(status) {
    if (status.phase === "SAVE_FAILED") {
      return SAVE_FAILURE_COPY[status.lastCode]
        ?? "Save failed. Raising changes remain unsaved; use Retry or export the recovery JSON.";
    }
    return SAVE_PHASE_COPY[status.phase] ?? "In-memory save status is unavailable.";
  }

  return Object.freeze({
    canvasHost,
    render(state) {
      clock.textContent = formatRaisingHomeClock(state.clockMinutes);
      clock.classList.toggle("is-paused", state.paused);
      const selected = state.residents.find((resident) => resident.residentId === state.selectedResidentId);
      residentName.textContent = selected?.name ?? "No resident selected";
      temperament.textContent = selected ? `${selected.temperament} · ${selected.intent.replaceAll("-", " ")} · ${selected.lastResponse.replaceAll("-", " ")}` : "";
      spatialStatus.textContent = spatialSummary(state, selected);
      residentPicker.replaceChildren();
      for (const resident of state.residents) {
        const button = node("button", `r2-resident-chip${resident.residentId === state.selectedResidentId ? " is-active" : ""}`, resident.name);
        button.type = "button";
        button.addEventListener("click", () => onCommand({ type: RAISING_HOME_COMMANDS.SELECT_RESIDENT, residentId: resident.residentId }));
        residentPicker.append(button);
      }
      meters.replaceChildren(
        meter("Satiety", selected?.satiety ?? 0, "leaf"),
        meter("Energy", selected?.energy ?? 0, "sun"),
        meter("Ease", selected?.ease ?? 0, "water"),
        meter("Readiness", selected?.readiness ?? 0, "violet")
      );
      feedback.textContent = state.feedback;
      const pauseButton = root.querySelector(`[data-command="${RAISING_HOME_COMMANDS.TOGGLE_PAUSE}"]`);
      if (pauseButton) pauseButton.textContent = state.paused ? "Resume rhythm" : "Pause rhythm";
      root.dataset.paused = String(state.paused);
      root.dataset.revision = String(state.revision);
    },
    renderSaveStatus(status) {
      if (!saveCard || !status || typeof status !== "object") return;
      latestSaveStatus = status;
      root.dataset.savePhase = String(status.phase);
      saveCode.textContent = String(status.lastCode);
      if (persistenceBusy === null) {
        const tone = status.phase === "SAVE_FAILED"
          ? "failure"
          : ["CLEAN", "SAVED", "RESTORED", "RECOVERED"].includes(status.phase)
            ? "success"
            : "neutral";
        presentStatus(statusMessage(status), { tone });
      }
      updatePersistenceControls();
    },
    setPersistenceBusy(operation, busy) {
      if (!saveCard) return;
      persistenceBusy = busy ? operation : null;
      if (busy) {
        saveStatus.classList.remove("is-success", "is-failure", "is-neutral");
        saveStatus.classList.add("is-busy");
        saveStatus.setAttribute("role", "status");
        saveStatus.setAttribute("aria-live", "polite");
        saveStatus.textContent = operation === "remount" ? "Disposing and remounting this page session…" : "Checking the in-memory save boundary…";
      } else if (latestSaveStatus) {
        const tone = latestSaveStatus.phase === "SAVE_FAILED"
          ? "failure"
          : ["CLEAN", "SAVED", "RESTORED", "RECOVERED"].includes(latestSaveStatus.phase)
            ? "success"
            : "neutral";
        presentStatus(statusMessage(latestSaveStatus), { tone });
      }
      updatePersistenceControls();
    },
    reportPersistencePublication(operation, publication) {
      if (!saveCard || !publication || typeof publication !== "object") return;
      if (!publication.accepted) {
        saveCode.textContent = String(publication.code ?? "CHAMPIONSHIP_R2_SAVE_OPERATION_FAILED");
        presentStatus(
          SAVE_FAILURE_COPY[publication.code] ?? `${operation === "remount" ? "Remount" : "Save"} failed. Raising changes remain unsaved.`,
          { tone: "failure" }
        );
      }
      if (operation === "export" && publication.accepted && typeof publication.serialized === "string") {
        recoveryText.value = publication.serialized;
        recoveryOutput.hidden = false;
        recoveryText.focus({ preventScroll: true });
        recoveryText.select();
      }
    },
    reportPersistenceException(operation, error) {
      if (!saveCard) return;
      saveCode.textContent = "CHAMPIONSHIP_R2_SAVE_UI_EXCEPTION";
      const detail = error instanceof Error && error.message ? ` ${error.message}` : "";
      presentStatus(`${operation === "remount" ? "Remount" : "Save"} failed.${detail}`, { tone: "failure" });
    },
    focusPersistenceControl(controlName = "save") {
      const controls = { save: saveButton, retry: retryButton, export: exportButton, remount: remountButton };
      controls[controlName]?.focus({ preventScroll: true });
    },
    setCanvasReady() {
      fallback.hidden = true;
    },
    setCanvasFallback(message) {
      fallback.hidden = false;
      fallback.textContent = message;
    },
    dispose() {
      root.removeEventListener("click", dispatchFromButton);
      window.removeEventListener("keydown", onKeyDown);
      root.replaceChildren();
      root.classList.remove("championship-r2-shell");
    }
  });
}
