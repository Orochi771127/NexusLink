import { qs } from "../utils/dom.js";
import {
  COMPANIONS,
  ELEMENT_LABELS,
  RUNTIME_STATUS_LABELS,
  getCompanionById
} from "../data/companionRegistry.js";
import { getEvolutionLine } from "../data/evolutionLines.js";

// 雷達六軸（依 R2_CODEX_UI_REFERENCE：力量／防禦／速度／智慧／情感／治癒）。
const RADAR_AXES = [
  { key: "power", label: "力量" },
  { key: "defense", label: "防禦" },
  { key: "speed", label: "速度" },
  { key: "wisdom", label: "智慧" },
  { key: "emotion", label: "情感" },
  { key: "healing", label: "治癒" }
];

const ELEMENT_ACCENTS = {
  fire: "#ff6b3b",
  water: "#00b4ff",
  thunder: "#9b59ff",
  wood: "#2ecc71",
  star: "#f4d77d",
  neutral: "#c0d9ff"
};

export function createCodexController({ store, panelManager }) {
  const bodyEl = qs("#codex-body");

  function open() {
    renderList();
    panelManager.openPanel("codex");
  }

  function renderList() {
    if (!bodyEl) return;
    bodyEl.innerHTML = "";

    const list = document.createElement("div");
    list.className = "codex-list";

    COMPANIONS.forEach((companion) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "codex-row";
      const elementLabel = ELEMENT_LABELS[companion.element];
      row.innerHTML = `
        <span class="companion-card-badge element-${companion.element}" aria-hidden="true">${elementLabel?.zh || ""}</span>
        <span class="companion-card-main">
          <strong class="companion-card-name">${companion.displayName.zh}</strong>
          <em class="companion-card-name-en">${companion.displayName.en}</em>
        </span>
        <span class="codex-row-emblem">${companion.emotionalEmblem.zh}</span>
      `;
      row.addEventListener("click", () => renderDetail(companion.id));
      list.appendChild(row);
    });

    bodyEl.appendChild(list);
  }

  function renderDetail(companionId) {
    if (!bodyEl) return;
    const companion = getCompanionById(companionId);
    const state = store.getState();
    const wins = state.battleRecord?.wins || 0;
    const elementLabel = ELEMENT_LABELS[companion.element];
    const accent = ELEMENT_ACCENTS[companion.element] || ELEMENT_ACCENTS.neutral;

    bodyEl.innerHTML = "";

    const detail = document.createElement("div");
    detail.className = "codex-detail";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "ghost-button codex-back";
    backButton.textContent = "← 返回圖鑑";
    backButton.addEventListener("click", renderList);
    detail.appendChild(backButton);

    const titleBlock = document.createElement("div");
    titleBlock.className = "codex-title-block";
    titleBlock.innerHTML = `
      <h3>${companion.displayName.zh}</h3>
      <em>${companion.displayName.en} ・ ${elementLabel?.en || ""}</em>
    `;
    detail.appendChild(titleBlock);

    const tags = document.createElement("dl");
    tags.className = "codex-tag-grid";
    tags.innerHTML = [
      ["屬性 ELEMENT", `${elementLabel?.zh || ""} ${elementLabel?.en || ""}`],
      ["陣營 FACTION", `${companion.faction.zh} ・ ${companion.faction.en}`],
      ["情感徽章 EMBLEM", companion.emotionalEmblem.zh],
      ["戰鬥定位 ROLE", `${companion.battleRole.zh} ・ ${companion.battleRole.en}`],
      ["性情 TEMPERAMENT", companion.temperament.zh],
      ["棲地親和 HABITAT", companion.habitatAffinity.zh],
      ["素材狀態 RUNTIME", RUNTIME_STATUS_LABELS[companion.runtimeStatus] || companion.runtimeStatus]
    ].map(([label, value]) => `
      <div class="codex-tag">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `).join("");
    detail.appendChild(tags);

    const radarSection = document.createElement("section");
    radarSection.innerHTML = `<h4 class="codex-section-title">能力雷達 ・ Stats</h4>`;
    const radarWrap = document.createElement("div");
    radarWrap.className = "codex-radar-wrap";
    radarWrap.innerHTML = buildRadarSvg(companion.radar, accent);
    radarSection.appendChild(radarWrap);
    detail.appendChild(radarSection);

    const evolutionSection = document.createElement("section");
    evolutionSection.innerHTML = `<h4 class="codex-section-title">進化線 ・ Evolution Line</h4>`;
    evolutionSection.appendChild(buildEvolutionStrip(companion, wins));
    detail.appendChild(evolutionSection);

    const lore = document.createElement("p");
    lore.className = "codex-lore";
    lore.textContent = companion.description;
    detail.appendChild(lore);

    bodyEl.appendChild(detail);
  }

  function buildEvolutionStrip(companion, wins) {
    const strip = document.createElement("div");
    strip.className = "codex-evolution-strip";
    const line = getEvolutionLine(companion.evolutionLineId);

    if (!line) {
      strip.innerHTML = `<p class="codex-lore">演化資料整備中。</p>`;
      return strip;
    }

    line.stages.forEach((stage, index) => {
      const isUnlocked = wins >= (stage.unlockWins || 0);
      const chip = document.createElement("div");
      chip.className = `codex-stage-chip${isUnlocked ? "" : " is-locked"}`;
      chip.innerHTML = `
        <span class="codex-stage-index">${index + 1}</span>
        <span class="codex-stage-copy">
          <strong class="codex-stage-name">${isUnlocked ? stage.name.zh : "？？？"}</strong>
          <span class="codex-stage-label">${stage.stage.zh} ・ ${stage.stage.en}${isUnlocked ? ` ・ ${stage.name.en}` : ""}</span>
          <p class="codex-stage-lore">${isUnlocked ? stage.lore : stage.unlockHint}</p>
        </span>
      `;
      strip.appendChild(chip);
    });

    if (!line.complete) {
      const note = document.createElement("p");
      note.className = "codex-lore";
      note.textContent = "後續階段的演化資料整備中。";
      strip.appendChild(note);
    }

    return strip;
  }

  return { open };
}

function buildRadarSvg(radar = {}, accent = "#00d4ff") {
  const size = 200;
  const center = size / 2;
  const maxRadius = 74;

  const pointFor = (index, ratio) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const x = center + Math.cos(angle) * maxRadius * ratio;
    const y = center + Math.sin(angle) * maxRadius * ratio;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  };

  const ringPoints = (ratio) => RADAR_AXES.map((_, index) => pointFor(index, ratio)).join(" ");
  const statPoints = RADAR_AXES
    .map((axis, index) => pointFor(index, Math.max(0.08, Math.min(1, (Number(radar[axis.key]) || 0) / 100))))
    .join(" ");

  const axisLines = RADAR_AXES.map((_, index) => {
    const [x, y] = pointFor(index, 1).split(",");
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="rgba(0,212,255,0.18)" stroke-width="1" />`;
  }).join("");

  const labels = RADAR_AXES.map((axis, index) => {
    const angle = (Math.PI * 2 * index) / RADAR_AXES.length - Math.PI / 2;
    const x = center + Math.cos(angle) * (maxRadius + 16);
    const y = center + Math.sin(angle) * (maxRadius + 16);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="#9db3c9" font-size="11" text-anchor="middle" dominant-baseline="middle">${axis.label}</text>`;
  }).join("");

  return `
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="能力雷達圖" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="none" />
      <polygon points="${ringPoints(1)}" fill="none" stroke="rgba(0,212,255,0.28)" stroke-width="1" />
      <polygon points="${ringPoints(0.66)}" fill="none" stroke="rgba(0,212,255,0.16)" stroke-width="1" />
      <polygon points="${ringPoints(0.33)}" fill="none" stroke="rgba(0,212,255,0.12)" stroke-width="1" />
      ${axisLines}
      <polygon points="${statPoints}" fill="${accent}33" stroke="${accent}" stroke-width="1.6" />
      ${labels}
    </svg>
  `;
}
