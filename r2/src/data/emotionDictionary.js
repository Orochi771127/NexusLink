export const EmotionDict = Object.freeze({
  fatigue: {
    key: "fatigue",
    theme: "疲憊",
    label: "疲憊的回聲",
    keywords: ["累", "好累", "很累", "疲憊", "沒力", "撐不住", "癱", "垮", "耗盡", "快不行"],
    symbol: "white_ash",
    place: "campfire_side",
    baseIntensity: 0.55
  },

  sadness: {
    key: "sadness",
    theme: "悲傷",
    label: "悲傷的漂流盞",
    keywords: ["難過", "傷心", "哭", "眼淚", "心痛", "失落", "委屈", "想哭", "很痛", "沒人懂"],
    symbol: "blue_lantern",
    place: "lake_surface",
    baseIntensity: 0.6
  },

  anxiety: {
    key: "anxiety",
    theme: "焦慮",
    label: "焦慮的雜訊",
    keywords: ["焦慮", "不安", "慌", "緊張", "害怕", "怕", "睡不著", "煩躁", "心很亂", "喘不過氣"],
    symbol: "glitch_noise",
    place: "sky_air",
    baseIntensity: 0.65
  },

  loneliness: {
    key: "loneliness",
    theme: "孤單",
    label: "孤單的星火",
    keywords: ["孤單", "寂寞", "一個人", "沒人陪", "被丟下", "沒有人", "好孤獨", "沒人理"],
    symbol: "faint_spark",
    place: "shore_side",
    baseIntensity: 0.55
  },

  anger: {
    key: "anger",
    theme: "憤怒",
    label: "憤怒的星鐵礦",
    keywords: ["生氣", "憤怒", "不爽", "火大", "受不了", "氣死", "很煩", "爆炸", "被惹怒"],
    symbol: "star_iron_ore",
    place: "lake_bottom",
    baseIntensity: 0.7
  },

  gratitude: {
    key: "gratitude",
    theme: "感謝",
    label: "感謝的金色符文",
    keywords: ["謝謝", "感謝", "還好有你", "陪我", "被接住", "安心", "溫暖"],
    symbol: "golden_rune",
    place: "magic_circle",
    baseIntensity: 0.45
  },

  calm: {
    key: "calm",
    theme: "平靜",
    label: "平靜的湖面漣漪",
    keywords: ["安靜", "休息", "晚安", "慢慢來", "沒關係", "陪我一下", "想待著"],
    symbol: "soft_ripple",
    place: "lake_surface",
    baseIntensity: 0.4
  }
});
