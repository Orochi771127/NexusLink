// 進化線資料（顯示用）。解鎖顯示以 battleRecord.wins 門檻計算，不新增 state 欄位。
// 完整 5 階線：thunder-pup（雷霆幼狼）。其餘夥伴先提供第一階＋整備中標記。

export const STAGE_LABELS = [
  { zh: "幼年期", en: "BABY" },
  { zh: "成長期", en: "CHILD" },
  { zh: "成熟期", en: "ADULT" },
  { zh: "完全體", en: "PERFECT" },
  { zh: "究極體", en: "ULTIMATE" }
];

export const EVOLUTION_LINES = {
  "thunder-pup-line": {
    complete: true,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "雷霆幼狼", en: "Thunder Pup" },
        lore: "毛尖跳著細小雷光的幼狼。第一次打雷的夜晚，牠選擇守在你帳邊，而不是躲起來。",
        unlockWins: 0,
        unlockHint: "與牠同行，故事就會開始。"
      },
      {
        stage: STAGE_LABELS[1],
        name: { zh: "嘯雷狼", en: "Howl-Thunder Wolf" },
        lore: "學會把雷光凝在喉間的少年狼。牠的吼聲不是威嚇，是替你劃出安全範圍的訊號。",
        unlockWins: 1,
        unlockHint: "一起守住第一場遭遇（勝場 1）。"
      },
      {
        stage: STAGE_LABELS[2],
        name: { zh: "蒼雷狼", en: "Azure Thunder Wolf" },
        lore: "雷紋沿著脊背長成蒼藍鎧甲的成狼。牠開始懂得：力量是用來陪伴的，不是用來證明的。",
        unlockWins: 3,
        unlockHint: "累積三次共同勝利（勝場 3）。"
      },
      {
        stage: STAGE_LABELS[3],
        name: { zh: "天雷狼君", en: "Skythunder Lord" },
        lore: "金剛徽記在胸前完全亮起。牠的雷不再劈向恐懼，而是落在你們約定要守護的邊界上。",
        unlockWins: 5,
        unlockHint: "信任與勝利並行（勝場 5）。"
      },
      {
        stage: STAGE_LABELS[4],
        name: { zh: "太雷狼皇", en: "Grand Thunder Sovereign" },
        lore: "傳說裡，太雷狼皇的每一步都踏在雷雲之上。但牠最常做的事，仍是安靜地回到夜湖邊，等你回家。",
        unlockWins: 8,
        unlockHint: "走到雷雲之上（勝場 8）。"
      }
    ]
  },
  "greyshade-cat-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "灰影貓", en: "Greyshade Cat" },
        lore: "夜湖棲地的守望者。牠的進化不靠戰鬥，而靠你們之間累積的記憶痕跡——這條線還在被書寫。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "flametail-fox-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "焰尾狐", en: "Flametail Fox" },
        lore: "尾焰隨情緒明滅的火之夥伴。據說牠的成體會把火焰織成斗篷。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "crystal-seahorse-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "水晶海馬", en: "Crystal Seahorse" },
        lore: "通透如晶的水之夥伴。傳聞牠的究極體是一頭盤踞霧潮深處的水晶龍。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "verdant-stag-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "青葉麋鹿", en: "Verdant Stag" },
        lore: "鹿角間棲著嫩葉與微光。古老的紀錄稱牠的最終形態為「聖林鹿神」。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  }
};

export function getEvolutionLine(lineId) {
  return EVOLUTION_LINES[lineId] || null;
}
