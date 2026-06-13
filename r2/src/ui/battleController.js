import { qs } from "../utils/dom.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";
import {
  applyNoiseTurn,
  applyPlayerAction,
  canUseAction,
  createStandoffSession,
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
  createHabitatTraceFromMemory,
  pruneHabitatTraces,
  upsertHabitatTrace
} from "../engine/habitatTraceEngine.js";

const NOISE_TURN_DELAY_MS = 620;

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

  let session = null;
  let noiseTurnTimer = null;
  let removeCloseGuard = null;
  let renderedLogCount = 0;

  function bind() {
    Object.entries(actionButtons).forEach(([actionId, button]) => {
      button?.addEventListener("click", () => handleAction(actionId));
    });
    finishButton?.addEventListener("click", () => {
      panelManager.closePanel({ force: true });
    });
  }

  function startBattle({ enemyId, nodeId }) {
    const state = store.getState();
    const companion = getCompanionById(state.activeCompanionId);
    session = createStandoffSession({ companion, enemyId, nodeId, state });
    renderedLogCount = 0;
    if (logEl) logEl.innerHTML = "";

    const node = getExplorationNodeById(nodeId);
    if (nodeLabelEl) nodeLabelEl.textContent = node ? `${node.label.zh} ・ 場域不安定` : "場域不安定";
    if (companionNameEl) companionNameEl.textContent = `${session.companionName}的心核`;
    if (noiseNameEl) noiseNameEl.textContent = `${session.enemyName}的雜訊`;
    const resonanceButton = actionButtons.resonance;
    if (resonanceButton) {
      resonanceButton.querySelector("strong").textContent = getResonanceSkillName(session.emblem);
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
      endStandoff("retreated");
      return;
    }

    if (!canUseAction(session, actionId)) return;

    session = applyPlayerAction(session, actionId);
    render();

    const verdict = settleStandoff(session);
    if (verdict.settled) {
      endStandoff(verdict.outcome);
      return;
    }

    window.clearTimeout(noiseTurnTimer);
    noiseTurnTimer = window.setTimeout(() => {
      if (!session || session.turn !== "noise") return;
      session = applyNoiseTurn(session);
      render();
      const noiseVerdict = settleStandoff(session);
      if (noiseVerdict.settled) {
        endStandoff(noiseVerdict.outcome);
      }
    }, NOISE_TURN_DELAY_MS);
  }

  function endStandoff(outcome) {
    if (!session) return;
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
  }

  return { bind, startBattle };
}
