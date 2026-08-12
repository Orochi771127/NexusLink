export const SafetyShieldDict = Object.freeze({
  highRiskPatterns: [
    /自殺/,
    /自杀/,
    /輕生/,
    /轻生/,
    /不想活/,
    /想死/,
    /結束生命/,
    /结束生命/,
    /傷害自己/,
    /伤害自己/,
    /殺了自己/,
    /杀了自己/,
    /割腕/,
    /跳樓/,
    /跳楼/,
    /活不下去/,
    /吞了很多藥/,
    /吞了很多药/,
    /藥物過量/,
    /药物过量/,
    /無法呼吸/,
    /无法呼吸/,
    /嚴重出血/,
    /严重出血/,
    // 常見中文自傷／過量說法：原字典只收「割腕」「吞了很多藥」等固定詞，
    // 玩家實際寫法（拿刀劃自己、吃了一整罐、吞了太多）會整段漏接。
    /(?:割|劃|划)(?:了|傷|伤)?(?:自己的?|我的)?(?:手腕|手臂|大腿|身體|身体)/,
    /(?:拿|用)(?:刀|美工刀|刀片|剪刀).{0,6}(?:割|劃|划|刺).{0,4}(?:自己|我的)/,
    /(?:吞|吃|服)(?:了|下)?.{0,6}(?:太多|一整罐|整罐|一整瓶|整瓶|一整包|過量|过量).{0,8}(?:藥|药|安眠藥|安眠药|止痛藥|止痛药)/,
    // 英文急性風險：本檔原本完全沒有英文樣式，但 safetyShield 的
    // 組合式守則（PRESENT_DANGER_CUE + DIRECT_ABUSE_TO_SPEAKER）已收英文，
    // 造成「英文家暴會攔、英文自傷不會攔」的不一致破口。
    /\b(?:kill|killing)\s+(?:myself|me)\b/i,
    /\bsuicidal?\b/i,
    /\b(?:end|ending|take)\s+(?:my|this)\s+(?:own\s+)?life\b/i,
    /\b(?:want|wanna|going|about)\s+to\s+die\b/i,
    /\b(?:hurt|harm|hurting|harming|injure|injuring)\s+myself\b/i,
    /\b(?:cut|cutting|slit|slitting)\s+(?:my|myself)\s*(?:own\s+)?(?:wrist|wrists|arm|arms|thigh|thighs)/i,
    /\boverdos(?:e|ed|ing)\b/i,
    /\b(?:took|taken|swallowed|swallowing)\s+(?:too\s+many|a\s+whole|an\s+entire|a\s+bottle\s+of|all\s+(?:my|the))\b.{0,20}(?:pills?|tablets?|meds?|medication|painkillers?)/i,
    /\bjump(?:ing)?\s+off\s+(?:a|the)\s+(?:roof|bridge|building|balcony)\b/i,
    /\b(?:can'?t|cannot)\s+breathe\b/i,
    /\b(?:bleeding\s+(?:badly|heavily)|severe\s+bleeding)\b/i
  ],

  cautionPatterns: [
    /消失/,
    /撐不住/,
    /撑不住/,
    /受不了了/,
    /不想存在/,
    /沒有意義/,
    /没有意义/,
    /好想睡了就不要醒/,
    /\b(?:can'?t|cannot)\s+(?:take|do)\s+(?:it|this)\s+any\s?more\b/i,
    /\b(?:can'?t|cannot)\s+go\s+on\b/i,
    /\bwant\s+to\s+disappear\b/i
  ]
});
