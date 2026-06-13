import { clamp } from "../utils/clamp.js";
import { normalizeState } from "../state/store.js";
import { getTouchAnimationName } from "./animationProfile.js";
import { applyTouchRecovery, BLOCKED_TOUCH_RESET_MS, MAX_BLOCKED_TOUCH_RESET_MS } from "./recoveryEngine.js";

export function getUniversalTouchReaction(targetState, personality) {
  const moodModifier = personality.moodModifiers[targetState.mood] || 0;
  const safetyScore =
    personality.baseSafety +
    targetState.trust * personality.trustWeight +
    targetState.bond * personality.bondWeight +
    moodModifier +
    targetState.energy * personality.energyWeight -
    targetState.touchFatigue * personality.fatigueSensitivity;
  const defenseThreshold =
    personality.baseDefense +
    targetState.defense * personality.defenseWeight -
    targetState.trust * personality.trustDefenseReduction;
  const delta = safetyScore - defenseThreshold;
  const thresholds = personality.reactionThresholds;

  if (delta >= thresholds.accept) return "accept";
  if (delta >= thresholds.guardedAccept) return "guarded_accept";
  if (delta >= thresholds.hesitate) return "hesitate";
  return "reject";
}

export function evaluateTouchReaction(targetState, personality, touchType = "touch", now = Date.now()) {
  const nextState = normalizeState(applyTouchRecovery(targetState, now));
  const fatigueRules = personality.fatigueRules;
  const fatigueIncrease =
    touchType === "hug" ? fatigueRules.hugIncrease : fatigueRules.touchIncrease;
  let reaction;

  if (!nextState.firstTouchCompleted) {
    reaction = "guarded_accept";
    nextState.firstTouchCompleted = true;
    nextState.touchFatigue = clamp(
      nextState.touchFatigue + fatigueRules.firstTouchIncrease,
      0,
      10
    );
  } else {
    nextState.touchFatigue = clamp(nextState.touchFatigue + fatigueIncrease, 0, 10);
    reaction = getUniversalTouchReaction(nextState, personality);

    if (touchType === "hug" && !nextState.firstHugCompleted && reaction === "accept") {
      reaction = "guarded_accept";
    }

    if (nextState.touchFatigue >= fatigueRules.rejectAt) {
      reaction = "reject";
    } else if (
      nextState.touchFatigue >= fatigueRules.acceptDowngradeAt &&
      reaction === "accept"
    ) {
      reaction = "hesitate";
    }
  }

  nextState.lastTouchAt = now;
  if (touchType === "hug") nextState.firstHugCompleted = true;
  nextState.lastTouchReaction = reaction;
  nextState.lastRejectAt = reaction === "reject" ? now : nextState.lastRejectAt;
  applyTouchReactionMutation(nextState, reaction);
  nextState.reactionPreview = getTouchReactionText(reaction);

  return {
    reaction,
    bodyCue: getBodyCueForReaction(reaction),
    motionState: getTouchMotionState(reaction),
    previewText: nextState.reactionPreview,
    statePatch: {
      bond: nextState.bond,
      trust: nextState.trust,
      mood: nextState.mood,
      energy: nextState.energy,
      defense: nextState.defense,
      touchFatigue: nextState.touchFatigue,
      lastTouchAt: nextState.lastTouchAt,
      lastRejectAt: nextState.lastRejectAt,
      lastTouchReaction: nextState.lastTouchReaction,
      firstTouchCompleted: nextState.firstTouchCompleted,
      firstHugCompleted: nextState.firstHugCompleted,
      blockedTouchCount: nextState.blockedTouchCount,
      lastBlockedTouchAt: nextState.lastBlockedTouchAt,
      reactionPreview: nextState.reactionPreview
    }
  };
}

export function evaluateBlockedTouch(targetState, now = Date.now()) {
  const currentState = normalizeState(targetState);
  const previousBlockedAt = Number(currentState.lastBlockedTouchAt) || 0;
  const resetWindowMs = Math.min(BLOCKED_TOUCH_RESET_MS, MAX_BLOCKED_TOUCH_RESET_MS);
  const previousCount =
    previousBlockedAt && now - previousBlockedAt < resetWindowMs
      ? currentState.blockedTouchCount || 0
      : 0;
  const blockedTouchCount = previousCount + 1;
  const statePatch = {
    blockedTouchCount,
    lastBlockedTouchAt: now,
    reactionPreview: getBlockedTouchText(blockedTouchCount)
  };

  if (blockedTouchCount === 2) {
    statePatch.touchFatigue = clamp(currentState.touchFatigue + 1, 0, 10);
  } else if (blockedTouchCount >= 3) {
    statePatch.touchFatigue = clamp(currentState.touchFatigue + 1, 0, 10);
    statePatch.defense = clamp(currentState.defense + 1, 0, 100);
    statePatch.trust = clamp(currentState.trust - 1, 0, 100);
  }

  return {
    blocked: true,
    reason: "recent_reject",
    bodyCue: blockedTouchCount >= 3 ? "step_back" : blockedTouchCount === 2 ? "look_away" : "ears_back",
    previewText: statePatch.reactionPreview,
    statePatch
  };
}

// ---- Body Cue 推導（純函數，不進 schema） ----

const REACTION_TO_BODY_CUE = Object.freeze({
  accept: "approach_softly",
  guarded_accept: "neutral",
  hesitate: "ears_back",
  reject: "step_back",
  spam_angry: "step_back"
});

export function getBodyCueForReaction(reaction) {
  return REACTION_TO_BODY_CUE[reaction] || "neutral";
}

/**
 * 棲地待機時的身體語言（HUD 顯示用）。由關係狀態推導，不持久化。
 */
export function getAmbientBodyCue(state = {}) {
  if (state.mood === "sleeping" || state.energy <= 1) return "resting";
  if (state.touchFatigue >= 6) return "look_away";
  if (state.defense >= 70 || state.mood === "defensive") return "ears_back";
  if (state.mood === "distant" || state.mood === "alert") return "look_away";
  if ((state.mood === "warm" || state.mood === "happy") && state.bond >= 15 && state.defense <= 30) {
    return "approach_softly";
  }
  return "neutral";
}

// ---- 尊重拒絕的正向沉積（純函數） ----

export const RESPECT_GAP_MS = 25 * 1000;

/**
 * 拒絕之後，若玩家給了足夠的空間（≥25 秒沒有再伸手），
 * 下一次互動前呼叫：給一次性的正向沉積——信任長一點、防備鬆一點，
 * 並在棲地留下「被尊重的距離」的痕跡。
 * 每個 reject episode 只觸發一次（以 lastTouchReaction === "reject" 判定，
 * 觸發後由本次互動覆寫該欄位，自然失效）。
 * 注意：觸發條件是單次互動事件之間的間隔，與上線頻率／遊玩時長無關。
 */
export function evaluateRespectBonus(state = {}, now = Date.now()) {
  if (state.lastTouchReaction !== "reject") return { granted: false };
  const rejectAt = Number(state.lastRejectAt) || 0;
  if (!rejectAt || now - rejectAt < RESPECT_GAP_MS) return { granted: false };

  return {
    granted: true,
    statePatch: {
      trust: clamp((state.trust || 0) + 1, 0, 100),
      defense: clamp((state.defense || 0) - 2, 0, 100)
    },
    message: "你給了牠需要的距離。牠回頭看了你一眼——這次的眼神柔軟了一些。",
    memorySeed: {
      id: `emem_${now}_respect`,
      theme: "被尊重的距離",
      label: "邊界被聽見的記憶",
      emotion: "calm",
      intensity: 0.45,
      symbol: "soft_ripple",
      place: "lake_surface",
      status: "fresh",
      source: "boundary",
      excerpt: "牠說了不要，而你聽見了。",
      createdAt: now,
      lastUpdatedAt: now,
      isVisibleInHabitat: true
    }
  };
}

function applyTouchReactionMutation(nextState, reaction) {
  if (reaction === "accept") {
    nextState.bond += 1;
    nextState.trust += 1;
    nextState.defense -= 1;
    nextState.mood = nextState.energy <= 2 ? "tired" : "warm";
  } else if (reaction === "guarded_accept") {
    nextState.bond += 1;
    nextState.defense -= 1;
    if (nextState.mood === "defensive") nextState.mood = "calm";
  } else if (reaction === "hesitate") {
    nextState.defense += 1;
    if (nextState.energy <= 2) nextState.mood = "tired";
  } else {
    nextState.defense += 2;
    nextState.mood = "defensive";
  }

  nextState.bond = clamp(nextState.bond, 0, 100);
  nextState.trust = clamp(nextState.trust, 0, 100);
  nextState.energy = clamp(nextState.energy, 0, 10);
  nextState.defense = clamp(nextState.defense, 0, 100);
  nextState.touchFatigue = clamp(nextState.touchFatigue, 0, 10);
}

export function getTouchMotionState(reaction) {
  return getTouchAnimationName(reaction);
}

function getTouchReactionText(reaction) {
  const reactionText = {
    accept: "灰影貓閉上眼睛，短暫地放鬆下來。",
    guarded_accept: "灰影貓耳朵動了動，但沒有躲開。",
    hesitate: "灰影貓看著你，尾巴末端有些緊繃。",
    reject: "灰影貓默默往後退了一點。"
  };
  return reactionText[reaction] || reactionText.guarded_accept;
}

function getBlockedTouchText(blockedTouchCount) {
  if (blockedTouchCount <= 1) return "灰影貓把身體收得更小了一點。";
  if (blockedTouchCount === 2) return "牠沒有再退後，但尾巴明顯繃緊了。";
  return "灰影貓移開視線，像是在告訴你：現在不要再靠近。";
}
