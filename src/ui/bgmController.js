/**
 * BGM scene router — one place maps app semantics → AudioManager.requestBgmScene.
 * Controllers emit BGM_SCENE_CHANGED; do not new Audio() in UI modules.
 */

import AudioManager from "../audio/audioManager.js";
import { BGM_SCENE, habitatSceneId } from "../data/bgmRegistry.js";
import EventBus from "../utils/eventBus.js";

export const BGM_SCENE_CHANGED = "bgm:scene-changed";

export function createBgmController() {
  let lastRequested = null;

  function request(sceneId, reason = "") {
    const id = String(sceneId || "").trim();
    if (!id) return;
    if (id === lastRequested && AudioManager.getActiveSceneId?.() === id) {
      // 仍轉呼叫：讓 manager 決定是否跳過重播。
    }
    lastRequested = id;
    AudioManager.requestBgmScene(id);
    if (typeof console !== "undefined" && console.debug) {
      console.debug("[BGM] scene", id, reason || "");
    }
  }

  function onHabitat(habitatId) {
    request(habitatSceneId(habitatId), "habitat");
  }

  function onOnboardingStep(step) {
    if (step === "bond") {
      request(BGM_SCENE.COMPANION_SELECT, "onboarding-bond");
      return;
    }
    if (step === "meet") {
      request(habitatSceneId("moonlake"), "onboarding-meet");
      return;
    }
    // start / identity / guidance → title
    request(BGM_SCENE.START, `onboarding-${step || "start"}`);
  }

  function onCompanionSelectOpened() {
    request(BGM_SCENE.COMPANION_SELECT, "companion-select-open");
  }

  function onCompanionSelectClosed(habitatId) {
    onHabitat(habitatId || "moonlake");
  }

  function onHome(habitatId) {
    onHabitat(habitatId || "moonlake");
  }

  function bind() {
    EventBus.on(BGM_SCENE_CHANGED, (payload) => {
      const sceneId = payload?.sceneId;
      if (!sceneId) return;
      request(sceneId, payload?.reason || "event");
    });
  }

  return {
    bind,
    request,
    onHabitat,
    onOnboardingStep,
    onCompanionSelectOpened,
    onCompanionSelectClosed,
    onHome,
    scenes: BGM_SCENE
  };
}
