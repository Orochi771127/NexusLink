import {
  RESONANCE_WEAVE_PHASES,
  applyResonanceWeaveKeyboard,
  applyResonanceWeavePointer,
  createResonanceWeavePreview,
  exitResonanceWeave,
  getResonanceWeaveProgress,
  replayResonanceWeave,
  setResonanceWeavePhase,
  startResonanceWeave
} from "../engine/resonanceWeaveEngine.js";

const PHASE_PRESENTATION = Object.freeze({
  dawn: Object.freeze({ label: "晨", action: "等到晨光", tone: "珍珠霧" }),
  day: Object.freeze({ label: "晝", action: "等到日光", tone: "澄澈水色" }),
  dusk: Object.freeze({ label: "暮", action: "等到暮光", tone: "琥珀潮" }),
  night: Object.freeze({ label: "夜", action: "等到月光", tone: "月靛" })
});

const STEP_PRESENTATION = Object.freeze({
  circle: Object.freeze({
    title: "先圈住一束環境微光",
    help: "用指標在微光外畫一個閉合圓；鍵盤可直接選擇「圈住這束」。",
    action: "圈住這束"
  }),
  drag_against_current: Object.freeze({
    title: "沿逆流方向慢慢帶回來",
    help: "從發亮的結點往箭頭反方向拖曳；這裡沒有速度要求。",
    action: "沿逆流帶回"
  }),
  release: Object.freeze({
    title: "穩定了，讓它回到湖面",
    help: "輕觸穩定的微光，或選擇「放回湖面」。",
    action: "放回湖面"
  }),
  completed: Object.freeze({
    title: "這一小段水流已經安靜下來",
    help: "這次整理不留下獎勵、進度或損失。你可以重玩，也可以回到棲地。",
    action: "再整理一次"
  })
});

const POINTER_NEAR_RADIUS = 0.16;

/**
 * Session-only UI adapter for Resonance Weave.
 *
 * The controller owns DOM presentation and input only. It deliberately has no
 * store, save, Growth, reward, timer, companion sprite, or asset dependency.
 */
export function createResonanceWeaveController({
  setTimePhase = null,
  getTimePhase = null,
  isReducedMotion = defaultReducedMotion
} = {}) {
  let root = null;
  let host = null;
  let session = null;
  let exitCallback = null;
  let pointerGesture = null;
  let listenerCount = 0;

  function open({
    host: nextHost,
    nodeId = "moonlake",
    seed = "moonlake-weave",
    phaseId = null,
    localHour = new Date().getHours(),
    companionId = null,
    onExit = null
  } = {}) {
    if (!nextHost || typeof nextHost.replaceChildren !== "function") return false;
    destroy();
    ensureStyles();

    const activePhaseId = normalizePhaseId(phaseId)
      || normalizePhaseId(typeof getTimePhase === "function" ? getTimePhase() : null);
    const preview = createResonanceWeavePreview({
      nodeId,
      seed,
      phaseId: activePhaseId,
      localHour,
      companionId,
      reducedMotion: Boolean(isReducedMotion?.())
    });
    if (!preview.ok || !preview.session) return false;

    host = nextHost;
    session = preview.session;
    exitCallback = typeof onExit === "function" ? onExit : null;
    root = document.createElement("section");
    root.className = "resonance-weave";
    root.dataset.status = session.status;
    root.dataset.phase = session.phaseId;
    root.setAttribute("aria-label", "共鳴織痕：整理環境微光");
    host.replaceChildren(root);
    render();
    return true;
  }

  function render(message = "") {
    if (!root || !session) return;
    pointerGesture = null;
    root.dataset.status = session.status;
    root.dataset.phase = session.phaseId;
    root.style.setProperty("--weave-phase-hue", phaseHue(session.phaseId));
    root.replaceChildren();

    const intro = document.createElement("p");
    intro.className = "resonance-weave__ethic";
    intro.textContent = "只整理環境中的微光與雜訊結；不觸碰、不圈選夥伴。沒有倒數，也沒有失敗損失。";
    root.appendChild(intro);

    root.appendChild(createPhasePicker());
    root.appendChild(createLakeBoard());

    const progress = getResonanceWeaveProgress(session);
    const live = document.createElement("div");
    live.className = "resonance-weave__status";
    live.id = "resonance-weave-status";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    const step = STEP_PRESENTATION[progress.stepId] || STEP_PRESENTATION.circle;
    const heading = document.createElement("strong");
    heading.textContent = message || step.title;
    const detail = document.createElement("span");
    detail.textContent = session.status === "preview"
      ? "準備好再開始。建議留半分鐘慢慢整理，但你隨時可以離開。"
      : step.help;
    const count = document.createElement("small");
    count.textContent = `已釋放 ${progress.released}／${progress.total} 束 · 無倒數`;
    live.append(heading, detail, count);
    root.appendChild(live);

    root.appendChild(createControls(progress));
  }

  function createPhasePicker() {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "resonance-weave__phases";
    const legend = document.createElement("legend");
    legend.textContent = "湖邊時刻（只改變表演）";
    fieldset.appendChild(legend);

    const grid = document.createElement("div");
    grid.className = "resonance-weave__phase-grid";
    for (const phase of RESONANCE_WEAVE_PHASES) {
      const presentation = PHASE_PRESENTATION[phase.id];
      const button = document.createElement("button");
      button.type = "button";
      button.className = "resonance-weave__phase";
      button.dataset.phaseId = phase.id;
      button.setAttribute("aria-pressed", String(session.phaseId === phase.id));
      button.setAttribute("aria-label", `${presentation.action}；${presentation.tone}，內容與回報相同`);
      button.innerHTML = `<span aria-hidden="true">${presentation.label}</span><small>${presentation.action}</small>`;
      button.addEventListener("click", () => selectPhase(phase.id));
      grid.appendChild(button);
    }
    fieldset.appendChild(grid);
    return fieldset;
  }

  function createLakeBoard() {
    const board = document.createElement("div");
    board.className = "resonance-weave__lake";
    board.tabIndex = session.status === "active" ? 0 : -1;
    board.setAttribute("role", "group");
    board.setAttribute("aria-describedby", "resonance-weave-status");
    board.setAttribute(
      "aria-label",
      session.status === "active"
        ? "環境微光互動區。左右方向鍵切換微光，Enter 或空白鍵執行目前步驟。"
        : "環境微光預覽"
    );

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 1000 620");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("aria-hidden", "true");
    svg.classList.add("resonance-weave__svg");
    svg.innerHTML = [
      '<defs>',
      '  <radialGradient id="weave-lake-glow" cx="50%" cy="46%" r="68%">',
      '    <stop offset="0%" stop-color="hsl(var(--weave-phase-hue) 78% 66% / .25)"/>',
      '    <stop offset="100%" stop-color="#071827" stop-opacity=".08"/>',
      '  </radialGradient>',
      '  <filter id="weave-knot-glow" x="-80%" y="-80%" width="260%" height="260%">',
      '    <feGaussianBlur stdDeviation="8" result="blur"/>',
      '    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>',
      '  </filter>',
      '  <marker id="weave-current-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">',
      '    <path d="M 0 0 L 10 5 L 0 10 z" fill="#bcebf3"/>',
      '  </marker>',
      '</defs>',
      '<ellipse class="resonance-weave__water-fill" cx="500" cy="310" rx="465" ry="250"/>',
      '<ellipse class="resonance-weave__contour is-outer" cx="500" cy="310" rx="440" ry="220"/>',
      '<ellipse class="resonance-weave__contour is-middle" cx="500" cy="310" rx="330" ry="158"/>',
      '<ellipse class="resonance-weave__contour is-inner" cx="500" cy="310" rx="205" ry="92"/>'
    ].join("");

    for (const knot of session.knots) svg.appendChild(createKnotNode(knot));

    const gesturePath = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    gesturePath.classList.add("resonance-weave__gesture");
    gesturePath.dataset.weaveGesture = "true";
    svg.appendChild(gesturePath);
    board.appendChild(svg);

    if (session.status === "active") {
      svg.addEventListener("pointerdown", handlePointerDown);
      svg.addEventListener("pointermove", handlePointerMove);
      svg.addEventListener("pointerup", handlePointerUp);
      svg.addEventListener("pointercancel", cancelPointerGesture);
      board.addEventListener("keydown", handleBoardKeydown);
      listenerCount = 5;
    } else {
      listenerCount = 0;
    }
    return board;
  }

  function createKnotNode(knot) {
    const namespace = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(namespace, "g");
    group.classList.add("resonance-weave__knot", `is-${knot.status}`, `is-${knot.kind}`);
    if (knot.id === session.focusedKnotId) group.classList.add("is-focused");
    group.dataset.weaveKnot = "true";
    group.dataset.knotId = knot.id;
    const x = (knot.x + Number(knot.visualOffset?.x || 0)) * 1000;
    const y = (knot.y + Number(knot.visualOffset?.y || 0)) * 620;
    group.setAttribute("transform", `translate(${round(x)} ${round(y)})`);

    const current = document.createElementNS(namespace, "line");
    current.classList.add("resonance-weave__current");
    current.setAttribute("x1", String(round(-knot.current.x * 25)));
    current.setAttribute("y1", String(round(-knot.current.y * 25)));
    current.setAttribute("x2", String(round(knot.current.x * 46)));
    current.setAttribute("y2", String(round(knot.current.y * 46)));
    current.setAttribute("marker-end", "url(#weave-current-arrow)");

    const halo = document.createElementNS(namespace, "circle");
    halo.classList.add("resonance-weave__halo");
    halo.setAttribute("r", String(Math.max(34, knot.radius * 1000)));

    const core = document.createElementNS(namespace, "circle");
    core.classList.add("resonance-weave__core");
    core.setAttribute("r", knot.kind === "noise_knot" ? "18" : "15");
    group.append(current, halo, core);
    return group;
  }

  function createControls(progress) {
    const controls = document.createElement("div");
    controls.className = "resonance-weave__controls";

    if (session.status === "preview") {
      controls.append(
        createButton("開始整理環境微光", start, true),
        createButton("回到棲地實踐", leave)
      );
      return controls;
    }

    if (session.status === "completed") {
      controls.append(
        createButton("用同一片水流再整理一次", replay, true),
        createButton("完成，回到棲地", leave)
      );
      return controls;
    }

    const focusControls = document.createElement("div");
    focusControls.className = "resonance-weave__focus-controls";
    focusControls.append(
      createButton("上一束", () => applyKeyboard("focus_previous")),
      createButton("下一束", () => applyKeyboard("focus_next"))
    );
    controls.appendChild(focusControls);

    const step = STEP_PRESENTATION[progress.stepId] || STEP_PRESENTATION.circle;
    const semanticAction = progress.stepId === "drag_against_current"
      ? "drag_against_current"
      : progress.stepId;
    controls.append(
      createButton(step.action, () => applyKeyboard(semanticAction), true),
      createButton("先離開，沒有損失", leave)
    );
    return controls;
  }

  function createButton(label, onClick, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = primary
      ? "resonance-weave__button is-primary"
      : "resonance-weave__button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function start() {
    const result = startResonanceWeave(session);
    applyResult(result, "微光開始沿湖面流動。先選一束，慢慢圈住它。", true);
  }

  function replay() {
    const result = replayResonanceWeave(session);
    applyResult(result, "同一片水流重新展開；沒有新增任何進度。", true);
  }

  function selectPhase(phaseId) {
    const result = setResonanceWeavePhase(session, phaseId);
    if (!result.ok) {
      render("這個時刻無法顯示；其餘內容沒有改變。");
      return;
    }
    try {
      setTimePhase?.(phaseId);
    } catch {
      render("棲地光線暫時無法切換；互動與回報仍沒有改變。");
      return;
    }
    session = result.session;
    render(`湖邊等到了${PHASE_PRESENTATION[phaseId].label}時；內容與回報完全相同。`);
  }

  function applyKeyboard(action) {
    const result = applyResonanceWeaveKeyboard(session, { action });
    applyResult(result, result.ok ? "" : inputFailureCopy(result.reason), true);
  }

  function handleBoardKeydown(event) {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      applyKeyboard("focus_next");
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      applyKeyboard("focus_previous");
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const action = session.stepId === "drag_against_current"
        ? "drag_against_current"
        : session.stepId;
      applyKeyboard(action);
    }
  }

  function handlePointerDown(event) {
    if (session?.status !== "active" || event.isPrimary === false) return;
    const svg = event.currentTarget;
    const point = pointerPoint(event, svg);
    if (!point) return;
    const targetId = resolvePointerTargetId(event, point);
    if (!targetId) {
      render("只需要圈住環境微光；夥伴不在這個互動層裡。");
      return;
    }
    event.preventDefault();
    try {
      svg.setPointerCapture?.(event.pointerId);
    } catch {
      // Synthetic accessibility QA events may not own a browser pointer capture.
    }
    pointerGesture = {
      pointerId: event.pointerId,
      action: session.stepId === "drag_against_current" ? "drag" : session.stepId,
      targetId,
      start: point,
      points: [point]
    };
    updateGesturePath(svg, pointerGesture.points);
  }

  function handlePointerMove(event) {
    if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return;
    const point = pointerPoint(event, event.currentTarget);
    if (!point) return;
    event.preventDefault();
    pointerGesture.points.push(point);
    updateGesturePath(event.currentTarget, pointerGesture.points);
  }

  function handlePointerUp(event) {
    if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return;
    event.preventDefault();
    const svg = event.currentTarget;
    const point = pointerPoint(event, svg) || pointerGesture.points.at(-1);
    pointerGesture.points.push(point);
    try {
      svg.releasePointerCapture?.(event.pointerId);
    } catch {
      // The gesture remains valid even when pointer capture is unavailable.
    }
    const gesture = pointerGesture;
    pointerGesture = null;

    let result;
    if (gesture.action === "circle") {
      result = applyResonanceWeavePointer(session, {
        action: "circle",
        targetId: gesture.targetId,
        targetType: "environment",
        path: gesture.points
      });
    } else if (gesture.action === "drag") {
      result = applyResonanceWeavePointer(session, {
        action: "drag",
        targetId: gesture.targetId,
        targetType: "environment",
        from: gesture.start,
        to: point
      });
    } else {
      result = applyResonanceWeavePointer(session, {
        action: "release",
        targetId: gesture.targetId,
        targetType: "environment"
      });
    }
    applyResult(result, result.ok ? "" : inputFailureCopy(result.reason), true);
  }

  function cancelPointerGesture(event) {
    if (!pointerGesture || event.pointerId !== pointerGesture.pointerId) return;
    pointerGesture = null;
    updateGesturePath(event.currentTarget, []);
  }

  function resolvePointerTargetId(event, point) {
    const directId = event.target?.closest?.("[data-weave-knot]")?.dataset?.knotId;
    if (directId && isEligiblePointerKnot(directId)) return directId;
    let closest = null;
    let closestDistance = Number.POSITIVE_INFINITY;
    for (const knot of session.knots) {
      if (!isEligiblePointerKnot(knot.id)) continue;
      const distance = Math.hypot(point.x - knot.x, point.y - knot.y);
      if (distance < closestDistance) {
        closest = knot.id;
        closestDistance = distance;
      }
    }
    return closestDistance <= POINTER_NEAR_RADIUS ? closest : null;
  }

  function isEligiblePointerKnot(knotId) {
    const knot = session.knots.find(({ id }) => id === knotId);
    if (!knot || knot.targetType !== "environment") return false;
    if (session.stepId === "circle") return knot.status === "waiting";
    return knot.id === session.activeKnotId;
  }

  function applyResult(result, failureMessage = "", focusBoard = false) {
    if (result?.ok && result.session) session = result.session;
    render(result?.ok ? "" : failureMessage);
    if (focusBoard && session?.status === "active") {
      root?.querySelector(".resonance-weave__lake")?.focus({ preventScroll: true });
    }
  }

  function leave() {
    if (session) session = exitResonanceWeave(session).session || session;
    const callback = exitCallback;
    destroy();
    callback?.();
  }

  function destroy() {
    pointerGesture = null;
    listenerCount = 0;
    if (root?.isConnected) root.remove();
    root = null;
    host = null;
    session = null;
    exitCallback = null;
  }

  function getDiagnostics() {
    return {
      mounted: Boolean(root?.isConnected),
      status: session?.status || null,
      phaseId: session?.phaseId || null,
      knotCount: session?.knots?.length || 0,
      listenerCount,
      timerCount: 0,
      permanentWriteCount: 0,
      companionTargetCount: 0
    };
  }

  return { open, destroy, getDiagnostics };
}

function pointerPoint(event, svg) {
  if (typeof svg?.createSVGPoint === "function" && typeof svg?.getScreenCTM === "function") {
    const matrix = svg.getScreenCTM();
    if (matrix) {
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const local = point.matrixTransform(matrix.inverse());
      return {
        x: clamp(local.x / 1000, 0, 1),
        y: clamp(local.y / 620, 0, 1)
      };
    }
  }
  const bounds = svg?.getBoundingClientRect?.();
  if (!bounds?.width || !bounds?.height) return null;
  return {
    x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
    y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1)
  };
}

function updateGesturePath(svg, points) {
  const path = svg?.querySelector?.("[data-weave-gesture]");
  if (!path) return;
  path.setAttribute(
    "points",
    (points || []).map(({ x, y }) => `${round(x * 1000)},${round(y * 620)}`).join(" ")
  );
}

function inputFailureCopy(reason) {
  const copy = {
    "circle-does-not-enclose-target": "圓還沒有完整包住微光；可以放慢一點再試。",
    "drag-not-against-current": "這次順著水流了。沿箭頭反方向慢慢帶回即可。",
    "wrong-step": "先完成眼前這一步；沒有時間壓力。",
    "invalid-environment-target": "只選擇仍在湖面上的環境微光。",
    "invalid-active-target": "先回到剛才圈住的那一束。",
    "target-not-stable": "先讓這束微光穩定，再把它放回湖面。",
    "companion-target-forbidden": "夥伴不會成為圈選目標。"
  };
  return copy[reason] || "這個手勢沒有推進狀態；你可以慢慢再試。";
}

function normalizePhaseId(value) {
  return RESONANCE_WEAVE_PHASES.some(({ id }) => id === value) ? value : null;
}

function defaultReducedMotion() {
  return Boolean(globalThis.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
    || globalThis.document?.documentElement?.dataset?.reducedMotionPreference === "reduced";
}

function phaseHue(phaseId) {
  return { dawn: 37, day: 188, dusk: 24, night: 239 }[phaseId] || 188;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value) {
  return Number(value.toFixed(3));
}

function ensureStyles() {
  if (document.getElementById("resonance-weave-r2-styles")) return;
  const style = document.createElement("style");
  style.id = "resonance-weave-r2-styles";
  style.textContent = `
    .resonance-weave {
      --weave-ink: #071827;
      --weave-cyan: #72d7e6;
      --weave-gold: #f0c98a;
      --weave-indigo: #7774d6;
      display: grid;
      inline-size: min(100%, 680px);
      min-inline-size: 0;
      gap: 12px;
      color: #eefbff;
    }
    .resonance-weave__ethic {
      margin: 0;
      padding: 10px 12px;
      border-inline-start: 2px solid color-mix(in srgb, var(--weave-cyan) 65%, transparent);
      background: linear-gradient(90deg, rgba(20, 53, 76, .78), transparent);
      color: #d8f2f7;
      font-size: 12px;
      line-height: 1.55;
    }
    .resonance-weave__phases {
      min-inline-size: 0;
      margin: 0;
      padding: 0;
      border: 0;
    }
    .resonance-weave__phases legend {
      margin-block-end: 6px;
      padding: 0;
      color: #b9dfe7;
      font-size: 11px;
      letter-spacing: .08em;
    }
    .resonance-weave__phase-grid,
    .resonance-weave__focus-controls {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }
    .resonance-weave__phase,
    .resonance-weave__button {
      min-inline-size: 0;
      min-block-size: 48px;
      border: 1px solid rgba(123, 200, 214, .28);
      border-radius: 15px;
      background: rgba(8, 29, 46, .74);
      color: #eaf9fc;
      font: inherit;
      line-height: 1.3;
      overflow-wrap: anywhere;
      touch-action: manipulation;
    }
    .resonance-weave__phase {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      padding: 7px 10px;
      text-align: start;
    }
    .resonance-weave__phase > span {
      display: grid;
      place-items: center;
      inline-size: 30px;
      block-size: 30px;
      border-radius: 50%;
      background: hsl(var(--weave-phase-hue) 62% 57% / .15);
      color: var(--weave-gold);
      font-family: ui-serif, "Noto Serif TC", serif;
      font-size: 16px;
    }
    .resonance-weave__phase small { color: #c6e5eb; }
    .resonance-weave__phase[aria-pressed="true"] {
      border-color: hsl(var(--weave-phase-hue) 78% 72% / .8);
      background: linear-gradient(115deg, hsl(var(--weave-phase-hue) 45% 29% / .72), rgba(10, 34, 53, .86));
      box-shadow: inset 0 0 0 1px hsl(var(--weave-phase-hue) 75% 75% / .14);
    }
    .resonance-weave__lake {
      position: relative;
      min-inline-size: 0;
      border: 1px solid hsl(var(--weave-phase-hue) 65% 70% / .32);
      border-radius: 46% 54% 48% 52% / 18% 18% 22% 22%;
      overflow: hidden;
      background:
        radial-gradient(ellipse at 50% 48%, hsl(var(--weave-phase-hue) 72% 56% / .17), transparent 58%),
        linear-gradient(180deg, rgba(16, 53, 78, .86), var(--weave-ink));
      box-shadow: inset 0 -24px 45px rgba(0, 0, 0, .22), 0 14px 30px rgba(2, 16, 27, .24);
      touch-action: none;
    }
    .resonance-weave__lake:focus-visible,
    .resonance-weave button:focus-visible {
      outline: 3px solid var(--weave-gold);
      outline-offset: 2px;
    }
    .resonance-weave__svg {
      display: block;
      inline-size: 100%;
      block-size: auto;
      min-block-size: 230px;
      max-block-size: 330px;
    }
    .resonance-weave__water-fill { fill: url(#weave-lake-glow); }
    .resonance-weave__contour {
      fill: none;
      stroke: hsl(var(--weave-phase-hue) 65% 78% / .18);
      stroke-width: 3;
      stroke-dasharray: 9 16;
    }
    .resonance-weave__contour.is-middle { stroke-dasharray: 5 14; }
    .resonance-weave__contour.is-inner { stroke: var(--weave-cyan); stroke-opacity: .18; }
    .resonance-weave__knot { cursor: crosshair; }
    .resonance-weave__halo {
      fill: hsl(var(--weave-phase-hue) 82% 67% / .12);
      stroke: hsl(var(--weave-phase-hue) 82% 78% / .58);
      stroke-width: 3;
      stroke-dasharray: 7 8;
    }
    .resonance-weave__core {
      fill: var(--weave-cyan);
      filter: url(#weave-knot-glow);
    }
    .resonance-weave__knot.is-noise_knot .resonance-weave__core { fill: var(--weave-indigo); }
    .resonance-weave__knot.is-focused .resonance-weave__halo {
      stroke: var(--weave-gold);
      stroke-width: 6;
    }
    .resonance-weave__knot.is-circled .resonance-weave__halo,
    .resonance-weave__knot.is-stable .resonance-weave__halo { stroke: var(--weave-gold); }
    .resonance-weave__knot.is-released { opacity: .24; pointer-events: none; }
    .resonance-weave__current {
      stroke: rgba(190, 235, 244, .64);
      stroke-width: 5;
      stroke-linecap: round;
      stroke-dasharray: 8 7;
    }
    .resonance-weave__gesture {
      fill: none;
      stroke: var(--weave-gold);
      stroke-width: 7;
      stroke-linecap: round;
      stroke-linejoin: round;
      pointer-events: none;
    }
    .resonance-weave[data-status="active"] .resonance-weave__knot.is-waiting .resonance-weave__core {
      animation: resonance-weave-breathe 2.8s ease-in-out infinite alternate;
    }
    .resonance-weave__status {
      display: grid;
      min-inline-size: 0;
      gap: 4px;
      padding-inline: 2px;
      line-height: 1.45;
    }
    .resonance-weave__status strong { color: #f3fdff; font-size: 14px; }
    .resonance-weave__status span { color: #c4dde4; font-size: 12px; }
    .resonance-weave__status small { color: #91bbc4; font-size: 11px; }
    .resonance-weave__controls { display: grid; min-inline-size: 0; gap: 8px; }
    .resonance-weave__button { padding: 9px 12px; }
    .resonance-weave__button.is-primary {
      border-color: rgba(144, 229, 240, .68);
      background: linear-gradient(110deg, rgba(28, 105, 126, .9), rgba(74, 65, 137, .9));
    }
    @keyframes resonance-weave-breathe {
      from { opacity: .72; transform: scale(.9); }
      to { opacity: 1; transform: scale(1.15); }
    }
    @media (min-width: 540px) {
      .resonance-weave__phase-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .resonance-weave__controls { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .resonance-weave__focus-controls { grid-column: 1 / -1; }
    }
    @media (max-height: 700px) {
      .resonance-weave { gap: 8px; }
      .resonance-weave__svg { min-block-size: 190px; max-block-size: 230px; }
      .resonance-weave__ethic { padding-block: 7px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .resonance-weave *, .resonance-weave *::before, .resonance-weave *::after {
        animation: none !important;
        scroll-behavior: auto !important;
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}
