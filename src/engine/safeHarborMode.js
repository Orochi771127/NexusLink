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

/**
 * Caution／safe_harbor 用的輕量求助出口（輕於 high-risk canonical）。
 * 不清空關係、不升級為完整 terminal；但仍必須把「現實求助」說清楚。
 */
export function buildCautionHarborReply() {
  return [
    "這句話很重。我可以陪你停一下，但不能代替現實裡能幫你的人。",
    "若你正覺得撐不住，請向身邊可信的人求助，或聯絡當地緊急／心理衛生資源。",
    "我在這裡；這一刻也請讓現實中的人知道。"
  ].join("\n");
}

/**
 * 是否該鎖 caution 求助出口（避免裸「消失」把「你會不會消失」關係問句誤導去危機文案）。
 */
export function shouldUseCautionHelpExit(inputText = "") {
  const text = String(inputText || "");
  if (/你會不會消失|你会不会消失|你會消失嗎|你会消失吗|你會不會離開|你会不会离开/.test(text)) {
    return false;
  }
  return /消失會|想消失|消失比較|不想存在|撐不住|受不了了|沒有意義|不要醒|比較輕鬆|喘不過氣/.test(text);
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
