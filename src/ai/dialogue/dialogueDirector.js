/**
 * dialogueDirector.js
 * Minimal, pure seam that chooses the *direction* of one dialogue turn.
 *
 * Scope discipline — this module deliberately owns very little:
 * - It does NOT classify intent. `intentClassifier.js` / `runNluPipeline.js`
 *   remain the sole NLU authority; there is no second keyword→template system.
 * - It does NOT produce final text. It emits a structured dialogue intent for
 *   `nluReplyBuilder.js` / `responseComposer.js` to realise.
 * - It does NOT mutate canonical state, write memory, grant rewards, advance a
 *   quest, open a panel, or bypass any action policy.
 *
 * It exists to fix two felt problems: replies read as templates, and Raphael
 * only ever answers — it never shares what it is doing or offers a refusable
 * next step.
 *
 * Deterministic and side-effect free: no `Math.random()`, no clock, no network,
 * no LLM. The same input always yields the same mode.
 */

import { DIALOGUE_ACTS } from "../nlu/dialogueActClassifier.js";
import { NUANCE_FLAGS } from "../nlu/nuanceDetector.js";
import { listGroundedFields } from "../worldAutonomy/worldObservationGrounding.js";

export const DIALOGUE_MODES = Object.freeze({
  /** 接住玩家，不延伸 */
  FOLLOW: "follow",
  /** 分享 Raphael 當下的觀察或狀態 */
  SHARE: "share",
  /** 給出非強迫性的行動或話題邀請 */
  INVITE: "invite",
  /** 提出一個簡短、相關、非審問式問題 */
  QUESTION: "question",
  /** 只輸出 bodyCue / animationIntent */
  SILENCE: "silence"
});

export const DIALOGUE_DIRECTOR_BLOCKS = Object.freeze({
  SAFETY_TURN: "safety_turn",
  BOUNDARY_TURN: "boundary_turn",
  TOPIC_CLOSED: "topic_closed",
  NO_QUESTIONS_REQUESTED: "no_questions_requested",
  QUESTION_RATE_LIMIT: "question_rate_limit",
  QUESTION_NOT_GROUNDED: "question_not_grounded",
  NO_WORLD_GROUNDING: "no_world_grounding",
  MODE_REPEAT: "mode_repeat"
});

/** A question may not appear if it appeared in either of the last two turns. */
const QUESTION_LOOKBACK = 2;

/**
 * @param {object} params
 * @param {object} params.nlu Output of `runNluPipeline`.
 * @param {object} params.intent Output of `classifyIntent`.
 * @param {object} params.safety Safety evaluation for this turn.
 * @param {object} params.worldGrounding Output of `buildWorldGrounding`.
 * @param {string[]} params.recentModes Most recent first.
 * @param {boolean} params.repeatedReply True when the drafted reply repeats.
 * @param {number} params.seed Deterministic tie-breaker.
 * @returns {{mode: string, reason: string, groundingRefs: string[],
 *   allowQuestion: boolean, allowWorldTopic: boolean, blocks: string[]}}
 */
export function selectDialogueDirection({
  nlu = {},
  intent = {},
  safety = {},
  worldGrounding = null,
  recentModes = [],
  repeatedReply = false,
  seed = 0
} = {}) {
  const frame = nlu?.semanticFrame || {};
  const constraints = toArray(frame.constraints).concat(toArray(nlu?.constraints));
  const nuances = toArray(nlu?.nuances);
  const dialogueAct = String(frame.dialogueAct || nlu?.dialogueAct || "");
  const history = toArray(recentModes).map((mode) => String(mode || ""));
  const lastMode = history[0] || "";
  const groundedFields = listGroundedFields(worldGrounding || {});
  const blocks = [];

  // 1. Safety and boundary turns are never diluted by world chatter.
  const isSafetyTurn = Boolean(safety?.isHighRisk);
  const isBoundaryTurn = Boolean(safety?.isBoundaryPressure)
    || dialogueAct === DIALOGUE_ACTS.DEPENDENCY_PRESSURE
    || dialogueAct === DIALOGUE_ACTS.PRESSURE_COMMAND
    || intent?.intent === "dependency_pressure"
    || intent?.intent === "pressure";

  if (isSafetyTurn || isBoundaryTurn) {
    blocks.push(isSafetyTurn
      ? DIALOGUE_DIRECTOR_BLOCKS.SAFETY_TURN
      : DIALOGUE_DIRECTOR_BLOCKS.BOUNDARY_TURN);
    return result({
      mode: DIALOGUE_MODES.FOLLOW,
      reason: isSafetyTurn ? "safety_turn_follow_only" : "boundary_turn_follow_only",
      groundingRefs: [],
      allowQuestion: false,
      allowWorldTopic: false,
      blocks
    });
  }

  // 2. Player closed the topic → follow or fall silent, nothing else.
  const topicClosed = dialogueAct === DIALOGUE_ACTS.REQUESTING_SILENCE
    || intent?.intent === "silence_request"
    || constraints.includes("quiet_presence")
    || constraints.includes("not_seeking_comfort")
    || nuances.includes(NUANCE_FLAGS.WANTS_QUIET_PRESENCE)
    || nuances.includes(NUANCE_FLAGS.NOT_SEEKING_COMFORT);

  if (topicClosed) {
    blocks.push(DIALOGUE_DIRECTOR_BLOCKS.TOPIC_CLOSED);
    const quietMode = lastMode === DIALOGUE_MODES.FOLLOW
      ? DIALOGUE_MODES.SILENCE
      : DIALOGUE_MODES.FOLLOW;
    return result({
      mode: quietMode,
      reason: "player_closed_topic",
      groundingRefs: [],
      allowQuestion: false,
      allowWorldTopic: false,
      blocks
    });
  }

  // 3. Gate each candidate mode.
  const noQuestionsRequested = constraints.includes("no_questions")
    || nuances.includes(NUANCE_FLAGS.NO_QUESTIONS);
  if (noQuestionsRequested) blocks.push(DIALOGUE_DIRECTOR_BLOCKS.NO_QUESTIONS_REQUESTED);

  const questionRecentlyUsed = history
    .slice(0, QUESTION_LOOKBACK)
    .includes(DIALOGUE_MODES.QUESTION);
  if (questionRecentlyUsed) blocks.push(DIALOGUE_DIRECTOR_BLOCKS.QUESTION_RATE_LIMIT);

  // A question must attach to what the player actually said — never an interrogation.
  const questionHasAnchor = Boolean(
    (frame.topic && frame.topic !== "unknown")
    || (nlu?.topic && nlu.topic !== "unknown")
    || frame.specificDetail?.text
  );
  if (!questionHasAnchor) blocks.push(DIALOGUE_DIRECTOR_BLOCKS.QUESTION_NOT_GROUNDED);

  if (groundedFields.length === 0) blocks.push(DIALOGUE_DIRECTOR_BLOCKS.NO_WORLD_GROUNDING);

  const allowQuestion = !noQuestionsRequested && !questionRecentlyUsed && questionHasAnchor;
  const allowWorldTopic = groundedFields.length > 0;

  const candidates = [];
  if (allowWorldTopic) candidates.push(DIALOGUE_MODES.SHARE);
  if (allowWorldTopic) candidates.push(DIALOGUE_MODES.INVITE);
  if (allowQuestion) candidates.push(DIALOGUE_MODES.QUESTION);
  candidates.push(DIALOGUE_MODES.FOLLOW);

  // 4. Never repeat the previous mode two turns running.
  const fresh = candidates.filter((mode) => mode !== lastMode);
  if (fresh.length < candidates.length) blocks.push(DIALOGUE_DIRECTOR_BLOCKS.MODE_REPEAT);
  const pool = fresh.length ? fresh : [DIALOGUE_MODES.SILENCE];

  // 5. A repeated reply must break the template — prefer a non-follow direction.
  const ordered = repeatedReply
    ? pool.filter((mode) => mode !== DIALOGUE_MODES.FOLLOW).concat(
        pool.filter((mode) => mode === DIALOGUE_MODES.FOLLOW)
      )
    : pool;

  const mode = ordered.length === 1
    ? ordered[0]
    : ordered[normalizeSeed(seed) % ordered.length];

  return result({
    mode,
    reason: resolveReason(mode, repeatedReply),
    // Only fields the world can actually vouch for may be referenced.
    groundingRefs: mode === DIALOGUE_MODES.SHARE || mode === DIALOGUE_MODES.INVITE
      ? groundedFields
      : [],
    allowQuestion,
    allowWorldTopic,
    blocks
  });
}

function resolveReason(mode, repeatedReply) {
  if (repeatedReply) return `repeated_reply_switch_to_${mode}`;
  switch (mode) {
    case DIALOGUE_MODES.SHARE: return "share_current_world_state";
    case DIALOGUE_MODES.INVITE: return "offer_refusable_next_step";
    case DIALOGUE_MODES.QUESTION: return "short_relevant_question";
    case DIALOGUE_MODES.SILENCE: return "no_fresh_direction_stay_quiet";
    default: return "stay_with_player";
  }
}

function result({ mode, reason, groundingRefs, allowQuestion, allowWorldTopic, blocks }) {
  return Object.freeze({
    mode,
    reason,
    groundingRefs: Object.freeze([...groundingRefs]),
    allowQuestion,
    allowWorldTopic,
    blocks: Object.freeze([...blocks])
  });
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSeed(seed) {
  const numeric = Number(seed);
  return Number.isFinite(numeric) ? Math.abs(Math.trunc(numeric)) : 0;
}
