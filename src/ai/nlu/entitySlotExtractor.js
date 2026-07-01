const ENTITY_PATTERNS = [
  { key: "Grok", re: /Grok|grok/i },
  { key: "HUD", re: /\bHUD\b|抬頭|頂部介面|上方介面|dock|底部導覽|bottom\s*nav/i },
  { key: "Raphael", re: /Raphael|拉斐爾|灰影貓/i },
  { key: "UI", re: /\bUI\b|介面|畫面|面板|panel/i },
  { key: "AI", re: /\bAI\b|自然語言|理解層|intent|semanticFrame|response\s*pack/i },
  { key: "memory", re: /記憶|memory|recall/i },
  { key: "Soul Talk", re: /Soul\s*Talk|心語|靈魂聖域/i },
  { key: "Pixi", re: /Pixi|canvas|遊戲畫布/i },
  { key: "地圖", re: /地圖|外面|探索|湖面外/i }
];

export function extractEntitySlots(inputText = "", segments = []) {
  const haystack = [inputText, ...segments].join(" ");
  const entities = [];

  for (const pattern of ENTITY_PATTERNS) {
    if (pattern.re.test(haystack) && !entities.includes(pattern.key)) {
      entities.push(pattern.key);
    }
  }

  if (/初醒|心核|第一次醒|月湖/.test(haystack) && !entities.includes("awakening")) {
    entities.push("awakening");
  }

  return entities;
}