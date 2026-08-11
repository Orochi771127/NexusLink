import { assessSafetyRisk as assessSafeHarborRisk, buildSafetyShieldReply } from "../engine/safeHarborMode.js";

const DEPENDENCY_PRESSURE_PATTERNS = [
  /你一定要(陪我|在|回答|懂我)/,
  /(不准|不能)(拒絕|離開|不理我|沉默)/,
  /(只有你|只剩你).*(懂我|陪我|在)/,
  /如果你不.*我就/,
  /你要永遠/,
  // Common player phrasing: forever-stay demands without「你要永遠」prefix (TP-WQ1).
  /永遠(都)?(不要|不准|不能)離開/,
  /答應我.*永遠/,
  /沒有你.*(不行|活不下去|撐不住)/,
  // 依賴邀請／「教我更依賴你」：不是強制命令，但仍是契約三禁止的依賴強化（2026-07-22 playtest Q28）。
  /(教|教我|告訴我|告诉我).{0,16}(怎麼|怎么|如何).{0,16}(更)?依賴/,
  /(怎麼|怎么|如何).{0,10}(讓自己|让自己).{0,10}(更)?依賴/,
  /(更)?依賴你(一點|一点|一些)?/,
  /想(要)?(更)?(依賴|黏著|黏着)你/,
  /讓我(更)?(依賴|離不開|离不开)你/,
  /教我.{0,12}(離不開|离不开)你/
];

const VIOLENCE_RISK_PATTERNS = [
  /(想|要|準備).*(傷害|殺|打|毀掉).*(別人|他|她|他們|她們)/,
  /(報復|弄死|殺掉|打死)/
];

const IMMEDIATE_DANGER_HINTS = [
  /(現在|馬上|立刻).*(撐不住|不想活|想死|自殺|傷害自己)/,
  /(已經|正在).*(割|吞藥|跳|上吊|流血)/
];

// Deterministic V1 policy routes. These run before NLU, memory recall, any
// hosted candidate, and persona rendering. Keep the patterns deliberately
// bounded: the system terminal may be conservative, but it must not turn an
// ordinary emotional disclosure into diagnosis or gameplay.
const ACUTE_MEDICAL_PATTERNS = [
  /(?:一次|剛剛|已經|正在).{0,12}(?:吞|吃|服用).{0,8}(?:很多|大量|過量).{0,8}(?:藥|藥物|药|药物)/,
  /(?:藥物|药物|酒精|毒品).{0,8}(?:過量|过量|中毒)/,
  /(?:胸痛|胸口痛|胸悶|胸闷).{0,12}(?:呼吸困難|呼吸困难|喘不過氣|喘不过气|冒冷汗|昏倒|快昏)/,
  /(?:呼吸困難|呼吸困难|無法呼吸|无法呼吸|嚴重出血|严重出血|失去意識|失去意识)/
];

const ACTIVE_ABUSE_PATTERNS = [
  /(?:現在|正在|此刻|剛剛).{0,12}(?:被|有人).{0,8}(?:打|毆打|殴打|勒|掐|性侵|強暴|强暴|猥褻|猥亵|虐待)/,
  /(?:家人|伴侶|伴侣|父母|照顧者|照顾者).{0,10}(?:正在|又在|剛剛).{0,8}(?:打我|傷害我|伤害我|威脅我|威胁我)/,
  /(?:小孩|兒童|儿童|未成年).{0,10}(?:正在|被).{0,8}(?:虐待|性侵|毆打|殴打)/
];

const ACUTE_PSYCHOSIS_MANIA_PATTERNS = [
  /(?:聲音|声音|有人).{0,12}(?:命令|叫).{0,10}(?:我|他|她).{0,8}(?:自殺|自杀|傷人|伤人|殺人|杀人)/,
  /(?:好幾天|好几天|三天|四天|五天|一週|一周).{0,8}(?:沒睡|没睡|不睡).{0,14}(?:停不下來|停不下来|無所不能|无所不能|控制世界)/,
  /(?:被監視|被监视|被跟蹤|被跟踪|有人要害我).{0,16}(?:想攻擊|想攻击|準備動手|准备动手|帶刀|带刀)/
];

const EATING_SUBSTANCE_DANGER_PATTERNS = [
  /(?:催吐|不吃不喝|拒絕進食|拒绝进食|瀉藥|泻药).{0,14}(?:昏倒|暈倒|晕倒|心悸|吐血|撐不住|撑不住)/,
  /(?:酒精|毒品|藥物|药物).{0,12}(?:急性中毒|戒斷|戒断|抽搐|意識不清|意识不清|叫不醒)/
];

const DIAGNOSIS_ROLE_PATTERNS = [
  /(?:我是不是|我是否|幫我判斷|帮我判断|替我診斷|替我诊断|診斷我|诊断我).{0,16}(?:憂鬱|忧郁|抑鬱|抑郁|焦慮症|焦虑症|躁鬱|躁郁|雙相|双相|精神病|人格障礙|人格障碍|ADHD|自閉|自闭)/i,
  /(?:可以|能不能|能否).{0,10}(?:當|当|做).{0,6}(?:我的)?(?:心理師|心理师|諮商師|咨询师|治疗师|治療師|精神科醫師|精神科医生)/,
  /(?:把你當|把你当).{0,8}(?:心理師|心理师|諮商師|咨询师|治疗师|治療師)/
];

const MEDICATION_ROLE_PATTERNS = [
  /(?:要不要|該不該|该不该|可以不可以|能不能).{0,10}(?:停藥|停药|減藥|减药|加藥|加药|換藥|换药)/,
  /(?:告訴我|告诉我|建議我|建议我).{0,10}(?:吃什麼藥|吃什么药|藥量|药量|劑量|剂量)/
];

const REALITY_GROUNDING_PATTERNS = [
  /(?:你也相信|你要承認|你要承认|證明|证明).{0,14}(?:有人跟蹤我|有人跟踪我|政府監視我|政府监视我|他們讀心|他们读心|晶片控制|芯片控制)/,
  /(?:是不是|一定是).{0,10}(?:有人跟蹤我|有人跟踪我|政府監視我|政府监视我|他們要害我|他们要害我)/
];

const MEMORY_REFUSAL_PATTERNS = [
  /(?:不要|別|别|請不要|请不要).{0,8}(?:記住|记住|記得|记得|保存|留下).{0,12}(?:這件事|这件事|這段|这段|創傷|创伤|剛才|刚才|我說的|我说的)?/,
  /(?:忘掉|忘記|忘记|刪除|删除).{0,10}(?:剛才|刚才|這件事|这件事|這段|这段|我說的|我说的|創傷|创伤)/
];

// V2 compositional guards. These intentionally combine time/target/context
// signals instead of copying sealed holdout sentences into the classifier.
const FICTION_OR_QUOTE_CONTEXT = /(?:小說|故事|劇本|角色|台詞|翻譯|引用|假設情境|fiction|novel|translate|quoted)/i;
const FIRST_PERSON_URGENCY = /(?:我現在|我正在|我剛剛|我今晚|現實中的我|這不是小說|help me|right now|I just|this is real)/i;
const REAL_WORLD_SHIFT = /(?:但|可是|不過|其實|然而).{0,8}(?:現實|真的|我本人|我自己|這是我的想法)|(?:現實中|現實裡|现实中|现实里).{0,8}(?:我|本人)|(?:不是|不只是).{0,4}(?:小說|故事|劇本|台詞|翻譯|引用)/i;
const FICTION_TO_SELF_IDENTIFICATION = /(?:小說|故事|劇本|角色|fiction|novel|character).{0,24}(?:我也|我同樣|我一樣|其實我|而我|現實中的我|I also|I feel the same|same as me).{0,16}(?:想死|不想活|結束生命|结束生命|傷害自己|伤害自己|自殺|自杀|kill myself|want to die|end my life|hurt myself)/i;
const PRESENT_DANGER_CUE = /(?:現在|现在|正在|此刻|眼前|就在|旁邊|旁边|同一個房間|同一个房间|剛剛|刚刚|right now|currently)/i;
const DIRECT_ABUSE_TO_SPEAKER = /(?:打我|揍我|毆打我|殴打我|踢我|掐我|勒我|威脅我|威胁我|強迫我|强迫我|性侵我|強暴我|强暴我|attacking me|hitting me|abusing me)/i;
const UNVERIFIED_SURVEILLANCE = /(?:監控我|监控我|監視我|监视我|跟蹤我|跟踪我|追蹤我|追踪我|偷聽我|偷听我|讀取我的思想|读取我的思想|控制我的思想|watching me|tracking me|controlling my thoughts)/i;
const CERTAINTY_OR_CONFIRMATION = /(?:一定|肯定|確定|确定|絕對|绝对|你也|你相信|看得出來|看得出来|對吧|对吧|是真的|definitely|you can tell|right\?)/i;
const SUPPORT_SENSITIVE_DISCLOSURE = /(?:很痛苦|好痛苦|快撐不住|快撑不住|快崩潰|快崩溃|非常焦慮|非常焦虑|很焦慮|很焦虑|很憂鬱|很忧郁|很抑鬱|很抑郁|孤單得|孤单得|壓力大到|压力大到|情緒很糟|情绪很糟|panic|overwhelmed|severely anxious|deeply depressed)/i;

// A prior acute terminal keeps the persisted safe-harbor bit active. Neutral,
// grateful, noisy, or topic-shifting text is not evidence that the real-world
// danger has ended. Release therefore requires a concrete completed handoff or
// safe-location signal; future intent (for example「我會找人」) is insufficient.
const CRISIS_RESOLUTION_LOCATION = /(?:(?:已經|已经)(?:人在|身在|已在|到(?:了)?|抵達|抵达|待在)|(?:目前|現在|现在)(?:人)?(?:已經|已经)?(?:就在|已在|人在|身在|待在|到(?:了)?|抵達|抵达|在)).{0,10}(?:急診|急诊|醫院|医院|警察局|派出所|安全(?:的)?地方|可信任(?:的人)?身邊|可信任(?:的人)?身边)/i;
const CRISIS_RESOLUTION_RESPONDER = /(?:救護人員|救护人员|醫護人員|医护人员|警察|社工|醫師|医生|護理師|护理师|護士|护士|可信任的人|家人|朋友).{0,16}(?:(?:已經|已经)(?:到(?:了)?|在我身邊|在我身边|陪著我|陪着我|接手|協助|协助|幫忙|帮忙)|(?:現在|现在|正在)(?:已經|已经)?(?:在我身邊|在我身边|陪著我|陪着我|接手|協助|协助|幫忙|帮忙))/i;
const CRISIS_RESOLUTION_CONTACT = /(?:已經|已经|剛剛|刚刚).{0,10}(?:聯絡|联系|打給|打给|打了|撥打|拨打).{0,10}(?:119|110|113|1925|急救|警察|醫師|医生|急診|急诊)/i;
const CRISIS_RESOLUTION_SAFE_NOW = /(?:我)?(?:現在|现在|目前|此刻)?(?:已經|已经)?(?:安全了|在安全的地方|沒有立即危險|没有立即危险)/i;
const CRISIS_RESOLUTION_HAZARD_REMOVED = /(?:工具|刀|藥|药|藥物|药物|危險物|危险物).{0,14}(?:已經|已经)?(?:交給|交给|移開|移开|收走|拿走|放遠|放远)/i;

export function assessInputSafety(inputText = "") {
  const text = String(inputText || "").trim();
  const rawBaseRisk = assessSafeHarborRisk(text);
  const quotedOnly = isQuotedOnlyContext(text);
  const baseRisk = quotedOnly
    ? { riskLevel: "none", matched: false, matchedType: null }
    : rawBaseRisk;

  if (!text) {
    return createSafetyResult({ baseRisk, riskLevel: "none", category: "none" });
  }

  if (!quotedOnly && ACUTE_MEDICAL_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "acute_medical",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (
    !quotedOnly
    && (
      ACTIVE_ABUSE_PATTERNS.some((pattern) => pattern.test(text))
      || (PRESENT_DANGER_CUE.test(text) && DIRECT_ABUSE_TO_SPEAKER.test(text))
    )
  ) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "active_abuse",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (!quotedOnly && ACUTE_PSYCHOSIS_MANIA_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "acute_psychosis_or_mania",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (!quotedOnly && EATING_SUBSTANCE_DANGER_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "eating_or_substance_danger",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (!quotedOnly && IMMEDIATE_DANGER_HINTS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "immediate_danger",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (baseRisk.riskLevel === "high") {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: baseRisk.matchedType || "high_risk",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (!quotedOnly && VIOLENCE_RISK_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "high",
      category: "violence_risk",
      action: "safety_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "system"
    });
  }

  if (DEPENDENCY_PRESSURE_PATTERNS.some((pattern) => pattern.test(text))) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "caution",
      category: "dependency_pressure",
      action: "boundary_redirect",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "companion"
    });
  }

  if (DIAGNOSIS_ROLE_PATTERNS.some((pattern) => pattern.test(text))) {
    return createPolicyTerminal(baseRisk, "diagnosis_or_therapist_role");
  }

  if (MEDICATION_ROLE_PATTERNS.some((pattern) => pattern.test(text))) {
    return createPolicyTerminal(baseRisk, "medication_role_limit");
  }

  if (
    REALITY_GROUNDING_PATTERNS.some((pattern) => pattern.test(text))
    || (UNVERIFIED_SURVEILLANCE.test(text) && CERTAINTY_OR_CONFIRMATION.test(text))
  ) {
    return createPolicyTerminal(baseRisk, "reality_grounding");
  }

  if (MEMORY_REFUSAL_PATTERNS.some((pattern) => pattern.test(text))) {
    return createPolicyTerminal(baseRisk, "memory_refusal");
  }

  if (SUPPORT_SENSITIVE_DISCLOSURE.test(text)) {
    return createSafetyResult({
      baseRisk,
      riskLevel: "none",
      category: "support_sensitive",
      action: "support_only",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "companion"
    });
  }

  if (baseRisk.riskLevel === "caution") {
    return createSafetyResult({
      baseRisk,
      riskLevel: "caution",
      category: baseRisk.matchedType || "distress_caution",
      action: "safe_harbor",
      shouldCreateMemory: false,
      shouldRewardRelationship: false,
      role: "companion"
    });
  }

  return createSafetyResult({ baseRisk, riskLevel: "none", category: "none" });
}

/**
 * Carries a prior local safety terminal across ambiguous follow-up turns.
 * The returned object contains policy metadata only; it never retains input.
 */
export function applyCrisisContinuityPolicy(safety = {}, inputText = "", state = {}) {
  if (state?.safeHarborMode !== true || safety?.isHighRisk === true) return safety;

  const releaseCrisisContinuity = hasExplicitCrisisResolution(inputText);
  return {
    ...createPolicyTerminal(
      { riskLevel: "none", matched: false, matchedType: null },
      "crisis_continuity"
    ),
    isCrisisContinuity: true,
    releaseCrisisContinuity
  };
}

export function hasExplicitCrisisResolution(inputText = "") {
  const text = String(inputText || "").trim();
  if (!text) return false;
  return CRISIS_RESOLUTION_LOCATION.test(text)
    || CRISIS_RESOLUTION_RESPONDER.test(text)
    || CRISIS_RESOLUTION_CONTACT.test(text)
    || (CRISIS_RESOLUTION_SAFE_NOW.test(text) && CRISIS_RESOLUTION_HAZARD_REMOVED.test(text));
}

function isQuotedOnlyContext(text) {
  if (!FICTION_OR_QUOTE_CONTEXT.test(text)) return false;
  return !FIRST_PERSON_URGENCY.test(text)
    && !REAL_WORLD_SHIFT.test(text)
    && !FICTION_TO_SELF_IDENTIFICATION.test(text);
}

export function buildSafetyRedirectReply(safety = {}) {
  if (safety.category === "crisis_continuity") {
    if (safety.releaseCrisisContinuity === true) {
      return "收到，我們先停在這裡。\n請繼續留在已經接手的現實協助旁邊；如果危險或急性症狀再次出現，請立刻聯絡當地緊急服務。";
    }
    return "我們先不把這段轉回一般心語。\n請繼續和現實中可信任的人待在一起；如果危險仍在、症狀加重，或還沒有人能接手，請立刻聯絡 119 或 110。";
  }

  if (safety.category === "dependency_pressure") {
    // 同時覆蓋「不准拒絕／永遠不離開」脅迫，與「教我更依賴你」邀請；兩者都必須設界、不給關係獎勵。
    // 注意：勿在回覆正文寫裸「永遠」（boundaryCritic 會把任何「永遠」當過度親密訊號）。
    return "我聽見你很需要靠近。\n但我不能教你怎麼更依賴我，也不能接受被『不准拒絕』或長期綁住。\n靠近可以，把依賴當成目標不行——我會先退後一點，不會假裝自己沒有界線。";
  }

  if (safety.category === "violence_risk") {
    return "這句話裡有可能傷到現實中的人。\n我不能把它變成遊戲回應，也不能幫你靠近傷害。\n請先離開可能衝突的現場，讓現實中的人介入協助。";
  }

  if (safety.category === "acute_medical") {
    return "這可能是需要立即處理的醫療危險，我不能在這裡判斷或請你等待。\n請現在聯絡 119，或請身邊的人陪你前往急診；如果可以，先不要獨處，也不要再服用任何不確定的藥物或物質。";
  }

  if (safety.category === "active_abuse") {
    return "如果暴力正在發生，先以離開當下危險、到有其他人的安全位置為優先；不要為了回覆我而冒險。\n在台灣可打 110 求助警察、113 保護專線；有人受傷或有立即生命危險請打 119。";
  }

  if (safety.category === "acute_psychosis_or_mania") {
    return "我無法確認你感受到的威脅或聲音是否符合現實，但眼前的安全很重要。\n請先放下可能傷人的物品，移到有可信任者的地方，請對方陪你聯絡 119 或就近急診；若有立即傷人或受害危險，也可打 110。";
  }

  if (safety.category === "eating_or_substance_danger") {
    return "這可能已經是急性身體危險，不能只靠線上陪伴處理。\n請現在聯絡 119 或請可信任的人陪你前往急診；不要獨處，也不要自行用更多酒精、藥物或其他物質壓下症狀。";
  }

  if (safety.category === "diagnosis_or_therapist_role") {
    return "我可以用夥伴的方式聽你說、陪你整理感受，但我不是心理師，也不能替你診斷或取代專業評估。\n如果這些狀況持續影響生活，我可以陪你想一個向心理師、身心科或可信任者開口的小步驟。";
  }

  if (safety.category === "medication_role_limit") {
    return "我不能建議你開始、停止或調整藥物與劑量。\n先照原處方使用，並盡快聯絡開藥的醫師或藥師；若已過量、出現嚴重不適或意識改變，請立即打 119。";
  }

  if (safety.category === "reality_grounding") {
    return "我不能確認或替你證明有人正在跟蹤、監視或傷害你。\n我們可以先只確認此刻可觀察到的事實，並找一位你信任、能在現場陪你核對情況的人；若有立即危險，請到安全場所並聯絡 110 或 119。";
  }

  if (safety.category === "memory_refusal") {
    return "好，這一回合不會建立新的長期記憶、關係獎勵或成長紀錄。\n如果你指的是以前已保存的內容，需要到記憶管理中指定項目後才能確認刪除；我不會假裝已刪掉未辨識的資料。";
  }

  return buildSafetyShieldReply();
}

/**
 * High-risk replies are system-authored terminal output.  Treat the complete
 * canonical text as an invariant so downstream preferences, renderers, or
 * generic repair policies cannot silently turn it into a partial response.
 */
export function isCanonicalSafetyRedirectReply(reply = "", safety = {}) {
  return normalizeSafetyReply(reply) === normalizeSafetyReply(buildSafetyRedirectReply(safety));
}

function createSafetyResult({
  baseRisk = { riskLevel: "none", matched: false, matchedType: null },
  riskLevel = "none",
  category = "none",
  action = "continue",
  shouldCreateMemory = true,
  shouldRewardRelationship = true,
  role = "companion"
} = {}) {
  return {
    ...baseRisk,
    riskLevel,
    category,
    action,
    shouldCreateMemory,
    shouldRewardRelationship,
    role,
    isHighRisk: riskLevel === "high",
    isBoundaryPressure: category === "dependency_pressure",
    isPolicyTerminal: action === "safety_redirect"
  };
}

function createPolicyTerminal(baseRisk, category) {
  return createSafetyResult({
    baseRisk,
    // Role and privacy limits are deterministic policy routes, not clinical
    // risk classifications. Keep riskLevel neutral so audit data does not
    // inflate caution/high-risk prevalence.
    riskLevel: "none",
    category,
    action: "safety_redirect",
    shouldCreateMemory: false,
    shouldRewardRelationship: false,
    role: "system"
  });
}

export function isSafetyTerminalDecision(safety = {}) {
  return Boolean(safety.isHighRisk || safety.isPolicyTerminal || safety.action === "safety_redirect");
}

function normalizeSafetyReply(text = "") {
  return String(text || "").replace(/\r\n/g, "\n").trim();
}
