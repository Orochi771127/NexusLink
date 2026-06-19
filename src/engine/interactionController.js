import { evaluateBlockedTouch, evaluateRespectBonus, evaluateTouchReaction } from "./touchReactionEngine.js";
import { getTouchPersonality } from "./personalityProfile.js";
import { getAnimationProfileForCreature, getBodyCueProfile, getMoodIdleAnimationName, getTouchAnimationName } from "./animationProfile.js";
import { createHabitatTraceFromMemory, pruneHabitatTraces, upsertHabitatTrace } from "./habitatTraceEngine.js";
import { clamp } from "../utils/clamp.js";

export const ANIMATION_REGISTRY = Object.freeze({
  idle_calm: { id: "idle_calm", category: "idle", interruptible: true, pack: "core" },
  idle_defensive: { id: "idle_defensive", category: "idle", interruptible: true, pack: "core" },
  idle_distant: { id: "idle_distant", category: "idle", interruptible: true, pack: "core" },
  blink: { id: "blink", category: "idle", interruptible: false, pack: "core" },
  touch_guarded: { id: "touch_guarded", category: "touch", interruptible: false, pack: "core" },
  touch_accept: { id: "touch_accept", category: "touch", interruptible: false, pack: "core" },
  touch_reject: { id: "touch_reject", category: "touch", interruptible: false, pack: "core" },
  hug: { id: "hug", category: "touch", interruptible: false, pack: "core" },
  sit: { id: "sit", category: "movement", interruptible: true, pack: "core" },
  sleep: { id: "sleep", category: "movement", interruptible: true, pack: "core" },
  right_walk: { id: "right_walk", category: "movement", interruptible: true, pack: "core" },
  attack_basic: { id: "attack_basic", category: "battle", interruptible: false, pack: "async" },
  defend: { id: "defend", category: "battle", interruptible: false, pack: "async" },
  hit: { id: "hit", category: "battle", interruptible: false, pack: "async" },
  idle_sick: { id: "idle_sick", category: "idle", interruptible: true, pack: "async" },
  idle_angry: { id: "idle_angry", category: "idle", interruptible: true, pack: "async" },
  idle_sad: { id: "idle_sad", category: "idle", interruptible: true, pack: "async" },
  idle_dance: { id: "idle_dance", category: "idle", interruptible: true, pack: "async" },
  idle_wash: { id: "idle_wash", category: "idle", interruptible: true, pack: "async" },
  idle_wake: { id: "idle_wake", category: "transition", interruptible: false, pack: "core" },
  idle_happy: { id: "idle_happy", category: "idle", interruptible: true, pack: "async" },
  special_wake: { id: "special_wake", category: "special", interruptible: false, pack: "async" },
  left_walk: { id: "left_walk", category: "movement", interruptible: true, pack: "core" },
  special_left_walk: { id: "special_left_walk", category: "special", interruptible: false, pack: "async" },
  special_angry: { id: "special_angry", category: "special", interruptible: false, pack: "async" },
  idle_enjoy: { id: "idle_enjoy", category: "idle", interruptible: true, pack: "async" },
  special_sad: { id: "special_sad", category: "special", interruptible: false, pack: "async" },
  special_dance: { id: "special_dance", category: "special", interruptible: false, pack: "async" },
  special_wash: { id: "special_wash", category: "special", interruptible: false, pack: "async" }
});

export const ANIMATION_NAMES = Object.freeze(Object.keys(ANIMATION_REGISTRY));
export const CORE_ANIMATION_NAMES = Object.freeze(
  ANIMATION_NAMES.filter((name) => ANIMATION_REGISTRY[name].pack === "core")
);

const SPAM_THRESHOLD = 5;
const SPAM_DECAY_MS = 1000;
const ANIMATION_FAIL_OPEN_MS = 3000;
const REJECT_TOUCH_COOLDOWN_MS = 3000;

export class InteractionController {
  constructor({ companion, creature, store, saveCurrentState, statusText, onStateChange = () => {} }) {
    this.companion = companion;
    this.creature = creature;
    this.store = store;
    this.saveCurrentState = saveCurrentState;
    this.statusText = statusText;
    this.onStateChange = onStateChange;
    this.isAnimating = false;
    this.spamScore = 0;
    this.store.setState({ spamScore: this.spamScore });
    this.decayTimer = window.setInterval(() => this.decaySpamScore(), SPAM_DECAY_MS);

    companion.__interactionController = this;
  }

  async handleTouch(touchType = "touch") {
    if (this.isAnimating) return { blocked: true, reason: "animation_locked" };
    const currentState = this.store.getState();

    const now = Date.now();
    if (currentState.lastRejectAt && now - currentState.lastRejectAt < REJECT_TOUCH_COOLDOWN_MS) {
      return this.handleBlockedTouch(now);
    }

    // 尊重拒絕的正向沉積：上次被拒絕後，玩家給了足夠空間才回來。
    this.applyRespectBonusIfEarned(now);

    const currentAnimation = this.getCurrentAnimationName();
    if (currentAnimation === "sleep") {
      await this.playAnimation("idle_wake");
      return { blocked: false, reaction: "wake", motionState: "idle_wake" };
    }

    this.setSpamScore(this.spamScore + 1);
    if (this.spamScore >= SPAM_THRESHOLD) {
      return this.handleSpamBurst();
    }

    const interactionResult = evaluateTouchReaction(
      this.store.getState(),
      getTouchPersonality(this.creature),
      touchType,
      Date.now(),
      this.creature?.name
    );
    const motionState = this.chooseTouchAnimation(interactionResult, touchType);

    this.store.setState({
      ...interactionResult.statePatch,
      spamScore: this.spamScore
    });
    this.setStatusText(interactionResult.previewText);
    this.saveCurrentState();
    this.onStateChange(interactionResult);
    await this.playAnimation(motionState);
    return { ...interactionResult, motionState };
  }

  playAnimation(animName, interruptible = false) {
    const definition = ANIMATION_REGISTRY[animName] || ANIMATION_REGISTRY.idle_calm;
    const effectiveInterruptible = arguments.length > 1 ? interruptible : definition.interruptible;
    const shouldLock = !effectiveInterruptible;
    const animationController = this.companion.__animationController;
    const idleAnimation = this.getIdleAnimationName();

    if (shouldLock) this.isAnimating = true;

    return new Promise((resolve) => {
      const release = () => {
        if (shouldLock) {
          this.isAnimating = false;
          resolve();
          queueMicrotask(() => this.playAnimation(idleAnimation));
          return;
        }
        resolve();
      };

      if (!animationController?.play) {
        window.setTimeout(release, shouldLock ? ANIMATION_FAIL_OPEN_MS : 0);
        return;
      }

      const loadAnimation = animationController.loadAnimation?.(definition.id) || Promise.resolve();
      loadAnimation
        .then(() => {
          const played = animationController.play(definition.id, {
            mood: this.store.getState().mood,
            loop: shouldLock ? false : undefined
          });
          if (!played || !shouldLock) {
            release();
            return;
          }

          const animatedSprite = animationController.getAnimatedSprite?.();
          if (!animatedSprite) {
            window.setTimeout(release, this.getFailOpenDelay(definition.id));
            return;
          }

          let released = false;
          const failOpenTimer = window.setTimeout(() => {
            if (released) return;
            released = true;
            release();
          }, this.getFailOpenDelay(definition.id));

          animatedSprite.onComplete = () => {
            if (released) return;
            released = true;
            window.clearTimeout(failOpenTimer);
            release();
          };
        })
        .catch((error) => {
          console.warn(`Animation lazy load failed: ${definition.id}`, error);
          release();
        });
    });
  }

  isAnimationLocked() {
    return this.isAnimating;
  }

  getCurrentAnimationName() {
    return this.companion.__animationController?.getCurrentAnimationName?.() || "idle_calm";
  }

  dispose() {
    window.clearInterval(this.decayTimer);
  }

  chooseTouchAnimation(interactionResult, touchType) {
    if (touchType === "hug" && interactionResult.reaction === "accept") return "hug";
    return interactionResult.motionState || "touch_guarded";
  }

  async handleSpamBurst() {
    this.setSpamScore(0);
    const currentState = this.store.getState();
    // 依夥伴 profile 解析憤怒動畫：灰影貓→special_angry，五元守護→idle_angry。
    const angryAnimation = getTouchAnimationName("spam_angry", getAnimationProfileForCreature(this.creature));
    const nextState = {
      trust: clamp(currentState.trust - 2, 0, 100),
      bond: clamp(currentState.bond - 1, 0, 100),
      defense: clamp(currentState.defense + 3, 0, 100),
      mood: "defensive",
      spamScore: 0,
      lastTouchAt: Date.now(),
      lastTouchReaction: "spam_angry",
      reactionPreview: "The companion pulls back. Give it a moment."
    };

    this.store.setState(nextState);
    this.setStatusText(nextState.reactionPreview);
    this.saveCurrentState();
    this.onStateChange({ reaction: "spam_angry", motionState: angryAnimation, statePatch: nextState });
    // 強制以非中斷方式播完整段憤怒動畫，避免被 defensive idle 立刻蓋掉。
    await this.playAnimation(angryAnimation, false);
    return { reaction: "spam_angry", motionState: "special_angry", statePatch: nextState };
  }

  handleBlockedTouch(now = Date.now()) {
    const result = evaluateBlockedTouch(this.store.getState(), now, this.creature?.name);
    const statePatch = result.statePatch;

    this.store.setState(statePatch);
    this.setStatusText(statePatch.reactionPreview);
    this.saveCurrentState();
    this.onStateChange({
      blocked: true,
      reason: "recent_reject",
      bodyCue: result.bodyCue,
      statePatch
    });

    // 拒絕不能被連點覆寫——但牠的身體語言會讓你「看見」這個拒絕。
    const cueAnimation = getBodyCueProfile(result.bodyCue).animation;
    if (cueAnimation) this.playAnimation(cueAnimation, true);

    return result;
  }

  applyRespectBonusIfEarned(now = Date.now()) {
    const bonus = evaluateRespectBonus(this.store.getState(), now);
    if (!bonus.granted) return;

    this.store.updateState((draft) => {
      Object.assign(draft, bonus.statePatch);
      draft.emotionalMemories.push(bonus.memorySeed);
      const trace = createHabitatTraceFromMemory(bonus.memorySeed, now);
      if (trace) {
        draft.habitatTraces = pruneHabitatTraces(upsertHabitatTrace(draft.habitatTraces || [], trace));
      }
    });
    this.setStatusText(bonus.message);
  }


  decaySpamScore() {
    if (this.isAnimating) return;
    if (this.spamScore <= 0) return;
    this.setSpamScore(this.spamScore - 1);
  }

  setSpamScore(value) {
    this.spamScore = Math.max(0, value);
    this.store.setState({ spamScore: this.spamScore });
  }

  setStatusText(text) {
    if (!this.statusText || !text) return;
    this.statusText.textContent = text;
  }

  getIdleAnimationName() {
    return getMoodIdleAnimationName(this.store.getState().mood);
  }

  getFailOpenDelay(animName) {
    return this.companion.__animationController?.getAnimationDurationMs?.(animName) || ANIMATION_FAIL_OPEN_MS;
  }
}

export function createInteractionController(options) {
  return new InteractionController(options);
}
