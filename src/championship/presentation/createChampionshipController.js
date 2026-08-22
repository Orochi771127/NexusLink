import { CHAMPIONSHIP_COMMANDS } from "../core/championshipCommands.js";
import { createChampionshipDomRenderer } from "./createChampionshipDomRenderer.js";
import { createChampionshipFocusController } from "./createChampionshipFocusController.js";
import { createChampionshipInputAdapter } from "./createChampionshipInputAdapter.js";
import { createChampionshipScreenStack } from "./createChampionshipScreenStack.js";
import { createChampionshipViewModel } from "./createChampionshipViewModel.js";

export function createChampionshipController({ root, runtime, catalog, pixiPresenter = null }) {
  let commandSequence = 0;
  let disposed = false;
  let lastPhase = null;
  let activePixiPresenter = pixiPresenter;
  const screenStack = createChampionshipScreenStack();
  let dispatchIntent = () => {};
  const domRenderer = createChampionshipDomRenderer({ root, onIntent: (type, payload) => dispatchIntent(type, payload) });
  const focusController = createChampionshipFocusController(root);

  function render(publication = null) {
    const state = runtime.getSnapshot();
    if (!state) return;
    const phaseChanged = state.session.phase !== lastPhase;
    const viewModel = createChampionshipViewModel(state, catalog);
    screenStack.replace(viewModel.phase);
    domRenderer.render(viewModel, publication);
    activePixiPresenter?.sync(state);
    if (phaseChanged) {
      lastPhase = state.session.phase;
      queueMicrotask(() => focusController.focusFirst());
    }
  }

  dispatchIntent = (type, payload = {}) => {
    if (disposed) return null;
    commandSequence += 1;
    const publication = runtime.dispatch({
      commandId: `championship-ui-${commandSequence}`,
      type,
      expectedRevision: runtime.getSnapshot().revision,
      payload
    });
    if (!publication.accepted) domRenderer.report(publication.result.message ?? publication.result.code);
    return publication;
  };

  const inputAdapter = createChampionshipInputAdapter({
    root,
    getPhase: () => runtime.getSnapshot()?.session.phase,
    move: (direction) => dispatchIntent(CHAMPIONSHIP_COMMANDS.MOVE_HUNTER, { direction }),
    activateFocused: () => {
      const focused = document.activeElement;
      if (focused instanceof HTMLButtonElement && root.contains(focused)) focused.click();
      else root.querySelector("[data-championship-action]:not([disabled])")?.click();
    }
  });
  const unsubscribe = runtime.subscribe((publication) => {
    if (!disposed && publication.accepted) render(publication);
  });
  render();

  return Object.freeze({
    dispatch: dispatchIntent,
    getCanvasHost() {
      return domRenderer.canvasHost;
    },
    setCanvasFallback(message) {
      domRenderer.setCanvasFallback(message);
    },
    setCanvasReady() {
      domRenderer.setCanvasReady();
    },
    attachPixiPresenter(presenter) {
      if (activePixiPresenter) throw new Error("Championship Pixi presenter is already attached");
      activePixiPresenter = presenter;
      activePixiPresenter.sync(runtime.getSnapshot());
      domRenderer.setCanvasReady();
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      unsubscribe();
      inputAdapter.dispose();
      screenStack.clear();
      activePixiPresenter?.dispose();
      activePixiPresenter = null;
      domRenderer.dispose();
    }
  });
}
