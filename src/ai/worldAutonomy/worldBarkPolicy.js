/**
 * worldBarkPolicy.js
 * Budget and eligibility gate for World Autonomy barks.
 *
 * Sibling of `src/ai/autonomy/initiativeCooldown.js` (ambient initiative). Same
 * spirit, separate numbers: 主動必須稀少、可忽略、永不變成打擾。
 * Pure function — reads only the beat record passed in. It does NOT read
 * chatHistory and does NOT read any player online/offline information (紅線 1),
 * and it exposes no daily quota or streak (紅線 6).
 *
 * 100% local. No network, no LLM, no persistence.
 */

/** Bark categories. Only these may become text; everything else is body-cue only. */
export const WORLD_BARK_CATEGORIES = Object.freeze({
  /** 玩家需要理解夥伴正在做什麼 */
  STATUS: "status",
  /** 夥伴發現新物件、資源或環境變化 / 行動揭示可互動目標 */
  DISCOVERY: "discovery",
  /** 非強制性的下一步提示（邀請，不是命令） */
  HINT: "hint",
  /** 行動失敗，需要讓玩家知道原因 */
  FAILURE: "failure",
  /** 具敘事或關係價值的時刻 */
  MOMENT: "moment"
});

const TEXT_ELIGIBLE_CATEGORIES = new Set(Object.values(WORLD_BARK_CATEGORIES));

export const WORLD_BARK_LIMITS = Object.freeze({
  /** 開機後先安靜：讓玩家自己安頓，牠不搶開場。 */
  BOOT_QUIET_MS: 60_000,
  /** 兩次一般文字 Bark 至少隔 150 秒。 */
  MIN_INTERVAL_MS: 150_000,
  /** 一個 session 最多 4 次文字 Bark；再多就是碎念機。 */
  SESSION_CAP: 4,
  /** 其中最多 2 次可以帶 gameplay hint。 */
  HINT_CAP: 2,
  /** 玩家剛互動過的寬限窗：這段時間內改用地板間隔。 */
  INTERACTION_GRACE_MS: 20_000,
  /** 寬限期間仍然存在的最低間隔——寬限不得變成洗版。 */
  GRACE_FLOOR_MS: 30_000,
  /** 文字長度：8–24 個中文字，最多兩句。 */
  MIN_CHARS: 8,
  MAX_CHARS: 24,
  MAX_SENTENCES: 2
});

export const WORLD_BARK_BLOCK_REASONS = Object.freeze({
  safety_quiet: Object.freeze({
    id: "safety_quiet",
    zh: "安全靜默中，先不出聲",
    en: "Safety quiet — no bark for now"
  }),
  boot_quiet: Object.freeze({
    id: "boot_quiet",
    zh: "開場安靜中，先讓你安頓",
    en: "Boot quiet — settling in first"
  }),
  session_cap: Object.freeze({
    id: "session_cap",
    zh: "這一輪說得夠多了",
    en: "Session bark budget spent"
  }),
  hint_cap: Object.freeze({
    id: "hint_cap",
    zh: "提示這一輪給夠了",
    en: "Hint budget spent"
  }),
  bark_interval: Object.freeze({
    id: "bark_interval",
    zh: "剛剛才說過，再等一會兒",
    en: "Waiting out the bark interval"
  }),
  duplicate_bark: Object.freeze({
    id: "duplicate_bark",
    zh: "同一句剛說過，不重複",
    en: "Same line said recently"
  }),
  not_text_eligible: Object.freeze({
    id: "not_text_eligible",
    zh: "這個動作只用身體語言",
    en: "Body language only for this action"
  }),
  drive_unavailable: Object.freeze({
    id: "drive_unavailable",
    zh: "沒有可靠的世界資料可講",
    en: "No reliable world signal to speak about"
  })
});

/**
 * Evaluate whether a text bark of `category` may be spoken right now.
 * Everything is caller-held session data — this function stores nothing.
 */
export function evaluateWorldBarkBudget({
  now = Date.now(),
  bootAt = 0,
  lastBarkAt = 0,
  barksThisSession = 0,
  hintBarksThisSession = 0,
  safeUnstable = false,
  lastPlayerInteractionAt = 0,
  recentBarkKeys = [],
  candidateKeys = [],
  category = null,
  driveAvailable = true
} = {}) {
  const used = toCount(barksThisSession);
  const hintUsed = toCount(hintBarksThisSession);
  const resolvedNow = toTime(now, Date.now());
  const boot = toTime(bootAt, 0);
  const lastBark = toTime(lastBarkAt, 0);
  const lastInteraction = toTime(lastPlayerInteractionAt, 0);

  const graceActive = lastInteraction > 0
    && resolvedNow - lastInteraction >= 0
    && resolvedNow - lastInteraction < WORLD_BARK_LIMITS.INTERACTION_GRACE_MS;
  // 玩家剛互動 → 放寬一般間隔，但地板間隔與 session 上限照舊（不得連續洗版）。
  const requiredInterval = graceActive
    ? WORLD_BARK_LIMITS.GRACE_FLOOR_MS
    : WORLD_BARK_LIMITS.MIN_INTERVAL_MS;

  const blocks = [];

  if (safeUnstable) blocks.push("safety_quiet");
  if (!category || !TEXT_ELIGIBLE_CATEGORIES.has(category)) blocks.push("not_text_eligible");
  if (!driveAvailable) blocks.push("drive_unavailable");
  if (boot && resolvedNow - boot < WORLD_BARK_LIMITS.BOOT_QUIET_MS) blocks.push("boot_quiet");
  if (used >= WORLD_BARK_LIMITS.SESSION_CAP) blocks.push("session_cap");
  if (category === WORLD_BARK_CATEGORIES.HINT && hintUsed >= WORLD_BARK_LIMITS.HINT_CAP) {
    blocks.push("hint_cap");
  }
  if (lastBark && resolvedNow - lastBark < requiredInterval) blocks.push("bark_interval");

  const fresh = selectFreshKeys(candidateKeys, recentBarkKeys);
  if (candidateKeys.length > 0 && fresh.length === 0) blocks.push("duplicate_bark");

  const candidates = [];
  if (boot && resolvedNow - boot < WORLD_BARK_LIMITS.BOOT_QUIET_MS) {
    candidates.push(boot + WORLD_BARK_LIMITS.BOOT_QUIET_MS);
  }
  if (lastBark && resolvedNow - lastBark < requiredInterval) {
    candidates.push(lastBark + requiredInterval);
  }

  return Object.freeze({
    allowed: blocks.length === 0,
    blocks: Object.freeze([...blocks]),
    blockReasons: Object.freeze(
      blocks.map((id) => WORLD_BARK_BLOCK_REASONS[id] || Object.freeze({ id, zh: id, en: id }))
    ),
    freshKeys: Object.freeze([...fresh]),
    graceActive,
    requiredInterval,
    sessionCap: WORLD_BARK_LIMITS.SESSION_CAP,
    used,
    remaining: Math.max(0, WORLD_BARK_LIMITS.SESSION_CAP - used),
    hintCap: WORLD_BARK_LIMITS.HINT_CAP,
    hintUsed,
    hintRemaining: Math.max(0, WORLD_BARK_LIMITS.HINT_CAP - hintUsed),
    limits: WORLD_BARK_LIMITS,
    // session_cap / hint_cap / safety_quiet 沒有「等一下就恢復」的時間點。
    nextEligibleAt: candidates.length ? Math.max(...candidates) : null,
    // 明確契約：預算是 session 內的稀少感，不是日課／打卡／連續登入。
    persistence: "session_only",
    dailyCap: null
  });
}

/**
 * Shape check for an authored bark line: 8–24 chars, at most two sentences.
 * Used by QA and by any future authoring tool; the runtime never generates text.
 */
export function isWithinBarkShape(text = "") {
  const trimmed = String(text || "").trim();
  if (!trimmed) return false;
  const length = [...trimmed].length;
  if (length < WORLD_BARK_LIMITS.MIN_CHARS || length > WORLD_BARK_LIMITS.MAX_CHARS) return false;
  const sentences = trimmed.split(/[。！？!?]/).map((part) => part.trim()).filter(Boolean);
  return sentences.length <= WORLD_BARK_LIMITS.MAX_SENTENCES;
}

function selectFreshKeys(candidateKeys, recentBarkKeys) {
  const recent = new Set(
    (Array.isArray(recentBarkKeys) ? recentBarkKeys : []).map((key) => String(key || ""))
  );
  return (Array.isArray(candidateKeys) ? candidateKeys : [])
    .map((key) => String(key || ""))
    .filter((key) => key && !recent.has(key));
}

function toCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
}

function toTime(value, fallback) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}
