import { applyOfflineRecovery } from "./engine/offlineRecovery.js";
import { CURRENT_CREATURE_ID, FALLBACK_CREATURE, getTouchPersonality } from "./engine/personalityProfile.js";
import { evaluateTouchReaction } from "./engine/touchReactionEngine.js";
import { bindViewportVars, qs } from "./utils/dom.js";
import { loadState, saveState } from "./state/saveManager.js";
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
import { animateParticles, createParticles, createPixiApp, createWorld } from "./pixi/pixiApp.js";
import { createPlatformNode } from "./pixi/platformRenderer.js";
import { bindCompanionTap, createCreatureNode, positionCompanion } from "./pixi/companionRenderer.js";
import {
  createCompanionMotion,
  playDevMotion,
  triggerCompanionTouchMotion,
  updateCompanionMotion
} from "./pixi/motionController.js";

const CREATURES_PATH = "./data/creatures.json";
let currentCreature = FALLBACK_CREATURE;
let companionMotionController = null;
let currentMotionState = "idle_calm";
let devPanelController = null;

bootstrap();

async function bootstrap() {
  const statusText = qs("#status-text");
  bindViewportVars();

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
    panelManager
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
      renderChat: () => soulTalkController.renderChat()
    });
    devPanelController.setup();
  } catch (error) {
    console.error(error);
    statusText.textContent = "場景初始化失敗，請重新整理頁面。";
  }
}

async function bootScene(app, panelManager, statusText, soulTalkController) {
  const world = createWorld(app);

  // CSS owns the lake-night camp backdrop; PixiJS is reserved for companion and ambient effects.
  const particles = createParticles();
  world.addChild(particles);

  const platform = await createPlatformNode();
  world.addChild(platform);

  const companion = await createCreatureNode(currentCreature, statusText);
  positionCompanion(companion);
  world.addChild(companion);

  companionMotionController = createCompanionMotion(companion, store.getState().mood);
  bindCompanionTap(companion, {
    isInteractionBlocked: () => panelManager.isPanelOpen(),
    onTouch: (touchType) => {
      const interactionResult = handleCompanionTouch(touchType, statusText, soulTalkController);
      triggerCompanionTouchMotion(companionMotionController, interactionResult);
    }
  });

  let t = 0;
  app.ticker.add((ticker) => {
    t += ticker.deltaMS / 1000;

    updateCompanionMotion(companion, companionMotionController, t, performance.now(), store.getState().mood, (motionState) => {
      currentMotionState = motionState;
      devPanelController?.renderReadout();
    });
    platform.alpha = 0.76 + Math.sin(t * 1.4) * 0.03;

    if (companion.__accentFlame) {
      companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
    }

    animateParticles(particles, t, ticker);
  });
}

function handleCompanionTouch(touchType, statusText, soulTalkController) {
  const interactionResult = evaluateTouchReaction(
    store.getState(),
    getTouchPersonality(currentCreature),
    touchType
  );

  store.setState(interactionResult.statePatch);
  statusText.textContent = interactionResult.previewText;
  saveCurrentState();
  soulTalkController.renderChat();
  devPanelController?.renderReadout();
  return interactionResult;
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
  saveState(store.getState());
}
