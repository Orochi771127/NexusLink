const CLARIFY_COOLDOWN_MS = 90_000;
const EXPLORATION_COOLDOWN_MS = 120_000;

export function evaluateInitiativeCooldown({
  state = {},
  perception = {},
  actionPlan = {},
  preferenceCooldown = {}
} = {}) {
  const now = perception.gateway?.now || Date.now();
  const chatHistory = Array.isArray(state.chatHistory) ? state.chatHistory : [];
  const energy = Number(state.energy ?? 10);
  const boundaryPressure = Number(perception.semanticSoul?.boundaryPressure ?? 0);
  const safeUnstable = Boolean(state.safeHarborMode || perception.safety?.riskLevel === "high");

  const recentCompanionMessages = chatHistory
    .filter((entry) => entry.role === "companion" || entry.role === "fox")
    .slice(-6);

  const lastClarifyAt = findLastActionTimestamp(chatHistory, /先確認|你想說的是|可以再說一次/);
  const lastExploreInviteAt = findLastActionTimestamp(chatHistory, /探索|月湖|外面看看/);

  const blocks = [];

  if (actionPlan.selectedAction === "ask_clarifying_question" && now - lastClarifyAt < CLARIFY_COOLDOWN_MS) {
    blocks.push("clarify_cooldown");
  }

  if (actionPlan.selectedAction === "suggest_exploration") {
    if (safeUnstable) blocks.push("safety_unstable_no_explore");
    if (now - lastExploreInviteAt < EXPLORATION_COOLDOWN_MS) blocks.push("explore_invite_cooldown");
  }

  if (boundaryPressure >= 0.65 && actionPlan.shouldSpeak) {
    blocks.push("high_boundary_reduce_frequency");
  }

  let replyLengthCap = energy <= 2 ? "short" : boundaryPressure >= 0.72 ? "short" : "normal";
  if (preferenceCooldown.replyLengthCap === "short") replyLengthCap = "short";
  const shouldReduceInitiative = blocks.length > 0 || recentCompanionMessages.length >= 4;

  return {
    blocks,
    shouldReduceInitiative,
    replyLengthCap,
    allowClarifyingQuestion: !blocks.includes("clarify_cooldown"),
    allowExplorationInvite:
      !blocks.includes("safety_unstable_no_explore") && !blocks.includes("explore_invite_cooldown")
  };
}

function findLastActionTimestamp(chatHistory, pattern) {
  for (let index = chatHistory.length - 1; index >= 0; index -= 1) {
    const entry = chatHistory[index];
    if ((entry.role === "companion" || entry.role === "fox") && pattern.test(entry.text || "")) {
      return Number(entry.at) || Date.now();
    }
  }
  return 0;
}