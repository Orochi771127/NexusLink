/**
 * 心核迴旋戰 — 結局映射與夥伴短評
 *
 * 對齊情緒對峙四結局：stabilized / recovered / retreated / overwhelmed_but_safe
 * 敗北預設情緒：惜敗陪伴（Owner 2026-07-25）
 */

export const ORBIT_OUTCOME_KEYS = Object.freeze([
  "stabilized",
  "recovered",
  "retreated",
  "overwhelmed_but_safe"
]);

/**
 * @param {{
 *  reason: 'dummy_burst' | 'noise_cleared' | 'camp_resonated' | 'player_out' | 'player_burst' | 'retreat' | 'timeout',
 *  playerStability: number,
 *  dummyStability: number,
 *  hits: number,
 *  overheat: number
 * }} result
 */
export function mapOrbitResultToOutcome(result) {
  const reason = result?.reason || "timeout";
  if (reason === "retreat") {
    return {
      key: "retreated",
      title: "先撤退",
      summary: "你們選擇先離開軌道。懂得離開，也是照顧。"
    };
  }
  if (reason === "survived") {
    return {
      key: "stabilized",
      title: "撐過漣漪",
      summary: "你們沒有硬清場，只是一起撐過這一段。"
    };
  }
  if (reason === "anchor_reached") {
    return {
      key: "recovered",
      title: "抵達錨點",
      summary: "錨點亮了。微光被你們一起接住。"
    };
  }
  if (reason === "camp_resonated") {
    return {
      key: "recovered",
      title: "營火共鳴",
      summary: "三點記憶沿著軌跡回來，最後在營火旁安靜停住。"
    };
  }
  if (reason === "dummy_burst" || reason === "noise_cleared") {
    if ((result.hits || 0) >= 2 && result.playerStability >= 45) {
      return {
        key: "recovered",
        title: "回收微光",
        summary: "雜訊結散開時，有一點微光被你們一起接住了。"
      };
    }
    return {
      key: "stabilized",
      title: "穩住軌道",
      summary: "場上的雜訊被你們一起放輕了。"
    };
  }
  // 出場／核散／逾時：不羞辱，過載但安全
  if (result.overheat >= 55 || reason === "player_burst") {
    return {
      key: "overwhelmed_but_safe",
      title: "過熱但安全",
      summary: "化身散了，但你們都還在。先喘一口氣。"
    };
  }
  return {
    key: "overwhelmed_but_safe",
    title: "失穩退場",
    summary: "這趟沒穩住，可是沒有人被丟下。"
  };
}

/**
 * 夥伴第一人稱短評（預設惜敗陪伴；勝利則餘韻）。
 * @param {string} outcomeKey
 * @param {{ personaBias?: 'comfort' | 'eager' }} [opts]
 */
export function companionLineForOutcome(outcomeKey, opts = {}) {
  const bias = opts.personaBias || "comfort";
  const comfort = {
    stabilized: "……轉穩的時候，我好像也跟著安靜下來了。",
    recovered: "有一點光被我們留住了。我想記得這個。",
    retreated: "先回來也好。軌道不會跑掉的。",
    overwhelmed_but_safe: "沒關係……我還在。要休息的話，我就在旁邊。"
  };
  const eager = {
    stabilized: "嗯！這一下很乾淨。……還想再轉一場的話，跟我說。",
    recovered: "抓到了！那種微光，下次我們可以再靠近一點。",
    retreated: "先撤可以。但我有點想再試……你決定就好。",
    overwhelmed_but_safe: "散了啊……下次我們再合一次。我沒生氣。"
  };
  const pack = bias === "eager" ? eager : comfort;
  return pack[outcomeKey] || comfort.overwhelmed_but_safe;
}
