export const CURRENT_CREATURE_ID = "greyshade-cat";

export const FALLBACK_CREATURE = {
  id: "flametail-fox",
  name: "焰尾狐",
  element: "fire",
  image: "./assets/flametail-fox.png",
  defaultMood: "warm",
  description: "火屬性的陪伴型 AI 小怪獸。"
};

const TOUCH_PERSONALITY_FALLBACKS = {
  "greyshade-cat": {
    baseDefense: 39,
    trustWeight: 1.4,
    bondWeight: 1.2,
    energyWeight: 1.2,
    fatigueSensitivity: 6.0,
    defenseWeight: 0.65,
    trustDefenseReduction: 1.4
  }
};

const DEFAULT_TOUCH_PERSONALITY = TOUCH_PERSONALITY_FALLBACKS[CURRENT_CREATURE_ID];

export function getTouchPersonality(creature) {
  return (
    creature?.touchPersonality ||
    TOUCH_PERSONALITY_FALLBACKS[creature?.id] ||
    DEFAULT_TOUCH_PERSONALITY
  );
}
