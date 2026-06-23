import { deriveCompanionNeeds } from "./needModel.js";
import { selectActiveGoal } from "./goalManager.js";
import { planAutonomousAction } from "./actionPlanner.js";
import { executeAutonomousAction } from "./actionExecutor.js";
import { buildInteractionReflection } from "./reflectionEngine.js";
import { evaluateInitiativeCooldown } from "./initiativeCooldown.js";
import { runCritics } from "../eval/runCritics.js";
import { repairGenericReply } from "../nlu/nluReplyBuilder.js";
import { buildSafetyRedirectReply } from "../safetyShield.js";
import { sanitizeReply } from "../forbiddenPhrases.js";
import { renderReply } from "../external/externalModelGateway.js";
import {
  buildPreferenceCooldown,
  applyPreferenceRepairs,
  updateCompanionPreferenceProfile
} from "../companionPreferenceProfile.js";

/**
 * Bounded Autonomous Companion Agent loop.
 * Observe → Evaluate → Choose Goal → Plan Action → Execute → Reflect (2-pass)
 */
export function runAutonomyLoop({
  state = {},
  perception = {},
  plan = {},
  sedimentationResult = {},
  companion = null,
  corpus = null,
  preferenceProfile = {},
  runtime = {}
} = {}) {
  const companionId = companion?.id || perception.persona?.companionId || "default";
  const preferenceCooldown = buildPreferenceCooldown(preferenceProfile);

  const needs = deriveCompanionNeeds({ state, perception, plan });
  const goal = selectActiveGoal(needs, perception, plan);

  const preliminaryAction = planAutonomousAction({
    activeGoal: goal.activeGoal,
    perception,
    plan,
    state,
    cooldown: { allowClarifyingQuestion: true, allowExplorationInvite: true, ...preferenceCooldown },
    persona: perception.persona
  });

  const cooldown = evaluateInitiativeCooldown({
    state,
    perception,
    actionPlan: preliminaryAction,
    preferenceCooldown
  });

  const actionPlan = planAutonomousAction({
    activeGoal: goal.activeGoal,
    perception,
    plan,
    state,
    cooldown: { ...cooldown, ...preferenceCooldown },
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
    cooldown: { ...cooldown, ...preferenceCooldown }
  });

  let critique = runCritics({
    perception,
    state,
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
      state,
      reply: execution.reply,
      actionPlan: execution.actionPlan,
      memoryDecision: execution.memoryDecision,
      output: {
        shouldSpeak: execution.shouldSpeak,
        shouldStaySilent: execution.shouldStaySilent
      }
    });
  }

  const renderResult = maybeRenderReply(execution, perception, runtime, preferenceProfile);
  if (renderResult.used) {
    execution = {
      ...execution,
      reply: renderResult.text,
      shouldSpeak: execution.shouldSpeak && Boolean(renderResult.text),
      shouldStaySilent: !execution.shouldSpeak || !renderResult.text,
      renderMeta: renderResult
    };
    critique = runCritics({
      perception,
      state,
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
    }
  }

  let reflection = buildInteractionReflection({
    perception,
    actionPlan: execution.actionPlan,
    execution,
    stateMutation: execution.stateMutation
  });

  const updatedProfile = updateCompanionPreferenceProfile(companionId, {
    reflection,
    perception,
    gateway: perception.gateway
  });

  execution = applyPreferenceRepairs(execution, updatedProfile);
  critique = runCritics({
    perception,
    state,
    reply: execution.reply,
    actionPlan: execution.actionPlan,
    memoryDecision: execution.memoryDecision,
    output: {
      shouldSpeak: execution.shouldSpeak,
      shouldStaySilent: execution.shouldStaySilent
    }
  });

  const reflectionPass2 = buildInteractionReflection({
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
    reflection: reflectionPass2,
    reflectionPasses: [reflection, reflectionPass2],
    critique,
    preferenceProfile: updatedProfile
  };
}

function maybeRenderReply(execution, perception, runtime, preferenceProfile) {
  const settings = runtime?.externalIntelligence || {};
  if (!settings.rendererEnabled || !execution.shouldSpeak || !execution.reply) {
    return { used: false, reason: "renderer_disabled" };
  }

  return renderReply({
    perception,
    coreDecision: {
      ...execution.actionPlan,
      reaction: execution.actionPlan?.reaction
    },
    draftReply: execution.reply,
    preferenceProfile,
    settings
  });
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

  if (
    codes.includes("generic_fallback_reply") ||
    codes.includes("generic_without_topic") ||
    codes.includes("missing_topic_reference") ||
    codes.includes("comfort_violates_constraint") ||
    codes.includes("comfort_instead_of_practical") ||
    codes.includes("too_similar_to_previous_reply")
  ) {
    reply = repairGenericReply({
      strategy: perception.responseStrategy?.strategy,
      nlu: perception.nlu,
      semanticFrame: perception.nlu?.semanticFrame,
      seed: (perception.gateway?.normalizedInput || "").length
    });
    shouldSpeak = Boolean(reply);
  }

  return {
    ...execution,
    reply,
    shouldSpeak,
    shouldStaySilent: !shouldSpeak,
    criticRepaired: true
  };
}