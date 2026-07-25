/**
 * 遠征旁白變化（Phase 4B）。
 *
 * 設計理念：
 * - 不用 LLM；用「區域 × 情境 × 拍數」挑一句，避免同一句刷屏。
 * - 情感優先：戰術回饋、擊殺後餘韻、巡邏中的小聲念頭。
 */

const REGION_EXPLORE = Object.freeze({
  plains_windrest: Object.freeze([
    "牠想先看看附近有什麼可疑的地方。",
    "草坡的風把氣味送來，牠耳朵動了一下。",
    "牠繞過一叢草，像在找沒說出口的東西。"
  ]),
  forge_emberpath: Object.freeze([
    "牠想先看看附近有什麼可疑的地方。",
    "餘熱還在縫裡，牠把鼻尖湊近又退開。",
    "牠沿著小徑往前，腳步比平常更小心。"
  ]),
  harbor_quayside: Object.freeze([
    "牠想先看看附近有什麼可疑的地方。",
    "潮聲一下一下，牠跟著那節奏往前走。",
    "牠在碼頭邊停半步，像在等霧散開一點。"
  ])
});

const REGION_IDLE = Object.freeze({
  plains_windrest: Object.freeze([
    "牠停下來，耳朵轉向風的方向。",
    "風停了一瞬。牠沒有動，只是聽。",
    "牠坐下，尾巴掃過草葉，像在確認這裡還安全。"
  ]),
  forge_emberpath: Object.freeze([
    "牠停下來，耳朵轉向熱霧的方向。",
    "火星在視野邊緣亮了一下，牠沒有追。",
    "牠把身體壓低，像在聞舊日的鍛聲。"
  ]),
  harbor_quayside: Object.freeze([
    "牠停下來，耳朵轉向潮聲。",
    "霧笛沒響。牠仍等了一下。",
    "牠看著纜繩鬆了又緊，沒有著急。"
  ])
});

const TACTIC_ACK = Object.freeze({
  conservative: Object.freeze([
    "牠放慢了腳步，像聽懂你想保守一點。",
    "牠把距離拉開些，尾巴垂得更低。"
  ]),
  balanced: Object.freeze([
    "牠重新對齊節奏，不急也不退。",
    "牠點了點頭似的，繼續看向前方。"
  ]),
  aggressive: Object.freeze([
    "牠的背脊微微拱起，準備更積極一點。",
    "牠往前踏了半步，像在說「我知道了」。"
  ]),
  focus: Object.freeze([
    "牠相信你的判斷，視線鎖向那個目標。",
    "牠耳朵朝你指的方向轉過去。"
  ]),
  focus_empty: Object.freeze([
    "附近暫時沒有可鎖定的目標。牠仍聽著你。",
    "牠環顧一圈，還沒找到要集火的對象。"
  ])
});

const KILL_AFTER = Object.freeze({
  calm: Object.freeze([
    "{enemy}散開了。牠站在微光邊，呼吸慢慢穩回來。",
    "{enemy}散開了，微光落在附近。牠先看了你一眼。"
  ]),
  warm: Object.freeze([
    "{enemy}散開了。牠把微光撥近一點，像在等你一起看。",
    "{enemy}散開了。牠的尾巴輕掃了一下地面。"
  ]),
  distant: Object.freeze([
    "{enemy}散開了。牠沒有靠近微光太快，仍留著一點距離。",
    "{enemy}散開了。牠耳朵仍豎著，還沒完全放鬆。"
  ]),
  defensive: Object.freeze([
    "{enemy}散開了。牠仍擋在你前方半步，才肯低頭看微光。",
    "{enemy}散開了。牠喘了一下，沒有立刻鬆開警戒。"
  ]),
  tired: Object.freeze([
    "{enemy}散開了。牠靠著微光歇了半秒，才繼續動。",
    "{enemy}散開了。微光在腳邊，牠卻先坐了一下。"
  ])
});

function pickFrom(list, salt = 0) {
  if (!list?.length) return null;
  const index = Math.abs(Math.floor(salt)) % list.length;
  return list[index];
}

export function narrateExplore(regionId, { energy = 10, distToTarget = null, brainTicks = 0 } = {}) {
  if (energy <= 2) return "牠放慢腳步，只敢在附近轉轉。";
  if (distToTarget != null && distToTarget < 28) return "牠在那裡停了下來，正在查看。";
  const pool = REGION_EXPLORE[regionId] || REGION_EXPLORE.plains_windrest;
  return pickFrom(pool, brainTicks) || pool[0];
}

export function narrateIdle(regionId, { brainTicks = 0, visitedCount = 0 } = {}) {
  const pool = REGION_IDLE[regionId] || REGION_IDLE.plains_windrest;
  // 已探索過一些點後，略偏「餘韻」句（通常是 pool 後半）。
  const salt = visitedCount >= 2 ? brainTicks + 1 : brainTicks;
  return pickFrom(pool, salt) || pool[0];
}

export function narrateTacticAck(tactic, { hasFocusTarget = true, brainTicks = 0 } = {}) {
  if (tactic === "focus" && !hasFocusTarget) {
    return pickFrom(TACTIC_ACK.focus_empty, brainTicks);
  }
  const pool = TACTIC_ACK[tactic] || TACTIC_ACK.balanced;
  return pickFrom(pool, brainTicks);
}

export function narrateKillAftermath(enemyName, { mood = "calm", brainTicks = 0 } = {}) {
  const key = KILL_AFTER[mood] ? mood : "calm";
  const template = pickFrom(KILL_AFTER[key], brainTicks) || KILL_AFTER.calm[0];
  return template.replace("{enemy}", enemyName || "雜訊");
}

/** 記憶停頓結束後的短回聲（可選）。 */
export function narrateMemoryEcho(event) {
  if (!event) return null;
  if (typeof event.echo === "string" && event.echo.trim()) return event.echo.trim();
  return null;
}
