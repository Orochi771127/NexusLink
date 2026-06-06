import { clamp } from "../utils/clamp.js";
import { normalizeState } from "../state/store.js";
import { getTouchAnimationName } from "./animationProfile.js";

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

export function evaluateTouchReaction(targetState, personality, touchType = "touch") {
  const nextState = normalizeState(targetState);
  const now = Date.now();
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
      reactionPreview: nextState.reactionPreview
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
