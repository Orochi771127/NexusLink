/**
 * 心核迴旋戰 — 對決 UI（R3／R5）
 *
 * 人機／幽靈；勝負不改 bond。連續開戰受 orbitDuelBudget 限制。
 * R5：四語 chrome＋canvas tabindex。
 */

import { getCompanionById } from "../data/companionRegistry.js";
import {
  getDuelProfile,
  listDuelProfiles,
  GHOST_DUEL_PROFILE,
  CPU_DUEL_PROFILES
} from "../data/orbit/duelProfiles.js";
import { t } from "../i18n/i18n.js";
import {
  canStartOrbitDuel,
  easeOrbitDuelBudget,
  recordOrbitDuelFinished
} from "../orbit/orbitDuelBudget.js";
import {
  createOrbitDuelSession,
  launchOrbitDuelPlayer,
  retreatOrbitDuel,
  stepOrbitDuel
} from "../orbit/orbitDuelEngine.js";
import {
  hasOrbitGhostRecording,
  recordOrbitGhostPull
} from "../orbit/orbitGhostRecorder.js";
import {
  projectOrbitCombatStats,
  recentEvidenceFromState,
  vitalsFromState
} from "../orbit/orbitStatsProjector.js";

/**
 * @param {{
 *  store: { getState: Function },
 *  statusText?: HTMLElement | null,
 *  onBack?: () => void,
 *  onCloseAll?: () => void
 * }} deps
 */
export function createOrbitDuelController({ store, statusText, onBack, onCloseAll }) {
  let rootEl = null;
  let canvas = null;
  let ctx = null;
  let session = null;
  let rafId = 0;
  let lastTs = 0;
  let dragging = false;
  let pullStart = null;
  let pullNow = null;
  let active = false;
  let pickerVisible = true;
  let currentProfileId = CPU_DUEL_PROFILES.mirror.id;

  function applyChrome() {
    if (!rootEl) return;
    const pickerKicker = rootEl.querySelector(".orbit-duel-picker .orbit-kicker");
    const title = rootEl.querySelector(".orbit-duel-title");
    const note = rootEl.querySelector(".orbit-duel-note");
    const backBtn = rootEl.querySelector('[data-duel-ui="back"]');
    const arenaKicker = rootEl.querySelector(".orbit-duel-arena .orbit-kicker");
    const hint = rootEl.querySelector(".orbit-duel-arena .orbit-hint");
    const retreatBtn = rootEl.querySelector('[data-duel-ui="retreat"]');
    const pickerBtn = rootEl.querySelector('[data-duel-ui="picker"]');
    const againBtn = rootEl.querySelector('[data-duel-ui="again"]');
    if (pickerKicker) pickerKicker.textContent = t("orbit.duelKicker");
    if (title) title.textContent = t("orbit.duelTitle");
    if (note && !session) note.textContent = t("orbit.duelNote");
    if (backBtn) backBtn.textContent = t("orbit.toMap");
    if (arenaKicker) arenaKicker.textContent = t("orbit.duelArenaKicker");
    if (hint) hint.textContent = t("orbit.duelHint");
    if (retreatBtn) retreatBtn.textContent = t("orbit.retreat");
    if (pickerBtn) pickerBtn.textContent = t("orbit.pickerAgain");
    if (againBtn) againBtn.textContent = t("orbit.duelAgain");
    if (canvas) canvas.setAttribute("aria-label", t("orbit.duelCanvas"));
  }

  function ensure(parent) {
    if (rootEl) {
      if (parent && rootEl.parentElement !== parent) parent.appendChild(rootEl);
      return rootEl;
    }
    rootEl = document.createElement("div");
    rootEl.className = "orbit-duel";
    rootEl.hidden = true;
    rootEl.innerHTML = `
      <div class="orbit-duel-picker">
        <p class="orbit-kicker"></p>
        <h2 class="orbit-duel-title" id="orbit-duel-title"></h2>
        <p class="orbit-duel-note"></p>
        <div class="orbit-duel-profiles"></div>
        <div class="orbit-duel-picker-actions">
          <button type="button" class="orbit-btn orbit-btn--ghost" data-duel-ui="back"></button>
        </div>
      </div>
      <div class="orbit-duel-arena" hidden>
        <div class="orbit-hud-top">
          <p class="orbit-kicker"></p>
          <h2 class="orbit-duel-arena-title"></h2>
          <p class="orbit-duel-arena-copy"></p>
          <div class="orbit-stats orbit-duel-stats"></div>
          <p class="orbit-hint"></p>
        </div>
        <div class="orbit-stage">
          <canvas class="orbit-duel-canvas" width="390" height="420" tabindex="0" aria-label=""></canvas>
        </div>
        <div class="orbit-hud-bottom">
          <p class="orbit-status orbit-duel-status" aria-live="polite"></p>
          <p class="orbit-companion-line orbit-duel-line" hidden></p>
          <div class="orbit-actions">
            <button type="button" class="orbit-btn orbit-btn--ghost" data-duel-ui="retreat"></button>
            <button type="button" class="orbit-btn" data-duel-ui="picker" hidden></button>
            <button type="button" class="orbit-btn" data-duel-ui="again" hidden></button>
          </div>
        </div>
      </div>
    `;
    if (parent) parent.appendChild(rootEl);

    canvas = rootEl.querySelector(".orbit-duel-canvas");
    ctx = canvas.getContext("2d");
    applyChrome();

    rootEl.addEventListener("click", (event) => {
      const profileBtn = event.target.closest("[data-duel-profile]");
      if (profileBtn) {
        startDuel(profileBtn.dataset.duelProfile);
        return;
      }
      const ui = event.target.closest("[data-duel-ui]");
      if (!ui) return;
      const action = ui.dataset.duelUi;
      if (action === "back") {
        hide();
        easeOrbitDuelBudget();
        onBack?.();
      } else if (action === "retreat") retreat();
      else if (action === "picker") showPicker();
      else if (action === "again") startDuel(currentProfileId);
    });

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);

    document.addEventListener("keydown", (event) => {
      if (!active || rootEl.hidden) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (pickerVisible) {
          hide();
          onBack?.();
        } else if (session?.phase === "resolved") {
          showPicker();
        } else {
          retreat();
        }
      }
    });

    return rootEl;
  }

  function mount(parent) {
    return ensure(parent);
  }

  function open() {
    ensure();
    applyChrome();
    rootEl.hidden = false;
    active = true;
    showPicker();
    if (statusText) {
      const companion = getCompanionById(store.getState().activeCompanionId);
      const name = companion?.name?.zh || companion?.name || "夥伴";
      statusText.textContent = `${name}在外圈守界。要選誰對決？`;
    }
    rootEl.querySelector('[data-duel-ui="back"]')?.focus?.({ preventScroll: true });
  }

  function hide() {
    stopLoop();
    active = false;
    session = null;
    if (rootEl) rootEl.hidden = true;
  }

  function closeAll() {
    hide();
    onCloseAll?.();
  }

  function showPicker() {
    stopLoop();
    session = null;
    pickerVisible = true;
    rootEl.querySelector(".orbit-duel-picker").hidden = false;
    rootEl.querySelector(".orbit-duel-arena").hidden = true;
    renderProfiles();
  }

  function renderProfiles() {
    const box = rootEl.querySelector(".orbit-duel-profiles");
    const ghostReady = hasOrbitGhostRecording();
    box.innerHTML = listDuelProfiles()
      .map((profile) => {
        const isGhost = profile.id === GHOST_DUEL_PROFILE.id;
        const sub = isGhost
          ? ghostReady
            ? "已有上一場拉動可重播"
            : "尚未錄製・將用人機鏡像代替"
          : profile.copy;
        return `<button type="button" class="orbit-duel-profile-btn" data-duel-profile="${profile.id}">
          <strong>${profile.name}</strong>
          <em>${sub}</em>
        </button>`;
      })
      .join("");
  }

  function startDuel(profileId) {
    currentProfileId = profileId || CPU_DUEL_PROFILES.mirror.id;
    let profile = getDuelProfile(currentProfileId);
    if (profile.id === GHOST_DUEL_PROFILE.id && !hasOrbitGhostRecording()) {
      profile = CPU_DUEL_PROFILES.mirror;
      currentProfileId = profile.id;
    }

    const state = store.getState();
    const stats = projectOrbitCombatStats(
      vitalsFromState(state),
      recentEvidenceFromState(state)
    );

    if (!stats.canLaunch) {
      rootEl.querySelector(".orbit-duel-status").textContent =
        stats.refuseReason || "現在不宜出場。";
      pickerVisible = false;
      rootEl.querySelector(".orbit-duel-picker").hidden = true;
      rootEl.querySelector(".orbit-duel-arena").hidden = false;
      setActions({ retreat: false, picker: true, again: false });
      drawRefuse(stats.refuseReason);
      return;
    }

    const budget = canStartOrbitDuel(stats);
    if (!budget.ok) {
      if (statusText) statusText.textContent = budget.reason;
      rootEl.querySelector(".orbit-duel-note").textContent = budget.reason;
      showPicker();
      return;
    }

    pickerVisible = false;
    rootEl.querySelector(".orbit-duel-picker").hidden = true;
    rootEl.querySelector(".orbit-duel-arena").hidden = false;

    session = createOrbitDuelSession({
      playerStats: stats,
      profile,
      personaBias: "comfort"
    });

    applyChrome();
    rootEl.querySelector(".orbit-duel-arena-title").textContent = profile.name;
    rootEl.querySelector(".orbit-duel-arena-copy").textContent = profile.copy;
    rootEl.querySelector(".orbit-duel-stats").textContent =
      `你 ${t("orbit.statImpact")}${stats.impact}/${t("orbit.statSpin")}${stats.spin}/${t("orbit.statGuard")}${stats.guard}` +
      `　·　對手 ${t("orbit.statImpact")}${session.foeStats.impact}/${t("orbit.statSpin")}${session.foeStats.spin}`;
    rootEl.querySelector(".orbit-duel-line").hidden = true;
    rootEl.querySelector(".orbit-duel-status").textContent =
      `${stats.label}　拉動發射，以核散或退場定勝負。`;
    setActions({ retreat: true, picker: false, again: false });
    dragging = false;
    pullStart = null;
    pullNow = null;
    resizeCanvas();
    startLoop();
    rootEl.querySelector('[data-duel-ui="retreat"]')?.focus?.({ preventScroll: true });
  }

  function setActions({ retreat, picker, again }) {
    rootEl.querySelector('[data-duel-ui="retreat"]').hidden = !retreat;
    rootEl.querySelector('[data-duel-ui="picker"]').hidden = !picker;
    rootEl.querySelector('[data-duel-ui="again"]').hidden = !again;
  }

  function retreat() {
    if (!session || session.phase === "resolved") {
      showPicker();
      return;
    }
    session = retreatOrbitDuel(session);
    finishResolved();
  }

  function finishResolved() {
    recordOrbitDuelFinished();
    const line = rootEl.querySelector(".orbit-duel-line");
    line.hidden = false;
    line.textContent = session.companionLine || "";
    rootEl.querySelector(".orbit-duel-status").textContent =
      `${session.outcome.title}：${session.outcome.summary}`;
    setActions({ retreat: false, picker: true, again: true });
    if (statusText) {
      statusText.textContent = session.companionLine || session.outcome.summary;
    }
  }

  function startLoop() {
    stopLoop();
    lastTs = 0;
    const tick = (ts) => {
      if (!active || rootEl.hidden || pickerVisible) return;
      if (!lastTs) lastTs = ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      if (session?.phase === "spinning") {
        session = stepOrbitDuel(session, dt);
        if (session.phase === "resolved") finishResolved();
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
    const stage = rootEl.querySelector(".orbit-stage");
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
    return { sx: cssW / 2 + x * scale, sy: cssH / 2 + y * scale, scale };
  }

  function screenToWorld(sx, sy, cssW, cssH) {
    const scale = Math.min(cssW, cssH) * 0.42;
    return { x: (sx - cssW / 2) / scale, y: (sy - cssH / 2) / scale };
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
    if (Math.hypot(world.x - session.player.x, world.y - session.player.y) > 0.22) return;
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
    recordOrbitGhostPull(pullDx, pullDy);
    session = launchOrbitDuelPlayer(session, pullDx, pullDy);
    rootEl.querySelector(".orbit-duel-status").textContent =
      "化身旋轉中……對手即將進場。";
    pullStart = null;
    pullNow = null;
  }

  function drawRefuse(message) {
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
    if (!ctx || !canvas || pickerVisible) return;
    const cssW = canvas.clientWidth || 360;
    const cssH = canvas.clientHeight || 380;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = "rgba(8, 16, 28, 0.92)";
    ctx.fillRect(0, 0, cssW, cssH);

    const center = worldToScreen(0, 0, cssW, cssH);
    ctx.beginPath();
    ctx.arc(center.sx, center.sy, center.scale, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(140, 200, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (!session) return;

    drawBody(session.foe, cssW, cssH, "rgba(255, 160, 120, 0.95)", session.profileName || "對手");
    drawBody(session.player, cssW, cssH, "rgba(160, 220, 255, 0.95)", "你的化身");

    if (session.phase === "aiming" && dragging && pullNow) {
      const from = worldToScreen(session.player.x, session.player.y, cssW, cssH);
      const to = worldToScreen(pullNow.x, pullNow.y, cssW, cssH);
      ctx.beginPath();
      ctx.moveTo(from.sx, from.sy);
      ctx.lineTo(to.sx, to.sy);
      ctx.strokeStyle = "rgba(255, 230, 160, 0.85)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (session.lastHitFlash > 0) {
      ctx.fillStyle = `rgba(255,255,220,${session.lastHitFlash})`;
      ctx.fillRect(0, 0, cssW, cssH);
    }

    drawMeter(12, 12, session.player.stability, "你", "rgba(160,220,255,0.95)");
    drawMeter(12, 32, session.foe.stability, "對手", "rgba(255,160,120,0.95)");
  }

  function drawBody(body, cssW, cssH, color, label) {
    if (!body || body.out) return;
    const { sx, sy, scale } = worldToScreen(body.x, body.y, cssW, cssH);
    const r = body.radius * scale;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    const ang = (body.spin / 100) * Math.PI * 4 + (session?.elapsed || 0) * 2;
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
    mount,
    open,
    hide,
    closeAll,
    applyChrome,
    isActive: () => active && rootEl && !rootEl.hidden,
    getSession: () => session
  };
}
