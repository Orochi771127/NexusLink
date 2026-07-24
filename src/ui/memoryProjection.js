/**
 * Memory Single Truth Projection（Pack 3）
 *
 * 設計理念（給維護者）：
 * - 遊戲裡有多種「記憶」儲存（情緒記憶、互動記憶、棲地痕跡、跨場錨點），
 *   用途不同，所以**不合併陣列、不改存檔 schema**。
 * - 玩家面對的是一份「證據清單」：任何「我記得 X」的具體宣稱，
 *   都必須能在這份投影裡找到對應證據，否則信任會斷裂。
 * - `released` ≠ 刪除：釋出的情緒記憶改列為檔案列，不再主導當前情緒／不可被具體回想。
 */

import { isPlayerVisibleAnchor } from "../ai/dialogue/companionAnchorPolicy.js";

/** 記憶頁預設一次顯示幾筆（與既有 MEMORY_LIMIT 對齊）。 */
export const MEMORY_PROJECTION_LIMIT = 8;

export { isPlayerVisibleAnchor };

/**
 * 具體回想命中是否對得上玩家可見證據。
 * @param {object|null} recallHit findPersistedRecall 的回傳
 * @param {object} state
 */
export function isConcreteRecallEvidenceVisible(state, recallHit) {
  if (!recallHit || !state) return false;

  if (recallHit.source === "emotional_memory") {
    const emotions = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
    const memory = emotions.find((item) => {
      if (!item) return false;
      if (item.status === "released" || item.status === "archived") return false;
      const key = recallHit.key;
      return item.id === key
        || item.emotion === key
        || item.theme === recallHit.softLabel
        || item.label === recallHit.softLabel;
    });
    return Boolean(memory);
  }

  if (recallHit.source === "companion_anchor") {
    const anchors = Array.isArray(state.companionAnchors) ? state.companionAnchors : [];
    const hit = anchors.find((anchor) =>
      anchor
      && (anchor.key === recallHit.key || anchor.id === recallHit.key)
      && isPlayerVisibleAnchor(anchor)
    );
    return Boolean(hit);
  }

  return false;
}

/**
 * 把 state 投影成玩家可見的統一記憶證據（純函數，不寫 state）。
 * @returns {Array<{kind:string,id:string,title:string,copy:string,createdAt:number,meta:string,source:object,claimable:boolean,status?:string}>}
 */
export function projectMemoryEvidence(state = {}, options = {}) {
  const limit = Number.isFinite(options.limit) ? options.limit : MEMORY_PROJECTION_LIMIT;
  const labels = {
    fallbackEmotionalTitle: options.fallbackEmotionalTitle || "情緒記憶",
    fallbackEmotionalCopy: options.fallbackEmotionalCopy || "牠把這段感受留在棲地裡。",
    fallbackInteractionTitle: options.fallbackInteractionTitle || "互動記憶",
    fallbackInteractionCopy: options.fallbackInteractionCopy || "這是一段已保存的互動。",
    fallbackAnchorTitle: options.fallbackAnchorTitle || "關係錨點",
    fallbackTraceTitle: options.fallbackTraceTitle || "棲地痕跡",
    archiveMeta: options.archiveMeta || "已釋放・仍留在關係檔案",
    activeMeta: options.activeMeta || "",
    intensityFmt: options.intensityFmt || "（強度 {pct}%）"
  };

  const emotional = projectEmotionalMemories(state, labels);
  const manual = projectManualMemories(state, labels);
  const traces = projectHabitatTraces(state, labels, options.getTraceDisplayCopy);
  const anchors = projectCompanionAnchors(state, labels);

  const sorted = [...emotional, ...manual, ...traces, ...anchors]
    .sort((left, right) => right.createdAt - left.createdAt);

  if (!Number.isFinite(limit) || limit <= 0) return sorted;
  return sorted.slice(0, limit);
}

/**
 * 證據條計數（Memory 頁上方摘要用）。
 */
export function countMemoryEvidence(state = {}) {
  const emotional = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  const activeEmotional = emotional.filter(
    (memory) => memory && memory.status !== "released" && memory.status !== "archived"
  ).length;
  const archivedEmotional = emotional.filter(
    (memory) => memory && (memory.status === "released" || memory.status === "archived")
  ).length;
  const interactions = Array.isArray(state.memories) ? state.memories.length : 0;
  const traces = Array.isArray(state.habitatTraces) ? state.habitatTraces.length : 0;
  const anchors = (Array.isArray(state.companionAnchors) ? state.companionAnchors : [])
    .filter(isPlayerVisibleAnchor).length;

  return {
    interactions,
    emotional: activeEmotional,
    emotionalArchive: archivedEmotional,
    traces,
    anchors,
    total: interactions + activeEmotional + archivedEmotional + traces + anchors
  };
}

function projectEmotionalMemories(state, labels) {
  const list = Array.isArray(state.emotionalMemories) ? state.emotionalMemories : [];
  return list.filter(Boolean).map((memory) => {
    const archived = memory.status === "released" || memory.status === "archived";
    const statusBits = [memory.status, memory.emotion].filter(Boolean);
    if (archived) statusBits.push(labels.archiveMeta);
    return {
      kind: archived ? "emotional_archive" : "emotional",
      id: String(memory.id || `emo_${memory.createdAt || 0}`),
      title: memory.theme || memory.label || labels.fallbackEmotionalTitle,
      copy: memory.excerpt || memory.label || labels.fallbackEmotionalCopy,
      createdAt: Number(memory.lastUpdatedAt) || Number(memory.createdAt) || 0,
      meta: statusBits.join(" · "),
      source: memory,
      claimable: !archived,
      status: memory.status || "active"
    };
  });
}

function projectManualMemories(state, labels) {
  const list = Array.isArray(state.memories) ? state.memories : [];
  return list.filter(Boolean).map((memory, index) => ({
    kind: "memory",
    id: String(memory.id || `mem_${index}_${memory.createdAt || 0}`),
    title: memory.title || labels.fallbackInteractionTitle,
    copy: memory.text || labels.fallbackInteractionCopy,
    createdAt: Number(memory.createdAt) || 0,
    meta: memory.type || "",
    source: memory,
    claimable: true,
    status: "active"
  }));
}

function projectHabitatTraces(state, labels, getTraceDisplayCopy) {
  const list = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];
  return list.filter(Boolean).map((trace, index) => {
    const display = typeof getTraceDisplayCopy === "function"
      ? getTraceDisplayCopy(trace)
      : { title: labels.fallbackTraceTitle, copy: String(trace.note || trace.memoryId || "") };
    const intensityPct = Math.round((Number(trace.intensity) || 0) * 100);
    const intensityNote = labels.intensityFmt.replace("{pct}", String(intensityPct));
    return {
      kind: "trace",
      id: String(trace.id || trace.memoryId || `trace_${index}`),
      title: display.title || labels.fallbackTraceTitle,
      copy: `${display.copy || ""}${intensityNote}`,
      createdAt: Number(trace.lastUpdatedAt) || Number(trace.createdAt) || 0,
      meta: trace.status || trace.memoryId || "",
      source: trace,
      claimable: true,
      status: trace.status || "active"
    };
  });
}

function projectCompanionAnchors(state, labels) {
  const list = Array.isArray(state.companionAnchors) ? state.companionAnchors : [];
  return list.filter(isPlayerVisibleAnchor).map((anchor, index) => ({
    kind: "anchor",
    id: String(anchor.id || `anch_${anchor.key || index}`),
    title: anchor.softLabel || anchor.label || labels.fallbackAnchorTitle,
    copy: String(anchor.detail || ""),
    createdAt: Number(anchor.updatedAt) || Number(anchor.createdAt) || index,
    meta: [anchor.kind, "關係錨點"].filter(Boolean).join(" · "),
    source: anchor,
    claimable: true,
    status: "active"
  }));
}
