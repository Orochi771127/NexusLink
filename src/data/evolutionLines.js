// Codex evolution display data for runtime-ready companions only.
export const STAGE_LABELS = [
  { zh: "幼年期", en: "BABY" },
  { zh: "成長期", en: "CHILD" },
  { zh: "成熟期", en: "ADULT" },
  { zh: "完全體", en: "PERFECT" },
  { zh: "究極體", en: "ULTIMATE" }
];

export const EVOLUTION_LINES = {
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
  "flame-flicker-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "焰紋狐", en: "Ember-vein Fox" },
        lore: "暗毛上流著餘燼紋路的狐。牠的進化會把胸口火核燒成一整片溫熱的鎧紋——這條線還在被書寫。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "ice-talon-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "冰晶狼", en: "Frostcrystal Wolf" },
        lore: "鬃毛凝著冰晶的守界之狼。傳聞牠的成體能讓整片湖面在牠睡著時結成鏡。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "stone-shard-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "磐石熊", en: "Bedrock Bear" },
        lore: "披著苔蘚與岩甲的熊。古老紀錄稱牠的最終形態能在地表撐起一座不倒的石殿。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "vine-twist-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "青藤鹿", en: "Vine Stag" },
        lore: "鹿角纏著藤蔓與嫩葉的雄鹿。據說牠每長一階，林徑就多開一條無人見過的小路。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  },
  "crystal-rabbit-line": {
    complete: false,
    stages: [
      {
        stage: STAGE_LABELS[0],
        name: { zh: "晶石兔", en: "Crystal Rabbit" },
        lore: "苔石身軀裡藏著澄藍晶核的兔。牠的成長不靠勝負，而靠牠願意為誰豎起耳朵——這條線還在被書寫。",
        unlockWins: 0,
        unlockHint: "演化資料整備中。"
      }
    ]
  }
};

export function getEvolutionLine(lineId) {
  return EVOLUTION_LINES[lineId] || null;
}
