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
  habitatTraces: []
};

export default defaultState;
