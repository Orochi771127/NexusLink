import { qs, qsa } from "../utils/dom.js";
import { clampPercent } from "../utils/clamp.js";
import { getAmbientBodyCue } from "../engine/touchReactionEngine.js";
import { getBodyCueProfile } from "../engine/animationProfile.js";

const DEFAULT_STATUS_TEXT = "心語 / 靈魂聖域";

function toCssColor(numericColor, fallback = "#8a93a3") {
  if (typeof numericColor !== "number") return fallback;
  return `#${numericColor.toString(16).padStart(6, "0")}`;
}

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
  const boundaryStateEl = qs("#boundary-state");
  const boundaryPreviewEl = qs("#boundary-preview");
  const boundaryBodyCueEl = qs("#boundary-bodycue");
  let currentCreature = null;

  function setCreature(creature) {
    currentCreature = creature;
    foxName.textContent = creature.name;
    modalCreatureName.textContent = creature.name;
    modalCreatureDescription.textContent = creature.description || "心核夥伴資料尚未完成。";
    messageInput.placeholder = `對 ${creature.name} 輕聲說些什麼...`;
    renderAvatarPortraits(creature);
  }

  function renderAvatarPortraits(creature) {
    qsa(".avatar-orb-portrait").forEach((portrait) => {
      if (creature.id === "greyshade-cat") {
        portrait.style.backgroundImage = "";
        portrait.style.backgroundSize = "";
        portrait.style.backgroundPosition = "";
        portrait.style.transform = "";
        return;
      }
      if (creature.image) {
        portrait.style.backgroundImage = `url("${creature.image}")`;
        portrait.style.backgroundSize = "contain";
        portrait.style.backgroundPosition = "center 60%";
        portrait.style.transform = "scale(1)";
        return;
      }
      const accent = toCssColor(creature.placeholder?.accentColor);
      const body = toCssColor(creature.placeholder?.bodyColor, "#2a3350");
      portrait.style.backgroundImage = `radial-gradient(circle at 50% 42%, ${accent} 0 9px, ${body} 10px 16px, transparent 17px)`;
      portrait.style.backgroundSize = "100% 100%";
      portrait.style.backgroundPosition = "center";
      portrait.style.transform = "scale(1)";
    });
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

    if (boundaryStateEl && boundaryPreviewEl) {
      const boundary = getBoundaryView(state);
      boundaryStateEl.textContent = boundary.label;
      boundaryPreviewEl.textContent = boundary.preview;
    }
    if (boundaryBodyCueEl) {
      boundaryBodyCueEl.textContent = getBodyCueProfile(getAmbientBodyCue(state)).hint;
    }
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

const BOUNDARY_LEVELS = [
  { label: "安心", preview: "現在輕碰，牠大概會直接靠過來。" },
  { label: "平常", preview: "現在輕碰，牠應該會接受，也許帶點觀察。" },
  { label: "警戒", preview: "牠現在需要一點空間，輕碰可能會讓牠猶豫。" },
  { label: "防備", preview: "牠正把自己縮起來。先靜靜陪伴，比觸碰更好。" }
];

function getBoundaryView(state) {
  let level;
  if (state.defense <= 25) level = 0;
  else if (state.defense <= 50) level = 1;
  else if (state.defense <= 75) level = 2;
  else level = 3;

  if (state.touchFatigue >= 6 || state.safeHarborMode) {
    level = Math.min(3, level + 1);
  }

  return BOUNDARY_LEVELS[level];
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
