const EXPORT_BUTTON_ID = "dev-export-json";
const IMPORT_BUTTON_ID = "dev-import-json";
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

  window.__NEXUS_SCENE_EDITOR_EXPORT__ = () => createScenePayload(state);
  window.__NEXUS_SCENE_EDITOR_IMPORT__ = (payload) => applyScenePayload(state, payload);

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
  const rawPosition = {
    x: parentPoint.x + offsetX,
    y: parentPoint.y + offsetY
  };
  const nextPosition = object.__sceneEditor?.placement
    ? snapPlacementPosition(rawPosition, object.__sceneEditor)
    : rawPosition;
  object.x = roundSceneNumber(nextPosition.x);
  object.y = roundSceneNumber(nextPosition.y);
  if (object.__sceneEditor?.placement) {
    object.zIndex = placementZIndex(object.__sceneEditor.renderLayer, nextPosition.y);
  }
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

  let importButton = document.getElementById(IMPORT_BUTTON_ID);
  if (!importButton) {
    importButton = document.createElement("button");
    importButton.id = IMPORT_BUTTON_ID;
    importButton.type = "button";
    importButton.textContent = "匯入 JSON";
    importButton.style.cssText = createDevButtonStyle({ right: 212 });
    document.body.appendChild(importButton);
  }

  importButton.hidden = false;
  importButton.onclick = () => importSceneJson(state);
}

async function exportSceneJson(state) {
  const payload = createScenePayload(state);
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

function createScenePayload(state) {
  return {
    exportedAt: new Date().toISOString(),
    objects: state.controlledObjects.map(serializeSceneObject)
  };
}

function importSceneJson(state) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.hidden = true;
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      applyScenePayload(state, payload);
      console.info("[NexusLink scene import]", file.name);
    } catch (error) {
      console.error("NexusLink scene import failed", error);
    } finally {
      input.remove();
    }
  };
  document.body.appendChild(input);
  input.click();
}

function applyScenePayload(state, payload) {
  if (!payload || !Array.isArray(payload.objects)) {
    throw new Error("Invalid NexusLink scene payload");
  }

  const byId = new Map(state.controlledObjects.map((object) => [object.__sceneEditor.id, object]));
  let applied = 0;
  payload.objects.forEach((entry) => {
    const object = byId.get(entry?.id);
    if (!object) return;
    if (object.__sceneEditor.placement) {
      applyPlacementEntry(object, entry);
    } else {
      object.x = roundSceneNumber(entry.x);
      object.y = roundSceneNumber(entry.y);
      const scaleX = entry.scale?.x ?? 1;
      const scaleY = entry.scale?.y ?? scaleX;
      object.scale.set(clampScale(scaleX), clampScale(scaleY));
    }
    object.__sceneEditorPinned = true;
    applied += 1;
  });
  return { applied, total: payload.objects.length };
}

function applyPlacementEntry(object, entry) {
  const metadata = object.__sceneEditor;
  const grid = metadata.placementGrid;
  const column = clampGridIndex(entry.cell?.column ?? metadata.cell.column, grid.columns);
  const row = clampGridIndex(entry.cell?.row ?? metadata.cell.row, grid.rows);
  const offsetPx = {
    x: Number(entry.offsetPx?.x ?? metadata.offsetPx.x) || 0,
    y: Number(entry.offsetPx?.y ?? metadata.offsetPx.y) || 0
  };
  const artPosition = {
    x: (column + 0.5) * grid.cellWidth + offsetPx.x,
    y: (row + 0.5) * grid.cellHeight + offsetPx.y
  };
  object.x = roundSceneNumber(artPosition.x - grid.artWidth / 2);
  object.y = roundSceneNumber(artPosition.y - grid.artHeight / 2);
  const scale = clampScale((Number(entry.scale) || metadata.baseScale) / metadata.baseScale);
  object.scale.set(scale);
  object.zIndex = placementZIndex(metadata.renderLayer, object.y);
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
    resetObjectPosition(object, x, y);
  });
}

function resetObjectPosition(object, x, y) {
  const metadata = object.__sceneEditor;
  if (metadata?.placement && metadata.initialArtPosition && metadata.placementGrid) {
    object.x = metadata.initialArtPosition.x - metadata.placementGrid.artWidth / 2;
    object.y = metadata.initialArtPosition.y - metadata.placementGrid.artHeight / 2;
    object.scale.set(1);
    object.zIndex = placementZIndex(metadata.renderLayer, object.y);
  } else {
    object.x = x;
    object.y = y;
  }
  object.__sceneEditorPinned = true;
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
  if (object.__sceneEditor.placement) {
    return serializePlacementObject(object);
  }
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

function serializePlacementObject(object) {
  const metadata = object.__sceneEditor;
  const grid = metadata.placementGrid;
  const artPosition = {
    x: object.x + grid.artWidth / 2,
    y: object.y + grid.artHeight / 2
  };
  const column = clampGridIndex(
    Math.round((artPosition.x - metadata.offsetPx.x) / grid.cellWidth - 0.5),
    grid.columns
  );
  const row = clampGridIndex(
    Math.round((artPosition.y - metadata.offsetPx.y) / grid.cellHeight - 0.5),
    grid.rows
  );
  const cellCenter = {
    x: (column + 0.5) * grid.cellWidth,
    y: (row + 0.5) * grid.cellHeight
  };
  const offsetPx = {
    x: artPosition.x - cellCenter.x,
    y: artPosition.y - cellCenter.y
  };
  return {
    id: metadata.id,
    slotId: metadata.slotId,
    cell: { column, row },
    offsetPx: {
      x: roundSceneNumber(offsetPx.x),
      y: roundSceneNumber(offsetPx.y)
    },
    artPosition: {
      x: roundSceneNumber(artPosition.x),
      y: roundSceneNumber(artPosition.y)
    },
    scale: roundSceneNumber((metadata.baseScale || 1) * object.scale.x),
    renderLayer: metadata.renderLayer,
    sortY: roundSceneNumber(artPosition.y),
    texture: metadata.texturePath || getTexturePath(object)
  };
}

function snapPlacementPosition(position, metadata) {
  const grid = metadata.placementGrid;
  const artX = position.x + grid.artWidth / 2;
  const artY = position.y + grid.artHeight / 2;
  const column = clampGridIndex(
    Math.round((artX - metadata.offsetPx.x) / grid.cellWidth - 0.5),
    grid.columns
  );
  const row = clampGridIndex(
    Math.round((artY - metadata.offsetPx.y) / grid.cellHeight - 0.5),
    grid.rows
  );
  return {
    x: (column + 0.5) * grid.cellWidth + metadata.offsetPx.x - grid.artWidth / 2,
    y: (row + 0.5) * grid.cellHeight + metadata.offsetPx.y - grid.artHeight / 2
  };
}

function placementZIndex(renderLayer, centeredY) {
  const layer = renderLayer === "nearStructures" ? 2 : renderLayer === "midStructures" ? 1 : 0;
  return layer * 10000 + centeredY;
}

function clampGridIndex(value, count) {
  return Math.max(0, Math.min(count - 1, Number(value) || 0));
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
