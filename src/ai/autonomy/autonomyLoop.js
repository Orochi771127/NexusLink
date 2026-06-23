import { deriveCompanionNeeds } from "./needModel.js";
import { selectActiveGoal } from "./goalManager.js";
import { planAutonomousAction } from "./actionPlanner.js";
import { executeAutonomousAction } from "./actionExecutor.js";
import { buildInteractionReflection } from "./reflectionEngine.js";
import { evaluateInitiativeCooldown } from "./initiativeCooldown.js";
import { runCritics } from "../eval/runCritics.js";
import { buildSafetyRedirectReply } from "../safetyShield.js";
import { sanitizeReply } from "../forbiddenPhrases.js";

/**
 * Bounded Autonomous Companion Agent loop.
 * Observe → Evaluate → Choose Goal → Plan Action → Execute → Reflect
 */
export function runAutonomyLoop({
  state = {},
  perception = {},
  plan = {},
  sedimentationResult = {},
  companion = null,
  corpus = null
} = {}) {
  const needs = deriveCompanionNeeds({ state, perception, plan });
  const goal = selectActiveGoal(needs, perception, plan);

  const preliminaryAction = planAutonomousAction({
    activeGoal: goal.activeGoal,
    perception,
    plan,
    cooldown: { allowClarifyingQuestion: true, allowExplorationInvite: true },
    persona: perception.persona
  });

  const cooldown = evaluateInitiativeCooldown({ state, perception, actionPlan: preliminaryAction });

  const actionPlan = planAutonomousAction({
    activeGoal: goal.activeGoal,
    perception,
    plan,
    cooldown,
    persona: perception.persona
  });

  let execution = executeAutonomousAction({
    state,
    perception,
    plan,
    actionPlan,
    sedimentationResult,
    companion,
    corpus,
    cooldown
  });

  let critique = runCritics({
    perception,
    reply: execution.reply,
    actionPlan: execution.actionPlan,
    memoryDecision: execution.memoryDecision,
    output: {
      shouldSpeak: execution.shouldSpeak,
      shouldStaySilent: execution.shouldStaySilent
    }
  });

  if (!critique.pass) {
    execution = applyCriticRepairs(execution, critique, perception);
    critique = runCritics({
      perception,
      reply: execution.reply,
      actionPlan: execution.actionPlan,
      memoryDecision: execution.memoryDecision,
      output: {
        shouldSpeak: execution.shouldSpeak,
        shouldStaySilent: execution.shouldStaySilent
      }
    });
  }

  const reflection = buildInteractionReflection({
    perception,
    actionPlan: execution.actionPlan,
    execution,
    stateMutation: execution.stateMutation
  });

  return {
    needs,
    goal,
    cooldown,
    actionPlan: execution.actionPlan,
    execution,
    reflection,
    critique
  };
}

function applyCriticRepairs(execution, critique, perception) {
  const codes = critique.failureCodes || [];
  let reply = execution.reply;
  let shouldSpeak = execution.shouldSpeak;

  if (codes.some((code) => String(code).includes("too_affectionate") || code === "pressure_requires_boundary_action")) {
    reply = buildSafetyRedirectReply({ category: "dependency_pressure" });
    shouldSpeak = true;
  }

  if (codes.includes("body_cue_should_stay_silent") || codes.includes("body_cue_has_verbal_reply")) {
    reply = "";
    shouldSpeak = false;
  }

  if (codes.some((code) => String(code).startsWith("forbidden_phrase"))) {
    reply = sanitizeReply(reply, 0).text;
  }

  return {
    ...execution,
    reply,
    shouldSpeak,
    shouldStaySilent: !shouldSpeak,
    criticRepaired: true
  };
}