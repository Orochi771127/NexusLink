/**
 * Companion relationship anchors（跨場生活錨點）
 *
 * 與 emotionalMemories（情緒痕跡）雙軌：
 * - Anchors：偏好／近期事件／稱呼 — 有界事實，供輕提與「還記得嗎」短答
 * - Emotional：仍走情緒沉澱；本模組只讀 excerpt 做被問時的溫柔引用
 *
 * 不做 RAG、不讀 transcript journal、不自動訓練。
 */

export const COMPANION_ANCHOR_CAP = 20;
export const COMPANION_ANCHOR_DETAIL_MAX = 48;
export const COMPANION_ANCHOR_LABEL_MAX = 24;

export const ANCHOR_KINDS = Object.freeze({
  PREFERENCE: "preference",
  RECENT_EVENT: "recent_event",
  NAME_OR_CALL: "name_or_call"
});

const RISKY_DETAIL_RE =
  /自殺|輕生|傷害自己|想死|不想活|殺|暴力|不准拒絕|你一定要陪我|依賴你/;

const EXPLICIT_RECALL_ASK_RE =
  /(?:還|还|會|会)?記得|想得起|剛才|剛剛|刚才|刚刚|那杯|那件|那次/;

/**
 * 從玩家輸入抽取 0..N 個錨點候選。
 */
export function extractCompanionAnchors(inputText = "", nlu = {}) {
  const text = String(inputText || "").trim();
  if (!text || text.length < 2) return [];

  const candidates = [];
  const topic = nlu?.topic || nlu?.semanticFrame?.topic || "";

  // name_or_call
  const nameMatch = text.match(
    /(?:我叫|叫我|我的名字是|可以叫我)\s*([^\s，。！？!?,、]{1,12})/
  );
  if (nameMatch?.[1] && !/依賴|永遠|自殺/.test(nameMatch[1])) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.NAME_OR_CALL,
        key: "player_name",
        label: "你的稱呼",
        detail: nameMatch[1].slice(0, 12),
        confidence: 0.9
      })
    );
  }

  // preference: coffee / quiet / music
  if (/咖啡|拿鐵|美式|手沖/.test(text)) {
    const detail = clipDetail(matchSnippet(text, /.{0,8}(?:咖啡|拿鐵|美式|手沖).{0,12}/) || "比較在意咖啡");
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.PREFERENCE,
        key: "coffee",
        label: "咖啡",
        detail,
        confidence: 0.85
      })
    );
  }
  if (/喜歡安靜|比較安靜|不喜歡吵|想安靜/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.PREFERENCE,
        key: "quiet",
        label: "安靜",
        detail: clipDetail(matchSnippet(text, /.{0,10}(?:安靜|吵).{0,10}/) || "比較喜歡安靜"),
        confidence: 0.8
      })
    );
  }
  if (/音樂|歌單|聽歌|耳機/.test(text) && !/依賴/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.PREFERENCE,
        key: "music",
        label: "音樂",
        detail: clipDetail(matchSnippet(text, /.{0,8}(?:音樂|歌單|聽歌|耳機).{0,12}/) || "提過音樂"),
        confidence: 0.75
      })
    );
  }

  // recent_event: overtime / romance hesitation / boss
  if (/加班|做到很晚|加班到/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.RECENT_EVENT,
        key: "overtime",
        label: "加班",
        detail: clipDetail(matchSnippet(text, /.{0,6}(?:加班|做到很晚).{0,16}/) || "加班到很晚"),
        confidence: 0.9
      })
    );
  }
  if (/曖昧|忽冷忽熱|想告白|告白.*怕/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.RECENT_EVENT,
        key: "romance_hesitation",
        label: "感情猶豫",
        detail: clipDetail(
          matchSnippet(text, /.{0,8}(?:曖昧|忽冷忽熱|告白).{0,16}/) || "感情裡有點猶豫"
        ),
        confidence: 0.85
      })
    );
  }
  if (/主管|老闆|老板|當眾/.test(text) && /損|罵|兇|凶|壓力|僵/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.RECENT_EVENT,
        key: "boss_pressure",
        label: "職場壓力",
        detail: clipDetail(matchSnippet(text, /.{0,8}(?:主管|老闆|老板).{0,16}/) || "職場上不太好受"),
        confidence: 0.8
      })
    );
  }

  // topic fallbacks
  if (!candidates.length && topic === "physical_tiredness" && /累|疲|沒力|没力/.test(text)) {
    candidates.push(
      makeCandidate({
        kind: ANCHOR_KINDS.RECENT_EVENT,
        key: "fatigue_spell",
        label: "疲憊",
        detail: clipDetail(matchSnippet(text, /.{0,10}(?:累|疲|沒力|没力).{0,10}/) || "說過很累"),
        confidence: 0.65
      })
    );
  }

  return candidates.filter((item) => item.detail && !RISKY_DETAIL_RE.test(item.detail));
}

/**
 * 合併錨點：同 kind+key 覆寫；cap 20。
 */
export function mergeCompanionAnchors(existing = [], candidates = [], now = Date.now()) {
  const list = Array.isArray(existing)
    ? existing.map((item) => sanitizeCompanionAnchor(item, now)).filter(Boolean)
    : [];
  const byId = new Map(list.map((item) => [`${item.kind}:${item.key}`, item]));

  for (const raw of candidates || []) {
    const next = sanitizeCompanionAnchor(
      {
        ...raw,
        id: raw.id || `anch_${raw.kind}_${raw.key}`,
        createdAt: byId.get(`${raw.kind}:${raw.key}`)?.createdAt || now,
        updatedAt: now
      },
      now
    );
    if (!next) continue;
    byId.set(`${next.kind}:${next.key}`, next);
  }

  return [...byId.values()]
    .sort((a, b) => (Number(a.updatedAt) || 0) - (Number(b.updatedAt) || 0))
    .slice(-COMPANION_ANCHOR_CAP);
}

export function sanitizeCompanionAnchor(anchor, now = Date.now()) {
  if (!anchor || typeof anchor !== "object") return null;
  const kind = String(anchor.kind || "").slice(0, 32);
  const key = String(anchor.key || "").slice(0, 40);
  if (!Object.values(ANCHOR_KINDS).includes(kind) || !key) return null;
  const detail = clipDetail(anchor.detail);
  if (!detail || RISKY_DETAIL_RE.test(detail)) return null;

  return {
    id: String(anchor.id || `anch_${kind}_${key}`).slice(0, 64),
    kind,
    key,
    label: String(anchor.label || key).slice(0, COMPANION_ANCHOR_LABEL_MAX),
    detail,
    softLabel: String(anchor.softLabel || buildSoftLabel(kind, anchor.label || key)).slice(
      0,
      COMPANION_ANCHOR_LABEL_MAX
    ),
    confidence: Number.isFinite(anchor.confidence)
      ? Math.max(0, Math.min(1, anchor.confidence))
      : 0.7,
    createdAt: Number.isFinite(anchor.createdAt) ? anchor.createdAt : now,
    updatedAt: Number.isFinite(anchor.updatedAt) ? anchor.updatedAt : now
  };
}

export function sanitizeCompanionAnchors(list = [], now = Date.now()) {
  return mergeCompanionAnchors([], Array.isArray(list) ? list : [], now);
}

/**
 * 寫入決策：安全／依賴／噪音不寫。
 */
export function buildAnchorDecision({
  inputText = "",
  nlu = {},
  safety = {},
  stateMutation = {},
  gateway = {},
  plan = {}
} = {}) {
  const blockedReasons = new Set([
    "high_risk_safety",
    "dependency_pressure",
    "pressure_command",
    "repeated_spam",
    "noise_or_empty"
  ]);

  if (blockedReasons.has(stateMutation?.reason)) {
    return emptyAnchorDecision(stateMutation.reason);
  }
  if (safety?.isHighRisk || safety?.action === "safety_redirect" || safety?.isBoundaryPressure) {
    return emptyAnchorDecision("safety_or_boundary");
  }
  if (plan?.mode === "withdraw" || plan?.mode === "reject" || plan?.mode === "safety_redirect") {
    return emptyAnchorDecision("boundary_plan");
  }
  if (gateway?.isNoise || gateway?.isEmpty) {
    return emptyAnchorDecision("noise_or_empty");
  }

  const text = String(inputText || gateway?.normalizedInput || "");
  if (/依賴|永遠陪|不准拒絕|傷害自己|想死|自殺/.test(text)) {
    return emptyAnchorDecision("risky_content");
  }

  const candidates = extractCompanionAnchors(text, nlu);
  if (!candidates.length) return emptyAnchorDecision("no_anchor_match");

  return {
    shouldWrite: true,
    reason: "anchor_extracted",
    candidates,
    anchors: candidates
  };
}

function emptyAnchorDecision(reason) {
  return { shouldWrite: false, reason, candidates: [], anchors: [] };
}

/**
 * 跨場回想：先錨點，再情緒 excerpt。
 * @returns {{ detail, softLabel, source, key, kind } | null}
 */
export function findPersistedRecall(inputText = "", { companionAnchors = [], emotionalMemories = [] } = {}) {
  const text = String(inputText || "");
  if (!EXPLICIT_RECALL_ASK_RE.test(text)) return null;

  const keywords = extractRecallKeys(text);
  const anchors = Array.isArray(companionAnchors) ? companionAnchors : [];

  for (let i = anchors.length - 1; i >= 0; i -= 1) {
    const anchor = anchors[i];
    if (!anchor?.detail) continue;
    const hay = `${anchor.label || ""} ${anchor.detail || ""} ${anchor.key || ""}`;
    if (keywords.some((key) => key && hay.includes(key))) {
      return {
        detail: clipDetail(anchor.detail, 24),
        softLabel: anchor.softLabel || anchor.label || anchor.key,
        source: "companion_anchor",
        key: anchor.key,
        kind: anchor.kind
      };
    }
  }

  // 無明確關鍵字但問「還記得」：回最近一筆錨點（避免空答）。
  if (/(?:還|还)?記得|想得起/.test(text) && anchors.length) {
    const latest = anchors[anchors.length - 1];
    if (latest?.detail && !RISKY_DETAIL_RE.test(latest.detail)) {
      return {
        detail: clipDetail(latest.detail, 24),
        softLabel: latest.softLabel || latest.label || latest.key,
        source: "companion_anchor",
        key: latest.key,
        kind: latest.kind
      };
    }
  }

  const emotions = Array.isArray(emotionalMemories) ? emotionalMemories : [];
  for (let i = emotions.length - 1; i >= 0; i -= 1) {
    const memory = emotions[i];
    if (!memory || memory.status === "released" || memory.status === "archived") continue;
    const hay = `${memory.theme || ""} ${memory.label || ""} ${memory.excerpt || ""} ${memory.emotion || ""}`;
    if (keywords.some((key) => key && hay.includes(key))) {
      const detail =
        clipDetail(memory.excerpt, 24) ||
        clipDetail(memory.theme || memory.label || "那段情緒", 24);
      return {
        detail,
        softLabel: memory.theme || memory.label || "那段情緒",
        source: "emotional_memory",
        key: memory.emotion || memory.id,
        kind: "emotional"
      };
    }
  }

  return null;
}

/**
 * 平常對話用的輕提候選（非審問）。
 * skipKey：本場剛提過的 anchor key。
 */
export function retrieveSoftAnchorAllusion(inputText = "", anchors = [], { skipKey = null } = {}) {
  const text = String(inputText || "");
  if (!text || EXPLICIT_RECALL_ASK_RE.test(text)) return null;
  if (/先別問|先别问|不要問|别问|安靜|安静|不想聊/.test(text)) return null;

  const list = Array.isArray(anchors) ? anchors : [];
  const related = list.filter((anchor) => {
    if (!anchor || anchor.key === skipKey) return false;
    return isAnchorRelatedToInput(text, anchor);
  });
  if (!related.length) return null;

  const pick = related[related.length - 1];
  return {
    key: pick.key,
    kind: pick.kind,
    softLabel: pick.softLabel || pick.label || pick.key,
    weaveLine: buildSoftWeaveLine(pick)
  };
}

export function isExplicitRecallAsk(inputText = "") {
  return EXPLICIT_RECALL_ASK_RE.test(String(inputText || ""));
}

function isAnchorRelatedToInput(text, anchor) {
  if (anchor.key === "overtime" && /加班|工作|上班|做到很晚|好累|疲/.test(text)) return true;
  if (anchor.key === "coffee" && /咖啡|喝|提神|那杯/.test(text)) return true;
  if (anchor.key === "romance_hesitation" && /曖昧|他|她|告白|感情|朋友/.test(text)) return true;
  if (anchor.key === "boss_pressure" && /主管|老闆|工作|會議|公司/.test(text)) return true;
  if (anchor.key === "quiet" && /安靜|吵|想靜/.test(text)) return true;
  if (anchor.key === "music" && /音樂|歌|聽/.test(text)) return true;
  if (anchor.key === "fatigue_spell" && /累|疲|沒力|没力/.test(text)) return true;
  if (anchor.key === "player_name" && /名字|叫我|我是誰/.test(text)) return true;
  return false;
}

function buildSoftWeaveLine(anchor) {
  const label = anchor.softLabel || anchor.label || "那件事";
  if (anchor.kind === ANCHOR_KINDS.PREFERENCE) {
    return `你提過比較在意${label}——我還留著`;
  }
  if (anchor.kind === ANCHOR_KINDS.NAME_OR_CALL) {
    return `我記得你說過的稱呼`;
  }
  return `你提過${label}那段——我還留著`;
}

function buildSoftLabel(kind, label) {
  if (kind === ANCHOR_KINDS.PREFERENCE) return String(label || "偏好");
  if (kind === ANCHOR_KINDS.NAME_OR_CALL) return "稱呼";
  return String(label || "近況");
}

function makeCandidate({ kind, key, label, detail, confidence }) {
  return {
    id: `anch_${kind}_${key}`,
    kind,
    key,
    label,
    softLabel: buildSoftLabel(kind, label),
    detail: clipDetail(detail),
    confidence
  };
}

function clipDetail(text, max = COMPANION_ANCHOR_DETAIL_MAX) {
  const trimmed = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!trimmed) return "";
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

function matchSnippet(text, re) {
  const hit = String(text || "").match(re);
  return hit?.[0]?.trim() || "";
}

function extractRecallKeys(text) {
  const keys = [];
  if (/加班/.test(text)) keys.push("加班");
  if (/咖啡|那杯|拿鐵/.test(text)) keys.push("咖啡", "拿鐵");
  if (/累|疲憊|疲惫|沒力|没力/.test(text)) keys.push("累", "疲", "疲憊");
  if (/曖昧|告白|忽冷忽熱/.test(text)) keys.push("曖昧", "告白", "忽冷忽熱");
  if (/主管|老闆|老板/.test(text)) keys.push("主管", "老闆", "老板");
  if (/安靜|吵/.test(text)) keys.push("安靜");
  if (/音樂|歌/.test(text)) keys.push("音樂", "歌");
  if (/名字|叫我|稱呼/.test(text)) keys.push("稱呼", "名字");
  const after = text.match(/(?:記得|想得起)[過过了]?[的]?(.{2,16})/);
  if (after?.[1]) {
    const chunk = after[1].replace(
      /[？?！!。．，,、\s]|嗎|吗|呢|啊|呀|吧|嘛|好不好|可以嗎|可以吗|事嗎|事吗/g,
      ""
    );
    if (chunk.length >= 2) keys.push(chunk.slice(0, 8));
  }
  return [...new Set(keys.filter(Boolean))];
}
