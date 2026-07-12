// CH-6 共鳴圈對峙驗證（純函數，離線可跑）。
// 執行：NEXUS_NODE docs/qa/_resonance_circle_cases.mjs
import {
  createStandoffSession,
  applyPlayerAction,
  applyNoiseTurn,
  settleStandoff,
  canUseAction,
  MAX_FATIGUE,
  MAX_SYNC
} from "../../src/engine/battleEngine.js";
import {
  deriveResonanceCircle,
  MAX_CIRCLE_SIZE,
  MAX_MEMBER_BREATH,
  CIRCLE_STANCES
} from "../../src/engine/resonanceCircleEngine.js";
import { getCompanionById } from "../../src/data/companionRegistry.js";

const cases = [];
const rng = () => 0.5; // 決定性 rng：基準/圈員兩組結果可逐值比較

const by = (id) => getCompanionById(id);

function circleState({ activeId = "greyshade-cat", joined = {}, unlocked = null } = {}) {
  const companions = {};
  Object.entries(joined).forEach(([id, joinedAt]) => {
    companions[id] = { metAt: 1, joinedAt };
  });
  return {
    activeCompanionId: activeId,
    unlockedCompanionIds: unlocked || [activeId, ...Object.keys(joined)],
    resonance: { chapterMarks: {}, companions }
  };
}

function makeSession({ activeId = "greyshade-cat", enemyId = "static_wisp", circleIds = [], bond = 0 } = {}) {
  return createStandoffSession({
    companion: by(activeId),
    enemyId,
    nodeId: "moonlake-rift",
    state: { bond },
    rng,
    circle: circleIds.map(by)
  });
}

// ---- 圈組成推導 ----

runCase("empty state derives an empty circle", () => {
  assertEqual(deriveResonanceCircle({}).length, 0, "empty circle");
});

runCase("circle caps at MAX_CIRCLE_SIZE - 1 supports, earliest joined first", () => {
  const state = circleState({
    joined: { sprigfawn: 300, "starstripe-cub": 100, auriowl: 200 }
  });
  const circle = deriveResonanceCircle(state);
  assertEqual(circle.length, MAX_CIRCLE_SIZE - 1, "capped at 2 supports");
  assertArrayEqual(circle.map((c) => c.id), ["starstripe-cub", "auriowl"], "joinedAt ascending order");
});

runCase("locked and unknown companions are excluded", () => {
  const state = circleState({
    joined: { sprigfawn: 100, "no-such-companion": 50 },
    unlocked: ["greyshade-cat", "no-such-companion"] // sprigfawn 未解鎖；unknown 觸發 registry fallback 防呆
  });
  assertEqual(deriveResonanceCircle(state).length, 0, "locked + unknown both excluded");
});

runCase("active companion never joins its own circle", () => {
  const state = circleState({ activeId: "sprigfawn", joined: { sprigfawn: 100, auriowl: 200 } });
  assertArrayEqual(deriveResonanceCircle(state).map((c) => c.id), ["auriowl"], "active excluded");
});

// ---- session 建立與相性 ----

runCase("no circle keeps legacy session shape and main affinity", () => {
  const session = makeSession({ circleIds: [] });
  assertEqual(session.circle.length, 0, "empty circle on session");
  assertEqual(session.affinityTier, "neutral", "greyshade neutral vs sadness");
});

runCase("best circle affinity wins (attuned support lifts neutral main)", () => {
  // static_wisp = sadness → attuned fire。主夥伴灰影貓 neutral，圈員焰尾小狐 fire。
  const session = makeSession({ circleIds: ["blazetail-kit"] });
  assertEqual(session.affinityTier, "attuned", "support attunement adopted");
  assertEqual(session.affinityMultiplier, 1.25, "attuned multiplier");
});

runCase("dissonant main is diluted to neutral when supports stand in the circle", () => {
  // static_wisp = sadness → dissonant water。主夥伴晶鰭小海馬 water。
  const alone = makeSession({ activeId: "crystalfin-seahorse", circleIds: [] });
  const together = makeSession({ activeId: "crystalfin-seahorse", circleIds: ["sprigfawn"] });
  assertEqual(alone.affinityTier, "dissonant", "alone stays dissonant");
  assertEqual(together.affinityTier, "neutral", "circle dilutes dissonance");
  assertEqual(together.affinityMultiplier, 1, "neutral multiplier");
});

runCase("circle members carry stance + full breath; state input is not mutated", () => {
  const stateBefore = JSON.stringify({ bond: 0 });
  const session = makeSession({ circleIds: ["starstripe-cub"] });
  const member = session.circle[0];
  assertEqual(member.stanceId, CIRCLE_STANCES.earth.id, "earth stance assigned");
  assertEqual(member.breath, MAX_MEMBER_BREATH, "full breath at start");
  assertEqual(member.resting, false, "not resting at start");
  assertEqual(stateBefore, JSON.stringify({ bond: 0 }), "state untouched");
});

// ---- 陪伴姿態被動（每項都拿「無圈基準」同 rng 對照）----

runCase("water stance: barrier grants +1 stability", () => {
  const baseSession = makeSession({});
  baseSession.stability.current = baseSession.stability.max - 10; // 留出增益空間，避免滿值 clamp
  const base = applyPlayerAction(baseSession, "barrier", rng);
  const helpedSession = makeSession({ circleIds: ["crystalfin-seahorse"] });
  helpedSession.stability.current = helpedSession.stability.max - 10;
  const helped = applyPlayerAction(helpedSession, "barrier", rng);
  const baseGain = base.stability.current - baseSession.stability.current;
  const helpedGain = helped.stability.current - helpedSession.stability.current;
  assertEqual(helpedGain - baseGain, 1, "+1 stability from water assist");
  assertEqual(helped.circle[0].breath, MAX_MEMBER_BREATH - 1, "one breath spent");
});

runCase("fire stance: resonance quiets +1 extra noise", () => {
  // crystal_golemite = anger（attuned water）→ 火圈員相性中性，隔離出被動本身的 +1。
  const base = applyPlayerAction(makeSession({ enemyId: "crystal_golemite" }), "resonance", rng);
  const helped = applyPlayerAction(
    makeSession({ enemyId: "crystal_golemite", circleIds: ["blazetail-kit"] }),
    "resonance",
    rng
  );
  assertEqual(base.noise.current - helped.noise.current, 1, "+1 quiet from fire assist");
});

runCase("wood stance: noise recedes 1 every noise beat", () => {
  const base = makeSession({});
  base.turn = "noise";
  base.nextIntent = "lull";
  const baseAfter = applyNoiseTurn(base, rng);
  const helped = makeSession({ circleIds: ["sprigfawn"] });
  helped.turn = "noise";
  helped.nextIntent = "lull";
  const helpedAfter = applyNoiseTurn(helped, rng);
  assertEqual(baseAfter.noise.current - helpedAfter.noise.current, 1, "-1 noise from wood assist");
});

runCase("metal stance: lull grants +1 sync (capped at MAX_SYNC)", () => {
  const helped = makeSession({ circleIds: ["auriowl"] });
  helped.turn = "noise";
  helped.nextIntent = "lull";
  const after = applyNoiseTurn(helped, rng);
  assertEqual(after.sync, Math.min(2, MAX_SYNC), "sync 1 → 2 on lull");
});

runCase("earth stance: surge impact reduced by 1", () => {
  const base = makeSession({});
  base.turn = "noise";
  base.nextIntent = "surge";
  const baseAfter = applyNoiseTurn(base, rng);
  const helped = makeSession({ circleIds: ["starstripe-cub"] });
  helped.turn = "noise";
  helped.nextIntent = "surge";
  const helpedAfter = applyNoiseTurn(helped, rng);
  const baseLoss = base.stability.current - baseAfter.stability.current;
  const helpedLoss = helped.stability.current - helpedAfter.stability.current;
  assertEqual(baseLoss - helpedLoss, 1, "surge softened by 1");
});

runCase("neutral stance: steadies +2 once when stability first drops to half", () => {
  const session = makeSession({ activeId: "sprigfawn", circleIds: ["greyshade-cat"] });
  session.turn = "noise";
  session.nextIntent = "surge";
  session.stability.current = Math.floor(session.stability.max * 0.5) + 2; // 湧動後跌破一半
  const after = applyNoiseTurn(session, rng);
  assertEqual(after.circle[0].steadied, true, "steadied flag set");
  // 再一次湧動：不再發動（一場一次）。
  after.turn = "noise";
  after.nextIntent = "surge";
  const breathBefore = after.circle[0].breath;
  const again = applyNoiseTurn(after, rng);
  assertEqual(again.circle[0].breath, breathBefore, "no second steady");
});

// ---- 呼吸／喘息（非懲罰退圈）----

runCase("breath exhaustion sends the member to rest and stops the passive", () => {
  let session = makeSession({ circleIds: ["sprigfawn"] });
  for (let i = 0; i < MAX_MEMBER_BREATH; i += 1) {
    session.nextIntent = "lull";
    session.turn = "noise";
    session = applyNoiseTurn(session, rng);
  }
  assertEqual(session.circle[0].resting, true, "resting after breath spent");
  const noiseBefore = session.noise.current;
  session.nextIntent = "lull";
  session.turn = "noise";
  session = applyNoiseTurn(session, rng);
  assertEqual(session.noise.current, noiseBefore, "passive silent while resting");
  const restLine = session.log.some((entry) => entry.text.includes("喘一口氣"));
  assertEqual(restLine, true, "rest line spoken");
});

// ---- 主夥伴過勞 → 先撤退建議；結局與撤退權不受圈影響 ----

runCase("main fatigue at max suggests retreat exactly once", () => {
  let session = makeSession({ circleIds: ["auriowl"] });
  session.fatigue = MAX_FATIGUE - 1;
  session = applyPlayerAction(session, "resonance", rng);
  const suggestions = session.log.filter((entry) => entry.text.includes("先撤退，也是照顧彼此"));
  assertEqual(suggestions.length, 1, "suggested once");
  session.turn = "player";
  session = applyPlayerAction(session, "barrier", rng);
  const stillOnce = session.log.filter((entry) => entry.text.includes("先撤退，也是照顧彼此"));
  assertEqual(stillOnce.length, 1, "not repeated");
});

runCase("retreat stays available and settle rules unchanged with a circle", () => {
  const session = makeSession({ circleIds: ["sprigfawn", "auriowl"] });
  assertEqual(canUseAction(session, "retreat"), true, "retreat always available");
  session.noise.current = 1;
  session.nextIntent = "lull";
  session.turn = "noise";
  const after = applyNoiseTurn(session, rng); // 青蔭把最後 1 點雜訊放輕
  assertEqual(settleStandoff(after).outcome, "stabilized", "wood recede can settle the field");
});

runCase("circle opening line joins the standoff log", () => {
  const session = makeSession({ circleIds: ["sprigfawn", "auriowl"] });
  const hasIntro = session.log.some((entry) => entry.text.includes("【共鳴圈】") && entry.text.includes("芽角小鹿"));
  assertEqual(hasIntro, true, "circle intro line present");
});

const failed = cases.filter((c) => c.status === "failed");
console.log(JSON.stringify({ total: cases.length, failed: failed.length, cases }, null, 2));
if (failed.length > 0) process.exitCode = 1;

function runCase(name, fn) {
  try {
    fn();
    cases.push({ name, status: "passed" });
  } catch (error) {
    cases.push({ name, status: "failed", message: error.message });
  }
}
function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}
function assertArrayEqual(actual, expected, label) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), label);
}
