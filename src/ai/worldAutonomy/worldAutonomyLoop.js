/**
 * worldAutonomyLoop.js
 * The main entry point for the World Autonomy Runtime.
 * Runs a deterministic, fast Utility AI / GOAP cycle.
 *
 * Phase 2 additions:
 * - Canonical state is read through `worldStateAdapter.js`, so drives are
 *   computed from real save data and unbacked needs are marked, not invented.
 * - Embodied actions pass through `worldBarkSystem.js` for a budgeted bark.
 * - The policy-abort branch now also gets a voice ("行動失敗，讓玩家知道原因"),
 *   instead of returning silently.
 *
 * Still 100% local and deterministic: no network, no LLM, no state mutation.
 */

import { buildWorldObservation } from "./worldObservationBuilder.js";
import { evaluateDrives } from "./driveModel.js";
import { scoreGoals } from "./utilityScorer.js";
import { selectWorldGoal } from "./worldGoalManager.js";
import { planWorldAction } from "./worldActionPlanner.js";
import { validateWorldAction } from "./worldActionPolicy.js";
import { executeWorldAction } from "./worldActionExecutor.js";
import { buildDecisionTrace } from "./worldReflection.js";
import { buildWorldRuntimeInput } from "./worldStateAdapter.js";
import { buildWorldBark, createWorldBarkBudgetState } from "./worldBarkSystem.js";

/**
 * @param {object} state Canonical game state (read-only).
 * @param {object} runtime `{ environment, now, seed, barkBudget, safeUnstable }`
 *   — session-only context held by the caller; the loop persists nothing.
 */
export function runWorldAutonomyLoop(state = {}, runtime = {}) {
  const now = Number.isFinite(Number(runtime.now)) ? Number(runtime.now) : Date.now();
  const seed = Number.isFinite(Number(runtime.seed)) ? Number(runtime.seed) : 0;
  const safeUnstable = Boolean(runtime.safeUnstable || state?.safeHarborMode);
  const barkBudget = runtime.barkBudget || createWorldBarkBudgetState(now);

  // 0. Adapt canonical state into the runtime schema and record what is real
  const { runtimeState, availability } = buildWorldRuntimeInput(state, runtime.environment);

  // 1. Observe the environment
  const observations = buildWorldObservation(runtimeState);

  // 2. Evaluate biological and psychological drives
  const drives = evaluateDrives(runtimeState);

  // 3. Score potential goals (Utility AI core)
  const scoredGoals = scoreGoals(drives, observations);

  // 4. Select the highest utility goal (with persistence/inertia)
  const goal = selectWorldGoal(scoredGoals, state);

  // 5. Plan the specific action to achieve the goal
  const plannedAction = planWorldAction(goal, observations);

  // 6. Safety & Policy Gate — one tick, one clock
  const policyCheck = validateWorldAction(plannedAction.actionId, { ...runtimeState, now });
  if (!policyCheck.valid) {
    const abortBark = buildWorldBark({
      plannedAction,
      drives,
      availability,
      budgetState: barkBudget,
      safeUnstable,
      abortReason: policyCheck.reason,
      now,
      seed
    });

    return {
      type: "world_tick",
      status: "aborted",
      reason: policyCheck.reason,
      bark: abortBark.spoken ? { barkKey: abortBark.barkKey, category: abortBark.category } : null,
      bodyCueId: abortBark.bodyCueId,
      barkBudget: abortBark.budgetAfter,
      availability,
      timestamp: now
    };
  }

  // 7. Bark — body language always, text only within budget
  const bark = buildWorldBark({
    plannedAction,
    drives,
    availability,
    budgetState: barkBudget,
    safeUnstable,
    now,
    seed
  });

  // 8. Execute - generate deterministic state patches
  const executionResult = executeWorldAction(plannedAction, bark);

  // 9. Reflect - generate lightweight decision trace
  const decisionTrace = buildDecisionTrace({
    drives,
    observations,
    goal,
    plannedAction,
    executionResult
  });

  return {
    type: "world_tick",
    status: "success",
    statePatch: executionResult.statePatch,
    decisionTrace,
    bark: bark.spoken ? { barkKey: bark.barkKey, category: bark.category } : null,
    bodyCueId: bark.bodyCueId,
    barkBudget: bark.budgetAfter,
    availability,
    timestamp: now
  };
}
