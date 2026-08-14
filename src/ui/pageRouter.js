import { formatVaultMoteStripLabel } from "../expedition/lootPresentation.js";
import { getCompanionById } from "../data/companionRegistry.js";
import {
  HEART_PHASE_PRACTICES,
  createCompanionGrowthSession,
  deriveHeartPhaseSnapshot,
  evaluateHeartPhasePractice,
  resolveHeartPhaseRewrite
} from "../engine/companionGrowthSessionEngine.js";
import { resolveCrystalVisualState } from "../engine/crystalVisualState.js";
import { getCrystalReleaseEligibility } from "../engine/crystalWeavingEngine.js";
import { getTraceDisplayCopy } from "../engine/traceVisualMapper.js";
import { resolveOrbitNodeActionSheet } from "../orbit/orbitNodeActionResolver.js";
import {
  MEMORY_PROJECTION_LIMIT,
  countMemoryEvidence,
  projectMemoryEvidence
} from "./memoryProjection.js";
import { qs, qsa } from "../utils/dom.js";
import EventBus from "../utils/eventBus.js";
import { t, getLanguage, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";
import { getTrustStagePresentation } from "./bondPresentation.js";
import { createGrowthSafetyFacts } from "./companionGrowthController.js";

const PAGE_ACTIONS = new Set(["home", "explore", "care", "grow", "memory"]);
const MEMORY_LIMIT = MEMORY_PROJECTION_LIMIT;
const IDEMPOTENT_CARE_WRITE_REASONS = new Set(["duplicate_key", "duplicate_root"]);

export function createPageRouter({
  store,
  panelManager,
  soulTalkController,
  actionSheetController,
  statusText,
  calmSyncController,
  crystalWeavingController,
  companionGrowthController,
  saveCandidateState,
  openMap,
  openCodex,
  openAtlas,
  openOrbit,
  openExpedition,
  openStandoff
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
  let exploreNodeActionSheetOpen = false;
  let actionInFlight = false;
  const growthSessions = new Map();

  function bind() {
    if (!pageLayer) return;
    ensurePageSoulTalkActions();
    pageLayer.addEventListener("click", handlePageClick);
    pageLayer.addEventListener("keydown", handlePageKeydown);
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape"
        && activePage === "explore"
        && exploreNodeActionSheetOpen
        && !panelManager.isPanelOpen()
      ) {
        event.preventDefault();
        closeExploreNodeActionSheet();
        return;
      }
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
      ensurePageSoulTalkActions();
      render();
    });
    render();
  }

  function navigate(action = "home") {
    if (!PAGE_ACTIONS.has(action)) return;
    pendingCrystalReleaseId = null;
    crystalActionStatus = "";
    exploreNodeActionSheetOpen = false;

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
    const state = store.getState();
    // Safety is global, not page-local. Invalidate every session before the
    // home-page early return so a rewrite cannot survive a Soul Talk safety
    // transition merely because Growth was not the active page.
    if (state.safeHarborMode === true) growthSessions.clear();
    if (!pageLayer || activePage === "home") return;
    if (activePage === "explore") renderExplore(state);
    if (activePage === "care") renderCare(state);
    if (activePage === "grow") renderGrowth(state);
    if (activePage === "memory") renderMemory(state);
  }

  function ensurePageSoulTalkActions() {
    pageViews.forEach((view) => {
      const header = view.querySelector(".page-view__header");
      if (!header) return;
      let button = header.querySelector(".page-soul-talk-action");
      if (!button) {
        button = document.createElement("button");
        button.type = "button";
        button.className = "page-soul-talk-action";
        button.dataset.pageAction = "open-soul-talk";
        header.appendChild(button);
      }
      button.textContent = t("memory.openSoul");
      button.setAttribute("aria-label", t("aria.openSoulTalk"));
    });
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
        const strip = formatVaultMoteStripLabel(shardId, count, getLanguage());
        return `<span><strong>${strip.count}</strong><em>${escapeHtml(strip.label)}</em></span>`;
      })
      .join("");
    const nodeActionSheet = resolveOrbitNodeActionSheet(state);
    const nodeActionMarkup = nodeActionSheet.actions.map((action) => `
      <button
        type="button"
        class="explore-node-action${action.primary ? " is-primary" : ""}"
        data-page-action="choose-node-mode"
        data-node-mode="${action.id}"
        ${action.available ? "" : 'disabled aria-disabled="true"'}
      >
        <span class="explore-node-action__copy">
          <strong>${t(action.labelKey)}</strong>
          <em>${t(action.copyKey)}</em>
        </span>
        ${action.primary
          ? `<span class="explore-node-action__mark">${t("explore.nodeActions.primary")}</span>`
          : ""}
      </button>
    `).join("");
    const nodeActionSheetMarkup = exploreNodeActionSheetOpen
      ? `
        <div class="explore-node-actions-backdrop" data-node-action-sheet>
          <section
            class="explore-node-actions"
            role="dialog"
            aria-modal="true"
            aria-labelledby="explore-node-actions-title"
            aria-describedby="explore-node-actions-copy"
          >
            <header class="explore-node-actions__header">
              <div>
                <p>Moonlake Camp</p>
                <h3 id="explore-node-actions-title">${t(nodeActionSheet.titleKey)}</h3>
                <span id="explore-node-actions-copy">${t(nodeActionSheet.copyKey)}</span>
              </div>
              <button
                type="button"
                class="explore-node-actions__close"
                data-page-action="close-node-actions"
                aria-label="${t("explore.nodeActions.close")}"
              >×</button>
            </header>
            <div class="explore-node-actions__list">
              ${nodeActionMarkup}
            </div>
          </section>
        </div>
      `
      : "";
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
        <button type="button" data-page-action="open-node-actions">
          <strong>${t("explore.nodeActions.open")}</strong>
          <em>${t("explore.nodeActions.openSub")}</em>
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
      ${nodeActionSheetMarkup}
    `;
  }

  function openExploreNodeActionSheet() {
    exploreNodeActionSheetOpen = true;
    setViewState("ready");
    render();
    queueMicrotask(() => {
      pageBodies.explore
        ?.querySelector('[data-page-action="choose-node-mode"]:not([disabled])')
        ?.focus({ preventScroll: true });
    });
  }

  function closeExploreNodeActionSheet() {
    exploreNodeActionSheetOpen = false;
    setViewState("ready");
    render();
    queueMicrotask(() => {
      pageBodies.explore
        ?.querySelector('[data-page-action="open-node-actions"]')
        ?.focus({ preventScroll: true });
    });
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

    const trustStage = getTrustStagePresentation(trust, getLanguage());
    body.innerHTML = `
      <div class="page-meter-card">
        ${renderMetric(t("care.boundary"), defense, t("care.hintBoundary"))}
        ${renderQualitativeMetric(t("care.trust"), trustStage.label, trustStage.barPercent, t("care.hintTrust"))}
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
    const growthViewModel = companionGrowthController?.getViewModel?.(state, snapshot) || {
      companionId,
      safetyPaused: snapshot.safetyPaused,
      phase: {
        id: snapshot.phaseId,
        labelKey: snapshot.phaseLabelKey,
        copyKey: snapshot.phaseCopyKey
      },
      formalStage: {
        id: "initial_awakened",
        labelKey: "growth.persisted.stage.initial_awakened"
      },
      relationshipSignal: {
        readinessId: "forming",
        willingnessId: "not_evaluated",
        copyKey: "growth.persisted.signal.forming"
      },
      livedEvidence: {
        rows: [],
        empty: true,
        emptyCopyKey: "growth.persisted.evidenceEmpty"
      },
      currentMoment: {
        observedTendencyIds: snapshot.observedTendencyIds,
        lastResult: snapshot.lastResult
      }
    };

    // Safety is terminal and is not a Heart Phase. While safe harbor is active,
    // the Growth body exposes no practice, observation, crafting, or phase cue.
    // Crossing this boundary also invalidates any pre-safety rewrite proposal;
    // it must never revive after safe harbor later closes in the same app run.
    if (growthViewModel.safetyPaused) {
      growthSessions.delete(companionId);
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
    const currentMoment = growthViewModel.currentMoment || snapshot;
    const observedTendencyIds = Array.isArray(currentMoment.observedTendencyIds)
      ? currentMoment.observedTendencyIds
      : [];
    const observedTendencies = observedTendencyIds.length
      ? observedTendencyIds.map((tendencyId) => `
          <span class="growth-tendency-pill" data-growth-tendency="${tendencyId}">
            ${t(`growth.session.tendency.${tendencyId}`)}
          </span>
        `).join("")
      : `<p class="growth-observation-empty">${t("growth.session.observedEmpty")}</p>`;
    const lastResult = currentMoment.lastResult;
    const rewritePending = lastResult?.outcomeId === "modify"
      && lastResult?.completionStatus === "awaiting_rewrite";
    const resultEvidenceKey = lastResult?.completionStatus === "completed"
      ? "growth.session.evidenceRecorded"
      : lastResult?.completionStatus === "awaiting_rewrite"
        ? "growth.session.rewritePendingNote"
        : "growth.session.zeroEvidence";
    const rewriteActionsMarkup = rewritePending
      ? `
        <div class="growth-rewrite-actions" role="group" aria-label="${t("growth.session.rewriteActionsAria")}">
          <button type="button" data-page-action="growth-rewrite-accept">
            <strong>${t("growth.session.rewriteAccept.label")}</strong>
            <span>${t("growth.session.rewriteAccept.copy")}</span>
          </button>
          <button type="button" data-page-action="growth-rewrite-defer">
            <strong>${t("growth.session.rewriteDefer.label")}</strong>
            <span>${t("growth.session.rewriteDefer.copy")}</span>
          </button>
        </div>
      `
      : "";
    // The persistent #status-text owns polite announcements. Result cards stay
    // visible and text-labelled without creating a second live-region echo.
    const responseMarkup = lastResult
      ? `
        <section class="growth-response growth-response--${lastResult.outcomeId}" data-growth-result data-outcome="${lastResult.outcomeId}">
          <span>${t(`growth.session.outcome.${lastResult.outcomeId}`)}</span>
          <strong>${t(lastResult.responseKey)}</strong>
          ${lastResult.resolutionResponseKey ? `<p>${t(lastResult.resolutionResponseKey)}</p>` : ""}
          ${lastResult.observedTendencyId ? `
            <small>${t("growth.session.resultTendencyPrefix")}${t(`growth.session.tendency.${lastResult.observedTendencyId}`)}</small>
          ` : ""}
          <small>${t(resultEvidenceKey)}</small>
          ${rewriteActionsMarkup}
        </section>
      `
      : `
        <section class="growth-response growth-response--waiting" data-growth-result data-outcome="waiting">
          <strong>${t("growth.session.waitingTitle")}</strong>
          <p>${t("growth.session.waitingCopy")}</p>
        </section>
      `;
    const phase = growthViewModel.phase || {
      id: snapshot.phaseId,
      labelKey: snapshot.phaseLabelKey,
      copyKey: snapshot.phaseCopyKey
    };
    const formalStage = growthViewModel.formalStage;
    const relationshipSignal = growthViewModel.relationshipSignal;
    const evidenceRows = Array.isArray(growthViewModel.livedEvidence?.rows)
      ? growthViewModel.livedEvidence.rows
      : [];
    const livedEvidenceMarkup = evidenceRows.length
      ? `
        <ul class="growth-lived-evidence-list">
          ${evidenceRows.map((row) => `
            <li class="growth-lived-evidence-row" data-growth-evidence-source="${escapeHtml(row.sourceType)}">
              <div>
                <strong>${t(row.sourceLabelKey)}</strong>
                <span>${t("growth.persisted.evidenceTendencyPrefix")}${t(row.tendencyLabelKey)}</span>
              </div>
              <p>${t(row.sourceCopyKey)}</p>
            </li>
          `).join("")}
        </ul>
      `
      : `<p class="growth-lived-evidence-empty">${t(growthViewModel.livedEvidence?.emptyCopyKey || "growth.persisted.evidenceEmpty")}</p>`;
    body.innerHTML = `
      <div class="page-focus-card page-focus-card--growth" data-growth-phase="${escapeHtml(phase.id)}">
        <span class="page-orb" aria-hidden="true">✧</span>
        <div>
          <p class="page-card-kicker">${t("growth.session.kicker")}</p>
          <h3>${escapeHtml(companionName)} · ${t(phase.labelKey)}</h3>
          <p>${t(phase.copyKey)}</p>
          <dl class="growth-continuity-cues">
            <div data-growth-formal-stage="${escapeHtml(formalStage.id)}">
              <dt>${t("growth.persisted.stageLabel")}</dt>
              <dd>${t(formalStage.labelKey)}</dd>
            </div>
            <div data-growth-readiness="${escapeHtml(relationshipSignal.readinessId)}"
              data-growth-willingness="${escapeHtml(relationshipSignal.willingnessId)}">
              <dt>${t("growth.persisted.signalLabel")}</dt>
              <dd>${t(relationshipSignal.copyKey)}</dd>
            </div>
          </dl>
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
      <section class="growth-lived-evidence" data-growth-lived-evidence
        aria-labelledby="growth-lived-evidence-title">
        <header>
          <strong id="growth-lived-evidence-title">${t("growth.persisted.evidenceTitle")}</strong>
          <small>${t("growth.persisted.evidenceNote")}</small>
        </header>
        ${livedEvidenceMarkup}
      </section>
    `;
  }

  function renderMemory(state) {
    const body = pageBodies.memory;
    if (!body) return;
    renderedMemoryEntries = collectMemoryEntries(state);
    const evidence = countMemoryEvidence(state);
    const emotionalCount = evidence.emotional;
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
        <span><strong>${evidence.interactions}</strong><em>${t("memory.evInteractions")}</em></span>
        <span><strong>${evidence.emotional}</strong><em>${t("memory.evEmotional")}</em></span>
        <span><strong>${evidence.traces}</strong><em>${t("memory.evTraces")}</em></span>
        <span><strong>${evidence.anchors}</strong><em>${t("memory.evAnchors")}</em></span>
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
    if (
      event.key === "Tab"
      && activePage === "explore"
      && exploreNodeActionSheetOpen
    ) {
      const focusable = [
        ...(pageBodies.explore?.querySelectorAll(
          '[data-node-action-sheet] button:not([disabled])'
        ) || [])
      ];
      if (!focusable.length) return;
      const currentIndex = focusable.indexOf(document.activeElement);
      const nextIndex = event.shiftKey
        ? currentIndex <= 0
          ? focusable.length - 1
          : currentIndex - 1
        : currentIndex < 0 || currentIndex >= focusable.length - 1
          ? 0
          : currentIndex + 1;
      event.preventDefault();
      focusable[nextIndex].focus({ preventScroll: true });
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    const memoryButton = event.target.closest("[data-memory-open]");
    if (!memoryButton) return;
    event.preventDefault();
    openMemoryReflection(Number(memoryButton.dataset.memoryOpen));
  }

  async function recordCompletedCarePractice(companionId, result) {
    if (typeof companionGrowthController?.writeCarePracticeIntoDraft !== "function") {
      return { accepted: false, changed: false, reason: "care_source_owner_unavailable" };
    }
    if (typeof saveCandidateState !== "function") {
      return { accepted: false, changed: false, reason: "care_save_unavailable" };
    }

    const candidateState = cloneState(store.getState());
    const writeResult = companionGrowthController.writeCarePracticeIntoDraft(candidateState, {
      companionId,
      result,
      createdAt: Date.now()
    });
    if (!writeResult?.changed) return writeResult;

    const saveResult = await saveCandidateState(candidateState);
    if (saveResult?.ok !== true) {
      return { accepted: false, changed: false, reason: "care_save_failed" };
    }

    // Persisted data may be pruned to storage limits; publishing that payload
    // back into runtime would silently discard unrelated live memories/traces.
    store.replaceState(candidateState);
    return writeResult;
  }

  async function recordCompletedReflectionPractice(companionId) {
    if (typeof companionGrowthController?.writeReflectionPracticeIntoDraft !== "function") {
      return { accepted: false, changed: false, reason: "reflection_source_owner_unavailable" };
    }
    if (typeof saveCandidateState !== "function") {
      return { accepted: false, changed: false, reason: "reflection_save_unavailable" };
    }

    const candidateState = cloneState(store.getState());
    const writeResult = companionGrowthController.writeReflectionPracticeIntoDraft(candidateState, {
      companionId,
      createdAt: Date.now(),
      safetyFacts: createGrowthSafetyFacts(candidateState)
    });
    // 缺主人／缺安全 provenance 時 fail closed：不寫 evidence，也不把這次回聲整理變成錯誤。
    if (!writeResult?.changed) return writeResult;

    const saveResult = await saveCandidateState(candidateState);
    if (saveResult?.ok !== true) {
      return { accepted: false, changed: false, reason: "reflection_save_failed" };
    }
    store.replaceState(candidateState);
    return writeResult;
  }

  function assertCareWriteCompleted(writeResult) {
    if (writeResult?.accepted || IDEMPOTENT_CARE_WRITE_REASONS.has(writeResult?.reason)) return;
    const error = new Error(`Companion Growth care evidence rejected: ${writeResult?.reason || "unknown"}`);
    error.code = writeResult?.reason === "care_save_failed"
      ? "SAVE_FAILED"
      : "ACTION_UNAVAILABLE";
    throw error;
  }

  async function handlePageAction(button) {
    const action = button.dataset.pageAction;
    if (actionInFlight || button.disabled) return;
    if (action === "open-node-actions") {
      openExploreNodeActionSheet();
      return;
    }
    if (action === "close-node-actions") {
      closeExploreNodeActionSheet();
      return;
    }
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
      else if (action === "open-orbit") await runRequiredAction(openOrbit);
      else if (action === "choose-node-mode") {
        const nodeActionSheet = resolveOrbitNodeActionSheet(store.getState());
        const selectedAction = nodeActionSheet.actions.find(
          (candidate) => candidate.id === button.dataset.nodeMode
        );
        if (!selectedAction?.available) {
          const error = new Error("Explore node mode is unavailable");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        }
        exploreNodeActionSheetOpen = false;
        render();
        if (selectedAction.route === "orbit") await runRequiredAction(openOrbit);
        else if (selectedAction.route === "map") await runRequiredAction(openMap);
        else if (selectedAction.route === "expedition") await runRequiredAction(openExpedition);
        else if (selectedAction.route === "standoff") await runRequiredAction(openStandoff);
        else {
          const error = new Error(`Unsupported Explore node route: ${selectedAction.route}`);
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        }
      }
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
          if (evaluation.result.completionStatus === "completed") {
            assertCareWriteCompleted(await recordCompletedCarePractice(companionId, evaluation.result));
          }
          growthSessions.set(companionId, evaluation.session);
          growthCompleted = evaluation.result.completionStatus !== "awaiting_rewrite";
          statusText.textContent = t(evaluation.result.responseKey);
          render();
          const focusTarget = evaluation.result.completionStatus === "awaiting_rewrite"
            ? pageBodies.grow?.querySelector('[data-page-action="growth-rewrite-accept"]')
            : pageBodies.grow?.querySelector(`[data-growth-practice="${practiceId}"]`);
          focusTarget?.focus({ preventScroll: true });
        }
      } else if (action === "growth-rewrite-accept" || action === "growth-rewrite-defer") {
        const state = store.getState();
        const companionId = state.activeCompanionId || "greyshade-cat";
        const currentSession = growthSessions.get(companionId)
          || createCompanionGrowthSession(companionId);
        const decision = action === "growth-rewrite-accept" ? "accept" : "defer";
        const resolution = resolveHeartPhaseRewrite(state, currentSession, decision);
        growthHandled = true;

        if (resolution.reason === "safety-paused") {
          statusText.textContent = t("growth.session.safetyStatus");
          render();
        } else if (!resolution.ok) {
          const error = new Error("Companion Growth rewrite is unavailable");
          error.code = "ACTION_UNAVAILABLE";
          throw error;
        } else {
          if (decision === "accept") {
            assertCareWriteCompleted(await recordCompletedCarePractice(companionId, resolution.result));
          }
          growthSessions.set(companionId, resolution.session);
          growthCompleted = true;
          statusText.textContent = t(resolution.result.resolutionResponseKey);
          render();
          pageBodies.grow
            ?.querySelector(`[data-growth-practice="${resolution.result.practiceId}"]`)
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
        if (button.dataset.navAction === "memory" && button.dataset.choice === "memory_echo") {
          const currentState = store.getState();
          await recordCompletedReflectionPractice(currentState.activeCompanionId);
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

/** 關係類指標：右側顯示階段名，不顯示刷分數字。 */
function renderQualitativeMetric(label, stageLabel, barPercent, hint) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(barPercent) || 0)));
  return `
    <div class="page-meter" style="--value:${percent}%">
      <div class="page-meter-head"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(stageLabel)}</span></div>
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
  // Pack 3：單一投影層——錨點／釋放檔案都會出現在玩家可見時間線。
  const projected = projectMemoryEvidence(state, {
    limit: MEMORY_LIMIT * 2,
    fallbackEmotionalTitle: t("memory.fallbackEmotionalTitle"),
    fallbackEmotionalCopy: t("memory.fallbackEmotionalCopy"),
    fallbackInteractionTitle: t("memory.fallbackInteractionTitle"),
    fallbackInteractionCopy: t("memory.fallbackInteractionCopy"),
    fallbackAnchorTitle: t("memory.fallbackAnchorTitle"),
    fallbackTraceTitle: t("memory.fallbackTraceTitle"),
    archiveMeta: t("memory.archiveMeta"),
    intensityFmt: t("memory.intensityFmt"),
    getTraceDisplayCopy
  });

  const entries = projected.map((item) => {
    const isEmotional = item.kind === "emotional" || item.kind === "emotional_archive";
    const releaseEligibility = isEmotional && item.kind === "emotional"
      ? getCrystalReleaseEligibility(state, item.source)
      : null;
    return {
      kind: item.kind === "emotional_archive" ? "emotional" : item.kind,
      source: item.source,
      title: item.title,
      copy: item.copy,
      createdAt: item.createdAt,
      meta: item.kind === "emotional" || item.kind === "emotional_archive"
        ? [getMemoryStatusLabel(item.source?.status), item.source?.emotion, item.kind === "emotional_archive" ? t("memory.archiveMeta") : ""]
          .filter(Boolean)
          .join(" · ")
        : item.meta,
      canRelease: Boolean(releaseEligibility?.allowed ?? releaseEligibility?.eligible ?? releaseEligibility?.ok),
      releaseReason: releaseEligibility?.reason || "",
      claimable: item.claimable !== false
    };
  });

  const limited = entries.slice(0, MEMORY_LIMIT);
  const latestReleasable = entries
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
    const isReflectable = entry.kind === "emotional" && entry.claimable !== false;
    const memoryId = entry.source?.id || "";
    const isPendingRelease = Boolean(memoryId && pendingReleaseId === memoryId);
    const glyph = entry.kind === "trace" ? "◇" : entry.kind === "anchor" ? "◎" : "✦";
    return `
      <article class="page-memory-row page-memory-row--${entry.kind}">
        <span class="page-memory-glyph" aria-hidden="true">${glyph}</span>
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

function cloneState(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
