/**
 * Heartcore Orbit V3 lifecycle bridge.
 *
 * RaphaelCore may answer two bounded questions outside the simulation:
 * 1. Is the companion willing to enter this session?
 * 2. What does the companion say after the deterministic outcome exists?
 *
 * It never receives a mutable Orbit session, confirmed launch plan, body,
 * collision event, objective reducer, settlement plan, or replay transcript.
 */

import { runRaphaelCore } from "../ai/raphaelCore.js";
import { SOUL_TALK_REACTIONS } from "../ai/reactionPlanner.js";

const ENTRY_PROMPT =
  "我想和你一起進入月湖的心核迴旋。你可以拒絕、先休息，或保持自己的節奏。";

const OUTCOME_PROMPTS = Object.freeze({
  stabilized: "我們剛從月湖心核迴旋回來，這一輪把雜訊放輕並穩住了軌道。你怎麼看？",
  recovered: "我們剛從月湖心核迴旋回來，這一輪接住了一段微光。你怎麼看？",
  retreated: "我們剛從月湖心核迴旋先退回來。離開沒有帶來任何懲罰。你怎麼看？",
  overwhelmed_but_safe:
    "我們剛從月湖心核迴旋安全回來。化身已安全解聚，沒有人被擊敗。你怎麼看？"
});

const BLOCKING_REACTIONS = new Set([
  SOUL_TALK_REACTIONS.REJECT,
  SOUL_TALK_REACTIONS.WITHDRAW,
  SOUL_TALK_REACTIONS.SAFETY_REDIRECT
]);

const FORBIDDEN_ORBIT_REPLY =
  /(?:HP|ATK|DPS|傷害|暴擊|擊敗夥伴|殺死|戰利品|掉落|服從率|你害我|都是你的錯)/i;

export const ORBIT_COMPANION_BRIDGE_STATUS = Object.freeze({
  version: "orbit-companion-bridge-v1",
  participation: Object.freeze([
    "pre_session_willingness",
    "post_session_reflection"
  ]),
  simulationAuthority: "orbitEngine",
  coreInSimulationLoop: false,
  coreMayWriteState: false,
  coreMayWriteMemory: false,
  coreMayWriteReplay: false,
  coreMayChangeOutcome: false
});

function finite(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

/** Private memories and player-authored text never enter the Orbit bridge. */
export function projectOrbitCoreState(state = {}, companionId = "default") {
  return Object.freeze({
    activeCompanionId: String(companionId || state.activeCompanionId || "default"),
    mood: String(state.mood || "calm"),
    energy: finite(state.energy, 10),
    trust: finite(state.trust, 0),
    bond: finite(state.bond, 0),
    defense: finite(state.defense, 0),
    touchFatigue: finite(state.touchFatigue, 0),
    spamScore: finite(state.spamScore, 0),
    safeHarborMode: state.safeHarborMode === true,
    lastMessage: "",
    chatHistory: Object.freeze([]),
    emotionalMemories: Object.freeze([]),
    habitatTraces: Object.freeze([]),
    companionAnchors: Object.freeze([])
  });
}

function coreReplyCandidate(coreResult) {
  const reply = String(coreResult?.output?.reply || coreResult?.reply || "").trim();
  const valid =
    coreResult?.invocation?.readOnly === true &&
    coreResult?.invocation?.simulationAuthority === false &&
    coreResult?.safety?.isHighRisk !== true &&
    coreResult?.forbiddenPhraseDetected !== true &&
    coreResult?.output?.replyRole !== "system" &&
    coreResult?.output?.shouldSpeak !== false &&
    reply.length > 0 &&
    reply.length <= 120 &&
    !FORBIDDEN_ORBIT_REPLY.test(reply);
  return valid ? reply : "";
}

function voiceStyle(coreResult = {}) {
  const sentenceStyle = String(coreResult?.persona?.sentenceStyle || "");
  if (sentenceStyle === "warm_direct") return "warm";
  if (sentenceStyle === "short_quiet") return "quiet";
  return "steady";
}

function entryAdapterLine(coreResult, { willing, decision, fallback }) {
  const direct = coreReplyCandidate(coreResult);
  if (direct && /進場|軌道|同行|一起|拒絕|休息|今天|這一輪/.test(direct)) {
    return { line: direct, source: "raphael_core_read_only" };
  }
  if (!willing) {
    const line = decision === "rest"
      ? String(fallback || "我想先休息。這次留白也沒有關係。").trim()
      : "今天我不進場。不是懲罰，只是我想守住現在的界線。";
    return { line, source: "raphael_core_lifecycle_adapter" };
  }
  if (decision === "rewrite") {
    return {
      line: "我願意，但想照剛才那條可見改軌走。確認前再一起看一次。",
      source: "raphael_core_lifecycle_adapter"
    };
  }
  const lines = {
    quiet: "我願意。先照看得見的軌道走，不用替我決定。",
    warm: "好，我想一起進場；軌道先說清楚，我也會守住自己的節奏。",
    steady: "可以同行。先把軌道定清楚，再一起出發。"
  };
  return {
    line: lines[voiceStyle(coreResult)],
    source: "raphael_core_lifecycle_adapter"
  };
}

function settlementAdapterLine(coreResult, outcomeKey, fallback) {
  const direct = coreReplyCandidate(coreResult);
  if (direct && /這一輪|軌道|化身|微光|光|回來|退|休息|穩住|雜訊|共鳴/.test(direct)) {
    return { line: direct, source: "raphael_core_read_only" };
  }
  const style = voiceStyle(coreResult);
  const packs = {
    stabilized: {
      quiet: "轉穩了。我想先記住我們沒有硬推過去。",
      warm: "穩住了！但先別急著追下一輪，讓節奏沉一下。",
      steady: "軌道穩住了。這次是一起調回來的，不是誰壓過了誰。"
    },
    recovered: {
      quiet: "那點光有接住。現在先讓它安靜一會兒。",
      warm: "接住了！那點光先留著，我們不用立刻再證明一次。",
      steady: "微光回來了。先把這一輪收好，再決定下一次。"
    },
    retreated: {
      quiet: "先回來是我也同意的。軌道還在，不用急著證明什麼。",
      warm: "回來就好。下一次要不要再走，由我們到時候一起決定。",
      steady: "這次先退是共同決定，不是失敗。軌道不會因此關上。"
    },
    overwhelmed_but_safe: {
      quiet: "化身散了，但我還在。這一輪先到這裡。",
      warm: "化身散開了，可是我們都回來了。先喘口氣。",
      steady: "共鳴沒有撐到最後，但安全退回來了。先休息，不扣下任何東西。"
    }
  };
  return {
    line: packs[outcomeKey]?.[style] || String(fallback || "").trim(),
    source: "raphael_core_lifecycle_adapter"
  };
}

function invokeWithTimeout(invokeCore, input, state, runtime, timeoutMs) {
  const timeout = Math.max(1, finite(timeoutMs, 750));
  return new Promise((resolve, reject) => {
    const timer = globalThis.setTimeout(
      () => reject(new Error("orbit_core_timeout")),
      timeout
    );
    Promise.resolve()
      .then(() => invokeCore(input, state, runtime))
      .then(
        (value) => {
          globalThis.clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          globalThis.clearTimeout(timer);
          reject(error);
        }
      );
  });
}

function coreRuntime({ companion, now, surface }) {
  return {
    now,
    idSuffix: "orb",
    companion,
    repeated: false,
    readOnly: true,
    surface,
    debugTrace: false,
    companionPreferenceProfile: Object.freeze({})
  };
}

/**
 * Resolve willingness before a session exists. A deterministic safety/rest
 * refusal cannot be promoted by Core. A Core refusal may downgrade an
 * otherwise legal entry. Core failure also fails closed with zero writes.
 */
export async function prepareOrbitCompanionEntry({
  state = {},
  companion = null,
  attunement = null,
  now = Date.now(),
  timeoutMs = 750,
  invokeCore = runRaphaelCore
} = {}) {
  const deterministicAllowed = attunement?.canStart === true;
  const fallbackLine =
    attunement?.response || "這次先不進場。沒有任何東西因此被扣走。";

  if (state.safeHarborMode === true) {
    return Object.freeze({
      phase: "entry",
      status: "blocked_safety",
      willing: false,
      decision: "refuse",
      line: fallbackLine,
      source: "deterministic_safety_gate",
      coreReaction: SOUL_TALK_REACTIONS.SAFETY_REDIRECT,
      authority: ORBIT_COMPANION_BRIDGE_STATUS
    });
  }

  const coreState = projectOrbitCoreState(state, companion?.id);
  let coreResult;
  try {
    coreResult = await invokeWithTimeout(
      invokeCore,
      ENTRY_PROMPT,
      coreState,
      coreRuntime({ companion, now, surface: "orbit_entry" }),
      timeoutMs
    );
  } catch (error) {
    return Object.freeze({
      phase: "entry",
      status: "core_unavailable",
      willing: false,
      decision: deterministicAllowed ? "refuse" : attunement?.decision || "refuse",
      line: deterministicAllowed
        ? "心智同步沒有完成。這次先不進場，也不會失去任何東西。"
        : fallbackLine,
      source: "fail_closed",
      coreReaction: null,
      errorCode: String(error?.message || "orbit_core_unavailable"),
      authority: ORBIT_COMPANION_BRIDGE_STATUS
    });
  }

  const coreReaction = String(coreResult?.plan?.mode || "");
  const coreBlocked =
    BLOCKING_REACTIONS.has(coreReaction) ||
    coreResult?.safety?.isHighRisk === true;
  const willing = deterministicAllowed && !coreBlocked;
  const decision = willing
    ? attunement?.decision || "accept"
    : deterministicAllowed
      ? "refuse"
      : attunement?.decision || "refuse";
  const voiced = entryAdapterLine(coreResult, {
    willing,
    decision,
    fallback: fallbackLine
  });

  return Object.freeze({
    phase: "entry",
    status: willing
      ? "willing"
      : deterministicAllowed
        ? "core_declined"
        : `deterministic_${attunement?.decision || "refuse"}`,
    willing,
    decision,
    line: voiced.line || fallbackLine,
    source: voiced.source,
    coreReaction,
    ignoredCoreWrites: Object.freeze({
      stateMutation: Boolean(coreResult?.stateMutation),
      memoryDecision: Boolean(coreResult?.memoryDecision),
      traceDecision: Boolean(coreResult?.traceDecision),
      anchorDecision: Boolean(coreResult?.anchorDecision)
    }),
    authority: ORBIT_COMPANION_BRIDGE_STATUS
  });
}

/** Whitelist the only deterministic result facts that Core may see. */
export function createOrbitSettlementEnvelope(session = {}) {
  const outcomeKey = String(session?.outcome?.key || "overwhelmed_but_safe");
  return Object.freeze({
    schemaVersion: 1,
    stageId: String(session.stageId || "unknown"),
    outcomeKey: OUTCOME_PROMPTS[outcomeKey]
      ? outcomeKey
      : "overwhelmed_but_safe",
    outcomeReason: String(session?.outcome?.reason || "unknown"),
    retreated: outcomeKey === "retreated",
    prototypeSlice: session.prototypeSlice === true,
    progressEligible: session.progressEligible === true,
    simulationAuthority: "orbitEngine"
  });
}

/**
 * Ask for one post-result line. The returned object is presentation-only and
 * cannot replace or mutate the deterministic session/outcome/replay object.
 */
export async function prepareOrbitSettlementReflection({
  state = {},
  companion = null,
  session = null,
  now = Date.now(),
  timeoutMs = 750,
  invokeCore = runRaphaelCore
} = {}) {
  const envelope = createOrbitSettlementEnvelope(session);
  const fallbackLine =
    session?.companionLine || "這一輪結束了。我們先讓心核安靜下來。";
  const coreState = projectOrbitCoreState(state, companion?.id);
  const prompt = OUTCOME_PROMPTS[envelope.outcomeKey];

  try {
    const coreResult = await invokeWithTimeout(
      invokeCore,
      prompt,
      coreState,
      coreRuntime({ companion, now, surface: "orbit_settlement" }),
      timeoutMs
    );
    const voiced = settlementAdapterLine(
      coreResult,
      envelope.outcomeKey,
      fallbackLine
    );
    return Object.freeze({
      phase: "settlement",
      status: voiced.source.startsWith("raphael_core_") ? "reflected" : "fallback",
      line: voiced.line || fallbackLine,
      source: voiced.source,
      envelope,
      coreReaction: String(coreResult?.plan?.mode || ""),
      authority: ORBIT_COMPANION_BRIDGE_STATUS
    });
  } catch (error) {
    return Object.freeze({
      phase: "settlement",
      status: "core_unavailable",
      line: fallbackLine,
      source: "deterministic_fallback",
      envelope,
      coreReaction: null,
      errorCode: String(error?.message || "orbit_core_unavailable"),
      authority: ORBIT_COMPANION_BRIDGE_STATUS
    });
  }
}
