import { applyOfflineRecovery } from "./engine/offlineRecovery.js";
import AudioManager from "./audio/audioManager.js";
import { CURRENT_CREATURE_ID, FALLBACK_CREATURE } from "./engine/personalityProfile.js";
import { createInteractionController } from "./engine/interactionController.js";
import { bindViewportVars, qs } from "./utils/dom.js";
import EventBus from "./utils/eventBus.js";
import { loadState, saveState } from "./state/saveManager.js";
import { estimateSaveSizeKB } from "./engine/storageGuard.js";
import * as store from "./state/store.js";
import {
  applyDevQueryHooks,
  applyDevResetHook,
  createDevPanelController,
  readDevPanelFlag,
  readDevQueryHooks
} from "./ui/devPanelController.js";
import { createPanelManager } from "./ui/panelManager.js";
import { createHudController } from "./ui/hudController.js";
import { createSoulTalkController } from "./ui/soulTalkController.js";
import { createActionSheetController } from "./ui/actionSheetController.js";
import {
  animateParticles,
  createEnvironmentLayer,
  createParticles,
  createPixiApp,
  getSceneLayers,
  createWorld,
  updateEnvironmentLayer
} from "./pixi/pixiApp.js";
import { bindCompanionTap, createCreatureNode, positionCompanion } from "./pixi/companionRenderer.js";
import { enableEditorMode, readSceneEditorFlag } from "./tools/sceneEditor.js";
import {
  createCompanionMotion,
  playDevMotion,
  updateCompanionMotion
} from "./pixi/motionController.js";

const CREATURES_PATH = "./data/creatures.json";
const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
const ENVIRONMENT_EFFECT_LIFETIME_MS = 720;
let currentCreature = FALLBACK_CREATURE;
let companionMotionController = null;
let interactionController = null;
let currentMotionState = "idle_calm";
let devPanelController = null;
let lastSaveStatus = { ok: true, emergency: false, estimatedSaveSizeKB: 0 };

bootstrap();

async function bootstrap() {
  const statusText = qs("#status-text");
  bindViewportVars();
  AudioManager.initUnlock();
  bindAudioControls();
  bindSettingsDropdown();

  const isDevPanelEnabled = readDevPanelFlag();
  const devQueryHooks = readDevQueryHooks();
  applyDevResetHook(devQueryHooks);
  const initialState = applyDevQueryHooks(applyOfflineRecovery(loadState()), devQueryHooks);
  store.replaceState(initialState);
  saveCurrentState();

  const hudController = createHudController({ store, statusText });
  const soulTalkController = createSoulTalkController({ store, saveCurrentState });
  const panelManager = createPanelManager({ onSoulTalkFocus: () => soulTalkController.focusInput() });
  const actionSheetController = createActionSheetController({
    soulTalkController,
    saveCurrentState,
    statusText,
    panelManager,
    store
  });

  panelManager.bind({
    openCharacterDetail: () => hudController.openCharacterDetail(panelManager),
    openSoulTalk: () => soulTalkController.openSoulTalk(panelManager)
  });
  soulTalkController.bind();
  actionSheetController.bind();

  store.subscribe(() => {
    hudController.renderHUD();
    soulTalkController.renderChat();
    devPanelController?.renderReadout();
  });

  if (!window.PIXI) {
    statusText.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
    return;
  }

  try {
    const app = await createPixiApp(qs("#game-root"));
    currentCreature = await loadCurrentCreature(statusText);
    hudController.setCreature(currentCreature);
    soulTalkController.setCreature(currentCreature);
    hudController.renderHUD();
    soulTalkController.renderChat();

    await bootScene(app, panelManager, statusText, soulTalkController);

    devPanelController = createDevPanelController({
      isEnabled: isDevPanelEnabled,
      store,
      saveCurrentState,
      playMotion: (motionState) => playDevMotion(companionMotionController, motionState),
      getCurrentMotionState: () => currentMotionState,
      getAnimationLabState: () => getAnimationLabState(),
      getStorageDebugState: () => lastSaveStatus,
      renderChat: () => soulTalkController.renderChat()
    });
    devPanelController.setup();
  } catch (error) {
    console.error(error);
    statusText.textContent = "場景初始化失敗，請重新整理頁面。";
  }
}

function bindAudioControls() {
  const audioToggleButton = qs("#btn-audio-toggle");
  if (!audioToggleButton) return;

  audioToggleButton.classList.toggle("muted", AudioManager.isMuted);
  audioToggleButton.addEventListener("click", () => {
    const isMuted = AudioManager.toggleMute();
    audioToggleButton.classList.toggle("muted", isMuted);
  });
}

function bindSettingsDropdown() {
  const settingsToggleButton = qs("#btn-settings-toggle");
  const settingsDropdown = qs("#settings-dropdown");
  if (!settingsToggleButton || !settingsDropdown) return;

  const setDropdownExpanded = (isExpanded) => {
    settingsDropdown.classList.toggle("expanded", isExpanded);
    settingsToggleButton.setAttribute("aria-expanded", String(isExpanded));
  };

  settingsToggleButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setDropdownExpanded(!settingsDropdown.classList.contains("expanded"));
  });

  settingsDropdown.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    setDropdownExpanded(false);
  });
}

async function bootScene(app, panelManager, statusText, soulTalkController) {
  const world = createWorld(app);
  const layers = getSceneLayers(world);

  const environmentLayer = await createEnvironmentLayer(layers, app);

  const particles = createParticles();
  layers.layerFX.addChild(particles);

  const environmentEffects = new PIXI.Container();
  environmentEffects.name = "environment_effects";
  layers.layerFX.addChild(environmentEffects);
  const activeEnvironmentEffects = [];

  EventBus.on(ENVIRONMENT_INTERACTION_EVENT, (event) => {
    if (event?.type !== "crystal_touch") return;
    activeEnvironmentEffects.push(createCrystalTouchEffect(environmentEffects, event));
  });

  const companion = await createCreatureNode(currentCreature, statusText);
  positionCompanion(companion, app);
  layers.layerEntity.addChild(companion);
  exposeDevCompanion(companion);

  companionMotionController = createCompanionMotion(companion, store.getState().mood);
  interactionController = createInteractionController({
    companion,
    creature: currentCreature,
    store,
    saveCurrentState,
    statusText,
    onStateChange: () => {
      soulTalkController.renderChat();
      devPanelController?.renderReadout();
    }
  });
  bindCompanionTap(companion, {
    isInteractionBlocked: () => panelManager.isPanelOpen(),
    onTouch: (touchType) => interactionController.handleTouch(touchType)
  });

  const isSceneEditorMode = readSceneEditorFlag();
  if (isSceneEditorMode) {
    enableEditorMode(app.stage);
  }

  let t = 0;
  app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;

    if (!isSceneEditorMode) {
      updateCompanionMotion(companion, companionMotionController, t, performance.now(), store.getState().mood, (motionState) => {
        currentMotionState = motionState;
        devPanelController?.renderReadout();
      }, {
        canAmbientWalk: !panelManager.isPanelOpen()
      });
    }
    if (!environmentLayer.magicCircle.__sceneEditorOriginalAlpha) {
      environmentLayer.magicCircle.alpha = 0.76 + Math.sin(t * 1.4) * 0.03;
    }

    if (companion.__accentFlame) {
      companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
    }

    updateEnvironmentLayer(environmentLayer, ticker);
    animateParticles(particles, t, ticker);
    updateEnvironmentEffects(activeEnvironmentEffects, ticker);
  });
}

function createCrystalTouchEffect(parent, event) {
  const effect = new PIXI.Container();
  effect.x = event.x;
  effect.y = event.y - 38;
  effect.__ageMs = 0;
  effect.__baseY = effect.y;

  const glow = new PIXI.Graphics();
  glow.circle(0, 0, 18).fill({ color: event.color, alpha: 0.16 });
  effect.addChild(glow);

  const crystal = new PIXI.Graphics();
  crystal
    .moveTo(0, -18)
    .lineTo(10, -2)
    .lineTo(0, 18)
    .lineTo(-10, -2)
    .closePath()
    .fill({ color: event.color, alpha: 0.58 });
  crystal.circle(0, 0, 3).fill({ color: 0xffffff, alpha: 0.72 });
  effect.addChild(crystal);

  for (let index = 0; index < 6; index += 1) {
    const angle = (Math.PI * 2 * index) / 6;
    const mote = new PIXI.Graphics();
    mote.circle(0, 0, 2.2).fill({ color: event.color, alpha: 0.75 });
    mote.x = Math.cos(angle) * 22;
    mote.y = Math.sin(angle) * 12;
    effect.addChild(mote);
  }

  parent.addChild(effect);
  return effect;
}

function updateEnvironmentEffects(activeEffects, ticker) {
  for (let index = activeEffects.length - 1; index >= 0; index -= 1) {
    const effect = activeEffects[index];
    effect.__ageMs += ticker.deltaMS;
    const progress = Math.min(1, effect.__ageMs / ENVIRONMENT_EFFECT_LIFETIME_MS);
    const pulse = Math.sin(progress * Math.PI);

    effect.alpha = 1 - progress;
    effect.y = effect.__baseY - progress * 18;
    effect.scale.set(0.7 + pulse * 0.35 + progress * 0.2);
    effect.rotation = progress * 0.22;

    if (progress >= 1) {
      effect.parent?.removeChild(effect);
      effect.destroy({ children: true });
      activeEffects.splice(index, 1);
    }
  }
}

function getAnimationLabState() {
  const animationController = companionMotionController?.getAnimationController?.();
  const status = animationController?.getStatus?.();
  return {
    metadataLoaded: Boolean(status?.metadataLoaded),
    currentAnimationName: animationController?.getCurrentAnimationName?.() || "fallback_placeholder",
    spriteSheetModeActive: Boolean(animationController),
    fallbackMotionModeActive: !animationController || Boolean(companionMotionController?.fallbackMotionActive),
    available: status?.available || {},
    missing: status?.missing || [],
    errors: status?.errors || []
  };
}

function exposeDevCompanion(companion) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("devPanel") !== "1" && params.get("devSceneEditor") !== "1") return;
  window.__NEXUS_TEST_COMPANION__ = companion;
}

async function loadCurrentCreature(statusText) {
  try {
    const response = await fetch(CREATURES_PATH, { cache: "no-cache" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const creatures = await response.json();
    const creature = creatures.find((item) => item.id === CURRENT_CREATURE_ID);
    if (!creature) throw new Error(`Creature not found: ${CURRENT_CREATURE_ID}`);

    return creature;
  } catch (error) {
    console.warn("Creature data load failed, fallback to default creature:", error);
    statusText.textContent = "角色資料載入失敗，已改用預設夥伴。";
    return FALLBACK_CREATURE;
  }
}

function saveCurrentState() {
  const result = saveState(store.getState());
  lastSaveStatus = {
    ok: Boolean(result.ok),
    emergency: Boolean(result.emergency),
    estimatedSaveSizeKB: result.state ? estimateSaveSizeKB(result.state) : 0
  };
  return result;
}
