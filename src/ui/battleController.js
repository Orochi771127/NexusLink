import { qs } from "../utils/dom.js";
import { getCompanionById } from "../data/companionRegistry.js";
import { getExplorationNodeById } from "../data/explorationNodes.js";
import {
  applyEnemyTurn,
  applyPlayerSkill,
  canUseSkill,
  createBattleSession,
  getResonanceSkillName,
  isBattleOver,
  summarizeBattleOutcome
} from "../engine/battleEngine.js";

const ENEMY_TURN_DELAY_MS = 620;

export function createBattleController({ store, panelManager, soulTalkController, saveCurrentState, statusText }) {
  const nodeLabelEl = qs("#battle-node-label");
  const enemyNameEl = qs("#battle-enemy-name");
  const enemyHpTextEl = qs("#battle-enemy-hp-text");
  const enemyHpFillEl = qs("#battle-enemy-hp");
  const playerNameEl = qs("#battle-player-name");
  const playerHpTextEl = qs("#battle-player-hp-text");
  const playerHpFillEl = qs("#battle-player-hp");
  const playerEnergyEl = qs("#battle-player-energy");
  const logEl = qs("#battle-log");
  const skillButtons = {
    basic_attack: qs("#battle-skill-basic"),
    guard: qs("#battle-skill-guard"),
    resonance: qs("#battle-skill-resonance")
  };
  const retreatButton = qs("#battle-retreat");
  const finishButton = qs("#battle-finish");

  let session = null;
  let enemyTurnTimer = null;
  let removeCloseGuard = null;
  let renderedLogCount = 0;

  function bind() {
    Object.entries(skillButtons).forEach(([skillId, button]) => {
      button?.addEventListener("click", () => handlePlayerSkill(skillId));
    });
    retreatButton?.addEventListener("click", () => endBattle("retreat"));
    finishButton?.addEventListener("click", () => {
      panelManager.closePanel({ force: true });
    });
  }

  function startBattle({ enemyId, nodeId }) {
    const state = store.getState();
    const companion = getCompanionById(state.activeCompanionId);
    session = createBattleSession({ companion, enemyId, nodeId, state });
    renderedLogCount = 0;
    if (logEl) logEl.innerHTML = "";

    const node = getExplorationNodeById(nodeId);
    if (nodeLabelEl) nodeLabelEl.textContent = node ? `${node.label.zh} ・ 遭遇` : "遭遇";
    if (playerNameEl) playerNameEl.textContent = session.companionName;
    if (enemyNameEl) enemyNameEl.textContent = session.enemyName;
    if (skillButtons.resonance) {
      skillButtons.resonance.textContent = getResonanceSkillName(session.emblem);
    }
    if (finishButton) finishButton.hidden = true;
    if (retreatButton) retreatButton.hidden = false;

    removeCloseGuard?.();
    removeCloseGuard = panelManager.registerCloseGuard("battle", () => {
      // Escape／backdrop 不直接離開戰鬥：轉成撤退結算。
      if (session && session.turn !== "ended") {
        endBattle("retreat");
      }
      return true;
    });

    render();
    panelManager.openPanel("battle");
  }

  function handlePlayerSkill(skillId) {
    if (!session || session.turn !== "player") return;
    if (!canUseSkill(session, skillId)) return;

    session = applyPlayerSkill(session, skillId);
    render();

    const verdict = isBattleOver(session);
    if (verdict.over) {
      endBattle(verdict.result);
      return;
    }

    window.clearTimeout(enemyTurnTimer);
    enemyTurnTimer = window.setTimeout(() => {
      if (!session || session.turn !== "enemy") return;
      session = applyEnemyTurn(session);
      render();
      const enemyVerdict = isBattleOver(session);
      if (enemyVerdict.over) {
        endBattle(enemyVerdict.result);
      }
    }, ENEMY_TURN_DELAY_MS);
  }

  function endBattle(result) {
    if (!session) return;
    window.clearTimeout(enemyTurnTimer);
    session = { ...session, turn: "ended", log: [...session.log] };

    const outcome = summarizeBattleOutcome(result, store.getState());
    session.log.push({ kind: "system", text: outcome.message });
    render();

    store.setState(outcome.statePatch);
    saveCurrentState?.();
    soulTalkController.addChat("system", outcome.message);
    soulTalkController.renderChat();
    if (statusText) statusText.textContent = outcome.message.split("\n")[0];

    removeCloseGuard?.();
    removeCloseGuard = null;
    if (finishButton) finishButton.hidden = false;
    if (retreatButton) retreatButton.hidden = true;
  }

  function render() {
    if (!session) return;

    if (playerHpTextEl) playerHpTextEl.textContent = `${session.playerHp} / ${session.playerMaxHp}`;
    if (enemyHpTextEl) enemyHpTextEl.textContent = `${session.enemyHp} / ${session.enemyMaxHp}`;
    if (playerHpFillEl) playerHpFillEl.style.width = `${Math.round((session.playerHp / session.playerMaxHp) * 100)}%`;
    if (enemyHpFillEl) enemyHpFillEl.style.width = `${Math.round((session.enemyHp / session.enemyMaxHp) * 100)}%`;
    if (playerEnergyEl) playerEnergyEl.textContent = "●".repeat(session.playerEnergy) + "○".repeat(Math.max(0, 5 - session.playerEnergy));

    if (logEl) {
      for (let index = renderedLogCount; index < session.log.length; index += 1) {
        const entry = session.log[index];
        const line = document.createElement("p");
        line.className = entry.kind === "enemy" ? "battle-log-enemy" : entry.kind === "system" ? "battle-log-system" : "battle-log-player";
        line.textContent = entry.text;
        logEl.appendChild(line);
      }
      renderedLogCount = session.log.length;
      while (logEl.childNodes.length > 14) logEl.removeChild(logEl.firstChild);
      logEl.scrollTop = logEl.scrollHeight;
    }

    const isPlayerTurn = session.turn === "player";
    Object.entries(skillButtons).forEach(([skillId, button]) => {
      if (!button) return;
      button.disabled = !isPlayerTurn || !canUseSkill(session, skillId);
    });
    if (retreatButton) retreatButton.disabled = session.turn === "ended";
  }

  return { bind, startBattle };
}
