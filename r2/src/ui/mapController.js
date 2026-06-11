import { qs } from "../utils/dom.js";
import { EXPLORATION_NODES } from "../data/explorationNodes.js";
import { resolveExplorationEvent } from "../engine/explorationEngine.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";

export function createMapController({ store, panelManager, soulTalkController, saveCurrentState, battleController, statusText }) {
  const nodeListEl = qs("#map-node-list");

  function open() {
    render();
    panelManager.openPanel("map");
  }

  function render() {
    if (!nodeListEl) return;
    const state = store.getState();
    const visitCounts = state.explorationProgress?.visitCounts || {};
    nodeListEl.innerHTML = "";

    EXPLORATION_NODES.forEach((node) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `map-node-card tone-${node.eventType === "danger" ? "danger" : "calm"}`;

      const visits = visitCounts[node.id] || 0;
      const tagLabel = node.eventType === "danger"
        ? "危險 ・ 必有遭遇"
        : node.eventType === "rest"
          ? "安全 ・ 營地"
          : node.encounterChance > 0
            ? "可能遭遇"
            : "平靜";

      card.innerHTML = `
        <span class="map-node-head">
          <strong class="map-node-name">${node.label.zh}</strong>
          <em class="map-node-name-en">${node.label.en}</em>
        </span>
        <p class="map-node-desc">${node.description}</p>
        <span class="map-node-foot">
          <span class="map-node-tag">${tagLabel}</span>
          <span class="map-node-visits">${visits > 0 ? `到訪 ${visits} 次` : "尚未到訪"}</span>
        </span>
      `;

      card.addEventListener("click", () => exploreNode(node));
      nodeListEl.appendChild(card);
    });
  }

  function exploreNode(node) {
    const state = store.getState();
    if ((state.energy || 0) <= 0 && node.eventType !== "rest") {
      soulTalkController.addChat("system", "夥伴的能量見底了。先回月湖營地休息，再出發吧。");
      soulTalkController.renderChat();
      panelManager.closePanel();
      return;
    }

    const result = resolveExplorationEvent(state, node, { now: Date.now() });

    store.updateState((draft) => {
      Object.assign(draft, result.statePatch);
      if (result.memoryObject) {
        draft.emotionalMemories.push(result.memoryObject);
        draft.lastEmotionTag = result.memoryObject.emotion;
        const trace = createHabitatTraceFromMemory(result.memoryObject, Date.now());
        if (trace) {
          draft.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(draft.habitatTraces || [], trace));
        }
      }
    });

    soulTalkController.addChat("system", `【${node.label.zh}】${result.message}`);
    soulTalkController.renderChat();
    if (statusText) statusText.textContent = result.message.split("\n")[0];
    saveCurrentState?.();

    if (result.encounter && battleController) {
      battleController.startBattle(result.encounter);
      return;
    }

    panelManager.closePanel();
  }

  return { open, render };
}
