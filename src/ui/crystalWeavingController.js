import {
  observeCrystalWeaving,
  releaseCrystalMemory
} from "../engine/crystalWeavingEngine.js";
import { t } from "../i18n/i18n.js";

export function createCrystalWeavingController({
  store,
  saveCandidateState,
  onOutcome
} = {}) {
  let actionInFlight = false;

  function observe(memoryId = null, now = Date.now()) {
    const result = localizeOutcome(observeCrystalWeaving(store.getState(), memoryId, now));
    if (result?.outcomeKind === "crystal_observed") applyPresentationOutcome(result);
    return result;
  }

  async function release(memoryId, now = Date.now()) {
    if (actionInFlight) {
      return createControllerOutcome({
        outcomeKind: "crystal_release_busy",
        companionId: store.getState()?.activeCompanionId,
        message: t("memory.crystalResult.busy")
      });
    }

    actionInFlight = true;
    const stateBeforeAction = store.getState();
    try {
      const result = localizeOutcome(releaseCrystalMemory(stateBeforeAction, memoryId, now));
      if (result?.outcomeKind !== "crystal_released" || !result.statePatch) return result;

      const candidateState = { ...stateBeforeAction, ...result.statePatch };
      const saveResult = await saveCandidateState?.(candidateState);
      if (saveResult?.ok !== true) {
        return createControllerOutcome({
          outcomeKind: "crystal_release_save_failed",
          companionId: result.companionId,
          message: t("memory.crystalResult.saveFailed")
        });
      }

      store.setState(result.statePatch);
      applyPresentationOutcome(result);
      return result;
    } catch (error) {
      console.warn("Crystal weaving release failed", error);
      return createControllerOutcome({
        outcomeKind: "crystal_release_failed",
        companionId: stateBeforeAction?.activeCompanionId || null,
        message: t("memory.crystalResult.failed")
      });
    } finally {
      actionInFlight = false;
    }
  }

  function applyPresentationOutcome(result) {
    try {
      onOutcome?.(result);
    } catch (error) {
      console.warn("Crystal weaving presentation outcome was not applied", error);
    }
  }

  return {
    observe,
    release,
    isActionInFlight: () => actionInFlight
  };
}

function localizeOutcome(result) {
  if (!result?.message) return result;
  return { ...result, message: t(result.message) };
}

function createControllerOutcome({ outcomeKind, companionId, message }) {
  return {
    outcomeKind,
    sourceId: "crystal_weaving",
    companionId: companionId || null,
    statePatch: {},
    message,
    memoryObject: null,
    traceIntent: null,
    encounter: null,
    raphaelEvent: null,
    terminal: true
  };
}
