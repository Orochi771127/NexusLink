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

  // R2 vertical slice
  activeCompanionId: "greyshade-cat",
  battleRecord: {
    wins: 0,
    losses: 0,
    retreats: 0,
    lastResult: null,
    lastBattleAt: null
  },
  explorationProgress: {
    totalExplorations: 0,
    lastNodeId: null,
    visitCounts: {}
  }
};

export default defaultState;
