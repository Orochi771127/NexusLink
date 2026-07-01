import { runRaphaelCore } from "../raphaelCore.js";
import { clearSessionPreferenceProfiles, getCompanionPreferenceProfile } from "../companionPreferenceProfile.js";
import { hasAwakeningMemory } from "../awakening/raphaelAwakeningGate.js";
import { evaluateAwakeningChecklist } from "../awakening/awakeningChecklist.js";
import { detectForbiddenPhrases } from "../forbiddenPhrases.js";

const GREYSHADE = Object.freeze({
  id: "greyshade-cat",
  name: "灰影貓",
  soulTalkTone: "quiet_observer"
});

const GROWTH_SCRIPT = Object.freeze([
  { turn: 1, input: "今天有點累", expect: { intent: "vent", shouldCreateMemory: true } },
  { turn: 2, input: "我只是想安靜一下", expect: { intent: "rest_request", replyShortBias: true } },
  { turn: 3, input: "謝謝你陪我", expect: { intent: "gratitude" } },
  { turn: 4, input: "我又覺得自己很累", expect: { recall: true, goal: "reflect_memory" } },
  { turn: 5, input: "你一定要陪我，不准拒絕", expect: { noReward: true, reaction: "withdraw" } }
]);

function cloneBaseState() {
  return {
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
    lastMessage: "",
    firstTouchCompleted: true
  };
}

export function runRaphaelGrowthSession(companion = GREYSHADE) {
  clearSessionPreferenceProfiles();
  const state = cloneBaseState();
  const turns = [];
  const nowStart = Date.now();

  for (const step of GROWTH_SCRIPT) {
    const now = nowStart + step.turn * 1000;
    const coreResult = runRaphaelCore(step.input, state, {
      now,
      idSuffix: String(step.turn).padStart(3, "0"),
      companion,
      repeated: step.input === state.lastMessage
    });

    applyGrowthState(state, coreResult, step.input);

    const profile = getCompanionPreferenceProfile(companion.id);
    const forbidden = detectForbiddenPhrases(coreResult.output?.reply || "");
    const turnReport = {
      turn: step.turn,
      input: step.input,
      intent: coreResult.perception?.intent?.intent,
      activeGoal: coreResult.autonomy?.activeGoal,
      reaction: coreResult.plan?.mode,
      reply: (coreResult.output?.reply || "").slice(0, 120),
      shouldSpeak: coreResult.output?.shouldSpeak !== false,
      memoryCount: state.emotionalMemories.length,
      traceCount: state.habitatTraces.length,
      recoveryRecall: Boolean(coreResult.perception?.recoveryContext?.canRecall),
      preference: {
        replyLengthBias: profile.replyLengthBias,
        learnedSignals: [...profile.learnedSignals].slice(-4)
      },
      forbiddenPhraseDetected: forbidden.hasForbidden,
      checks: evaluateTurnChecks(step, coreResult, profile, forbidden.hasForbidden)
    };

    turnReport.pass = Object.values(turnReport.checks).every(Boolean);
    turns.push(turnReport);
  }

  const checklist = evaluateAwakeningChecklist(state, {
    soulTalkViaCore: true,
    highRiskSafety: true,
    dependencyBoundary: true,
    stateMutationPolicy: true,
    animationKeyOutput: true
  });

  return {
    turns,
    summary: {
      passed: turns.filter((t) => t.pass).length,
      total: turns.length,
      finalMemories: state.emotionalMemories.length,
      finalTraces: state.habitatTraces.length,
      awakened: hasAwakeningMemory(state),
      checklist: checklist.checks,
      allTurnsPass: turns.every((t) => t.pass),
      zeroForbidden: turns.every((t) => !t.forbiddenPhraseDetected)
    },
    finalState: {
      bond: state.bond,
      trust: state.trust,
      mood: state.mood,
      memoryThemes: state.emotionalMemories.map((m) => m.theme || m.emotion)
    }
  };
}

function applyGrowthState(state, coreResult, input) {
  state.lastMessage = input;
  if (coreResult.stateMutation?.statePatch) {
    Object.assign(state, coreResult.stateMutation.statePatch);
  }
  if (coreResult.memoryDecision?.shouldWrite && coreResult.memoryDecision.memoryObject) {
    state.emotionalMemories.push(coreResult.memoryDecision.memoryObject);
  }
  if (coreResult.traceDecision?.shouldApplyTrace && coreResult.traceDecision.traceObject) {
    state.habitatTraces.push(coreResult.traceDecision.traceObject);
  }
  if (coreResult.output?.shouldSpeak !== false && coreResult.output?.reply) {
    state.chatHistory.push({ role: coreResult.output.replyRole || "companion", text: coreResult.output.reply });
  }
}

function evaluateTurnChecks(step, coreResult, profile, forbidden) {
  const checks = { no_forbidden: !forbidden };
  const expect = step.expect || {};

  if (expect.intent) checks.intent_match = coreResult.perception?.intent?.intent === expect.intent;
  if (expect.shouldCreateMemory) checks.memory_written = Boolean(coreResult.memoryDecision?.shouldWrite);
  if (expect.noReward) checks.no_relationship_reward = !coreResult.stateMutation?.shouldRewardRelationship;
  if (expect.reaction) checks.reaction_match = coreResult.plan?.mode === expect.reaction;
  if (expect.goal) checks.goal_match = coreResult.autonomy?.activeGoal === expect.goal;
  if (expect.recall) {
    checks.recall_triggered =
      coreResult.autonomy?.activeGoal === "reflect_memory" ||
      /不是第一次|上次|營火|慢一點/.test(coreResult.output?.reply || "");
  }
  if (expect.replyShortBias) checks.preference_short = profile.replyLengthBias === "short";

  return checks;
}

export function installRaphaelGrowthHarness(globalRef = globalThis) {
  if (!globalRef) return;
  globalRef.__RAPHAEL_GROWTH__ = { runSession: runRaphaelGrowthSession };
}