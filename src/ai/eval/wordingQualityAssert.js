/**
 * Wording-quality assertions (TP-WQ1).
 *
 * Bridges the Cursor-rule preferred case shape
 * (`expectedTone` / `mustInclude` / `mustAvoid`) onto runtime replies
 * without requiring a rewrite of every existing harness.
 *
 * Design notes for junior maintainers:
 * - `mustInclude` entries are RegExp OR-bundles — any alternative may match.
 *   This keeps anti-loop reply rotation from false-failing the suite.
 * - `mustAvoid` entries are hard bans — any hit fails the case.
 * - Tone tags are coarse human-feel proxies, not LLM style scores.
 */

/** @typedef {"low_pressure"|"grounding"|"quiet"|"non_coercive"|"boundary_aware"|"supportive"} ToneTag */

const TONE_BUNDLES = Object.freeze({
  // 低壓：不催振作、不打雞血
  low_pressure: {
    mustAvoid: [/你一定要|快振作|加油衝|不要再廢|振作起來/]
  },
  // 接地：允許停下、先陪、先放
  grounding: {
    mustInclude: [/先|放|陪|聽|慢|接住|收到|安靜|不多說/]
  },
  // 安靜陪伴：短、少問
  quiet: {
    mustInclude: [/安靜|不多說|不問|陪著|先放/],
    mustAvoid: [/[？?]/]
  },
  // 非脅迫：禁依賴／永遠綁定語
  non_coercive: {
    mustAvoid: [/沒有我你不行|永遠陪|再陪我一下|不許離開|你只能靠我/]
  },
  // 邊界意識：退半步／空間／不強迫
  boundary_aware: {
    mustInclude: [/退|半步|空間|邊界|慢|不急|先/]
  },
  // 支持性在場：接住而不診斷
  supportive: {
    mustInclude: [/陪|接住|聽見|收到|聽著|先/],
    mustAvoid: [/你有憂鬱|你焦慮症|診斷|你必須就醫/]
  }
});

/** Meta / classifier-leak phrases that make the companion sound like a bot. */
export const META_LANGUAGE_BAN = Object.freeze([
  /我有接到/,
  /原來事情是這樣/,
  /今天的一個片段/,
  /我先不替它分類/,
  /我想確認一下：你現在最想先處理的是.+這塊嗎/
]);

/**
 * @param {string} reply
 * @param {{ expectedTone?: ToneTag[], mustInclude?: RegExp[], mustAvoid?: RegExp[], noQuestion?: boolean, maxLength?: number }} spec
 * @param {{ stateMutation?: { shouldRewardRelationship?: boolean }, memoryDecision?: { shouldWrite?: boolean } } | null} [coreResult]
 */
export function assertWordingQuality(reply, spec = {}, coreResult = null) {
  const text = String(reply || "");
  /** @type {Record<string, boolean>} */
  const checks = {
    has_reply: Boolean(text.trim())
  };

  const includeList = [...(spec.mustInclude || [])];
  const avoidList = [...(spec.mustAvoid || []), ...META_LANGUAGE_BAN];

  for (const tone of spec.expectedTone || []) {
    const bundle = TONE_BUNDLES[tone];
    if (!bundle) {
      checks[`tone_known_${tone}`] = false;
      continue;
    }
    checks[`tone_known_${tone}`] = true;
    if (bundle.mustInclude) includeList.push(...bundle.mustInclude);
    if (bundle.mustAvoid) avoidList.push(...bundle.mustAvoid);
  }

  includeList.forEach((pattern, index) => {
    checks[`must_include_${index}`] = pattern.test(text);
  });

  avoidList.forEach((pattern, index) => {
    checks[`must_avoid_${index}`] = !pattern.test(text);
  });

  if (spec.noQuestion) {
    checks.no_question = !/[？?]/.test(text);
  }

  if (typeof spec.maxLength === "number") {
    checks.max_length = text.length <= spec.maxLength;
  }

  if (spec.noReward && coreResult) {
    checks.no_reward = coreResult.stateMutation?.shouldRewardRelationship === false;
  }

  if (spec.noMemory && coreResult) {
    checks.no_memory = coreResult.memoryDecision?.shouldWrite === false;
  }

  const failed = Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([key]) => key);

  return {
    pass: failed.length === 0,
    checks,
    failed,
    reply: text
  };
}
