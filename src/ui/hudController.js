import { qs } from "../utils/dom.js";
import { clampPercent } from "../utils/clamp.js";

export function createHudController({ store, statusText }) {
  const foxName = qs("#fox-name");
  const bondEl = qs("#bond-value");
  const trustEl = qs("#trust-value");
  const moodEl = qs("#mood-value");
  const energyEl = qs("#energy-value");
  const bondFill = qs("#bond-fill");
  const trustFill = qs("#trust-fill");
  const moodFill = qs("#mood-fill");
  const energyFill = qs("#energy-fill");
  const modalCreatureName = qs("#modal-creature-name");
  const modalCreatureDescription = qs("#modal-creature-description");
  const messageInput = qs("#message-input");
  let currentCreature = null;

  function setCreature(creature) {
    currentCreature = creature;
    foxName.textContent = creature.name;
    modalCreatureName.textContent = creature.name;
    modalCreatureDescription.textContent = creature.description || "心核同步中的陪伴型 AI 小怪獸。";
    messageInput.placeholder = `對${creature.name}說一句話...`;
  }

  function renderHUD() {
    const state = store.getState();
    if (!currentCreature) return;

    bondEl.textContent = state.bond;
    trustEl.textContent = state.trust;
    moodEl.textContent = state.mood;
    energyEl.textContent = state.energy;
    foxName.textContent = currentCreature.name;
    statusText.textContent = `${currentCreature.name}正在湖畔安靜呼吸。`;

    bondFill.style.width = `${clampPercent(state.bond, 24)}%`;
    trustFill.style.width = `${clampPercent(state.trust, 12)}%`;
    energyFill.style.width = `${clampPercent(state.energy, 10)}%`;
    moodFill.style.width = `${moodPercent(state.mood)}%`;
  }

  return {
    setCreature,
    renderHUD,
    openCharacterDetail(panelManager) {
      renderHUD();
      panelManager.openPanel("character");
    }
  };
}

function moodPercent(mood) {
  const moodMap = {
    defensive: 24,
    tired: 38,
    calm: 62,
    warm: 82
  };
  return moodMap[mood] || 50;
}
