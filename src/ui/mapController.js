import { qs } from "../utils/dom.js";
import { EXPLORATION_NODES } from "../data/explorationNodes.js";
import { resolveExplorationEvent } from "../engine/explorationEngine.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import { buildEventReflection } from "../engine/soulTalkComposer.js";

// ---- UI 層佈局常數（不動 explorationNodes 資料、不動 schema） ----
// 視覺概念：月湖營地為中心起點，其他節點是心核感知到的外圍記憶座標。
const NODE_LAYOUT = {
  moonlake_camp: { x: 50, y: 83, tone: "safe", glyph: "☾" },
  starwood_trail: { x: 22, y: 57, tone: "calm", glyph: "✶" },
  misttide_shore: { x: 78, y: 61, tone: "calm", glyph: "≋" },
  crystal_ruins: { x: 28, y: 24, tone: "discovery", glyph: "◇" },
  rift_observatory: { x: 74, y: 15, tone: "danger", glyph: "✕" }
};

// 光路：靈魂連線（從營地往外延伸，再延伸到外圈）。
const PATH_LINKS = [
  { from: "moonlake_camp", to: "starwood_trail" },
  { from: "moonlake_camp", to: "misttide_shore" },
  { from: "starwood_trail", to: "crystal_ruins" },
  { from: "misttide_shore", to: "rift_observatory", danger: true }
];

const VIEWBOX_W = 100;
const VIEWBOX_H = 132;
const TOAST_HIDE_MS = 4600;
const ENCOUNTER_DELAY_MS = 650;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function createMapController({ store, panelManager, soulTalkController, saveCurrentState, battleController, statusText }) {
  const mapCanvas = qs("#map-canvas");
  const pathsSvg = qs("#map-paths");
  const nodeLayer = qs("#map-node-layer");
  const toastEl = qs("#map-result");
  const toastTitleEl = qs("#map-result-title");
  const toastTextEl = qs("#map-result-text");
  const toastChipsEl = qs("#map-result-chips");

  const nodeButtons = new Map();
  let toastTimer = null;
  let pendingEncounterTimer = null;

  function open() {
    ensurePaths();
    render();
    hideToast();
    panelManager.openPanel("map");
  }

  // ---- SVG 光路（一次性建構，純標記） ----
  function ensurePaths() {
    if (!pathsSvg || pathsSvg.childNodes.length > 0) return;

    const toView = (nodeId) => {
      const layout = NODE_LAYOUT[nodeId];
      return { x: (layout.x / 100) * VIEWBOX_W, y: (layout.y / 100) * VIEWBOX_H };
    };

    const segments = PATH_LINKS.map(({ from, to, danger }) => {
      const a = toView(from);
      const b = toView(to);
      // 二次曲線：控制點往中心湖面拉，讓光路像水脈而非直線。
      const cx = (a.x + b.x) / 2 + (a.x < b.x ? -6 : 6);
      const cy = (a.y + b.y) / 2 + 5;
      return `<path class="map-path${danger ? " path-danger" : ""}" d="M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}" />`;
    }).join("");

    pathsSvg.innerHTML = `
      <defs>
        <linearGradient id="riftGradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(36,211,255,0.32)" />
          <stop offset="62%" stop-color="rgba(167,139,250,0.4)" />
          <stop offset="100%" stop-color="rgba(248,113,113,0.5)" />
        </linearGradient>
      </defs>
      ${segments}
    `;
  }

  // ---- 節點渲染（重複呼叫只更新狀態 class / 次數） ----
  function render() {
    if (!nodeLayer) return;
    const state = store.getState();
    const visitCounts = state.explorationProgress?.visitCounts || {};
    const currentNodeId = state.explorationProgress?.lastNodeId || null;

    EXPLORATION_NODES.forEach((node) => {
      const layout = NODE_LAYOUT[node.id];
      if (!layout) return;

      let button = nodeButtons.get(node.id);
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "map-node";
        button.style.left = `${layout.x}%`;
        button.style.top = `${layout.y}%`;
        button.title = node.description;
        button.innerHTML = `
          <span class="map-node-orb" aria-hidden="true">
            <span class="map-node-glyph">${layout.glyph}</span>
            <span class="map-node-visits" hidden></span>
          </span>
          <span class="map-node-label">
            <strong>${node.label.zh}</strong>
            <em>${node.label.en}</em>
          </span>
        `;
        button.addEventListener("click", () => exploreNode(node));
        nodeLayer.appendChild(button);
        nodeButtons.set(node.id, button);
      }

      const visits = visitCounts[node.id] || 0;
      const isCurrent = node.id === currentNodeId;
      button.classList.remove("tone-safe", "tone-calm", "tone-discovery", "tone-danger");
      button.classList.add(`tone-${layout.tone}`);
      button.classList.toggle("is-visited", visits > 0);
      button.classList.toggle("is-current", isCurrent);
      button.setAttribute(
        "aria-label",
        `${node.label.zh}（${node.label.en}）${visits > 0 ? `，到訪 ${visits} 次` : "，尚未到訪"}${isCurrent ? "，最近探索" : ""}。${node.description}`
      );

      const visitsEl = button.querySelector(".map-node-visits");
      if (visitsEl) {
        visitsEl.hidden = visits <= 0;
        visitsEl.textContent = `×${visits}`;
      }
    });
  }

  // ---- Game feel：一次性 WAAPI 回饋 ----
  function pingNode(nodeId) {
    if (prefersReducedMotion()) return;
    const orb = nodeButtons.get(nodeId)?.querySelector(".map-node-orb");
    orb?.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.18)", filter: "brightness(1.5)" },
        { transform: "scale(1)", filter: "brightness(1)" }
      ],
      { duration: 360, easing: "ease-out" }
    );
  }

  function ringBurst(nodeId) {
    if (prefersReducedMotion()) return;
    const orb = nodeButtons.get(nodeId)?.querySelector(".map-node-orb");
    orb?.animate(
      [
        { boxShadow: "0 0 0 0 rgba(255, 214, 128, 0.5)" },
        { boxShadow: "0 0 0 18px rgba(255, 214, 128, 0)" }
      ],
      { duration: 700, easing: "ease-out" }
    );
  }

  function pulseHudValue(selector) {
    const el = qs(selector);
    if (!el || prefersReducedMotion()) return;
    el.classList.remove("feedback-pulse");
    // 強制 reflow 以重啟一次性動畫
    void el.offsetWidth;
    el.classList.add("feedback-pulse");
  }

  // ---- 結果 toast ----
  function showToast({ title, text, tone = "success", chips = [] }) {
    if (!toastEl) return;
    window.clearTimeout(toastTimer);
    toastEl.classList.remove("toast-success", "toast-danger", "toast-calm");
    toastEl.classList.add(`toast-${tone}`);
    if (toastTitleEl) toastTitleEl.textContent = title;
    if (toastTextEl) toastTextEl.textContent = text;
    if (toastChipsEl) {
      toastChipsEl.innerHTML = "";
      chips.forEach((chip) => {
        const span = document.createElement("span");
        span.className = `map-toast-chip chip-${chip.kind || "progress"}`;
        span.textContent = chip.label;
        toastChipsEl.appendChild(span);
      });
    }
    toastEl.classList.add("is-visible");
    toastTimer = window.setTimeout(hideToast, TOAST_HIDE_MS);
  }

  function hideToast() {
    window.clearTimeout(toastTimer);
    toastEl?.classList.remove("is-visible");
  }

  function buildResultChips(stateBefore, result) {
    const chips = [];
    const patch = result.statePatch || {};
    const deltas = [
      { key: "energy", label: "能量", kind: "success", hud: "#energy-value" },
      { key: "bond", label: "羈絆", kind: "bond", hud: "#bond-value" },
      { key: "trust", label: "信任", kind: "trust", hud: "#trust-value" }
    ];

    deltas.forEach(({ key, label, kind, hud }) => {
      if (typeof patch[key] !== "number") return;
      const delta = patch[key] - (stateBefore[key] || 0);
      if (delta === 0) return;
      chips.push({ kind: delta > 0 ? kind : "danger", label: `${label} ${delta > 0 ? "+" : ""}${delta}` });
      if (delta > 0) pulseHudValue(hud);
    });

    if (result.memoryObject) {
      chips.push({ kind: "bond", label: "＋ 留下了一段記憶" });
      pulseHudValue("#soul-talk-preview");
    }
    if (result.encounter) {
      chips.push({ kind: "danger", label: "！ 場域不安定" });
    }
    return chips;
  }

  // ---- 探索流程（結算邏輯零改動：仍走 resolveExplorationEvent） ----
  function exploreNode(node) {
    if (pendingEncounterTimer) return; // 遭遇轉場中，避免連點

    const state = store.getState();
    pingNode(node.id);

    if ((state.energy || 0) <= 0 && node.eventType !== "rest") {
      const message = "夥伴的能量見底了。先回月湖營地休息，再出發吧。";
      soulTalkController.addChat("system", message);
      soulTalkController.renderChat();
      showToast({ title: "心核訊號微弱", text: message, tone: "calm" });
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

    // 閉環：首次到訪且無遭遇時，夥伴用自己的聲音記得這趟探索。
    const isFirstVisit = !(state.explorationProgress?.visitCounts?.[node.id] > 0);
    if (!result.encounter && isFirstVisit) {
      const reflection = buildEventReflection(store.getState(), Date.now(), { allowExploration: true });
      if (reflection) soulTalkController.addChat("companion", reflection);
    }
    soulTalkController.renderChat();
    if (statusText) statusText.textContent = result.message.split("\n")[0];
    saveCurrentState?.();

    render();
    ringBurst(node.id);

    const chips = buildResultChips(state, result);
    const toastTone = result.encounter ? "danger" : node.eventType === "rest" || node.eventType === "reflective" ? "calm" : "success";
    showToast({
      title: `${node.label.zh} ・ ${node.label.en}`,
      text: result.message,
      tone: toastTone,
      chips
    });

    if (result.encounter && battleController) {
      // 遭遇回饋：光路短暫染紅，停一拍再進戰鬥，讓玩家讀得到發生了什麼。
      mapCanvas?.classList.add("is-alert");
      pendingEncounterTimer = window.setTimeout(() => {
        pendingEncounterTimer = null;
        mapCanvas?.classList.remove("is-alert");
        hideToast();
        battleController.startBattle(result.encounter);
      }, prefersReducedMotion() ? 0 : ENCOUNTER_DELAY_MS);
    }
    // 非遭遇：地圖保持開啟，玩家直接看到 visited / current / 次數變化。
  }

  return { open, render };
}
