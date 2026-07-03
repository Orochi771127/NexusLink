// 情緒關鍵字字典。注意：安全層（safetyShieldDictionary）比本字典**先**執行，
// 自傷／高風險與 caution 詞（消失／撐不住了／沒有意義／不想存在…）由安全層處理，
// 這裡**刻意不收**那些詞，避免把求助訊號當成一般情緒沉積（對齊 CLAUDE.md 紅線 7）。
// A2 擴充：在不碰安全詞的前提下，補上更 nuanced 的日常說法，減少「抓不到情緒」的 generic fallback。

export const EmotionDict = Object.freeze({
  fatigue: {
    key: "fatigue",
    theme: "疲憊",
    label: "疲憊的回聲",
    keywords: ["累", "好累", "很累", "疲憊", "沒力", "撐不住", "癱", "垮", "耗盡", "快不行", "沒電", "動不了", "好想躺", "提不起勁", "整個人很沉", "累到不想說話"],
    symbol: "white_ash",
    place: "campfire_side",
    baseIntensity: 0.55
  },

  sadness: {
    key: "sadness",
    theme: "悲傷",
    label: "悲傷的漂流盞",
    keywords: ["難過", "傷心", "哭", "眼淚", "心痛", "失落", "委屈", "想哭", "很痛", "沒人懂", "空掉", "心裡空空", "難受", "鼻酸", "低落", "情緒很低", "心情好差"],
    symbol: "blue_lantern",
    place: "lake_surface",
    baseIntensity: 0.6
  },

  anxiety: {
    key: "anxiety",
    theme: "焦慮",
    label: "焦慮的雜訊",
    keywords: ["焦慮", "不安", "慌", "緊張", "害怕", "怕", "睡不著", "煩躁", "心很亂", "喘不過氣", "心跳好快", "靜不下來", "腦子停不下來", "坐立難安", "胸口悶", "心慌", "壓力好大"],
    symbol: "glitch_noise",
    place: "sky_air",
    baseIntensity: 0.65
  },

  loneliness: {
    key: "loneliness",
    theme: "孤單",
    label: "孤單的星火",
    keywords: ["孤單", "寂寞", "一個人", "沒人陪", "被丟下", "沒有人", "好孤獨", "沒人理", "沒有人懂", "被忽略", "被冷落", "格格不入", "沒人在乎", "沒人需要我", "好想有人陪"],
    symbol: "faint_spark",
    place: "shore_side",
    baseIntensity: 0.55
  },

  anger: {
    key: "anger",
    theme: "憤怒",
    label: "憤怒的星鐵礦",
    keywords: ["生氣", "憤怒", "不爽", "火大", "受不了", "氣死", "很煩", "爆炸", "被惹怒", "委屈又生氣", "想摔東西", "忍很久了", "快氣炸", "被氣到", "很不公平", "氣不過"],
    symbol: "star_iron_ore",
    place: "lake_bottom",
    baseIntensity: 0.7
  },

  gratitude: {
    key: "gratitude",
    theme: "感謝",
    label: "感謝的金色符文",
    keywords: ["謝謝", "感謝", "還好有你", "陪我", "被接住", "安心", "溫暖", "太感謝", "多虧有你", "有你真好", "謝謝你在", "幫了大忙", "好感激"],
    symbol: "golden_rune",
    place: "magic_circle",
    baseIntensity: 0.45
  },

  calm: {
    key: "calm",
    theme: "平靜",
    label: "平靜的湖面漣漪",
    keywords: ["安靜", "休息", "晚安", "慢慢來", "沒關係", "陪我一下", "想待著", "想靜一靜", "放空", "什麼都不想", "只想待著", "安靜就好", "陪著就好", "想歇一下"],
    symbol: "soft_ripple",
    place: "lake_surface",
    baseIntensity: 0.4
  }
});
