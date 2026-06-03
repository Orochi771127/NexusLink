import { getTouchMotionState } from "../engine/touchReactionEngine.js";

export function createCompanionMotion(companion, initialMood) {
  return {
    state: getIdleMotionState(initialMood),
    temporaryState: null,
    temporaryStartedAt: 0,
    temporaryUntil: 0,
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
}

export function getIdleMotionState(mood) {
  const moodToIdle = {
    calm: "idle_calm",
    defensive: "idle_defensive",
    distant: "idle_distant",
    sad: "idle_distant",
    happy: "idle_calm",
    tired: "idle_distant",
    warm: "idle_calm"
  };
  return moodToIdle[mood] || "idle_calm";
}

export function triggerCompanionTouchMotion(motion, interactionResult = {}) {
  const touchState = interactionResult.motionState || getTouchMotionState(interactionResult.reaction);
  motion.temporaryState = touchState;
  motion.temporaryStartedAt = performance.now();
  motion.temporaryUntil = motion.temporaryStartedAt + getMotionDurationMs(motion, touchState, 850);
}

export function playDevMotion(motion, motionState) {
  if (!motion || !motionState) return;
  const now = performance.now();
  if (motionState.startsWith("touch_")) {
    motion.temporaryState = motionState;
    motion.temporaryStartedAt = now;
    motion.temporaryUntil = now + getMotionDurationMs(motion, motionState, 950);
    return;
  }
  motion.devForcedState = motionState;
  motion.devForcedUntil = now + (motionState === "blink" ? getMotionDurationMs(motion, motionState, 700) : 3000);
}

export function updateCompanionMotion(companion, motion, timeSeconds, nowMs, mood, onStateChange = () => {}) {
  motion.state = getIdleMotionState(mood);
  if (motion.temporaryState && nowMs >= motion.temporaryUntil) {
    motion.temporaryState = null;
    motion.temporaryStartedAt = 0;
    motion.temporaryUntil = 0;
  }
  if (motion.devForcedState && nowMs >= motion.devForcedUntil) {
    motion.devForcedState = null;
    motion.devForcedUntil = 0;
  }

  const activeState = motion.temporaryState || motion.devForcedState || motion.state;
  const spriteAnimationPlayed = companion.__animationController?.play(activeState, { mood });
  const transform = motion.temporaryState
    ? getTemporaryMotionTransform(activeState, motion, nowMs)
    : getIdleMotionTransform(activeState, timeSeconds);

  companion.x = motion.baseX + transform.offsetX;
  companion.y = motion.baseY + transform.offsetY;
  companion.scale.set(motion.baseScale * transform.scaleMultiplier);
  companion.alpha = motion.baseAlpha * transform.alphaMultiplier;
  companion.rotation = motion.baseRotation + transform.rotation;
  motion.fallbackMotionActive = !spriteAnimationPlayed;
  onStateChange(activeState);
}

function getMotionDurationMs(motion, motionState, fallbackDurationMs) {
  return motion?.getAnimationDurationMs?.(motionState) || fallbackDurationMs;
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
  const duration = Math.max(1, motion.temporaryUntil - motion.temporaryStartedAt);
  const progress = Math.min(1, Math.max(0, (nowMs - motion.temporaryStartedAt) / duration));
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
