import defaultState from "./defaultState.js";
import { sanitizeEmotionalMemory, sanitizeMemory, sanitizeTrace, sanitizeCompanionAnchor } from "../engine/storageGuard.js";
import { clamp } from "../utils/clamp.js";
import {
  normalizeRuntimeCompanionId,
  normalizeUnlockedCompanionIds,
  resolveCanonicalCompanionId
} from "../data/companionRuntimePolicy.js";
import { isKnownCompanionId } from "../data/companionRegistry.js";
import { EXPLORATION_NODE_IDS } from "../data/explorationNodes.js";
import { normalizeHabitatId } from "../data/habitatRegistry.js";
import {
  archiveRelationshipMirror,
  createDefaultCompanionStates,
  getCompanionRelationship,
  normalizeCompanionStates,
  rawStateHasRelationshipMirror,
  RELATION_MIRROR_FIELDS
} from "./companionStateSchema.js";

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
    onboarding: { ...defaultState.onboarding, firstLoop: { ...defaultState.onboarding.firstLoop } },
    unlockedCompanionIds: [...defaultState.unlockedCompanionIds],
    companionStates: createDefaultCompanionStates(defaultState.activeCompanionId),
    battleRecord: { ...defaultState.battleRecord },
    chapterProgress: { current: defaultState.chapterProgress.current, completed: [...defaultState.chapterProgress.completed] },
    resonance: { chapterMarks: {}, companions: {} },
    explorationProgress: { ...defaultState.explorationProgress, visitCounts: {} },
    activityProgress: normalizeActivityProgress(defaultState.activityProgress),
    expeditionVault: normalizeExpeditionVault(defaultState.expeditionVault),
    companionPreferences: normalizeCompanionPreferences(defaultState.companionPreferences),
    settings: { ...defaultState.settings }
  };
}

export function getState() {
  return state;
}

export function setState(partial) {
  const candidate = prepareRuntimeMutation(state, { ...state, ...partial });
  state = normalizeState(candidate);
  notify();
  return state;
}

export function replaceState(nextState) {
  // Persisted/full replacement is canonical-authoritative. This is used by
  // rollback paths and prevents a stale compatibility mirror from overwriting
  // an existing companionStates record.
  state = normalizeState(nextState);
  notify();
  return state;
}

export function replaceRuntimeState(nextState) {
  // Boot recovery and return behavior deliberately mutate a hydrated runtime
  // mirror. Seal that full runtime snapshot before canonical normalization.
  const candidate = nextState && typeof nextState === "object" ? nextState : {};
  state = normalizeState(archiveRelationshipMirror(candidate, candidate.activeCompanionId));
  notify();
  return state;
}

export function updateState(mutator) {
  const previousState = state;
  const draft = normalizeState({ ...state, chatHistory: state.chatHistory.map((item) => ({ ...item })) });
  const result = mutator(draft);
  state = normalizeState(prepareRuntimeMutation(previousState, result || draft));
  notify();
  return state;
}

export function normalizeState(rawState = {}) {
  const sourceState = rawState && typeof rawState === "object" ? rawState : {};
  const baseState = createDefaultState();
  const targetState = { ...baseState, ...sourceState };
  const chatHistory = Array.isArray(targetState.chatHistory) ? targetState.chatHistory : baseState.chatHistory;
  const memories = Array.isArray(targetState.memories) ? targetState.memories : baseState.memories;
  const habitatTraces = Array.isArray(targetState.habitatTraces) ? targetState.habitatTraces : baseState.habitatTraces;
  const emotionalMemories = Array.isArray(targetState.emotionalMemories)
    ? targetState.emotionalMemories
    : baseState.emotionalMemories;
  const companionAnchors = Array.isArray(targetState.companionAnchors)
    ? targetState.companionAnchors
    : baseState.companionAnchors;
  const initialUnlockedCompanionIds = normalizeUnlockedCompanionIds(targetState.unlockedCompanionIds, {
    activeCompanionId: targetState.activeCompanionId,
    preserveActiveCompanion: true
  });
  const initialRuntimeState = { ...targetState, unlockedCompanionIds: initialUnlockedCompanionIds };
  const initialActiveCompanionId = normalizeRuntimeCompanionId(targetState.activeCompanionId, initialRuntimeState);
  const unlockedCompanionIds = normalizeUnlockedCompanionIds(initialUnlockedCompanionIds, {
    activeCompanionId: initialActiveCompanionId,
    preserveActiveCompanion: true
  });
  const runtimeState = { ...targetState, unlockedCompanionIds };
  const activeCompanionId = normalizeRuntimeCompanionId(initialActiveCompanionId, runtimeState);
  const companionStates = normalizeCompanionStates(sourceState.companionStates, {
    activeCompanionId,
    unlockedCompanionIds,
    legacyState: targetState,
    legacyRelationshipPresent: rawStateHasRelationshipMirror(sourceState),
    canonicalFieldPresent: Object.prototype.hasOwnProperty.call(sourceState, "companionStates")
  });
  const activeRelationship = getCompanionRelationship(companionStates, activeCompanionId)
    || getCompanionRelationship(createDefaultCompanionStates(activeCompanionId), activeCompanionId);
  const relationshipTargetState = {
    ...targetState,
    ...activeRelationship,
    activeCompanionId,
    unlockedCompanionIds,
    companionStates
  };
  const playerProfile = normalizePlayerProfile(targetState.playerProfile, baseState.playerProfile);
  const onboarding = normalizeOnboarding(targetState.onboarding, baseState.onboarding, relationshipTargetState);

  return {
    ...relationshipTargetState,
    bond: clamp(relationshipTargetState.bond, 0, 100),
    trust: clamp(relationshipTargetState.trust, 0, 100),
    mood: relationshipTargetState.mood || baseState.mood,
    energy: clamp(relationshipTargetState.energy, 0, 10),
    spamScore: clamp(targetState.spamScore, 0, 999),
    defense: clamp(relationshipTargetState.defense ?? baseState.defense, 0, 100),
    touchFatigue: clamp(relationshipTargetState.touchFatigue ?? baseState.touchFatigue, 0, 10),
    lastTouchAt: relationshipTargetState.lastTouchAt ?? null,
    lastRejectAt: relationshipTargetState.lastRejectAt ?? null,
    blockedTouchCount: clamp(relationshipTargetState.blockedTouchCount ?? baseState.blockedTouchCount, 0, 999),
    lastBlockedTouchAt: relationshipTargetState.lastBlockedTouchAt ?? null,
    lastSeenAt: normalizePositiveTimestamp(targetState.lastSeenAt, Date.now()),
    timeAnomalyCount: clamp(targetState.timeAnomalyCount ?? baseState.timeAnomalyCount, 0, 999),
    firstTouchCompleted: Boolean(relationshipTargetState.firstTouchCompleted),
    firstHugCompleted: Boolean(relationshipTargetState.firstHugCompleted),
    reactionPreview: relationshipTargetState.reactionPreview || "",
    lastTouchReaction: relationshipTargetState.lastTouchReaction || "",
    lastMessage: targetState.lastMessage || "",
    memorySchemaVersion: Number(targetState.memorySchemaVersion) || 2,
    safeHarborMode: Boolean(targetState.safeHarborMode),
    lastEmotionTag: targetState.lastEmotionTag || null,
    habitatRepairFactor: clamp(targetState.habitatRepairFactor ?? 0, 0, 1),
    firstSessionOpeningSeenAt: Number(targetState.firstSessionOpeningSeenAt) || null,
    activeHabitatId: normalizeHabitatId(targetState.activeHabitatId),
    playerProfile,
    onboarding,
    unlockedCompanionIds,
    activeCompanionId,
    companionStates,
    battleRecord: normalizeBattleRecord(targetState.battleRecord, baseState.battleRecord),
    chapterProgress: normalizeChapterProgress(targetState.chapterProgress),
    resonance: normalizeResonance(targetState.resonance),
    explorationProgress: normalizeExplorationProgress(targetState.explorationProgress, baseState.explorationProgress),
    activityProgress: normalizeActivityProgress(targetState.activityProgress),
    expeditionVault: normalizeExpeditionVault(targetState.expeditionVault, baseState.expeditionVault),
    companionPreferences: normalizeCompanionPreferences(targetState.companionPreferences),
    settings: normalizeSettings(targetState.settings, baseState.settings),
    chatHistory: chatHistory.map((item) => ({
      role: item.role === "fox" ? "companion" : item.role || "companion",
      text: String(item.text || "")
    })),
    memories: memories.map((item) => sanitizeMemory(item)).filter(Boolean),
    habitatTraces: habitatTraces.map((item) => sanitizeTrace(item)).filter(Boolean),
    emotionalMemories: emotionalMemories.map((item) => sanitizeEmotionalMemory(item)).filter(Boolean),
    companionAnchors: companionAnchors.map((item) => sanitizeCompanionAnchor(item)).filter(Boolean)
  };
}

function prepareRuntimeMutation(previousState, candidateState) {
  const candidate = candidateState && typeof candidateState === "object" ? candidateState : previousState;
  const previousActiveId = previousState?.activeCompanionId;
  const activeChanged = Boolean(
    previousActiveId
    && candidate.activeCompanionId
    && candidate.activeCompanionId !== previousActiveId
  );
  // A switch transaction always seals A from the pre-mutation snapshot. Any
  // simultaneous top-level relationship fields belong to neither B nor the
  // switch command and are deliberately ignored; B hydrates from canonical.
  // Non-relationship edits (including canonical growth edits) remain intact.
  const archiveSource = activeChanged
    ? RELATION_MIRROR_FIELDS.reduce(
        (snapshot, field) => ({ ...snapshot, [field]: previousState?.[field] }),
        { ...candidate }
      )
    : candidate;
  const prepared = archiveRelationshipMirror(archiveSource, previousActiveId);
  return activeChanged ? { ...prepared, spamScore: 0 } : prepared;
}

const BATTLE_RESULTS = new Set(["win", "lose", "retreat"]);
const ONBOARDING_STATUSES = new Set(["pending", "start", "identity", "guidance", "meet", "home", "completed"]);
const QUALITY_VALUES = new Set(["low", "medium", "high"]);
const TEXT_SIZE_VALUES = new Set(["small", "medium", "large"]);
const LANGUAGE_VALUES = new Set(["tc", "sc", "en", "jp"]);

function normalizeActivityProgress(rawProgress) {
  const progress = rawProgress && typeof rawProgress === "object" ? rawProgress : {};
  const normalizeIds = (value) => [
    ...new Set(
      (Array.isArray(value) ? value : [])
        .map((id) => String(id || "").trim())
        .filter(Boolean)
    )
  ];
  return {
    version: 1,
    orbit: {
      clearedStageIds: normalizeIds(progress.orbit?.clearedStageIds)
    },
    standoff: {
      clearedScenarioIds: normalizeIds(progress.standoff?.clearedScenarioIds)
    },
    expedition: {
      clearedRouteIds: normalizeIds(progress.expedition?.clearedRouteIds)
    }
  };
}

function normalizeSettings(rawSettings, baseSettings) {
  const settings = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
  const vol = (value, fallback) => {
    const num = Number(value);
    return clamp(Number.isFinite(num) ? num : fallback, 0, 100);
  };
  return {
    volMaster: vol(settings.volMaster, baseSettings.volMaster),
    volBgm: vol(settings.volBgm, baseSettings.volBgm),
    volSfx: vol(settings.volSfx, baseSettings.volSfx),
    quality: QUALITY_VALUES.has(settings.quality) ? settings.quality : baseSettings.quality,
    textSize: TEXT_SIZE_VALUES.has(settings.textSize) ? settings.textSize : baseSettings.textSize,
    lowMotion: Boolean(settings.lowMotion),
    audioMuted: Boolean(settings.audioMuted),
    lang: LANGUAGE_VALUES.has(settings.lang) ? settings.lang : baseSettings.lang
  };
}

function normalizeCompanionPreferences(rawStore = {}) {
  const source = rawStore && typeof rawStore === "object" ? rawStore : {};
  const companions = source.companions && typeof source.companions === "object" ? source.companions : {};
  const normalizedCompanions = {};

  const entries = Object.entries(companions);
  // Alias-only data is retained, but a canonical profile is applied last and
  // owns scalar preferences. Rolling signals and counters merge without double
  // counting or exceeding their existing bounds.
  for (const canonicalPass of [false, true]) {
    for (const [sourceCompanionId, rawProfile] of entries) {
      const companionId = sourceCompanionId === "default"
        ? "default"
        : resolveCanonicalCompanionId(sourceCompanionId);
      const isCanonicalSource = sourceCompanionId === companionId;
      if (isCanonicalSource !== canonicalPass) continue;
      if (!isKnownCompanionId(companionId) && companionId !== "default") continue;
      const profile = normalizeCompanionPreferenceProfile(rawProfile);
      normalizedCompanions[companionId] = normalizedCompanions[companionId]
        ? mergeCompanionPreferenceProfiles(normalizedCompanions[companionId], profile)
        : profile;
    }
  }

  return {
    version: Math.max(1, Number(source.version) || 1),
    updatedAt: normalizePositiveTimestamp(source.updatedAt, 0),
    companions: normalizedCompanions
  };
}

function normalizeCompanionPreferenceProfile(rawProfile) {
  const profile = rawProfile && typeof rawProfile === "object" ? rawProfile : {};
  return {
    replyLengthBias: profile.replyLengthBias === "short" ? "short" : "normal",
    avoidComfortIntensity: clamp(profile.avoidComfortIntensity ?? 0, 0, 1),
    preferPresenceOverAdvice: Boolean(profile.preferPresenceOverAdvice),
    boundarySensitivity: clamp(profile.boundarySensitivity ?? 0, 0, 1),
    interactionPace: clamp(profile.interactionPace ?? 0, -1, 1),
    eveningAffinity: Boolean(profile.eveningAffinity),
    restAffinity: Boolean(profile.restAffinity),
    learnedSignals: Array.isArray(profile.learnedSignals)
      ? profile.learnedSignals.filter((value) => typeof value === "string" && value).slice(-12)
      : [],
    sessionCount: Math.max(0, Number(profile.sessionCount) || 0),
    lastSeenAt: normalizePositiveTimestamp(profile.lastSeenAt, 0),
    updatedAt: normalizePositiveTimestamp(profile.updatedAt, 0)
  };
}

function mergeCompanionPreferenceProfiles(legacyProfile, canonicalProfile) {
  return {
    ...canonicalProfile,
    learnedSignals: [...new Set([
      ...legacyProfile.learnedSignals,
      ...canonicalProfile.learnedSignals
    ])].slice(-12),
    sessionCount: Math.max(legacyProfile.sessionCount, canonicalProfile.sessionCount),
    lastSeenAt: Math.max(legacyProfile.lastSeenAt, canonicalProfile.lastSeenAt),
    updatedAt: Math.max(legacyProfile.updatedAt, canonicalProfile.updatedAt)
  };
}

function normalizePositiveTimestamp(value, fallback) {
  const timestamp = Number(value);
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : fallback;
}

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
    veteranAutoCompleted: veteranAutoCompleted || Boolean(onboarding.veteranAutoCompleted),
    firstLoop: normalizeFirstLoop(onboarding.firstLoop, baseOnboarding.firstLoop, {
      completed,
      completedAt: Number(onboarding.completedAt) || null
    })
  };
}

// 首輪閉環（First Touch → First Soul Talk → First Trace）持久欄位。
// 只存「跳過/完成」兩個時間戳；進行中的 stage 由既有欄位（firstTouchCompleted /
// chatHistory player 行 / 情緒痕跡數）derive，不落地，把存檔面縮到最小。
// 回填規則（關鍵）：本欄位出現「之前」寫入的存檔沒有 firstLoop 物件——
// 若該存檔已完成 onboarding（含 veteran heuristic），直接回填 completedAt，
// 老玩家與既有完成檔永不重跑首輪（K4/K5）。注意不能只看 veteranAutoCompleted：
// 新玩家第一次觸碰後 isVeteranSave 即為 true，但其存檔「有」firstLoop 物件，
// 所以不會走回填分支、閉環照常進行。
function normalizeFirstLoop(rawFirstLoop, baseFirstLoop, { completed, completedAt }) {
  if (!rawFirstLoop || typeof rawFirstLoop !== "object") {
    if (completed) {
      return { skippedAt: null, completedAt: completedAt || Date.now() };
    }
    return { ...baseFirstLoop };
  }
  return {
    skippedAt: Number(rawFirstLoop.skippedAt) || null,
    completedAt: Number(rawFirstLoop.completedAt) || null
  };
}

// CH-3：export 供初遇定情判斷「fresh 嚴格替換 vs veteran(restart) 聯集」——
// 與 normalizeOnboarding 的 veteran heuristic 共用同一份判據，不另造分叉。
export function isVeteranSave(targetState) {
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

// 章節旅程（CH-4）：老存檔無此欄位 → 第一章起步；壞資料 clamp/清洗。
// current 固定 1..7；completed 僅收 1..7 整數、去重排序。推進邏輯不在 normalize
//（見 chapterRegistry.advanceChapterProgress，CH-5 由對峙結算調用）。
function normalizeChapterProgress(rawProgress) {
  const progress = rawProgress && typeof rawProgress === "object" ? rawProgress : {};
  const current = clamp(Math.round(Number(progress.current) || 1), 1, 7);
  const completedSource = Array.isArray(progress.completed) ? progress.completed : [];
  const completed = [...new Set(
    completedSource
      .map((value) => Math.round(Number(value)))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 7)
  )].sort((a, b) => a - b);
  return { current, completed };
}

// 共鳴圈（CH-5b）：老存檔無此欄位 → 空物件起步（章節快照由 battleController 於章節
// 推進時寫入；缺快照時 resonanceInviteEngine lazy 補，見該檔）。壞資料清洗：章號限
// 1..7、companionId 必須是 registry 已知者、數值 clamp。永遠回傳新物件，不共享參照。
function normalizeResonance(rawResonance) {
  const resonance = rawResonance && typeof rawResonance === "object" ? rawResonance : {};
  const rawMarks = resonance.chapterMarks && typeof resonance.chapterMarks === "object" ? resonance.chapterMarks : {};
  const chapterMarks = {};
  Object.keys(rawMarks).forEach((key) => {
    const chapterNo = Math.round(Number(key));
    if (!Number.isInteger(chapterNo) || chapterNo < 1 || chapterNo > 7) return;
    const mark = rawMarks[key] && typeof rawMarks[key] === "object" ? rawMarks[key] : {};
    chapterMarks[chapterNo] = {
      bondAtStart: clamp(Number(mark.bondAtStart) || 0, 0, 100),
      trustAtStart: clamp(Number(mark.trustAtStart) || 0, 0, 100),
      blockedTouchAtStart: clamp(Number(mark.blockedTouchAtStart) || 0, 0, 999),
      overwhelmedCount: clamp(Number(mark.overwhelmedCount) || 0, 0, 999),
      enteredAt: Number(mark.enteredAt) || null,
      reaskedAt: Number(mark.reaskedAt) || null
    };
  });
  const rawCompanions = resonance.companions && typeof resonance.companions === "object" ? resonance.companions : {};
  const companions = {};
  const companionEntries = Object.entries(rawCompanions);
  for (const canonicalPass of [false, true]) {
    for (const [sourceCompanionId, rawEntry] of companionEntries) {
      const companionId = resolveCanonicalCompanionId(sourceCompanionId);
      if ((sourceCompanionId === companionId) !== canonicalPass) continue;
      if (!isKnownCompanionId(companionId)) continue;
      const entry = normalizeResonanceCompanion(rawEntry);
      companions[companionId] = companions[companionId]
        ? mergeResonanceCompanions(companions[companionId], entry)
        : entry;
    }
  }
  return { chapterMarks, companions };
}

function normalizeResonanceCompanion(rawEntry) {
  const entry = rawEntry && typeof rawEntry === "object" ? rawEntry : {};
  return {
    metAt: normalizePositiveTimestamp(entry.metAt, null),
    lastAskAt: normalizePositiveTimestamp(entry.lastAskAt, null),
    declinedCount: clamp(Number(entry.declinedCount) || 0, 0, 999),
    joinedAt: normalizePositiveTimestamp(entry.joinedAt, null)
  };
}

function mergeResonanceCompanions(legacyEntry, canonicalEntry) {
  return {
    metAt: earliestTimestamp(legacyEntry.metAt, canonicalEntry.metAt),
    lastAskAt: latestTimestamp(legacyEntry.lastAskAt, canonicalEntry.lastAskAt),
    declinedCount: Math.max(legacyEntry.declinedCount, canonicalEntry.declinedCount),
    joinedAt: earliestTimestamp(legacyEntry.joinedAt, canonicalEntry.joinedAt)
  };
}

function earliestTimestamp(left, right) {
  if (!left) return right || null;
  if (!right) return left;
  return Math.min(left, right);
}

function latestTimestamp(left, right) {
  return Math.max(left || 0, right || 0) || null;
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

const EXPEDITION_SHARD_IDS = new Set(["forest_shard", "tide_shard", "ember_shard"]);

function normalizeExpeditionVault(rawVault, baseVault) {
  const vault = rawVault && typeof rawVault === "object" ? rawVault : {};
  const rawShards = vault.shards && typeof vault.shards === "object" ? vault.shards : {};
  const shards = {};
  Object.keys(rawShards).forEach((shardId) => {
    if (!EXPEDITION_SHARD_IDS.has(shardId)) return;
    const count = clamp(Number(rawShards[shardId]) || 0, 0, 99999);
    if (count > 0) shards[shardId] = count;
  });
  const rawLogs = Array.isArray(vault.logs) ? vault.logs : [];
  const logs = rawLogs.slice(0, 12).map((entry) => ({
    at: Number(entry?.at) || null,
    regionId: typeof entry?.regionId === "string" ? entry.regionId : null,
    loot: entry?.loot && typeof entry.loot === "object" ? entry.loot : {},
    kills: clamp(Number(entry?.kills) || 0, 0, 99),
    retreated: Boolean(entry?.retreated)
  }));
  return {
    shards,
    logs,
    totalExpeditions: clamp(Number(vault.totalExpeditions) || 0, 0, 99999),
    lastExpeditionAt: Number(vault.lastExpeditionAt) || null
  };
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notify() {
  listeners.forEach((listener) => listener(state));
}
