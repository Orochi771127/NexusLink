import { qs } from "../utils/dom.js";

export function createSoulTalkController({ store, saveCurrentState }) {
  const chatLog = qs("#chat-log");
  const messageInput = qs("#message-input");
  const sendButton = qs("#send-button");
  const soulTalkPreview = qs("#soul-talk-preview");
  const soulTalkModal = qs(".soul-talk-modal");
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
    messageInput.addEventListener("input", () => setSoulTalkState(messageInput.value.trim() ? "active" : "idle"));
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
      } else if (/累|悶|難過|不想|孤單|寂寞/.test(message)) {
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
    waveformShell.className = "soul-waveform-panel";
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
    soulTalkPreview.textContent = state.reactionPreview || (lastItem ? lastItem.text : "我在這裡，安靜地看著你。");

    for (const item of visibleHistory) {
      const line = document.createElement("div");
      const role = item.role === "fox" ? "companion" : item.role;
      line.className = `chat-line ${role}`;
      if (role === "player") {
        line.textContent = `你：${item.text}`;
      } else if (role === "system") {
        line.textContent = `聖域：${item.text}`;
      } else {
        line.textContent = `${currentCreature.name}：${item.text}`;
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
    renderChat
  };
}

function mockAIResponse(message, repeated, energy) {
  if (repeated) return "你剛剛一直重複同一句話……我有點不安。我想慢一點。";
  if (energy <= 1) return "我有點累了。可以陪我安靜待一下嗎？";
  if (/累|悶|難過|不想|孤單|寂寞/.test(message)) return "今天的空氣好像有點重。我先不吵你，你可以在這裡待一下。";
  if (/摸|摸摸|陪/.test(message)) return "嗯……火變得比較暖了。你還在，這件事我有感覺到。";
  return "我聽見了。這句話會留在火光裡一小段時間。";
}
