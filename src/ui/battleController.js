import { qs } from "../utils/dom.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";
import {
  applyNoiseTurn,
  applyPlayerAction,
  canUseAction,
  createStandoffSession,
  getIntentTelegraph,
  getOutcomeCopy,
  getResonanceSkillName,
  settleStandoff,
  summarizeStandoffOutcome,
  MAX_FATIGUE,
  MAX_SYNC,
  SHARD_GOAL
} from "../engine/battleEngine.js";
import { buildEventReflection } from "../engine/soulTalkComposer.js";
import {
  CHAPTER_TRIAL_OUTCOMES,
  advanceChapterProgress,
  getChapterByNumber,
  getChapterForNode
} from "../data/chapterRegistry.js";
import { getChapterNarrative } from "../data/chapterNarrative.js";
import { t } from "../i18n/i18n.js";
import {
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";
import EventBus from "../utils/eventBus.js";
import AudioManager from "../audio/audioManager.js";

const NOISE_TURN_DELAY_MS = 620;
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";

// 結局 → 回棲地時的動畫意圖。對峙 modal 會遮住 canvas，所以「被看見的後果」
// 安排在玩家點「回到棲地」、modal 關閉的瞬間播放（夥伴完全可見）。
// retreated 不播特別動畫——尊重「離開」，讓夥伴安靜回到 mood idle。
const OUTCOME_RETURN_INTENT = Object.freeze({
  stabilized: "standoff.stabilized",
  recovered: "standoff.recovered",
  overwhelmed_but_safe: "standoff.overwhelmed"
});

// 玩家行動 → 即時動畫意圖（按下當下就播，視覺回饋）。
// 這些 cue 在 modal 內播放（夥伴部分可見），純視覺、不影響結算。
const ACTION_INTENT = Object.freeze({
  resonance: "standoff.resonance",
  barrier: "standoff.barrier",
  pulse: "standoff.pulse"
});

// 裂隙形體（對峙視覺 v1，零美術資產）：依裂隙心相配色的程序化情緒霧體。
// 敵人不是怪物，是「卡住的情緒」——所以形體是霧、光與雜訊，不是身體。
// hue/sat 進 CSS 變數；濃度（--rift-density）跟著 noise 比例走：雜訊越輕、霧越淡。
const RIFT_EMOTION_TINT = Object.freeze({
  sadness: { hue: 215, sat: "70%" },
  anger: { hue: 18, sat: "72%" },
  anxiety: { hue: 268, sat: "68%" },
  loneliness: { hue: 226, sat: "55%" },
  fatigue: { hue: 40, sat: "28%" },
  gratitude: { hue: 190, sat: "60%" }
});

/**
 * 心核對峙 controller。
 * 介面維持 createBattleController / startBattle，app.js 與 mapController wiring 不變。
 */
export function createBattleController({ store, panelManager, soulTalkController, saveCurrentState, statusText }) {
  const nodeLabelEl = qs("#battle-node-label");
  const noiseNameEl = qs("#standoff-noise-name");
  const noiseTextEl = qs("#standoff-noise-text");
  const noiseFillEl = qs("#standoff-noise-fill");
  const companionNameEl = qs("#standoff-companion-name");
  const stabilityTextEl = qs("#standoff-stability-text");
  const stabilityFillEl = qs("#standoff-stability-fill");
  const syncPipsEl = qs("#standoff-sync-pips");
  const fatiguePipsEl = qs("#standoff-fatigue-pips");
  const shardsEl = qs("#standoff-shards");
  const logEl = qs("#battle-log");
  const actionButtons = {
    resonance: qs("#standoff-act-resonance"),
    barrier: qs("#standoff-act-barrier"),
    pulse: qs("#standoff-act-pulse"),
    retreat: qs("#standoff-act-retreat")
  };
  const finishButton = qs("#battle-finish");
  const actionRowEl = qs("#standoff-action-row");
  let telegraphEl = null;
  let riftFigureEl = null;

  // 意圖預示（telegraph）：動態插到行動列上方（不動 index.html），玩家在選行動前先讀懂
  // 「裂隙下一拍要做什麼」。樣式由本檔一次性注入 <style>，避免動基底 styles.css。
  function ensureTelegraphElement() {
    if (telegraphEl || !actionRowEl) return telegraphEl;
    injectTelegraphStyles();
    telegraphEl = document.createElement("p");
    telegraphEl.className = "standoff-telegraph";
    telegraphEl.hidden = true;
    const label = document.createElement("b");
    label.className = "tel-label";
    const hint = document.createElement("span");
    hint.className = "tel-hint";
    telegraphEl.append(label, hint);
    actionRowEl.parentNode.insertBefore(telegraphEl, actionRowEl);
    return telegraphEl;
  }

  // 裂隙形體：動態插在對峙日誌上方（不動 index.html），樣式自注入。
  function ensureRiftFigure() {
    if (riftFigureEl || !logEl) return riftFigureEl;
    injectRiftFigureStyles();
    injectStandoffLayoutStyles();
    riftFigureEl = document.createElement("div");
    riftFigureEl.className = "rift-figure";
    riftFigureEl.setAttribute("aria-hidden", "true");
    // rf-shadow：暗暈底層——確保情緒霧在任何背景（白天藍天/夜景）都可讀。
    riftFigureEl.innerHTML =
      '<span class="rf-shadow"></span><span class="rf-mist"></span><span class="rf-core"></span><span class="rf-glitch"></span>';
    logEl.parentNode.insertBefore(riftFigureEl, logEl);
    return riftFigureEl;
  }

  function updateRiftFigure() {
    const el = ensureRiftFigure();
    if (!el || !session) return;
    const tint = RIFT_EMOTION_TINT[session.riftEmotion] || RIFT_EMOTION_TINT.gratitude;
    el.style.setProperty("--rift-hue", String(tint.hue));
    el.style.setProperty("--rift-sat", tint.sat);
    const density = Math.max(0.2, Math.min(1, session.noise.current / session.noise.max));
    el.style.setProperty("--rift-density", density.toFixed(2));
    el.dataset.phase = session.phase || "turbulent";
    const intent = session.turn === "player" ? session.nextIntent : null;
    el.dataset.intent = intent || "none";
    el.classList.toggle("is-charged", Boolean(session.charged));
  }

  function setRiftOutcome(outcome) {
    if (!riftFigureEl) return;
    riftFigureEl.classList.remove("rift-dissolve", "rift-recede", "rift-dim");
    if (outcome === "stabilized" || outcome === "recovered") {
      riftFigureEl.classList.add("rift-dissolve"); // 雜訊散開：不是被消滅，是被放輕。
    } else if (outcome === "retreated") {
      riftFigureEl.classList.add("rift-recede"); // 你們退開，它留在原地。
    } else {
      riftFigureEl.classList.add("rift-dim");
    }
  }

  let session = null;
  let noiseTurnTimer = null;
  let removeCloseGuard = null;
  let renderedLogCount = 0;
  let lastOutcome = null;
  // B4 juice：追蹤上一次的值，偵測變化播一次性視覺回饋。
  let prevNoise = null;
  let prevStability = null;
  let prevShards = null;

  // UI 不直接碰 Pixi：所有動畫回饋只透過 EventBus 發送 intent，由 app/Pixi bridge 接。
  function emitBattleAnimationIntent(intent, meta = {}) {
    if (!intent) return;
    EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
      intent,
      source: "battle-modal",
      interrupt: true,
      ...meta
    });
  }

  function bind() {
    Object.entries(actionButtons).forEach(([actionId, button]) => {
      button?.addEventListener("click", () => handleAction(actionId));
    });
    finishButton?.addEventListener("click", () => {
      // 回棲地：先發出「被看見的後果」動畫意圖，再關閉 modal。
      // lazy load + modal 淡出（180ms）的時間差，剛好讓動畫落在夥伴可見後播放。
      emitBattleAnimationIntent(OUTCOME_RETURN_INTENT[lastOutcome], { source: "standoff" });
      document.body.classList.remove("standoff-active");
      panelManager.closePanel({ force: true });
    });
  }

  function startBattle({ enemyId, nodeId }) {
    const state = store.getState();
    const companion = getCompanionById(state.activeCompanionId);
    session = createStandoffSession({ companion, enemyId, nodeId, state });
    renderedLogCount = 0;
    lastOutcome = null;
    prevNoise = null;
    prevStability = null;
    prevShards = null;
    if (logEl) logEl.innerHTML = "";
    if (riftFigureEl) riftFigureEl.classList.remove("rift-dissolve", "rift-recede", "rift-dim");

    const node = getExplorationNodeById(nodeId);
    // 節點名/敵名/心相標籤是內容層資料（維持繁中）；外框模板走 i18n key（{name} 佔位）。
    if (nodeLabelEl) {
      nodeLabelEl.textContent = node
        ? `${node.label.zh} ・ ${t("battle.nodeUnstable")}`
        : t("battle.nodeUnstable");
    }
    if (companionNameEl) {
      companionNameEl.textContent = t("battle.stabilityOwner").replace("{name}", session.companionName);
    }
    if (noiseNameEl) {
      const noiseLabel = t("battle.noiseOf").replace("{name}", session.enemyName);
      noiseNameEl.textContent = session.riftEmotionLabelZh
        ? `${noiseLabel}・${session.riftEmotionLabelZh}`
        : noiseLabel;
    }
    const resonanceButton = actionButtons.resonance;
    if (resonanceButton) {
      resonanceButton.querySelector("strong").textContent = getResonanceSkillName(session.emblem);
      // 裂隙心相：元素契合時，共鳴鈕亮起金光並換上提示（每次 startBattle 重設）。
      const isAttuned = session.affinityTier === "attuned";
      resonanceButton.classList.toggle("is-attuned", isAttuned);
      const resonanceHint = resonanceButton.querySelector("em");
      if (resonanceHint) {
        resonanceHint.textContent = isAttuned
          ? t("battle.resonanceHintEmotion").replace("{emotion}", session.riftEmotionLabelZh)
          : t("battle.resonanceHintDefault");
      }
    }
    if (finishButton) finishButton.hidden = true;

    removeCloseGuard?.();
    removeCloseGuard = panelManager.registerCloseGuard("battle", () => {
      // Escape／backdrop 不會無聲離開：轉成「先撤退」結算（被尊重的離開）。
      if (session && session.turn !== "ended") {
        endStandoff("retreated");
      }
      return true;
    });

    render();
    // 對峙是全神貫注的時刻：藏起 bottom-nav，把底部舞台讓給夥伴（finish 時恢復）。
    document.body.classList.add("standoff-active");
    panelManager.openPanel("battle");
    // 環繞式佈局後夥伴在對峙中可見：進場先給一個警戒面對的姿態（idle_defensive）。
    emitBattleAnimationIntent("soul.defensive", { reason: "standoff-engage" });
  }

  function handleAction(actionId) {
    if (!session || session.turn !== "player") return;

    if (actionId === "retreat") {
      // 撤退不是失敗：下行柔音 + 回身 cue，再走「被尊重的離開」結算。
      AudioManager.playSfx("standoff_retreat");
      emitBattleAnimationIntent("standoff.retreat");
      endStandoff("retreated");
      return;
    }

    if (!canUseAction(session, actionId)) return;

    AudioManager.playSfx("standoff_action");
    session = applyPlayerAction(session, actionId);
    render();
    // 即時 cue：行動已照原流程成立後才發；能播就播，不能播也不阻斷 gameplay。
    emitBattleAnimationIntent(ACTION_INTENT[actionId]);

    const verdict = settleStandoff(session);
    if (verdict.settled) {
      endStandoff(verdict.outcome);
      return;
    }

    window.clearTimeout(noiseTurnTimer);
    noiseTurnTimer = window.setTimeout(() => {
      if (!session || session.turn !== "noise") return;
      const stabilityBefore = session.stability.current;
      session = applyNoiseTurn(session);
      render();
      // 只有雜訊真的造成 stability 下降才播 hit（暫歇/lull 不播）→ 一回合最多一次，不 spam。
      if (session.stability.current < stabilityBefore) {
        emitBattleAnimationIntent("battle.hit", { reason: "noise-pressure" });
      }
      const noiseVerdict = settleStandoff(session);
      if (noiseVerdict.settled) {
        endStandoff(noiseVerdict.outcome);
      }
    }, NOISE_TURN_DELAY_MS);
  }

  function endStandoff(outcome) {
    if (!session) return;
    lastOutcome = outcome;
    window.clearTimeout(noiseTurnTimer);
    session = { ...session, turn: "ended", log: [...session.log] };

    const now = Date.now();
    const summary = summarizeStandoffOutcome(outcome, session, store.getState(), now);
    const copy = getOutcomeCopy(outcome);
    session.log.push({ kind: "system", text: `【${copy.title}】${summary.message}` });

    // CH-5a 章節試煉：當前章首次「穩住/回收」即通關推進（規則見 chapterRegistry，Owner 可改）。
    // 防刷：對峙節點必須屬於當前章（否則第一章節點可原地刷穿七章）；
    // 重打已通關章不重複推進；overwhelmed/retreated 不算失敗、無任何懲罰。
    let chapterAdvance = null;
    if (CHAPTER_TRIAL_OUTCOMES.has(outcome)) {
      const progressBefore = store.getState().chapterProgress || { current: 1, completed: [] };
      const nodeChapter = getChapterForNode(session.nodeId);
      if (nodeChapter === progressBefore.current && !progressBefore.completed.includes(progressBefore.current)) {
        chapterAdvance = {
          from: getChapterByNumber(progressBefore.current),
          to: getChapterByNumber(Math.min(progressBefore.current + 1, 7))
        };
      }
    }
    if (chapterAdvance?.from) {
      // 安靜的通關敘事：一句話、無成就框、無獎勵數字（紅線 6）。
      session.log.push({ kind: "system", text: buildChapterAdvanceLine(chapterAdvance) });
    }
    render();
    setRiftOutcome(outcome);

    // 結算回寫：patch + 對峙記憶/棲地痕跡（走既有沉積鏈）+ 章節推進。
    store.updateState((draft) => {
      Object.assign(draft, summary.statePatch);
      if (summary.memorySeed) {
        draft.emotionalMemories.push(summary.memorySeed);
        draft.lastEmotionTag = summary.memorySeed.emotion;
        const trace = createHabitatTraceFromMemory(summary.memorySeed, now);
        if (trace) {
          draft.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(draft.habitatTraces || [], trace));
        }
      }
      if (chapterAdvance?.from) {
        draft.chapterProgress = advanceChapterProgress(draft.chapterProgress, chapterAdvance.from.chapter);
      }
    });
    // 閉環：回棲地後，夥伴用自己的聲音記得這件事（companion 角色，非 system）。
    const reflection = buildEventReflection(store.getState(), now, { outcomeOverride: outcome });
    if (reflection) {
      soulTalkController.addChat("companion", reflection);
    }
    if (chapterAdvance?.from) {
      // 章節通關也留在心語裡（夥伴之聲，同 reflection 慣例）。
      soulTalkController.addChat("companion", buildChapterAdvanceCompanionLine(chapterAdvance));
    }
    soulTalkController.renderChat();
    saveCurrentState?.(); // patch + 記憶 + 引用台詞一次落盤
    if (statusText) statusText.textContent = copy.title;

    removeCloseGuard?.();
    removeCloseGuard = null;
    if (finishButton) finishButton.hidden = false;
  }

  function render() {
    if (!session) return;

    if (noiseTextEl) noiseTextEl.textContent = `${session.noise.current} / ${session.noise.max}`;
    if (stabilityTextEl) stabilityTextEl.textContent = `${session.stability.current} / ${session.stability.max}`;
    if (noiseFillEl) noiseFillEl.style.width = `${Math.round((session.noise.current / session.noise.max) * 100)}%`;
    if (stabilityFillEl) stabilityFillEl.style.width = `${Math.round((session.stability.current / session.stability.max) * 100)}%`;
    if (syncPipsEl) syncPipsEl.textContent = "●".repeat(session.sync) + "○".repeat(Math.max(0, MAX_SYNC - session.sync));
    if (fatiguePipsEl) {
      fatiguePipsEl.textContent = "●".repeat(session.fatigue) + "○".repeat(Math.max(0, MAX_FATIGUE - session.fatigue));
      fatiguePipsEl.classList.toggle("is-strained", session.fatigue >= MAX_FATIGUE - 1);
    }
    if (shardsEl) {
      shardsEl.textContent = `◈ ${session.shards}/${SHARD_GOAL}`;
      shardsEl.classList.toggle("is-glowing", session.shards >= SHARD_GOAL - 1);
    }

    // B4 juice：雜訊放輕→柔光一閃；心核被撞→晃動（重擊更晃）；回收微光→晶光爆閃。
    if (!prefersBattleReducedMotion()) {
      if (prevNoise !== null && session.noise.current < prevNoise) {
        flashOnce(noiseFillEl, "fx-soothe", 500);
        flashOnce(riftFigureEl, "rift-hit", 460); // 形體同步收縮一拍：被放輕了。
      }
      if (prevStability !== null && session.stability.current < prevStability) {
        const drop = prevStability - session.stability.current;
        flashOnce(stabilityFillEl, drop >= 6 ? "fx-shake-strong" : "fx-shake", drop >= 6 ? 380 : 260);
      }
      if (prevShards !== null && session.shards > prevShards) flashOnce(shardsEl, "fx-burst", 700);
    }
    prevNoise = session.noise.current;
    prevStability = session.stability.current;
    prevShards = session.shards;

    if (logEl) {
      for (let index = renderedLogCount; index < session.log.length; index += 1) {
        const entry = session.log[index];
        const line = document.createElement("p");
        line.className =
          entry.kind === "noise" ? "battle-log-enemy" : entry.kind === "system" ? "battle-log-system" : "battle-log-player";
        line.textContent = entry.text;
        logEl.appendChild(line);
      }
      renderedLogCount = session.log.length;
      while (logEl.childNodes.length > 14) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight;
    }

    const isPlayerTurn = session.turn === "player";
    Object.entries(actionButtons).forEach(([actionId, button]) => {
      if (!button) return;
      if (actionId === "retreat") {
        button.disabled = session.turn === "ended";
        return;
      }
      button.disabled = !isPlayerTurn || !canUseAction(session, actionId);
    });

    updateRiftFigure();

    // 意圖預示：只在玩家回合顯示（讓玩家據此選穩住/設界/脈衝）；雜訊回合與結束時隱藏。
    ensureTelegraphElement();
    if (telegraphEl) {
      const tel = getIntentTelegraph(session);
      if (tel && isPlayerTurn) {
        telegraphEl.hidden = false;
        telegraphEl.dataset.tone = tel.tone;
        telegraphEl.querySelector(".tel-label").textContent = `下一拍・${tel.label}`;
        telegraphEl.querySelector(".tel-hint").textContent = tel.hint;
      } else {
        telegraphEl.hidden = true;
      }
    }
  }

  return { bind, startBattle };
}

function injectTelegraphStyles() {
  if (document.getElementById("standoff-telegraph-styles")) return;
  const style = document.createElement("style");
  style.id = "standoff-telegraph-styles";
  style.textContent = [
    ".standoff-telegraph{margin:4px 0 8px;padding:7px 12px;border-radius:12px;border:1px solid rgba(138,217,255,.2);background:rgba(10,16,32,.5);display:flex;flex-direction:column;gap:2px;font-size:12.5px;line-height:1.4}",
    ".standoff-telegraph[hidden]{display:none}",
    ".standoff-telegraph .tel-label{color:#dff3ff;font-weight:700;letter-spacing:.02em}",
    ".standoff-telegraph .tel-hint{color:rgba(200,222,245,.82)}",
    '.standoff-telegraph[data-tone="warn"]{border-color:rgba(255,209,102,.4)}',
    '.standoff-telegraph[data-tone="warn"] .tel-label{color:#ffe08a}',
    '.standoff-telegraph[data-tone="danger"]{border-color:rgba(255,150,150,.45);box-shadow:0 0 16px rgba(255,120,120,.16)}',
    '.standoff-telegraph[data-tone="danger"] .tel-label{color:#ff9a9a}',
    '.standoff-telegraph[data-tone="calm"]{border-color:rgba(138,217,255,.3)}',
    "@keyframes fx-soothe{0%{filter:brightness(1)}50%{filter:brightness(1.7)}100%{filter:brightness(1)}}",
    ".standoff-fill.fx-soothe{animation:fx-soothe 500ms ease-out}",
    "@keyframes fx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}",
    ".standoff-fill.fx-shake{animation:fx-shake 260ms ease-in-out}",
    "@keyframes fx-shake-strong{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(3px)}60%{transform:translateX(-3px)}80%{transform:translateX(2px)}}",
    ".standoff-fill.fx-shake-strong{animation:fx-shake-strong 380ms ease-in-out}",
    "@keyframes fx-burst{0%{transform:scale(1)}40%{transform:scale(1.35);filter:brightness(1.8)}100%{transform:scale(1)}}",
    "#standoff-shards.fx-burst{display:inline-block;animation:fx-burst 700ms ease-out}"
  ].join("");
  document.head.appendChild(style);
}

// 裂隙形體樣式：三層（外霧/內核/雜訊紋）＋ 相位節奏 ＋ 意圖姿態 ＋ 結局動畫。
// 顏色全部由 --rift-hue/--rift-sat 驅動；濃度由 --rift-density（noise 比例）驅動。
function injectRiftFigureStyles() {
  if (document.getElementById("rift-figure-styles")) return;
  const style = document.createElement("style");
  style.id = "rift-figure-styles";
  style.textContent = [
    ".rift-figure{position:relative;width:min(72%,280px);height:88px;margin:2px auto 6px;pointer-events:none;--rf-speed:3.2s}",
    ".rift-figure .rf-shadow,.rift-figure .rf-mist,.rift-figure .rf-core,.rift-figure .rf-glitch{position:absolute;inset:0}",
    // 暗暈底層：讓情緒霧在白天藍天上也讀得出形體（夜景時只是多一點深度）。
    ".rift-figure .rf-shadow{background:radial-gradient(56% 52% at 50% 52%,rgba(4,8,18,calc(.42*var(--rift-density))),transparent 74%);filter:blur(12px)}",
    ".rift-figure .rf-mist{background:radial-gradient(52% 48% at 50% 52%,hsla(var(--rift-hue),var(--rift-sat),62%,calc(.36*var(--rift-density))),transparent 72%);filter:blur(10px);animation:rfBreath var(--rf-speed) ease-in-out infinite}",
    ".rift-figure .rf-core{background:radial-gradient(26% 24% at 50% 50%,hsla(var(--rift-hue),var(--rift-sat),78%,calc(.55*var(--rift-density))),transparent 66%);filter:blur(3px);animation:rfBreath var(--rf-speed) ease-in-out infinite reverse}",
    ".rift-figure .rf-glitch{background:repeating-linear-gradient(0deg,transparent 0 3px,hsla(var(--rift-hue),var(--rift-sat),72%,calc(.13*var(--rift-density))) 3px 4px);mix-blend-mode:screen;opacity:.55;animation:rfGlitch 2.4s steps(7) infinite}",
    "@keyframes rfBreath{0%,100%{transform:scale(.96);opacity:.8}50%{transform:scale(1.05);opacity:1}}",
    "@keyframes rfGlitch{0%,100%{transform:translateY(0)}30%{transform:translateY(-2px)}60%{transform:translateY(1.5px)}}",
    // 相位節奏：翻湧快、拉鋸中、漸靜慢且轉柔。
    '.rift-figure[data-phase="turbulent"]{--rf-speed:2.2s}',
    '.rift-figure[data-phase="contested"]{--rf-speed:3.2s}',
    '.rift-figure[data-phase="settling"]{--rf-speed:5.2s;opacity:.82}',
    // 意圖姿態：蓄能=膨脹變亮；湧動=低頻顫；暫歇=放緩。
    '.rift-figure[data-intent="gather"] .rf-core{animation:rfGather 1.6s ease-in-out infinite}',
    "@keyframes rfGather{0%,100%{transform:scale(1)}50%{transform:scale(1.22);filter:blur(2px) brightness(1.35)}}",
    '.rift-figure[data-intent="surge"]{animation:rfTremble .5s ease-in-out infinite}',
    "@keyframes rfTremble{0%,100%{transform:translateX(0)}25%{transform:translateX(-1.5px)}75%{transform:translateX(1.5px)}}",
    '.rift-figure[data-intent="lull"]{--rf-speed:6s}',
    ".rift-figure.is-charged{filter:brightness(1.25) saturate(1.2)}",
    // 受擊（雜訊被放輕）：收縮一拍。
    "@keyframes rfHit{0%{transform:scale(1)}35%{transform:scale(.86);filter:brightness(1.4)}100%{transform:scale(1)}}",
    ".rift-figure.rift-hit{animation:rfHit 460ms ease-out}",
    // 結局：散開（被放輕，不是被消滅）／緩退（你們離開）／轉暗（撐住了）。
    "@keyframes rfDissolve{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.4);filter:blur(16px)}}",
    ".rift-figure.rift-dissolve{animation:rfDissolve 1.4s ease-out forwards}",
    "@keyframes rfRecede{0%{opacity:1}100%{opacity:.25;transform:scale(.9) translateY(-6px)}}",
    ".rift-figure.rift-recede{animation:rfRecede 1s ease-out forwards}",
    ".rift-figure.rift-dim{opacity:.35;transition:opacity .8s ease}",
    "@media (prefers-reduced-motion: reduce){.rift-figure,.rift-figure *{animation:none !important}}"
  ].join("");
  document.head.appendChild(style);
}

// 環繞式對峙佈局（Owner 參考圖方向，2026-07-06）：modal 透明化、夥伴現身場中。
// 狀態雙欄併一行、日誌壓縮半透明、backdrop 中段放淡——夥伴的戰鬥動畫
// （skill_cast/defend/attack_basic/hit/victory…既有映射）從此對玩家可見。
// 全部 override 自注入，不動 index.html / styles.css 基底。
function injectStandoffLayoutStyles() {
  if (document.getElementById("standoff-layout-styles")) return;
  const style = document.createElement("style");
  style.id = "standoff-layout-styles";
  style.textContent = [
    // modal 透明化 + 上下貼邊：中段讓出「舞台」給 canvas 上的夥伴。
    // 對峙期間 bottom-nav 隱藏（standoff-active），modal 直接貼到底部安全區。
    'html[data-ui="v2"] .battle-modal{background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;max-height:none;top:calc(var(--top-safe, 0px) + 8px);bottom:calc(var(--bottom-safe, 0px) + 10px);display:flex;flex-direction:column;gap:8px;overflow:hidden;padding:12px 14px}',
    'html[data-ui="v2"] body.standoff-active .bottom-nav--aurora{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    // 對峙全神貫注：夥伴名片與右上設定一併退場，避免與對峙標題疊字（finish 時恢復）。
    'html[data-ui="v2"] body.standoff-active .core-hud,html[data-ui="v2"] body.standoff-active .quick-hud{opacity:0;pointer-events:none;transition:opacity 260ms ease}',
    'html[data-ui="v2"] .battle-modal .panel-header{flex:0 0 auto;text-shadow:0 1px 6px rgba(0,0,0,.8)}',
    // 狀態併一行：雜訊 | 心核，各自保留半透明深底；hint 收起（開場日誌已說明）。
    'html[data-ui="v2"] .standoff-field{flex:0 0 auto;grid-template-columns:1fr 1fr;gap:8px}',
    'html[data-ui="v2"] .standoff-meter{padding:8px 10px;gap:5px;background:rgba(8,13,32,.66)}',
    'html[data-ui="v2"] .standoff-meter-hint{display:none}',
    'html[data-ui="v2"] .standoff-meter-head{font-size:12px;gap:6px}',
    'html[data-ui="v2"] .standoff-meter-head strong{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    'html[data-ui="v2"] .standoff-vitals-row{display:flex;flex-wrap:wrap;gap:4px 10px;font-size:10px}',
    // 形體＝夥伴面對的對象：略放大、置中段上方；其後以彈性空隙讓出舞台。
    'html[data-ui="v2"] .battle-modal .rift-figure{flex:0 0 auto;width:min(80%,300px);height:104px;margin:0 auto auto}',
    // 日誌壓縮半透明貼下；行動列縮緊——底部塊越矮，夥伴的舞台越大。
    'html[data-ui="v2"] .battle-modal #battle-log{flex:0 0 auto;margin-top:auto;max-height:56px;overflow-y:auto;padding:5px 10px;border-radius:12px;background:rgba(5,9,22,.42);font-size:12px;line-height:1.35}',
    'html[data-ui="v2"] .battle-modal .standoff-telegraph{flex:0 0 auto;margin:2px 0 4px;padding:5px 10px}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row{flex:0 0 auto}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button{padding-top:8px;padding-bottom:8px}',
    'html[data-ui="v2"] .battle-modal #standoff-action-row button em{font-size:9.5px;opacity:.85}',
    // backdrop：上深（狀態可讀）、中淡（夥伴可見）、下略深（行動列對比）。
    'html[data-ui="v2"] .panel-layer[data-active-panel="battle"] .panel-backdrop{background:linear-gradient(180deg,rgba(2,6,12,.5),rgba(2,6,12,.12) 42%,rgba(2,6,12,.12) 62%,rgba(2,6,12,.38))}'
  ].join("");
  document.head.appendChild(style);
}

// 章節通關敘事（CH-5a 骨架 → CH-7 專屬內容）：安靜一句，位置敘事而非成就——
// 「路亮了」不是「解鎖了」。優先取 chapterNarrative 的每章專屬句（對應該章情緒主題），
// 缺項時退回通用模板。內容層維持 TC。
function buildChapterAdvanceLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance.from?.chapter);
  if (narrative?.clearLine) return `【旅程】${narrative.clearLine}`;
  const fromZh = chapterAdvance.from?.zh || "這裡";
  const toZh = chapterAdvance.to?.zh || "";
  if (chapterAdvance.from?.chapter === 7) {
    return `【旅程】${fromZh}的雜訊，也安靜下來了。Linkara 的七片土地，你們一起走過了。`;
  }
  return `【旅程】${fromZh}一帶的雜訊，被你們一起放輕了。往${toZh}的方向，好像亮了一點。`;
}

function buildChapterAdvanceCompanionLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance.from?.chapter);
  if (narrative?.clearCompanionLine) return narrative.clearCompanionLine;
  if (chapterAdvance.from?.chapter === 7) {
    return "七片土地都走過了。接下來去哪，我們慢慢想，不急。";
  }
  const toZh = chapterAdvance.to?.zh || "下一片土地";
  return `這一帶安靜下來了。${toZh}那邊……等你想去的時候，我們再一起走。`;
}

function prefersBattleReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function flashOnce(el, className, ms = 500) {
  if (!el) return;
  el.classList.remove(className);
  void el.offsetWidth; // 重啟一次性動畫
  el.classList.add(className);
  window.setTimeout(() => el.classList.remove(className), ms);
}
