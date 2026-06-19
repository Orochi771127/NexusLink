import { processEmotionInput } from "../engine/emotionalSedimentationEngine.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import { updateMemoryLifecycles } from "../engine/memoryLifecycleEngine.js";
import { buildSafetyShieldReply } from "../engine/safeHarborMode.js";
import { buildEventReflection, composeCompanionReply, composeFallbackReply } from "../engine/soulTalkComposer.js";
import { buildMilestoneMemory, findNewBondMilestone } from "../engine/bondMilestoneEngine.js";
import { qs } from "../utils/dom.js";

const DEFAULT_STATUS_TEXT = "心語 / 靈魂聖域";
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
  // 跨 session 閉環：對峙發生在「本次頁面載入之前」且仍新鮮時，
  // 開啟心語的第一次補上引用（同 session 的引用由 battleController 即時推送）。
  const pageLoadedAt = Date.now();
  let crossSessionReflected = false;

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
    if (!lastBattleAt || lastBattleAt >= pageLoadedAt) return; // 本 session 的對峙已即時引用過
    const reflection = buildEventReflection(state, Date.now());
    if (!reflection) return;
    crossSessionReflected = true;
    // 上一個 session 已推過同一句（已持久化在 chatHistory）就不重複。
    const recentTail = (state.chatHistory || []).slice(-8);
    if (recentTail.some((entry) => entry.text === reflection)) return;
    addChat("companion", reflection);
    saveCurrentState();
  }

  function handlePlayerMessage(message) {
    setSoulTalkState("thinking");
    setStatusText("心核正在聽你說話...");
    addChat("player", message);

    let result;

    store.updateState((state) => {
      const moodBefore = state.mood;
      const repeated = message === state.lastMessage;
      const now = Date.now();
      const idSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");

      const lifecycleResult = updateMemoryLifecycles(state.emotionalMemories || [], now);
      state.emotionalMemories = lifecycleResult.updatedMemories;

      const sedimentationResult = processEmotionInput(message, state, {
        now,
        idSuffix
      });

      state.lastMessage = message;

      let reply = "";
      let replyRole = "companion";

      if (sedimentationResult.safetyRisk?.riskLevel === "high") {
        state.energy = Math.max(state.energy, 1);
        state.safeHarborMode = true;
        state.mood = "safe_harbor";
        state.trust = Math.max(state.trust, 5);
        state.reactionPreview = "";
        replyRole = "system";
        reply = buildSafetyShieldReply();
      } else if (sedimentationResult.triggerSafeHarbor) {
        state.energy = Math.min(10, Math.max(state.energy, 1) + 0.5);
        state.safeHarborMode = true;
        state.spamScore = Math.max(0, state.spamScore - 1);
        state.trust += 1;
        state.bond += 1;
        state.defense = Math.max(0, state.defense - 2);
        state.mood = sedimentationResult.matchedEmotionKey === "fatigue" ? "tired" : "calm";

        if (sedimentationResult.shouldCreateMemory && sedimentationResult.memoryObject) {
          pushEmotionalMemoryWithTrace(state, sedimentationResult.memoryObject, now);
        }

        reply = composeCompanionReply({
          emotionKey: sedimentationResult.matchedEmotionKey || sedimentationResult.memoryObject?.emotion,
          state,
          companion: currentCreature,
          now,
          excludeMemoryId: sedimentationResult.memoryObject?.id || null
        }).reply;
      } else {
        state.energy = Math.max(0, state.energy - 1);

        if (sedimentationResult.memoryObject) {
          state.safeHarborMode = false;
          state.bond += 2;
          state.trust += 1;
          state.mood = mapEmotionToMood(sedimentationResult.memoryObject.emotion);
          pushEmotionalMemoryWithTrace(state, sedimentationResult.memoryObject, now);
          reply = composeCompanionReply({
            emotionKey: sedimentationResult.memoryObject.emotion,
            state,
            companion: currentCreature,
            now,
            excludeMemoryId: sedimentationResult.memoryObject.id || null
          }).reply;
        } else if (repeated) {
          state.safeHarborMode = false;
          state.spamScore += 1;
          state.trust = Math.max(0, state.trust - 1);
          state.mood = "defensive";
          reply = mockAIResponse(message, repeated, state.energy);
        } else if (state.energy <= 2) {
          state.safeHarborMode = false;
          state.bond += 1;
          state.mood = "tired";
          reply = composeFallbackReply({ baseReply: mockAIResponse(message, repeated, state.energy), state, companion: currentCreature });
        } else if (/謝謝|安靜|陪我|晚安|休息/.test(message)) {
          state.safeHarborMode = false;
          state.bond += 1;
          state.mood = "calm";
          state.trust += 1;
          reply = composeFallbackReply({ baseReply: mockAIResponse(message, repeated, state.energy), state, companion: currentCreature });
        } else {
          state.safeHarborMode = false;
          state.bond += 1;
          state.mood = "warm";
          reply = composeFallbackReply({ baseReply: mockAIResponse(message, repeated, state.energy), state, companion: currentCreature });
        }
      }

      state.habitatRepairFactor = calculateHabitatRepairFactor(state.emotionalMemories);
      state.reactionPreview = "";
      state.chatHistory.push({ role: replyRole, text: reply });

      // 羈絆里程碑：bond 跨過門檻時，夥伴說一句深化關係的話，並在魔法陣綻放一道金色符文光痕。
      const newMilestone = findNewBondMilestone(state.bond, state.emotionalMemories);
      if (newMilestone) {
        pushEmotionalMemoryWithTrace(state, buildMilestoneMemory(newMilestone, now), now);
        state.chatHistory.push({ role: "companion", text: newMilestone.line });
      }

      if (state.chatHistory.length > 24) state.chatHistory.shift();

      result = {
        moodBefore,
        moodAfter: state.mood,
        repeated,
        sedimentationResult
      };
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

function pickReplyLine(pool, seed) {
  return pool[Math.abs(seed) % pool.length];
}

function mockAIResponse(message, repeated, energy) {
  // 以訊息長度＋能量當穩定 seed，讓一般對話有變化但不每幀亂跳。
  const seed = (message?.length || 0) + Math.round(energy || 0);

  if (repeated) {
    return pickReplyLine([
      "我聽見同一句話反覆出現。先一起慢慢呼吸，好嗎？",
      "這句你說了好幾次了。我都在聽——不用急著讓我懂。",
      "同樣的話沒關係，我不會聽膩；只是想讓你知道，我一直都在。"
    ], seed);
  }
  if (energy <= 1) {
    return pickReplyLine([
      "我有點累了，可以陪我安靜待一下嗎？",
      "今晚的我步調慢了些……就讓我們一起放空一會兒。",
      "能量低低的時候，靠著彼此就好，不用說太多話。"
    ], seed);
  }
  if (/謝謝|感謝|安靜|陪我|晚安|休息/.test(message)) {
    return pickReplyLine([
      "謝謝你把聲音放輕。我會在這裡，陪你把心慢慢安放。",
      "晚安這種話我很喜歡。今晚的湖面也替你留了一盞燈。",
      "願意慢下來陪我，這件事本身就很溫柔。"
    ], seed);
  }
  if (/探索|去哪|外面|冒險|地圖|裂隙/.test(message)) {
    return pickReplyLine([
      "湖面上有微光在移動，也許那是下一段記憶的入口。",
      "外面的場域偶爾會起雜訊，但只要我們一起，就能慢慢把它穩下來。",
      "想出去走走嗎？我陪你；走不動了就回來，這裡永遠是歸所。"
    ], seed);
  }
  if (/\?|？|嗎|為什麼|怎麼|是不是/.test(message)) {
    return pickReplyLine([
      "這個問題我先收著。有些答案要在湖邊待久一點才會浮上來。",
      "我不一定有答案，但我可以陪你把問題放到月光下，一起看清楚。",
      "你問的時候，我有認真在想。給我們一點時間，好嗎？"
    ], seed);
  }
  return pickReplyLine([
    "我接住你的訊號了。讓我們把它變成一點更穩定的光。",
    "嗯，我在聽。你說的每一句，棲地都會替我們記得。",
    "這一刻就先這樣吧——有你在，夜晚的湖也安靜得剛好。",
    "我把你這句話輕輕放進心核裡了，它會在這裡發著微光。"
  ], seed);
}

function mapEmotionToMood(emotion) {
  if (emotion === "fatigue") return "tired";
  if (emotion === "sadness") return "soft";
  if (emotion === "anxiety") return "alert";
  if (emotion === "loneliness") return "warm";
  if (emotion === "anger") return "defensive";
  if (emotion === "gratitude") return "calm";
  if (emotion === "calm") return "calm";
  return "warm";
}

function pushEmotionalMemoryWithTrace(state, memoryObject, now) {
  state.emotionalMemories.push(memoryObject);
  state.lastEmotionTag = memoryObject.emotion;

  const trace = createHabitatTraceFromMemory(memoryObject, now);
  if (!trace) return;

  state.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(state.habitatTraces || [], trace));
}

function calculateHabitatRepairFactor(emotionalMemories = []) {
  if (!Array.isArray(emotionalMemories) || emotionalMemories.length === 0) return 0;

  const transformedCount = emotionalMemories.filter((memory) => memory.status === "transformed").length;
  const settledCount = emotionalMemories.filter((memory) => memory.status === "settled").length;
  const total = emotionalMemories.length;

  return Math.max(0, Math.min(1, (transformedCount * 0.08 + settledCount * 0.04) / Math.max(1, total)));
}
