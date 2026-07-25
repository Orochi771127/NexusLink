/**
 * 心核迴旋戰 UI（R1–R5）
 *
 * - 動態 overlay，不改 index.html
 * - R2 路徑節點；R3 對決；R4 通關寫微光＋exploration evidence
 * - R5：四語 chrome、基本無障礙、手感常數對齊
 * - 對決勝發獎；安全港／重複通關＝零 evidence
 */

import { getCompanionById } from "../data/companionRegistry.js";
import { getOrbitStageById, getOrbitPathLabel } from "../data/orbit/stages/index.js";
import { LANGUAGE_CHANGED_EVENT, t } from "../i18n/i18n.js";
import {
  createOrbitSession,
  launchOrbitSession,
  retreatOrbitSession,
  stepOrbitSession
} from "../orbit/orbitEngine.js";
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
    if (retreatBtn) retreatBtn.textContent = t("orbit.retreat");
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
          <p class="orbit-kicker"></p>
          <h2 class="orbit-title" id="orbit-battle-title"></h2>
          <p class="orbit-copy"></p>
          <div class="orbit-stats" aria-live="polite"></div>
          <p class="orbit-hint"></p>
        </div>
        <div class="orbit-stage">
          <canvas class="orbit-canvas" width="390" height="420" tabindex="0" aria-label=""></canvas>
        </div>
        <div class="orbit-hud-bottom">
          <p class="orbit-status" aria-live="polite"></p>
          <p class="orbit-companion-line" hidden></p>
          <div class="orbit-actions">
            <button type="button" class="orbit-btn orbit-btn--ghost" data-orbit-action="retreat"></button>
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
      const btn = event.target.closest("[data-orbit-action]");
      if (!btn) return;
      const action = btn.dataset.orbitAction;
      if (action === "retreat") retreat();
      else if (action === "to-map") showMap();
      else if (action === "again" && currentStageId) openStage(currentStageId);
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
      `${pathLabel}・${stage.title}`;
    overlayEl.querySelector(".orbit-copy").textContent =
      `${stage.copy}　${t("orbit.goalPrefix")}：${stage.goalLabel}`;
    overlayEl.querySelector(".orbit-stats").textContent = formatOrbitStatsLine(stats);
    overlayEl.querySelector(".orbit-companion-line").hidden = true;
    overlayEl.querySelector(".orbit-companion-line").textContent = "";
    setActionVisibility({ retreat: true, toMap: false, again: false });

    if (!stats.canLaunch) {
      session = null;
      overlayEl.querySelector(".orbit-status").textContent =
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
      personaBias: "comfort"
    });
    overlayEl.querySelector(".orbit-status").textContent =
      `${entry.line}　${stats.label}　${stage.goalLabel}`;
    dragging = false;
    pullStart = null;
    pullNow = null;
    resizeCanvas();
    startLoop();
    if (statusText) {
      statusText.textContent = entry.hasMote
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

  function showResolved() {
    if (!session?.outcome) return;
    const lineEl = overlayEl.querySelector(".orbit-companion-line");
    lineEl.hidden = false;
    lineEl.textContent = session.companionLine || "";

    let status = `${session.outcome.title}：${session.outcome.summary}`;
    if (session.progressEligible && session.stageId) {
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
    overlayEl.querySelector(".orbit-status").textContent = status;
    setActionVisibility({ retreat: false, toMap: true, again: true });
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
    const scale = Math.min(cssW, cssH) * 0.42;
    return {
      sx: cssW / 2 + x * scale,
      sy: cssH / 2 + y * scale,
      scale
    };
  }

  function screenToWorld(sx, sy, cssW, cssH) {
    const scale = Math.min(cssW, cssH) * 0.42;
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
    canvas.setPointerCapture?.(event.pointerId);
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
    overlayEl.querySelector(".orbit-status").textContent =
      `化身旋轉中……${session.goalLabel}，或先撤退。`;
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

    drawBody(session.dummy, cssW, cssH, "rgba(255, 140, 120, 0.9)", session.dummyName);
    drawBody(session.player, cssW, cssH, "rgba(160, 220, 255, 0.95)", "心核化身");

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

    drawMeter(12, 12, session.player.stability, "化身", "rgba(160,220,255,0.95)");
    if (session.goal === "survive") {
      const remain = Math.max(0, (session.surviveSeconds || 0) - session.elapsed);
      ctx.fillStyle = "rgba(230,240,255,0.85)";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`撐住 ${remain.toFixed(1)}s`, 12, 52);
    } else {
      drawMeter(12, 32, session.dummy.stability, "雜訊", "rgba(255,140,120,0.95)");
    }
  }

  function drawBody(body, cssW, cssH, color, label) {
    if (!body || body.out) return;
    const { sx, sy, scale } = worldToScreen(body.x, body.y, cssW, cssH);
    const r = body.radius * scale;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    const ang = (body.spin / 100) * Math.PI * 4 + (session?.elapsed || 0) * (1 + body.spin / 40);
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(ang) * r, sy + Math.sin(ang) * r);
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = "rgba(230,240,255,0.75)";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, sx, sy - r - 6);
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
