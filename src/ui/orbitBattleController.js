/**
 * 心核迴旋戰 UI（R1–R5）
 *
 * - 動態 overlay，不改 index.html
 * - R2 路徑節點；R3 對決；R4 通關寫微光＋exploration evidence
 * - R5：四語 chrome、基本無障礙、手感常數對齊
 * - 對決勝發獎；安全港／重複通關＝零 evidence
 */

import { getCompanionById } from "../data/companionRegistry.js";
import {
  getOrbitStageById,
  getOrbitPathLabel,
  MOONLAKE_CAMP_SLICE
} from "../data/orbit/stages/index.js";
import { LANGUAGE_CHANGED_EVENT, t } from "../i18n/i18n.js";
import {
  createOrbitSession,
  launchOrbitSession,
  retreatOrbitSession,
  selectOrbitLaunchStance,
  triggerOrbitResonancePulse,
  stepOrbitSession
} from "../orbit/orbitEngine.js";
import {
  HYBRID_SPIN_PHASES,
  ORBIT_PHYSICS_MODELS
} from "../orbit/orbitPhysics.js";
import {
  consumeJustUnlockedRegion,
  isOrbitStageCleared,
  recordOrbitStageClear
} from "../orbit/orbitPathProgress.js";
import {
  applyOrbitEntryAttunement,
  describeOrbitEntryFromVault,
  planOrbitStageSettlement
} from "../orbit/orbitSettlement.js";
import {
  projectOrbitCombatStats,
  recentEvidenceFromState,
  vitalsFromState
} from "../orbit/orbitStatsProjector.js";
import EventBus from "../utils/eventBus.js";
import { createOrbitMapController } from "./orbitMapController.js";
import { createOrbitDuelController } from "./orbitDuelController.js";

function formatOrbitStatsLine(stats) {
  return [
    `${t("orbit.statImpact")} ${stats.impact}`,
    `${t("orbit.statSpin")} ${stats.spin}`,
    `${t("orbit.statGuard")} ${stats.guard}`,
    `${t("orbit.statBurst")} ${stats.burst}`,
    `${t("orbit.statOverheat")} ${stats.overheat}`
  ].join(" · ");
}

function isOrbitSandboxEnabled() {
  if (
    typeof globalThis.location?.search !== "string" ||
    typeof globalThis.URLSearchParams !== "function"
  ) {
    return false;
  }
  return new globalThis.URLSearchParams(globalThis.location.search)
    .get("orbitSandbox") === "1";
}

function isMoonlakeCampSliceEnabled() {
  if (
    typeof globalThis.location?.search !== "string" ||
    typeof globalThis.URLSearchParams !== "function"
  ) {
    return false;
  }
  return new globalThis.URLSearchParams(globalThis.location.search)
    .get("orbitCampSlice") === "1";
}

export function createOrbitBattleController({
  store,
  statusText,
  panelManager,
  companionGrowthController,
  saveCurrentState
}) {
  let overlayEl = null;
  let canvas = null;
  let ctx = null;
  let session = null;
  let rafId = 0;
  let lastTs = 0;
  let dragging = false;
  let pullStart = null;
  let pullNow = null;
  let active = false;
  let view = "map"; // map | battle | duel
  let currentStageId = null;

  const mapController = createOrbitMapController({
    onSelectStage: (stageId) => openStage(stageId),
    onOpenDuel: () => openDuel(),
    onClose: () => close(),
    statusText,
    getVault: () => store.getState()?.expeditionVault
  });

  const duelController = createOrbitDuelController({
    store,
    statusText,
    onBack: () => showMap(),
    onCloseAll: () => close()
  });

  function bind() {
    ensureOverlay();
  }

  function applyBattleChrome() {
    if (!overlayEl) return;
    overlayEl.setAttribute("aria-label", t("orbit.dialogLabel"));
    const kicker = overlayEl.querySelector(".orbit-battle .orbit-kicker");
    const hint = overlayEl.querySelector(".orbit-battle .orbit-hint");
    const retreatBtn = overlayEl.querySelector('[data-orbit-action="retreat"]');
    const toMapBtn = overlayEl.querySelector('[data-orbit-action="to-map"]');
    const againBtn = overlayEl.querySelector('[data-orbit-action="again"]');
    if (kicker) kicker.textContent = t("orbit.kicker");
    if (hint) hint.textContent = t("orbit.hint");
    if (retreatBtn) {
      retreatBtn.textContent = t("orbit.retreat");
      retreatBtn.setAttribute("aria-label", t("orbit.retreat"));
    }
    if (toMapBtn) toMapBtn.textContent = t("orbit.toMap");
    if (againBtn) againBtn.textContent = t("orbit.again");
    if (canvas) canvas.setAttribute("aria-label", t("orbit.canvasLabel"));
  }

  function focusPrimaryAction() {
    if (!overlayEl) return;
    const candidates = [
      overlayEl.querySelector('.orbit-map [data-orbit-map="close"]:not([hidden])'),
      overlayEl.querySelector('[data-orbit-action="retreat"]:not([hidden])'),
      overlayEl.querySelector('[data-orbit-action="to-map"]:not([hidden])'),
      overlayEl.querySelector('.orbit-duel [data-duel-ui="back"]:not([hidden])')
    ];
    const target = candidates.find((el) => el && !el.hidden);
    target?.focus?.({ preventScroll: true });
  }

  function ensureOverlay() {
    if (overlayEl) return overlayEl;
    overlayEl = document.createElement("div");
    overlayEl.className = "orbit-overlay";
    overlayEl.setAttribute("role", "dialog");
    overlayEl.setAttribute("aria-modal", "true");
    overlayEl.setAttribute("aria-label", t("orbit.dialogLabel"));
    overlayEl.innerHTML = `
      <div class="orbit-map-slot"></div>
      <div class="orbit-duel-slot"></div>
      <div class="orbit-battle" hidden>
        <div class="orbit-hud-top">
          <div class="orbit-battle-toolbar">
            <button type="button" class="orbit-btn orbit-btn--ghost orbit-back-btn" data-orbit-action="retreat"></button>
            <div class="orbit-battle-heading">
              <p class="orbit-kicker"></p>
              <h2 class="orbit-title" id="orbit-battle-title"></h2>
            </div>
          </div>
          <p class="orbit-copy"></p>
          <div class="orbit-stats" aria-live="polite"></div>
          <div class="orbit-control-depth" data-orbit-control-depth hidden>
            <div class="orbit-stance-picker" role="group" aria-label="發射姿態"></div>
            <button
              type="button"
              class="orbit-pulse-btn"
              data-orbit-action="pulse"
              disabled
            >共鳴脈衝・發射後可用</button>
          </div>
          <p class="orbit-hint"></p>
        </div>
        <div class="orbit-stage">
          <canvas class="orbit-canvas" width="390" height="420" tabindex="0" aria-label=""></canvas>
        </div>
        <div class="orbit-hud-bottom">
          <p class="orbit-status" aria-live="polite"></p>
          <p class="orbit-companion-line" hidden></p>
          <div class="orbit-actions">
            <button type="button" class="orbit-btn" data-orbit-action="to-map" hidden></button>
            <button type="button" class="orbit-btn" data-orbit-action="again" hidden></button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlayEl);
    overlayEl.setAttribute("aria-labelledby", "orbit-battle-title");
    mapController.mount(overlayEl.querySelector(".orbit-map-slot"));
    duelController.mount(overlayEl.querySelector(".orbit-duel-slot"));

    canvas = overlayEl.querySelector(".orbit-canvas");
    ctx = canvas.getContext("2d");
    applyBattleChrome();

    overlayEl.addEventListener("click", (event) => {
      const stanceBtn = event.target.closest("[data-orbit-stance]");
      if (stanceBtn) {
        chooseLaunchStance(stanceBtn.dataset.orbitStance);
        return;
      }
      const btn = event.target.closest("[data-orbit-action]");
      if (!btn) return;
      const action = btn.dataset.orbitAction;
      if (action === "retreat") retreat();
      else if (action === "to-map") showMap();
      else if (action === "again" && currentStageId) openStage(currentStageId);
      else if (action === "pulse") activateResonancePulse();
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    document.addEventListener("keydown", (event) => {
      if (!active) return;
      if (view === "duel") return; // 對決 UI 自己處理 Esc
      if (event.key === "Escape") {
        event.preventDefault();
        if (view === "map") close();
        else if (session?.phase === "resolved") showMap();
        else retreat();
      }
    });

    EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
      if (!overlayEl) return;
      applyBattleChrome();
      mapController.applyChrome?.();
      duelController.applyChrome?.();
      if (active && view === "map") mapController.render();
    });

    return overlayEl;
  }

  function showMap() {
    ensureOverlay();
    stopLoop();
    session = null;
    dragging = false;
    renderControlDepth();
    view = "map";
    overlayEl.querySelector(".orbit-battle").hidden = true;
    duelController.hide();
    mapController.show();
    const unlocked = consumeJustUnlockedRegion();
    if (unlocked && statusText) {
      statusText.textContent = t("orbit.pathLit").replace("{path}", getOrbitPathLabel(unlocked));
    }
    mapController.render();
    focusPrimaryAction();
  }

  function openDuel() {
    ensureOverlay();
    stopLoop();
    session = null;
    renderControlDepth();
    view = "duel";
    mapController.hide();
    overlayEl.querySelector(".orbit-battle").hidden = true;
    duelController.open();
  }

  function open() {
    ensureOverlay();
    applyBattleChrome();
    panelManager?.closePanel?.({ reason: "orbit-open" });
    document.body.classList.add("orbit-active");
    active = true;
    if (isMoonlakeCampSliceEnabled()) {
      openStage(MOONLAKE_CAMP_SLICE.id);
      if (statusText) {
        statusText.textContent = "進入月湖營火共鳴切片；本次不寫入進度。";
      }
      focusPrimaryAction();
      return;
    }
    if (isOrbitSandboxEnabled()) {
      openStage("moonlake-1");
      if (statusText) {
        statusText.textContent = "進入 Hybrid Spin 物理沙盒；本次不寫入進度。";
      }
      focusPrimaryAction();
      return;
    }
    showMap();
    if (statusText) {
      const state = store.getState();
      const companion = getCompanionById(state.activeCompanionId);
      const name = companion?.name?.zh || companion?.name || "夥伴";
      statusText.textContent = t("orbit.mapLooking").replace("{name}", name);
    }
    focusPrimaryAction();
  }

  function openStage(stageId) {
    const stage = getOrbitStageById(stageId);
    if (!stage) return;
    const sandboxEnabled = isOrbitSandboxEnabled();
    const campSliceEnabled = stage.id === MOONLAKE_CAMP_SLICE.id;
    const hybridEnabled = sandboxEnabled || campSliceEnabled;

    ensureOverlay();
    currentStageId = stageId;
    view = "battle";
    mapController.hide();
    duelController.hide();
    overlayEl.querySelector(".orbit-battle").hidden = false;

    const state = store.getState();
    const baseStats = projectOrbitCombatStats(
      vitalsFromState(state),
      recentEvidenceFromState(state)
    );
    // 遠征→微光→進場：有 vault 微光時略增 Burst（非永久 ATK）
    const entry = describeOrbitEntryFromVault(state.expeditionVault, stage.regionId);
    const stats = applyOrbitEntryAttunement(baseStats, entry);

    const pathLabel = getOrbitPathLabel(stage.regionId);
    applyBattleChrome();
    overlayEl.querySelector(".orbit-title").textContent =
      campSliceEnabled
        ? `心核迴旋・${stage.title}`
        : sandboxEnabled
        ? `Hybrid Spin 物理沙盒・${stage.title}`
        : `${pathLabel}・${stage.title}`;
    overlayEl.querySelector(".orbit-copy").textContent =
      campSliceEnabled
        ? `${stage.copy}　目標：${stage.goalLabel}`
        : sandboxEnabled
        ? "既有 Orbit 管線的隱藏物理測試；觀察 tilt／wobble／phase，不寫入任何進度。"
        : `${stage.copy}　${t("orbit.goalPrefix")}：${stage.goalLabel}`;
    overlayEl.querySelector(".orbit-stats").textContent =
      campSliceEnabled
        ? "先選姿態，再拉曳發射；途中只有一次共鳴脈衝"
        : formatOrbitStatsLine(stats);
    overlayEl.querySelector(".orbit-battle .orbit-companion-line").hidden = true;
    overlayEl.querySelector(".orbit-battle .orbit-companion-line").textContent = "";
    setActionVisibility({ retreat: true, toMap: false, again: false });

    if (!stats.canLaunch) {
      session = null;
      renderControlDepth();
      overlayEl.querySelector(".orbit-battle .orbit-status").textContent =
        stats.refuseReason || "現在不宜出場。";
      setActionVisibility({ retreat: false, toMap: true, again: false });
      drawIdleRefuse(stats.refuseReason);
      if (statusText) statusText.textContent = t("orbit.refused");
      focusPrimaryAction();
      return;
    }

    session = createOrbitSession({
      stats,
      stage,
      personaBias: "comfort",
      physicsModel: hybridEnabled
        ? ORBIT_PHYSICS_MODELS.hybridSpin
        : ORBIT_PHYSICS_MODELS.baseline,
      sandbox: sandboxEnabled && !campSliceEnabled,
      prototypeSlice: campSliceEnabled,
      nonPersistent: campSliceEnabled
    });
    renderControlDepth();
    overlayEl.querySelector(".orbit-battle .orbit-status").textContent =
      campSliceEnabled
        ? "選直立／傾斜／保守，再沿虛線點亮 1 → 2 → 3；脈衝只能在發射後使用一次。"
        : sandboxEnabled
        ? "拉曳發射後，觀察 launch → stable → curving → wobbling。沙盒結果不保存。"
        : `${entry.line}　${stats.label}　${stage.goalLabel}`;
    dragging = false;
    pullStart = null;
    pullNow = null;
    resizeCanvas();
    startLoop();
    if (statusText) {
      statusText.textContent = campSliceEnabled
        ? "進入月湖營火共鳴切片；本次不寫入進度。"
        : sandboxEnabled
        ? "進入 Hybrid Spin 物理沙盒；本次不寫入進度。"
        : entry.hasMote
          ? `帶著遠征微光進入${pathLabel}・${stage.title}`
          : `進入${pathLabel}・${stage.title}`;
    }
    focusPrimaryAction();
  }

  function close() {
    stopLoop();
    active = false;
    session = null;
    dragging = false;
    renderControlDepth();
    view = "map";
    mapController.hide();
    duelController.hide();
    if (overlayEl) {
      const battle = overlayEl.querySelector(".orbit-battle");
      if (battle) battle.hidden = true;
    }
    document.body.classList.remove("orbit-active");
    if (statusText) statusText.textContent = "你們離開了迴旋軌道。";
  }

  function retreat() {
    if (!session || session.phase === "resolved") {
      showMap();
      return;
    }
    session = retreatOrbitSession(session);
    showResolved();
  }

  function setActionVisibility({ retreat, toMap, again }) {
    const retreatBtn = overlayEl.querySelector('[data-orbit-action="retreat"]');
    const mapBtn = overlayEl.querySelector('[data-orbit-action="to-map"]');
    const againBtn = overlayEl.querySelector('[data-orbit-action="again"]');
    if (retreatBtn) retreatBtn.hidden = !retreat;
    if (mapBtn) mapBtn.hidden = !toMap;
    if (againBtn) againBtn.hidden = !again;
  }

  function selectedLaunchStance() {
    return session?.launchStances?.find(
      (stance) => stance.id === session.launchStanceId
    ) || null;
  }

  function renderControlDepth() {
    if (!overlayEl) return;
    const controls = overlayEl.querySelector("[data-orbit-control-depth]");
    const picker = overlayEl.querySelector(".orbit-stance-picker");
    const pulseBtn = overlayEl.querySelector('[data-orbit-action="pulse"]');
    const enabled =
      session?.prototypeSlice === true &&
      Array.isArray(session.launchStances) &&
      session.launchStances.length > 0;

    if (!controls || !picker || !pulseBtn) return;
    controls.hidden = !enabled;
    if (!enabled) {
      picker.replaceChildren();
      pulseBtn.disabled = true;
      return;
    }

    const stanceButtons = session.launchStances.map((stance) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "orbit-stance-btn";
      button.dataset.orbitStance = stance.id;
      button.textContent = stance.label;
      button.title = stance.hint || stance.label;
      button.disabled = session.phase !== "aiming";
      button.setAttribute(
        "aria-pressed",
        stance.id === session.launchStanceId ? "true" : "false"
      );
      return button;
    });
    picker.replaceChildren(...stanceButtons);

    const pulseAvailable =
      session.phase === "spinning" &&
      session.resonancePulse &&
      !session.resonancePulseUsed;
    pulseBtn.disabled = !pulseAvailable;
    pulseBtn.textContent = session.resonancePulseUsed
      ? "共鳴脈衝・已用"
      : session.phase === "aiming"
        ? "共鳴脈衝・發射後可用"
        : "共鳴脈衝・1/1";
    pulseBtn.setAttribute(
      "aria-label",
      session.resonancePulseUsed
        ? "本次發射的共鳴脈衝已使用"
        : "使用本次發射唯一一次共鳴脈衝"
    );
  }

  function chooseLaunchStance(stanceId) {
    if (!session || session.phase !== "aiming") return;
    session = selectOrbitLaunchStance(session, stanceId);
    const stance = selectedLaunchStance();
    if (stance) {
      overlayEl.querySelector(".orbit-battle .orbit-status").textContent =
        `${stance.label}姿態：${stance.hint}　拉曳化身決定啟動方向與力度。`;
    }
    renderControlDepth();
    draw();
  }

  function activateResonancePulse() {
    if (!session || session.phase !== "spinning") return;
    const before = session;
    session = triggerOrbitResonancePulse(session);
    if (session === before) return;
    const targetText = session.resonanceReady
      ? "化身稍微向營火收束並降速；仍要實際停進圈內。"
      : `化身稍微轉向記憶 ${Math.min(
          session.memoryMotes.length,
          session.nextMemoryMoteIndex + 1
        )}；仍要實際掠過光點。`;
    overlayEl.querySelector(".orbit-battle .orbit-status").textContent =
      `共鳴脈衝已用。${targetText}`;
    renderControlDepth();
    draw();
  }

  function showResolved() {
    if (!session?.outcome) return;
    const lineEl = overlayEl.querySelector(
      ".orbit-battle .orbit-companion-line"
    );
    lineEl.hidden = false;
    lineEl.textContent = session.companionLine || "";

    let status = `${session.outcome.title}：${session.outcome.summary}`;
    if (session.prototypeSlice) {
      if (
        session.outcome.reason === "camp_resonated" &&
        session.sessionTrace
      ) {
        status = `${status}　${session.sessionTrace}`;
      }
      status = `${status}　本切片未寫入路徑、微光、Growth 或存檔。`;
    } else if (session.sandbox) {
      status = `${status}　物理沙盒未寫入路徑、微光或 Growth。`;
    } else if (session.progressEligible && session.stageId) {
      const stage = getOrbitStageById(session.stageId);
      const alreadyCleared = isOrbitStageCleared(session.stageId);
      const result = recordOrbitStageClear(session.stageId);
      if (result.narrative) {
        status = `${status}　${result.narrative}`;
      }
      if (result.unlockedRegionId) {
        status = `${status}　${getOrbitPathLabel(result.unlockedRegionId)}已可前往。`;
      }

      // R4：首次通關才寫微光＋evidence；對決不走這裡
      if (stage) {
        const state = store.getState();
        const plan = planOrbitStageSettlement({
          stage,
          alreadyCleared,
          companionId: state.activeCompanionId,
          chapterNo: state.chapterProgress?.current || 1,
          safeHarborMode: state.safeHarborMode === true,
          existingVault: state.expeditionVault
        });
        if (plan.moteLine) status = `${status}　${plan.moteLine}`;
        if (plan.shouldGrant && (plan.shardGrant || plan.growth)) {
          applyOrbitSettlement(plan);
        }
      }
    }
    overlayEl.querySelector(".orbit-battle .orbit-status").textContent = status;
    setActionVisibility({ retreat: false, toMap: true, again: true });
    renderControlDepth();
    if (statusText) statusText.textContent = session.companionLine || session.outcome.summary;
  }

  /**
   * 同一筆 updateState 寫 vault＋growth（對齊 mapController 交易模式）。
   */
  function applyOrbitSettlement(plan) {
    if (!store?.updateState || !plan?.shouldGrant) return;
    store.updateState((draft) => {
      if (plan.shardGrant?.nextVault) {
        draft.expeditionVault = plan.shardGrant.nextVault;
      }
      if (plan.growth && companionGrowthController?.writeIntoDraft) {
        companionGrowthController.writeIntoDraft(draft, plan.growth);
      }
    });
    saveCurrentState?.();
  }

  function startLoop() {
    stopLoop();
    lastTs = 0;
    const tick = (ts) => {
      if (!active || view !== "battle") return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      if (session?.phase === "spinning") {
        session = stepOrbitSession(session, dt);
        if (session.phase === "resolved") showResolved();
      }
      draw();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lastTs = 0;
  }

  function resizeCanvas() {
    if (!canvas) return;
    const stage = overlayEl.querySelector(".orbit-stage");
    const w = Math.min(390, stage?.clientWidth || 360);
    const h = Math.min(420, Math.max(300, Math.floor(w * 1.05)));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function worldToScreen(x, y, cssW, cssH) {
    const scale = Math.min(cssW, cssH) * 0.46; // R6：場地視覺再放大一點，呼應提速後的手感
    return {
      sx: cssW / 2 + x * scale,
      sy: cssH / 2 + y * scale,
      scale
    };
  }

  function screenToWorld(sx, sy, cssW, cssH) {
    const scale = Math.min(cssW, cssH) * 0.46; // R6：場地視覺再放大一點，呼應提速後的手感
    return {
      x: (sx - cssW / 2) / scale,
      y: (sy - cssH / 2) / scale
    };
  }

  function pointerPos(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      cssW: rect.width,
      cssH: rect.height
    };
  }

  function onPointerDown(event) {
    if (!session || session.phase !== "aiming") return;
    const p = pointerPos(event);
    const world = screenToWorld(p.x, p.y, p.cssW, p.cssH);
    const dx = world.x - session.player.x;
    const dy = world.y - session.player.y;
    if (Math.hypot(dx, dy) > 0.22) return;
    dragging = true;
    pullStart = { x: session.player.x, y: session.player.y };
    pullNow = world;
    // 合成 pointer／部分瀏覽器沒有 active pointer 時會丟錯，不可中斷拉動
    try {
      canvas.setPointerCapture?.(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onPointerMove(event) {
    if (!dragging || !session || session.phase !== "aiming") return;
    const p = pointerPos(event);
    pullNow = screenToWorld(p.x, p.y, p.cssW, p.cssH);
  }

  function onPointerUp(event) {
    if (!dragging || !session || session.phase !== "aiming") {
      dragging = false;
      return;
    }
    dragging = false;
    const p = pointerPos(event);
    pullNow = screenToWorld(p.x, p.y, p.cssW, p.cssH);
    const pullDx = pullNow.x - pullStart.x;
    const pullDy = pullNow.y - pullStart.y;
    if (Math.hypot(pullDx, pullDy) < 0.04) {
      pullStart = null;
      pullNow = null;
      return;
    }
    session = launchOrbitSession(session, pullDx, pullDy);
    const stance = selectedLaunchStance();
    overlayEl.querySelector(".orbit-battle .orbit-status").textContent =
      session.prototypeSlice
        ? `${stance?.label || "直立"}姿態已啟動。化身會自主彎軌；你只剩一次共鳴脈衝可調整走向。`
        : `化身旋轉中……${session.goalLabel}，或先撤退。`;
    renderControlDepth();
    pullStart = null;
    pullNow = null;
  }

  function drawIdleRefuse(message) {
    resizeCanvas();
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(8, 16, 28, 0.92)";
    ctx.fillRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(200, 220, 240, 0.9)";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(message || "現在不宜出場。", cssW / 2, cssH / 2);
  }

  function draw() {
    if (!ctx || !canvas || view !== "battle") return;
    const cssW = canvas.clientWidth || 360;
    const cssH = canvas.clientHeight || 380;
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.fillStyle = "rgba(8, 16, 28, 0.92)";
    ctx.fillRect(0, 0, cssW, cssH);

    const arenaRadius = session?.arenaRadius ?? 1;
    const center = worldToScreen(0, 0, cssW, cssH);
    ctx.beginPath();
    ctx.arc(center.sx, center.sy, center.scale * arenaRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(140, 200, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!session) return;

    if (session.goal === "collect_then_resonate") {
      drawCampSliceField(session, cssW, cssH);
    }

    // 護盾柱
    for (const pillar of session.pillars || []) {
      const p = worldToScreen(pillar.x, pillar.y, cssW, cssH);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, pillar.r * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(180, 200, 220, 0.35)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200, 220, 240, 0.55)";
      ctx.stroke();
    }

    // 錨點
    if (session.anchor) {
      const a = worldToScreen(session.anchor.x, session.anchor.y, cssW, cssH);
      ctx.beginPath();
      ctx.arc(a.sx, a.sy, session.anchor.r * a.scale, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 230, 140, 0.85)";
      ctx.setLineDash([5, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(255, 230, 140, 0.75)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("錨點", a.sx, a.sy - session.anchor.r * a.scale - 4);
    }

    if (session.dummyEnabled) {
      drawBody(
        session.dummy,
        cssW,
        cssH,
        "rgba(255, 140, 120, 0.9)",
        session.dummyName
      );
    }
    drawBody(session.player, cssW, cssH, "rgba(160, 220, 255, 0.95)", "心核化身");
    if (session.lastPulseFlash > 0) {
      drawResonancePulse(session, cssW, cssH);
    }

    if (session.phase === "aiming" && dragging && pullNow) {
      const from = worldToScreen(session.player.x, session.player.y, cssW, cssH);
      const to = worldToScreen(pullNow.x, pullNow.y, cssW, cssH);
      ctx.beginPath();
      ctx.moveTo(from.sx, from.sy);
      ctx.lineTo(to.sx, to.sy);
      ctx.strokeStyle = "rgba(255, 230, 160, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
      const aim = worldToScreen(
        session.player.x - (pullNow.x - session.player.x),
        session.player.y - (pullNow.y - session.player.y),
        cssW,
        cssH
      );
      ctx.beginPath();
      ctx.moveTo(from.sx, from.sy);
      ctx.lineTo(aim.sx, aim.sy);
      ctx.strokeStyle = "rgba(180, 255, 210, 0.55)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (session.lastHitFlash > 0) {
      ctx.fillStyle = `rgba(255,255,220,${session.lastHitFlash})`;
      ctx.fillRect(0, 0, cssW, cssH);
    }
    if (session.lastMoteFlash > 0) {
      ctx.fillStyle = `rgba(150,235,255,${session.lastMoteFlash * 0.42})`;
      ctx.fillRect(0, 0, cssW, cssH);
    }

    if (session.goal === "collect_then_resonate") {
      drawCampSliceProgress(session);
    } else {
      drawMeter(
        12,
        12,
        session.player.stability,
        "化身",
        "rgba(160,220,255,0.95)"
      );
    }
    if (session.goal === "survive") {
      const remain = Math.max(0, (session.surviveSeconds || 0) - session.elapsed);
      ctx.fillStyle = "rgba(230,240,255,0.85)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`撐住 ${remain.toFixed(1)}s`, 12, 52);
    } else if (
      session.goal !== "collect_then_resonate" &&
      session.dummyEnabled
    ) {
      drawMeter(12, 32, session.dummy.stability, "雜訊", "rgba(255,140,120,0.95)");
    }

    if (session.sandbox) {
      drawHybridDebug(session.player, cssW);
    }
  }

  function drawCampSliceField(activeSession, cssW, cssH) {
    const well = activeSession.softWell;
    if (well) {
      const center = worldToScreen(well.x, well.y, cssW, cssH);
      const radius = well.radius * center.scale;
      const gradient = ctx.createRadialGradient(
        center.sx,
        center.sy,
        0,
        center.sx,
        center.sy,
        radius
      );
      gradient.addColorStop(0, "rgba(255, 190, 120, 0.12)");
      gradient.addColorStop(0.42, "rgba(105, 185, 220, 0.08)");
      gradient.addColorStop(1, "rgba(40, 90, 130, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(center.sx, center.sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const guidePoints = [
      activeSession.launchOrigin,
      ...(activeSession.memoryMotes || []),
      activeSession.resonanceZone
    ].filter(Boolean);
    if (guidePoints.length > 1) {
      ctx.beginPath();
      guidePoints.forEach((point, index) => {
        const screen = worldToScreen(point.x, point.y, cssW, cssH);
        if (index === 0) ctx.moveTo(screen.sx, screen.sy);
        else ctx.lineTo(screen.sx, screen.sy);
      });
      ctx.strokeStyle = "rgba(155, 220, 235, 0.28)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    for (const [index, mote] of (activeSession.memoryMotes || []).entries()) {
      const point = worldToScreen(mote.x, mote.y, cssW, cssH);
      const radius = mote.r * point.scale;
      const isNext = index === activeSession.nextMemoryMoteIndex;
      ctx.beginPath();
      ctx.arc(point.sx, point.sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = mote.collected
        ? "rgba(145, 235, 220, 0.25)"
        : isNext
          ? "rgba(255, 225, 150, 0.28)"
          : "rgba(125, 160, 190, 0.12)";
      ctx.fill();
      ctx.strokeStyle = mote.collected
        ? "rgba(145, 245, 225, 0.85)"
        : isNext
          ? "rgba(255, 225, 150, 0.92)"
          : "rgba(145, 175, 205, 0.38)";
      ctx.lineWidth = isNext ? 2.5 : 1.5;
      ctx.stroke();
      ctx.fillStyle = mote.collected
        ? "rgba(190, 255, 235, 0.92)"
        : isNext
          ? "rgba(255, 238, 185, 0.95)"
          : "rgba(180, 195, 215, 0.62)";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(index + 1), point.sx, point.sy + 4);
    }

    const zone = activeSession.resonanceZone;
    if (!zone) return;
    const fire = worldToScreen(zone.x, zone.y, cssW, cssH);
    const radius = zone.r * fire.scale;
    ctx.beginPath();
    ctx.arc(fire.sx, fire.sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = activeSession.resonanceReady
      ? "rgba(255, 185, 105, 0.14)"
      : "rgba(100, 125, 155, 0.08)";
    ctx.fill();
    ctx.strokeStyle = activeSession.resonanceReady
      ? "rgba(255, 205, 135, 0.92)"
      : "rgba(150, 165, 185, 0.4)";
    ctx.lineWidth = activeSession.resonanceReady ? 2.5 : 1.5;
    ctx.setLineDash(activeSession.resonanceReady ? [] : [5, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    if (activeSession.resonanceReady) {
      const holdSeconds = Math.max(0.01, zone.holdSeconds || 0.4);
      const holdRatio = Math.max(
        0,
        Math.min(1, activeSession.resonanceHold / holdSeconds)
      );
      ctx.beginPath();
      ctx.arc(
        fire.sx,
        fire.sy,
        radius + 4,
        -Math.PI / 2,
        -Math.PI / 2 + Math.PI * 2 * holdRatio
      );
      ctx.strokeStyle = "rgba(255, 235, 175, 0.95)";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(fire.sx, fire.sy + 8);
    ctx.quadraticCurveTo(
      fire.sx - 10,
      fire.sy - 2,
      fire.sx,
      fire.sy - 14
    );
    ctx.quadraticCurveTo(
      fire.sx + 11,
      fire.sy - 2,
      fire.sx,
      fire.sy + 8
    );
    ctx.fillStyle = activeSession.resonanceReady
      ? "rgba(255, 185, 105, 0.92)"
      : "rgba(155, 165, 180, 0.5)";
    ctx.fill();
    ctx.fillStyle = "rgba(235, 225, 205, 0.82)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("營火", fire.sx, fire.sy + radius + 14);
  }

  function drawCampSliceProgress(activeSession) {
    const total = activeSession.memoryMotes.length;
    const collected = activeSession.nextMemoryMoteIndex;
    ctx.fillStyle = "rgba(225, 242, 255, 0.92)";
    ctx.font = "bold 11px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`記憶 ${collected}/${total}`, 12, 18);
    ctx.font = "10px sans-serif";
    ctx.fillStyle = activeSession.resonanceReady
      ? "rgba(255, 225, 160, 0.92)"
      : "rgba(180, 210, 230, 0.8)";
    const holdSeconds = activeSession.resonanceZone?.holdSeconds || 0.4;
    const campText = activeSession.resonanceReady
      ? `營火停留 ${Math.min(holdSeconds, activeSession.resonanceHold).toFixed(1)}/${holdSeconds.toFixed(1)}s`
      : `下一點 ${Math.min(total, collected + 1)}`;
    ctx.fillText(campText, 12, 34);
    const stance = activeSession.launchStances?.find(
      (candidate) => candidate.id === activeSession.launchStanceId
    );
    ctx.fillStyle = "rgba(185, 215, 235, 0.82)";
    const pulseText = activeSession.resonancePulseUsed
      ? "脈衝 已用"
      : activeSession.phase === "aiming"
        ? "脈衝 待發射"
        : "脈衝 1/1";
    ctx.fillText(`姿態 ${stance?.label || "直立"}・${pulseText}`, 12, 50);
  }

  function drawResonancePulse(activeSession, cssW, cssH) {
    const body = activeSession.player;
    const point = worldToScreen(body.x, body.y, cssW, cssH);
    const flashSeconds = Math.max(
      0.01,
      activeSession.resonancePulse?.flashSeconds || 0.36
    );
    const ratio = Math.max(
      0,
      Math.min(1, activeSession.lastPulseFlash / flashSeconds)
    );
    const progress = 1 - ratio;
    const radius =
      body.radius * point.scale * (1.35 + progress * 2.8);
    ctx.beginPath();
    ctx.arc(point.sx, point.sy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(155, 235, 255, ${ratio * 0.82})`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  function drawBody(body, cssW, cssH, color, label) {
    if (!body || body.out) return;
    const { sx, sy, scale } = worldToScreen(body.x, body.y, cssW, cssH);
    const r = body.radius * scale;
    const speed = Math.hypot(body.vx || 0, body.vy || 0);
    // 高速時短拖尾：加強「咻」的速度感（非完整軌跡記錄）
    if (speed > 0.35 && session?.phase === "spinning") {
      const trail = Math.min(18, speed * 14);
      const angV = Math.atan2(body.vy || 0, body.vx || 0);
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx - Math.cos(angV) * trail, sy - Math.sin(angV) * trail);
      ctx.strokeStyle = "rgba(180, 230, 255, 0.35)";
      ctx.lineWidth = Math.max(2, r * 0.45);
      ctx.stroke();
    }
    const hybridSpin =
      body.physicsModel === ORBIT_PHYSICS_MODELS.hybridSpin;
    const wobbleAngle = hybridSpin
      ? Math.sin((body.spinAge || 0) * 9.5) * (body.wobble || 0) * 0.35
      : 0;
    ctx.beginPath();
    if (hybridSpin) {
      ctx.ellipse(
        sx,
        sy,
        r * (1 + (body.tilt || 0) * 0.22),
        r * (1 - (body.tilt || 0) * 0.28),
        wobbleAngle,
        0,
        Math.PI * 2
      );
    } else {
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
    }
    ctx.fillStyle = color;
    ctx.fill();
    // 轉速視覺加速：轉得越快線掃越急
    const ang =
      (body.spin / 100) * Math.PI * 6 +
      (session?.elapsed || 0) *
        (2.8 + body.spin / 18) *
        (body.spinDirection || 1);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // 第二條對角線：更像「在轉的陀螺頂」
    ctx.beginPath();
    ctx.moveTo(sx - Math.cos(ang) * r * 0.55, sy - Math.sin(ang) * r * 0.55);
    ctx.lineTo(sx + Math.cos(ang) * r * 0.55, sy + Math.sin(ang) * r * 0.55);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "rgba(230,240,255,0.75)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, sx, sy - r - 6);
  }

  function drawHybridDebug(body, cssW) {
    if (!body) return;
    const phaseColors = {
      [HYBRID_SPIN_PHASES.launch]: "rgba(255,220,150,0.95)",
      [HYBRID_SPIN_PHASES.stable]: "rgba(150,235,255,0.95)",
      [HYBRID_SPIN_PHASES.curving]: "rgba(205,175,255,0.95)",
      [HYBRID_SPIN_PHASES.wobbling]: "rgba(255,175,150,0.95)",
      [HYBRID_SPIN_PHASES.stopped]: "rgba(190,200,215,0.9)"
    };
    const speed = Math.hypot(body.vx || 0, body.vy || 0);
    const x = Math.max(172, cssW - 158);
    const y = 10;
    ctx.fillStyle = "rgba(5, 10, 20, 0.78)";
    ctx.fillRect(x, y, 148, 94);
    ctx.font = "10px ui-monospace, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle =
      phaseColors[body.spinPhase] || "rgba(230,240,255,0.9)";
    ctx.fillText(`phase  ${body.spinPhase}`, x + 8, y + 15);
    ctx.fillStyle = "rgba(220,235,250,0.88)";
    ctx.fillText(`speed  ${speed.toFixed(3)}`, x + 8, y + 31);
    ctx.fillText(`spin   ${body.spin.toFixed(2)}`, x + 8, y + 45);
    ctx.fillText(`tilt   ${body.tilt.toFixed(3)}`, x + 8, y + 59);
    ctx.fillText(`wobble ${body.wobble.toFixed(3)}`, x + 8, y + 73);
    ctx.fillText(`dir    ${body.spinDirection > 0 ? "CW" : "CCW"}`, x + 8, y + 87);
  }

  function drawMeter(x, y, value, label, color) {
    const w = 110;
    const h = 8;
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * Math.max(0, Math.min(1, value / 100)), h);
    ctx.fillStyle = "rgba(230,240,255,0.8)";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${label} ${Math.round(value)}`, x + w + 6, y + 8);
  }

  return {
    bind,
    open,
    openStage,
    openDuel,
    close,
    showMap,
    getSession: () => session,
    isActive: () => active,
    getView: () => view
  };
}
