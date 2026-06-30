import { runRaphaelCore, applyRaphaelCoreResult } from "../ai/raphaelCore.js";
import { createRaphaelAgentIntent } from "../ai/raphaelAgentAdapter.js";
import { maybeTriggerFirstAwakening } from "../ai/awakening/firstAwakeningRuntime.js";
import { isRaphaelAwakened } from "../ai/awakening/raphaelAwakeningGate.js";
import { updateMemoryLifecycles } from "../engine/memoryLifecycleEngine.js";
import { isEmotionalHabitatTrace } from "../engine/habitatTraceEngine.js";
import { applyRaphaelAgentReduction, reduceRaphaelAgentIntent } from "../engine/raphaelIntentReducer.js";
import { buildEventReflection, composeMemoryReflection } from "../engine/soulTalkComposer.js";
import { qs, syncViewportDuringTransition, setKeyboardExpected } from "../utils/dom.js";

const DEFAULT_STATUS_TEXT = "心湖 / 安靜待命";
const DEFAULT_PREVIEW_TEXT = "你可以慢慢說，灰影會聽。";
const FIRST_TRACE_SYSTEM_TEXT = "月湖留下了第一道很淡的光。這不是獎勵，是牠記得你說過的事。";
const FIRST_TRACE_STATUS_TEXT = "第一道痕跡已安靜留在月湖。";
const NON_REWARDING_MODES = new Set(["safety_redirect", "withdraw", "reject"]);

export function createSoulTalkController({ store, saveCurrentState }) {
  const chatLog = qs("#chat-log");
  const quickReplyRow = qs("#quick-reply-row");
  const messageInput = qs("#message-input");
  const sendButton = qs("#send-button");
  const soulTalkPreview = qs("#soul-talk-preview");
  const soulTalkModal = qs(".soul-talk-modal");
  const soulDrawerCompanionName = qs("#soul-drawer-companion-name");
  const statusText = qs("#status-text");
  let currentCreature = null;
  let waveformShell = null;
  let thinkingTimer = null;
  const pageLoadedAt = Date.now();
  let crossSessionReflected = false;
  let lastQuickReplies = [];

  function setCreature(creature) {
    currentCreature = creature;
    if (soulDrawerCompanionName) {
      soulDrawerCompanionName.textContent = creature?.name || "夥伴";
    }
  }

  function bind() {
    ensureWaveformShell();

    sendButton.addEventListener("click", () => {
      const value = messageInput.value.trim();
      if (!value) return;
      messageInput.value = "";
      handlePlayerMessage(value);
    });

    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
      }
    });

    messageInput.addEventListener("focus", () => {
      setSoulTalkState("active");
      // focus 當下就「樂觀預收合」drawer（用估計鍵盤高度），消除 iOS 首次點擊的黑塊；
      // 接著在較長的鍵盤動畫窗口內持續重量 + nudge，等 visualViewport 真的更新後換成真值。
      setKeyboardExpected(true);
      syncViewportDuringTransition(2000);
      window.requestAnimationFrame(() => {
        if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;
      });
    });
    messageInput.addEventListener("input", () => {
      setSoulTalkState(messageInput.value.trim() ? "active" : "idle");
    });
    messageInput.addEventListener("blur", () => {
      setSoulTalkState("idle");
      // 取消樂觀估計；鍵盤收合動畫期間持續重量，版面乾淨地回復全高。
      setKeyboardExpected(false);
      syncViewportDuringTransition(800);
    });
  }

  function focusInput() {
    setSoulTalkState("active");
    messageInput.focus({ preventScroll: true });
  }

  function openSoulTalk(panelManager) {
    ensureWaveformShell();
    setSoulTalkState("idle");
    maybeReflectCrossSessionEvent();
    renderChat();
    panelManager.openPanel("soulTalk");
  }

  function maybeReflectCrossSessionEvent() {
    if (crossSessionReflected) return;
    const state = store.getState();
    const lastBattleAt = state.battleRecord?.lastBattleAt || 0;
    if (!lastBattleAt || lastBattleAt >= pageLoadedAt) return;
    const reflection = buildEventReflection(state, Date.now());
    if (!reflection) return;
    crossSessionReflected = true;
    const recentTail = (state.chatHistory || []).slice(-8);
    if (recentTail.some((entry) => entry.text === reflection)) return;
    addChat("companion", reflection);
    saveCurrentState();
  }

  function handleQuickReply(quickReply) {
    if (!quickReply?.label) return;
    handlePlayerMessage(quickReply.label, { quickReply });
  }

  function handlePlayerMessage(message, options = {}) {
    setSoulTalkState("thinking");
    setStatusText("灰影正在聽，先把湖面放慢……");
    addChat("player", message);

    let result;

    store.updateState((state) => {
      const moodBefore = state.mood;
      const now = Date.now();
      const idSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
      const traceCountBefore = countVisibleRelationshipTraces(state.habitatTraces);

      const lifecycleResult = updateMemoryLifecycles(state.emotionalMemories || [], now);
      state.emotionalMemories = lifecycleResult.updatedMemories;

      const coreResult = runRaphaelCore(message, state, {
        now,
        idSuffix,
        companion: currentCreature,
        repeated: message === state.lastMessage,
        quickReply: options.quickReply || null
      });

      let awakeningResult = null;
      if (!isRaphaelAwakened(state) && shouldAllowFirstAwakening(coreResult)) {
        awakeningResult = maybeTriggerFirstAwakening(state, {
          companion: currentCreature,
          now,
          dispatchAnimation: true
        });
      } else if (!isRaphaelAwakened(state)) {
        awakeningResult = { applied: false, reason: "safety_or_boundary_deferred" };
      }

      const coreResultToApply = awakeningResult?.applied
        ? deferOrdinaryMemoryForFirstAwakeningTurn(coreResult)
        : coreResult;
      const applied = applyRaphaelCoreResult(state, coreResultToApply, { companion: currentCreature, now });
      const traceCountAfter = countVisibleRelationshipTraces(state.habitatTraces);
      const firstTraceCreated = shouldAnnounceFirstTrace({
        traceCountBefore,
        traceCountAfter,
        coreResult: coreResultToApply,
        awakeningResult,
        state
      });

      if (firstTraceCreated) {
        appendChatLine(state, "system", FIRST_TRACE_SYSTEM_TEXT);
      }

      const agentIntent = createRaphaelAgentIntent({
        eventType: "soul_talk",
        coreResult: coreResultToApply,
        state,
        companion: currentCreature,
        now,
        options: {
          speechAlreadyApplied: true,
          animationAlreadyApplied: true
        }
      });
      const agentReduction = reduceRaphaelAgentIntent(agentIntent, state);

      result = {
        moodBefore,
        moodAfter: state.mood,
        repeated: coreResult.input?.repeated,
        awakening: awakeningResult,
        isAwakened: isRaphaelAwakened(state),
        coreResult: coreResultToApply,
        originalCoreResult: coreResult,
        applied,
        agentIntent,
        agentReduction,
        firstTraceCreated,
        deferredOrdinaryTrace: Boolean(awakeningResult?.applied)
      };
    });

    lastQuickReplies = result?.coreResult?.quickReplies || [];
    saveCurrentState();
    renderChat();
    renderQuickReplies(lastQuickReplies);
    if (result?.agentReduction) {
      applyRaphaelAgentReduction(result.agentReduction, {
        setPresenceState: setRaphaelAgentPresence,
        setStatusText: result?.firstTraceCreated ? null : setStatusText
      });
    }
    if (result?.firstTraceCreated) {
      setStatusText(FIRST_TRACE_STATUS_TEXT);
    }
    window.clearTimeout(thinkingTimer);
    thinkingTimer = window.setTimeout(() => setSoulTalkState("idle"), 720);
    return result;
  }

  function ensureWaveformShell() {
    if (waveformShell || !soulTalkModal) return;

    waveformShell = document.createElement("section");
    waveformShell.className = "soul-talk-waveform";
    waveformShell.setAttribute("aria-label", "心湖聲紋狀態");
    waveformShell.innerHTML = `
      <div class="soul-waveform-copy">
        <strong>心湖</strong>
        <span>安靜待命</span>
      </div>
      <div class="soul-waveform" aria-hidden="true">
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
        <div class="waveform-bar"></div>
      </div>
    `;

    const copy = waveformShell.querySelector(".soul-waveform-copy");
    if (statusText && copy) {
      statusText.textContent = statusText.textContent.trim() || DEFAULT_STATUS_TEXT;
      copy.appendChild(statusText);
    }

    soulTalkModal.insertBefore(waveformShell, chatLog);
    setSoulTalkState("idle");
  }

  function setSoulTalkState(state) {
    if (!soulTalkModal) return;
    if (state !== "thinking") window.clearTimeout(thinkingTimer);
    soulTalkModal.classList.toggle("is-listening", state === "active");
    soulTalkModal.classList.toggle("is-thinking", state === "thinking");
    soulTalkModal.classList.toggle("is-idle", state === "idle");
  }

  function setRaphaelAgentPresence(presenceState) {
    if (!soulTalkModal) return;
    soulTalkModal.dataset.raphaelAgentPresence = presenceState || "quiet";
  }

  function setStatusText(text) {
    if (!statusText) return;
    statusText.textContent = text || DEFAULT_STATUS_TEXT;
  }

  function addChat(role, text) {
    store.updateState((state) => {
      state.reactionPreview = "";
      appendChatLine(state, role, text);
    });
  }

  function renderQuickReplies(quickReplies = []) {
    if (!quickReplyRow) return;
    quickReplyRow.innerHTML = "";

    for (const item of quickReplies) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quick-reply-chip";
      button.textContent = item.label;
      button.addEventListener("click", () => handleQuickReply(item));
      quickReplyRow.appendChild(button);
    }
  }

  function renderChat() {
    const state = store.getState();
    chatLog.innerHTML = "";
    const visibleHistory = state.chatHistory.slice(-12);
    const lastItem = state.chatHistory[state.chatHistory.length - 1];
    soulTalkPreview.textContent = state.reactionPreview || (lastItem ? lastItem.text : DEFAULT_PREVIEW_TEXT);

    let prevKey = null;
    for (const item of visibleHistory) {
      const role = item.role === "fox" ? "companion" : item.role;
      const dedupeKey = `${role} ${item.text}`;
      if (dedupeKey === prevKey) continue; // 連續相同訊息不重複顯示（catch-all，含舊存檔已存在的重複）
      prevKey = dedupeKey;
      const line = document.createElement("div");
      line.className = `chat-line ${role}`;
      if (role === "player") {
        line.textContent = `你：${item.text}`;
      } else if (role === "system") {
        line.textContent = `心湖：${item.text}`;
      } else {
        const name = currentCreature?.name || "夥伴";
        line.textContent = `${name}：${item.text}`;
      }
      chatLog.appendChild(line);
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function reflectOnMemory(memory) {
    if (!memory) return;
    const line = composeMemoryReflection({
      memory,
      companion: currentCreature,
      state: store.getState()
    });
    if (!line) return;
    addChat("companion", line);
    saveCurrentState();
  }

  return {
    setCreature,
    bind,
    focusInput,
    openSoulTalk,
    addChat,
    renderChat,
    reflectOnMemory,
    setStatusText
  };
}

function countVisibleRelationshipTraces(traces = []) {
  if (!Array.isArray(traces)) return 0;
  return traces.filter((trace) => isEmotionalHabitatTrace(trace)).length;
}

function shouldAnnounceFirstTrace({ traceCountBefore, traceCountAfter, coreResult, awakeningResult, state }) {
  if (traceCountBefore !== 0 || traceCountAfter <= traceCountBefore) return false;
  if (hasRecentChatEntry(state, FIRST_TRACE_SYSTEM_TEXT)) return false;

  if (!shouldAllowFirstAwakening(coreResult)) return false;

  const memoryDecision = coreResult?.memoryDecision || {};
  const traceDecision = coreResult?.traceDecision || {};
  return Boolean(awakeningResult?.applied || memoryDecision.shouldWrite || traceDecision.shouldApplyTrace);
}

function shouldAllowFirstAwakening(coreResult) {
  const planMode = coreResult?.plan?.mode || "";
  if (NON_REWARDING_MODES.has(planMode)) return false;

  const safety = coreResult?.safety || coreResult?.perception?.safety || {};
  if (safety.isHighRisk || (safety.riskLevel && safety.riskLevel !== "none")) return false;
  if (safety.shouldCreateMemory === false || safety.shouldRewardRelationship === false) return false;

  return true;
}

function deferOrdinaryMemoryForFirstAwakeningTurn(coreResult) {
  return {
    ...coreResult,
    memoryDecision: {
      ...(coreResult?.memoryDecision || {}),
      shouldWrite: false,
      memoryObject: null,
      reason: "deferred_first_awakening_turn"
    },
    traceDecision: {
      ...(coreResult?.traceDecision || {}),
      shouldApplyTrace: false,
      traceObject: null,
      reason: "deferred_first_awakening_turn"
    },
    stateMutation: {
      ...(coreResult?.stateMutation || {}),
      shouldTriggerMilestone: false
    }
  };
}

function hasRecentChatEntry(state, text) {
  return (state.chatHistory || []).slice(-12).some((entry) => entry?.text === text);
}

function appendChatLine(state, role, text) {
  if (!Array.isArray(state.chatHistory)) state.chatHistory = [];
  // 連續相同訊息去重：避免回歸問候/反思在多次進場累積出重複行（presentation，不動 Raphael 推理）。
  const last = state.chatHistory[state.chatHistory.length - 1];
  if (last && last.role === role && last.text === text) return;
  state.chatHistory.push({ role, text });
  if (state.chatHistory.length > 24) {
    state.chatHistory.splice(0, state.chatHistory.length - 24);
  }
}
