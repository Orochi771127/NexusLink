const EXPORT_BUTTON_ID = "dev-export-json";
const RESET_BUTTON_ID = "dev-reset-objects";
const EXPORT_MODAL_ID = "dev-export-modal";
const SCALE_STEP = 0.06;
const MIN_SCALE = 0.05;
const MAX_SCALE = 6;

export function readSceneEditorFlag() {
  try {
    return new URLSearchParams(window.location.search).get("devSceneEditor") === "1";
  } catch (error) {
    console.warn("Failed to parse NexusLink scene editor flag", error);
    return false;
  }
}

export function enableEditorMode(stage) {
  if (!stage || stage.__sceneEditorEnabled) return null;

  const controlledObjects = collectSceneEditorObjects(stage);
  const state = {
    stage,
    controlledObjects,
    selected: null,
    dragging: null
  };

  controlledObjects.forEach((object) => bindEditableObject(object, state));
  injectExportButton(state);
  bindScaleShortcuts(state);

  stage.__sceneEditorEnabled = true;
  console.info("[NexusLink scene editor enabled]", controlledObjects.map((object) => object.__sceneEditor.id));
  return state;
}

function collectSceneEditorObjects(root) {
  const objects = [];
  const registeredObjects = Array.isArray(window.__NEXUS_SCENE_EDITOR_OBJECTS)
    ? window.__NEXUS_SCENE_EDITOR_OBJECTS
    : [];
  registeredObjects.forEach((object) => {
    if (object.__sceneEditor?.editorEnabled && !objects.includes(object)) {
      objects.push(object);
    }
  });
  collectSceneEditorObjectsFromTree(root, objects);
  return objects;
}

function collectSceneEditorObjectsFromTree(root, objects) {
  root.children?.forEach((child) => {
    if (child.__sceneEditor?.editorEnabled && !objects.includes(child)) {
      objects.push(child);
    }
    collectSceneEditorObjectsFromTree(child, objects);
  });
}

function bindEditableObject(object, state) {
  object.eventMode = "static";
  object.cursor = "move";
  object.on("pointerdown", (event) => beginDrag(event, object, state));
  object.on("pointermove", (event) => moveDrag(event, state));
  object.on("pointerup", () => endDrag(state));
  object.on("pointerupoutside", () => endDrag(state));
}

function beginDrag(event, object, state) {
  event.stopPropagation?.();
  selectObject(object, state);

  const parentPoint = object.parent.toLocal(event.global);
  state.dragging = {
    object,
    offsetX: object.x - parentPoint.x,
    offsetY: object.y - parentPoint.y
  };
}

function moveDrag(event, state) {
  if (!state.dragging) return;

  const { object, offsetX, offsetY } = state.dragging;
  const parentPoint = object.parent.toLocal(event.global);
  object.x = roundSceneNumber(parentPoint.x + offsetX);
  object.y = roundSceneNumber(parentPoint.y + offsetY);
  object.__sceneEditorPinned = true;
}

function endDrag(state) {
  state.dragging = null;
}

function selectObject(object, state) {
  if (state.selected === object) return;

  clearSelection(state);
  state.selected = object;
  object.__sceneEditorSelected = true;
  object.__sceneEditorOriginalAlpha = object.alpha;
  object.alpha = Math.max(0.42, object.alpha * 0.72);
}

function clearSelection(state) {
  if (!state.selected) return;

  const object = state.selected;
  if (typeof object.__sceneEditorOriginalAlpha === "number") {
    object.alpha = object.__sceneEditorOriginalAlpha;
  }
  delete object.__sceneEditorOriginalAlpha;
  delete object.__sceneEditorSelected;
  state.selected = null;
}

function bindScaleShortcuts(state) {
  window.addEventListener("wheel", (event) => {
    if (!state.selected) return;

    event.preventDefault();
    const direction = event.deltaY < 0 ? 1 : -1;
    scaleSelectedObject(state.selected, direction * SCALE_STEP);
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (!state.selected) return;

    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      scaleSelectedObject(state.selected, SCALE_STEP);
    } else if (event.key === "-" || event.key === "_") {
      event.preventDefault();
      scaleSelectedObject(state.selected, -SCALE_STEP);
    } else if (event.key === "Escape") {
      clearSelection(state);
    }
  });
}

function scaleSelectedObject(object, delta) {
  const nextX = clampScale(object.scale.x + delta);
  const nextY = clampScale(object.scale.y + delta);
  object.scale.set(roundSceneNumber(nextX), roundSceneNumber(nextY));
  object.__sceneEditorPinned = true;
}

function injectExportButton(state) {
  let button = document.getElementById(EXPORT_BUTTON_ID);
  if (!button) {
    button = document.createElement("button");
    button.id = EXPORT_BUTTON_ID;
    button.type = "button";
    button.textContent = "匯出 JSON";
    button.style.cssText = createDevButtonStyle({ right: 12 });
    document.body.appendChild(button);
  }

  button.hidden = false;
  button.onclick = () => exportSceneJson(state);

  let resetButton = document.getElementById(RESET_BUTTON_ID);
  if (!resetButton) {
    resetButton = document.createElement("button");
    resetButton.id = RESET_BUTTON_ID;
    resetButton.type = "button";
    resetButton.textContent = "物件歸中";
    resetButton.style.cssText = createDevButtonStyle({ right: 112 });
    document.body.appendChild(resetButton);
  }

  resetButton.hidden = false;
  resetButton.onclick = () => resetControlledObjects(state);
}

async function exportSceneJson(state) {
  const payload = {
    exportedAt: new Date().toISOString(),
    objects: state.controlledObjects.map(serializeSceneObject)
  };
  const json = JSON.stringify(payload, null, 2);
  console.log("[NexusLink scene export]", json);
  showExportModal(json);

  try {
    await navigator.clipboard?.writeText(json);
    console.info("[NexusLink scene export copied]");
  } catch (error) {
    console.info("[NexusLink scene export copy skipped]", error);
  }

  return json;
}

function showExportModal(json) {
  document.getElementById(EXPORT_MODAL_ID)?.remove();

  const modal = document.createElement("div");
  modal.id = EXPORT_MODAL_ID;
  modal.style.cssText = [
    "z-index:10000",
    "position:fixed",
    "inset:0",
    "background:rgba(0,0,0,0.8)",
    "display:flex",
    "align-items:stretch",
    "justify-content:center",
    "box-sizing:border-box",
    "padding:16px"
  ].join(";");

  const panel = document.createElement("div");
  panel.style.cssText = [
    "width:min(720px,100%)",
    "display:flex",
    "flex-direction:column",
    "gap:12px",
    "box-sizing:border-box",
    "padding:14px",
    "border:1px solid rgba(0,206,209,0.45)",
    "border-radius:8px",
    "background:rgba(2,6,12,0.96)",
    "color:#eafcff",
    "font:14px system-ui,sans-serif"
  ].join(";");

  const textarea = document.createElement("textarea");
  textarea.value = json;
  textarea.readOnly = true;
  textarea.style.cssText = [
    "flex:1",
    "min-height:60vh",
    "width:100%",
    "box-sizing:border-box",
    "resize:none",
    "padding:10px",
    "border:1px solid rgba(141,238,255,0.42)",
    "border-radius:6px",
    "background:#02060c",
    "color:#eafcff",
    "font:12px ui-monospace,SFMono-Regular,Consolas,monospace",
    "line-height:1.45"
  ].join(";");

  const actions = document.createElement("div");
  actions.style.cssText = [
    "display:flex",
    "gap:8px",
    "justify-content:flex-end",
    "flex-wrap:wrap"
  ].join(";");

  const downloadButton = document.createElement("button");
  downloadButton.type = "button";
  downloadButton.textContent = "下載檔案";
  downloadButton.style.cssText = createModalButtonStyle();
  downloadButton.onclick = () => downloadSceneJson(json);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.textContent = "關閉面板";
  closeButton.style.cssText = createModalButtonStyle();
  closeButton.onclick = () => modal.remove();

  actions.append(downloadButton, closeButton);
  panel.append(textarea, actions);
  modal.appendChild(panel);
  document.body.appendChild(modal);
  textarea.focus();
  textarea.select();
}

function downloadSceneJson(json) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "scene_lake.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function resetControlledObjects(state) {
  const x = roundSceneNumber(window.innerWidth / 2);
  const y = roundSceneNumber(window.innerHeight / 2);

  state.controlledObjects.forEach((object) => {
    object.x = x;
    object.y = y;
    object.__sceneEditorPinned = true;
  });
}

function createDevButtonStyle({ right }) {
  return [
    "position:fixed",
    `right:${right}px`,
    "bottom:12px",
    "z-index:9999",
    "padding:8px 10px",
    "border:1px solid rgba(0,206,209,0.55)",
    "border-radius:6px",
    "background:rgba(2,6,12,0.86)",
    "color:#eafcff",
    "font:12px system-ui,sans-serif",
    "cursor:pointer"
  ].join(";");
}

function createModalButtonStyle() {
  return [
    "padding:9px 12px",
    "border:1px solid rgba(0,206,209,0.55)",
    "border-radius:6px",
    "background:rgba(0,206,209,0.16)",
    "color:#eafcff",
    "font:13px system-ui,sans-serif",
    "cursor:pointer"
  ].join(";");
}

function serializeSceneObject(object) {
  return {
    id: object.__sceneEditor.id,
    x: roundSceneNumber(object.x),
    y: roundSceneNumber(object.y),
    scale: {
      x: roundSceneNumber(object.scale.x),
      y: roundSceneNumber(object.scale.y)
    },
    texture: object.__sceneEditor.texturePath || getTexturePath(object)
  };
}

function getTexturePath(object) {
  return object.texture?.source?.resource?.src || object.texture?.source?.src || null;
}

function clampScale(value) {
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, Number(value) || 1));
}

function roundSceneNumber(value) {
  return Math.round((Number(value) || 0) * 1000) / 1000;
}
