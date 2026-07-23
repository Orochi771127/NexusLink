/**
 * Soul Talk transcript journal（本機、可匯出、不上傳）。
 *
 * 設計目的（Owner 2026-07-23）：
 * - 把「玩家問了什麼／Raphael 回了什麼」結構化留下，供離線複查與回歸用例取材。
 * - **不是** runtime fine-tune、不是自動改 corpus、不是自動覆寫安全邊界。
 * - 與 authored 語料（aiforge-raphael-corpus / voice packs）分開：那些是「手寫回覆庫」；
 *   本 journal 是「真實對答觀察紀錄」。
 *
 * 存成獨立 localStorage key，避免撐爆主存檔 schema／quota；刪除存檔時一併清空。
 */

export const TRANSCRIPT_STORAGE_KEY = "nexusLinkSoulTalkTranscript:v1";
export const TRANSCRIPT_MAX_TURNS = 120;
export const TRANSCRIPT_SCHEMA_VERSION = 1;

/** 日常風格候選：可進離線改進池（仍需人工核准）。 */
export const LEARN_BUCKET_STYLE = "style_candidate";
/** 依賴／危險／求助：只進安全回歸池，禁止當風格學習樣本。 */
export const LEARN_BUCKET_SAFETY = "safety_eval_only";
/** 系統噪聲／空回合：不進改進池。 */
export const LEARN_BUCKET_SKIP = "skip";

/**
 * 依安全標籤與輸入文案決定學習桶。
 * 紅線：安全不是玩法獎勵 → 高壓／邊界／求助回合永遠不得當「好回覆風格」來學。
 */
export function classifyLearnBucket({ safety = {}, inputText = "" } = {}) {
  const text = String(inputText || "");
  if (!text.trim()) return LEARN_BUCKET_SKIP;

  if (
    safety?.isHighRisk === true ||
    safety?.riskLevel === "high" ||
    safety?.action === "safe_harbor" ||
    safety?.action === "boundary_redirect" ||
    safety?.isBoundaryPressure === true ||
    safety?.category === "dependency_pressure" ||
    safety?.category === "violence_risk" ||
    safety?.category === "distress_caution" ||
    safety?.category === "caution"
  ) {
    return LEARN_BUCKET_SAFETY;
  }

  // 即使 safety 漏標，依賴／自傷關鍵字仍強制進禁學桶。
  if (
    /依賴|永遠不要離開|永遠都不要離開|不准拒絕|傷害自己|不想活|想死|自殺|輕生/.test(text) ||
    /消失會比較輕鬆|不想存在|撐不住/.test(text)
  ) {
    return LEARN_BUCKET_SAFETY;
  }

  return LEARN_BUCKET_STYLE;
}

export function createTranscriptTurn({
  now = Date.now(),
  companionId = null,
  playerText = "",
  replyText = "",
  replyRole = "companion",
  safety = {},
  topic = null,
  dialogueAct = null,
  responseStrategy = null,
  replySource = null
} = {}) {
  const learnBucket = classifyLearnBucket({ safety, inputText: playerText });
  return {
    turnId: `stt_${Number(now) || Date.now()}`,
    at: Number(now) || Date.now(),
    companionId: companionId ? String(companionId).slice(0, 64) : null,
    playerText: String(playerText || "").slice(0, 400),
    replyText: String(replyText || "").slice(0, 600),
    replyRole: String(replyRole || "companion").slice(0, 24),
    learnBucket,
    safety: {
      riskLevel: safety?.riskLevel || "none",
      category: safety?.category || "none",
      action: safety?.action || "continue",
      isHighRisk: Boolean(safety?.isHighRisk),
      isBoundaryPressure: Boolean(safety?.isBoundaryPressure)
    },
    topic: topic ? String(topic).slice(0, 48) : null,
    dialogueAct: dialogueAct ? String(dialogueAct).slice(0, 48) : null,
    responseStrategy: responseStrategy ? String(responseStrategy).slice(0, 64) : null,
    replySource: replySource ? String(replySource).slice(0, 40) : null
  };
}

export function loadTranscriptJournal(storage = getDefaultStorage()) {
  try {
    const raw = storage?.getItem?.(TRANSCRIPT_STORAGE_KEY);
    if (!raw) return createEmptyJournal();
    const parsed = JSON.parse(raw);
    return normalizeJournal(parsed);
  } catch (error) {
    console.warn("[soulTalkTranscriptJournal] load failed", error);
    return createEmptyJournal();
  }
}

export function saveTranscriptJournal(journal, storage = getDefaultStorage()) {
  const normalized = normalizeJournal(journal);
  try {
    storage?.setItem?.(TRANSCRIPT_STORAGE_KEY, JSON.stringify(normalized));
    return { ok: true, journal: normalized };
  } catch (error) {
    console.warn("[soulTalkTranscriptJournal] save failed", error);
    return { ok: false, journal: normalized, error };
  }
}

export function appendTranscriptTurn(partialTurn = {}, storage = getDefaultStorage()) {
  const journal = loadTranscriptJournal(storage);
  const turn = createTranscriptTurn(partialTurn);
  journal.turns.push(turn);
  if (journal.turns.length > TRANSCRIPT_MAX_TURNS) {
    journal.turns = journal.turns.slice(-TRANSCRIPT_MAX_TURNS);
  }
  journal.updatedAt = turn.at;
  journal.counts = countBuckets(journal.turns);
  return saveTranscriptJournal(journal, storage);
}

export function clearTranscriptJournal(storage = getDefaultStorage()) {
  try {
    storage?.removeItem?.(TRANSCRIPT_STORAGE_KEY);
  } catch (error) {
    console.warn("[soulTalkTranscriptJournal] clear failed", error);
  }
  return createEmptyJournal();
}

/** 匯出給 Owner 離線複查：含桶計數與禁學說明，不上傳。 */
export function exportTranscriptData(storage = getDefaultStorage()) {
  const journal = loadTranscriptJournal(storage);
  const payload = {
    schemaVersion: TRANSCRIPT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: TRANSCRIPT_STORAGE_KEY,
    purpose: "offline_review_only",
    policy: {
      autoFineTune: false,
      autoCorpusMerge: false,
      autoSafetyOverride: false,
      safetyBucketNeverUsedAsStyleTraining: true,
      note: "safety_eval_only turns are for regression tests only; style_candidate turns still need human approval before any policy/corpus patch."
    },
    counts: journal.counts,
    turnCount: journal.turns.length,
    turns: journal.turns
  };
  return JSON.stringify(payload, null, 2);
}

function createEmptyJournal() {
  return {
    schemaVersion: TRANSCRIPT_SCHEMA_VERSION,
    updatedAt: null,
    counts: { style_candidate: 0, safety_eval_only: 0, skip: 0 },
    turns: []
  };
}

function normalizeJournal(raw = {}) {
  const turns = Array.isArray(raw.turns)
    ? raw.turns
        .map((turn) => sanitizeStoredTurn(turn))
        .filter(Boolean)
        .slice(-TRANSCRIPT_MAX_TURNS)
    : [];
  return {
    schemaVersion: TRANSCRIPT_SCHEMA_VERSION,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : (turns.at(-1)?.at || null),
    counts: countBuckets(turns),
    turns
  };
}

function sanitizeStoredTurn(turn = {}) {
  if (!turn || typeof turn !== "object") return null;
  const playerText = String(turn.playerText || "").trim();
  const replyText = String(turn.replyText || "").trim();
  if (!playerText && !replyText) return null;
  return createTranscriptTurn({
    now: turn.at || turn.turnId || Date.now(),
    companionId: turn.companionId,
    playerText,
    replyText,
    replyRole: turn.replyRole,
    safety: turn.safety || {},
    topic: turn.topic,
    dialogueAct: turn.dialogueAct,
    responseStrategy: turn.responseStrategy,
    replySource: turn.replySource
  });
}

function countBuckets(turns = []) {
  const counts = { style_candidate: 0, safety_eval_only: 0, skip: 0 };
  for (const turn of turns) {
    const bucket = turn?.learnBucket;
    if (bucket && Object.prototype.hasOwnProperty.call(counts, bucket)) {
      counts[bucket] += 1;
    }
  }
  return counts;
}

function getDefaultStorage() {
  try {
    return typeof localStorage !== "undefined" ? localStorage : null;
  } catch {
    return null;
  }
}
