import { qs } from "../utils/dom.js";
import { t } from "../i18n/i18n.js";
import { getChapterForRegion, getChapterStatus, getChapterByNumber } from "../data/chapterRegistry.js";
import { getCompanionById } from "../data/companionRegistry.js";

// 唯讀世界地圖（Linkara 遠景）。七區各為一章（CH-4 章節骨架）：
// 區域狀態由 state.chapterProgress 推導（current／completed／locked），
// 不做完成度 %、不做倒數、不做解鎖任務——只是「你走到哪裡了」。
// 位置座標為 viewBox(0..100) 的示意佈局，概略對應人工世界地圖的相對方位，
// 之後若批准匯入正式底圖 PNG，可保留座標、僅替換背景層。
const LINKARA_REGIONS = [
  { id: "forge", no: "1", zh: "東南熔爐丘陵區", en: "Southeast Forge Hills", x: 80, y: 64 },
  { id: "core", no: "2", zh: "中央輝耀核心區", en: "Central Radiant Core", x: 46, y: 46 },
  { id: "plains", no: "3", zh: "北部翠綠平原區", en: "Northern Verdant Plains", x: 32, y: 27 },
  { id: "harbor", no: "4", zh: "南港", en: "Southern Harbor Nexus", x: 50, y: 90 },
  { id: "moonlake", no: "5", zh: "月湖營地", en: "Ethereal Moon Lakefront", x: 71, y: 38 },
  { id: "mystic", no: "6", zh: "秘境山脈核心", en: "Eastern Mystic Mountains", x: 80, y: 18 },
  { id: "tidal", no: "7", zh: "西南潮汐邊疆區", en: "Southwest Tidal Frontier", x: 19, y: 78 }
];

// 聯結之河：區域之間的細光路（純視覺，與當前所在相連者較亮）。
const RIVER_LINKS = [
  ["plains", "core"],
  ["core", "moonlake"],
  ["core", "harbor"],
  ["moonlake", "mystic"],
  ["moonlake", "forge"],
  ["harbor", "tidal"],
  ["plains", "tidal"]
];

const VIEW_W = 100;
const VIEW_H = 96;

export function createAtlasController({ panelManager, store }) {
  const canvas = qs("#atlas-canvas");
  const legend = qs("#atlas-legend");

  function regionStatus(region, chapterProgress) {
    const chapter = getChapterForRegion(region.id);
    if (!chapter) return "locked";
    return getChapterStatus(chapter.chapter, chapterProgress);
  }

  function build() {
    // 每次開啟重建：章節推進（CH-5）後再開地圖即反映新狀態；渲染很輕。
    const state = store?.getState?.() || {};
    const chapterProgress = state.chapterProgress || { current: 1, completed: [] };
    const regions = LINKARA_REGIONS.map((region) => ({
      ...region,
      status: regionStatus(region, chapterProgress)
    }));
    if (canvas) canvas.innerHTML = buildMapSvg(regions);
    if (legend) legend.innerHTML = buildLegend(regions);
    renderIntro(state, chapterProgress);
  }

  // intro 跟著「定情夥伴 + 當前章區域」走（夥伴名/區名為內容層，維持 TC）。
  // 語言切換時 applyLanguage 會把模板原樣寫回，但切語言必經 settings（atlas 已關），
  // 重開地圖即重新代入。
  function renderIntro(state, chapterProgress) {
    const introEl = qs('[data-i18n="atlas.intro"]');
    if (!introEl) return;
    const companion = getCompanionById(state.activeCompanionId);
    const chapter = getChapterByNumber(chapterProgress.current);
    const region = LINKARA_REGIONS.find((entry) => entry.id === chapter?.regionId);
    introEl.textContent = t("atlas.intro")
      .replace("{name}", companion?.name || "牠")
      .replace("{region}", region?.zh || "月湖營地");
  }

  function open() {
    build();
    panelManager.openPanel("atlas");
  }

  return { open };
}

function buildMapSvg(regions) {
  const byId = new Map(regions.map((region) => [region.id, region]));

  const links = RIVER_LINKS.map(([from, to]) => {
    const a = byId.get(from);
    const b = byId.get(to);
    if (!a || !b) return "";
    const live = a.status === "current" || b.status === "current";
    return `<line class="atlas-link${live ? " is-live" : ""}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`;
  }).join("");

  const nodes = regions.map((region) => {
    const isCurrent = region.status === "current";
    const haloR = isCurrent ? 7.4 : 5;
    const dotR = isCurrent ? 3.4 : 2.6;
    return `<g class="atlas-node atlas-node--${region.status}" transform="translate(${region.x} ${region.y})">
      <circle class="atlas-node-halo" r="${haloR}"></circle>
      <circle class="atlas-node-dot" r="${dotR}"></circle>
      <text class="atlas-node-no" y="1.2">${region.no}</text>
    </g>`;
  }).join("");

  return `<svg viewBox="0 0 ${VIEW_W} ${VIEW_H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Linkara 世界地圖示意：你目前在月湖一帶">
    <g class="atlas-links">${links}</g>
    <g class="atlas-nodes">${nodes}</g>
  </svg>`;
}

function buildLegend(regions) {
  return regions
    .slice()
    .sort((left, right) => Number(left.no) - Number(right.no))
    .map((region) => {
      const chapter = getChapterForRegion(region.id);
      const tagKey =
        region.status === "current" ? "atlas.here" : region.status === "completed" ? "atlas.walked" : "atlas.far";
      const chapterLabel = chapter ? t("atlas.chapterOf").replace("{no}", String(chapter.chapter)) : "";
      return `<li class="atlas-region atlas-region--${region.status}">
        <span class="atlas-region-no" aria-hidden="true">${region.no}</span>
        <span class="atlas-region-copy">
          <strong>${region.zh}</strong>
          <em>${region.en}${chapterLabel ? `・${chapterLabel}` : ""}</em>
        </span>
        <span class="atlas-region-tag" data-i18n="${tagKey}">${t(tagKey)}</span>
      </li>`;
    })
    .join("");
}
