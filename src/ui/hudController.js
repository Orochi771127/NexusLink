import { qs, qsa } from "../utils/dom.js";
import { clampPercent } from "../utils/clamp.js";
import { t, getLanguage, LANGUAGE_CHANGED_EVENT } from "../i18n/i18n.js";
import EventBus from "../utils/eventBus.js";
import { getAmbientBodyCue } from "../engine/touchReactionEngine.js";
import { getBodyCueProfile } from "../engine/animationProfile.js";
import {
  getBondStagePresentation,
  getTrustStagePresentation
} from "./bondPresentation.js";

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
  const moodResonanceLabel = qs("#mood-resonance-label");
  const moodResonanceNote = qs("#mood-resonance-note");
  const statePill = qs(".level-pill");
  let currentCreature = null;

  // 語言切換時 HUD 動態文字（心情標籤/狀態臆牌）需就地重畫；applyLanguage 只掃 data-i18n 靜態節點。
  EventBus.on(LANGUAGE_CHANGED_EVENT, () => {
    if (currentCreature) renderHUD();
  });

  function setCreature(creature) {
    currentCreature = creature;
    foxName.textContent = creature.name;
    modalCreatureName.textContent = creature.name;
    modalCreatureDescription.textContent = creature.description || t("char.descFallback");
    messageInput.placeholder = t("hud.soulPlaceholderNamed").replace("{name}", creature.name);
    renderAvatarPortraits(creature);
  }

  function renderAvatarPortraits(creature) {
    qsa(".avatar-orb-portrait").forEach((portrait) => {
      if (creature.image) {
        portrait.style.backgroundImage = `url("${creature.image}")`;
        portrait.style.backgroundSize = "cover";
        portrait.style.backgroundPosition = "center";
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

    // 質性羈絆：HUD 顯示階段名，不顯示刷分數字；bar 仍反映引擎分數供氛圍感。
    const lang = getLanguage();
    const bondStage = getBondStagePresentation(state.bond, lang);
    const trustStage = getTrustStagePresentation(state.trust, lang);
    bondEl.textContent = bondStage.label;
    trustEl.textContent = trustStage.label;
    bondEl.title = bondStage.note || "";
    trustEl.title = trustStage.label;
    moodEl.textContent = getMoodLabel(state.mood);
    energyEl.textContent = formatHalfStep(state.energy);
    foxName.textContent = currentCreature.name;
    // V3 identity card 規則：不顯示等級/戰力；臆牌改為夥伴當下狀態訊號（心情標籤）。
    if (statePill) statePill.textContent = getMoodLabel(state.mood);
    if (!statusText.textContent || statusText.textContent === DEFAULT_STATUS_TEXT || statusText.textContent === "心語") {
      statusText.textContent = `${currentCreature.name} 正在第一棲地安靜待命。`;
    }

    bondFill.style.width = `${clampPercent(bondStage.barPercent, 100)}%`;
    trustFill.style.width = `${clampPercent(trustStage.barPercent, 100)}%`;
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
    if (moodResonanceLabel) moodResonanceLabel.textContent = getMoodLabel(state.mood);
    if (moodResonanceNote) moodResonanceNote.textContent = getMoodNote(state.mood);
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

function formatHalfStep(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "0";
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(1).replace(/\.0$/, "");
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

const HUD_MOOD_KEYS = new Set([
  "defensive", "tired", "calm", "warm", "happy", "distant", "sad", "angry", "sleeping"
]);

function getMoodLabel(mood) {
  if (HUD_MOOD_KEYS.has(mood)) return t(`hudMood.${mood}`);
  return t("hudMood.balanced");
}

// 心情共鳴：由既有 mood 推導一句尊重邊界的陪伴語（無診斷、無勒索、符合 V3 copy rules）。
function getMoodNote(mood) {
  const noteMap = {
    calm: "牠把距離留在自己覺得安心的地方。",
    warm: "牠願意靠近一點，但仍然是牠自己。",
    happy: "今天的光比較亮，牠的尾巴鬆了下來。",
    distant: "牠想要一點空間，這也沒關係。",
    defensive: "牠把自己收了起來，先安靜陪著就好。",
    tired: "牠有點累了，慢一點，對牠比較剛好。",
    sad: "牠今天比較沉，光也輕了一些。",
    angry: "牠的邊界正豎著，給牠一點時間。",
    sleeping: "牠睡著了，呼吸很輕。"
  };
  return noteMap[mood] || "牠在自己的節奏裡，安靜地待著。";
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
