import { qs } from "../utils/dom.js";
import { clampPercent } from "../utils/clamp.js";

const DEFAULT_STATUS_TEXT = "心語 / 靈魂聖域";

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
    modalCreatureDescription.textContent = creature.description || "心核夥伴資料尚未完成。";
    messageInput.placeholder = `對 ${creature.name} 輕聲說些什麼...`;
  }

  function renderHUD() {
    const state = store.getState();
    if (!currentCreature) return;

    bondEl.textContent = state.bond;
    trustEl.textContent = state.trust;
    moodEl.textContent = getMoodLabel(state.mood);
    energyEl.textContent = state.energy;
    foxName.textContent = currentCreature.name;
    if (!statusText.textContent || statusText.textContent === DEFAULT_STATUS_TEXT || statusText.textContent === "心語") {
      statusText.textContent = `${currentCreature.name} 正在第一棲地安靜待命。`;
    }

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

function getMoodLabel(mood) {
  const moodMap = {
    defensive: "防備",
    tired: "疲倦",
    calm: "平靜",
    warm: "溫暖",
    happy: "開心",
    distant: "疏離",
    sad: "低落",
    angry: "生氣",
    sleeping: "睡眠"
  };
  return moodMap[mood] || "平衡";
}

function moodPercent(mood) {
  const moodMap = {
    defensive: 24,
    tired: 38,
    calm: 62,
    warm: 82,
    happy: 90,
    distant: 36
  };
  return moodMap[mood] || 50;
}
