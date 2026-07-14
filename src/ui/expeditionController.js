import { getCompanionById } from "../data/companionRegistry.js";
import { getExpeditionRegionByNodeId } from "../data/expeditionRegions.js";
import { getRegionLootTable, getShardType } from "../data/lootTables.js";
import { hasAdventureProfile } from "../data/companionAdventureProfiles.js";
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
import { narrateTacticAck } from "../expedition/intentNarration.js";
import {
  buildExpeditionSettlementVoice,
  publishExpeditionSettlementVoice
} from "../expedition/expeditionSettlementVoice.js";
import { prepareExpeditionCoreSettlement } from "../expedition/expeditionCoreBridge.js";
import { heartOnCoerciveIntervention, heartOnGentleTactic } from "../expedition/sessionHeart.js";

const TACTIC_LABELS = Object.freeze({
  conservative: "保守",
  balanced: "平衡",
  aggressive: "積極",
  focus: "集火"
});

/** RE-1 E-COERCE：只有施壓型戰術累加介入壓力。 */
const COERCIVE_TACTICS = new Set(["aggressive", "focus"]);
const TACTIC_ACK_HOLD_MS = 1400;

/**
 * 心域遠征 UI + 生命週期（Phase C/D + 4A 審查優化）。
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

  function pickFocusEnemy(currentSession) {
    const living = getLivingEnemies(currentSession);
    if (!living.length) return null;
    // 集火：優先最近的敵人，比固定取 [0] 更像「指眼前那個」。
    const cx = currentSession.companion.x;
    const cy = currentSession.companion.y;
    return [...living].sort((a, b) => {
      const da = Math.hypot(a.x - cx, a.y - cy);
      const db = Math.hypot(b.x - cx, b.y - cy);
      return da - db;
    })[0];
  }

  function syncTacticButtons(activeTactic = "balanced") {
    if (!overlayEl) return;
    overlayEl.querySelectorAll("[data-tactic]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.tactic === activeTactic);
    });
  }

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
          <button type="button" class="expedition-retreat-btn">返回棲地</button>
        </div>
      </div>
    `;

    // RE-1 E-EXIT：返回棲地＝安全出口，永遠成功、不計 coercive 介入。
    overlayEl.querySelector(".expedition-retreat-btn").addEventListener("click", () => {
      if (!session) return;
      session.playerRetreatRequested = true;
      session.returnHomeRequested = true;
      session.phase = "retreating";
      session.lastIntent = {
        type: "RETREAT",
        reason: "你決定先回棲地。牠跟著轉向入口。",
        confidence: 1
      };
    });

    overlayEl.querySelector(".expedition-extract-btn").addEventListener("click", () => {
      finishExpedition({ retreated: false, extracted: true });
    });

    overlayEl.querySelectorAll("[data-tactic]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!session) return;
        const tactic = btn.dataset.tactic;

        if (COERCIVE_TACTICS.has(tactic)) {
          heartOnCoerciveIntervention(session);
        } else {
          heartOnGentleTactic(session);
        }

        if (tactic === "focus") {
          const enemy = pickFocusEnemy(session);
          session.playerFocusTargetId = enemy?.id || null;
          if (!session.playerTactics || session.playerTactics === "focus") {
            session.playerTactics = "balanced";
          }
          session.lastIntent = {
            type: "IDLE",
            reason: narrateTacticAck("focus", {
              hasFocusTarget: Boolean(enemy),
              brainTicks: session.debug?.brainTicks || 0
            }),
            confidence: 0.9
          };
        } else {
          session.playerTactics = tactic;
          session.playerFocusTargetId = null;
          session.lastIntent = {
            type: "IDLE",
            reason: narrateTacticAck(tactic, {
              brainTicks: session.debug?.brainTicks || 0
            }),
            confidence: 0.9
          };
        }

        session.memoryHoldUntil = Date.now() + TACTIC_ACK_HOLD_MS;
        syncTacticButtons(tactic);
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
          : !hasAdventureProfile(state.activeCompanionId)
            ? "這位夥伴的遠征習性尚未寫入"
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
    syncTacticButtons("balanced");
    renderHud();
    if (statusText) statusText.textContent = `心域遠征・${region?.label?.zh || "進行中"}…`;
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

    // Core 橋：輕量記憶政策 + reflection composer 接點（尚未完整 intent/critic）。
    const corePrep = prepareExpeditionCoreSettlement(session, settlement, {
      state: stateBefore,
      companion: getCompanionById(session.companionId)
    });

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
      // 不再無腦直寫 settlement.memoryObjects；只寫入通過 lite policy 的記憶。
      // TODO(RE-3): 改接正式 memoryWriter／sedimentation（需 expedition gateway）。
      (corePrep.memoryObjects || []).forEach((memoryObject) => {
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

    // RE-2 E-CORE：系統事實 → system；夥伴第一人稱感受 → companion（經 adapter）。
    // 禁止再把第三人稱 journal 直接當 companion 發言。
    if (soulTalkController) {
      const voice = buildExpeditionSettlementVoice(session, settlement, {
        composeReflection: corePrep.composeReflection,
        bridgeStatus: corePrep.bridgeStatus,
        reflectionPathNote: corePrep.reflectionPathNote
      });
      publishExpeditionSettlementVoice(soulTalkController, voice);
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
    const tacticKey = session.playerFocusTargetId
      ? "focus"
      : (session.playerTactics || "balanced");
    const tacticLabel = TACTIC_LABELS[tacticKey] || TACTIC_LABELS.balanced;

    overlayEl.querySelector(".expedition-region-title").textContent =
      `${region?.label?.zh || "遠征區"} · ${region?.regionLabel?.zh || ""}`.replace(/\s·\s$/, "");
    overlayEl.querySelector(".expedition-region-copy").textContent =
      region?.hudCopy || "讓牠自己決定走多遠。";
    overlayEl.querySelector(".expedition-companion").textContent =
      `夥伴：${session.companionName}`;
    overlayEl.querySelector(".expedition-vitals").textContent =
      `穩定 ${hpPct}% · 能量 ${session.relationship.energy}/10 · ${tacticLabel}`;
    overlayEl.querySelector(".expedition-loot").textContent =
      lootCount > 0 ? `${shardLabel} ×${lootCount}` : "尚未拾取碎晶";

    const intent = session.lastIntent || {};
    const holdingMemory = Boolean(session.memoryHoldUntil && Date.now() < session.memoryHoldUntil);
    overlayEl.querySelector(".expedition-intent-text").textContent =
      intent.reason || "牠正在觀察周圍。";
    overlayEl.querySelector(".expedition-intent-text").classList.toggle("is-memory", holdingMemory);

    // 除錯列預設隱藏；需要時在 body 加 data-expedition-debug="1"
    const debugEl = overlayEl.querySelector(".expedition-intent-debug");
    if (debugEl) {
      debugEl.textContent =
        `[${intent.type || "—"}] target=${intent.targetId || "—"} · conf=${(intent.confidence ?? 0).toFixed(2)} · kills=${session.stats?.kills || 0} · enemies=${getLivingEnemies(session).length}`;
    }

    const extractBtn = overlayEl.querySelector(".expedition-extract-btn");
    if (extractBtn) {
      extractBtn.hidden = session.phase !== "extract_ready";
      if (session.phase === "extract_ready") {
        const peaceful = (session.stats?.kills || 0) < 1;
        extractBtn.textContent = peaceful
          ? "完成巡視 · 返回棲地"
          : "完成遠征 · 返回棲地";
      }
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
