// 共鳴邀請引擎（CH-5b，docs/design/CHAPTER_RESONANCE_ROADMAP_V2.md §5）。
//
// 一句話：通關章節＝取得「詢問資格」，不是解鎖角色；牠依「這一章你們的關係」
// 決定願不願意同行（契約三：你能影響牠，不能支配牠）。
//
// 設計守則（對齊 CLAUDE.md §1 契約 / §2 紅線）：
//   - 只讀關係狀態：這一章的 bond/trust 增量、邊界尊重（連拍被拒次數）、章內對峙
//     是否把牠推到 overwhelmed。**絕不**讀 lastSeenAt / 上線頻率 / 離線時長 / 孤獨
//     或依賴推斷（紅線 1）——這些欄位即使在 state 上，本檔也不得引用。
//   - Pack 2：bond/trust/blocked 必須取「該章目標 companionId」權威，不得用 active mirror
//     讓 Companion A 的羈絆解鎖 Companion B。
//   - 拒絕＝rolling window：被拒後重新快照（見 mapController），「還不是時候」永遠
//     可再培養後再問，絕不永久鎖死（紅線 2 精神）。
//   - 不顯示數字、不做進度條、不做「差幾點」提示、不做倒數（紅線 6）。
//
// 純函數：零 DOM、零 store。狀態寫入（相遇快照 / 加入 / 拒絕重快照）由 mapController 做。

import { getChapterByNumber } from "../data/chapterRegistry.js";
import { getChapterNarrative } from "../data/chapterNarrative.js";
import { resolveRelationshipForJudgment } from "../state/relationshipAuthorityGuard.js";

// 願意閾值（集中常數，方便調參）。這一章的關係增量要夠、邊界沒被連拍過量踐踏、
// 章內對峙沒把牠推到勉強撐住。
export const RESONANCE_WILLING = Object.freeze({
  affinityGain: 6, // (bond 增量 + trust 增量) >=
  maxBlockedTouch: 2, // 章內連拍被拒次數 <=
  maxOverwhelmed: 0 // 章內對峙 overwhelmed_but_safe 次數 <=
});

// 拒絕的方向句（依主因擇一，不含任何數字）。願意句為每章夥伴專屬，取自 chapterNarrative。
export const DECLINE_LINES = Object.freeze({
  boundary: "你有點急著靠近。慢一點，我會自己走過來。",
  overwhelmed: "上次裂隙那裡，我撐得有點勉強。再陪我穩一些日子。",
  early: "我們才剛認識。多走幾段路，再問我一次。"
});

const WILLING_FALLBACK_LINE = "牠安靜地走到你身邊，決定和你們一起走。";

/**
 * 該章實際相遇／邀請的 companionId。
 * Pack 4：優先讀 chapterMarks.resolvedCompanionId；fallback 事件回 null。
 * 無 state 時退回 registry preferred（舊 harness／資料查詢相容）。
 */
export function getChapterCompanionId(chapterNo, state = null) {
  const no = Number(chapterNo);
  if (state && typeof state === "object") {
    const mark = state.resonance?.chapterMarks?.[no];
    if (mark?.resolvedCompanionId) return mark.resolvedCompanionId;
    if (mark?.fallbackEventId) return null;
  }
  return getChapterByNumber(no)?.companionId || null;
}

/**
 * 是否有「詢問資格」：該章已通關 + 已相遇該章夥伴 + 尚未加入。
 * @returns {{ eligible: boolean, companionId: string|null }}
 */
export function canAskResonance(state = {}, chapterNo) {
  const companionId = getChapterCompanionId(chapterNo, state);
  if (!companionId) return { eligible: false, companionId: null };
  const completed = Array.isArray(state?.chapterProgress?.completed) ? state.chapterProgress.completed : [];
  const entry = state?.resonance?.companions?.[companionId] || {};
  const eligible = completed.includes(Number(chapterNo)) && Boolean(entry.metAt) && !entry.joinedAt;
  return { eligible, companionId };
}

/** 掃出所有「可詢問」的章節（升冪）——UI 一次處理一個，從最早的章開始。 */
export function listAskableChapters(state = {}) {
  const askable = [];
  for (let chapterNo = 2; chapterNo <= 7; chapterNo += 1) {
    if (canAskResonance(state, chapterNo).eligible) askable.push(chapterNo);
  }
  return askable;
}

/**
 * 判定牠這一章願不願意同行。
 * Pack 2 Phase 1：bond/trust/blocked 一律取「該章目標 companionId」的關係權威。
 * Pack 4：companionId 來自 resolver 寫入的 resolvedCompanionId（若有）。
 * @returns {{ companionId: string, willing: boolean, cause: string|null, line: string }|null}
 */
export function evaluateResonanceInvite(state = {}, chapterNo) {
  const companionId = getChapterCompanionId(chapterNo, state);
  if (!companionId) return null;

  const mark = state?.resonance?.chapterMarks?.[chapterNo] || {};
  // Pack 2.5：判定必須走 judgment 入口，禁止直接讀頂層 bond/trust。
  const rel = resolveRelationshipForJudgment(state, companionId);
  const bondNow = num(rel.bond, 0);
  const trustNow = num(rel.trust, 0);
  const blockedNow = num(rel.blockedTouchCount, 0);

  // 缺快照時以現值兜底 → 增量為 0（保守：只會判「還不是時候」，絕不誤判為願意）。
  const bondDelta = bondNow - num(mark.bondAtStart, bondNow);
  const trustDelta = trustNow - num(mark.trustAtStart, trustNow);
  const blockedDelta = blockedNow - num(mark.blockedTouchAtStart, blockedNow);
  const overwhelmed = num(mark.overwhelmedCount, 0);

  let cause = null;
  if (blockedDelta > RESONANCE_WILLING.maxBlockedTouch) cause = "boundary";
  else if (overwhelmed > RESONANCE_WILLING.maxOverwhelmed) cause = "overwhelmed";
  else if (bondDelta + trustDelta < RESONANCE_WILLING.affinityGain) cause = "early";

  const willing = cause === null;
  const preferredId = getChapterByNumber(chapterNo)?.companionId || null;
  const narrative = getChapterNarrative(chapterNo);
  // 備援相遇者沒有專屬願意句——用中性 fallback，避免叫錯名字。
  const line = willing
    ? (companionId === preferredId ? narrative?.willingLine : null) || WILLING_FALLBACK_LINE
    : DECLINE_LINES[cause];

  return { companionId, willing, cause, line };
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
