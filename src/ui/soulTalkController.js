import { runRaphaelCore, applyRaphaelCoreResult } from "../ai/raphaelCore.js";
import { createRaphaelAgentIntent } from "../ai/raphaelAgentAdapter.js";
import { maybeTriggerFirstAwakening } from "../ai/awakening/firstAwakeningRuntime.js";
import { isRaphaelAwakened } from "../ai/awakening/raphaelAwakeningGate.js";
import { updateMemoryLifecycles } from "../engine/memoryLifecycleEngine.js";
import { isEmotionalHabitatTrace } from "../engine/habitatTraceEngine.js";
import { applyRaphaelAgentReduction, reduceRaphaelAgentIntent } from "../engine/raphaelIntentReducer.js";
import { buildEventReflection, composeMemoryReflection } from "../engine/soulTalkComposer.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { loadPreferenceStore, replacePreferenceStore } from "../ai/companionPreferenceStore.js";
import { appendTranscriptTurn } from "../ai/dialogue/soulTalkTranscriptJournal.js";
import { createSoulTalkShadowObserver } from "../ai/runtime/soulTalkShadowObserver.js";
import { qs, restoreViewportAfterKeyboard } from "../utils/dom.js";
import AudioManager from "../audio/audioManager.js";

const DEFAULT_STATUS_TEXT = "心湖 / 安靜待命";
const DEFAULT_PREVIEW_TEXT = "你可以慢慢說，牠會聽。";
const FIRST_TRACE_SYSTEM_TEXT = "月湖留下了第一道很淡的光。這不是獎勵，是牠記得你說過的事。";
const FIRST_TRACE_STATUS_TEXT = "第一道痕跡已安靜留在月湖。";
const NON_REWARDING_MODES = new Set(["safety_redirect", "withdraw", "reject"]);
const SAFETY_TERMINAL_MUTABLE_FIELDS = new Set([
  "safeHarborMode",
  "chatHistory"
]);
// 痕跡回響（First-Session 支柱三）：第一道痕跡有專屬提示（FIRST_TRACE_SYSTEM_TEXT），
// 但之後每次有意義的傾訴讓新痕跡亮起時原本「完全沒有回饋」——迴圈缺少「有回報感」。
// 這組輪播句讓每一輪都「看得見牠記住了」。語氣守則：是「記得」的觀察，不是獎勵、不是稱讚、
// 無數值、無 FOMO（對齊 CLAUDE.md §2 紅線 6/7）。敘事層維持中文（同 first-trace 設計）。
const TRACE_ECHO_LINES = Object.freeze([
  "湖邊又亮起一點微光——牠把這一刻，也收下了。",
  "你剛說的話，化成一點光，落在了月湖上。",
  "牠沒多說什麼，但湖面記得你此刻的心情。",
  "又一道很淡的光留在了岸邊，是你們一起攢的。"
]);

export function createSoulTalkController({
  store,
  saveCurrentState,
  saveCriticalState = saveCurrentState,
  shadowObserver = createSoulTalkShadowObserver()
}) {
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
  let shadowStateVersion = 0;
  // 玩家剛送出的訊息文字：renderChat 據此把該行錨定在可視區頂端（見 scrollChatLog）。
  let scrollAnchorText = null;
  // 上次渲染的內容簽章：內容沒變就跳過重建，避免捲動位置被無關 state 變動重置。
  let lastRenderSig = null;
  // 痕跡回響輪播索引（支柱三）：讓「牠記住了」的句子不重複、每輪迴圈都有回報感。
  let traceEchoIndex = 0;
  function pickTraceEchoLine() {
    const line = TRACE_ECHO_LINES[traceEchoIndex % TRACE_ECHO_LINES.length];
    traceEchoIndex += 1;
    return line;
  }

  function setCreature(creature) {
    currentCreature = creature;
    if (soulDrawerCompanionName) {
      soulDrawerCompanionName.textContent = creature?.name || "夥伴";
    }
  }

  /** 以當前 state 校正夥伴，避免切換後仍用舊 creature 說話。 */
  function resolveActiveCompanion(state = store.getState()) {
    const fromState = getCompanionById(state?.activeCompanionId);
    if (fromState && (!currentCreature || currentCreature.id !== fromState.id)) {
      setCreature(fromState);
    }
    return currentCreature || fromState || null;
  }

  function bind() {
    ensureWaveformShell();

    // pointerdown 階段不奪走輸入框焦點：st-focus 模式下若先 blur，drawer
    // 會在 click 前位移 180ms，按鈕從手指下方移走而造成靜默送出失敗。
    // click 完整落下後，觸控手機再主動離開輸入焦點進入回覆閱讀模式。
    sendButton.addEventListener("pointerdown", (event) => {
      event.preventDefault();
    });

    sendButton.addEventListener("click", () => {
      const value = messageInput.value.trim();
      if (!value) return;
      messageInput.value = "";
      handlePlayerMessage(value);
      if (
        document.activeElement === messageInput
        && window.matchMedia?.("(hover: none) and (pointer: coarse)")?.matches
      ) {
        messageInput.blur();
      }
    });

    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
      }
    });

    messageInput.addEventListener("focus", () => {
      setSoulTalkState("active");
      // 鍵盤模型 v6（見 dom.js / soul-talk-drawer.css）：不量測、不補償、版面不動，
      // 交給瀏覽器原生「自動彈窗」行為——iOS 把頁面上推露出輸入框，Android
      // resizes-content 直接縮排版。body.st-focus 只做「打字時的內容收納」
      // （面板降高、收次要區塊），讓原生上推後整個面板（含 header）都在可視區內。
      document.body.classList.add("st-focus");
      window.requestAnimationFrame(() => scrollChatLog());
      // drawer 高度有 180ms transition，rAF 落在轉場前、量到的是舊高度；
      // 轉場結束後補一次，確保鍵盤模式下捲動位置正確。
      window.setTimeout(() => scrollChatLog(), 240);
    });
    messageInput.addEventListener("input", () => {
      setSoulTalkState(messageInput.value.trim() ? "active" : "idle");
    });
    messageInput.addEventListener("blur", () => {
      setSoulTalkState("idle");
      document.body.classList.remove("st-focus");
      // iOS 26 回歸：鍵盤收起後頁面可能停在被上推的位置（下半屏黑塊）。
      // 延遲檢查點把捲動歸零；玩家若立刻聚焦別的輸入框會自動跳過（見 dom.js）。
      restoreViewportAfterKeyboard();
      // drawer 會用 180ms 從輸入模式回到閱讀高度；轉場後重新捲到底，
      // 讓剛完成的夥伴回覆保留在擴大的可視區內。
      window.setTimeout(() => scrollChatLog(), 240);
    });
  }

  function focusInput() {
    setSoulTalkState("active");
    messageInput.focus({ preventScroll: true });
  }

  function openSoulTalk(panelManager) {
    ensureWaveformShell();
    resolveActiveCompanion();
    setSoulTalkState("idle");
    maybeReflectCrossSessionEvent();
    scrollAnchorText = null; // 重新打開 drawer 一律回到最新訊息
    renderChat();
    panelManager.openPanel("soulTalk");
    // renderChat 可能在面板還隱藏（高度為 0）時執行過；面板可見後補一次捲動。
    window.requestAnimationFrame(() => scrollChatLog());
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
    const companion = resolveActiveCompanion();
    const companionName = companion?.name || "夥伴";
    // Capture the complete pre-turn relationship before adding the player chat
    // line. If Core classifies this as high-risk, every relationship field is
    // restored from here while chat + safety UI mode remain allowed.
    const stateBeforeMessage = cloneSerializable(store.getState());
    setSoulTalkState("thinking");
    setStatusText(`${companionName}正在聽，先把湖面放慢……`);
    scrollAnchorText = message;
    addChat("player", message, { preserveReactionPreview: true });

    let result;

    store.updateState((state) => {
      // 玩家訊息已先寫入 chatHistory；除此之外，高風險回合只允許安全 UI/mode
      // 與 canonical system reply。先封存完整 top-level state，避免 lifecycle 或
      // 未來新增的次級 writer 在 safety terminal 路徑留下任何 gameplay/memory delta。
      const moodBefore = state.mood;
      const now = Date.now();
      const idSuffix = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
      const traceCountBefore = countVisibleRelationshipTraces(state.habitatTraces);
      const activeCompanion = resolveActiveCompanion(state);

      // 偏好記憶以主 state 為唯一持久來源；Core 仍使用隔離的 session cache，
      // 回合結束再把 snapshot 放回同一份 save state，避免額外 localStorage key。
      replacePreferenceStore(state.companionPreferences);

      const lifecycleResult = updateMemoryLifecycles(state.emotionalMemories || [], now);
      state.emotionalMemories = lifecycleResult.updatedMemories;

      const coreResult = runRaphaelCore(message, state, {
        now,
        idSuffix,
        companion: activeCompanion,
        repeated: message === state.lastMessage,
        quickReply: options.quickReply || null
      });
      state.companionPreferences = loadPreferenceStore();

      let awakeningResult = null;
      if (!isRaphaelAwakened(state) && shouldAllowFirstAwakening(coreResult)) {
        awakeningResult = maybeTriggerFirstAwakening(state, {
          companion: activeCompanion,
          now,
          dispatchAnimation: true
        });
      } else if (!isRaphaelAwakened(state)) {
        awakeningResult = { applied: false, reason: "safety_or_boundary_deferred" };
      }

      const coreResultToApply = awakeningResult?.applied
        ? deferOrdinaryMemoryForFirstAwakeningTurn(coreResult)
        : coreResult;
      const applied = applyRaphaelCoreResult(state, coreResultToApply, { companion: activeCompanion, now });
      if (isSafetyCoreResult(coreResultToApply)) {
        restoreSafetyTerminalState(state, stateBeforeMessage);
        replacePreferenceStore(state.companionPreferences);
      }
      const traceCountAfter = countVisibleRelationshipTraces(state.habitatTraces);
      const firstTraceCreated = shouldAnnounceFirstTrace({
        traceCountBefore,
        traceCountAfter,
        coreResult: coreResultToApply,
        awakeningResult,
        state
      });

      let traceEchoed = false;
      if (firstTraceCreated) {
        appendChatLine(state, "system", FIRST_TRACE_SYSTEM_TEXT);
      } else if (shouldAcknowledgeTrace({ traceCountBefore, traceCountAfter, coreResult: coreResultToApply })) {
        // 第一道之後：每次新痕跡亮起也讓玩家「看得見牠記住了」，把迴圈的回報感補齊。
        appendChatLine(state, "system", pickTraceEchoLine());
        traceEchoed = true;
      }

      const agentIntent = createRaphaelAgentIntent({
        eventType: "soul_talk",
        coreResult: coreResultToApply,
        state,
        companion: activeCompanion,
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
        traceEchoed,
        deferredOrdinaryTrace: Boolean(awakeningResult?.applied)
      };
    });

    const safetyTurn = isSafetyCoreResult(result?.coreResult);
    // 本機 transcript：每回合記一筆問／答與學習桶（安全回合也記，但桶會標 safety_eval_only）。
    recordSoulTalkTranscript(message, result, companion);
    lastQuickReplies = safetyTurn ? [] : result?.coreResult?.quickReplies || [];
    if (safetyTurn || result?.firstTraceCreated) saveCriticalState();
    else saveCurrentState();
    shadowStateVersion += 1;
    if (!safetyTurn && typeof shadowObserver?.observe === "function") {
      const liveState = store.getState();
      try {
        const shadowRun = shadowObserver.observe({
          message,
          coreResult: result?.coreResult,
          state: projectShadowState(liveState),
          companion,
          stateVersion: shadowStateVersion
        });
        void Promise.resolve(shadowRun).catch(() => { /* Shadow failure must never alter the live Soul Talk turn. */ });
      } catch { /* An injected observer must remain non-authoritative and fail closed. */ }
    }
    renderQuickReplies(lastQuickReplies);
    renderChat();
    // store.subscribe may render the reply before the quick-reply row reaches
    // its final height. Re-anchor once more after both regions settle so short
    // mobile viewports measure the actual remaining conversation space.
    scrollAnchorText = message;
    scrollChatLog();
    // safety 回合連「送出／收到」提示音都不播，避免求助導引被包裝成遊戲回饋。
    if (!safetyTurn) {
      AudioManager.playSfx("soul_send");
      if (result?.firstTraceCreated || result?.traceEchoed) {
        AudioManager.playSfx("trace_bloom");
      } else {
        AudioManager.playSfx("soul_reply");
      }
    }
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
    thinkingTimer = window.setTimeout(() => {
      setSoulTalkState("idle");
      if (statusText?.textContent.startsWith(`${companionName}正在聽`)) {
        setStatusText();
      }
    }, 720);
    return result;
  }

  function cloneSerializable(value) {
    if (typeof structuredClone === "function") return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function projectShadowState(state = {}) {
    return Object.freeze({
      activeCompanionId: state.activeCompanionId || null,
      locationId: state.currentLocationId || state.locationId || "moonlake",
      bond: Number(state.bond) || 0,
      trust: Number(state.trust) || 0,
      defense: Number(state.defense) || 0,
      energy: Number(state.energy) || 0,
      mood: typeof state.mood === "string" ? state.mood : "calm"
    });
  }

  function recordSoulTalkTranscript(playerText, turnResult, companion) {
    try {
      const core = turnResult?.coreResult || {};
      const safety = core.safety || core.perception?.safety || {};
      const strategy = core.responseStrategy?.strategy || core.responseStrategy || null;
      appendTranscriptTurn({
        now: Number(core.now) || Date.now(),
        companionId: companion?.id || store.getState()?.activeCompanionId || null,
        playerText,
        replyText: core.reply || core.output?.reply || "",
        replyRole: core.replyRole || (safetyTurnRole(safety) ? "system" : "companion"),
        safety,
        topic: core.nlu?.topic || null,
        dialogueAct: core.nlu?.dialogueAct || null,
        responseStrategy: strategy,
        replySource: core.composeMeta?.replySource || null
      });
    } catch (error) {
      console.warn("[soulTalk] transcript journal append failed", error);
    }
  }

  function safetyTurnRole(safety = {}) {
    return safety?.isHighRisk === true || safety?.action === "safe_harbor";
  }

  function restoreSafetyTerminalState(state, snapshot) {
    for (const key of Object.keys(state)) {
      if (!SAFETY_TERMINAL_MUTABLE_FIELDS.has(key) && !Object.prototype.hasOwnProperty.call(snapshot, key)) {
        delete state[key];
      }
    }
    for (const [key, value] of Object.entries(snapshot)) {
      if (SAFETY_TERMINAL_MUTABLE_FIELDS.has(key)) continue;
      state[key] = cloneSerializable(value);
    }
  }

  function ensureWaveformShell() {
    if (waveformShell || !soulTalkModal) return;

    // V3 對齊：presence 不再是獨立卡片（面板內禁止 cards-inside-cards），
    // 併入 header 成單行狀態列：迷你聲紋 + status line。
    waveformShell = document.createElement("div");
    waveformShell.className = "soul-talk-waveform soul-presence";
    waveformShell.setAttribute("aria-label", "心湖聲紋狀態");
    waveformShell.innerHTML = `
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

    if (statusText) {
      statusText.textContent = statusText.textContent.trim() || DEFAULT_STATUS_TEXT;
      waveformShell.appendChild(statusText);
    }

    const heading = soulTalkModal.querySelector(".soul-drawer-heading");
    if (heading) heading.appendChild(waveformShell);
    else soulTalkModal.insertBefore(waveformShell, chatLog);
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

  function addChat(role, text, { preserveReactionPreview = false } = {}) {
    store.updateState((state) => {
      if (!preserveReactionPreview) state.reactionPreview = "";
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
      if (item.ariaLabel) button.setAttribute("aria-label", item.ariaLabel);
      button.addEventListener("click", () => handleQuickReply(item));
      quickReplyRow.appendChild(button);
    }
  }

  function renderChat() {
    const state = store.getState();
    const visibleHistory = state.chatHistory.slice(-12);
    const lastItem = state.chatHistory[state.chatHistory.length - 1];
    const companion = resolveActiveCompanion(state);
    const idlePreview = companion?.name
      ? `你可以慢慢說，${companion.name}會聽。`
      : DEFAULT_PREVIEW_TEXT;
    soulTalkPreview.textContent = state.reactionPreview || (lastItem ? lastItem.text : idlePreview);

    // 內容簽章：store.subscribe 每次 state 變動（含 heartbeat/存檔）都會呼叫 renderChat；
    // 內容沒變就不重建 DOM 也不動捲動位置，玩家往上翻歷史不會被跳回底部。
    const renderSig = `${companion?.name || ""}|${visibleHistory
      .map((item) => `${item.role} ${item.text}`)
      .join("\n")}`;
    if (renderSig === lastRenderSig) return;
    lastRenderSig = renderSig;

    chatLog.innerHTML = "";
    let prevKey = null;
    for (const item of visibleHistory) {
      const role = item.role === "fox" ? "companion" : item.role;
      const dedupeKey = `${role}\u0000${item.text}`;
      // 連續相同訊息不重複顯示（僅 companion/system；玩家的重複輸入必須照實顯示）
      if (role !== "player" && dedupeKey === prevKey) continue;
      prevKey = dedupeKey;
      const line = document.createElement("div");
      line.className = `chat-line ${role}`;
      if (role === "player") {
        line.textContent = `你：${item.text}`;
      } else if (role === "system") {
        line.textContent = `心湖：${item.text}`;
      } else {
        const name = companion?.name || "夥伴";
        line.textContent = `${name}：${item.text}`;
      }
      chatLog.appendChild(line);
    }
    scrollChatLog();
  }

  // 捲動策略：玩家剛送出的那句要「錨定在可視區頂端」，回覆在它下方陸續出現——
  // 打字中（st-focus）drawer 收到 46svh、可視只剩幾行時，盲捲到底會把玩家自己的話
  // 推出視野（私測回報：「我打出去的自我看不到內容，就只有他回覆」）。無錨點時維持捲到底。
  function scrollChatLog() {
    if (!chatLog) return;
    let anchorLine = null;
    if (scrollAnchorText) {
      const playerLines = chatLog.querySelectorAll(".chat-line.player");
      for (let index = playerLines.length - 1; index >= 0; index -= 1) {
        if (playerLines[index].textContent === `你：${scrollAnchorText}`) {
          anchorLine = playerLines[index];
          break;
        }
      }
    }
    if (anchorLine) {
      const maxScroll = Math.max(0, chatLog.scrollHeight - chatLog.clientHeight);
      const chatRect = chatLog.getBoundingClientRect();
      const offsetWithinLog = (line) =>
        line.getBoundingClientRect().top - chatRect.top + chatLog.scrollTop;
      const latestTurn = [anchorLine];
      let nextLine = anchorLine.nextElementSibling;
      while (nextLine && !nextLine.classList.contains("player")) {
        latestTurn.push(nextLine);
        nextLine = nextLine.nextElementSibling;
      }

      const firstResponse = latestTurn.find(
        (line) => line.classList.contains("companion") || line.classList.contains("system")
      );
      if (!firstResponse) {
        // The player line can render before the synchronous Core result arrives.
        // Keep the anchor live for the reply render instead of finalizing early.
        chatLog.scrollTop = maxScroll;
        return;
      }

      const inset = 6;
      const lastTurnLine = latestTurn[latestTurn.length - 1];
      const turnTop = offsetWithinLog(anchorLine);
      const turnBottom = offsetWithinLog(lastTurnLine) + lastTurnLine.getBoundingClientRect().height;
      const turnHeight = turnBottom - turnTop;
      const targetScroll =
        turnHeight <= Math.max(0, chatLog.clientHeight - inset * 2)
          ? turnBottom - chatLog.clientHeight + inset
          : offsetWithinLog(firstResponse) - inset;

      chatLog.scrollTop = Math.max(0, Math.min(targetScroll, maxScroll));
      scrollAnchorText = null;
      return;
    }
    chatLog.scrollTop = Math.max(0, chatLog.scrollHeight - chatLog.clientHeight);
  }

  function reflectOnMemory(memory) {
    if (!memory) return;
    const line = composeMemoryReflection({
      memory,
      companion: resolveActiveCompanion(),
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

function isSafetyCoreResult(coreResult = {}) {
  return (
    coreResult.plan?.mode === "safety_redirect" ||
    coreResult.safety?.isHighRisk === true ||
    coreResult.perception?.safety?.isHighRisk === true
  );
}

function countVisibleRelationshipTraces(traces = []) {
  if (!Array.isArray(traces)) return 0;
  // 首痕儀式句的計數基準排除「心核初醒」痕跡（type: core_awakening_glow）——
  // 否則首觸喚醒偷跑第 1 條，玩家第一句心語直接落到 echo 分支，
  // 「月湖留下了第一道很淡的光」永遠不出現（2026-07-10 新玩家檢測 #3）。
  // 「第一道光」語義＝第一道由**你的話**留下的痕跡；喚醒有自己的開場敘事。
  // 喚醒發生在「首句心語」的回合也安全：該回合普通痕跡被 defer，排除後 after 仍為 0。
  return traces.filter(
    (trace) => isEmotionalHabitatTrace(trace) && trace.type !== "core_awakening_glow"
  ).length;
}

function shouldAnnounceFirstTrace({ traceCountBefore, traceCountAfter, coreResult, awakeningResult, state }) {
  if (traceCountBefore !== 0 || traceCountAfter <= traceCountBefore) return false;
  if (hasRecentChatEntry(state, FIRST_TRACE_SYSTEM_TEXT)) return false;

  if (!shouldAllowFirstAwakening(coreResult)) return false;

  const memoryDecision = coreResult?.memoryDecision || {};
  const traceDecision = coreResult?.traceDecision || {};
  return Boolean(awakeningResult?.applied || memoryDecision.shouldWrite || traceDecision.shouldApplyTrace);
}

// 第一道之後的痕跡回響（支柱三）：只有「真的新增了一道可見痕跡」且非安全轉導/拒絕情境才回應。
function shouldAcknowledgeTrace({ traceCountBefore, traceCountAfter, coreResult }) {
  if (traceCountBefore <= 0) return false; // 第一道由 shouldAnnounceFirstTrace 專屬處理
  if (traceCountAfter <= traceCountBefore) return false; // 沒有新增可見痕跡就不回應
  return shouldAllowFirstAwakening(coreResult); // 安全轉導 / 非獎勵模式 / 高風險時不回應
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
  // 連續相同訊息去重「僅限 companion/system」：避免回歸問候/反思在多次進場累積出重複行。
  // 玩家重複說同一句是有效輸入（私測回報：第二次送出整句被吞掉、畫面毫無反應），不可去重。
  const last = state.chatHistory[state.chatHistory.length - 1];
  if (role !== "player" && last && last.role === role && last.text === text) return;
  state.chatHistory.push({ role, text });
  if (state.chatHistory.length > 24) {
    state.chatHistory.splice(0, state.chatHistory.length - 24);
  }
}
