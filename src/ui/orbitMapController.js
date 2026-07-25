/**
 * 心核迴旋戰 — 路徑節點圖（R2／R5）
 *
 * session-only 進度；顯示月湖／平原等已解鎖路徑與五關節點。
 * R5：四語 chrome 關鍵字＋ aria 標籤。
 */

import { formatVaultMoteStripLabel } from "../expedition/lootPresentation.js";
import {
  getOrbitPathLabel,
  listPlayableRegionIds,
  listStagesForRegion
} from "../data/orbit/stages/index.js";
import { getLanguage, t } from "../i18n/i18n.js";
import {
  getOrbitPathProgressSnapshot,
  isOrbitRegionUnlocked,
  listOrbitMapNodes,
  setActiveOrbitRegion
} from "../orbit/orbitPathProgress.js";
import { describeOrbitEntryFromVault } from "../orbit/orbitSettlement.js";

/**
 * @param {{
 *  onSelectStage: (stageId: string) => void,
 *  onOpenDuel?: () => void,
 *  onClose: () => void,
 *  statusText?: HTMLElement | null,
 *  getVault?: () => object
 * }} deps
 */
export function createOrbitMapController({
  onSelectStage,
  onOpenDuel,
  onClose,
  statusText,
  getVault
}) {
  let rootEl = null;

  function applyChrome() {
    if (!rootEl) return;
    const kicker = rootEl.querySelector(".orbit-kicker");
    const note = rootEl.querySelector(".orbit-map-note");
    const regions = rootEl.querySelector(".orbit-map-regions");
    const nodes = rootEl.querySelector(".orbit-map-nodes");
    const duelBtn = rootEl.querySelector('[data-orbit-map="duel"]');
    const closeBtn = rootEl.querySelector('[data-orbit-map="close"]');
    if (kicker) kicker.textContent = t("orbit.mapKicker");
    if (note) note.textContent = t("orbit.mapNote");
    if (regions) regions.setAttribute("aria-label", t("orbit.mapRegions"));
    if (nodes) nodes.setAttribute("aria-label", t("orbit.mapNodes"));
    if (duelBtn) duelBtn.textContent = t("orbit.duelOpen");
    if (closeBtn) closeBtn.textContent = t("orbit.closeExplore");
  }

  function ensure() {
    if (rootEl) return rootEl;
    rootEl = document.createElement("div");
    rootEl.className = "orbit-map";
    rootEl.hidden = true;
    rootEl.innerHTML = `
      <div class="orbit-map-head">
        <p class="orbit-kicker"></p>
        <h2 class="orbit-map-title" id="orbit-map-title"></h2>
        <p class="orbit-map-note"></p>
        <p class="orbit-map-motes" aria-live="polite"></p>
        <div class="orbit-map-regions" role="tablist" aria-label=""></div>
      </div>
      <ol class="orbit-map-nodes" aria-label=""></ol>
      <p class="orbit-map-narrative" hidden></p>
      <div class="orbit-map-actions">
        <button type="button" class="orbit-btn" data-orbit-map="duel"></button>
        <button type="button" class="orbit-btn orbit-btn--ghost" data-orbit-map="close"></button>
      </div>
    `;
    applyChrome();
    rootEl.addEventListener("click", (event) => {
      const regionBtn = event.target.closest("[data-orbit-region]");
      if (regionBtn) {
        const regionId = regionBtn.dataset.orbitRegion;
        if (isOrbitRegionUnlocked(regionId)) {
          setActiveOrbitRegion(regionId);
          render();
        }
        return;
      }
      const stageBtn = event.target.closest("[data-orbit-stage]");
      if (stageBtn && !stageBtn.disabled) {
        onSelectStage?.(stageBtn.dataset.orbitStage);
        return;
      }
      if (event.target.closest('[data-orbit-map="duel"]')) {
        onOpenDuel?.();
        return;
      }
      if (event.target.closest('[data-orbit-map="close"]')) {
        onClose?.();
      }
    });
    return rootEl;
  }

  function mount(parent) {
    const el = ensure();
    if (el.parentElement !== parent) parent.appendChild(el);
    return el;
  }

  function show() {
    ensure().hidden = false;
    applyChrome();
    render();
  }

  function hide() {
    if (rootEl) rootEl.hidden = true;
  }

  function render() {
    const el = ensure();
    applyChrome();
    const snap = getOrbitPathProgressSnapshot();
    const regions = listPlayableRegionIds();
    const regionRow = el.querySelector(".orbit-map-regions");
    const farLabel = t("orbit.mapFar");
    regionRow.innerHTML = regions
      .map((regionId) => {
        const unlocked = isOrbitRegionUnlocked(regionId);
        const active = snap.activeRegionId === regionId;
        const label = getOrbitPathLabel(regionId);
        return `<button type="button" class="orbit-region-chip${active ? " is-active" : ""}${
          unlocked ? "" : " is-locked"
        }" data-orbit-region="${regionId}" ${unlocked ? "" : "disabled"} aria-pressed="${active}">
          ${label}${unlocked ? "" : `・${farLabel}`}
        </button>`;
      })
      .join("");

    el.querySelector(".orbit-map-title").textContent =
      `${getOrbitPathLabel(snap.activeRegionId)}・${t("orbit.mapNodesSuffix")}`;

    const vault = typeof getVault === "function" ? getVault() : null;
    const entry = describeOrbitEntryFromVault(vault, snap.activeRegionId);
    const moteEl = el.querySelector(".orbit-map-motes");
    const shards = vault?.shards && typeof vault.shards === "object" ? vault.shards : {};
    const lang = getLanguage() === "en" ? "en" : "zh";
    const strip = Object.entries(shards)
      .filter(([, count]) => Number(count) > 0)
      .map(([shardId, count]) => {
        const s = formatVaultMoteStripLabel(shardId, count, lang);
        return `${s.count} ${s.label}`;
      })
      .join(" · ");
    moteEl.textContent = strip
      ? `${t("orbit.motesPrefix")}：${strip}。${entry.line}`
      : entry.line;

    const nodes = listOrbitMapNodes(snap.activeRegionId);
    const list = el.querySelector(".orbit-map-nodes");
    list.innerHTML = nodes
      .map((node) => {
        const stateLabel = node.cleared
          ? t("orbit.nodeCleared")
          : node.unlocked
            ? t("orbit.nodeOpen")
            : t("orbit.nodeLocked");
        return `<li>
          <button type="button" class="orbit-node-btn${node.cleared ? " is-cleared" : ""}${
            node.unlocked ? "" : " is-locked"
          }" data-orbit-stage="${node.id}" ${node.unlocked ? "" : "disabled"}>
            <span class="orbit-node-index">${node.index}</span>
            <span class="orbit-node-body">
              <strong>${node.title}</strong>
              <em>${node.goalLabel}</em>
              <small>${stateLabel}</small>
            </span>
          </button>
        </li>`;
      })
      .join("");

    const narrative = el.querySelector(".orbit-map-narrative");
    if (snap.lastNarrative) {
      narrative.hidden = false;
      narrative.textContent = snap.lastNarrative;
    } else {
      narrative.hidden = true;
      narrative.textContent = "";
    }

    if (statusText && snap.justUnlockedRegionId) {
      statusText.textContent = t("orbit.pathLit").replace(
        "{path}",
        getOrbitPathLabel(snap.justUnlockedRegionId)
      );
    }
  }

  /** 供測試：確認月湖有五關定義 */
  function countMoonlakeStages() {
    return listStagesForRegion("moonlake").length;
  }

  return { mount, show, hide, render, ensure, applyChrome, countMoonlakeStages };
}
