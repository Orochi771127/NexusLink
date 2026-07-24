import { qs } from "../utils/dom.js";
import { prefersReducedMotion } from "../utils/motionPreference.js";
import { EXPLORATION_NODES } from "../data/explorationNodes.js";
import { resolveExplorationEvent } from "../engine/explorationEngine.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import { buildEventReflection } from "../engine/soulTalkComposer.js";
import { getChapterForNode, getChapterByNumber } from "../data/chapterRegistry.js";
import { getChapterNarrative } from "../data/chapterNarrative.js";
import { getCompanionById } from "../data/companionRegistry.js";
import {
  canAskResonance,
  evaluateResonanceInvite,
  listAskableChapters
} from "../engine/resonanceInviteEngine.js";
import { resolveChapterEncounter } from "../engine/chapterEncounterResolver.js";
import {
  buildRelationshipChapterMarkSnapshot,
  ensureCompanionRelationshipInDraft
} from "../state/companionStateSchema.js";
import EventBus from "../utils/eventBus.js";
import { MOONLAKE_NODE_LAYOUT, MOONLAKE_ROUTE_ART } from "../data/mapArtLayout.js";
import {
  buildStandoffDeferMessage,
  canEnterUnguidedStandoff
} from "../engine/resonanceThreadEngine.js";
import { t, getLanguage } from "../i18n/i18n.js";
import { formatAffinityDeltaChip } from "./bondPresentation.js";

const NODE_LAYOUT = MOONLAKE_NODE_LAYOUT;

// 章節前沿節點的可見性（CH-5b）：月湖（第 1 章）＝家，永遠可見；
// 其餘章節節點只在「當前章」顯示——旅程往前走，走過的章由世界地圖（atlas）留存，
// 不在探索圖上堆積（避免最終 18 個節點擠成一團；也維持「當下能做什麼」的清爽）。
function isNodeVisible(node, chapterProgress) {
  const chapterNo = getChapterForNode(node.id);
  if (chapterNo === 1) return true;
  return chapterNo === Number(chapterProgress?.current);
}

// 光路：靈魂連線（從營地往外延伸，再延伸到外圈）。
const PATH_LINKS = [
  { from: "moonlake_camp", to: "starwood_trail" },
  { from: "moonlake_camp", to: "misttide_shore" },
  { from: "starwood_trail", to: "crystal_ruins" },
  { from: "misttide_shore", to: "rift_observatory", danger: true },
  { from: "moonlake_camp", to: "mirror_hollow" }
];

const VIEWBOX_W = MOONLAKE_ROUTE_ART.viewWidth;
const VIEWBOX_H = MOONLAKE_ROUTE_ART.viewHeight;
const TOAST_HIDE_MS = 4600;
const ENCOUNTER_DELAY_MS = 650;
export const FIRST_EXPLORATION_NODE_ID = "moonlake_camp";

export function hasExistingExplorationProgress(state) {
  const progress = state?.explorationProgress;
  if ((Number(progress?.totalExplorations) || 0) > 0) return true;
  const visitCounts = progress?.visitCounts && typeof progress.visitCounts === "object"
    ? progress.visitCounts
    : {};
  return Object.values(visitCounts).some((count) => (Number(count) || 0) > 0);
}

export function isFirstExplorationNodeAllowed(state, nodeId) {
  return hasExistingExplorationProgress(state) || nodeId === FIRST_EXPLORATION_NODE_ID;
}

export function buildPhaseSearchReading(state, companion, phaseSearch) {
  const name = companion?.name || "夥伴";
  const energy = Number(state?.energy) || 0;
  const fatigue = Number(state?.touchFatigue) || 0;
  const defense = Number(state?.defense) || 0;
  const mood = state?.mood || "calm";
  const temperament = `${companion?.temperament?.zh || ""} ${companion?.temperament?.en || ""}`;
  const guarded = defense >= 60
    || fatigue >= 6
    || ["defensive", "distant", "alert", "sad", "tired"].includes(mood)
    || state?.lastTouchReaction === "reject";
  const outward = ["warm", "happy"].includes(mood)
    || /好奇|活潑|敏銳|curious|lively|alert/i.test(temperament);

  let body;
  let suggestedChoice;
  if (energy <= 3) {
    body = `${name}在水脈外收住腳步，呼吸比林間的光慢半拍；牠沒有往前。`;
    suggestedChoice = "anchor";
  } else if (guarded) {
    body = `${name}把身體微微側向退路，目光仍留在林內；牠想先保有距離。`;
    suggestedChoice = "anchor";
  } else if (outward) {
    body = `${name}的視線追著枝間星光移動，前腳已朝水脈方向落下。`;
    suggestedChoice = "direct";
  } else {
    body = `${name}先望向你，再望回林間，讓下一步安靜地停在你們之間。`;
    suggestedChoice = "calm_sync";
  }

  const suggestedLabel = phaseSearch?.choices?.find((choice) => choice.id === suggestedChoice)?.label || "先停一拍";
  return {
    body,
    suggestedChoice,
    suggestion: `${name}此刻偏向「${suggestedLabel}」，但牠沒有催你。`
  };
}

export function resolvePhaseSearchChoice(choiceId, phaseSearch) {
  if (choiceId === "direct") {
    return { shouldExplore: true, shouldClose: true, sessionPatch: null, animationIntent: null, message: "" };
  }
  if (choiceId === "anchor") {
    return {
      shouldExplore: false,
      shouldClose: false,
      sessionPatch: { anchorRead: true, settled: false },
      animationIntent: "soul.acknowledge",
      message: phaseSearch?.anchorReading || "你們先聽清地脈回聲。"
    };
  }
  if (choiceId === "calm_sync") {
    return {
      shouldExplore: false,
      shouldClose: false,
      sessionPatch: { anchorRead: false, settled: true },
      animationIntent: "care.calm_sync",
      message: phaseSearch?.calmReading || "你們只讓此刻的呼吸慢下來。"
    };
  }
  return {
    shouldExplore: false,
    shouldClose: true,
    sessionPatch: null,
    animationIntent: null,
    message: phaseSearch?.returnMessage || "你們把這條路留到之後。"
  };
}

export function createEncounterTransition({
  setTimer = (callback, delay) => window.setTimeout(callback, delay),
  clearTimer = (timerId) => window.clearTimeout(timerId),
  isMapActive = () => false,
  onStart = () => {},
  onCancel = () => {}
} = {}) {
  let timerId = null;
  let pendingEncounter = null;

  function cancel() {
    if (timerId === null) return false;
    clearTimer(timerId);
    const cancelledEncounter = pendingEncounter;
    timerId = null;
    pendingEncounter = null;
    onCancel(cancelledEncounter);
    return true;
  }

  function schedule(encounter, delay = 0) {
    cancel();
    pendingEncounter = encounter;
    timerId = setTimer(() => {
      const readyEncounter = pendingEncounter;
      timerId = null;
      pendingEncounter = null;
      if (!isMapActive()) {
        onCancel(readyEncounter);
        return;
      }
      onStart(readyEncounter);
    }, delay);
  }

  return { schedule, cancel, isPending: () => timerId !== null };
}

// 動畫意圖事件（沿用既有 app/Pixi bridge；與 battleController/app 同名常數）。
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";
// 無可靠來源節點時的參考點（地圖中心）；front=往畫面下方/靠近玩家，back=往上/遠離。
const MAP_CENTER = { x: 50, y: 50 };
const MAP_CUE_DELAY_MS = 150;
const MAP_DIRECTION_EPS = 3; // x/y 差距都很小時不播（避免無意義 cue）

// 純函數：依「目標節點 vs 參考點」的相對位置解析方向意圖（取絕對差較大的軸）。
// 只回傳意圖字串，實際動畫解析/播放由 app bridge 的 resolveAnimationIntent 處理。
function pickDirectionIntent(target, ref) {
  if (!target || !ref) return null;
  const dx = target.x - ref.x;
  const dy = target.y - ref.y;
  if (Math.abs(dx) < MAP_DIRECTION_EPS && Math.abs(dy) < MAP_DIRECTION_EPS) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "move.right" : "move.left";
  return dy >= 0 ? "move.front" : "move.back";
}

// 探索方向意圖：參考點優先用「上一個所在節點」，否則退回地圖中心。
function resolveExploreDirectionIntent(state, node) {
  const target = NODE_LAYOUT[node.id];
  if (!target) return null;
  const currentNodeId = state?.explorationProgress?.lastNodeId || null;
  const fromLayout = currentNodeId && currentNodeId !== node.id ? NODE_LAYOUT[currentNodeId] : null;
  return pickDirectionIntent(target, fromLayout || MAP_CENTER);
}

export function createMapController({
  store,
  panelManager,
  soulTalkController,
  saveCurrentState,
  battleController,
  expeditionController,
  companionGrowthController,
  statusText,
  returnToHabitat = null
}) {
  const mapCanvas = qs("#map-canvas");
  const pathsSvg = qs("#map-paths");
  const nodeLayer = qs("#map-node-layer");
  const toastEl = qs("#map-result");
  const toastTitleEl = qs("#map-result-title");
  const toastTextEl = qs("#map-result-text");
  const toastChipsEl = qs("#map-result-chips");

  const nodeButtons = new Map();
  let toastTimer = null;
  let inviteBanner = null;
  let firstRouteGuide = null;
  let phaseSearchPanel = null;
  let activePhaseNode = null;
  let phaseSearchSession = { anchorRead: false, settled: false };
  let pendingMapCueTimer = null;

  const encounterTransition = createEncounterTransition({
    isMapActive: () => panelManager.getActivePanel?.() === "map",
    onStart: (encounter) => {
      mapCanvas?.classList.remove("is-alert");
      hideToast();
      if (!encounter) return;
      const state = store.getState();
      // D2：首輪閉環＋可見痕跡前，不直接開未引導對峙。
      if (!canEnterUnguidedStandoff(state)) {
        const companion = getCompanionById(state.activeCompanionId);
        const defer = buildStandoffDeferMessage(companion?.name || "夥伴");
        showToast({
          title: t("map.standoffDeferredTitle") || defer.title,
          text: defer.text,
          tone: "calm"
        });
        if (statusText) statusText.textContent = defer.title;
        return;
      }
      battleController?.startBattle(encounter);
    },
    onCancel: () => {
      mapCanvas?.classList.remove("is-alert");
    }
  });

  panelManager.registerOnClose?.("map", handleMapClosed);

  function handleMapClosed() {
    encounterTransition.cancel();
    if (pendingMapCueTimer !== null) {
      window.clearTimeout(pendingMapCueTimer);
      pendingMapCueTimer = null;
    }
    mapCanvas?.classList.remove("is-alert");
    closePhaseSearch({ restoreFocus: false });
    hideToast();
  }

  function open() {
    ensureMapArt();
    ensurePaths();
    render();
    renderInviteBanner();
    expeditionController?.renderMapLaunch?.(qs(".map-modal"));
    hideToast();
    panelManager.openPanel("map");
  }

  function ensureMapArt() {
    if (!mapCanvas || mapCanvas.querySelector(".map-art-layer")) return;
    const image = document.createElement("img");
    image.className = "map-art-layer";
    image.src = MOONLAKE_ROUTE_ART.image;
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("load", () => mapCanvas.classList.add("is-art-ready"), { once: true });
    image.addEventListener("error", () => {
      mapCanvas.classList.add("is-art-fallback");
      image.remove();
    }, { once: true });
    mapCanvas.prepend(image);
    if (image.complete && image.naturalWidth > 0) mapCanvas.classList.add("is-art-ready");
  }

  // UI 不直接碰 Pixi：方向 cue 只透過 EventBus 發送 intent，由 app/Pixi bridge 接。
  function emitMapAnimationIntent(intent, meta = {}) {
    if (!intent) return;
    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
      intent,
      source: "map-exploration",
      interrupt: true,
      ...meta
    });
  }

  function ensureFirstRouteGuide() {
    if (firstRouteGuide || !mapCanvas?.parentNode) return;
    firstRouteGuide = document.createElement("p");
    firstRouteGuide.id = "map-first-route-guide";
    firstRouteGuide.className = "map-first-route-guide";
    firstRouteGuide.setAttribute("role", "status");
    firstRouteGuide.textContent = "先沿水脈回到月湖營地。那裡不會發生遭遇。";
    mapCanvas.parentNode.insertBefore(firstRouteGuide, mapCanvas);
  }

  function renderFirstRouteGuide(state) {
    ensureFirstRouteGuide();
    if (!firstRouteGuide) return;
    firstRouteGuide.hidden = hasExistingExplorationProgress(state);
  }

  function ensurePhaseSearchPanel() {
    if (phaseSearchPanel || !mapCanvas) return;
    phaseSearchPanel = document.createElement("section");
    phaseSearchPanel.className = "phase-search";
    phaseSearchPanel.hidden = true;
    phaseSearchPanel.tabIndex = -1;
    phaseSearchPanel.setAttribute("role", "region");
    phaseSearchPanel.setAttribute("aria-labelledby", "phase-search-title");
    phaseSearchPanel.setAttribute("aria-describedby", "phase-search-body phase-search-reading");
    phaseSearchPanel.innerHTML = `
      <p class="phase-search-kicker">STARWOOD WATER VEIN</p>
      <h3 id="phase-search-title"></h3>
      <p class="phase-search-intro"></p>
      <p id="phase-search-body" class="phase-search-body"></p>
      <p id="phase-search-tendency" class="phase-search-tendency"></p>
      <div class="phase-compass" role="group" aria-label="選擇這一拍的探索方式">
        <span class="phase-compass-vein" aria-hidden="true"></span>
        <span class="phase-anchor-ring" aria-hidden="true"><i></i></span>
        <div class="phase-choice-layer"></div>
      </div>
      <p id="phase-search-reading" class="phase-search-reading" aria-live="polite"></p>
    `;
    phaseSearchPanel.addEventListener("click", (event) => {
      const button = event.target.closest("[data-phase-choice]");
      if (button) handlePhaseSearchChoice(button.dataset.phaseChoice);
    });
    mapCanvas.appendChild(phaseSearchPanel);
  }

  function renderPhaseSearchPanel() {
    if (!phaseSearchPanel || !activePhaseNode?.phaseSearch) return;
    const phaseSearch = activePhaseNode.phaseSearch;
    const state = store.getState();
    const companion = getCompanionById(state.activeCompanionId);
    const reading = buildPhaseSearchReading(state, companion, phaseSearch);
    const choices = Array.isArray(phaseSearch.choices) ? phaseSearch.choices : [];
    const layer = phaseSearchPanel.querySelector(".phase-choice-layer");

    phaseSearchPanel.querySelector("#phase-search-title").textContent = phaseSearch.title;
    phaseSearchPanel.querySelector(".phase-search-intro").textContent = phaseSearch.prompt;
    phaseSearchPanel.querySelector(".phase-search-body").textContent = reading.body;
    phaseSearchPanel.querySelector(".phase-search-tendency").textContent = reading.suggestion;
    phaseSearchPanel.querySelector(".phase-search-reading").textContent = phaseSearchSession.anchorRead
      ? phaseSearch.anchorReading
      : phaseSearchSession.settled
        ? phaseSearch.calmReading
        : "";

    layer.innerHTML = choices.map((choice) => `
      <button type="button" class="phase-choice phase-choice-${choice.id}" data-phase-choice="${choice.id}">
        <span>${choice.label}</span>
        <small>${choice.detail}</small>
      </button>
    `).join("");
    layer.querySelectorAll("[data-phase-choice]").forEach((button) => {
      const recommended = button.dataset.phaseChoice === reading.suggestedChoice;
      button.classList.toggle("is-suggested", recommended);
      if (recommended) {
        button.setAttribute("aria-describedby", "phase-search-tendency");
      } else {
        button.removeAttribute("aria-describedby");
      }
    });
  }

  function openPhaseSearch(node) {
    ensurePhaseSearchPanel();
    if (!phaseSearchPanel) return;
    // 前一次探索的結果卡會佔據行動區；進入相位尋路前先收起，避免在 390×844
    // 視窗遮住錨點／共息／返營等選項。
    hideToast();
    if (toastEl) toastEl.hidden = true;
    activePhaseNode = node;
    phaseSearchSession = { anchorRead: false, settled: false };
    renderPhaseSearchPanel();
    phaseSearchPanel.hidden = false;
    mapCanvas?.classList.add("is-phase-searching");
    requestAnimationFrame(() => {
      phaseSearchPanel?.querySelector('[data-phase-choice="direct"]')?.focus();
    });
  }

  function closePhaseSearch({ restoreFocus = true } = {}) {
    const previousNodeId = activePhaseNode?.id;
    if (phaseSearchPanel) phaseSearchPanel.hidden = true;
    mapCanvas?.classList.remove("is-phase-searching");
    activePhaseNode = null;
    phaseSearchSession = { anchorRead: false, settled: false };
    if (restoreFocus && previousNodeId) nodeButtons.get(previousNodeId)?.focus();
  }

  function handlePhaseSearchChoice(choiceId) {
    const node = activePhaseNode;
    if (!node?.phaseSearch) return;
    const outcome = resolvePhaseSearchChoice(choiceId, node.phaseSearch);

    if (outcome.shouldExplore) {
      const completedChoiceId = phaseSearchSession.anchorRead ? "anchor_read" : "direct";
      closePhaseSearch({ restoreFocus: false });
      exploreNode(node, { skipPhaseSearch: true, growthChoiceId: completedChoiceId });
      return;
    }

    if (outcome.shouldClose) {
      closePhaseSearch({ restoreFocus: false });
      returnToHabitat?.();
      if (statusText) statusText.textContent = outcome.message;
      return;
    }

    phaseSearchSession = { ...phaseSearchSession, ...outcome.sessionPatch };
    emitMapAnimationIntent(outcome.animationIntent, { nodeId: node.id, phaseChoice: choiceId });
    renderPhaseSearchPanel();
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
    const chapterProgress = state.chapterProgress || { current: 1, completed: [] };
    const isFirstExploration = !hasExistingExplorationProgress(state);
    renderFirstRouteGuide(state);

    EXPLORATION_NODES.forEach((node) => {
      const layout = NODE_LAYOUT[node.id];
      if (!layout) return;

      // 章節前沿節點：不屬當前章時隱藏（已建立過的按鈕改 hidden，未建立則跳過）。
      const visible = isNodeVisible(node, chapterProgress);
      if (!visible) {
        const existing = nodeButtons.get(node.id);
        if (existing) existing.hidden = true;
        return;
      }

      let button = nodeButtons.get(node.id);
      if (button) button.hidden = false;
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "map-node";
        button.style.left = `${layout.x}%`;
        button.style.top = `${layout.y}%`;
        button.title = node.description;
        button.innerHTML = `
          <span class="map-node-orb" aria-hidden="true">
            ${layout.vignette ? `<img class="map-node-art" src="${layout.vignette}" alt="" decoding="async" draggable="false" />` : ""}
            <span class="map-node-glyph">${layout.glyph}</span>
            <span class="map-node-visits" hidden></span>
          </span>
          <span class="map-node-label">
            <strong>${node.label.zh}</strong>
            <em>${node.label.en}</em>
          </span>
        `;
        const nodeArt = button.querySelector(".map-node-art");
        if (nodeArt?.complete && nodeArt.naturalWidth > 0) {
          button.classList.add("is-node-art-ready");
        } else {
          nodeArt?.addEventListener("load", () => button.classList.add("is-node-art-ready"), { once: true });
        }
        button.addEventListener("click", () => exploreNode(node));
        nodeLayer.appendChild(button);
        nodeButtons.set(node.id, button);
      }

      const visits = visitCounts[node.id] || 0;
      const isCurrent = node.id === currentNodeId;
      const firstRouteLocked = !isFirstExplorationNodeAllowed(state, node.id);
      const isFirstSafeNode = isFirstExploration && node.id === FIRST_EXPLORATION_NODE_ID;
      button.classList.remove("tone-safe", "tone-calm", "tone-discovery", "tone-danger");
      button.classList.add(`tone-${layout.tone}`);
      button.classList.toggle("is-visited", visits > 0);
      button.classList.toggle("is-current", isCurrent);
      button.classList.toggle("is-first-route-locked", firstRouteLocked);
      button.classList.toggle("is-first-safe", isFirstSafeNode);
      button.disabled = firstRouteLocked;
      button.setAttribute("aria-disabled", String(firstRouteLocked));
      button.title = firstRouteLocked ? "首次探索請先前往月湖營地。" : node.description;
      if (isFirstSafeNode) {
        button.setAttribute("aria-describedby", "map-first-route-guide");
      } else {
        button.removeAttribute("aria-describedby");
      }
      button.setAttribute(
        "aria-label",
        `${node.label.zh}（${node.label.en}）${visits > 0 ? `，到訪 ${visits} 次` : "，尚未到訪"}${isCurrent ? "，最近探索" : ""}${firstRouteLocked ? "，首次探索尚未開放" : ""}${isFirstSafeNode ? "，首次安全探索" : ""}。${node.description}`
      );

      const visitsEl = button.querySelector(".map-node-visits");
      if (visitsEl) {
        visitsEl.hidden = visits <= 0;
        visitsEl.textContent = `×${visits}`;
      }
    });
    expeditionController?.renderMapLaunch?.(qs(".map-modal"));
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
    toastEl.hidden = false;
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
    const lang = getLanguage();
    const deltas = [
      { key: "energy", label: "能量", kind: "success", hud: "#energy-value" },
      { key: "bond", label: "羈絆", kind: "bond", hud: "#bond-value" },
      { key: "trust", label: "信任", kind: "trust", hud: "#trust-value" }
    ];

    deltas.forEach(({ key, label, kind, hud }) => {
      if (typeof patch[key] !== "number") return;
      const delta = patch[key] - (stateBefore[key] || 0);
      if (delta === 0) return;
      // 羈絆／信任改質性短語；能量仍保留數值（資源，非關係刷分）。
      const affinityLabel = formatAffinityDeltaChip(key, delta, lang);
      chips.push({
        kind: delta > 0 ? kind : "danger",
        label: affinityLabel || `${label} ${delta > 0 ? "+" : ""}${delta}`
      });
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
  function exploreNode(node, { skipPhaseSearch = false, growthChoiceId = "direct" } = {}) {
    if (encounterTransition.isPending()) return; // 遭遇轉場中，避免連點

    const state = store.getState();
    if (!isFirstExplorationNodeAllowed(state, node.id)) {
      showToast({
        title: "先回到安全的水脈",
        text: "第一次探索從月湖營地開始。其他路徑會在這一拍完成後自然亮起。",
        tone: "calm"
      });
      return;
    }
    pingNode(node.id);

    // 相遇（CH-5b）：踏入某章區域的第一個節點 = 與該章心核夥伴的初次相遇。
    // 相遇是「自成一拍」的時刻——只演出、寫下 metAt 與關係快照，這一次不結算探索
    // （下一次點擊才正常探索/對峙）。相遇不消耗能量、不解鎖、不給獎勵。
    if (maybeMeetChapterCompanion(node, state)) return;

    if ((state.energy || 0) <= 0 && node.eventType !== "rest") {
      const message = "夥伴的能量見底了。先回月湖營地休息，再出發吧。";
      // 只走 toast：系統狀態不再塞進聊天紀錄（私測回報會被誤認成對話回覆）。
      showToast({ title: "心核訊號微弱", text: message, tone: "calm" });
      return;
    }

    if (!skipPhaseSearch && node.phaseSearch) {
      openPhaseSearch(node);
      return;
    }

    const now = Date.now();
    const result = resolveExplorationEvent(state, node, { now });
    const companionId = state.activeCompanionId || "greyshade-cat";
    const chapterNo = getChapterForNode(node.id);
    const isRegisteredNode = EXPLORATION_NODES.some((candidate) => candidate.id === node.id);

    store.updateState((draft) => {
      Object.assign(draft, result.statePatch);
      if (result.memoryObject) {
        draft.emotionalMemories.push(result.memoryObject);
        draft.lastEmotionTag = result.memoryObject.emotion;
        const trace = createHabitatTraceFromMemory(result.memoryObject, now);
        if (trace) {
          draft.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(draft.habitatTraces || [], trace));
        }
      }
      if (isRegisteredNode && node.eventType !== "rest") {
        companionGrowthController?.writeIntoDraft?.(draft, {
          companionId,
          sourceType: "exploration",
          tendency: "pathfinding",
          context: { chapterNo, nodeId: node.id, choiceId: growthChoiceId },
          createdAt: now,
          completed: true,
          completionStatus: "completed",
          safetyProvenance: {
            isHighRisk: false,
            strategyId: null,
            actionId: null,
            systemRoleSafetyReply: false,
            safetyModeActive: false,
            safeHarborModeActive: state.safeHarborMode === true
          }
        });
      }
    });

    // 探索結果只走下方 toast（本函式尾端的 showToast）；不再以 system 行塞進聊天紀錄。
    // 閉環：首次到訪且無遭遇時，夥伴用自己的聲音記得這趟探索——這是對話，留在聊天室。
    const isFirstVisit = !(state.explorationProgress?.visitCounts?.[node.id] > 0);
    if (!result.encounter && isFirstVisit) {
      const reflection = buildEventReflection(store.getState(), now, { allowExploration: true });
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
      text: result.encounter
        ? result.message
        : `${result.message}\n${t("map.exploreReturnPreview")}`,
      tone: toastTone,
      chips
    });

    if (!result.encounter && statusText) {
      statusText.textContent = `${result.message.split("\n")[0]}｜${t("map.exploreReturnPreview")}`;
    }

    if (result.encounter && battleController) {
      const readyForStandoff = canEnterUnguidedStandoff(store.getState());
      if (!readyForStandoff) {
        // 延後對峙：不走危險 alert／遭遇轉場，避免「已結算卻進不了戰」的白耗感。
        const companion = getCompanionById(store.getState().activeCompanionId);
        const defer = buildStandoffDeferMessage(companion?.name || "夥伴");
        showToast({
          title: t("map.standoffDeferredTitle") || defer.title,
          text: defer.text,
          tone: "calm"
        });
        if (statusText) statusText.textContent = defer.title;
      } else {
        // 遭遇回饋：光路短暫染紅，停一拍再進戰鬥，讓玩家讀得到發生了什麼。
        // 遭遇時不播 map 方向 cue——讓 battle cue 獨佔這一拍，避免搶 one-shot lock。
        mapCanvas?.classList.add("is-alert");
        encounterTransition.schedule(result.encounter, prefersReducedMotion() ? 0 : ENCOUNTER_DELAY_MS);
      }
    } else {
      // 非遭遇：地圖保持開啟，玩家直接看到 visited / current / 次數變化。
      // 結果已寫入 state/memory/trace 後，夥伴用一個短方向 cue 回應這趟探索（每次成功只一次）。
      const directionIntent = resolveExploreDirectionIntent(state, node);
      if (directionIntent) {
        pendingMapCueTimer = window.setTimeout(
          () => {
            pendingMapCueTimer = null;
            if (panelManager.getActivePanel?.() === "map") {
              emitMapAnimationIntent(directionIntent, { nodeId: node.id });
            }
          },
          MAP_CUE_DELAY_MS
        );
      }
    }
  }

  // ---- 相遇（CH-5b + Pack 4）：首次踏入某章區域 → Encounter Resolver 動態決定遇見誰 ----
  function maybeMeetChapterCompanion(node, state) {
    const chapterNo = getChapterForNode(node.id);
    const resolution = resolveChapterEncounter(state, chapterNo);
    if (resolution.kind === "skip" || resolution.kind === "already_met" || resolution.kind === "already_fallback") {
      return false;
    }

    const now = Date.now();

    if (resolution.kind === "fallback") {
      store.updateState((draft) => {
        if (!draft.resonance.chapterMarks[chapterNo]) {
          draft.resonance.chapterMarks[chapterNo] = {
            bondAtStart: 0,
            trustAtStart: 0,
            blockedTouchAtStart: 0,
            overwhelmedCount: 0,
            enteredAt: now,
            reaskedAt: null,
            fallbackEventId: resolution.eventId,
            encounterResolvedAt: now
          };
        } else {
          draft.resonance.chapterMarks[chapterNo] = {
            ...draft.resonance.chapterMarks[chapterNo],
            fallbackEventId: resolution.eventId,
            encounterResolvedAt: now
          };
        }
      });
      ringBurst(node.id);
      showToast({
        title: "土地的回聲",
        text: (resolution.lines || []).join("\n"),
        tone: "calm"
      });
      if (statusText) statusText.textContent = "土地的回聲";
      render();
      renderInviteBanner();
      saveCurrentState?.();
      return true;
    }

    const companionId = resolution.companionId;
    if (!companionId) return false;

    store.updateState((draft) => {
      const companions = draft.resonance.companions;
      companions[companionId] = {
        ...(companions[companionId] || {}),
        metAt: now,
        meetChapterNo: chapterNo
      };
      // Pack 2 Phase 2：確保 byId 有 baseline（不偷 active 羈絆）。
      ensureCompanionRelationshipInDraft(draft, companionId, now);
      if (!draft.resonance.chapterMarks[chapterNo]) {
        const snap = buildRelationshipChapterMarkSnapshot(draft, companionId, now);
        draft.resonance.chapterMarks[chapterNo] = {
          ...snap,
          resolvedCompanionId: companionId,
          encounterResolvedAt: now
        };
      } else {
        draft.resonance.chapterMarks[chapterNo] = {
          ...draft.resonance.chapterMarks[chapterNo],
          resolvedCompanionId: companionId,
          encounterResolvedAt: now
        };
      }
    });

    const companion = getCompanionById(companionId);
    const meetLines = buildResolvedMeetLines(chapterNo, companion, resolution.usedAlternate);
    ringBurst(node.id);
    showToast({
      title: `相遇 ・ ${companion?.name || "心核夥伴"}`,
      text: meetLines.join("\n"),
      tone: "calm"
    });
    if (statusText) statusText.textContent = "相遇";
    render();
    renderInviteBanner();
    saveCurrentState?.();
    return true;
  }

  function buildResolvedMeetLines(chapterNo, companion, usedAlternate) {
    if (!usedAlternate) {
      const narrative = getChapterNarrative(chapterNo);
      const meetLines = Array.isArray(narrative?.meetLines) ? narrative.meetLines : null;
      if (meetLines?.length) return meetLines;
    }
    const name = companion?.name || "心核夥伴";
    return [
      `這片土地上，${name}第一次停下來看你們。`,
      "沒有急著靠近，也沒有逃走。",
      `${name}：「……你們的腳步聲，我聽得見。」`
    ];
  }

  // ---- 共鳴邀請橫幅（CH-5b）：通關且已相遇→「牠在附近。去打個招呼」 ----
  // 動態建立、插在地圖畫布上方（不動 index.html 結構，§5.1）。無紅點、無倒數（紅線 6）。
  function ensureInviteBanner() {
    if (inviteBanner || !mapCanvas || !mapCanvas.parentNode) return;
    inviteBanner = document.createElement("div");
    inviteBanner.className = "map-invite-banner";
    inviteBanner.hidden = true;
    inviteBanner.innerHTML = `
      <p class="map-invite-text"></p>
      <button type="button" class="map-invite-btn"></button>
    `;
    mapCanvas.parentNode.insertBefore(inviteBanner, mapCanvas);
    inviteBanner.querySelector(".map-invite-btn").addEventListener("click", () => {
      const chapterNo = Number(inviteBanner.dataset.chapter);
      if (chapterNo) handleResonanceInvite(chapterNo);
    });
  }

  function renderInviteBanner() {
    ensureInviteBanner();
    if (!inviteBanner) return;
    const askable = listAskableChapters(store.getState());
    if (askable.length === 0) {
      inviteBanner.hidden = true;
      delete inviteBanner.dataset.chapter;
      return;
    }
    const chapterNo = askable[0];
    const ask = canAskResonance(store.getState(), chapterNo);
    const companion = getCompanionById(ask.companionId || getChapterByNumber(chapterNo)?.companionId);
    inviteBanner.dataset.chapter = String(chapterNo);
    inviteBanner.querySelector(".map-invite-text").textContent = `${companion?.name || "牠"}在附近。`;
    inviteBanner.querySelector(".map-invite-btn").textContent = "去打個招呼";
    inviteBanner.hidden = false;
  }

  function handleResonanceInvite(chapterNo) {
    const state = store.getState();
    if (!canAskResonance(state, chapterNo).eligible) {
      renderInviteBanner();
      return;
    }
    const result = evaluateResonanceInvite(state, chapterNo);
    if (!result) return;
    const now = Date.now();
    const companion = getCompanionById(result.companionId);

    if (result.willing) {
      store.updateState((draft) => {
        if (!draft.unlockedCompanionIds.includes(result.companionId)) {
          draft.unlockedCompanionIds = [...draft.unlockedCompanionIds, result.companionId];
        }
        const entry = draft.resonance.companions[result.companionId] || {};
        draft.resonance.companions[result.companionId] = { ...entry, joinedAt: now, lastAskAt: now };
      });
      showToast({
        title: `共鳴 ・ ${companion?.name || "心核夥伴"}`,
        text: result.line,
        tone: "success",
        chips: [{ kind: "bond", label: "＋ 共鳴圈多了一位同行者" }]
      });
    } else {
      // 拒絕＝rolling window：從現在重新快照，之後的培養重新累積（永遠可再問，紅線 2 精神）。
      store.updateState((draft) => {
        const entry = draft.resonance.companions[result.companionId] || {};
        draft.resonance.companions[result.companionId] = {
          ...entry,
          lastAskAt: now,
          declinedCount: (Number(entry.declinedCount) || 0) + 1
        };
        const prev = draft.resonance.chapterMarks[chapterNo] || {};
        const snap = buildRelationshipChapterMarkSnapshot(draft, result.companionId, now);
        draft.resonance.chapterMarks[chapterNo] = {
          ...snap,
          enteredAt: Number(prev.enteredAt) || now,
          reaskedAt: now
        };
      });
      showToast({
        title: companion?.name || "牠",
        text: result.line,
        tone: "calm"
      });
    }
    saveCurrentState?.();
    renderInviteBanner();
  }

  return { open, render };
}
