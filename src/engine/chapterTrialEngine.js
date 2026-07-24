/**
 * 章節試煉共用引擎（Pack B — non-confrontation growth）
 *
 * 兩條等價通關路：
 * 1) 對峙稳住／回收（既有 battleController）
 * 2) 非對峙「章節生活事件」：在當前章的 reflective／peaceful／discovery 節點
 *    完成一次無遭遇探索
 *
 * 防刷規則完全共用：節點必須屬當前章，且該章尚未記入 completed。
 * 本模組只做純函數；寫入 draft 仍由各自 controller 負責。
 */

import {
  CHAPTER_COUNT,
  advanceChapterProgress,
  getChapterByNumber,
  getChapterForNode
} from "../data/chapterRegistry.js";
import { getChapterNarrative } from "../data/chapterNarrative.js";

/** 可作為非對峙通關的節點類型（不含 danger／rest）。 */
export const CHAPTER_LIFE_EVENT_TYPES = Object.freeze(["reflective", "peaceful", "discovery"]);

export function isChapterLifeEventNode(node) {
  if (!node || typeof node !== "object") return false;
  if (node.eventType === "danger" || node.eventType === "rest") return false;
  return CHAPTER_LIFE_EVENT_TYPES.includes(node.eventType);
}

/**
 * 與對峙通關相同的防刷判斷。
 * @returns {{ from, to } | null}
 */
export function resolveChapterTrialAdvance(chapterProgress, nodeId) {
  const progressBefore = chapterProgress && typeof chapterProgress === "object"
    ? chapterProgress
    : { current: 1, completed: [] };
  const current = Number(progressBefore.current) || 1;
  const completed = Array.isArray(progressBefore.completed) ? progressBefore.completed : [];
  const nodeChapter = getChapterForNode(nodeId);
  if (nodeChapter !== current) return null;
  if (completed.includes(current)) return null;
  return {
    from: getChapterByNumber(current),
    to: getChapterByNumber(Math.min(current + 1, CHAPTER_COUNT))
  };
}

/** 非對峙路徑：節點合資格 + 本次探索無遭遇。 */
export function resolveChapterLifeEventAdvance(chapterProgress, node, { encounter = false } = {}) {
  if (encounter) return null;
  if (!isChapterLifeEventNode(node)) return null;
  return resolveChapterTrialAdvance(chapterProgress, node.id);
}

export function applyChapterTrialAdvance(chapterProgress, chapterAdvance) {
  if (!chapterAdvance?.from?.chapter) {
    return chapterProgress || { current: 1, completed: [] };
  }
  return advanceChapterProgress(chapterProgress, chapterAdvance.from.chapter);
}

export function buildChapterAdvanceLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance?.from?.chapter);
  if (narrative?.clearLine) return `【旅程】${narrative.clearLine}`;
  const fromZh = chapterAdvance?.from?.zh || "這裡";
  const toZh = chapterAdvance?.to?.zh || "";
  if (chapterAdvance?.from?.chapter === 7) {
    return `【旅程】${fromZh}的雜訊，也安靜下來了。Linkara 的七片土地，你們一起走過了。`;
  }
  return `【旅程】${fromZh}一帶的雜訊，被你們一起放輕了。往${toZh}的方向，好像亮了一點。`;
}

export function buildChapterAdvanceCompanionLine(chapterAdvance) {
  const narrative = getChapterNarrative(chapterAdvance?.from?.chapter);
  if (narrative?.clearCompanionLine) return narrative.clearCompanionLine;
  if (chapterAdvance?.from?.chapter === 7) {
    return "七片土地都走過了。接下來去哪，我們慢慢想，不急。";
  }
  const toZh = chapterAdvance?.to?.zh || "下一片土地";
  return `這一帶安靜下來了。${toZh}那邊……等你想去的時候，我們再一起走。`;
}

/**
 * 章節成長證據輸入（sourceType: chapter）。
 * eventId 以節點鎖定，同一章同一節點不會重複刷 family root。
 */
export function buildChapterLifeEventGrowthInput({
  companionId,
  node,
  chapterNo,
  createdAt,
  safeHarborMode = false
} = {}) {
  if (!companionId || !node?.id) return null;
  const eventId = `life_${node.id}`;
  const branchFamily = CHAPTER_LIFE_EVENT_TYPES.includes(node.eventType)
    ? node.eventType
    : "presence";
  return {
    companionId,
    sourceType: "chapter",
    tendency: "attunement",
    context: {
      chapterNo: Number(chapterNo) || getChapterForNode(node.id),
      eventId,
      branchFamily
    },
    createdAt: Number(createdAt) || Date.now(),
    completed: true,
    completionStatus: "completed",
    safetyProvenance: {
      isHighRisk: false,
      strategyId: null,
      actionId: null,
      systemRoleSafetyReply: false,
      safetyModeActive: false,
      safeHarborModeActive: safeHarborMode === true
    }
  };
}
