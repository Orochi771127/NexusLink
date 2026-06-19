import { getTouchMotionState } from "../engine/touchReactionEngine.js";
import { getAmbientWalkAnimation, getMoodIdleAnimationName } from "../engine/animationProfile.js";
import EventBus from "../utils/eventBus.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
const AMBIENT_WALK_STATE = "ambient_walk";
const AMBIENT_COOLDOWN_MIN_MS = 60_000;
const AMBIENT_COOLDOWN_MAX_MS = 180_000;
const AMBIENT_DURATION_MIN_MS = 1_200;
const AMBIENT_DURATION_MAX_MS = 2_500;
const AMBIENT_RANGE_X = 60;
const AMBIENT_RANGE_Y = 15;
const TOUCH_ACCEPT_ENVIRONMENT_EVENT_PROGRESS = 0.5;

export function createCompanionMotion(companion, initialMood) {
  const motion = {
    state: getIdleMotionState(initialMood, companion.__animationProfile),
    temporaryState: null,
    temporaryStartedAt: 0,
    temporaryUntil: 0,
    temporaryResolve: null,
    temporaryEnvironmentEventEmitted: false,
    ambientState: null,
    ambientStartedAt: 0,
    ambientUntil: 0,
    ambientNextAt: 0,
    ambientFromOffsetX: 0,
    ambientFromOffsetY: 0,
    ambientTargetOffsetX: 0,
    ambientTargetOffsetY: 0,
    baseX: companion.x,
    baseY: companion.y,
    baseScale: companion.scale.x || 1,
    baseAlpha: companion.alpha,
    baseRotation: companion.rotation || 0,
    devForcedState: null,
    devForcedUntil: 0,
    fallbackMotionActive: true,
    getAnimationDurationMs: (animationName) => companion.__animationController?.getAnimationDurationMs(animationName),
    getAnimationController: () => companion.__animationController || null
  };
  scheduleNextAmbientWalk(motion, performance.now(), initialMood);
  return motion;
}

export function getIdleMotionState(mood, profile) {
  return getMoodIdleAnimationName(mood, profile);
}

export function triggerCompanionTouchMotion(motion, interactionResult = {}) {
  if (!motion) return Promise.resolve();

  const touchState = interactionResult.motionState || getTouchMotionState(interactionResult.reaction);
  resolveTemporaryMotion(motion);
  stopAmbientWalk(motion);
  motion.temporaryState = touchState;
  motion.temporaryStartedAt = performance.now();
  motion.temporaryUntil = motion.temporaryStartedAt + getMotionDurationMs(motion, touchState, 850);
  motion.temporaryEnvironmentEventEmitted = false;
  return new Promise((resolve) => {
    motion.temporaryResolve = resolve;
  });
}

export function playDevMotion(motion, motionState) {
  if (!motion || !motionState) return;
  const now = performance.now();
  if (motionState === AMBIENT_WALK_STATE) {
    startAmbientWalk(motion, "calm", now, { forced: true });
    return;
  }
  if (motionState.startsWith("touch_")) {
    stopAmbientWalk(motion);
    motion.temporaryState = motionState;
    motion.temporaryStartedAt = now;
    motion.temporaryUntil = now + getMotionDurationMs(motion, motionState, 950);
    motion.temporaryEnvironmentEventEmitted = false;
    return;
  }
  motion.devForcedState = motionState;
  motion.devForcedUntil = now + (motionState === "blink" ? getMotionDurationMs(motion, motionState, 700) : 3000);
}

export function updateCompanionMotion(companion, motion, timeSeconds, nowMs, mood, onStateChange = () => {}, options = {}) {
  if (companion.__interactionController?.isAnimationLocked?.()) {
    stopAmbientWalk(motion);
    motion.temporaryState = null;
    motion.devForcedState = null;
    motion.fallbackMotionActive = false;
    onStateChange(companion.__animationController?.getCurrentAnimationName?.() || motion.state);
    return;
  }

  motion.state = getIdleMotionState(mood, companion.__animationProfile);
  if (motion.temporaryState && nowMs >= motion.temporaryUntil) {
    motion.temporaryState = null;
    motion.temporaryStartedAt = 0;
    motion.temporaryUntil = 0;
    resolveTemporaryMotion(motion);
  }
  if (motion.devForcedState && nowMs >= motion.devForcedUntil) {
    motion.devForcedState = null;
    motion.devForcedUntil = 0;
  }

  const canAmbientWalk = options.canAmbientWalk !== false;
  const isBattleActive = Boolean(options.isBattleActive);
  const isSleeping = Boolean(options.isSleeping);
  const isAmbientBlocked = !canAmbientWalk || Boolean(motion.temporaryState) || isBattleActive || isSleeping || mood === "tired" || companion.__animationProfile?.ambientWalkEnabled === false;

  if (motion.ambientState && (isAmbientBlocked || nowMs >= motion.ambientUntil)) {
    stopAmbientWalk(motion);
    scheduleNextAmbientWalk(motion, nowMs, mood);
  }
  if (!motion.ambientState && !motion.devForcedState && !isAmbientBlocked && nowMs >= motion.ambientNextAt) {
    maybeStartAmbientWalk(motion, mood, nowMs);
  }

  const ambientAnimation = motion.ambientState
    ? getAmbientWalkAnimation(motion.ambientTargetOffsetX, (name) => companion.__animationController?.hasAnimation?.(name))
    : null;
  const activeState = motion.temporaryState ||
    (isBattleActive ? "battle" : null) ||
    (isSleeping ? "sleep" : null) ||
    motion.devForcedState ||
    ambientAnimation?.animationName ||
    motion.state;
  const animationController = companion.__animationController;
  let spriteAnimationPlayed = false;
  if (animationController?.hasAnimation?.(activeState)) {
    spriteAnimationPlayed = animationController.play(activeState, {
      mood,
      mirrorX: Boolean(ambientAnimation?.mirrorX)
    });
  } else {
    animationController?.loadAnimation?.(activeState).catch((error) => {
      console.warn(`Companion motion lazy load failed: ${activeState}`, error);
    });
  }
  const transform = motion.temporaryState
    ? getTemporaryMotionTransform(activeState, motion, nowMs)
    : motion.ambientState
      ? getAmbientWalkTransform(motion, nowMs)
      : getIdleMotionTransform(activeState, timeSeconds);

  companion.x = motion.baseX + transform.offsetX;
  companion.y = motion.baseY + transform.offsetY;
  companion.scale.set(motion.baseScale * transform.scaleMultiplier);
  companion.alpha = motion.baseAlpha * transform.alphaMultiplier;
  companion.rotation = motion.baseRotation + transform.rotation;
  maybeEmitTemporaryEnvironmentInteraction(activeState, motion, companion, nowMs);
  motion.fallbackMotionActive = !spriteAnimationPlayed;
  onStateChange(activeState);
}

function getMotionDurationMs(motion, motionState, fallbackDurationMs) {
  return motion?.getAnimationDurationMs?.(motionState) || fallbackDurationMs;
}

function resolveTemporaryMotion(motion) {
  if (!motion?.temporaryResolve) return;
  const resolve = motion.temporaryResolve;
  motion.temporaryResolve = null;
  resolve();
}

function maybeEmitTemporaryEnvironmentInteraction(activeState, motion, companion, nowMs) {
  if (
    activeState !== "touch_accept" ||
    !motion.temporaryState ||
    motion.temporaryEnvironmentEventEmitted
  ) {
    return;
  }

  if (getTemporaryMotionProgress(motion, nowMs) < TOUCH_ACCEPT_ENVIRONMENT_EVENT_PROGRESS) {
    return;
  }

  motion.temporaryEnvironmentEventEmitted = true;
  EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, {
    type: "crystal_touch",
    color: "#00CED1",
    x: companion.x,
    y: companion.y
  });
}

function getTemporaryMotionProgress(motion, nowMs) {
  const duration = Math.max(1, motion.temporaryUntil - motion.temporaryStartedAt);
  return Math.min(1, Math.max(0, (nowMs - motion.temporaryStartedAt) / duration));
}

function scheduleNextAmbientWalk(motion, nowMs, mood) {
  if (mood === "tired") {
    motion.ambientNextAt = Number.POSITIVE_INFINITY;
    return;
  }
  motion.ambientNextAt = nowMs + randomBetween(AMBIENT_COOLDOWN_MIN_MS, AMBIENT_COOLDOWN_MAX_MS);
}

function maybeStartAmbientWalk(motion, mood, nowMs) {
  const moodPolicy = getAmbientMoodPolicy(mood);
  if (moodPolicy.chance <= 0 || Math.random() > moodPolicy.chance) {
    scheduleNextAmbientWalk(motion, nowMs, mood);
    return;
  }
  startAmbientWalk(motion, mood, nowMs);
}

function startAmbientWalk(motion, mood, nowMs, { forced = false } = {}) {
  const moodPolicy = getAmbientMoodPolicy(mood);
  if (!forced && moodPolicy.chance <= 0) {
    scheduleNextAmbientWalk(motion, nowMs, mood);
    return;
  }

  motion.ambientState = AMBIENT_WALK_STATE;
  motion.ambientStartedAt = nowMs;
  motion.ambientUntil = nowMs + randomBetween(AMBIENT_DURATION_MIN_MS, AMBIENT_DURATION_MAX_MS);
  motion.ambientFromOffsetX = 0;
  motion.ambientFromOffsetY = 0;
  motion.ambientTargetOffsetX = randomBetween(-AMBIENT_RANGE_X, AMBIENT_RANGE_X) * moodPolicy.rangeMultiplier;
  motion.ambientTargetOffsetY = randomBetween(-AMBIENT_RANGE_Y, AMBIENT_RANGE_Y) * moodPolicy.rangeMultiplier;
}

function stopAmbientWalk(motion) {
  motion.ambientState = null;
  motion.ambientStartedAt = 0;
  motion.ambientUntil = 0;
  motion.ambientFromOffsetX = 0;
  motion.ambientFromOffsetY = 0;
  motion.ambientTargetOffsetX = 0;
  motion.ambientTargetOffsetY = 0;
}

function getAmbientMoodPolicy(mood) {
  const policies = {
    calm: { chance: 0.45, rangeMultiplier: 1 },
    happy: { chance: 0.65, rangeMultiplier: 1 },
    warm: { chance: 0.65, rangeMultiplier: 1 },
    defensive: { chance: 0.08, rangeMultiplier: 0.65 },
    distant: { chance: 0.18, rangeMultiplier: 0.55 },
    sad: { chance: 0.18, rangeMultiplier: 0.55 },
    tired: { chance: 0, rangeMultiplier: 0 }
  };
  return policies[mood] || policies.calm;
}

function getAmbientWalkTransform(motion, nowMs) {
  const duration = Math.max(1, motion.ambientUntil - motion.ambientStartedAt);
  const progress = Math.min(1, Math.max(0, (nowMs - motion.ambientStartedAt) / duration));
  const easedProgress = easeInOutSine(progress);
  const returnProgress = Math.sin(progress * Math.PI);
  return {
    offsetX: motion.ambientFromOffsetX + (motion.ambientTargetOffsetX - motion.ambientFromOffsetX) * returnProgress,
    offsetY: motion.ambientFromOffsetY + (motion.ambientTargetOffsetY - motion.ambientFromOffsetY) * returnProgress - 1.5 * easedProgress,
    scaleMultiplier: 1,
    alphaMultiplier: 1,
    rotation: 0.006 * Math.sin(easedProgress * Math.PI * 2)
  };
}

function easeInOutSine(value) {
  return -(Math.cos(Math.PI * value) - 1) / 2;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function getIdleMotionTransform(motionState, timeSeconds) {
  if (motionState === "idle_defensive") {
    const breath = Math.sin(timeSeconds * 1.7);
    return {
      offsetX: 0,
      offsetY: 2 + breath * 1.6,
      scaleMultiplier: 0.985 + breath * 0.004,
      alphaMultiplier: 1,
      rotation: 0
    };
  }

  if (motionState === "idle_distant") {
    const breath = Math.sin(timeSeconds * 0.9);
    return {
      offsetX: 0,
      offsetY: -5 + breath * 1.05,
      scaleMultiplier: 0.955 + breath * 0.0025,
      alphaMultiplier: 0.9,
      rotation: 0
    };
  }

  const breath = Math.sin(timeSeconds * 1.55);
  return {
    offsetX: 0,
    offsetY: breath * 2.5,
    scaleMultiplier: 1 + breath * 0.007,
    alphaMultiplier: 1,
    rotation: 0
  };
}

function getTemporaryMotionTransform(motionState, motion, nowMs) {
  const progress = getTemporaryMotionProgress(motion, nowMs);
  const pulse = Math.sin(progress * Math.PI);
  const settle = 1 - progress;

  if (motionState === "touch_accept") {
    const relaxedReturn = Math.sin(Math.min(1, progress * 0.82) * Math.PI);
    return {
      offsetX: 0,
      offsetY: -7 * relaxedReturn + 1 * settle,
      scaleMultiplier: 1 + 0.018 * relaxedReturn,
      alphaMultiplier: 1,
      rotation: 0.007 * Math.sin(progress * Math.PI * 1.5)
    };
  }

  if (motionState === "touch_reject") {
    const shake = Math.sin(progress * Math.PI * 8) * settle;
    const flicker = progress < 0.55 ? Math.sin(progress * Math.PI * 12) * 0.035 : 0;
    return {
      offsetX: -6 * pulse + 1.6 * shake,
      offsetY: 5 * pulse + 2 * settle,
      scaleMultiplier: 0.97 - 0.01 * pulse,
      alphaMultiplier: 0.96 + flicker,
      rotation: -0.012 * pulse + 0.004 * shake
    };
  }

  const pause = progress < 0.28 ? 1 : settle;
  return {
    offsetX: -2.5 * pulse,
    offsetY: 2.5 * pulse + 1.5 * pause,
    scaleMultiplier: 0.986 + 0.004 * pulse,
    alphaMultiplier: 1,
    rotation: -0.004 * pulse
  };
}
