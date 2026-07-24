/**
 * Resonance Thread + first-session standoff readiness (Pack 1).
 * Pure derive only — no DOM, no store writes, no save schema.
 *
 * D1: copy keyed by kind; companion name optional for personalization.
 * D2: unguided Emotional Standoff waits until first-loop done + visible emotional trace.
 */

import { isEmotionalHabitatTrace } from "./habitatTraceEngine.js";

export const RESONANCE_THREAD_KINDS = Object.freeze({
  MEET_PRESENCE: "meet_presence",
  FIRST_TOUCH: "first_touch",
  FIRST_SOUL: "first_soul",
  FIRST_TRACE_VISIBLE: "first_trace_visible",
  SAFE_EXPLORE: "safe_explore",
  RETURN_HABITAT_LOOK: "return_habitat_look",
  SESSION_ENOUGH: "session_enough"
});

const KIND_PRIORITY = Object.freeze([
  RESONANCE_THREAD_KINDS.FIRST_TOUCH,
  RESONANCE_THREAD_KINDS.FIRST_SOUL,
  RESONANCE_THREAD_KINDS.FIRST_TRACE_VISIBLE,
  RESONANCE_THREAD_KINDS.SAFE_EXPLORE,
  RESONANCE_THREAD_KINDS.RETURN_HABITAT_LOOK,
  RESONANCE_THREAD_KINDS.SESSION_ENOUGH
]);

/**
 * @param {object} state
 * @param {{ dismissedKinds?: string[], enoughMarked?: boolean }} [session]
 * @returns {{ kind: string, title: string, body: string, why: string, consequence: string, ctaHint: string|null } | null}
 */
export function deriveResonanceThread(state = {}, session = {}) {
  if (!state?.onboarding?.completed) return null;

  const firstLoop = state.onboarding?.firstLoop || {};
  const loopActive = !firstLoop.completedAt && !firstLoop.skippedAt;
  const dismissed = new Set(
    Array.isArray(session.dismissedKinds) ? session.dismissedKinds.map(String) : []
  );
  const companionName = resolveCompanionDisplayName(state);
  const hasPlayerLine = (Array.isArray(state.chatHistory) ? state.chatHistory : []).some(
    (entry) => entry?.role === "player"
  );
  const visibleTraces = (Array.isArray(state.habitatTraces) ? state.habitatTraces : []).filter(
    (trace) => isEmotionalHabitatTrace(trace)
  );
  const exploreCount = Number(state.explorationProgress?.totalExplorations) || 0;
  const battleCount =
    (Number(state.battleRecord?.wins) || 0) +
    (Number(state.battleRecord?.losses) || 0) +
    (Number(state.battleRecord?.retreats) || 0);

  /** @type {string|null} */
  let kind = null;

  if (loopActive) {
    if (!state.firstTouchCompleted) kind = RESONANCE_THREAD_KINDS.FIRST_TOUCH;
    else if (!hasPlayerLine) kind = RESONANCE_THREAD_KINDS.FIRST_SOUL;
    else if (visibleTraces.length === 0) kind = RESONANCE_THREAD_KINDS.FIRST_TRACE_VISIBLE;
  } else if (session.enoughMarked) {
    kind = RESONANCE_THREAD_KINDS.SESSION_ENOUGH;
  } else if (visibleTraces.length > 0 && exploreCount === 0) {
    kind = RESONANCE_THREAD_KINDS.SAFE_EXPLORE;
  } else if (exploreCount > 0 && battleCount === 0 && visibleTraces.length > 0) {
    kind = RESONANCE_THREAD_KINDS.RETURN_HABITAT_LOOK;
  } else if (visibleTraces.length >= 1 && (exploreCount > 0 || battleCount > 0)) {
    kind = RESONANCE_THREAD_KINDS.SESSION_ENOUGH;
  } else if (!loopActive && !state.firstTouchCompleted) {
    kind = RESONANCE_THREAD_KINDS.FIRST_TOUCH;
  }

  if (!kind || dismissed.has(kind)) return null;
  return buildThreadCopy(kind, companionName);
}

/**
 * D2 gate: unguided standoff only after first-loop finished/skipped and a visible emotional trace exists.
 */
export function canEnterUnguidedStandoff(state = {}) {
  if (!state?.onboarding?.completed) return false;
  const firstLoop = state.onboarding?.firstLoop || {};
  if (!firstLoop.completedAt && !firstLoop.skippedAt) return false;
  const visibleTraces = (Array.isArray(state.habitatTraces) ? state.habitatTraces : []).filter(
    (trace) => isEmotionalHabitatTrace(trace)
  );
  return visibleTraces.length > 0;
}

export function isLifetimeFirstStandoff(state = {}) {
  const record = state.battleRecord || {};
  const total =
    (Number(record.wins) || 0) + (Number(record.losses) || 0) + (Number(record.retreats) || 0);
  return total === 0 && !record.lastBattleAt;
}

export function buildStandoffDeferMessage(companionName = "夥伴") {
  return {
    title: "裂隙還在遠處",
    text: `${companionName}還在觀察你們之間的節奏。先在棲地留下一點痕跡，再一起面對雜訊會比較安心。這不是錯過——只是順序。`
  };
}

function resolveCompanionDisplayName(state) {
  const id = state.activeCompanionId || "";
  if (id.includes("blaze") || id.includes("flame")) return "焰尾";
  if (id.includes("crystal") || id.includes("seahorse") || id.includes("wave")) return "晶鰭";
  if (id.includes("grey") || id.includes("shade")) return "灰影";
  return "夥伴";
}

function buildThreadCopy(kind, companionName) {
  const name = companionName || "夥伴";
  const table = {
    [RESONANCE_THREAD_KINDS.FIRST_TOUCH]: {
      title: `${name}仍在觀察你`,
      body: "先讓牠知道你今天的靠近方式。",
      why: "第一次觸碰會成為往後邊界感的起點。",
      consequence: "牠會記住你有沒有強迫距離。",
      ctaHint: null
    },
    [RESONANCE_THREAD_KINDS.FIRST_SOUL]: {
      title: "想說話時，點開心語",
      body: "一句很輕的話就夠了——不必解釋全部。",
      why: "心語讓牠知道你願意被聽見，也願意聽。",
      consequence: "對話之後，棲地可能留下可見的情緒痕跡。",
      ctaHint: null
    },
    [RESONANCE_THREAD_KINDS.FIRST_TRACE_VISIBLE]: {
      title: "讓這段情緒留下痕跡",
      body: "慢慢說完一輪心語，看看湖邊會亮起什麼。",
      why: "可見痕跡證明系統真的記得——不是數字，是地方。",
      consequence: "月湖會多一道你可以回頭看見的留痕。",
      ctaHint: null
    },
    [RESONANCE_THREAD_KINDS.SAFE_EXPLORE]: {
      title: "帶牠走一段安全的路",
      body: "探索不必戰鬥。先選一個低壓的地方同行。",
      why: "關係也存在於對話之外的世界。",
      consequence: "回來時，棲地或心語裡可能多一句牠記得的事。",
      ctaHint: "explore"
    },
    [RESONANCE_THREAD_KINDS.RETURN_HABITAT_LOOK]: {
      title: "回到棲地，看看留下什麼",
      body: "剛剛的同行若留下痕跡，牠會用自己的方式理解。",
      why: "因果要被看見，才會變成下次回來的理由。",
      consequence: "你可能在湖邊或心語裡讀到一段安靜的後果。",
      ctaHint: null
    },
    [RESONANCE_THREAD_KINDS.SESSION_ENOUGH]: {
      title: "今天已經留下足夠的痕跡",
      body: "你不必繼續做任何事。",
      why: "低壓力包含「停下來也是完整的一局」。",
      consequence: "關係會在安靜裡繼續存在，不會因為離開而責備。",
      ctaHint: null
    }
  };
  const row = table[kind];
  if (!row) return null;
  return { kind, ...row };
}

export function listResonanceThreadPriority() {
  return [...KIND_PRIORITY];
}
