import { getShardType } from "../data/lootTables.js";
import { getCompanionById } from "../data/companionRegistry.js";
import {
  HEART_PHASE_PRACTICES,
  createCompanionGrowthSession,
  deriveHeartPhaseSnapshot,
  evaluateHeartPhasePractice
} from "../engine/companionGrowthSessionEngine.js";
import { resolveCrystalVisualState } from "../engine/crystalVisualState.js";
import { getCrystalReleaseEligibility } from "../engine/crystalWeavingEngine.js";
import { getTraceDisplayCopy } from "../engine/traceVisualMapper.js";
import { qs, qsa } from "../utils/dom.js";
import EventBus from "../utils/eventBus.js";
import { t, getLanguage, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";

const PAGE_ACTIONS = new Set(["home", "explore", "care", "grow", "memory"]);
const MEMORY_LIMIT = 8;

export function createPageRouter({
  store,
  panelManager,
  soulTalkController,
  actionSheetController,
  statusText,
  calmSyncController,
  crystalWeavingController,
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
  let pendingCrystalReleaseId = null;
  let crystalActionStatus = "";
  let actionInFlight = false;
  const growthSessions = new Map();

  function bind() {
    if (!pageLayer) return;
    pageLayer.addEventListener("click", handlePageClick);
    pageLayer.addEventListener("keydown", handlePageKeydown);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePage !== "home" && !panelManager.isPanelOpen()) {
        navigate("home");
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden" || !pendingCrystalReleaseId) return;
      pendingCrystalReleaseId = null;
      crystalActionStatus = "";
      render();
    });
    // 語言切換時重畫目前分頁：t() 字串已 baked 進 innerHTML，靜態 DOM 掃描掃不到。
    // render() 在 home 會自行 early-return，背景分頁（如切語言時開著的 Explore）則就地以新語言重畫。
    // statusText 只在 navigate() 寫入，語言切換時需就地以新語言重設（覆寫暫態行動回饋屬預期）。
    EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
      crystalActionStatus = "";
      statusText.textContent = getPageStatus(activePage);
      render();
    });
    render();
  }

  function navigate(action = "home") {
    if (!PAGE_ACTIONS.has(action)) return;
    pendingCrystalReleaseId = null;
    crystalActionStatus = "";

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
    const companionId = state.activeCompanionId || "greyshade-cat";
    const companion = getCompanionById(companionId);
    const companionName = getCompanionDisplayName(companion);
    const session = growthSessions.get(companionId) || createCompanionGrowthSession(companionId);
    const snapshot = deriveHeartPhaseSnapshot(state, session);

    // Safety is terminal and is not a Heart Phase. While safe harbor is active,
    // the Growth body exposes no practice, observation, crafting, or phase cue.
    if (snapshot.safetyPaused) {
      body.innerHTML = `
        <section class="growth-response growth-response--safety"
          data-growth-result data-outcome="safety-paused"
          aria-label="${t("growth.session.safetyLabel")}">
          <strong>${t("growth.session.safetyLabel")}</strong>
          <p>${t("growth.session.safetyCopy")}</p>
        </section>
      `;
      return;
    }

    const practiceButtons = HEART_PHASE_PRACTICES.map((practice) => `
      <button type="button"
        data-page-action="growth-practice"
        data-growth-practice="${practice.id}"
        data-tendency="${practice.tendencyId}"
      >
        <strong>${t(practice.labelKey)}</strong>
        <em>${t(practice.copyKey)}</em>
      </button>
    `).join("");
    const observedTendencies = snapshot.observedTendencyIds.length
      ? snapshot.observedTendencyIds.map((tendencyId) => `
          <span class="growth-tendency-pill" data-growth-tendency="${tendencyId}">
            ${t(`growth.session.tendency.${tendencyId}`)}
          </span>
        `).join("")
      : `<p class="growth-observation-empty">${t("growth.session.observedEmpty")}</p>`;
    const lastResult = snapshot.lastResult;
    // The persistent #status-text owns polite announcements. Result cards stay
    // visible and text-labelled without creating a second live-region echo.
    const responseMarkup = lastResult
      ? `
        <section class="growth-response growth-response--${lastResult.outcomeId}" data-growth-result data-outcome="${lastResult.outcomeId}">
          <span>${t(`growth.session.outcome.${lastResult.outcomeId}`)}</span>
          <strong>${t(lastResult.responseKey)}</strong>
          ${lastResult.observedTendencyId ? `
            <small>${t("growth.session.resultTendencyPrefix")}${t(`growth.session.tendency.${lastResult.observedTendencyId}`)}</small>
          ` : `<small>${t("growth.session.zeroEvidence")}</small>`}
        </section>
      `
      : `
        <section class="growth-response growth-response--waiting" data-growth-result data-outcome="waiting">
          <strong>${t("growth.session.waitingTitle")}</strong>
          <p>${t("growth.session.waitingCopy")}</p>
        </section>
      `;
    body.innerHTML = `
      <div class="page-focus-card page-focus-card--growth" data-growth-phase="${snapshot.phaseId}">
        <span class="page-orb" aria-hidden="true">✧</span>
        <div>
          <p class="page-card-kicker">${t("growth.session.kicker")}</p>
          <h3>${escapeHtml(companionName)} · ${t(snapshot.phaseLabelKey)}</h3>
          <p>${t(snapshot.phaseCopyKey)}</p>
        </div>
      </div>
      ${responseMarkup}
      <section class="growth-observation" data-growth-observation aria-labelledby="growth-observation-title">
        <div>
          <strong id="growth-observation-title">${t("growth.session.observedTitle")}</strong>
          <small>${t("growth.session.observedNote")}</small>
        </div>
        <div class="growth-tendency-strip">${observedTendencies}</div>
      </section>
      <div class="page-action-grid page-action-grid--growth-practice" aria-label="${t("growth.session.practiceAria")}">
        ${practiceButtons}
      </div>
    `;
  }

  function renderMemory(state) {
    const body = pageBodies.memory;
    if (!body) return;
    renderedMemoryEntries = collectMemoryEntries(state);
    const emotionalCount = Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0;
    const canEcho = emotionalCount >= 3;
    const crystalState = resolveCrystalVisualState(state.emotionalMemories);
    const observableMemory = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [])
      .filter((memory) => memory
        && memory.isVisibleInHabitat !== false
        && memory.status !== "released"
        && memory.status !== "archived")
      .sort((left, right) =>
        (Number(right.lastUpdatedAt) || Number(right.createdAt) || 0)
        - (Number(left.lastUpdatedAt) || Number(left.createdAt) || 0)
      )[0] || null;
    const releaseCount = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [])
      .filter((memory) => {
        const eligibility = getCrystalReleaseEligibility(state, memory);
        return Boolean(eligibility?.allowed ?? eligibility?.eligible ?? eligibility?.ok);
      })
      .length;

    body.innerHTML = `
      ${renderCrystalWeavingCard(
        crystalState,
        releaseCount,
        observableMemory?.id || null,
        crystalActionStatus
      )}
      <div class="page-evidence-strip" aria-label="${t("memory.evidenceAria")}">
        <span><strong>${Array.isArray(state.memories) ? state.memories.length : 0}</strong><em>${t("memory.evInteractions")}</em></span>
        <span><strong>${emotionalCount}</strong><em>${t("memory.evEmotional")}</em></span>
        <span><strong>${Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0}</strong><em>${t("memory.evTraces")}</em></span>
      </div>
      <div class="page-memory-list" aria-label="${t("memory.listAria")}">
        ${renderMemoryEntries(renderedMemoryEntries, pendingCrystalReleaseId)}
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
    const isCrystalAction = [
      "observe-crystal",
      "prepare-crystal-release",
      "cancel-crystal-release",
      "confirm-crystal-release"
    ].includes(action);
    let growthHandled = false;
    let growthCompleted = false;
    let crystalHandled = false;
    actionInFlight = true;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setViewState("busy");
    if (!isCrystalAction) statusText.textContent = t("page.status.busy");

    try {
      if (action === "open-map") await runRequiredAction(openMap);
      else if (action === "open-atlas") await runRequiredAction(openAtlas);
      else if (action === "open-character") await panelManager.openPanel("character");
      else if (action === "open-codex") await runRequiredAction(openCodex);
      else if (action === "open-soul-talk") await soulTalkController.openSoulTalk(panelManager);
      else if (action === "open-calm-sync") await runRequiredAction(calmSyncController?.start?.bind(calmSyncController));
      else if (action === "observe-crystal") {
        crystalHandled = true;
        const result = crystalWeavingController?.observe?.(button.dataset.memoryId || null);
        if (result?.outcomeKind !== "crystal_observed") {
          const error = new Error("Crystal observation is unavailable");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        }
        setCrystalActionStatus(result.message || t("memory.crystalObserveStatus"));
      } else if (action === "prepare-crystal-release") {
        crystalHandled = true;
        const memoryId = button.dataset.memoryId;
        const entry = renderedMemoryEntries.find((item) => item.source?.id === memoryId);
        if (!entry?.canRelease) {
          const error = new Error("Crystal release is unavailable");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        }
        pendingCrystalReleaseId = memoryId;
        setCrystalActionStatus(t("memory.crystalReleasePrompt"));
        render();
        pageBodies.memory
          ?.querySelector(`[data-page-action="confirm-crystal-release"][data-memory-id="${escapeSelector(memoryId)}"]`)
          ?.focus({ preventScroll: true });
      } else if (action === "cancel-crystal-release") {
        crystalHandled = true;
        const memoryId = pendingCrystalReleaseId;
        pendingCrystalReleaseId = null;
        setCrystalActionStatus(t("memory.crystalReleaseKept"));
        render();
        if (memoryId) {
          pageBodies.memory
            ?.querySelector(`[data-page-action="prepare-crystal-release"][data-memory-id="${escapeSelector(memoryId)}"]`)
            ?.focus({ preventScroll: true });
        }
      } else if (action === "confirm-crystal-release") {
        crystalHandled = true;
        const memoryId = button.dataset.memoryId;
        if (!memoryId || memoryId !== pendingCrystalReleaseId) {
          const error = new Error("Crystal release confirmation is stale");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        }
        const result = await crystalWeavingController?.release?.(memoryId);
        pendingCrystalReleaseId = null;
        if (result?.outcomeKind !== "crystal_released") {
          const error = new Error("Crystal release did not complete");
          error.code = result?.outcomeKind === "crystal_release_save_failed"
            ? "SAVE_FAILED"
            : "ACTION_UNAVAILABLE";
          error.userMessage = result?.message || "";
          throw error;
        }
        setCrystalActionStatus(result.message || t("memory.crystalReleaseStatus"));
        render();
        focusCrystalCompletionTarget();
      }
      else if (action === "growth-practice") {
        const state = store.getState();
        const companionId = state.activeCompanionId || "greyshade-cat";
        const currentSession = growthSessions.get(companionId) || createCompanionGrowthSession(companionId);
        const evaluation = evaluateHeartPhasePractice(
          state,
          currentSession,
          button.dataset.growthPractice
        );
        growthHandled = true;

        if (evaluation.reason === "safety-paused") {
          statusText.textContent = t("growth.session.safetyStatus");
          render();
        } else if (!evaluation.ok) {
          const error = new Error("Companion Growth practice is unavailable");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        } else {
          const practiceId = evaluation.result.practiceId;
          growthSessions.set(companionId, evaluation.session);
          growthCompleted = true;
          statusText.textContent = t(evaluation.result.responseKey);
          render();
          pageBodies.grow
            ?.querySelector(`[data-growth-practice="${practiceId}"]`)
            ?.focus({ preventScroll: true });
        }
      } else if (action === "observe-body") {
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
        if (activePage === "grow") {
          const currentState = store.getState();
          const companionId = currentState.activeCompanionId || "greyshade-cat";
          const currentSession = growthSessions.get(companionId)
            || createCompanionGrowthSession(companionId);
          if (deriveHeartPhaseSnapshot(currentState, currentSession).safetyPaused) {
            const error = new Error("Growth actions are unavailable during safe harbor");
            error.code = "ACTION_UNAVAILABLE";
            throw error;
          }
        }
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
      const isCommitLike = action === "commit"
        || action === "observe-body"
        || action === "observe-crystal"
        || action === "confirm-crystal-release"
        || growthCompleted;
      setViewState(isCommitLike ? "completed" : "ready");
      if (crystalHandled) {
        statusText.textContent = getPageStatus(activePage);
      } else if (!isCommitLike && !growthHandled) {
        statusText.textContent = getPageStatus(activePage);
      }
    } catch (error) {
      console.warn("First-session page action unavailable", { action, error });
      setViewState(error?.code === "ACTION_UNAVAILABLE" ? "unavailable" : "recoverable-error");
      const errorMessage = error?.userMessage || (
        error?.code === "ACTION_UNAVAILABLE"
          ? t("page.status.unavailable")
          : t("page.status.recoverableError")
      );
      if (crystalHandled) {
        pendingCrystalReleaseId = null;
        setCrystalActionStatus(errorMessage);
        render();
        focusCrystalCompletionTarget(button.dataset.memoryId || null);
        statusText.textContent = getPageStatus(activePage);
      } else {
        statusText.textContent = errorMessage;
      }
    } finally {
      actionInFlight = false;
      button.disabled = wasDisabled;
      button.removeAttribute("aria-busy");
    }
  }

  function setViewState(state) {
    pageLayer?.setAttribute("data-view-state", state);
  }

  function setCrystalActionStatus(message = "") {
    crystalActionStatus = String(message || "");
    const status = pageBodies.memory?.querySelector("[data-crystal-weaving-status]");
    if (!status) return;
    status.textContent = crystalActionStatus;
    status.hidden = !crystalActionStatus;
  }

  function focusCrystalCompletionTarget(preferredMemoryId = null) {
    const preferred = preferredMemoryId
      ? pageBodies.memory?.querySelector(
        `[data-page-action="prepare-crystal-release"][data-memory-id="${escapeSelector(preferredMemoryId)}"]`
      )
      : null;
    const target = preferred || pageBodies.memory?.querySelector(
      '[data-page-action="prepare-crystal-release"], '
      + '[data-page-action="observe-crystal"]:not([disabled]), '
      + '[data-memory-open], '
      + '[data-page-action="open-soul-talk"]'
    );
    target?.focus({ preventScroll: true });
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

function getCompanionDisplayName(companion) {
  if (!companion) return t("growth.session.companionFallback");
  if (getLanguage() === "en") return companion.displayName?.en || companion.name;
  return companion.displayName?.zh || companion.name || t("growth.session.companionFallback");
}

function collectMemoryEntries(state) {
  const emotional = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : []).map((memory) => {
    const releaseEligibility = getCrystalReleaseEligibility(state, memory);
    return {
      kind: "emotional",
      source: memory,
      title: memory.theme || memory.label || t("memory.fallbackEmotionalTitle"),
      copy: memory.excerpt || memory.label || t("memory.fallbackEmotionalCopy"),
      createdAt: Number(memory.lastUpdatedAt) || Number(memory.createdAt) || 0,
      meta: [getMemoryStatusLabel(memory.status), memory.emotion].filter(Boolean).join(" · "),
      canRelease: Boolean(releaseEligibility?.allowed ?? releaseEligibility?.eligible ?? releaseEligibility?.ok),
      releaseReason: releaseEligibility?.reason || ""
    };
  });

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

  const sorted = [...emotional, ...simple, ...traces]
    .sort((left, right) => right.createdAt - left.createdAt);
  const limited = sorted.slice(0, MEMORY_LIMIT);
  const latestReleasable = emotional
    .filter((entry) => entry.canRelease)
    .sort((left, right) => right.createdAt - left.createdAt)[0];

  if (
    latestReleasable
    && !limited.some((entry) =>
      entry.kind === "emotional"
      && entry.source?.id === latestReleasable.source?.id)
  ) {
    if (limited.length >= MEMORY_LIMIT) limited[limited.length - 1] = latestReleasable;
    else limited.push(latestReleasable);
    limited.sort((left, right) => right.createdAt - left.createdAt);
  }

  return limited;
}

function renderMemoryEntries(entries, pendingReleaseId = null) {
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
    const memoryId = entry.source?.id || "";
    const isPendingRelease = Boolean(memoryId && pendingReleaseId === memoryId);
    return `
      <article class="page-memory-row page-memory-row--${entry.kind}">
        <span class="page-memory-glyph" aria-hidden="true">${entry.kind === "trace" ? "◇" : "✦"}</span>
        <span class="page-memory-copy">
          <strong>${escapeHtml(entry.title)}</strong>
          <em>${escapeHtml(trimText(entry.copy, 92))}</em>
          <small>${escapeHtml(formatDate(entry.createdAt))}${entry.meta ? ` · ${escapeHtml(entry.meta)}` : ""}</small>
          ${isReflectable ? `
            <span class="page-memory-actions">
              <button type="button" data-memory-open="${index}" aria-label="${t("memory.reviewAria")} ${escapeHtml(entry.title)}">
                ${t("memory.review")}
              </button>
              ${entry.canRelease && !isPendingRelease ? `
                <button type="button" data-page-action="prepare-crystal-release" data-memory-id="${escapeHtml(memoryId)}">
                  ${t("memory.crystalRelease")}
                </button>
              ` : ""}
              ${entry.canRelease && isPendingRelease ? `
                <span class="page-memory-release-confirm" role="group" aria-label="${t("memory.crystalReleaseConfirmAria")}">
                  <small>${t("memory.crystalReleaseConfirmCopy")}</small>
                  <button type="button" data-page-action="confirm-crystal-release" data-memory-id="${escapeHtml(memoryId)}">
                    ${t("memory.crystalReleaseConfirm")}
                  </button>
                  <button type="button" data-page-action="cancel-crystal-release" data-memory-id="${escapeHtml(memoryId)}">
                    ${t("memory.crystalReleaseKeep")}
                  </button>
                </span>
              ` : ""}
            </span>
          ` : ""}
        </span>
      </article>
    `;
  }).join("");
}

function renderCrystalWeavingCard(
  crystalState,
  releaseCount,
  observableMemoryId = null,
  actionStatus = ""
) {
  const stateKey = `memory.crystalState.${crystalState}`;
  return `
    <section class="crystal-weaving-card" data-crystal-state="${escapeHtml(crystalState)}" aria-labelledby="crystal-weaving-title">
      <span class="crystal-weaving-core" aria-hidden="true">✦</span>
      <div class="crystal-weaving-copy">
        <p>${t("memory.crystalKicker")}</p>
        <h3 id="crystal-weaving-title">${t(`${stateKey}.title`)}</h3>
        <p>${t(`${stateKey}.copy`)}</p>
        <small>${releaseCount > 0
          ? t("memory.crystalReleaseReady").replace("{count}", String(releaseCount))
          : t("memory.crystalNoRelease")}</small>
      </div>
      <button type="button" data-page-action="observe-crystal"
        ${observableMemoryId ? `data-memory-id="${escapeHtml(observableMemoryId)}"` : "disabled aria-disabled=\"true\""}>
        <strong>${t("memory.crystalObserve")}</strong>
        <em>${t("memory.crystalObserveSub")}</em>
      </button>
      <p class="crystal-weaving-status" data-crystal-weaving-status role="status" aria-live="polite"
        ${actionStatus ? "" : "hidden"}>${escapeHtml(actionStatus)}</p>
    </section>
    <p class="page-soft-note">${t("memory.crystalNoDaily")}</p>
  `;
}

function getMemoryStatusLabel(status) {
  const key = `memory.status.${status || "fresh"}`;
  const translated = t(key);
  return translated === key ? String(status || "") : translated;
}

function escapeSelector(value) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(String(value));
  }
  return String(value).replace(/["\\]/g, "\\$&");
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
