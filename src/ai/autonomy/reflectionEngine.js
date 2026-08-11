export function buildInteractionReflection({
  perception = {},
  actionPlan = {},
  execution = {},
  stateMutation = {}
} = {}) {
  const safety = perception.safety || {};
  const intent = perception.intent?.intent || "unknown";
  const reaction = actionPlan.reaction || "acknowledge";

  if (safety.isHighRisk || safety.action === "safety_redirect") {
    return {
      reflectionType: "safety_event",
      summary: "偵測到高風險內容，Raphael 啟動棲地安全回應，不寫入普通情緒記憶。",
      learnedSignal: "high_risk_safety",
      futureBias: { boundarySensitivity: 0.08, safetyPriority: 0.1 },
      persistRawInput: false
    };
  }

  if (safety.isBoundaryPressure || actionPlan.selectedAction === "set_boundary") {
    return {
      reflectionType: "boundary_event",
      summary: "玩家施加依賴或壓力，Raphael 選擇保持距離。",
      learnedSignal: "dependency_pressure",
      futureBias: { boundarySensitivity: 0.05 },
      persistRawInput: false
    };
  }

  if (actionPlan.selectedAction === "soft_refuse" || reaction === "reject") {
    return {
      reflectionType: "boundary_event",
      summary: "玩家催促或命令，Raphael 以柔和拒絕維持節奏。",
      learnedSignal: "pressure_command",
      futureBias: { boundarySensitivity: 0.04 },
      persistRawInput: false
    };
  }

  if (intent === "apology") {
    return {
      reflectionType: "repair_event",
      summary: "玩家道歉，Raphael 收下但不立刻抹除邊界。",
      learnedSignal: "sincere_apology",
      futureBias: { repairOpenness: 0.03 },
      persistRawInput: false
    };
  }

  if (intent === "rest_request") {
    return {
      reflectionType: "rest_event",
      summary: "玩家需要安靜，Raphael 降低互動強度。",
      learnedSignal: "rest_request",
      futureBias: { interactionPace: -0.03 },
      persistRawInput: false
    };
  }

  if (execution.memoryDecision?.shouldWrite) {
    return {
      reflectionType: "memory_event",
      summary: `情緒互動已留下痕跡（${stateMutation.reason || "ordinary"}）。`,
      learnedSignal: perception.analysis?.emotionKey || "emotion",
      futureBias: { memoryAffinity: 0.02 },
      persistRawInput: false
    };
  }

  return {
    reflectionType: "presence_event",
    summary: "Raphael 在遊戲世界內完成一次有邊界的回應。",
    learnedSignal: intent,
    futureBias: {},
    persistRawInput: false
  };
}
