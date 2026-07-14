import { clamp } from "../utils/clamp.js";
import { getShardType } from "../data/lootTables.js";
import {
  getCraftRecipe,
  getCraftRecipeByChoice,
  listCraftRecipes
} from "../data/expeditionCraftRecipes.js";

/**
 * 檢查 vault 是否足夠支付配方（純函數）。
 */
export function canAffordRecipe(state = {}, recipeId) {
  const recipe = getCraftRecipe(recipeId);
  if (!recipe) return false;
  const shards = state.expeditionVault?.shards || {};
  return Object.entries(recipe.cost).every(([shardId, amount]) => {
    return (Number(shards[shardId]) || 0) >= (Number(amount) || 0);
  });
}

/**
 * 扣除碎晶並回傳 expeditionVault patch（不 mutate 原 state）。
 */
export function spendShards(existingVault = {}, cost = {}) {
  const base = existingVault && typeof existingVault === "object" ? existingVault : {};
  const shards = { ...(base.shards || {}) };

  Object.entries(cost).forEach(([shardId, amount]) => {
    const need = Number(amount) || 0;
    if (need <= 0) return;
    const next = Math.max(0, (Number(shards[shardId]) || 0) - need);
    if (next > 0) shards[shardId] = next;
    else delete shards[shardId];
  });

  return {
    ...base,
    shards,
    lastCraftAt: Date.now()
  };
}

function formatMissingCost(state, recipe) {
  const shards = state.expeditionVault?.shards || {};
  const parts = Object.entries(recipe.cost)
    .filter(([shardId, need]) => (Number(shards[shardId]) || 0) < (Number(need) || 0))
    .map(([shardId, need]) => {
      const label = getShardType(shardId).label.zh;
      const have = Number(shards[shardId]) || 0;
      return `${label} ${have}/${need}`;
    });
  return parts.join("、");
}

/**
 * 執行碎晶製作：成功時回傳 statePatch（含 expeditionVault）與敘事文案。
 */
export function applyCraftRecipe(currentState = {}, recipeId, now = Date.now()) {
  const recipe = getCraftRecipe(recipeId);
  if (!recipe) {
    return {
      ok: false,
      message: "這道配方還沒被記錄下來。",
      reactionPreview: "心核裡沒有對應的共鳴回路。"
    };
  }

  if (!canAffordRecipe(currentState, recipeId)) {
    const missing = formatMissingCost(currentState, recipe);
    return {
      ok: false,
      message: missing
        ? `碎晶還差一些：${missing}。先完成遠征，把碎晶帶回棲地吧。`
        : "還沒有足夠的碎晶。",
      reactionPreview: "牠看著你空著的手，像在等一縷從遠征帶回來的光。"
    };
  }

  const vaultPatch = spendShards(currentState.expeditionVault, recipe.cost);

  return {
    ok: true,
    statePatch: { expeditionVault: vaultPatch },
    vitals: { ...recipe.vitals },
    memory: recipe.memory
      ? {
          ...recipe.memory,
          createdAt: now
        }
      : null,
    message: recipe.memory?.text || recipe.status,
    reactionPreview: recipe.reactionPreview,
    status: recipe.status,
    growthHint: recipe.id
  };
}

/** actionEffectEngine 用：依 choice 字串執行。 */
export function applyCraftByChoice(currentState = {}, choice, now = Date.now()) {
  const recipe = getCraftRecipeByChoice(choice);
  if (!recipe) {
    return { ok: false, message: "這個選項暫時無法共鳴。" };
  }
  return applyCraftRecipe(currentState, recipe.id, now);
}

/** UI：列出所有配方（成長頁按鈕）。 */
export function listCraftRecipesForUi() {
  return listCraftRecipes();
}
