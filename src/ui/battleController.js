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
    panelManager.openPanel("battle");
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
    render();

    // 結算回寫：patch + 對峙記憶/棲地痕跡（走既有沉積鏈）。
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
    });
    // 閉環：回棲地後，夥伴用自己的聲音記得這件事（companion 角色，非 system）。
    const reflection = buildEventReflection(store.getState(), now, { outcomeOverride: outcome });
    if (reflection) {
      soulTalkController.addChat("companion", reflection);
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
      if (prevNoise !== null && session.noise.current < prevNoise) flashOnce(noiseFillEl, "fx-soothe", 500);
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
