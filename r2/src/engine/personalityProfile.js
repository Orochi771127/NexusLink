export const CURRENT_CREATURE_ID = "greyshade-cat";

export const DEFAULT_TOUCH_PERSONALITY = {
  baseSafety: 30,
  baseDefense: 30,
  trustWeight: 0.5,
  bondWeight: 0.8,
  energyWeight: 0.2,
  fatigueSensitivity: 1.5,
  defenseWeight: 0.65,
  trustDefenseReduction: 0.5,
  moodModifiers: {
    calm: 10,
    happy: 20,
    warm: 15,
    sad: -10,
    defensive: -25,
    distant: -15,
    tired: -12
  },
  reactionThresholds: {
    accept: 25,
    guardedAccept: 0,
    hesitate: -20
  },
  fatigueRules: {
    firstTouchIncrease: 0.5,
    touchIncrease: 1,
    hugIncrease: 1.5,
    rejectAt: 8,
    acceptDowngradeAt: 6
  }
};

export const FALLBACK_CREATURE = {
  id: "flametail-fox",
  name: "焰尾狐",
  element: "fire",
  image: "./assets/flametail-fox.png",
  defaultMood: "warm",
  description: "火屬性的陪伴型 AI 小怪獸。",
  personality: DEFAULT_TOUCH_PERSONALITY
};

export function getTouchPersonality(creature) {
  return creature?.personality || DEFAULT_TOUCH_PERSONALITY;
}
