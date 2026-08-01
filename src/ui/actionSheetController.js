import { evaluateActionEffect } from "../engine/actionEffectEngine.js";
import { BOND_MILESTONES } from "../engine/bondMilestoneEngine.js";
import { getMemoryAccentColor, getMemoryGlyph } from "../engine/traceVisualMapper.js";
import EventBus from "../utils/eventBus.js";
import { qs, qsa } from "../utils/dom.js";
import { formatUpcomingMilestoneCopy } from "./bondPresentation.js";
import {
  deriveHabitatPracticeInvitation,
  projectHabitatPracticeResult
} from "../engine/habitatRhythmEngine.js";

const MEMORY_HALL_LIMIT = 20;
const MEMORY_HALL_STATUSES = new Set(["fresh", "settled", "transformed"]);
const MEMORY_STATUS_LABEL = { fresh: "新生", settled: "沉澱", transformed: "蛻變" };

function formatMemoryRelativeTime(createdAt, now) {
  if (!createdAt) return "";
  const days = Math.floor((now - createdAt) / 86400000);
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 30) return `${days} 天前`;
  return "很久以前";
}

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
// 動作狀態改走主畫面 toast（companionFeedbackController 訂閱）：
// 私測回報這些行以「心湖：」塞進聊天紀錄，被誤認成對話回覆、又淹掉玩家自己的話。
const HABITAT_STATUS_TOAST_EVENT = "HABITAT_STATUS_TOAST";
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

const HABITAT_PRACTICE_COPY = Object.freeze({
  water: Object.freeze({ title: "在水岸聽潮", invitation: "湖面把雜訊放慢了。你們可以一起聽一會，不需要趕著得到答案。" }),
  lantern: Object.freeze({ title: "在燈下留出距離", invitation: "暖光停在你們之間。靠近或保持距離，都可以由牠決定。" }),
  crystal: Object.freeze({ title: "整理水晶裡的回聲", invitation: "幾道回聲疊在晶面上。你們可以慢慢理出一條不勉強的路。" }),
  "quiet-ground": Object.freeze({ title: "在安靜地面共同等待", invitation: "這裡沒有必須完成的事。坐下、休息，或只是一起等一會都可以。" })
});

const HEART_PHASE_RESPONSE_COPY = Object.freeze({
  accept: "牠願意照這個節奏和你一起試試。",
  modify: "牠沒有照原提議靠近，而是提出一個更合適的距離。",
  rest: "牠現在想休息。這份選擇不會被記成缺席或失敗。",
  decline: "牠說現在不想做。你們可以直接離開，什麼也不會失去。"
});

export function createActionSheetController({
  soulTalkController,
  saveCurrentState,
  statusText,
  panelManager,
  store,
  calmSyncController,
  companionGrowthController,
  saveCandidateState,
  resonanceWeaveController,
  openMap,
  openCodex,
  routeNavAction
}) {
  const bottomNavButtons = qsa(".bottom-nav button[data-action]");
  const actionSheetTitle = qs("#action-sheet-title");
  const actionSheetCopy = qs("#action-sheet-copy");
  const actionSheetActions = qs("#action-sheet-actions");
  let queuedAction = null;
  let habitatPracticeInvitation = null;
  let habitatPracticeBound = false;
  let removeActionSheetCloseListener = null;

  function bind() {
    bottomNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        if (typeof routeNavAction === "function") {
          routeNavAction(action);
          return;
        }
        if (action === "home") {
          showHome();
          return;
        }
        setActiveNav(action);
        openActionSheet(action);
      });
    });
    if (!habitatPracticeBound) {
      EventBus.on(ENVIRONMENT_INTERACTION_EVENT, handleHabitatPracticeEvent);
      habitatPracticeBound = true;
    }
    if (!removeActionSheetCloseListener && typeof panelManager.registerOnClose === "function") {
      removeActionSheetCloseListener = panelManager.registerOnClose("actionSheet", () => {
        resonanceWeaveController?.destroy?.();
      });
    }
    showHome();
  }

  function showHome() {
    queuedAction = null;
    habitatPracticeInvitation = null;
    resonanceWeaveController?.destroy?.();
    actionSheetActions?.classList.remove("habitat-practice-actions", "resonance-weave-actions");
    panelManager.closePanel();
    bottomNavButtons.forEach((button) => {
      const isHome = button.dataset.action === "home";
      button.classList.toggle("active", isHome);
      button.classList.toggle("is-active", isHome);
      button.toggleAttribute("aria-current", isHome);
    });
  }

  function openActionSheet(action) {
    const actionMeta = getActionMeta(action, store.getState());
    if (!actionMeta) return;
    resonanceWeaveController?.destroy?.();
    habitatPracticeInvitation = null;
    actionSheetActions?.classList.remove("habitat-practice-actions", "resonance-weave-actions");
    queuedAction = action;
    actionSheetTitle.textContent = actionMeta.title;
    actionSheetCopy.textContent = actionMeta.copy;
    renderGrowthChronicle(action, store.getState());
    renderMemoryHall(action, store.getState());
    renderActionRows(actionMeta.rows);
    panelManager.openPanel("actionSheet");
  }

  function handleHabitatPracticeEvent(event = {}) {
    if (!event?.interactionId || !String(event.type || "").endsWith("_tap")) return;
    const state = store.getState();
    const firstLoop = state.onboarding?.firstLoop || {};
    if (
      state.safeHarborMode === true
      || state.activeHabitatId !== "moonlake"
      || !Boolean(firstLoop.completedAt || firstLoop.skippedAt)
    ) {
      return;
    }
    const hotspotType = String(event.type).replace(/_tap$/, "");
    openHabitatPractice(hotspotType, {
      hotspotId: event.interactionId,
      timePhaseId: event.timePhaseId,
      weatherId: event.weatherId
    });
  }

  function openHabitatPractice(hotspotType, environment = {}) {
    resonanceWeaveController?.destroy?.();
    actionSheetActions?.classList.remove("resonance-weave-actions");
    const state = store.getState();
    const projected = deriveHabitatPracticeInvitation({
      state,
      environment: {
        ...environment,
        hotspotType,
        chapterNo: state.chapterProgress?.current
      },
      hotspotType
    });
    if (!projected.ok || !projected.invitation) return false;
    habitatPracticeInvitation = projected.invitation;
    queuedAction = "habitat-practice";
    renderHabitatPractice();
    panelManager.openPanel("actionSheet");
    return true;
  }

  function renderHabitatPractice(message = "") {
    const invitation = habitatPracticeInvitation;
    if (!invitation || !actionSheetActions) return;
    ensureHabitatPracticeStyles();
    document.getElementById("memory-hall")?.remove();
    document.getElementById("bond-chronicle")?.remove();
    const copy = HABITAT_PRACTICE_COPY[invitation.hotspotType] || HABITAT_PRACTICE_COPY["quiet-ground"];
    actionSheetTitle.textContent = copy.title;
    actionSheetCopy.textContent = message || copy.invitation;
    actionSheetActions.innerHTML = "";
    actionSheetActions.classList.add("habitat-practice-actions");

    const response = document.createElement("p");
    response.className = `habitat-practice-response is-${invitation.outcomeId}`;
    response.setAttribute("role", "status");
    response.textContent = HEART_PHASE_RESPONSE_COPY[invitation.outcomeId] || "牠正在用身體語言回應。";
    actionSheetActions.appendChild(response);

    if (invitation.outcomeId === "accept") {
      actionSheetActions.appendChild(createPracticeButton("照這個節奏一起完成", () => {
        completeHabitatPractice(null);
      }, true));
    } else if (invitation.outcomeId === "modify") {
      actionSheetActions.appendChild(createPracticeButton("接受牠改寫後的方式", () => {
        completeHabitatPractice("accept");
      }, true));
      actionSheetActions.appendChild(createPracticeButton("先不做，保留這份提議", () => {
        completeHabitatPractice("defer");
      }));
    }

    actionSheetActions.appendChild(createPracticeButton("整理一段環境微光", () => {
      openResonanceWeave();
    }));

    if (invitation.hotspotType !== "quiet-ground") {
      actionSheetActions.appendChild(createPracticeButton("換到安靜地面，只是一起等", () => {
        openHabitatPractice("quiet-ground", {
          hotspotId: "moonlake-quiet-ground-session",
          chapterNo: store.getState().chapterProgress?.current
        });
      }));
    }
    actionSheetActions.appendChild(createPracticeButton(
      invitation.outcomeId === "rest" || invitation.outcomeId === "decline" ? "尊重牠，回到棲地" : "這次先不做",
      () => {
        habitatPracticeInvitation = null;
        queuedAction = null;
        actionSheetActions.classList.remove("habitat-practice-actions");
        panelManager.closePanel();
      }
    ));
  }

  function openResonanceWeave() {
    const invitation = habitatPracticeInvitation;
    const state = store.getState();
    if (!invitation || state.safeHarborMode === true || !resonanceWeaveController?.open) {
      return false;
    }

    ensureHabitatPracticeStyles();
    queuedAction = "resonance-weave";
    actionSheetTitle.textContent = "共鳴織痕";
    actionSheetCopy.textContent = "圈住湖面的微光，沿逆流慢慢帶回，再讓它自由散開。這不是捕捉，也不會留下進度。";
    actionSheetActions.classList.add("habitat-practice-actions", "resonance-weave-actions");

    const opened = resonanceWeaveController.open({
      host: actionSheetActions,
      nodeId: invitation.hotspotId || "moonlake",
      seed: `moonlake:${invitation.hotspotType}:${invitation.companionId}`,
      companionId: invitation.companionId,
      onExit: () => {
        actionSheetActions.classList.remove("resonance-weave-actions");
        queuedAction = "habitat-practice";
        renderHabitatPractice("環境微光回到了湖面；沒有新增進度，也沒有失去任何東西。");
      }
    });

    if (!opened) {
      actionSheetActions.classList.remove("resonance-weave-actions");
      queuedAction = "habitat-practice";
      renderHabitatPractice("湖面的微光暫時沒有展開；其餘實踐沒有改變。");
    }
    return opened;
  }

  function createPracticeButton(label, onClick, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = primary ? "habitat-practice-button is-primary" : "habitat-practice-button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  async function completeHabitatPractice(rewriteDecision) {
    const invitation = habitatPracticeInvitation;
    if (!invitation) return;
    const state = store.getState();
    const projected = projectHabitatPracticeResult({ state, invitation, rewriteDecision });
    if (!projected.ok || !projected.result) {
      if (projected.reason === "safety-paused") {
        habitatPracticeInvitation = null;
        panelManager.closePanel();
      }
      return;
    }
    const result = projected.result;
    if (!result.completed) {
      habitatPracticeInvitation = null;
      queuedAction = null;
      actionSheetActions.classList.remove("habitat-practice-actions");
      statusText.textContent = "你保留了牠的改寫，沒有催促，也沒有留下進度。";
      panelManager.closePanel();
      return;
    }

    [...actionSheetActions.querySelectorAll("button")].forEach((button) => { button.disabled = true; });
    const candidateState = cloneState(store.getState());
    const writeResult = companionGrowthController?.writeCarePracticeIntoDraft?.(candidateState, {
      companionId: result.companionId,
      result: result.heartPhaseResult,
      createdAt: Date.now()
    });
    if (writeResult?.accepted !== true) {
      renderHabitatPractice("這次沒有形成合法的照顧證據；你們可以離開，沒有任何扣除。");
      return;
    }
    if (writeResult?.changed) {
      const saveResult = await saveCandidateState?.(candidateState);
      if (saveResult?.ok !== true) {
        renderHabitatPractice("這次沒有安全保存；你們仍停在原處，沒有遺失或扣除任何東西。");
        return;
      }
      store.replaceState(candidateState);
    }

    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
      intent: result.animationIntent,
      source: "habitat-rhythm-practice",
      interrupt: false
    });
    const completedCopy = result.outcomeId === "modify"
      ? "你接受了牠改寫後的距離；這份尊重被現有照顧證據鏈接住。"
      : "你們完成了一次不催促的共鳴實踐。日夜與天氣只改變這一刻的樣子。";
    EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: completedCopy, tone: "calm" });
    statusText.textContent = completedCopy;
    habitatPracticeInvitation = null;
    queuedAction = null;
    actionSheetActions.classList.remove("habitat-practice-actions");
    panelManager.closePanel();
  }

  function ensureHabitatPracticeStyles() {
    if (document.getElementById("habitat-practice-styles")) return;
    const style = document.createElement("style");
    style.id = "habitat-practice-styles";
    style.textContent = [
      ".habitat-practice-actions{display:grid!important;gap:8px}",
      ".habitat-practice-response{margin:0 0 2px;padding:10px 12px;border-inline-start:2px solid rgba(138,217,255,.52);background:linear-gradient(90deg,rgba(18,39,66,.62),transparent);font-size:12px;line-height:1.55;color:#eaf6ff}",
      ".habitat-practice-response.is-modify{border-color:rgba(205,186,255,.7)}",
      ".habitat-practice-response.is-rest,.habitat-practice-response.is-decline{border-color:rgba(255,215,150,.55)}",
      ".habitat-practice-button{min-height:48px!important;border-radius:16px!important}",
      ".habitat-practice-button.is-primary{border-color:rgba(151,226,255,.72)!important;background:linear-gradient(105deg,rgba(38,119,149,.88),rgba(77,65,139,.88))!important}",
      "@media(prefers-reduced-motion:reduce){.habitat-practice-button{transition:none!important}}"
    ].join("");
    document.head.appendChild(style);
  }

  // 記憶回廊：在「記憶」分頁顯示可回看的情緒記憶；點一筆 → 夥伴回應「我們一起記得」。
  function renderMemoryHall(action, state) {
    const existing = document.getElementById("memory-hall");
    if (existing) existing.remove();
    if (action !== "memory" || !actionSheetActions) return;

    const now = Date.now();
    const memories = (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [])
      .filter((memory) => memory && MEMORY_HALL_STATUSES.has(memory.status))
      .sort((left, right) => (Number(right.createdAt) || 0) - (Number(left.createdAt) || 0))
      .slice(0, MEMORY_HALL_LIMIT);

    const hall = document.createElement("div");
    hall.id = "memory-hall";
    hall.className = "memory-hall";

    if (memories.length === 0) {
      const empty = document.createElement("p");
      empty.className = "memory-hall-empty";
      empty.textContent = "記憶回廊現在還是空的。你們說過的話，會慢慢在這裡留下光。";
      hall.appendChild(empty);
      actionSheetActions.parentNode.insertBefore(hall, actionSheetActions);
      return;
    }

    const heading = document.createElement("p");
    heading.className = "memory-hall-head";
    heading.textContent = "記憶回廊 ・ 你們一起留下的痕跡";
    hall.appendChild(heading);

    memories.forEach((memory) => {
      const isLandmark = memory.source === "bond" || String(memory.id || "").startsWith("bond_milestone_");
      const row = document.createElement("div");
      row.className = `memory-hall-row${isLandmark ? " is-landmark" : ""}`;
      row.tabIndex = 0;
      row.setAttribute("role", "button");

      const mark = document.createElement("span");
      mark.className = "memory-hall-mark";
      mark.textContent = isLandmark ? "✦" : getMemoryGlyph(memory.emotion);
      mark.style.setProperty("--accent", getMemoryAccentColor(memory.emotion));

      const copy = document.createElement("span");
      copy.className = "memory-hall-copy";
      const title = document.createElement("strong");
      title.textContent = memory.theme || "一段記憶";
      copy.appendChild(title);

      const rawExcerpt = memory.excerpt || memory.label || "";
      if (rawExcerpt) {
        const excerpt = document.createElement("em");
        excerpt.textContent = rawExcerpt.length > 60 ? `${rawExcerpt.slice(0, 60)}…` : rawExcerpt;
        copy.appendChild(excerpt);
      }

      const metaText = [formatMemoryRelativeTime(Number(memory.createdAt), now), MEMORY_STATUS_LABEL[memory.status] || ""]
        .filter(Boolean)
        .join(" ・ ");
      if (metaText) {
        const meta = document.createElement("span");
        meta.className = "memory-hall-meta";
        meta.textContent = metaText;
        copy.appendChild(meta);
      }

      row.appendChild(mark);
      row.appendChild(copy);

      const openReflection = () => {
        panelManager.closePanel();
        soulTalkController.reflectOnMemory(memory);
        soulTalkController.openSoulTalk(panelManager);
      };
      row.addEventListener("click", openReflection);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openReflection();
        }
      });

      hall.appendChild(row);
    });

    actionSheetActions.parentNode.insertBefore(hall, actionSheetActions);
  }

  // 成長分頁：把已綻放的羈絆里程碑做成可回顧的年表（重用 emotionalMemories）。
  function renderGrowthChronicle(action, state) {
    const existing = document.getElementById("bond-chronicle");
    if (existing) existing.remove();
    if (action !== "grow" || !actionSheetActions) return;

    const memoriesById = new Map(
      (Array.isArray(state.emotionalMemories) ? state.emotionalMemories : []).map((memory) => [memory?.id, memory])
    );
    const reachedCount = BOND_MILESTONES.filter((milestone) => memoriesById.has(milestone.id)).length;

    const chronicle = document.createElement("div");
    chronicle.id = "bond-chronicle";
    chronicle.className = "bond-chronicle";

    const heading = document.createElement("p");
    heading.className = "bond-chronicle-head";
    heading.textContent = reachedCount > 0
      ? `羈絆年表 ・ 已綻放 ${reachedCount} / ${BOND_MILESTONES.length} 道光痕`
      : "羈絆年表 ・ 還沒有光痕，但你們正在開始。";
    chronicle.appendChild(heading);

    let nextHinted = false;
    BOND_MILESTONES.forEach((milestone) => {
      const memory = memoriesById.get(milestone.id);
      const reached = Boolean(memory);
      const row = document.createElement("div");
      row.className = `bond-chronicle-row${reached ? " is-reached" : " is-locked"}`;

      let desc;
      if (reached) {
        desc = memory.excerpt || milestone.line;
      } else if (!nextHinted) {
        // 質性呈現：下一道光痕只給主題與陪伴語感，不暴露 threshold／目前分數。
        nextHinted = true;
        desc = formatUpcomingMilestoneCopy(milestone.theme, "zh");
      } else {
        desc = "還未亮起——陪伴會自己走到那裡。";
      }

      const mark = document.createElement("span");
      mark.className = "bond-chronicle-mark";
      mark.textContent = reached ? "✦" : "◇";
      const copy = document.createElement("span");
      copy.className = "bond-chronicle-copy";
      const title = document.createElement("strong");
      title.textContent = reached ? milestone.theme : "？？？";
      const detail = document.createElement("em");
      detail.textContent = desc;
      copy.appendChild(title);
      copy.appendChild(detail);
      row.appendChild(mark);
      row.appendChild(copy);
      chronicle.appendChild(row);
    });

    actionSheetActions.parentNode.insertBefore(chronicle, actionSheetActions);
  }

  function renderActionRows(rows) {
    actionSheetActions.innerHTML = "";
    rows.forEach((row) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = row.label;
      button.addEventListener("click", () => {
        commitNavAction(queuedAction, row);
        queuedAction = null;
        // open_map 會自行切換到地圖面板，不可再關閉。
        if (row?.kind !== "open_map") panelManager.closePanel();
      });
      actionSheetActions.appendChild(button);
    });
  }

  function commitNavAction(action, row) {
    const actionMeta = getActionMeta(action, store.getState());
    if (!actionMeta) return;

    if (row?.kind === "open_map") {
      if (typeof openMap === "function") {
        openMap();
      } else {
        EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: "探索地圖整備中。", tone: "calm" });
      }
      return { ok: typeof openMap === "function" };
    }

    if (row?.kind === "calm_sync") {
      calmSyncController?.start();
      return { ok: Boolean(calmSyncController?.start) };
    }

    if (row?.kind === "open_codex") {
      if (typeof openCodex === "function") {
        openCodex();
      } else {
        EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: "圖鑑整備中。", tone: "calm" });
      }
      return { ok: typeof openCodex === "function" };
    }

    const stateBeforeAction = store.getState();
    const choice = row?.choice;
    const result = evaluateActionEffect(store.getState(), action, choice);
    store.setState(result.statePatch);
    if (result.environmentEvent) EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, result.environmentEvent);
    // 優先用引擎情境文案（條件分支／尊重沉積），靜態 status 只作後備。
    const message = result.message || row?.status || actionMeta.message;
    EventBus.emit(HABITAT_STATUS_TOAST_EVENT, { text: message, tone: "calm" });
    statusText.textContent = message;
    const saveResult = saveCurrentState();
    if (saveResult?.ok === false) {
      store.replaceState(stateBeforeAction);
      const error = new Error("Page action state was not saved");
      error.code = "SAVE_FAILED";
      error.cause = saveResult.error;
      throw error;
    }
    return saveResult;
  }

  function setActiveNav(action) {
    bottomNavButtons.forEach((button) => {
      const isActive = button.dataset.action === action;
      button.classList.toggle("active", isActive);
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  return {
    bind,
    openActionSheet,
    showHome,
    performAction: commitNavAction,
    setActiveNav
  };
}

function getActionMeta(action, state = {}) {
  const actions = {
    explore: {
      title: "探索",
      copy: "走出營地，或與夥伴在棲地找個安靜的地方。",
      message: "探索完成。",
      rows: [
        { label: "開啟探索地圖", kind: "open_map", status: "探索地圖展開。" },
        { label: "與夥伴走近湖畔", choice: "lake_glow", status: "你們一起走近湖岸。" },
        { label: "星圖回廊", choice: "star_corridor", status: "星圖回廊回應了一道安靜脈動。" },
        { label: "對準靜默錨點", choice: "silent_crystal", status: "把散落的微光收成可回看的晶簇。" }
      ]
    },
    care: {
      title: "照顧",
      copy: "提供支持，但不強迫靠近。",
      message: "照顧完成。",
      rows: [
        { label: "輕聲安撫", choice: "soft_comfort", status: "你放輕聲音。夥伴稍微放鬆了一點。" },
        { label: "能量補給", choice: "energy_supply", status: "溫暖能量回到心核。" },
        { label: "一起休息", choice: "rest_together", status: "你們一起把節奏放慢。" },
        { label: "讀身體語言", choice: "observe_body", status: "你看懂了牠此刻的身體語言。" },
        { label: "心核共息", kind: "calm_sync" }
      ]
    },
    grow: {
      title: "成長",
      copy: "回顧你們一起走過的距離，不是調校儀表。",
      message: "成長調整完成。",
      rows: [
        { label: "回顧信任時刻", choice: "trust_reflection", status: "信任在安靜裡往前了一點。" },
        { label: "心核共息", kind: "calm_sync" },
        { label: "翻開關係圖鑑", kind: "open_codex", status: "圖鑑翻開了。" }
      ]
    },
    memory: {
      title: "記憶",
      copy: "保存今天留下的一小段痕跡。",
      message: "記憶已保存。",
      rows: [
        { label: "湖面片段", choice: "lake_fragment", status: "湖面片段被收入心核。" },
        { label: "今日回聲", choice: "today_echo", status: "今天的回聲被輕輕記下。" },
        { label: "夥伴筆記", choice: "companion_note", status: "夥伴筆記已保存。" }
      ]
    }
  };

  const meta = actions[action];
  if (!meta) return meta;

  const energy = Number(state.energy ?? 10);
  const defense = Number(state.defense ?? 0);
  const emotionalMemoryCount = Array.isArray(state.emotionalMemories) ? state.emotionalMemories.length : 0;

  // 防備偏高時：照顧／成長以「靜靜陪伴」優先，不強迫靠近。
  if (defense >= 60 && (action === "care" || action === "grow")) {
    meta.rows = [
      { label: "靜靜陪伴", choice: "gentle_presence", status: "你只是待在牠身邊，沒有伸手。牠的肩膀慢慢鬆了。" },
      ...meta.rows.filter((row) => row.choice !== "gentle_presence")
    ];
    meta.copy = "牠現在需要一點距離。先讓陪伴代替觸碰。";
  }

  // 能量偏低時：照顧以「陪伴休息」優先。
  if (energy <= 3 && action === "care") {
    const restRow = meta.rows.find((row) => row.choice === "rest_together");
    if (restRow) {
      meta.rows = [restRow, ...meta.rows.filter((row) => row !== restRow)];
      meta.copy = "夥伴的能量偏低。先一起休息，其他的可以等。";
    }
  }

  // 情緒記憶累積後：記憶面板出現「回聲整理」。
  if (emotionalMemoryCount >= 3 && action === "memory") {
    meta.rows = [
      { label: "回聲整理", choice: "memory_echo", status: "你們把最近的幾段回聲輕輕排好，棲地安靜了一點。" },
      ...meta.rows
    ];
  }

  return meta;
}

function cloneState(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
