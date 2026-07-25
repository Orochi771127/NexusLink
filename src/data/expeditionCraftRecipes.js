/**
 * 遠征碎晶消耗配方（成長頁 · 關係向，非數值堆砌）。
 * 設計原則：每種碎晶對應其元素的情感語意，消耗後換取 bond/trust/energy 等「被記住」的片刻。
 */

export const EXPEDITION_CRAFT_RECIPES = Object.freeze({
  forest_resonance: Object.freeze({
    id: "forest_resonance",
    choice: "shard_resonance",
    label: { zh: "森息共鳴", en: "Verdant Resonance" },
    sub: { zh: "3 縷森息微光 · 喚起草坡上的暖意", en: "3 Verdant Motes · warm light from the meadow" },
    cost: Object.freeze({ forest_shard: 3 }),
    vitals: Object.freeze({ bond: 1, trust: 1, mood: "warm" }),
    memory: Object.freeze({
      type: "grow_shard_resonance",
      title: "森息共鳴",
      text: "微光在掌心化作一縷暖綠，貼在你們之間。草坡的風聲彷彿也在棲地裡輕輕響了一下。"
    }),
    reactionPreview: "牠嗅了嗅那縷光，耳朵朝你轉了半圈，沒有躲開。",
    status: "微光化作暖意，關係安靜地更深了一點。"
  }),
  forest_breath: Object.freeze({
    id: "forest_breath",
    choice: "shard_breath",
    label: { zh: "草息恢復", en: "Meadow Breath" },
    sub: { zh: "2 縷森息微光 · 把遠征的疲憊吹散", en: "2 Verdant Motes · ease expedition fatigue" },
    cost: Object.freeze({ forest_shard: 2 }),
    vitals: Object.freeze({ energy: 1, defense: -1, mood: "calm" }),
    memory: Object.freeze({
      type: "grow_shard_breath",
      title: "草息恢復",
      text: "你讓微光散成細碎的草香。夥伴的呼吸慢了下來，像剛從風歇處走回來。"
    }),
    reactionPreview: "牠趴下來，鼻尖貼著地面，像在聞遠方還沒散盡的風。",
    status: "草息拂過心核，能量回補了一點。"
  }),
  ember_ward: Object.freeze({
    id: "ember_ward",
    choice: "shard_ember_ward",
    label: { zh: "餘燼護印", en: "Ember Ward" },
    sub: { zh: "3 縷餘燼微光 · 把鍛造區的熱意化成邊界", en: "3 Ember Motes · forge heat into a gentle boundary" },
    cost: Object.freeze({ ember_shard: 3 }),
    vitals: Object.freeze({ trust: 1, defense: -2, mood: "calm" }),
    memory: Object.freeze({
      type: "grow_shard_ember_ward",
      title: "餘燼護印",
      text: "餘燼微光在棲地邊緣凝成一圈暖色護印。不是牆，只是提醒：這裡可以慢下來。"
    }),
    reactionPreview: "牠在護印邊緣踩了踩，確認熱度不會燙到腳掌，才放心趴下。",
    status: "餘燼護印安定邊界，信任多了一點餘裕。"
  }),
  tide_calm: Object.freeze({
    id: "tide_calm",
    choice: "shard_tide_calm",
    label: { zh: "潮息定神", en: "Tide Calm" },
    sub: { zh: "3 縷潮汐微光 · 像碼頭邊數浪一樣放慢", en: "3 Tide Motes · slow down like counting waves" },
    cost: Object.freeze({ tide_shard: 3 }),
    vitals: Object.freeze({ trust: 1, defense: -2, mood: "calm" }),
    memory: Object.freeze({
      type: "grow_shard_tide_calm",
      title: "潮息定神",
      text: "你把微光浸進想像中的海水。一下、又一下——比心跳慢。夥伴的肩線跟著鬆了下來。"
    }),
    reactionPreview: "牠把下巴擱在你膝邊，耳朵朝著不存在的潮聲轉了轉。",
    status: "潮息拂過心核，焦慮退後半步。"
  })
});

/** 依 action choice 查配方。 */
export const CRAFT_CHOICE_TO_RECIPE_ID = Object.freeze(
  Object.fromEntries(
    Object.values(EXPEDITION_CRAFT_RECIPES).map((recipe) => [recipe.choice, recipe.id])
  )
);

export function getCraftRecipe(recipeId) {
  return EXPEDITION_CRAFT_RECIPES[recipeId] || null;
}

export function getCraftRecipeByChoice(choice) {
  const recipeId = CRAFT_CHOICE_TO_RECIPE_ID[choice];
  return recipeId ? getCraftRecipe(recipeId) : null;
}

export function listCraftRecipes() {
  return Object.values(EXPEDITION_CRAFT_RECIPES);
}
