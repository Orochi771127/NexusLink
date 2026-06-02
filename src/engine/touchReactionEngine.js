import { clamp } from "../utils/clamp.js";
import { normalizeState } from "../state/store.js";

export function getUniversalTouchReaction(targetState, personality) {
  const moodModifiers = {
    calm: 10,
    happy: 20,
    warm: 15,
    sad: -10,
    defensive: -25,
    distant: -15,
    tired: -12
  };
  const moodModifier = moodModifiers[targetState.mood] || 0;
  const baseSafety = 30;
  const safetyScore =
    baseSafety +
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

  if (delta >= 25) return "accept";
  if (delta >= 0) return "guarded_accept";
  if (delta >= -20) return "hesitate";
  return "reject";
}

export function evaluateTouchReaction(targetState, personality, touchType = "touch") {
  const nextState = normalizeState(targetState);
  const now = Date.now();
  const fatigueIncrease = touchType === "hug" ? 1.5 : 1;
  let reaction;

  if (!nextState.firstTouchCompleted) {
    reaction = "guarded_accept";
    nextState.firstTouchCompleted = true;
    nextState.touchFatigue = clamp(nextState.touchFatigue + 0.5, 0, 10);
  } else {
    nextState.touchFatigue = clamp(nextState.touchFatigue + fatigueIncrease, 0, 10);
    reaction = getUniversalTouchReaction(nextState, personality);

    if (nextState.touchFatigue >= 8) {
      reaction = "reject";
    } else if (nextState.touchFatigue >= 6 && reaction === "accept") {
      reaction = "hesitate";
    }
  }

  nextState.lastTouchAt = now;
  nextState.lastTouchReaction = reaction;
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
      lastTouchReaction: nextState.lastTouchReaction,
      firstTouchCompleted: nextState.firstTouchCompleted,
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
  const reactionToMotion = {
    accept: "touch_accept",
    guarded_accept: "touch_guarded",
    hesitate: "touch_guarded",
    reject: "touch_reject"
  };
  return reactionToMotion[reaction] || "touch_guarded";
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
