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

// 環境主動（棲地微時刻，TP-7）的冷卻。與上方對話主動同一精神：主動必須稀少、可忽略、
// 永不變成打擾（紅線 6）。純函數：只看傳入的節拍記錄與安全旗標，不讀 chatHistory、
// 不讀任何玩家上線/離線資訊（紅線 1）。
const AMBIENT_BOOT_QUIET_MS = 90_000; // 開機後先安靜：讓玩家自己安頓，牠不搶開場。
const AMBIENT_MIN_INTERVAL_MS = 240_000; // 兩次主動至少隔 4 分鐘。
const AMBIENT_SESSION_CAP = 2; // 一個 session 最多主動 2 次；再多就是黏人。

export function evaluateAmbientInitiativeCooldown({
  now = Date.now(),
  bootAt = 0,
  lastMomentAt = 0,
  momentsThisSession = 0,
  safeUnstable = false
} = {}) {
  const blocks = [];
  if (safeUnstable) blocks.push("safety_quiet");
  if (bootAt && now - bootAt < AMBIENT_BOOT_QUIET_MS) blocks.push("boot_quiet");
  if (momentsThisSession >= AMBIENT_SESSION_CAP) blocks.push("session_cap");
  if (lastMomentAt && now - lastMomentAt < AMBIENT_MIN_INTERVAL_MS) blocks.push("moment_interval");
  return { allowed: blocks.length === 0, blocks };
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