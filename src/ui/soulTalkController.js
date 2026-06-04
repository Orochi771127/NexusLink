import { qs } from "../utils/dom.js";

const DEFAULT_STATUS_TEXT = "SOUL TALK / 靈魂聖域";
const DEFAULT_PREVIEW_TEXT = "我在這裡，安靜地看著你。";

export function createSoulTalkController({ store, saveCurrentState }) {
  const chatLog = qs("#chat-log");
  const messageInput = qs("#message-input");
  const sendButton = qs("#send-button");
  const soulTalkPreview = qs("#soul-talk-preview");
  const soulTalkModal = qs(".soul-talk-modal");
  const statusText = qs("#status-text");
  let currentCreature = null;
  let waveformShell = null;
  let thinkingTimer = null;

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
    renderChat();
    panelManager.openPanel("soulTalk");
  }

  function handlePlayerMessage(message) {
    setSoulTalkState("thinking");
    setStatusText("正在聆聽心核回聲...");
    addChat("player", message);

    let result;
    store.updateState((state) => {
      const moodBefore = state.mood;
      const repeated = message === state.lastMessage;
      state.lastMessage = message;
      state.bond += 1;
      state.energy = Math.max(0, state.energy - 1);

      if (repeated) {
        state.spamScore += 1;
        state.trust = Math.max(0, state.trust - 1);
        state.mood = "defensive";
      } else if (state.energy <= 2) {
        state.mood = "tired";
      } else if (/謝謝|安靜|陪我|晚安|休息/.test(message)) {
        state.mood = "calm";
        state.trust += 1;
      } else {
        state.mood = "warm";
      }

      const reply = mockAIResponse(message, repeated, state.energy);
      state.reactionPreview = "";
      state.chatHistory.push({ role: "companion", text: reply });
      if (state.chatHistory.length > 24) state.chatHistory.shift();
      result = { moodBefore, moodAfter: state.mood, repeated };
    });

    saveCurrentState();
    renderChat();
    window.clearTimeout(thinkingTimer);
    thinkingTimer = window.setTimeout(() => setSoulTalkState("idle"), 720);
    return result;
  }

  function ensureWaveformShell() {
    if (waveformShell || !soulTalkModal) return;

    waveformShell = document.createElement("section");
    waveformShell.className = "soul-talk-waveform";
    waveformShell.setAttribute("aria-label", "Soul Talk listening waveform");
    waveformShell.innerHTML = `
      <div class="soul-waveform-copy">
        <strong>SOUL TALK</strong>
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
        line.textContent = `系統：${item.text}`;
      } else {
        const name = currentCreature?.name || "夥伴";
        line.textContent = `${name}：${item.text}`;
      }
      chatLog.appendChild(line);
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  return {
    setCreature,
    bind,
    focusInput,
    openSoulTalk,
    addChat,
    renderChat,
    setStatusText
  };
}

function mockAIResponse(message, repeated, energy) {
  if (repeated) return "我聽見同一句話反覆出現。先一起慢慢呼吸，好嗎？";
  if (energy <= 1) return "我有點累了，可以陪我安靜待一下嗎？";
  if (/謝謝|安靜|陪我|晚安|休息/.test(message)) return "謝謝你把聲音放輕。我會在這裡，陪你把心慢慢安放。";
  if (/探索|去哪|外面/.test(message)) return "湖面上有微光在移動，也許那是下一段記憶的入口。";
  return "我接住你的訊號了。讓我們把它變成一點更穩定的光。";
}
