import { BOND_MILESTONES } from "../engine/bondMilestoneEngine.js";
import { getTraceDisplayCopy } from "../engine/traceVisualMapper.js";
import { qs, qsa } from "../utils/dom.js";
import EventBus from "../utils/eventBus.js";
import { t, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";

const PAGE_ACTIONS = new Set(["home", "explore", "care", "grow", "memory"]);
const MOOD_LABELS = {
  calm: "平靜",
  warm: "靠近",
  distant: "保持距離",
  defensive: "需要邊界",
  tired: "疲倦",
  happy: "明亮"
};
const MEMORY_LIMIT = 8;

export function createPageRouter({
  store,
  panelManager,
  soulTalkController,
  actionSheetController,
  statusText,
  openMap,
  openCodex,
  openAtlas
}) {
  const pageLayer = qs("#page-layer");
  const pageViews = pageLayer ? qsa("[data-page]", pageLayer) : [];
  const pageBodies = {
    explore: qs("#explore-page-body"),
    care: qs("#care-page-body"),
    grow: qs("#growth-page-body"),
    memory: qs("#memory-page-body")
  };
  let activePage = "home";
  let renderedMemoryEntries = [];

  function bind() {
    if (!pageLayer) return;
    pageLayer.addEventListener("click", handlePageClick);
    pageLayer.addEventListener("keydown", handlePageKeydown);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePage !== "home" && !panelManager.isPanelOpen()) {
        navigate("home");
      }
    });
    // 語言切換時重畫目前分頁：t() 字串已 baked 進 innerHTML，靜態 DOM 掃描掃不到。
    // render() 在 home 會自行 early-return，背景分頁（如切語言時開著的 Explore）則就地以新語言重畫。
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => render());
    render();
  }

  function navigate(action = "home") {
    if (!PAGE_ACTIONS.has(action)) return;

    // 再按一次目前分頁 → 收合回 home（toggle 開關）。
    if (action !== "home" && action === activePage) {
      action = "home";
    }

    activePage = action;
    pageLayer?.setAttribute("data-active-page", action);
    document.body.classList.toggle("page-open", action !== "home");

    pageViews.forEach((view) => {
      const isActive = action !== "home" && view.dataset.page === action;
      view.hidden = !isActive;
      view.classList.toggle("is-active", isActive);
      view.setAttribute("aria-hidden", String(!isActive));
    });

    if (action === "home") {
      actionSheetController.showHome();
      statusText.textContent = "回到月湖棲地。";
      return;
    }

    panelManager.closePanel();
    actionSheetController.setActiveNav(action);
    statusText.textContent = getPageStatus(action);
    render();
  }

  function render() {
    if (!pageLayer || activePage === "home") return;
    const state = store.getState();
    if (activePage === "explore") renderExplore(state);
    if (activePage === "care") renderCare(state);
    if (activePage === "grow") renderGrowth(state);
    if (activePage === "memory") renderMemory(state);
  }

  function renderExplore(state) {
    const body = pageBodies.explore;
    if (!body) return;
    const traceCount = Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0;
    const memoryCount = Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0;
    body.innerHTML = `
      <div class="page-focus-card page-focus-card--moonlake">
        <span class="page-orb" aria-hidden="true">☾</span>
        <div>
          <p class="page-card-kicker">Moonlake Camp</p>
          <h3>${t("explore.cardTitle")}</h3>
          <p>月湖周邊已醒來。牠願意靠近的距離，會慢慢改變。</p>
        </div>
      </div>
      <div class="page-evidence-strip" aria-label="探索狀態">
        <span><strong>${traceCount}</strong><em>${t("explore.evTraces")}</em></span>
        <span><strong>${memoryCount}</strong><em>${t("explore.evMemories")}</em></span>
      </div>
      <div class="page-action-grid">
        <button type="button" data-page-action="open-map">
          <strong>${t("explore.openMap")}</strong>
          <em>看看月湖的小路。</em>
        </button>
        <button type="button" data-page-action="open-atlas">
          <strong>${t("explore.atlas")}</strong>
          <em>遠望整片大陸。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="lake_glow" data-status="湖面留下了一圈柔和微光。">
          <strong>${t("explore.lakeGlow")}</strong>
          <em>安靜觀察牠留下的回應。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="silent_crystal" data-status="晶簇亮起微光，空氣變得穩定。">
          <strong>${t("explore.crystal")}</strong>
          <em>留下可見的棲地痕跡。</em>
        </button>
      </div>
    `;
  }

  function renderCare(state) {
    const body = pageBodies.care;
    if (!body) return;
    const defense = toNumber(state.defense);
    const energy = toNumber(state.energy);
    const trust = toNumber(state.trust);
    const primaryCareChoice = defense >= 60 ? "gentle_presence" : "soft_comfort";
    const primaryCareLabel = defense >= 60 ? t("care.keepDistance") : t("care.sitQuiet");
    const primaryCareStatus = defense >= 60
      ? "你放慢靠近的速度，讓牠保有自己的距離。"
      : "你沒有要求牠回應，只是安靜地待在旁邊。";

    body.innerHTML = `
      <div class="page-meter-card">
        ${renderMetric(t("care.boundary"), defense, "牠是否需要更多空間")}
        ${renderMetric(t("care.trust"), trust, "牠是否願意靠近")}
        ${renderMetric(t("care.energy"), energy, "目前活動餘裕", 10)}
      </div>
      <p class="page-soft-note">這裡不交換、不討好。陪伴牠，也讓牠選擇距離。</p>
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="${primaryCareChoice}" data-status="${primaryCareStatus}">
          <strong>${primaryCareLabel}</strong>
          <em>尊重牠此刻的邊界。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="rest_together" data-status="棲地安靜下來，適合一起休息。">
          <strong>${t("care.restTogether")}</strong>
          <em>讓棲地慢下來。</em>
        </button>
        <button type="button" data-page-action="open-character">
          <strong>${t("care.observe")}</strong>
          <em>看牠的身體語言。</em>
        </button>
      </div>
    `;
  }

  function renderGrowth(state) {
    const body = pageBodies.grow;
    if (!body) return;
    const bond = toNumber(state.bond);
    const reachedMilestones = getReachedMilestones(state);
    const nextMilestone = BOND_MILESTONES.find((milestone) => !reachedMilestones.has(milestone.id));
    const nextProgress = nextMilestone ? Math.min(100, Math.round((bond / nextMilestone.threshold) * 100)) : 100;

    body.innerHTML = `
      <div class="page-focus-card">
        <span class="page-orb" aria-hidden="true">✧</span>
        <div>
          <p class="page-card-kicker">Relationship Chapter</p>
          <h3>${nextMilestone ? `下一段：${escapeHtml(nextMilestone.theme)}` : "已抵達目前章節終點"}</h3>
          <p>${nextMilestone ? `不是能力排行，是關係慢慢往前。` : "這一章先到這裡。不用追。"}</p>
        </div>
      </div>
      <div class="page-progress-block" aria-label="關係章節進度">
        <div class="page-progress-line"><span style="width:${nextProgress}%"></span></div>
        <p>${nextMilestone ? `羈絆 ${bond} / ${nextMilestone.threshold}` : `羈絆 ${bond}`}</p>
      </div>
      <div class="page-tendency-grid">
        ${renderTendency(t("char.trust"), toNumber(state.trust))}
        ${renderTendency(t("char.mood"), MOOD_LABELS[state.mood] || state.mood || "平靜", false)}
        ${renderTendency(t("char.boundary"), toNumber(state.defense))}
      </div>
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="grow" data-choice="trust_tuning" data-status="信任回路略微對齊。">
          <strong>${t("growth.trustTune")}</strong>
          <em>把節奏調回來。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="grow" data-choice="emotional_balance" data-status="心核回到更穩定的節奏。">
          <strong>${t("growth.emotionBalance")}</strong>
          <em>整理現在的狀態。</em>
        </button>
        <button type="button" data-page-action="open-codex">
          <strong>${t("growth.review")}</strong>
          <em>翻翻牠的圖鑑。</em>
        </button>
      </div>
    `;
  }

  function renderMemory(state) {
    const body = pageBodies.memory;
    if (!body) return;
    renderedMemoryEntries = collectMemoryEntries(state);
    const emotionalCount = Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0;
    const canEcho = emotionalCount >= 3;

    body.innerHTML = `
      <div class="page-evidence-strip" aria-label="記憶證據">
        <span><strong>${Array.isArray(state.memories) ? state.memories.length : 0}</strong><em>${t("memory.evInteractions")}</em></span>
        <span><strong>${emotionalCount}</strong><em>${t("memory.evEmotional")}</em></span>
        <span><strong>${Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0}</strong><em>${t("memory.evTraces")}</em></span>
      </div>
      <div class="page-memory-list" aria-label="已保存的記憶與痕跡">
        ${renderMemoryEntries(renderedMemoryEntries)}
      </div>
      <div class="page-action-grid">
        ${canEcho ? `
          <button type="button" data-page-action="commit" data-nav-action="memory" data-choice="memory_echo" data-status="最近的記憶被輕輕回看了一次。">
            <strong>${t("memory.echo")}</strong>
            <em>回聽你們說過的話。</em>
          </button>
        ` : ""}
        <button type="button" data-page-action="open-soul-talk">
          <strong>${t("memory.openSoul")}</strong>
          <em>想說什麼都可以。</em>
        </button>
      </div>
    `;
  }

  function handlePageClick(event) {
    const memoryButton = event.target.closest("[data-memory-open]");
    if (memoryButton) {
      openMemoryReflection(Number(memoryButton.dataset.memoryOpen));
      return;
    }

    const actionButton = event.target.closest("[data-page-action]");
    if (!actionButton) return;
    handlePageAction(actionButton);
  }

  function handlePageKeydown(event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    const memoryButton = event.target.closest("[data-memory-open]");
    if (!memoryButton) return;
    event.preventDefault();
    openMemoryReflection(Number(memoryButton.dataset.memoryOpen));
  }

  function handlePageAction(button) {
    const action = button.dataset.pageAction;
    if (action === "open-map") {
      openMap?.();
      return;
    }
    if (action === "open-atlas") {
      openAtlas?.();
      return;
    }
    if (action === "open-character") {
      panelManager.openPanel("character");
      return;
    }
    if (action === "open-codex") {
      openCodex?.();
      return;
    }
    if (action === "open-soul-talk") {
      soulTalkController.openSoulTalk(panelManager);
      return;
    }
    if (action === "commit") {
      actionSheetController.performAction(button.dataset.navAction, {
        choice: button.dataset.choice,
        status: button.dataset.status
      });
      render();
    }
  }

  function openMemoryReflection(index) {
    const entry = renderedMemoryEntries[index];
    if (!entry?.source || entry.kind !== "emotional") return;
    soulTalkController.reflectOnMemory(entry.source);
    soulTalkController.openSoulTalk(panelManager);
  }

  return {
    bind,
    navigate,
    render,
    getActivePage: () => activePage
  };
}

function getPageStatus(action) {
  if (action === "explore") return "月湖就在眼前。";
  if (action === "care") return "陪伴、休息、觀察。";
  if (action === "grow") return "關係章節翻開了。";
  if (action === "memory") return "已保存的回憶在這裡。";
  return "回到月湖棲地。";
}

function renderMetric(label, value, hint, max = 100) {
  const numericValue = Number(value) || 0;
  const percent = Math.max(0, Math.min(100, Math.round((numericValue / max) * 100)));
  const displayValue = Math.max(0, Math.min(max, Math.round(numericValue)));
  return `
    <div class="page-meter" style="--value:${percent}%">
      <div class="page-meter-head"><strong>${escapeHtml(label)}</strong><span>${displayValue}</span></div>
      <div class="page-meter-line"><span></span></div>
      <em>${escapeHtml(hint)}</em>
    </div>
  `;
}

function renderTendency(label, value, numeric = true) {
  return `
    <span class="page-tendency">
      <em>${escapeHtml(label)}</em>
      <strong>${numeric ? Math.round(Number(value) || 0) : escapeHtml(String(value || ""))}</strong>
    </span>
  `;
}

function getReachedMilestones(state) {
  const emotionalMemories = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  return new Set(emotionalMemories.map((memory) => memory?.id).filter(Boolean));
}

function collectMemoryEntries(state) {
  const emotional = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : []).map((memory) => ({
    kind: "emotional",
    source: memory,
    title: memory.theme || memory.label || "情緒記憶",
    copy: memory.excerpt || memory.label || "牠把這段感受留在棲地裡。",
    createdAt: Number(memory.lastUpdatedAt) || Number(memory.createdAt) || 0,
    meta: [memory.status, memory.emotion].filter(Boolean).join(" · ")
  }));

  const simple = (Array.isArray(state.memories) ? state.memories : []).map((memory) => ({
    kind: "memory",
    source: memory,
    title: memory.title || "互動記憶",
    copy: memory.text || "這是一段已保存的互動。",
    createdAt: Number(memory.createdAt) || 0,
    meta: memory.type || ""
  }));

  const traces = (Array.isArray(state.habitatTraces) ? state.habitatTraces : []).map((trace) => {
    const display = getTraceDisplayCopy(trace);
    const intensityPct = Math.round((Number(trace.intensity) || 0) * 100);
    return {
      kind: "trace",
      source: trace,
      title: display.title,
      copy: `${display.copy}（強度 ${intensityPct}%）`,
      createdAt: Number(trace.lastUpdatedAt) || Number(trace.createdAt) || 0,
      meta: trace.status || trace.memoryId || ""
    };
  });

  return [...emotional, ...simple, ...traces]
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, MEMORY_LIMIT);
}

function renderMemoryEntries(entries) {
  if (!entries.length) {
    return `
      <article class="page-empty-memory">
        <strong>還沒有保存的記憶或痕跡</strong>
        <p>等你和灰影貓留下真實互動後，這裡才會出現內容。</p>
      </article>
    `;
  }

  return entries.map((entry, index) => {
    const isReflectable = entry.kind === "emotional";
    const tag = isReflectable ? "button" : "article";
    const attrs = isReflectable
      ? `type="button" data-memory-open="${index}" aria-label="回看 ${escapeHtml(entry.title)}"`
      : "";
    return `
      <${tag} class="page-memory-row page-memory-row--${entry.kind}" ${attrs}>
        <span class="page-memory-glyph" aria-hidden="true">${entry.kind === "trace" ? "◇" : "✦"}</span>
        <span class="page-memory-copy">
          <strong>${escapeHtml(entry.title)}</strong>
          <em>${escapeHtml(trimText(entry.copy, 92))}</em>
          <small>${escapeHtml(formatDate(entry.createdAt))}${entry.meta ? ` · ${escapeHtml(entry.meta)}` : ""}</small>
        </span>
      </${tag}>
    `;
  }).join("");
}

function trimText(text, limit) {
  const safeText = String(text || "");
  return safeText.length > limit ? `${safeText.slice(0, limit)}…` : safeText;
}

function formatDate(value) {
  if (!value) return "未標記時間";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未標記時間";
  return date.toLocaleDateString("zh-TW", { month: "2-digit", day: "2-digit" });
}

function toNumber(value) {
  return Number.isFinite(Number(value)) ? Number(value) : 0;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
