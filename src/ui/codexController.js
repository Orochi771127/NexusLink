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
import { projectCodexLivedPaths } from "../engine/codexLivedPaths.js";

const LIVED_PATH_SOURCE_LABELS = Object.freeze({
  care: "共同生活",
  exploration: "旅路",
  reflection: "回望",
  standoff: "裂隙共鳴",
  chapter: "章節痕跡",
  boundary: "界線",
  recovery: "回到安穩"
});

const LIVED_PATH_TENDENCY_COPY = Object.freeze({
  attunement: "牠曾在願意先聽清彼此的時候，靠近半步。",
  boundary_respect: "牠曾守住自己的距離，而你讓那個界線留在場上。",
  pathfinding: "你們曾一起找路，也接受過不照原計畫前進。",
  steadfastness: "有些共同生活的痕跡，正在安靜地變得穩固。"
});

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

function ensureLivedPathStyles() {
  if (document.getElementById("codex-lived-path-styles")) return;
  const style = document.createElement("style");
  style.id = "codex-lived-path-styles";
  style.textContent = [
    ".codex-lived-paths{display:grid;gap:8px;margin:14px 0;padding:12px;border:1px solid rgba(139,217,255,.18);border-radius:16px;background:linear-gradient(135deg,rgba(11,26,45,.62),rgba(39,31,67,.52))}",
    ".codex-lived-paths .codex-section-title{margin:0}",
    ".codex-lived-paths-intro,.codex-lived-paths-quiet{margin:0;font-size:12px;line-height:1.55;color:rgba(218,235,249,.86)}",
    ".codex-lived-path-list{display:grid;gap:7px;margin:0;padding:0;list-style:none}",
    ".codex-lived-path-list li{display:grid;gap:2px;padding:8px 10px;border-inline-start:2px solid rgba(151,226,255,.42);background:rgba(4,10,24,.28)}",
    ".codex-lived-path-list strong{font-size:11px;color:#bdeeff}",
    ".codex-lived-path-list span{font-size:12px;line-height:1.5;color:#eef7ff}"
  ].join("");
  document.head.appendChild(style);
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
    const livedPaths = projectCodexLivedPaths({ state, companionId });
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

    if (livedPaths.stageId) {
      ensureLivedPathStyles();
      const livedPathSection = document.createElement("section");
      livedPathSection.className = "codex-lived-paths";
      livedPathSection.innerHTML =
        '<h4 class="codex-section-title">旅路星圖・生活過的路</h4>' +
        '<p class="codex-lived-paths-intro">這裡只回望已經發生的質感，不顯示完成率、門檻或最佳路線。</p>';

      if (livedPaths.pathEchoes.length > 0) {
        const list = document.createElement("ul");
        list.className = "codex-lived-path-list";
        livedPaths.pathEchoes.forEach((echo) => {
          const item = document.createElement("li");
          const label = LIVED_PATH_SOURCE_LABELS[echo.sourceType] || "共同痕跡";
          const copy = LIVED_PATH_TENDENCY_COPY[echo.tendencyId]
            || "有一道共同生活的痕跡，仍在安靜回響。";
          item.innerHTML = `<strong>${label}</strong><span>${copy}</span>`;
          list.appendChild(item);
        });
        livedPathSection.appendChild(list);
      } else {
        const quiet = document.createElement("p");
        quiet.className = "codex-lived-paths-quiet";
        quiet.textContent = "有些痕跡還沒有形成可說清的句子；這不是待辦清單，也不需要追趕。";
        livedPathSection.appendChild(quiet);
      }
      detail.appendChild(livedPathSection);
    }

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
