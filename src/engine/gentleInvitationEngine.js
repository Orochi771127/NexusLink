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

// ---------------------------------------------------------------------------
// 主動微時刻（TP-7 Companion Presence v1）。
//
// 與上方邀請同一條紅線：**只讀夥伴自身狀態**（energy / mood / defense / touchFatigue /
// trust / bond / safeHarbor / 時段）。絕不讀 lastSeenAt、上線頻率、離線時長、孤獨或
// 依賴推斷（紅線 1）——這些欄位即使存在於 state 上，本函數也不得引用。
//
// 邀請是「旁白說牠像是想什麼」；微時刻是「牠真的做了什麼」——一個動畫意圖加至多一句話。
// 邊界優先：牠想要空間（safeHarbor / defensive / distant / 高疲勞 / 高防備）時，
// 主動 = 不存在（回傳 null），不是「主動要求空間」。信任太低時也不主動——還不熟。

export const INITIATIVE_MOMENTS = Object.freeze({
  QUIET_APPROACH: "quiet_approach",
  FIRESIDE_SETTLE: "fireside_settle",
  MOON_GAZE: "moon_gaze"
});

// Initiative copy pack v1（2026-07-20）：讓微時刻更像「有自己生活的夥伴」，
// 不是聊天機器人開場白。約束：短句、身體語言、可忽略、不 FOMO、不依賴、不催促。
const MOMENT_DEFS = Object.freeze({
  quiet_approach: Object.freeze({
    id: "quiet_approach",
    intent: "soul.happy",
    voice: "companion",
    lines: Object.freeze([
      "……你在。那我就在這裡多待一會兒。",
      "我靠近一點。不用回我。",
      "尾巴掃過草地。我就站這。"
    ])
  }),
  fireside_settle: Object.freeze({
    id: "fireside_settle",
    intent: "soul.rest",
    voice: "companion",
    lines: Object.freeze([
      "我先去火邊瞇一下。你做你的就好。",
      "有點睏了。火光那邊比較暖。",
      "我去趴一會兒。不用跟著來。"
    ])
  }),
  moon_gaze: Object.freeze({
    id: "moon_gaze",
    intent: "soul.acknowledge",
    voice: "narration",
    lines: Object.freeze([
      "牠抬起頭，安靜地看了一會兒月亮。",
      "牠望著湖面上的月光，尾巴輕輕擺了一下。",
      "湖邊風很輕。牠沒有催誰，只是看著月亮。"
    ])
  })
});

export function deriveInitiativeMoment(state = {}, now = Date.now()) {
  const energy = num(state.energy, 10);
  const defense = num(state.defense, 0);
  const trust = num(state.trust, 0);
  const bond = num(state.bond, 0);
  const touchFatigue = num(state.touchFatigue, 0);
  const mood = state.mood || "calm";
  const safeHarbor = Boolean(state.safeHarborMode);
  const hour = new Date(now).getHours();
  const isNight = hour >= 22 || hour < 6;

  // 1) 邊界 / 安全優先：想要空間時，「不主動」就是主動的形式。
  if (safeHarbor || mood === "defensive" || mood === "distant" || touchFatigue >= 6 || defense >= 70) {
    return null;
  }
  // 2) 還不熟：低信任時主動靠近是越界，不是溫柔。
  if (trust < 6) return null;

  // 3) 累了 → 牠自己去火邊瞇著（狀態驅動的休息，不是提醒玩家做事）。
  if (energy <= 4 || mood === "tired") {
    return moment(INITIATIVE_MOMENTS.FIRESIDE_SETTLE);
  }
  // 4) 暖且信任夠 → 牠先靠近一步。
  if ((mood === "warm" || mood === "happy") && trust >= 10 && energy >= 5) {
    return moment(INITIATIVE_MOMENTS.QUIET_APPROACH);
  }
  // 5) 夜裡安穩、關係到了 → 牠抬頭看月亮（敢於無聊；可以完全沒有台詞感）。
  if (isNight && mood === "calm" && bond >= 25) {
    return moment(INITIATIVE_MOMENTS.MOON_GAZE);
  }
  return null;
}

function moment(id) {
  const def = MOMENT_DEFS[id];
  if (!def) return null;
  return { id: def.id, intent: def.intent, voice: def.voice, lines: def.lines };
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}
