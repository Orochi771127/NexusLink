import { BOND_MILESTONES } from "../engine/bondMilestoneEngine.js";
import { canAffordRecipe, listCraftRecipesForUi } from "../expedition/expeditionCraftEngine.js";
import { getShardType } from "../data/lootTables.js";
import { getTraceDisplayCopy } from "../engine/traceVisualMapper.js";
import { qs, qsa } from "../utils/dom.js";
import EventBus from "../utils/eventBus.js";
import { t, getLanguage, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";

const PAGE_ACTIONS = new Set(["home", "explore", "care", "grow", "memory"]);
const MOOD_KEYS = new Set(["calm", "warm", "distant", "defensive", "tired", "happy"]);
const MEMORY_LIMIT = 8;

function moodLabel(mood) {
  if (MOOD_KEYS.has(mood)) return t(`mood.${mood}`);
  return mood || t("mood.calm");
}

export function createPageRouter({
  store,
  panelManager,
  soulTalkController,
  actionSheetController,
  statusText,
  calmSyncController,
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
  let actionInFlight = false;

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
    // statusText 只在 navigate() 寫入，語言切換時需就地以新語言重設（覆寫暫態行動回饋屬預期）。
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
      statusText.textContent = getPageStatus(activePage);
      render();
    });
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
    setViewState(action === "home" ? "completed" : "ready");
    document.body.classList.toggle("page-open", action !== "home");

    pageViews.forEach((view) => {
      const isActive = action !== "home" && view.dataset.page === action;
      view.hidden = !isActive;
      view.classList.toggle("is-active", isActive);
      view.setAttribute("aria-hidden", String(!isActive));
    });

    if (action === "home") {
      actionSheetController.showHome();
      statusText.textContent = t("page.status.home");
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
    const vaultShards = state.expeditionVault?.shards || {};
    const shardStrip = Object.entries(vaultShards)
      .filter(([, count]) => Number(count) > 0)
      .map(([shardId, count]) => {
        const label = getShardType(shardId).label.zh;
        return `<span><strong>${Number(count)}</strong><em>${escapeHtml(label)}</em></span>`;
      })
      .join("");
    body.innerHTML = `
      <div class="page-focus-card page-focus-card--moonlake">
        <span class="page-orb" aria-hidden="true">☾</span>
        <div>
          <p class="page-card-kicker">Moonlake Camp</p>
          <h3>${t("explore.cardTitle")}</h3>
          <p>${t("explore.cardCopy")}</p>
        </div>
      </div>
      <div class="page-evidence-strip" aria-label="${t("explore.stateAria")}">
        <span><strong>${traceCount}</strong><em>${t("explore.evTraces")}</em></span>
        <span><strong>${memoryCount}</strong><em>${t("explore.evMemories")}</em></span>
        ${shardStrip}
      </div>
      <div class="page-action-grid">
        <button type="button" data-page-action="open-map">
          <strong>${t("explore.openMap")}</strong>
          <em>${t("explore.openMapSub")}</em>
        </button>
        <button type="button" data-page-action="open-atlas">
          <strong>${t("explore.atlas")}</strong>
          <em>${t("explore.atlasSub")}</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="lake_glow" data-status="${t("explore.lakeGlowStatus")}">
          <strong>${t("explore.lakeGlow")}</strong>
          <em>${t("explore.lakeGlowSub")}</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="explore" data-choice="silent_crystal" data-status="${t("explore.crystalStatus")}">
          <strong>${t("explore.crystal")}</strong>
          <em>${t("explore.crystalSub")}</em>
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
    // 高防備／剛拒絕 → 靜靜陪伴；平常 → 輕聲安撫（修正舊版標籤錯位）
    const primaryCareChoice = defense >= 60 || state.lastTouchReaction === "reject"
      ? "gentle_presence"
      : "soft_comfort";
    const primaryCareLabel = primaryCareChoice === "gentle_presence"
      ? t("care.keepDistance")
      : t("care.softComfort");
    const primaryCareStatus = primaryCareChoice === "gentle_presence"
      ? t("care.keepDistanceStatus")
      : t("care.softComfortStatus");

    body.innerHTML = `
      <div class="page-meter-card">
        ${renderMetric(t("care.boundary"), defense, t("care.hintBoundary"))}
        ${renderMetric(t("care.trust"), trust, t("care.hintTrust"))}
        ${renderMetric(t("care.energy"), energy, t("care.hintEnergy"), 10)}
      </div>
      <p class="page-soft-note">${t("care.softNote")}</p>
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="${primaryCareChoice}" data-status="${primaryCareStatus}">
          <strong>${primaryCareLabel}</strong>
          <em>${t("care.primarySub")}</em>
        </button>
        <button type="button" data-page-action="commit" data-nav-action="care" data-choice="rest_together" data-status="${t("care.restStatus")}">
          <strong>${t("care.restTogether")}</strong>
          <em>${t("care.restSub")}</em>
        </button>
        <button type="button" data-page-action="open-calm-sync">
          <strong>${t("care.calmSync")}</strong>
          <em>${t("care.calmSyncSub")}</em>
        </button>
        <button type="button" data-page-action="observe-body" data-nav-action="care" data-choice="observe_body">
          <strong>${t("care.observe")}</strong>
          <em>${t("care.observeSub")}</em>
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
    const vaultShards = state.expeditionVault?.shards || {};
    const shardStrip = Object.entries(vaultShards)
      .filter(([, count]) => Number(count) > 0)
      .map(([shardId, count]) => {
        const label = getShardType(shardId).label.zh;
        return `<span><strong>${Number(count)}</strong><em>${escapeHtml(label)}</em></span>`;
      })
      .join("");
    const craftRecipes = listCraftRecipesForUi();
    const craftButtons = craftRecipes.map((recipe) => {
      const afford = canAffordRecipe(state, recipe.id);
      return `
        <button type="button"
          data-page-action="commit"
          data-nav-action="grow"
          data-choice="${recipe.choice}"
          data-status="${escapeHtml(recipe.status)}"
          ${afford ? "" : "disabled"}
        >
          <strong>${escapeHtml(recipe.label.zh)}</strong>
          <em>${escapeHtml(recipe.sub.zh)}</em>
        </button>
      `;
    }).join("");

    body.innerHTML = `
      <div class="page-focus-card">
        <span class="page-orb" aria-hidden="true">✧</span>
        <div>
          <p class="page-card-kicker">Relationship Chapter</p>
          <h3>${nextMilestone ? `${t("growth.nextPrefix")}${escapeHtml(nextMilestone.theme)}` : t("growth.chapterEnd")}</h3>
          <p>${nextMilestone ? t("growth.nextCopy") : t("growth.endCopy")}</p>
        </div>
      </div>
      <div class="page-progress-block" aria-label="${t("growth.progressAria")}">
        <div class="page-progress-line"><span style="width:${nextProgress}%"></span></div>
        <p>${nextMilestone ? `${t("char.bond")} ${bond} / ${nextMilestone.threshold}` : `${t("char.bond")} ${bond}`}</p>
      </div>
      <div class="page-tendency-grid">
        ${renderTendency(t("char.trust"), toNumber(state.trust))}
        ${renderTendency(t("char.mood"), moodLabel(state.mood), false)}
        ${renderTendency(t("char.boundary"), toNumber(state.defense))}
      </div>
      ${shardStrip ? `
        <div class="page-evidence-strip" aria-label="遠征碎晶庫存">
          ${shardStrip}
        </div>
      ` : ""}
      ${craftButtons ? `
        <div class="page-action-grid page-action-grid--craft" aria-label="碎晶共鳴">
          ${craftButtons}
        </div>
      ` : ""}
      <div class="page-action-grid">
        <button type="button" data-page-action="commit" data-nav-action="grow" data-choice="trust_reflection" data-status="${t("growth.trustTuneStatus")}">
          <strong>${t("growth.trustTune")}</strong>
          <em>${t("growth.trustTuneSub")}</em>
        </button>
        <button type="button" data-page-action="open-calm-sync">
          <strong>${t("growth.emotionBalance")}</strong>
          <em>${t("growth.balanceSub")}</em>
        </button>
        <button type="button" data-page-action="open-codex">
          <strong>${t("growth.review")}</strong>
          <em>${t("growth.reviewSub")}</em>
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
      <div class="page-evidence-strip" aria-label="${t("memory.evidenceAria")}">
        <span><strong>${Array.isArray(state.memories) ? state.memories.length : 0}</strong><em>${t("memory.evInteractions")}</em></span>
        <span><strong>${emotionalCount}</strong><em>${t("memory.evEmotional")}</em></span>
        <span><strong>${Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0}</strong><em>${t("memory.evTraces")}</em></span>
      </div>
      <div class="page-memory-list" aria-label="${t("memory.listAria")}">
        ${renderMemoryEntries(renderedMemoryEntries)}
      </div>
      <div class="page-action-grid">
        ${canEcho ? `
          <button type="button" data-page-action="commit" data-nav-action="memory" data-choice="memory_echo" data-status="${t("memory.echoStatus")}">
            <strong>${t("memory.echo")}</strong>
            <em>${t("memory.echoSub")}</em>
          </button>
        ` : ""}
        <button type="button" data-page-action="open-soul-talk">
          <strong>${t("memory.openSoul")}</strong>
          <em>${t("memory.openSoulSub")}</em>
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

  async function handlePageAction(button) {
    if (actionInFlight || button.disabled) return;
    const action = button.dataset.pageAction;
    const wasDisabled = button.disabled;
    actionInFlight = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setViewState("busy");
    statusText.textContent = t("page.status.busy");

    try {
      if (action === "open-map") await runRequiredAction(openMap);
      else if (action === "open-atlas") await runRequiredAction(openAtlas);
      else if (action === "open-character") await panelManager.openPanel("character");
      else if (action === "open-codex") await runRequiredAction(openCodex);
      else if (action === "open-soul-talk") await soulTalkController.openSoulTalk(panelManager);
      else if (action === "open-calm-sync") await runRequiredAction(calmSyncController?.start?.bind(calmSyncController));
      else if (action === "observe-body") {
        // 先跑「讀身體語言」效果，再打開角色面板（保留查閱價值）。
        const actionResult = await actionSheetController.performAction(button.dataset.navAction || "care", {
          choice: button.dataset.choice || "observe_body"
        });
        if (actionResult?.ok === false) {
          const error = new Error("First-session page action is unavailable");
          error.code = actionResult.error ? "SAVE_FAILED" : "ACTION_UNAVAILABLE";
          throw error;
        }
        await panelManager.openPanel("character");
        render();
      } else if (action === "commit") {
        const actionResult = await actionSheetController.performAction(button.dataset.navAction, {
          choice: button.dataset.choice,
          status: button.dataset.status
        });
        if (actionResult?.ok === false) {
          const error = new Error("First-session page action is unavailable");
          error.code = actionResult.error ? "SAVE_FAILED" : "ACTION_UNAVAILABLE";
          throw error;
        }
        render();
      } else {
        throw new Error(`Unsupported page action: ${action || "missing"}`);
      }
      const isCommitLike = action === "commit" || action === "observe-body";
      setViewState(isCommitLike ? "completed" : "ready");
      if (!isCommitLike) statusText.textContent = getPageStatus(activePage);
    } catch (error) {
      console.warn("First-session page action unavailable", { action, error });
      setViewState(error?.code === "ACTION_UNAVAILABLE" ? "unavailable" : "recoverable-error");
      statusText.textContent = error?.code === "ACTION_UNAVAILABLE"
        ? t("page.status.unavailable")
        : t("page.status.recoverableError");
    } finally {
      actionInFlight = false;
      button.disabled = wasDisabled;
      button.removeAttribute("aria-busy");
    }
  }

  function setViewState(state) {
    pageLayer?.setAttribute("data-view-state", state);
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

function runRequiredAction(action) {
  if (typeof action !== "function") {
    const error = new Error("Required first-session action is unavailable");
    error.code = "ACTION_UNAVAILABLE";
    throw error;
  }
  return Promise.resolve(action());
}

function getPageStatus(action) {
  if (action === "explore") return t("page.status.explore");
  if (action === "care") return t("page.status.care");
  if (action === "grow") return t("page.status.grow");
  if (action === "memory") return t("page.status.memory");
  return t("page.status.home");
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
    title: memory.theme || memory.label || t("memory.fallbackEmotionalTitle"),
    copy: memory.excerpt || memory.label || t("memory.fallbackEmotionalCopy"),
    createdAt: Number(memory.lastUpdatedAt) || Number(memory.createdAt) || 0,
    meta: [memory.status, memory.emotion].filter(Boolean).join(" · ")
  }));

  const simple = (Array.isArray(state.memories) ? state.memories : []).map((memory) => ({
    kind: "memory",
    source: memory,
    title: memory.title || t("memory.fallbackInteractionTitle"),
    copy: memory.text || t("memory.fallbackInteractionCopy"),
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
      copy: `${display.copy}${t("memory.intensityFmt").replace("{pct}", String(intensityPct))}`,
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
        <strong>${t("memory.emptyTitle")}</strong>
        <p>${t("memory.emptyCopy")}</p>
      </article>
    `;
  }

  return entries.map((entry, index) => {
    const isReflectable = entry.kind === "emotional";
    const tag = isReflectable ? "button" : "article";
    const attrs = isReflectable
      ? `type="button" data-memory-open="${index}" aria-label="${t("memory.reviewAria")} ${escapeHtml(entry.title)}"`
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

const DATE_LOCALES = { tc: "zh-TW", sc: "zh-CN", en: "en-US", jp: "ja-JP" };

function formatDate(value) {
  if (!value) return t("time.unmarked");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return t("time.unmarked");
  const locale = DATE_LOCALES[getLanguage()] || "zh-TW";
  return date.toLocaleDateString(locale, { month: "2-digit", day: "2-digit" });
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
