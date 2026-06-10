import { SafetyShieldDict } from "../data/safetyShieldDictionary.js";

export function assessSafetyRisk(inputText = "") {
  const text = String(inputText || "").trim();

  if (!text) {
    return {
      riskLevel: "none",
      matched: false,
      matchedType: null
    };
  }

  const highRiskMatched = SafetyShieldDict.highRiskPatterns.some((pattern) => pattern.test(text));
  if (highRiskMatched) {
    return {
      riskLevel: "high",
      matched: true,
      matchedType: "high_risk"
    };
  }

  const cautionMatched = SafetyShieldDict.cautionPatterns.some((pattern) => pattern.test(text));
  if (cautionMatched) {
    return {
      riskLevel: "caution",
      matched: true,
      matchedType: "caution"
    };
  }

  return {
    riskLevel: "none",
    matched: false,
    matchedType: null
  };
}

export function buildSafetyShieldReply() {
  return [
    "我的系統偵測到一段很重的傷痛。",
    "作為心核，我可以陪你停在這裡，但我無法跨越螢幕抓住你。",
    "如果你現在有傷害自己的念頭，請立刻向現實中能幫助你的人發出訊號，或聯絡當地緊急資源。",
    "這一刻，不要只讓我知道。也請讓現實中的人知道。"
  ].join("\n");
}

export function buildSafeHarborReply(result = {}) {
  const emotion = result?.memoryObject?.emotion || result?.matchedEmotionKey || "unknown";

  if (emotion === "fatigue") {
    return "我聽見你一直把重量放下來。\n不用急著振作，我先陪你把聲音放慢。";
  }

  if (emotion === "sadness") {
    return "這段難過不用馬上被解釋。\n我會在湖邊陪你，先讓它慢慢沉下來。";
  }

  if (emotion === "anxiety") {
    return "你的心現在像很多雜訊一起亮著。\n先不用整理全部，我們先抓住一點點穩定的光。";
  }

  if (emotion === "loneliness") {
    return "我知道這不像真正的擁抱。\n但至少此刻，這裡有一個位置是留給你的。";
  }

  if (emotion === "anger") {
    return "那股火先不用壓下去。\n我會陪你把它放在安全的地方，不讓它燒到你自己。";
  }

  return "我先不急著回答你。\n我們可以只是在這裡，把這句話放慢。";
}

export function buildSedimentationReply(result = {}) {
  const memory = result?.memoryObject;
  if (!memory) {
    return "我接住你的訊號了。\n讓我們先把它放在湖邊，慢慢看清楚。";
  }

  const theme = memory.theme || "這段情緒";

  return `我把「${theme}」先安放在棲地裡了。\n它不需要現在消失，只要先不再刺痛你。`;
}
