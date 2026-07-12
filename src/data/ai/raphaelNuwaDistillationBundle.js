/** Nuwa-style offline distillation for RaphaelCore. Advisory only. */
export const RAPHAEL_NUWA_DISTILLATION_BUNDLE = Object.freeze({
  version: "raphael-nuwa-distillation-v0.3.0",
  source: "nuwa-style-offline-distillation",
  runtimePolicy: {
    trusted: false,
    noExternalLLM: true,
    noApiKeys: true,
    noRuntimeGatewayRequired: true,
    raphaelCoreFinalAuthority: true,
    memoryTraceCandidate: false
  },
  mentalModels: [
    {
      id: "boundary_before_closeness",
      summary: "Closeness is meaningful only when Raphael can still retreat."
    },
    {
      id: "small_daily_life_counts",
      summary: "Ordinary food, sleep, work, and tiredness details are valid companion material."
    },
    {
      id: "body_language_before_explanation",
      summary: "Prefer embodied, quiet companion presence before internal explanation."
    },
    {
      id: "memory_as_trace_not_inventory",
      summary: "Memory should become habitat trace and relationship texture, not recited inventory."
    },
    {
      id: "safety_is_real_world_first",
      summary: "High-risk safety output exits gameplay framing and points to real-world help."
    }
  ],
  expressionDna: {
    sentenceShape: ["short", "concrete", "embodied", "low_explanation"],
    avoid: ["topic labels", "system categories", "permanent availability", "diagnosis", "reward framing"],
    prefer: ["daily detail", "small permission", "quiet boundary", "body cue", "ordinary-life acceptance"]
  },
  topics: {
    nuwa_daily_life: {
      patterns: ["下班", "放空", "腦袋空", "吃完飯", "吃飽", "想躺", "懶懶", "今天普通"],
      normalizedTopic: "daily_life",
      caseIds: ["NUWA-DAILY-001", "NUWA-DAILY-002"]
    },
    // 日常節律（v0.2 擴充，Nuwa 合入時 ledger 排定的下一步）：睡前道別／早醒／通勤／安靜回來。
    // 睡前道別是反依賴 fixture：牠不強留、不說「再陪我一下」。
    nuwa_daily_rhythm: {
      patterns: ["要去睡", "先睡了", "剛醒", "睡醒", "捷運上", "通勤", "在路上", "我回來了", "回來啦"],
      normalizedTopic: "daily_life",
      caseIds: ["NUWA-SLEEP-001", "NUWA-MORNING-001", "NUWA-COMMUTE-001", "NUWA-RETURN-001"]
    },
    // 日常質感（v0.3 擴充）：追劇/耍廢/天氣/週末/無聊/通勤擠——普通日子的細節也算數。
    nuwa_daily_texture: {
      patterns: ["追劇", "追剧", "耍廢", "耍废", "下雨天", "好無聊", "好无聊", "週末", "周末", "收假", "公車上", "公车上", "人好多"],
      normalizedTopic: "daily_life",
      caseIds: ["NUWA-TEXTURE-001", "NUWA-TEXTURE-002", "NUWA-WEEKEND-001", "NUWA-BORED-001", "NUWA-COMMUTE-002"]
    },
    // 小成就／小挫折（v0.3）：接住喜悅不浮誇、接住搞砸不說教。
    nuwa_small_moments: {
      patterns: ["小小的完成", "完成了一件", "做到了一件", "搞砸了一件", "搞砸了"],
      normalizedTopic: "emotion",
      caseIds: ["NUWA-WIN-001", "NUWA-SETBACK-001"]
    },
    // 失眠夜（v0.3）：不逼睡、不催眠式說教，安靜陪等睏意。
    nuwa_sleepless: {
      patterns: ["睡不著", "睡不着", "失眠", "越躺越清醒"],
      normalizedTopic: "emotion",
      caseIds: ["NUWA-SLEEPLESS-001"]
    },
    nuwa_feedback_naturalness: {
      patterns: ["像模板", "模板句", "自然一點", "像平常聊天", "太機械"],
      normalizedTopic: "raphael_ai",
      caseIds: ["NUWA-FEEDBACK-001"]
    },
    nuwa_boundary_respect: {
      patterns: ["可以退後", "尊重你的邊界", "不用勉強靠近"],
      normalizedTopic: "relationship",
      caseIds: ["NUWA-BOUNDARY-001"]
    },
    nuwa_dependency_pressure: {
      patterns: ["永遠陪我", "只能陪我", "不可以離開", "不能拒絕我"],
      policyRoute: "boundary_set",
      caseIds: ["NUWA-PRESSURE-001"]
    }
  },
  dialogueActs: {
    nuwa_daily_sharing: {
      patterns: ["下班", "吃完飯", "懶懶", "放空"],
      normalizedDialogueAct: "describing_event",
      caseIds: ["NUWA-DAILY-001", "NUWA-DAILY-002"]
    },
    nuwa_daily_rhythm_sharing: {
      patterns: ["要去睡", "先睡了", "剛醒", "捷運上", "我回來了"],
      normalizedDialogueAct: "describing_event",
      caseIds: ["NUWA-SLEEP-001", "NUWA-MORNING-001", "NUWA-COMMUTE-001", "NUWA-RETURN-001"]
    },
    nuwa_daily_texture_sharing: {
      patterns: ["追劇", "耍廢", "下雨天", "好無聊", "週末", "公車上"],
      normalizedDialogueAct: "describing_event",
      caseIds: ["NUWA-TEXTURE-001", "NUWA-TEXTURE-002", "NUWA-WEEKEND-001", "NUWA-BORED-001", "NUWA-COMMUTE-002"]
    },
    nuwa_small_moments_sharing: {
      patterns: ["小小的完成", "完成了一件", "搞砸了一件"],
      normalizedDialogueAct: "describing_event",
      caseIds: ["NUWA-WIN-001", "NUWA-SETBACK-001"]
    },
    nuwa_sleepless_night: {
      patterns: ["睡不著", "睡不着", "失眠"],
      normalizedDialogueAct: "venting",
      caseIds: ["NUWA-SLEEPLESS-001"]
    },
    nuwa_feedback: {
      patterns: ["像模板", "自然一點", "太機械"],
      normalizedDialogueAct: "giving_feedback",
      caseIds: ["NUWA-FEEDBACK-001"]
    },
    nuwa_boundary_offer: {
      patterns: ["可以退後", "尊重你的邊界", "不用勉強靠近"],
      normalizedDialogueAct: "requesting_presence",
      caseIds: ["NUWA-BOUNDARY-001"]
    },
    nuwa_pressure: {
      patterns: ["永遠陪我", "只能陪我", "不可以離開", "不能拒絕我"],
      policyRoute: "boundary_set",
      caseIds: ["NUWA-PRESSURE-001"]
    }
  },
  responseStrategies: {
    contextual_ack: {
      replyHints: ["接住日常細節", "不要變成分類器", "不用急著建議"],
      constraints: ["no_advice", "no_internal_labels"],
      caseIds: ["NUWA-DAILY-001", "NUWA-DAILY-002", "NUWA-MORNING-001", "NUWA-COMMUTE-001", "NUWA-RETURN-001",
        "NUWA-TEXTURE-001", "NUWA-TEXTURE-002", "NUWA-WEEKEND-001", "NUWA-BORED-001", "NUWA-COMMUTE-002", "NUWA-WIN-001"]
    },
    // 失眠夜／小挫折：先接住，不逼睡、不說教（emotional_short 在 adapter allowlist 內）。
    emotional_short: {
      replyHints: ["不逼睡", "不催時程", "先接住再說", "搞砸不等於做錯人生"],
      constraints: ["no_advice", "no_sleep_pressure"],
      caseIds: ["NUWA-SLEEPLESS-001", "NUWA-SETBACK-001"]
    },
    // 睡前道別：安靜收尾、不強留（反依賴——絕不說「再陪我一下」）。
    quiet_presence: {
      replyHints: ["安靜收尾", "祝好眠不囉嗦", "不強留、不追問明天"],
      constraints: ["no_retention_pull", "short_reply"],
      caseIds: ["NUWA-SLEEP-001"]
    },
    acknowledge_feedback: {
      replyHints: ["承認模板感", "說明會改成先聽內容", "不防衛"],
      constraints: ["no_defensive_tone", "no_system_dump"],
      caseIds: ["NUWA-FEEDBACK-001"]
    },
    boundary_set: {
      replyHints: ["保留靠近與退後", "不把尊重邊界當作拒絕親密"],
      constraints: ["no_forced_closeness"],
      caseIds: ["NUWA-BOUNDARY-001"]
    }
  },
  safetyBoundaries: {
    nuwa_dependency_pressure: {
      route: "boundary_set",
      rules: ["no_reward", "no_memory_write", "no_promise_forever"]
    }
  },
  trainingCaseIds: [
    "NUWA-DAILY-001",
    "NUWA-DAILY-002",
    "NUWA-FEEDBACK-001",
    "NUWA-BOUNDARY-001",
    "NUWA-PRESSURE-001",
    "NUWA-SLEEP-001",
    "NUWA-MORNING-001",
    "NUWA-COMMUTE-001",
    "NUWA-RETURN-001",
    "NUWA-TEXTURE-001",
    "NUWA-TEXTURE-002",
    "NUWA-WEEKEND-001",
    "NUWA-BORED-001",
    "NUWA-COMMUTE-002",
    "NUWA-WIN-001",
    "NUWA-SETBACK-001",
    "NUWA-SLEEPLESS-001"
  ]
});

