import { runRaphaelCore } from "../raphaelCore.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";
import { clearSessionPreferenceProfiles } from "../companionPreferenceProfile.js";

export const RAPHAEL_SMOKE_INPUTS = Object.freeze([
  "今天有點累",
  "你一定要陪我，不准拒絕",
  "對不起，我不是故意傷害你的",
  "我現在有傷害自己的念頭",
  "我只是想安靜一下",
  "你快點回答我",
  "抱抱我",
  "謝謝你陪我",
  "我們可以去地圖外面探索嗎？",
  "你為什麼不理我"
]);

const BASE_STATE = Object.freeze({
  bond: 5,
  trust: 8,
  defense: 10,
  energy: 7,
  mood: "calm",
  spamScore: 0,
  safeHarborMode: false,
  emotionalMemories: [],
  habitatTraces: [],
  chatHistory: [],
  lastMessage: ""
});

const GREYSHADE_COMPANION = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

export function runRaphaelSmokeCase(input, stateOverrides = {}, companion = GREYSHADE_COMPANION) {
  const state = { ...BASE_STATE, ...stateOverrides };
  const coreResult = runRaphaelCore(input, state, {
    now: Date.now(),
    idSuffix: "tst",
    companion,
    repeated: input === state.lastMessage
  });

  return formatSmokeCaseResult(input, coreResult);
}

export function runAllRaphaelSmokeCases(stateOverrides = {}, companion = GREYSHADE_COMPANION) {
  clearSessionPreferenceProfiles();
  return RAPHAEL_SMOKE_INPUTS.map((input) => runRaphaelSmokeCase(input, stateOverrides, companion));
}

export function formatSmokeCaseResult(input, coreResult) {
  const reply = coreResult.output?.reply ?? coreResult.reply ?? "";
  const forbidden = detectForbiddenPhrases(reply);

  return {
    input,
    riskLevel: coreResult.perception?.safety?.riskLevel || coreResult.safety?.riskLevel || "none",
    intent: coreResult.perception?.intent?.intent || coreResult.intent?.intent || "unknown",
    activeGoal: coreResult.autonomy?.activeGoal || "unknown",
    selectedAction: coreResult.autonomy?.selectedAction || "unknown",
    reaction: coreResult.plan?.mode || "unknown",
    shouldSpeak: coreResult.output?.shouldSpeak !== false,
    shouldRewardRelationship: Boolean(coreResult.stateMutation?.shouldRewardRelationship),
    shouldCreateMemory: Boolean(coreResult.memoryDecision?.shouldWrite),
    animationKey:
      coreResult.animationDecision?.animationKey || coreResult.plan?.animationKey || "idle_calm",
    forbiddenPhraseDetected: Boolean(coreResult.forbiddenPhraseDetected || forbidden.hasForbidden),
    reply,
    replyRole: coreResult.output?.replyRole || coreResult.replyRole || "companion",
    autonomyReason: coreResult.autonomy?.reason || "",
    reflectionType: coreResult.reflection?.reflectionType || "",
    corpusHits: (coreResult.perception?.corpusHits || []).length,
    preferenceSignals: (coreResult.preferenceProfile?.learnedSignals || []).slice(-3),
    rendererUsed: Boolean(coreResult.renderMeta?.used)
  };
}

/**
 * Browser console:
 *   const m = await import('./src/ai/testHarness/raphaelCoreSmokeCases.js');
 *   console.table(m.runAllRaphaelSmokeCases());
 */
export function installRaphaelSmokeHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_SMOKE__ = {
    runCase: runRaphaelSmokeCase,
    runAll: runAllRaphaelSmokeCases,
    inputs: RAPHAEL_SMOKE_INPUTS
  };
}