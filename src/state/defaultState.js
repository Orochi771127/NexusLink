const defaultState = {
  bond: 0,
  trust: 5,
  mood: "calm",
  energy: 10,
  spamScore: 0,
  lastMessage: "",
  chatHistory: [
    {
      role: "companion",
      text: "我在這裡，安靜地看著你。"
    }
  ],
  defense: 35,
  touchFatigue: 0,
  lastTouchAt: null,
  lastRejectAt: null,
  blockedTouchCount: 0,
  lastBlockedTouchAt: null,
  lastSeenAt: Date.now(),
  timeAnomalyCount: 0,
  firstTouchCompleted: false,
  firstHugCompleted: false,
  reactionPreview: "",
  lastTouchReaction: "",
  memories: [],
  habitatTraces: [],

  // Phase 1.1 Emotional Sedimentation
  memorySchemaVersion: 1,
  emotionalMemories: [],
  safeHarborMode: false,
  lastEmotionTag: null,
  habitatRepairFactor: 0,

  playerProfile: {
    displayName: "",
    identitySkipped: false,
    createdAt: null,
    updatedAt: null
  },
  onboarding: {
    version: 1,
    status: "pending",
    completed: false,
    completedAt: null,
    startedAt: null,
    identityCompleted: false,
    guidanceCompleted: false,
    greyshadeMetAt: null,
    veteranAutoCompleted: false,
    // Meet 之後的首輪閉環（First Touch → First Soul Talk → First Trace）。
    // 只持久化「跳過/完成」時間戳；進行中的 stage 由既有欄位 derive、不落地。
    // 舊存檔缺此物件時由 normalizeFirstLoop 回填（已完成 onboarding 者直接視為完成，永不重跑）。
    firstLoop: {
      skippedAt: null,
      completedAt: null
    }
  },

  // First Session → Return Echo：首輪安靜開場是否已看過（strict 持久化，非 derived 判斷）。
  // null = 尚未看過；看過後寫入 timestamp。存在既有 STORAGE_KEY 之內，不新增 localStorage key。
  firstSessionOpeningSeenAt: null,

  // R2 vertical slice
  activeCompanionId: "greyshade-cat",
  unlockedCompanionIds: [
    "greyshade-cat",
  ],
  battleRecord: {
    wins: 0,
    losses: 0,
    retreats: 0,
    lastResult: null,
    lastBattleAt: null
  },
  // 章節旅程（CH-4 骨架）：current=當前章（1-7）、completed=已通關章號。
  // 推進由章節對峙通關觸發（CH-5，advanceChapterProgress）。存於既有 STORAGE_KEY，無新 key。
  chapterProgress: {
    current: 1,
    completed: []
  },
  // 共鳴圈（CH-5b）：章節相遇與共鳴邀請的持久層。存於既有 STORAGE_KEY，無新 key。
  // chapterMarks[章號]＝進入該章時的關係快照（邀請判定用「現值−快照」＝這一章的增量；
  // 被拒後重新快照＝可再培養再問，永不鎖死）。companions[id]＝相遇/邀請狀態。
  resonance: {
    chapterMarks: {},
    companions: {}
  },
  explorationProgress: {
    totalExplorations: 0,
    lastNodeId: null,
    visitCounts: {}
  },

  // 玩家偏好（Settings 持久化）。存在既有 STORAGE_KEY 之內，不新增 localStorage key。
  // 預設值對齊 index.html 的 Settings 初始狀態。音效靜音(mute)維持既有獨立 key，不併入此處。
  settings: {
    volMaster: 80,
    volBgm: 70,
    volSfx: 80,
    quality: "high",
    textSize: "medium",
    lowMotion: false,
    lang: "tc"
  }
};

export default defaultState;
