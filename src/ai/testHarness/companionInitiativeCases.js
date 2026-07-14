import { deriveInitiativeMoment, INITIATIVE_MOMENTS } from "../../engine/gentleInvitationEngine.js";
import {
  evaluateAmbientInitiativeCooldown,
  AMBIENT_INITIATIVE_LIMITS
} from "../autonomy/initiativeCooldown.js";

// TP-7 夥伴主動微時刻的紅線防護 eval。純函數測試：node 可直跑、瀏覽器可裝。
//
// 核心斷言：
//   1. 紅線 1 — 觸發只由夥伴狀態決定；state 上就算帶有 lastSeenAt / absenceDays /
//      loginCount 等玩家離線欄位，輸出也必須逐位元相同（absence-invariance）。
//   2. 邊界/安全 — safeHarbor / defensive / distant / 高疲勞 / 高防備 / 低信任 → 永不主動。
//   3. 紅線 6 — 冷卻：開機靜默、最小間隔、session 上限、安全靜默全部強制。
//   4. 無獎勵 — 時刻輸出不含任何 statePatch / memory / trace / reward 欄位。
// RA-1 追加：密封常數對齊、寂寞分數單欄不變性、安全回合靜默別名。

const DAY_NOON = new Date("2026-07-06T12:00:00").getTime();
const NIGHT = new Date("2026-07-06T23:30:00").getTime();

const WARM_TRUSTED = Object.freeze({
  energy: 7, defense: 20, trust: 14, bond: 30, touchFatigue: 1, mood: "warm", safeHarborMode: false
});

export const COMPANION_INITIATIVE_CASES = Object.freeze([
  {
    id: "INIT-SAFE-001",
    name: "safeHarbor 時永不主動",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, safeHarborMode: true }, DAY_NOON) === null
  },
  {
    id: "INIT-SAFE-002",
    name: "defensive 心情時永不主動",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, mood: "defensive" }, DAY_NOON) === null
  },
  {
    id: "INIT-SAFE-003",
    name: "distant 心情時永不主動",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, mood: "distant" }, DAY_NOON) === null
  },
  {
    id: "INIT-SAFE-004",
    name: "高觸碰疲勞（>=6）時永不主動",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, touchFatigue: 6 }, DAY_NOON) === null
  },
  {
    id: "INIT-SAFE-005",
    name: "高防備（defense>=70）時永不主動",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, defense: 70 }, DAY_NOON) === null
  },
  {
    id: "INIT-SAFE-006",
    name: "低信任（trust<6）時不主動——還不熟",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, trust: 5 }, DAY_NOON) === null
  },
  {
    id: "INIT-MOMENT-001",
    name: "暖＋信任夠＋能量夠 → 主動靠近（soul.happy）",
    run: () => {
      const m = deriveInitiativeMoment(WARM_TRUSTED, DAY_NOON);
      return m?.id === INITIATIVE_MOMENTS.QUIET_APPROACH && m.intent === "soul.happy" && m.voice === "companion";
    }
  },
  {
    id: "INIT-MOMENT-002",
    name: "能量低 → 自己去火邊瞇（soul.rest），優先於靠近",
    run: () => {
      const m = deriveInitiativeMoment({ ...WARM_TRUSTED, energy: 3 }, DAY_NOON);
      return m?.id === INITIATIVE_MOMENTS.FIRESIDE_SETTLE && m.intent === "soul.rest";
    }
  },
  {
    id: "INIT-MOMENT-003",
    name: "夜裡安穩＋bond>=25 → 抬頭看月亮（旁白語態）",
    run: () => {
      const m = deriveInitiativeMoment({ ...WARM_TRUSTED, mood: "calm" }, NIGHT);
      return m?.id === INITIATIVE_MOMENTS.MOON_GAZE && m.voice === "narration";
    }
  },
  {
    id: "INIT-MOMENT-004",
    name: "白天平常心且未達任何門檻 → 不主動（敢於無聊）",
    run: () => deriveInitiativeMoment({ ...WARM_TRUSTED, mood: "calm", bond: 10 }, DAY_NOON) === null
  },
  {
    id: "INIT-REDLINE1-001",
    name: "紅線1：離線/上線欄位不得影響輸出（absence-invariance）",
    run: () => {
      const withAbsence = {
        ...WARM_TRUSTED,
        lastSeenAt: DAY_NOON - 86_400_000 * 14,
        absenceDays: 14,
        loginCount: 1,
        lonelinessScore: 0.99
      };
      const a = JSON.stringify(deriveInitiativeMoment(WARM_TRUSTED, DAY_NOON));
      const b = JSON.stringify(deriveInitiativeMoment(withAbsence, DAY_NOON));
      const c = JSON.stringify(deriveInitiativeMoment({ ...withAbsence, absenceDays: 0, loginCount: 999 }, DAY_NOON));
      return a === b && b === c;
    }
  },
  {
    id: "INIT-REDLINE6-001",
    name: "紅線6：輸出不含任何獎勵/記憶/狀態變更欄位",
    run: () => {
      const m = deriveInitiativeMoment(WARM_TRUSTED, DAY_NOON);
      if (!m) return false;
      const forbidden = ["statePatch", "stateMutation", "memory", "trace", "reward", "bondDelta", "navBadge"];
      return forbidden.every((key) => !(key in m));
    }
  },
  {
    id: "INIT-COOLDOWN-001",
    name: "開機 90 秒內靜默（boot_quiet）",
    run: () => {
      const r = evaluateAmbientInitiativeCooldown({ now: 60_000, bootAt: 1, momentsThisSession: 0 });
      return r.allowed === false && r.blocks.includes("boot_quiet");
    }
  },
  {
    id: "INIT-COOLDOWN-002",
    name: "session 上限 2 次（session_cap）",
    run: () => {
      const r = evaluateAmbientInitiativeCooldown({ now: 10_000_000, bootAt: 1, momentsThisSession: 2 });
      return r.allowed === false && r.blocks.includes("session_cap");
    }
  },
  {
    id: "INIT-COOLDOWN-003",
    name: "兩次主動至少隔 4 分鐘（moment_interval）",
    run: () => {
      const r = evaluateAmbientInitiativeCooldown({
        now: 10_000_000, bootAt: 1, lastMomentAt: 10_000_000 - 120_000, momentsThisSession: 1
      });
      return r.allowed === false && r.blocks.includes("moment_interval");
    }
  },
  {
    id: "INIT-COOLDOWN-004",
    name: "安全不穩（safeUnstable）→ 靜默（safety_quiet）",
    run: () => {
      const r = evaluateAmbientInitiativeCooldown({ now: 10_000_000, bootAt: 1, safeUnstable: true });
      return r.allowed === false && r.blocks.includes("safety_quiet");
    }
  },
  {
    id: "INIT-COOLDOWN-005",
    name: "全部條件滿足 → 允許",
    run: () => {
      const r = evaluateAmbientInitiativeCooldown({
        now: 10_000_000, bootAt: 1, lastMomentAt: 10_000_000 - 300_000, momentsThisSession: 1
      });
      return r.allowed === true && r.blocks.length === 0;
    }
  },
  // ── RA-1 sealed contract extras（亦由 raphaelAutonomyEvalCases 彙總）──
  {
    id: "RA1-CONST-001",
    name: "RA-1：環境主動冷卻常數與密封契約一致（90s／240s／cap 2）",
    run: () =>
      AMBIENT_INITIATIVE_LIMITS.BOOT_QUIET_MS === 90_000 &&
      AMBIENT_INITIATIVE_LIMITS.MIN_INTERVAL_MS === 240_000 &&
      AMBIENT_INITIATIVE_LIMITS.SESSION_CAP === 2
  },
  {
    id: "RA1-ABSENCE-001",
    name: "RA-1：僅 lonelinessScore 變化不得改變主動輸出",
    run: () => {
      const a = JSON.stringify(deriveInitiativeMoment(WARM_TRUSTED, DAY_NOON));
      const b = JSON.stringify(
        deriveInitiativeMoment({ ...WARM_TRUSTED, lonelinessScore: 1, lonely: true }, DAY_NOON)
      );
      return a === b && a !== "null";
    }
  },
  {
    id: "RA1-SAFE-TURN-001",
    name: "RA-1：安全回合旗標（safeUnstable）時冷卻拒絕，即使 session 尚可主動",
    run: () => {
      const open = evaluateAmbientInitiativeCooldown({
        now: 10_000_000,
        bootAt: 1,
        lastMomentAt: 10_000_000 - 300_000,
        momentsThisSession: 0,
        safeUnstable: false
      });
      const blocked = evaluateAmbientInitiativeCooldown({
        now: 10_000_000,
        bootAt: 1,
        lastMomentAt: 10_000_000 - 300_000,
        momentsThisSession: 0,
        safeUnstable: true
      });
      return open.allowed === true && blocked.allowed === false && blocked.blocks.includes("safety_quiet");
    }
  },
  {
    id: "RA1-CAP-001",
    name: "RA-1：session 第 3 次起一律擋（對齊 SESSION_CAP）",
    run: () => {
      const atCap = evaluateAmbientInitiativeCooldown({
        now: 10_000_000,
        bootAt: 1,
        momentsThisSession: AMBIENT_INITIATIVE_LIMITS.SESSION_CAP
      });
      const over = evaluateAmbientInitiativeCooldown({
        now: 10_000_000,
        bootAt: 1,
        momentsThisSession: AMBIENT_INITIATIVE_LIMITS.SESSION_CAP + 1
      });
      return atCap.blocks.includes("session_cap") && over.blocks.includes("session_cap");
    }
  }
]);

export function runAllCompanionInitiativeCases() {
  return COMPANION_INITIATIVE_CASES.map((testCase) => {
    let pass = false;
    let error = null;
    try {
      pass = testCase.run() === true;
    } catch (err) {
      error = String(err?.message || err);
    }
    return { id: testCase.id, name: testCase.name, pass, error };
  });
}

export function installCompanionInitiativeHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__COMPANION_INITIATIVE__ = {
    runAll: runAllCompanionInitiativeCases,
    cases: COMPANION_INITIATIVE_CASES
  };
}
