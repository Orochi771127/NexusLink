import { getCompanionById } from "../data/companionRegistry.js";
import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { getRegionLootTable, getShardType } from "../data/lootTables.js";
import {
  canLaunchExpedition,
  EXPEDITION_LAUNCH_NODE_ID,
  isExpeditionUnlocked,
  listUnlockedExpeditionNodes
} from "../expedition/expeditionConfig.js";
import { createExpeditionEngine } from "../expedition/expeditionEngine.js";
import { buildExpeditionSettlement } from "../expedition/expeditionPersistence.js";
import { createExpeditionSession, summarizeExpeditionSession } from "../expedition/expeditionState.js";
import { getLivingEnemies } from "../expedition/encounterDirector.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import {
  applyCameraToRoot,
  createExpeditionCamera,
  resizeExpeditionCamera,
  updateExpeditionCamera
} from "../pixi/expeditionCamera.js";
import {
  createExpeditionScene,
  destroyExpeditionScene,
  syncExpeditionScene
} from "../pixi/expeditionScene.js";

/**
 * 心域遠征 UI + 生命週期（Phase C/D：戰鬥、掉落、戰術、冒險日誌）。
 */
export function createExpeditionController({
  store,
  panelManager,
  statusText,
  saveCurrentState,
  getSceneBridge,
  soulTalkController
}) {
  let active = false;
  let session = null;
  let engine = null;
  let sceneRoot = null;
  let camera = null;
  let overlayEl = null;
  let mapLaunchContainer = null;

  function bind() {
    ensureOverlay();
  }

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement("div");
    overlayEl.className = "expedition-overlay";
    overlayEl.innerHTML = `
      <div class="expedition-hud-top">
        <p class="expedition-kicker">心域遠征 ・ Nexus Expedition</p>
        <h2 class="expedition-region-title"></h2>
        <p class="expedition-region-copy"></p>
        <div class="expedition-hud-meta">
          <span class="expedition-companion"></span>
          <span class="expedition-vitals"></span>
          <span class="expedition-loot"></span>
        </div>
      </div>
      <div class="expedition-hud-bottom">
        <div class="expedition-intent-bar">
          <span class="expedition-intent-text"></span>
          <em class="expedition-intent-debug"></em>
        </div>
        <div class="expedition-tactics" role="group" aria-label="戰術指令">
          <button type="button" data-tactic="conservative">保守</button>
          <button type="button" data-tactic="balanced" class="is-active">平衡</button>
          <button type="button" data-tactic="aggressive">積極</button>
          <button type="button" data-tactic="focus">集火</button>
        </div>
        <div class="expedition-actions">
          <button type="button" class="expedition-extract-btn" hidden>完成遠征 · 返回棲地</button>
          <button type="button" class="expedition-retreat-btn">撤退 · 返回棲地</button>
        </div>
      </div>
    `;

    overlayEl.querySelector(".expedition-retreat-btn").addEventListener("click", () => {
      if (!session) return;
      session.playerRetreatRequested = true;
      session.playerInterventions = (session.playerInterventions || 0) + 1;
      session.phase = "retreating";
    });

    overlayEl.querySelector(".expedition-extract-btn").addEventListener("click", () => {
      finishExpedition({ retreated: false, extracted: true });
    });

    overlayEl.querySelectorAll("[data-tactic]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!session) return;
        const tactic = btn.dataset.tactic;
        session.playerInterventions = (session.playerInterventions || 0) + 1;

        if (tactic === "focus") {
          const enemy = getLivingEnemies(session)[0];
          session.playerFocusTargetId = enemy?.id || null;
          session.playerTactics = session.playerTactics || "balanced";
        } else {
          session.playerTactics = tactic;
          session.playerFocusTargetId = null;
        }

        overlayEl.querySelectorAll("[data-tactic]").forEach((b) => {
          b.classList.toggle("is-active", b.dataset.tactic === tactic);
        });
      });
    });

    document.body.appendChild(overlayEl);
    return overlayEl;
  }

  function ensureMapLaunchContainer(mapModal) {
    if (mapLaunchContainer || !mapModal) return;
    mapLaunchContainer = document.createElement("div");
    mapLaunchContainer.className = "map-expedition-launch-list";
    mapLaunchContainer.addEventListener("click", (event) => {
      const button = event.target.closest("[data-expedition-node]");
      if (!button || button.disabled) return;
      const nodeId = button.dataset.expeditionNode;
      if (!canLaunchExpedition(store.getState(), nodeId)) return;
      start({ nodeId });
    });
    mapModal.appendChild(mapLaunchContainer);
  }

  function renderMapLaunch(mapModal) {
    ensureMapLaunchContainer(mapModal);
    if (!mapLaunchContainer) return;
    const state = store.getState();
    const unlocked = isExpeditionUnlocked(state);
    mapLaunchContainer.hidden = !unlocked;
    if (!unlocked) return;

    const nodes = listUnlockedExpeditionNodes(state);
    mapLaunchContainer.innerHTML = nodes.map((nodeId) => {
      const region = getExpeditionRegionByNodeId(nodeId);
      const canLaunch = canLaunchExpedition(state, nodeId);
      const primaryShard = getRegionLootTable(nodeId).primaryShard;
      const shardHint = getShardType(primaryShard).label.zh;
      const sub = canLaunch
        ? `俯視黏土地景 · 自主索敵、接戰、拾取${shardHint}`
        : (state.energy ?? 0) <= 0
          ? "夥伴能量不足，請先回營地休息"
          : "尚未解鎖此區域";
      return `
        <button type="button" class="map-expedition-launch" data-expedition-node="${nodeId}" ${canLaunch ? "" : "disabled"}>
          <strong>心域遠征 · ${region?.label?.zh || nodeId}</strong>
          <em>${sub}</em>
        </button>
      `;
    }).join("");
  }

  function start({ nodeId = EXPEDITION_LAUNCH_NODE_ID } = {}) {
    const state = store.getState();
    if (!canLaunchExpedition(state, nodeId)) return false;

    const bridge = getSceneBridge?.();
    if (!bridge?.PIXI || !bridge.mountExpedition) return false;

    const companion = getCompanionById(state.activeCompanionId);
    session = createExpeditionSession({
      nodeId,
      companionId: companion?.id || state.activeCompanionId,
      companionName: companion?.name || "夥伴",
      state
    });
    if (!session) return false;

    engine = createExpeditionEngine(session);
    const region = engine.region;
    const view = bridge.getViewSize();
    camera = createExpeditionCamera(view.width, view.height);

    sceneRoot = createExpeditionScene(bridge.PIXI, region, session);
    bridge.mountExpedition(sceneRoot);

    active = true;
    panelManager.closePanel({ force: true });
    document.body.classList.add("expedition-active");
    ensureOverlay();
    renderHud();
    if (statusText) statusText.textContent = "心域遠征進行中…";
    return true;
  }

  function finishExpedition({ retreated = false, extracted = false } = {}) {
    if (!active || !session) return;

    const stateBefore = store.getState();
    const settlement = buildExpeditionSettlement(
      session,
      { retreated: retreated || Boolean(session.playerRetreatRequested) },
      stateBefore.expeditionVault
    );
    const summary = summarizeExpeditionSession(session);
    const bridge = getSceneBridge?.();

    store.updateState((draft) => {
      const patch = settlement.statePatch || {};
      if (typeof patch.energy === "number") draft.energy = patch.energy;
      if (typeof patch.bond === "number") draft.bond = patch.bond;
      if (typeof patch.trust === "number") draft.trust = patch.trust;
      draft.expeditionVault = settlement.vaultPatch;
      const progress = draft.explorationProgress || { totalExplorations: 0, visitCounts: {} };
      draft.explorationProgress = {
        ...progress,
        lastNodeId: session.nodeId || progress.lastNodeId
      };
      (settlement.memoryObjects || []).forEach((memoryObject) => {
        draft.emotionalMemories.push(memoryObject);
        draft.lastEmotionTag = memoryObject.emotion;
        const trace = createHabitatTraceFromMemory(memoryObject, Date.now());
        if (trace) {
          draft.habitatTraces = pruneHabitatTraces(
            upsertHabitatTrace(draft.habitatTraces || [], trace)
          );
        }
      });
    });

    if (settlement.journal && soulTalkController) {
      soulTalkController.addChat("companion", settlement.journal);
      soulTalkController.renderChat();
    }

    teardownScene(bridge);
    active = false;
    session = null;
    engine = null;
    document.body.classList.remove("expedition-active");
    const vaultShards = settlement.vaultPatch?.shards || {};
    const shardSummary = Object.entries(vaultShards)
      .filter(([, count]) => Number(count) > 0)
      .map(([shardId, count]) => `${getShardType(shardId).label.zh} ${count}`)
      .join(" · ");
    const extractNote = extracted ? "遠征完成。" : "";
    if (statusText) {
      statusText.textContent = `${extractNote}${summary.message}${shardSummary ? `（庫存 ${shardSummary}）` : ""}`;
    }
    saveCurrentState?.();
  }

  function teardownScene(bridge) {
    if (sceneRoot) {
      destroyExpeditionScene(sceneRoot);
      sceneRoot = null;
    }
    bridge?.unmountExpedition?.();
    camera = null;
  }

  function renderHud() {
    if (!overlayEl || !session) return;
    const region = getExpeditionRegionByNodeId(session.nodeId);
    const primaryShard = getRegionLootTable(session.regionId || session.nodeId).primaryShard;
    const shardLabel = getShardType(primaryShard).label.zh;
    const lootCount = session.lootCollected?.[primaryShard] || 0;
    const hpPct = Math.round((session.companion.hp / session.companion.hpMax) * 100);

    overlayEl.querySelector(".expedition-region-title").textContent =
      `${region?.label?.zh || "風歇草坡"} · ${region?.regionLabel?.zh || "北部翠綠平原"}`;
    overlayEl.querySelector(".expedition-region-copy").textContent =
      "微縮黏土樹脂地景 · 夥伴自主探索與遭遇";
    overlayEl.querySelector(".expedition-companion").textContent =
      `夥伴：${session.companionName}`;
    overlayEl.querySelector(".expedition-vitals").textContent =
      `穩定 ${hpPct}% · Energy ${session.relationship.energy}/10 · ${session.playerTactics || "balanced"}`;
    overlayEl.querySelector(".expedition-loot").textContent =
      lootCount > 0 ? `${shardLabel} ×${lootCount}` : "尚未拾取碎晶";

    const intent = session.lastIntent || {};
    overlayEl.querySelector(".expedition-intent-text").textContent =
      intent.reason || "牠正在觀察周圍。";
    overlayEl.querySelector(".expedition-intent-debug").textContent =
      `[${intent.type || "—"}] target=${intent.targetId || "—"} · conf=${(intent.confidence ?? 0).toFixed(2)} · kills=${session.stats?.kills || 0} · enemies=${getLivingEnemies(session).length}`;

    const extractBtn = overlayEl.querySelector(".expedition-extract-btn");
    if (extractBtn) {
      extractBtn.hidden = session.phase !== "extract_ready";
    }
  }

  function update(ticker) {
    if (!active || !engine || !session || !sceneRoot || !camera) return;

    const bridge = getSceneBridge?.();
    const view = bridge?.getViewSize?.();
    if (view) resizeExpeditionCamera(camera, view.width, view.height);

    engine.tick(ticker.deltaMS, Date.now());
    syncExpeditionScene(sceneRoot, session, ticker.deltaMS);
    updateExpeditionCamera(
      camera,
      session.companion.x,
      session.companion.y,
      session.worldWidth,
      session.worldHeight,
      ticker.deltaMS / 1000
    );
    applyCameraToRoot(sceneRoot, camera);
    renderHud();

    if (session.phase === "complete") {
      finishExpedition({ retreated: Boolean(session.playerRetreatRequested) });
    }
  }

  function isActive() {
    return active;
  }

  return {
    bind,
    start,
    finishExpedition,
    update,
    isActive,
    renderMapLaunch
  };
}
