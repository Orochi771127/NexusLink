import { runRaphaelCore, applyRaphaelCoreResult } from "../ai/raphaelCore.js";
import { maybeTriggerFirstAwakening } from "../ai/awakening/firstAwakeningRuntime.js";
import { isRaphaelAwakened } from "../ai/awakening/raphaelAwakeningGate.js";
import { updateMemoryLifecycles } from "../engine/memoryLifecycleEngine.js";
import { buildEventReflection, composeMemoryReflection } from "../engine/soulTalkComposer.js";
import { qs } from "../utils/dom.js";

const DEFAULT_STATUS_TEXT = "心語 / 靈魂聖域";
const DEFAULT_PREVIEW_TEXT = "我在這裡，安靜地看著你。";

export function createSoulTalkController({ store, saveCurrentState }) {
  const chatLog = qs("#chat-log");
  const quickReplyRow = qs("#quick-reply-row");
  const messageInput = qs("#message-input");
  const sendButton = qs("#send-button");
  const soulTalkPreview = qs("#soul-talk-preview");
  const soulTalkModal = qs(".soul-talk-modal");
  const statusText = qs("#status-text");
  let currentCreature = null;
  let waveformShell = null;
  let thinkingTimer = null;
  const pageLoadedAt = Date.now();
  let crossSessionReflected = false;
  let lastQuickReplies = [];

  function setCreature(creature) {
    currentCreature = creature;
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

    messageInput.addEventListener("focus", () => setSoulTalkState("active"));
    messageInput.addEventListener("input", () => {
      setSoulTalkState(messageInput.value.trim() ? "active" : "idle");
    });
    messageInput.addEventListener("blur", () => setSoulTalkState("idle"));
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
    setStatusText("心核正在聽你說話...");
    addChat("player", message);

    let result;

    store.updateState((state) => {
      const moodBefore = state.mood;
      const now = Date.now();
      const idSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

      const lifecycleResult = updateMemoryLifecycles(state.emotionalMemories || [], now);
      state.emotionalMemories = lifecycleResult.updatedMemories;

      let awakeningResult = null;
      if (!isRaphaelAwakened(state)) {
        awakeningResult = maybeTriggerFirstAwakening(state, {
          companion: currentCreature,
          now,
          dispatchAnimation: true
        });
      }

      const coreResult = runRaphaelCore(message, state, {
        now,
        idSuffix,
        companion: currentCreature,
        repeated: message === state.lastMessage,
        quickReply: options.quickReply || null
      });

      applyRaphaelCoreResult(state, coreResult, { companion: currentCreature, now });

      result = {
        moodBefore,
        moodAfter: state.mood,
        repeated: coreResult.input?.repeated,
        awakening: awakeningResult,
        isAwakened: isRaphaelAwakened(state),
        coreResult
      };
    });

    lastQuickReplies = result?.coreResult?.quickReplies || [];
    saveCurrentState();
    renderChat();
    renderQuickReplies(lastQuickReplies);
    window.clearTimeout(thinkingTimer);
    thinkingTimer = window.setTimeout(() => setSoulTalkState("idle"), 720);
    return result;
  }

  function ensureWaveformShell() {
    if (waveformShell || !soulTalkModal) return;

    waveformShell = document.createElement("section");
    waveformShell.className = "soul-talk-waveform";
    waveformShell.setAttribute("aria-label", "心語聆聽波形");
    waveformShell.innerHTML = `
      <div class="soul-waveform-copy">
        <strong>心語</strong>
        <span>靈魂聖域</span>
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

  function setStatusText(text) {
    if (!statusText) return;
    statusText.textContent = text || DEFAULT_STATUS_TEXT;
  }

  function addChat(role, text) {
    store.updateState((state) => {
      state.reactionPreview = "";
      state.chatHistory.push({ role, text });
      if (state.chatHistory.length > 24) state.chatHistory.shift();
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

    for (const item of visibleHistory) {
      const line = document.createElement("div");
      const role = item.role === "fox" ? "companion" : item.role;
      line.className = `chat-line ${role}`;
      if (role === "player") {
        line.textContent = `你：${item.text}`;
      } else if (role === "system") {
        line.textContent = `棲地：${item.text}`;
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