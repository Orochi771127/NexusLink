import defaultState from "./defaultState.js";
import { sanitizeEmotionalMemory, sanitizeMemory, sanitizeTrace } from "../engine/storageGuard.js";
import { clamp } from "../utils/clamp.js";
import { normalizeRuntimeCompanionId, normalizeUnlockedCompanionIds } from "../data/companionRuntimePolicy.js";
import { EXPLORATION_NODE_IDS } from "../data/explorationNodes.js";

let state = createDefaultState();
const listeners = new Set();

export function createDefaultState() {
  return {
    ...defaultState,
    lastSeenAt: Date.now(),
    chatHistory: defaultState.chatHistory.map((item) => ({ ...item })),
    memories: defaultState.memories.map((item) => ({ ...item })),
    habitatTraces: defaultState.habitatTraces.map((item) => ({ ...item })),
    emotionalMemories: defaultState.emotionalMemories.map((item) => ({ ...item })),
    playerProfile: { ...defaultState.playerProfile },
    onboarding: { ...defaultState.onboarding },
    unlockedCompanionIds: [...defaultState.unlockedCompanionIds],
    battleRecord: { ...defaultState.battleRecord },
    explorationProgress: { ...defaultState.explorationProgress, visitCounts: {} }
  };
}

export function getState() {
  return state;
}

export function setState(partial) {
  state = normalizeState({ ...state, ...partial });
  notify();
  return state;
}

export function replaceState(nextState) {
  state = normalizeState(nextState);
  notify();
  return state;
}

export function updateState(mutator) {
  const draft = normalizeState({ ...state, chatHistory: state.chatHistory.map((item) => ({ ...item })) });
  const result = mutator(draft);
  state = normalizeState(result || draft);
  notify();
  return state;
}

export function normalizeState(rawState = {}) {
  const baseState = createDefaultState();
  const targetState = { ...baseState, ...rawState };
  const chatHistory = Array.isArray(targetState.chatHistory) ? targetState.chatHistory : baseState.chatHistory;
  const memories = Array.isArray(targetState.memories) ? targetState.memories : baseState.memories;
  const habitatTraces = Array.isArray(targetState.habitatTraces) ? targetState.habitatTraces : baseState.habitatTraces;
  const emotionalMemories = Array.isArray(targetState.emotionalMemories)
    ? targetState.emotionalMemories
    : baseState.emotionalMemories;
  const unlockedCompanionIds = normalizeUnlockedCompanionIds(targetState.unlockedCompanionIds, {
    activeCompanionId: targetState.activeCompanionId,
    preserveActiveCompanion: true
  });
  const runtimeState = { ...targetState, unlockedCompanionIds };
  const playerProfile = normalizePlayerProfile(targetState.playerProfile, baseState.playerProfile);
  const onboarding = normalizeOnboarding(targetState.onboarding, baseState.onboarding, targetState);

  return {
    ...targetState,
    bond: clamp(targetState.bond, 0, 100),
    trust: clamp(targetState.trust, 0, 100),
    mood: targetState.mood || baseState.mood,
    energy: clamp(targetState.energy, 0, 10),
    spamScore: clamp(targetState.spamScore, 0, 999),
    defense: clamp(targetState.defense ?? baseState.defense, 0, 100),
    touchFatigue: clamp(targetState.touchFatigue ?? baseState.touchFatigue, 0, 10),
    lastTouchAt: targetState.lastTouchAt ?? null,
    lastRejectAt: targetState.lastRejectAt ?? null,
    blockedTouchCount: clamp(targetState.blockedTouchCount ?? baseState.blockedTouchCount, 0, 999),
    lastBlockedTouchAt: targetState.lastBlockedTouchAt ?? null,
    lastSeenAt: Number(targetState.lastSeenAt) || Date.now(),
    timeAnomalyCount: clamp(targetState.timeAnomalyCount ?? baseState.timeAnomalyCount, 0, 999),
    firstTouchCompleted: Boolean(targetState.firstTouchCompleted),
    firstHugCompleted: Boolean(targetState.firstHugCompleted),
    reactionPreview: targetState.reactionPreview || "",
    lastTouchReaction: targetState.lastTouchReaction || "",
    lastMessage: targetState.lastMessage || "",
    memorySchemaVersion: Number(targetState.memorySchemaVersion) || 1,
    safeHarborMode: Boolean(targetState.safeHarborMode),
    lastEmotionTag: targetState.lastEmotionTag || null,
    habitatRepairFactor: clamp(targetState.habitatRepairFactor ?? 0, 0, 1),
    firstSessionOpeningSeenAt: Number(targetState.firstSessionOpeningSeenAt) || null,
    playerProfile,
    onboarding,
    unlockedCompanionIds,
    activeCompanionId: normalizeRuntimeCompanionId(targetState.activeCompanionId, runtimeState),
    battleRecord: normalizeBattleRecord(targetState.battleRecord, baseState.battleRecord),
    explorationProgress: normalizeExplorationProgress(targetState.explorationProgress, baseState.explorationProgress),
    chatHistory: chatHistory.map((item) => ({
      role: item.role === "fox" ? "companion" : item.role || "companion",
      text: String(item.text || "")
    })),
    memories: memories.map((item) => sanitizeMemory(item)).filter(Boolean),
    habitatTraces: habitatTraces.map((item) => sanitizeTrace(item)).filter(Boolean),
    emotionalMemories: emotionalMemories.map((item) => sanitizeEmotionalMemory(item)).filter(Boolean)
  };
}

const BATTLE_RESULTS = new Set(["win", "lose", "retreat"]);
const ONBOARDING_STATUSES = new Set(["pending", "start", "identity", "guidance", "home", "completed"]);

function normalizePlayerProfile(rawProfile, baseProfile) {
  const profile = rawProfile && typeof rawProfile === "object" ? rawProfile : {};
  return {
    displayName: normalizeProfileText(profile.displayName),
    identitySkipped: Boolean(profile.identitySkipped),
    createdAt: Number(profile.createdAt) || baseProfile.createdAt,
    updatedAt: Number(profile.updatedAt) || baseProfile.updatedAt
  };
}

function normalizeProfileText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 32);
}

function normalizeOnboarding(rawOnboarding, baseOnboarding, targetState) {
  const onboarding = rawOnboarding && typeof rawOnboarding === "object" ? rawOnboarding : {};
  const veteranAutoCompleted = isVeteranSave(targetState);
  const completed = Boolean(onboarding.completed) || onboarding.status === "completed" || veteranAutoCompleted;
  const rawStatus = typeof onboarding.status === "string" ? onboarding.status : baseOnboarding.status;
  const status = completed ? "completed" : ONBOARDING_STATUSES.has(rawStatus) ? rawStatus : baseOnboarding.status;

  return {
    version: Number(onboarding.version) || baseOnboarding.version,
    status,
    completed,
    completedAt: Number(onboarding.completedAt) || baseOnboarding.completedAt,
    startedAt: Number(onboarding.startedAt) || baseOnboarding.startedAt,
    identityCompleted: completed || Boolean(onboarding.identityCompleted),
    guidanceCompleted: completed || Boolean(onboarding.guidanceCompleted),
    greyshadeMetAt: Number(onboarding.greyshadeMetAt) || baseOnboarding.greyshadeMetAt,
    veteranAutoCompleted: veteranAutoCompleted || Boolean(onboarding.veteranAutoCompleted)
  };
}

function isVeteranSave(targetState) {
  if (Number(targetState.bond) > 0) return true;
  if (Boolean(targetState.firstTouchCompleted) || Boolean(targetState.firstHugCompleted)) return true;
  if (hasArrayItems(targetState.memories)) return true;
  if (hasArrayItems(targetState.habitatTraces)) return true;
  if (hasArrayItems(targetState.emotionalMemories)) return true;
  if (hasBattleRecordProgress(targetState.battleRecord)) return true;
  return hasExplorationProgress(targetState.explorationProgress);
}

function hasArrayItems(value) {
  return Array.isArray(value) && value.length > 0;
}

function hasBattleRecordProgress(rawRecord) {
  if (!rawRecord || typeof rawRecord !== "object") return false;
  return (Number(rawRecord.wins) || 0) > 0
    || (Number(rawRecord.losses) || 0) > 0
    || (Number(rawRecord.retreats) || 0) > 0
    || Boolean(rawRecord.lastResult)
    || Boolean(Number(rawRecord.lastBattleAt));
}

function hasExplorationProgress(rawProgress) {
  if (!rawProgress || typeof rawProgress !== "object") return false;
  if ((Number(rawProgress.totalExplorations) || 0) > 0) return true;
  const visitCounts = rawProgress.visitCounts && typeof rawProgress.visitCounts === "object"
    ? rawProgress.visitCounts
    : {};
  return Object.values(visitCounts).some((count) => (Number(count) || 0) > 0);
}

function normalizeBattleRecord(rawRecord, baseRecord) {
  const record = rawRecord && typeof rawRecord === "object" ? rawRecord : {};
  return {
    wins: clamp(Number(record.wins) || 0, 0, 9999),
    losses: clamp(Number(record.losses) || 0, 0, 9999),
    retreats: clamp(Number(record.retreats) || 0, 0, 9999),
    lastResult: BATTLE_RESULTS.has(record.lastResult) ? record.lastResult : baseRecord.lastResult,
    lastBattleAt: Number(record.lastBattleAt) || null
  };
}

function normalizeExplorationProgress(rawProgress, baseProgress) {
  const progress = rawProgress && typeof rawProgress === "object" ? rawProgress : {};
  const rawCounts = progress.visitCounts && typeof progress.visitCounts === "object" ? progress.visitCounts : {};
  const visitCounts = {};
  EXPLORATION_NODE_IDS.forEach((nodeId) => {
    const count = clamp(Number(rawCounts[nodeId]) || 0, 0, 9999);
    if (count > 0) visitCounts[nodeId] = count;
  });
  return {
    totalExplorations: clamp(Number(progress.totalExplorations) || 0, 0, 99999),
    lastNodeId: EXPLORATION_NODE_IDS.includes(progress.lastNodeId) ? progress.lastNodeId : baseProgress.lastNodeId,
    visitCounts
  };
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach((listener) => listener(state));
}
