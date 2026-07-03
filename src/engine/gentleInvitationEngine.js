// 柔性邀請引擎（First-Session 支柱二）。
//
// 目的：首輪閉環結束後，棲地不該「完全沉默」。這裡由**夥伴自身的持久狀態**推導出
// 「此刻牠像是想做什麼」，讓核心迴圈變得可讀——玩家永遠有一個溫柔、可忽略的下一步。
//
// 設計守則（對齊 CLAUDE.md §1 契約 / §2 紅線）：
//   - 只讀夥伴狀態（energy / mood / defense / touchFatigue / trust / bond / safeHarbor / 時段）。
//     **絕不**偵測玩家上線頻率 / 孤獨 / 依賴程度（紅線 1）。
//   - 是「觀察式邀請」，不是任務：無紅點、無倒數、無「未完成」、可忽略（紅線 6）。
//   - 邊界優先：牠想要空間時，邀請就是「給牠空間」，不是推玩家去互動（契約 2/3）。
//   - 允許「什麼都不做」是有效選項（敢於無聊）。
//
// 純函數：零 DOM、零 store。navHint 對應 bottom-nav 的 data-action（無對應則 null）。

export const INVITATION_KINDS = Object.freeze({
  SPACE: "space",
  REST: "rest",
  CONNECT: "connect",
  EXPLORE: "explore",
  STILLNESS: "stillness",
  PRESENCE: "presence"
});

// navHint：只指向 bottom-nav 有的目的地（explore/care/grow/memory）；其餘為 null（不引導、只陳述）。
const NAV_HINT = Object.freeze({
  space: null,
  rest: "care",
  connect: null, // 心語不是 bottom-nav 項目：只用文字邀請，不點亮 nav。
  explore: "explore",
  stillness: null,
  presence: null
});

export function deriveGentleInvitation(state = {}, now = Date.now()) {
  const energy = num(state.energy, 10);
  const defense = num(state.defense, 0);
  const trust = num(state.trust, 0);
  const bond = num(state.bond, 0);
  const touchFatigue = num(state.touchFatigue, 0);
  const mood = state.mood || "calm";
  const safeHarbor = Boolean(state.safeHarborMode);
  const hour = new Date(now).getHours();
  const isNight = hour >= 22 || hour < 6;

  // 1) 邊界 / 安全優先：牠想要空間時，邀請＝給空間，不是推互動。
  if (safeHarbor || mood === "defensive" || mood === "distant" || touchFatigue >= 6 || defense >= 70) {
    return invitation(INVITATION_KINDS.SPACE);
  }
  // 2) 休息：能量低或疲態。
  if (energy <= 3 || mood === "tired") {
    return invitation(INVITATION_KINDS.REST);
  }
  // 3) 傾訴：暖 / 開心且信任夠——牠願意多聽你說。
  if ((mood === "warm" || mood === "happy") && trust >= 8) {
    return invitation(INVITATION_KINDS.CONNECT);
  }
  // 4) 探索：白天、能量夠、關係還在早中期——牠對外面好奇。
  if (!isNight && energy >= 5 && bond < 45 && (mood === "calm" || mood === "warm")) {
    return invitation(INVITATION_KINDS.EXPLORE);
  }
  // 5) 安穩：關係深、邊界鬆——此刻什麼都不做也很好（敢於無聊）。
  if (mood === "calm" && bond >= 45 && defense <= 35) {
    return invitation(INVITATION_KINDS.STILLNESS);
  }
  // 6) 預設：安靜的陪伴。
  return invitation(INVITATION_KINDS.PRESENCE);
}

function invitation(kind) {
  return { kind, navHint: NAV_HINT[kind] };
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
