import { qs } from "../utils/dom.js";
import { t } from "../i18n/i18n.js";

// 唯讀世界地圖（Linkara 遠景）。資料純前端、不接 schema、不改存檔。
// 月湖營地（區域 5 / Ethereal Moon Lakefront）＝玩家當前所在；其餘為遠方鎖定。
// 不做完成度 %、不做倒數、不做解鎖任務——只是「你在這裡，其餘還在遠處」。
// 位置座標為 viewBox(0..100) 的示意佈局，概略對應人工世界地圖的相對方位，
// 之後若批准匯入正式底圖 PNG，可保留座標、僅替換背景層。
const LINKARA_REGIONS = [
  { id: "forge", no: "1", zh: "東南熔爐丘陵區", en: "Southeast Forge Hills", x: 80, y: 64, status: "locked" },
  { id: "core", no: "2", zh: "中央輝耀核心區", en: "Central Radiant Core", x: 46, y: 46, status: "locked" },
  { id: "plains", no: "3", zh: "北部翠綠平原區", en: "Northern Verdant Plains", x: 32, y: 27, status: "locked" },
  { id: "harbor", no: "4", zh: "南港", en: "Southern Harbor Nexus", x: 50, y: 90, status: "locked" },
  { id: "moonlake", no: "5", zh: "月湖營地", en: "Ethereal Moon Lakefront", x: 71, y: 38, status: "current" },
  { id: "mystic", no: "6", zh: "秘境山脈核心", en: "Eastern Mystic Mountains", x: 80, y: 18, status: "locked" },
  { id: "tidal", no: "7", zh: "西南潮汐邊疆區", en: "Southwest Tidal Frontier", x: 19, y: 78, status: "locked" }
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

export function createAtlasController({ panelManager }) {
  const canvas = qs("#atlas-canvas");
  const legend = qs("#atlas-legend");
  let built = false;

  function buildOnce() {
    if (built) return;
    built = true;
    if (canvas) canvas.innerHTML = buildMapSvg();
    if (legend) legend.innerHTML = buildLegend();
  }

  function open() {
    buildOnce();
    panelManager.openPanel("atlas");
  }

  return { open };
}

function buildMapSvg() {
  const byId = new Map(LINKARA_REGIONS.map((region) => [region.id, region]));

  const links = RIVER_LINKS.map(([from, to]) => {
    const a = byId.get(from);
    const b = byId.get(to);
    if (!a || !b) return "";
    const live = a.status === "current" || b.status === "current";
    return `<line class="atlas-link${live ? " is-live" : ""}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" />`;
  }).join("");

  const nodes = LINKARA_REGIONS.map((region) => {
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

function buildLegend() {
  return LINKARA_REGIONS
    .slice()
    .sort((left, right) => Number(left.no) - Number(right.no))
    .map((region) => {
      const tagKey = region.status === "current" ? "atlas.here" : "atlas.far";
      return `<li class="atlas-region atlas-region--${region.status}">
        <span class="atlas-region-no" aria-hidden="true">${region.no}</span>
        <span class="atlas-region-copy">
          <strong>${region.zh}</strong>
          <em>${region.en}</em>
        </span>
        <span class="atlas-region-tag" data-i18n="${tagKey}">${t(tagKey)}</span>
      </li>`;
    })
    .join("");
}
