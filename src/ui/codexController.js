import { qs } from "../utils/dom.js";
import {
  COMPANIONS,
  ELEMENT_LABELS,
  getCompanionById
} from "../data/companionRegistry.js";
import {
  HEARTSPARK_COUNCIL_CANON_V06,
  getHeartsparkCouncilCanonCharacterById
} from "../data/heartsparkCouncilCanon.js";
import { getEvolutionLine } from "../data/evolutionLines.js";
import { getCompanionRuntimeEligibility } from "../data/companionRuntimePolicy.js";
import {
  COMPANION_GROWTH_STAGES,
  getCompanionCodexGrowthPresentation
} from "../state/companionStateSchema.js";

const CANON_STAGE_LABELS = [
  { zh: "第一階", en: "Stage 1" },
  { zh: "第二階", en: "Stage 2" },
  { zh: "第三階", en: "Stage 3" }
];

const FORMAL_GROWTH_STAGE_LABELS = [
  { zh: "初醒夥伴", en: "INITIAL AWAKENED" },
  { zh: "共鳴成熟體", en: "RESONANT MATURE" },
  { zh: "終局覺醒體", en: "FINAL AWAKENED" }
];

export function getCodexEntries() {
  const runtimeIds = new Set(COMPANIONS.map((companion) => companion.id));
  return [
    ...COMPANIONS.map((companion) => ({
      kind: "runtime",
      id: companion.id,
      element: companion.element,
      elementName: ELEMENT_LABELS[companion.element],
      name: companion.displayName,
      emblem: companion.emotionalEmblem,
      companion
    })),
    ...HEARTSPARK_COUNCIL_CANON_V06.characters
      .filter((character) => !runtimeIds.has(character.id))
      .map((character) => ({
      kind: "canon",
      id: character.id,
      element: character.element,
      elementName: character.elementName,
      name: character.names.stage1,
      emblem: character.emblem,
      character
      }))
  ];
}

export function createCodexController({ store, panelManager }) {
  const bodyEl = qs("#codex-body");

  function open() {
    renderList();
    panelManager.openPanel("codex");
  }

  function renderList() {
    if (!bodyEl) return;
    bodyEl.innerHTML = "";
    const state = store.getState();

    const list = document.createElement("div");
    list.className = "codex-list";

    getCodexEntries().forEach((entry) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "codex-row";
      const elementLabel = entry.elementName;
      const eligibility = entry.kind === "runtime"
        ? getCompanionRuntimeEligibility(entry.companion, state)
        : null;
      const rowMeta = entry.kind === "canon"
        ? `${entry.name.en} ・ 未相遇`
        : eligibility?.isUnlocked
          ? entry.name.en
          : `${entry.name.en} ・ 未相遇`;
      row.innerHTML = `
        <span class="companion-card-badge element-${entry.element}" aria-hidden="true">${elementLabel?.zh || ""}</span>
        <span class="companion-card-main">
          <strong class="companion-card-name">${entry.name.zh}</strong>
          <em class="companion-card-name-en">${rowMeta}</em>
        </span>
        <span class="codex-row-emblem">${entry.emblem.zh}</span>
      `;
      row.addEventListener("click", () => {
        if (entry.kind === "canon") renderCanonDetail(entry.id);
        else renderDetail(entry.id);
      });
      list.appendChild(row);
    });

    bodyEl.appendChild(list);
  }

  function renderDetail(companionId) {
    if (!bodyEl) return;
    const companion = getCompanionById(companionId);
    const state = store.getState();
    // G2: each Codex entry reads only its own canonical stage. A migrated
    // inactive record may retain a display-only floor, but never borrows the
    // currently active companion's bond or relationship.
    const codexGrowth = getCompanionCodexGrowthPresentation(state.companionStates, companionId);
    const eligibility = getCompanionRuntimeEligibility(companion, state);
    const elementLabel = ELEMENT_LABELS[companion.element];
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
      ["屬性", `${elementLabel?.zh || ""} ${elementLabel?.en || ""}`],
      ["所屬", `${companion.faction.zh} ・ ${companion.faction.en}`],
      ["情感徽章", companion.emotionalEmblem.zh],
      ["性情", companion.temperament.zh],
      ["棲地親和", companion.habitatAffinity.zh],
      ["相遇狀態", eligibility.isUnlocked ? "已結緣" : "未相遇／鎖定"]
    ].map(([label, value]) => `
      <div class="codex-tag">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `).join("");
    detail.appendChild(tags);

    const evolutionSection = document.createElement("section");
    evolutionSection.innerHTML = `<h4 class="codex-section-title">成長軌跡</h4>`;
    evolutionSection.appendChild(buildEvolutionStrip(companion, codexGrowth.revealStage));
    if (codexGrowth.isLegacyArchive) {
      const archiveNote = document.createElement("p");
      archiveNote.className = "codex-lore";
      archiveNote.textContent = "舊存檔保留的圖鑑記錄；這不代表牠已建立目前的關係或完成正式覺醒。";
      evolutionSection.appendChild(archiveNote);
    }
    detail.appendChild(evolutionSection);

    const lore = document.createElement("p");
    lore.className = "codex-lore";
    lore.textContent = companion.description;
    detail.appendChild(lore);

    bodyEl.appendChild(detail);
  }

  function renderCanonDetail(characterId) {
    if (!bodyEl) return;
    const character = getHeartsparkCouncilCanonCharacterById(characterId);
    if (!character) {
      renderList();
      return;
    }

    bodyEl.innerHTML = "";

    const detail = document.createElement("div");
    detail.className = "codex-detail";

    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "ghost-button codex-back";
    backButton.textContent = "返回列表";
    backButton.addEventListener("click", renderList);
    detail.appendChild(backButton);

    const titleBlock = document.createElement("div");
    titleBlock.className = "codex-title-block";
    titleBlock.innerHTML = `
      <h3>${character.names.stage1.zh}</h3>
      <em>${character.names.stage1.en} · ${character.elementName.zh} · 尚未相遇</em>
    `;
    detail.appendChild(titleBlock);

    const tags = document.createElement("dl");
    tags.className = "codex-tag-grid";
    tags.innerHTML = [
      ["屬性", `${character.elementName.zh} ${character.elementName.en}`],
      ["所屬", HEARTSPARK_COUNCIL_CANON_V06.factionName.zh],
      ["情感徽章", character.emblem.zh],
      ["性情", character.temperament.zh],
      ["棲地線索", character.habitat.zh]
    ].map(([label, value]) => `
      <div class="codex-tag">
        <dt>${label}</dt>
        <dd>${value}</dd>
      </div>
    `).join("");
    detail.appendChild(tags);

    const evolutionSection = document.createElement("section");
    evolutionSection.innerHTML = `<h4 class="codex-section-title">三階成長剪影</h4>`;
    evolutionSection.appendChild(buildCanonEvolutionStrip(character));
    detail.appendChild(evolutionSection);

    const lore = document.createElement("p");
    lore.className = "codex-lore";
    lore.textContent = character.story.zh;
    detail.appendChild(lore);

    bodyEl.appendChild(detail);
  }

  function buildEvolutionStrip(companion, revealStage) {
    const strip = document.createElement("div");
    strip.className = "codex-evolution-strip";
    const line = getEvolutionLine(companion.evolutionLineId);

    if (!line) {
      strip.innerHTML = `<p class="codex-lore">演化資料整備中。</p>`;
      return strip;
    }

    const revealRank = Math.max(0, COMPANION_GROWTH_STAGES.indexOf(revealStage));
    line.stages.forEach((stage, index) => {
      const isUnlocked = index <= revealRank;
      const formalStage = FORMAL_GROWTH_STAGE_LABELS[index] || FORMAL_GROWTH_STAGE_LABELS[0];
      const chip = document.createElement("div");
      chip.className = `codex-stage-chip${isUnlocked ? "" : " is-locked"}`;
      chip.innerHTML = `
        <span class="codex-stage-index">${index + 1}</span>
        <span class="codex-stage-copy">
          <strong class="codex-stage-name">${isUnlocked ? stage.name.zh : "？？？"}</strong>
          <span class="codex-stage-label">${formalStage.zh} ・ ${formalStage.en}${isUnlocked ? ` ・ ${stage.name.en}` : ""}</span>
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

function buildCanonEvolutionStrip(character) {
  const strip = document.createElement("div");
  strip.className = "codex-evolution-strip";

  ["stage1", "stage2", "stage3"].forEach((stageKey, index) => {
    const stageName = character.names[stageKey];
    const chip = document.createElement("div");
    chip.className = "codex-stage-chip";
    chip.innerHTML = `
      <span class="codex-stage-index">${index + 1}</span>
      <span class="codex-stage-copy">
        <strong class="codex-stage-name">${stageName.zh}</strong>
        <span class="codex-stage-label">${CANON_STAGE_LABELS[index].zh} · ${stageName.en}</span>
        <p class="codex-stage-lore">${stageName.ja}</p>
      </span>
    `;
    strip.appendChild(chip);
  });

  return strip;
}
