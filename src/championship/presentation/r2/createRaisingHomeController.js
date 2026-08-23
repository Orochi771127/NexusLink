import { RAISING_HOME_COMMANDS } from "../../raising/raisingHomeDefinition.js";
import { createRaisingHomeDomView } from "./createRaisingHomeDomView.js";

export function createRaisingHomeController({
  root,
  runtime,
  persistence = null,
  onModeRequest = null,
  onRemount = null,
  autoAdvanceMs = 0
}) {
  if (!runtime?.getSnapshot || !runtime?.dispatch || !runtime?.subscribe) throw new TypeError("Raising Home runtime port is required");
  if (persistence !== null && (
    typeof persistence?.getStatus !== "function"
    || typeof persistence?.subscribe !== "function"
    || typeof persistence?.save !== "function"
    || typeof persistence?.retry !== "function"
    || typeof persistence?.exportRecovery !== "function"
  )) throw new TypeError("Raising Home persistence facade is invalid");
  if (onRemount !== null && typeof onRemount !== "function") throw new TypeError("Raising Home remount callback is invalid");
  let disposed = false;
  let presenter = null;
  let canvasFallbackMessage = "The semantic controls remain playable while the 2D field loads.";
  let commandSequence = 0;
  let lifecyclePending = false;

  function dispatch(command) {
    const snapshot = runtime.getSnapshot();
    if (!snapshot) return null;
    commandSequence += 1;
    const normalizedCommand = command.type === RAISING_HOME_COMMANDS.ADVANCE && command.minutes === undefined
      ? { ...command, minutes: 5 }
      : command;
    return runtime.dispatch({
      ...normalizedCommand,
      commandId: `raising-home-ui:${commandSequence}`,
      expectedRevision: snapshot.revision
    });
  }

  const view = createRaisingHomeDomView({
    root,
    onModeRequest,
    onCommand(command) {
      if (disposed) return;
      const publication = dispatch(command);
      if (!publication?.accepted && publication?.message) view.setCanvasFallback(publication.message);
    },
    ...(persistence ? {
      onSave: () => runPersistenceOperation("save", persistence.save),
      onRetry: () => runPersistenceOperation("retry", persistence.retry),
      onExportRecovery: () => runPersistenceOperation("export", persistence.exportRecovery)
    } : {}),
    ...(onRemount ? { onRemount: remount } : {})
  });

  function runPersistenceOperation(operation, invoke) {
    if (disposed || lifecyclePending) return null;
    view.setPersistenceBusy(operation, true);
    try {
      const publication = invoke();
      view.reportPersistencePublication(operation, publication);
      return publication;
    } catch (error) {
      view.reportPersistenceException(operation, error);
      return null;
    } finally {
      if (!disposed) view.setPersistenceBusy(operation, false);
    }
  }

  async function remount() {
    if (disposed || lifecyclePending || !onRemount) return;
    lifecyclePending = true;
    view.setPersistenceBusy("remount", true);
    try {
      await onRemount();
    } catch (error) {
      if (!disposed) view.reportPersistenceException("remount", error);
    } finally {
      if (!disposed) {
        lifecyclePending = false;
        view.setPersistenceBusy("remount", false);
      }
    }
  }

  function render() {
    const snapshot = runtime.getSnapshot();
    if (!snapshot) return;
    view.render(snapshot);
    presenter?.sync(snapshot);
  }

  function moveTowardTile(target) {
    const snapshot = runtime.getSnapshot();
    if (!snapshot || snapshot.paused) return;
    const dx = target.x - snapshot.caretakerPosition.x;
    const dy = target.y - snapshot.caretakerPosition.y;
    if (dx === 0 && dy === 0) return;
    const direction = Math.abs(dx) >= Math.abs(dy) ? (dx < 0 ? "left" : "right") : (dy < 0 ? "up" : "down");
    dispatch({ type: RAISING_HOME_COMMANDS.MOVE_CARETAKER, direction });
  }

  const unsubscribe = runtime.subscribe(render);
  const unsubscribePersistence = persistence?.subscribe((status) => {
    if (!disposed) view.renderSaveStatus(status);
  }) ?? null;
  const intervalId = autoAdvanceMs > 0 ? window.setInterval(() => {
    if (!disposed) dispatch({ type: RAISING_HOME_COMMANDS.ADVANCE, minutes: 5 });
  }, Math.max(250, autoAdvanceMs)) : null;
  render();
  if (persistence) view.renderSaveStatus(persistence.getStatus());

  return Object.freeze({
    getCanvasHost() {
      return view.canvasHost;
    },
    handleTileIntent: moveTowardTile,
    getPresentationDiagnostics() {
      return presenter?.profileFrameWorkload?.(90) ?? null;
    },
    focusPersistenceControl(controlName = "save") {
      view.focusPersistenceControl(controlName);
    },
    attachPresenter(nextPresenter) {
      if (presenter) throw new Error("Raising Home presenter is already attached");
      if (!nextPresenter?.sync || !nextPresenter?.dispose) throw new TypeError("Raising Home presenter port is invalid");
      nextPresenter.sync(runtime.getSnapshot());
      presenter = nextPresenter;
      view.setCanvasReady();
    },
    setCanvasFallback(message) {
      canvasFallbackMessage = String(message);
      view.setCanvasFallback(canvasFallbackMessage);
    },
    showModeNotice(message) {
      view.setCanvasFallback(String(message));
    },
    restoreCanvasPresentation() {
      if (presenter) view.setCanvasReady();
      else view.setCanvasFallback(canvasFallbackMessage);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (intervalId !== null) window.clearInterval(intervalId);
      unsubscribe();
      unsubscribePersistence?.();
      presenter?.dispose();
      presenter = null;
      view.dispose();
    }
  });
}
