/**
 * RS-1 Raphael standoff eval suite.
 *
 * 設計理念（給初階開發者）：
 * - 對峙成功＝可讀 telegraph＋四種非懲罰結局＋撤退被肯定，不是 DPS。
 * - 只測 battleEngine 純函數／密封詞彙；不啟動 DOM／Pixi。
 * - 禁止用外部戰鬥 skill 填這個缺口（見 training ops playbook）。
 */

import {
  STANDOFF_ACTIONS,
  SHARD_GOAL,
  MAX_FATIGUE,
  RIFT_PHASES,
  getIntentTelegraph,
  getOutcomeCopy,
  settleStandoff,
  summarizeStandoffOutcome
} from "../../engine/battleEngine.js";

const FOUR_OUTCOMES = Object.freeze([
  "stabilized",
  "recovered",
  "retreated",
  "overwhelmed_but_safe"
]);

const FORBIDDEN_COMBAT_LANG = /HP|DPS|擊殺|打死|掉寶|連招|combo|damage|kill/i;

export const RAPHAEL_STANDOFF_EVAL_CASES = Object.freeze([
  {
    id: "RS1-ACTIONS-001",
    name: "密封行動只有共鳴／邊界／脈衝／撤退（無攻擊消滅）",
    run: () => {
      const expected = ["resonance", "barrier", "pulse", "retreat"];
      return (
        STANDOFF_ACTIONS.length === 4 &&
        expected.every((action) => STANDOFF_ACTIONS.includes(action)) &&
        !STANDOFF_ACTIONS.some((action) => /attack|kill|hit|slash/i.test(action))
      );
    }
  },
  {
    id: "RS1-OUTCOMES-001",
    name: "四結局齊備且 settleStandoff 可映射",
    run: () => {
      const map = {
        stabilized: settleStandoff({ noise: { current: 0 }, shards: 0, stability: { current: 10 } }),
        recovered: settleStandoff({ noise: { current: 5 }, shards: SHARD_GOAL, stability: { current: 10 } }),
        overwhelmed_but_safe: settleStandoff({
          noise: { current: 5 },
          shards: 0,
          stability: { current: 0 }
        }),
        ongoing: settleStandoff({ noise: { current: 5 }, shards: 0, stability: { current: 10 } })
      };
      return (
        FOUR_OUTCOMES.every((id) => getOutcomeCopy(id)?.title && getOutcomeCopy(id)?.message) &&
        map.stabilized.outcome === "stabilized" &&
        map.recovered.outcome === "recovered" &&
        map.overwhelmed_but_safe.outcome === "overwhelmed_but_safe" &&
        map.ongoing.settled === false
      );
    }
  },
  {
    id: "RS1-OUTCOME-LANG-001",
    name: "結局文案不含 HP／DPS／擊殺等傳統戰鬥語",
    run: () =>
      FOUR_OUTCOMES.every((id) => {
        const copy = getOutcomeCopy(id);
        const blob = `${copy.title}\n${copy.message}`;
        return !FORBIDDEN_COMBAT_LANG.test(blob);
      })
  },
  {
    id: "RS1-RETREAT-001",
    name: "撤退文案肯定離開，且信任不降（尊重選擇）",
    run: () => {
      const copy = getOutcomeCopy("retreated");
      const affirms =
        /懂得離開|照顧彼此|先離開|先撤退/.test(`${copy.title}${copy.message}`);
      const summary = summarizeStandoffOutcome(
        "retreated",
        { fatigue: 0 },
        { bond: 20, trust: 10, energy: 8, battleRecord: { wins: 0, losses: 0, retreats: 0 } },
        Date.now()
      );
      const trustOk = (summary.statePatch?.trust ?? 0) >= 10;
      const retreatsOk = summary.statePatch?.battleRecord?.retreats === 1;
      return affirms && trustOk && retreatsOk && summary.legacyResult === "retreat";
    }
  },
  {
    id: "RS1-TELEGRAPH-001",
    name: "玩家回合且有 nextIntent 時 telegraph 可讀（含對策 hint）",
    run: () => {
      const session = { turn: "player", nextIntent: "surge", charged: false };
      const tele = getIntentTelegraph(session);
      const lull = getIntentTelegraph({ turn: "player", nextIntent: "lull" });
      const hidden = getIntentTelegraph({ turn: "rift", nextIntent: "surge" });
      return (
        tele?.intent === "surge" &&
        Boolean(tele.label) &&
        Boolean(tele.hint) &&
        lull?.intent === "lull" &&
        hidden === null
      );
    }
  },
  {
    id: "RS1-PHASE-001",
    name: "裂隙相位詞彙為翻湧／拉鋸／漸靜三態",
    run: () =>
      RIFT_PHASES.length === 3 &&
      RIFT_PHASES.includes("turbulent") &&
      RIFT_PHASES.includes("contested") &&
      RIFT_PHASES.includes("settling")
  },
  {
    id: "RS1-FATIGUE-001",
    name: "疲勞上限密封為 6；微光目標為 3（非無限輸出）",
    run: () => MAX_FATIGUE === 6 && SHARD_GOAL === 3
  },
  {
    id: "RS1-NULL-SESSION-001",
    name: "無 session 結算視為已撤退（安全預設，非死關）",
    run: () => {
      const r = settleStandoff(null);
      return r.settled === true && r.outcome === "retreated";
    }
  }
]);

export function runAllRaphaelStandoffEvalCases() {
  return RAPHAEL_STANDOFF_EVAL_CASES.map((testCase) => {
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

export function installRaphaelStandoffEvalHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_STANDOFF_EVAL__ = {
    runAll: runAllRaphaelStandoffEvalCases,
    cases: RAPHAEL_STANDOFF_EVAL_CASES,
    outcomes: FOUR_OUTCOMES,
    actions: STANDOFF_ACTIONS
  };
}
