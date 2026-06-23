import { deriveCompanionNeeds } from "./needModel.js";
import { selectActiveGoal } from "./goalManager.js";
import { planAutonomousAction } from "./actionPlanner.js";
import { executeAutonomousAction } from "./actionExecutor.js";
import { buildInteractionReflection } from "./reflectionEngine.js";
import { evaluateInitiativeCooldown } from "./initiativeCooldown.js";

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

  const execution = executeAutonomousAction({
    state,
    perception,
    plan,
    actionPlan,
    sedimentationResult,
    companion,
    corpus,
    cooldown
  });

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
    reflection
  };
}