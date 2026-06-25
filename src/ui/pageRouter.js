import { BOND_MILESTONES } from "../engine/bondMilestoneEngine.js";
import { qs, qsa } from "../utils/dom.js";

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
  openCodex
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
    render();
  }

  function navigate(action = "home") {
    if (!PAGE_ACTIONS.has(action)) return;

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
          <h3>月湖營地</h3>
          <p>首輪探索只開放月湖周邊。你可以看見棲地、記憶痕跡與灰影貓願意靠近的距離。</p>
        </div>
      </div>
      <div class="page-evidence-strip" aria-label="探索狀態">
        <span><strong>${traceCount}</strong><em>可見痕跡</em></span>
        <span><strong>${memoryCount}</strong><em>情緒記憶</em></span>
      </div>
      <div class="page-action-grid">
        <button type="button" data-page-action="open-map">
          <strong>查看月湖路徑</strong>
          <em>打開既有探索地圖，不擴張新區域。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="lake_glow" data-status="湖面留下了一圈柔和微光。">
          <strong>靠近湖面微光</strong>
          <em>安靜觀察牠留下的回應。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="silent_crystal" data-status="晶簇亮起微光，空氣變得穩定。">
          <strong>觀察靜默晶簇</strong>
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
    const primaryCareLabel = defense >= 60 ? "保持距離陪伴" : "靜靜陪伴";
    const primaryCareStatus = defense >= 60
      ? "你放慢靠近的速度，讓牠保有自己的距離。"
      : "你沒有要求牠回應，只是安靜地待在旁邊。";

    body.innerHTML = `
      <div class="page-meter-card">
        ${renderMetric("邊界", defense, "牠是否需要更多空間")}
        ${renderMetric("信任", trust, "牠是否願意靠近")}
        ${renderMetric("精力", energy * 10, "目前活動餘裕")}
      </div>
      <p class="page-soft-note">照顧不是消耗品交換或討好。這裡只提供陪伴、休息與觀察，讓灰影貓可以選擇靠近或保持距離。</p>
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="${primaryCareChoice}" data-status="${primaryCareStatus}">
          <strong>${primaryCareLabel}</strong>
          <em>尊重牠此刻的邊界。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="rest_together" data-status="棲地安靜下來，適合一起休息。">
          <strong>一起休息</strong>
          <em>不催促互動，只讓棲地慢下來。</em>
        </button>
        <button type="button" data-page-action="open-character">
          <strong>觀察狀態</strong>
          <em>查看牠的身體語言與邊界提示。</em>
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
          <p>${nextMilestone ? `這不是能力排行；只是你們的關係被真實互動慢慢推進。` : "目前已沒有新的 Demo 章節需要追逐。"}</p>
        </div>
      </div>
      <div class="page-progress-block" aria-label="關係章節進度">
        <div class="page-progress-line"><span style="width:${nextProgress}%"></span></div>
        <p>${nextMilestone ? `羈絆 ${bond} / ${nextMilestone.threshold}` : `羈絆 ${bond}`}</p>
      </div>
      <div class="page-tendency-grid">
        ${renderTendency("信任", toNumber(state.trust))}
        ${renderTendency("心情", MOOD_LABELS[state.mood] || state.mood || "平靜", false)}
        ${renderTendency("邊界", toNumber(state.defense))}
      </div>
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="grow" data-choice="trust_tuning" data-status="信任回路略微對齊。">
          <strong>信任校準</strong>
          <em>把節奏調回彼此都能承受的距離。</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="grow" data-choice="emotional_balance" data-status="心核回到更穩定的節奏。">
          <strong>情緒穩定</strong>
          <em>不追求變強，只整理目前的狀態。</em>
        </button>
        <button type="button" data-page-action="open-codex">
          <strong>回看資料</strong>
          <em>查看既有 companion 資料，仍維持單一夥伴模型。</em>
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
        <span><strong>${Array.isArray(state.memories) ? state.memories.length : 0}</strong><em>互動記憶</em></span>
        <span><strong>${emotionalCount}</strong><em>情緒記憶</em></span>
        <span><strong>${Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0}</strong><em>棲地痕跡</em></span>
      </div>
      <div class="page-memory-list" aria-label="已保存的記憶與痕跡">
        ${renderMemoryEntries(renderedMemoryEntries)}
      </div>
      <div class="page-action-grid">
        ${canEcho ? `
          <button type="button" data-page-action="commit" data-nav-action="memory" data-choice="memory_echo" data-status="最近的記憶被輕輕回看了一次。">
            <strong>回聽最近共鳴</strong>
            <em>只根據已存在的情緒記憶回應。</em>
          </button>
        ` : ""}
        <button type="button" data-page-action="open-soul-talk">
          <strong>開啟心語</strong>
          <em>如果你願意，可以直接和牠說話。</em>
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
  if (action === "explore") return "探索頁已開啟：目前只顯示月湖首輪內容。";
  if (action === "care") return "照顧頁已開啟：以陪伴、休息與觀察為主。";
  if (action === "grow") return "成長頁已開啟：呈現關係章節，不呈現能力排行。";
  if (action === "memory") return "記憶頁已開啟：只呈現已保存資料。";
  return "回到月湖棲地。";
}

function renderMetric(label, value, hint) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  return `
    <div class="page-meter" style="--value:${safeValue}%">
      <div class="page-meter-head"><strong>${escapeHtml(label)}</strong><span>${safeValue}</span></div>
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

  const traces = (Array.isArray(state.habitatTraces) ? state.habitatTraces : []).map((trace) => ({
    kind: "trace",
    source: trace,
    title: `棲地痕跡：${trace.type || trace.emotion || "unknown"}`,
    copy: `強度 ${Math.round((Number(trace.intensity) || 0) * 100)}%。這是 runtime 實際保存的 trace。`,
    createdAt: Number(trace.lastUpdatedAt) || Number(trace.createdAt) || 0,
    meta: trace.status || trace.memoryId || ""
  }));

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
