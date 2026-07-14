/**
 * RE-3 TASK_PACK #1：遠征結算結果事件（受限 schema）。
 *
 * 設計理念：
 * - 結算先變成可驗證的「事件」，再餵給 bridge／gateway／未來 intent adapter。
 * - 事件只帶事實與候選記憶，不帶第三人稱 journal 給 companion 通道。
 * - 這不是完整 RaphaelCore 整合；intent 僅 stub，禁止標 coreIntegrated。
 */

export const EXPEDITION_RESULT_EVENT_VERSION = 1;
export const EXPEDITION_RESULT_EVENT_KIND = "expedition_result";

/**
 * 從 session + settlement 組出結果事件（純資料、可單元測試）。
 */
export function buildExpeditionResultEvent(session = {}, settlement = {}, { now = Date.now() } = {}) {
  const companionId = session.companionId || null;
  const kills = Number(session?.stats?.kills) || 0;
  const visited = Array.isArray(session?.visitedExplorePoints)
    ? session.visitedExplorePoints.length
    : 0;
  const memoryEvents = Array.isArray(session?.triggeredMemoryEvents)
    ? session.triggeredMemoryEvents.length
    : 0;
  const bondGain = Number(settlement?.bondGain) || 0;
  const trustGain = Number(settlement?.trustGain) || 0;
  const retreated = Boolean(settlement?.retreated || session?.playerRetreatRequested);
  const returnHome = Boolean(session?.returnHomeRequested);

  // 紅線旗標：供 QA／未來 reducer 稽核（不是改玩法）
  const redLines = {
    /** 僅擊殺／無共同發現卻加薪 — 現行 settlement 不應出現 */
    eFarmSuspicious: kills > 0 && (bondGain > 0 || trustGain > 0) && memoryEvents === 0 && visited === 0,
    /** 事件本身從不擋出口 */
    eExitBlocked: false,
    /** 是否帶了不該進 companion 的 journal 欄位 */
    hasJournalForCompanion: Boolean(settlement?.journal && typeof settlement.journal === "string")
  };

  const heart = session?.heart && typeof session.heart === "object"
    ? {
        fatigue: Number(session.heart.fatigue) || 0,
        stress: Number(session.heart.stress) || 0,
        feltSafety: Number(session.heart.feltSafety) || 0,
        curiosityDrive: Number(session.heart.curiosityDrive) || 0,
        interventionPressure: Number(session.heart.interventionPressure) || 0
      }
    : null;

  return {
    version: EXPEDITION_RESULT_EVENT_VERSION,
    kind: EXPEDITION_RESULT_EVENT_KIND,
    eventId: `exp_result_${now}_${companionId || "unknown"}`,
    at: now,
    companionId,
    regionId: session.regionId || session.nodeId || null,
    facts: {
      retreated,
      returnHome,
      kills,
      visitedExplorePoints: visited,
      memoryEvents,
      bondGain,
      trustGain,
      lootSummary: { ...(settlement?.lootSummary || {}) }
    },
    heart,
    redLines,
    /** 候選記憶；寫入前必須再過 expedition memory gateway */
    memoryCandidates: Array.isArray(settlement?.memoryObjects)
      ? settlement.memoryObjects.slice()
      : [],
    /**
     * intent stub：可追蹤 id／kind，尚未接正式 agent intent classifier。
     * authority 標明不是玩家心語字串。
     */
    intentStub: {
      intentId: `exp_intent_${now}`,
      kind: "expedition_settlement_reflection",
      authority: "expedition_event",
      wired: false
    }
  };
}

/**
 * 驗證事件形狀（fail-closed：缺關鍵欄位 → ok:false）。
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function validateExpeditionResultEvent(event) {
  const errors = [];
  if (!event || typeof event !== "object") {
    return { ok: false, errors: ["not_an_object"] };
  }
  if (event.kind !== EXPEDITION_RESULT_EVENT_KIND) {
    errors.push("bad_kind");
  }
  if (Number(event.version) !== EXPEDITION_RESULT_EVENT_VERSION) {
    errors.push("bad_version");
  }
  if (!event.eventId || typeof event.eventId !== "string") {
    errors.push("missing_event_id");
  }
  if (!event.facts || typeof event.facts !== "object") {
    errors.push("missing_facts");
  }
  if (!event.intentStub || event.intentStub.authority !== "expedition_event") {
    errors.push("bad_intent_stub");
  }
  if (!Array.isArray(event.memoryCandidates)) {
    errors.push("memory_candidates_not_array");
  }
  // 禁止事件把 journal 標成可直接發佈的 companion 語料
  if (event.companionJournal != null) {
    errors.push("forbidden_companion_journal_field");
  }
  return { ok: errors.length === 0, errors };
}
