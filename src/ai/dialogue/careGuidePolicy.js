/**
 * Soul Talk 主動關心＋輕輕引導（非審問、非黏人）。
 *
 * 設計依據（一般人聊天研究摘要）：
 * - 問「感受／過程」比問「結果」更能延續對話
 * - 開放式、低門檻；允許沉默，不連珠炮追問
 * - 灰影 short_quiet：引導要短、可拒絕（「若你想…」）
 *
 * 紅線：安全／邊界／安靜請求時不引導；不指揮人生；不製造未讀焦慮。
 */

function pick(lines, seed = 0) {
  return lines[Math.abs(Number(seed) || 0) % lines.length];
}

const THIN_OPEN_RE =
  /^(?:嗨|哈囉|哈咯|安安|在嗎|你在嗎|嗯|還好|普通|沒事|沒怎樣|没怎样|不知道要說什麼|不知道要说什么)[啊呀喔呢嗎嘛。.!！？?\s]*$/;

const SHARE_OR_VENT_ACTS = new Set([
  "describing_event",
  "venting",
  "expressing_emotion",
  "asking_for_help"
]);

/**
 * 極短開場／不知道說什麼：夥伴主動關心並留一扇門。
 * previousReply：避免連續兩輪同一句關心開場（anti-loop 會誤改成 meta 模板）。
 */
export function buildProactiveCareOpen({ inputText = "", seed = 0, previousReply = "" } = {}) {
  const text = String(inputText || "").trim();
  if (!THIN_OPEN_RE.test(text) && !/不知道要說|不知道聊|想聊聊但|有點不知道從哪/.test(text)) {
    return null;
  }
  const lines = [
    "嗯，我在。今天若有哪一小段想提——忙的、煩的、或只是普通的——都可以，不催",
    "我在。你若想說感受也行、只想待著也行；想開口時，從最小的一句開始就好",
    "聽見你了。最近有哪一刻比較沉、或比較鬆，想說再說；不想說我就陪著"
  ];
  const prevNorm = String(previousReply || "")
    .replace(/\s+/g, "")
    .replace(/[，。！？、；：,.!?;:——]/g, "");
  const pool = lines.filter((line) => {
    const norm = line.replace(/\s+/g, "").replace(/[，。！？、；：,.!?;:——]/g, "");
    return !prevNorm || !prevNorm.includes(norm.slice(0, 12));
  });
  return pick(pool.length ? pool : lines, seed);
}

/**
 * 是否在本輪回覆加上「輕輕引導」尾巴。
 */
export function shouldOfferCareGuide({
  inputText = "",
  reply = "",
  nlu = {},
  responseStrategy = null,
  safety = null,
  replySource = ""
} = {}) {
  if (replySource === "safety") return false;
  if (safety?.isHighRisk || safety?.isBoundaryPressure || safety?.action === "boundary_redirect") {
    return false;
  }

  const strategy = responseStrategy?.strategy || responseStrategy || "";
  if (
    ["quiet_presence", "boundary_set", "withdraw", "memory_reference"].includes(strategy)
  ) {
    return false;
  }

  const constraints = nlu?.semanticFrame?.constraints || nlu?.constraints || [];
  if (constraints.includes("quiet_presence") || constraints.includes("no_questions")) {
    return false;
  }

  const text = String(inputText || "");
  if (/不要問|別問|别问|安靜|安静|先別說話|先别说话|不想聊/.test(text)) return false;

  const out = String(reply || "");
  if (!out.trim()) return false;
  // 已有問句／引導就不再疊加，避免審問感。
  if (/[？?]|若你想|想說再說|我聽著|不催/.test(out)) return false;

  const act = nlu?.dialogueAct || nlu?.semanticFrame?.dialogueAct || "";
  if (THIN_OPEN_RE.test(text.trim())) return false; // 改由 proactive open 整句處理
  if (SHARE_OR_VENT_ACTS.has(act)) return true;
  if (/累|悶|煩|慌|空|委屈|難過|卡住|壓力|加班|主管|朋友|已讀|曖昧/.test(text)) return true;
  if (/還好嗎|最近好嗎|你呢/.test(out) && out.length < 20) return false;
  return false;
}

/**
 * 把關心引導織進回覆（灰影偏好單句密度：用分號／破折號，少堆問號）。
 */
export function weaveCareGuideInvite(reply = "", { inputText = "", seed = 0 } = {}) {
  const base = String(reply || "").trim().replace(/[。.!！]+$/, "");
  if (!base) return reply;

  const text = String(inputText || "");
  let invite;
  if (/加班|主管|功勞|離職|同事|任務/.test(text)) {
    invite = pick(
      [
        "若你想點名最沉的那一段，我聽著",
        "今天身體哪裡最緊，想提一句也可以"
      ],
      seed
    );
  } else if (/曖昧|已讀|朋友|分手|告白|他|她/.test(text)) {
    invite = pick(
      [
        "若你想說當下什麼感覺，我聽著，不急著給答案",
        "這件事裡哪個點最刺，想點名也可以"
      ],
      seed
    );
  } else if (/累|悶|煩|慌|空|普通/.test(text)) {
    invite = pick(
      [
        "若你想多待一會兒或再丟一句，我在",
        "沒有大事也可以講；想從感覺開始也行"
      ],
      seed
    );
  } else {
    invite = pick(
      [
        "若你想再往下說一點，我聽著",
        "你若只想停在這裡，也完全可以"
      ],
      seed
    );
  }

  return `${base}——${invite}`;
}

/**
 * @param {object} context
 * @param {boolean} [context.openOnly] 只處理薄開場／不知道說什麼
 * @param {boolean} [context.weaveOnly] 只在定稿後織引導尾巴
 */
export function applyCareGuideToReply(reply, context = {}) {
  if (!context.weaveOnly) {
    const open = buildProactiveCareOpen({
      inputText: context.inputText,
      seed: context.seed,
      previousReply: context.previousReply
    });
    if (open) return open;
    if (context.openOnly) return reply;
  }

  if (context.openOnly) return reply;
  if (!shouldOfferCareGuide({ ...context, reply })) return reply;
  return weaveCareGuideInvite(reply, context);
}

export const CARE_GUIDE_QUICK_REPLIES = Object.freeze([
  { label: "說說感覺", intent: "care_share_feeling" },
  { label: "今天最沉的一段", intent: "care_name_heaviest" },
  { label: "先這樣就好", intent: "care_stop_here" }
]);
