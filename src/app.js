import { applyOfflineRecovery } from "./engine/offlineRecovery.js";
import AudioManager from "./audio/audioManager.js";
import { FALLBACK_CREATURE } from "./engine/personalityProfile.js";
import { getCompanionById } from "./data/companionRegistry.js";
import { normalizeRuntimeCompanionId } from "./data/companionRuntimePolicy.js";
import { createInteractionController } from "./engine/interactionController.js";
import { bindViewportVars, qs } from "./utils/dom.js";
import EventBus from "./utils/eventBus.js";
import { loadState, saveState } from "./state/saveManager.js";
import { createSaveQueue, SAVE_LEVEL } from "./state/saveQueue.js";
import { createRuntimeGuard } from "./engine/runtimeGuard.js";
import { estimateSaveSizeKB } from "./engine/storageGuard.js";
import { startEnvironmentHeartbeat } from "./engine/environmentHeartbeat.js";
import { isWithinSleepWindow, shouldSleep } from "./engine/sleepCycleEngine.js";
import {
  buildReturnBehavior,
  buildReturnGreeting,
  getReturnMessage,
  pickReturnPresenceLine,
  resolveReturnAnimationIntent
} from "./engine/returnBehaviorEngine.js";
import { mapHabitatTracesToVisuals } from "./engine/traceVisualMapper.js";
import { createRaphaelAgentIntent } from "./ai/raphaelAgentAdapter.js";
import { replacePreferenceStore } from "./ai/companionPreferenceStore.js";
import { applyRaphaelAgentReduction, reduceRaphaelAgentIntent } from "./engine/raphaelIntentReducer.js";
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
import { createCompanionFeedbackController } from "./ui/companionFeedbackController.js";
import { createSoulTalkController } from "./ui/soulTalkController.js";
import { createOnboardingController } from "./ui/onboardingController.js";
import { createFirstLoopController } from "./ui/firstLoopController.js";
import { createInteractionHintController } from "./ui/interactionHintController.js";
import { createGentleInvitationController } from "./ui/gentleInvitationController.js";
import { createResonanceThreadController } from "./ui/resonanceThreadController.js";
import { createCompanionInitiativeController } from "./ui/companionInitiativeController.js";
import { createHabitatMomentController } from "./ui/habitatMomentController.js";
import { createAudioCueController } from "./ui/audioCueController.js";
import { createActionSheetController } from "./ui/actionSheetController.js";
import { createCalmSyncController } from "./ui/calmSyncController.js";
import { createCrystalWeavingController } from "./ui/crystalWeavingController.js";
import { createCompanionGrowthController } from "./ui/companionGrowthController.js";
import { createPageRouter } from "./ui/pageRouter.js";
import { createSettingsController } from "./ui/settingsController.js";
import { createBgmController } from "./ui/bgmController.js";
import { createCompanionSelectController } from "./ui/companionSelectController.js";
import { createMapController } from "./ui/mapController.js";
import { createAtlasController } from "./ui/atlasController.js";
import { getHabitatById, normalizeHabitatId } from "./data/habitatRegistry.js";
import { getSceneProfile, setActiveSceneProfile } from "./data/sceneProfiles/index.js";
import { LANGUAGE_CHANGED_EVENT } from "./i18n/i18n.js";
import { createBattleController } from "./ui/battleController.js";
import { createExpeditionController } from "./ui/expeditionController.js";
import { createOrbitBattleController } from "./ui/orbitBattleController.js";
import { createCodexController } from "./ui/codexController.js";
import {
  animateParticles,
  createEnvironmentLayer,
  createParticles,
  createPixiApp,
  getSceneLayers,
  createWorld,
  switchEnvironmentHabitat,
  updateEnvironmentLayer
} from "./pixi/pixiApp.js";
import {
  createHabitatWeatherFx,
  getHabitatWeather,
  HABITAT_WEATHER_HOOKS,
  onHabitatWeatherChange,
  resizeHabitatWeatherFx,
  setHabitatWeather,
  updateHabitatWeatherFx
} from "./pixi/habitatWeatherFx.js";
import {
  createHabitatLightingFx,
  resizeHabitatLightingFx,
  updateHabitatLightingFx
} from "./pixi/habitatLightingFx.js";
import {
  clearSceneTimePhaseOverride,
  getEnvironmentState,
  setSceneTimePhaseOverride
} from "./engine/environmentController.js";
import { createMoonlakeLive3dScene } from "./three/moonlakeLive3dScene.js";
import { MOONLAKE_INTERACTION_HOTSPOTS } from "./three/moonlakeLive3dConfig.js";
import { bindCompanionTap, createCreatureNode, positionCompanion } from "./pixi/companionRenderer.js";
import { createHabitatTraceRenderer } from "./pixi/habitatTraceRenderer.js";
import { createCrystalStateRenderer } from "./pixi/crystalStateRenderer.js";
import { enableEditorMode, readSceneEditorFlag } from "./tools/sceneEditor.js";
import {
  createCompanionMotion,
  getCompanionRoamingSnapshot,
  playDevMotion,
  rebaseCompanionMotion,
  snapCompanionRoamingToWaypoint,
  stageCompanionRoamingSegment,
  updateCompanionMotion
} from "./pixi/motionController.js";
import { resolveAnimationIntent } from "./engine/animationProfile.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";
const ENVIRONMENT_EFFECT_LIFETIME_MS = 720;
const FISHING_LINE_COLOR = 0xd9f7ff;
let currentCreature = FALLBACK_CREATURE;
let companionMotionController = null;

function renderActiveHabitatName(habitatId) {
  const habitat = getHabitatById(normalizeHabitatId(habitatId));
  const language = document.documentElement.dataset.lang || "tc";
  const label = qs(".v3-home-presence strong");
  if (!label) return;
  label.textContent = habitat.names?.[language] || habitat.name;
  label.removeAttribute("data-i18n");
  const kicker = qs(".v3-home-kicker");
  if (kicker) kicker.textContent = habitat.nameEn;
}
let interactionController = null;
let currentMotionState = "idle_calm";
let devPanelController = null;
let lastSaveStatus = { ok: true, emergency: false, estimatedSaveSizeKB: 0 };
let stopEnvironmentHeartbeat = null;
// 生理時鐘：記憶體追蹤最後一次玩家互動（不存檔、不動 defaultState）。
// 初始為 0（而非 now）：夜間時段一打開、若玩家沒在互動，夥伴就該是睡著的；
// 5 分鐘寬限只在「被玩家叫醒之後」才生效（避免剛操作就被強制睡）。
let lastInteractionAt = 0;
let wasSleeping = false;
function markInteraction() {
  lastInteractionAt = Date.now();
}

// dev-only 效能標記：僅在 window.__NEXUS_DEBUG_PERF__ = true 時輸出，不顯示任何 UI、不影響一般玩家。
function markPerf(name) {
  if (typeof window === "undefined" || !window.__NEXUS_DEBUG_PERF__) return;
  try { performance.mark(name); } catch (error) { /* no-op */ }
}
function measurePerf(name, startMark, endMark) {
  if (typeof window === "undefined" || !window.__NEXUS_DEBUG_PERF__) return;
  try { performance.measure(name, startMark, endMark); } catch (error) { /* no-op */ }
}

function showPixiLoadFailure(message = "棲地暫時無法顯示。請檢查網路後重新整理；你的本機記憶仍安全保留。") {
  const failureNotice = document.querySelector("#pixi-load-failure");
  if (!failureNotice) return;
  const detail = failureNotice.querySelector("span");
  if (detail) detail.textContent = message.replace(/^棲地暫時無法顯示[。]?\s*/, "");
  failureNotice.hidden = false;
}

// Animation intent bridge：跨層 EventBus → 解析 intent → 對「目前 active companion」播一次性動畫。
// 走 interactionController.playAnimation（既有 lock 路徑），播完自動回 mood idle；
// 缺動畫時 resolver 已先 fallback。UI 不直接碰 PIXI、不新增 ticker。
function playCompanionAnimationIntent(intent) {
  if (!intent || !interactionController) return;
  if (interactionController.isAnimationLocked?.()) return;
  const animationController = interactionController.companion?.__animationController;
  if (!animationController) return; // placeholder 角色無 sprite controller：安靜略過
  const probe = animationController.canResolve
    ? (name) => animationController.canResolve(name)
    : (name) => animationController.hasAnimation?.(name);
  const animationName = resolveAnimationIntent(intent, probe);
  // 強制非可中斷一次性播放（lock）：intent cue 是主動回饋，必須蓋過 per-frame mood idle。
  // 走路幀的 ANIMATION_REGISTRY.interruptible=true，不帶第二參數時 playAnimation 不上鎖；
  // 而 updateCompanionMotion 只在 isAnimationLocked() 時讓位，否則每幀把 mood idle 蓋回，
  // 導致 move.front/back/left/right 方向 cue 在可見瀏覽器被即時覆蓋成 idle_calm。
  interactionController.playAnimation(animationName, false);
}

bootstrap();

async function bootstrap() {
  markPerf("nexus:start");
  const statusText = qs("#status-text");
  bindViewportVars();
  AudioManager.initUnlock();
  // 場景 BGM：單一入口；實際曲目由 bgmRegistry 解析。解鎖前只記錄 pending。
  const bgmController = createBgmController();
  bgmController.bind();
  bindSettingsDropdown();
  ensureRaphaelAgentPresenceStyles();
  installRaphaelPreviewHarnessIfRequested();

  const isDevPanelEnabled = readDevPanelFlag();
  const devQueryHooks = readDevQueryHooks();
  applyDevResetHook(devQueryHooks);
  const bootNow = Date.now();
  const loadedState = loadState();
  const previousSeenAt = Number(loadedState.lastSeenAt) || bootNow;
  const initialState = applyDevQueryHooks(applyOfflineRecovery(loadedState), devQueryHooks);
  const shouldRunOnboarding = !initialState.onboarding?.completed;

  const elapsedAwayMs = bootNow - previousSeenAt;
  const returnBehavior = shouldRunOnboarding ? null : buildReturnBehavior(initialState, bootNow);
  // Return Echo 優先使用真實 habitat trace；沒有 trace-aware echo 時才退回既有 presence/greeting。
  const returnGreeting =
    getReturnMessage(returnBehavior) ||
    pickReturnPresenceLine(elapsedAwayMs, initialState) ||
    buildReturnGreeting(elapsedAwayMs, initialState);
  const hasRecentReturnGreeting = (initialState.chatHistory || [])
    .slice(-8)
    .some((entry) => entry?.role === "companion" && entry?.text === returnGreeting);
  if (!shouldRunOnboarding && returnGreeting && !hasRecentReturnGreeting) {
    initialState.chatHistory = [
      ...(Array.isArray(initialState.chatHistory) ? initialState.chatHistory : []),
      { role: "companion", text: returnGreeting }
    ].slice(-24);
  }
  if (!shouldRunOnboarding && returnBehavior?.shouldPersist) {
    if (returnBehavior.moodHint) initialState.mood = returnBehavior.moodHint;
    initialState.reactionPreview = returnGreeting || initialState.reactionPreview || "";
  }

  if (!shouldRunOnboarding && initialState.firstSessionOpeningSeenAt == null) {
    initialState.firstSessionOpeningSeenAt = bootNow;
  }

  // 回歸一次性動畫 cue：此處先算 intent，待 bootScene（動畫橋接/控制器就緒）後再 emit 一次。
  const pendingReturnIntent = shouldRunOnboarding
    ? null
    : resolveReturnAnimationIntent(elapsedAwayMs, {
        ...initialState,
        lastEmotionTag: returnBehavior?.dominantEmotion || initialState.lastEmotionTag
      });

  // Offline recovery updates every established canonical relationship, then
  // hydrates active; seal the return-behavior mirror before boot publish.
  store.replaceRuntimeState(initialState);
  replacePreferenceStore(initialState.companionPreferences);
  markPerf("nexus:state-loaded");
  const saveQueue = createSaveQueue(saveCurrentState);
  saveQueue.enqueue(SAVE_LEVEL.CRITICAL);
  const saveInteraction = () => {
    markInteraction();
    return saveQueue.enqueue(SAVE_LEVEL.INTERACTION);
  };
  const saveCritical = () => {
    markInteraction();
    return saveQueue.enqueue(SAVE_LEVEL.CRITICAL);
  };
  const saveCriticalSnapshot = (candidateState) => {
    markInteraction();
    return saveCurrentState(candidateState);
  };
  const saveDebounced = () => saveQueue.enqueue(SAVE_LEVEL.DEBOUNCE);

  const hudController = createHudController({ store, statusText });
  // 主畫面回饋 toast：接夥伴觸碰反應（含拒絕）與 Care/Growth/探索的動作狀態。
  const companionFeedbackController = createCompanionFeedbackController();
  companionFeedbackController.bind();
  const soulTalkController = createSoulTalkController({
    store,
    saveCurrentState: saveInteraction,
    saveCriticalState: saveCritical
  });
  const panelManager = createPanelManager({ onSoulTalkFocus: () => soulTalkController.focusInput() });
  // 夥伴切換鏈（companionSelect 與初遇定情共用）：normalize → registry → HUD/心語 → scene swap。
  async function applyCompanionChange(companionId) {
    const normalizedCompanionId = normalizeRuntimeCompanionId(companionId, store.getState());
    const nextCompanion = getCompanionById(normalizedCompanionId);
    currentCreature = nextCompanion;
    hudController.setCreature(nextCompanion);
    soulTalkController.setCreature(nextCompanion);
    hudController.renderHUD();
    await sceneApi?.swapCompanion(nextCompanion);
  }

  function applyQualitativeSliceOutcome(result = {}) {
    if (result.message) statusText.textContent = result.message;

    const environmentEvent = result.encounter?.environmentEvent;
    if (environmentEvent) {
      EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, environmentEvent);
    }

    const animationIntent = result.animationIntent || result.encounter?.animationIntent;
    if (animationIntent) {
      EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
        intent: animationIntent,
        source: "habitat-moment"
      });
    }

    if (result.raphaelEvent?.type) {
      emitRestrictedRaphaelAgentEvent(
        result.raphaelEvent.type,
        result.raphaelEvent.event || result.raphaelEvent.payload || {},
        { animationAlreadyApplied: Boolean(animationIntent) }
      );
    }
  }

  const onboardingController = createOnboardingController({
    store,
    saveCurrentState: () => saveQueue.enqueue(SAVE_LEVEL.CRITICAL),
    // 初遇定情（CH-2）：選定即切換棲地夥伴（state 已先寫入，normalize 會放行）。
    onBondChosen: (companionId) => applyCompanionChange(companionId),
    onStepShown: (step) => bgmController.onOnboardingStep(step)
  });
  // 柔性邀請（支柱二）：首輪後由夥伴狀態驅動的一句溫柔下一步，讓核心迴圈不再沉默。
  let resonanceThreadController = null;
  const gentleInvitationController = createGentleInvitationController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    isResonanceThreadVisible: () => resonanceThreadController?.isVisible?.() === true
  });
  // 共鳴線索（Pack 1）：最多一條可關閉方向；session-only，不寫存檔。
  resonanceThreadController = createResonanceThreadController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    onVisibilityChange: () => gentleInvitationController.render()
  });
  // Meet 之後的首輪閉環（觸碰→心語→痕跡）：完成/跳過前只開心核與心語入口。
  const firstLoopController = createFirstLoopController({
    store,
    saveCurrentState: () => saveQueue.enqueue(SAVE_LEVEL.CRITICAL),
    // 揭示句淡出後才讓柔性邀請接手同一訊息欄位，避免兩句同屏疊字。
    onRevealEnd: () => {
      resonanceThreadController.render();
      gentleInvitationController.render();
    },
    // 面板開啟時（如心語）暫時隱藏首輪單行提示，避免疊在面板內容上方。
    isPanelOpen: () => panelManager.isPanelOpen()
  });
  // 互動可讀性提示（支柱一）：貓身上的輕觸光暈，firstTouch 前指引新玩家「牠可以被碰」。
  const interactionHintController = createInteractionHintController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    isOnboardingActive: () => onboardingController?.isActive?.(),
    getCompanionTouchTarget: () => sceneApi?.getCompanionTouchTarget?.()
  });
  const habitatMomentController = createHabitatMomentController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    onOutcome: applyQualitativeSliceOutcome
  });
  // 主動微時刻（TP-7）：牠偶爾真的先動——狀態驅動、冷卻防打擾、不寫 chatHistory。
  const companionInitiativeController = createCompanionInitiativeController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    onMomentAvailable: (momentDef) => habitatMomentController.offer(momentDef)
  });
  // 音訊提示（TP-6）：觸碰回饋與主動微時刻的極輕合成音（監聽既有事件）。
  const audioCueController = createAudioCueController();
  const settingsController = createSettingsController({
    panelManager,
    restartOnboarding: () => onboardingController.restart(),
    store,
    saveSettings: () => saveQueue.enqueue(SAVE_LEVEL.CRITICAL)
  });
  let sceneApi = null;

  // 效能：戰鬥／地圖／圖鑑／夥伴切換不是首屏必需，改為 lazy factory——
  // 只有玩家真的需要時才建立，縮短啟動成本。首屏只建 HUD/SoulTalk/PanelManager/ActionSheet。
  let battleController = null;
  let expeditionController = null;
  let orbitBattleController = null;
  let mapController = null;
  let codexController = null;
  let companionSelectController = null;
  let atlasController = null;
  let pageRouter = null;

  const calmSyncController = createCalmSyncController({
    store,
    saveCurrentState: saveInteraction,
    statusText,
    goHome: () => pageRouter?.navigate("home")
  });
  const crystalWeavingController = createCrystalWeavingController({
    store,
    saveCandidateState: saveCriticalSnapshot,
    onOutcome: applyQualitativeSliceOutcome
  });
  const companionGrowthController = createCompanionGrowthController();

  function getBattleController() {
    if (!battleController) {
      battleController = createBattleController({
        store,
        panelManager,
        soulTalkController,
        saveCurrentState,
        statusText,
        companionGrowthController
      });
      battleController.bind();
    }
    return battleController;
  }

  function getExpeditionController() {
    if (!expeditionController) {
      expeditionController = createExpeditionController({
        store,
        panelManager,
        statusText,
        saveCurrentState: saveInteraction,
        getSceneBridge: () => sceneApi?.sceneBridge || null,
        soulTalkController
      });
      expeditionController.bind();
    }
    return expeditionController;
  }

  function getOrbitBattleController() {
    if (!orbitBattleController) {
      orbitBattleController = createOrbitBattleController({
        store,
        statusText,
        panelManager,
        companionGrowthController,
        saveCurrentState: saveInteraction
      });
      orbitBattleController.bind();
    }
    return orbitBattleController;
  }

  function getMapController() {
    if (!mapController) {
      mapController = createMapController({
        store,
        panelManager,
        soulTalkController,
        saveCurrentState: saveInteraction,
        battleController: getBattleController(),
        expeditionController: getExpeditionController(),
        companionGrowthController,
        statusText,
        returnToHabitat: () => {
          panelManager.closePanel({ reason: "phase-return" });
          pageRouter?.navigate("home");
        }
      });
    }
    return mapController;
  }

  function getCodexController() {
    if (!codexController) {
      codexController = createCodexController({ store, panelManager });
    }
    return codexController;
  }

  function getAtlasController() {
    if (!atlasController) {
      atlasController = createAtlasController({
        panelManager,
        store,
        onHabitatSelect: async (habitatId) => {
          const normalizedId = normalizeHabitatId(habitatId);
          const switched = await sceneApi?.switchHabitat?.(normalizedId);
          if (!switched) return false;
          store.setState({ activeHabitatId: normalizedId });
          renderActiveHabitatName(normalizedId);
          bgmController.onHabitat(normalizedId);
          saveQueue.enqueue(SAVE_LEVEL.CRITICAL);
          statusText.textContent = `你與${currentCreature.name}來到了${getHabitatById(normalizedId).name}。`;
          panelManager.closePanel();
          return true;
        }
      });
    }
    return atlasController;
  }

  function getCompanionSelectController() {
    if (!companionSelectController) {
      companionSelectController = createCompanionSelectController({
        store,
        panelManager,
        saveCurrentState,
        onCompanionChanged: (companion) => applyCompanionChange(companion?.id),
        onOpened: () => bgmController.onCompanionSelectOpened()
      });
      // 關閉選單回到當前棲地 BGM（與 onboarding bond 共用同一曲目 ID）。
      panelManager.registerOnClose("companionSelect", () => {
        bgmController.onCompanionSelectClosed(store.getState().activeHabitatId);
      });
    }
    return companionSelectController;
  }

  const actionSheetController = createActionSheetController({
    soulTalkController,
    saveCurrentState: saveInteraction,
    statusText,
    panelManager,
    store,
    calmSyncController,
    openMap: () => getMapController().open(),
    openCodex: () => getCodexController().open(),
    routeNavAction: (action) => pageRouter?.navigate(action)
  });

  pageRouter = createPageRouter({
    store,
    panelManager,
    soulTalkController,
    actionSheetController,
    statusText,
    calmSyncController,
    crystalWeavingController,
    companionGrowthController,
    saveCandidateState: saveCriticalSnapshot,
    openMap: () => getMapController().open(),
    openCodex: () => getCodexController().open(),
    openAtlas: () => getAtlasController().open(),
    openOrbit: () => getOrbitBattleController().open()
  });

  panelManager.bind({
    character: () => hudController.openCharacterDetail(panelManager),
    soulTalk: () => soulTalkController.openSoulTalk(panelManager),
    companionSelect: () => getCompanionSelectController().open(),
    codex: () => getCodexController().open(),
    settings: () => settingsController.open()
  });
  soulTalkController.bind();
  onboardingController.bind();
  firstLoopController.bind();
  interactionHintController.bind();
  gentleInvitationController.bind();
  resonanceThreadController.bind();
  habitatMomentController.bind();
  companionInitiativeController.bind();
  audioCueController.bind();
  settingsController.bind();
  pageRouter.bind();
  actionSheetController.bind();
  // 設定音量／靜音套用後，依啟動情境寫入 pending／active BGM 場景。
  if (shouldRunOnboarding) {
    bgmController.onOnboardingStep("start");
  } else {
    bgmController.onHome(store.getState().activeHabitatId);
  }
  // 穩定的唯讀 readiness signal，供本機/CI 瀏覽器 gate 在操作前確認
  // 所有 DOM controllers 已完成綁定；不暴露 gameplay state。
  document.documentElement.dataset.nexusControllersReady = "true";
  markPerf("nexus:controllers-ready");

  let raphaelPresenceResetTimer = null;
  let lastRaphaelAgentSnapshot = createRaphaelAgentEventSnapshot(store.getState());

  function setRaphaelAgentPresence(presenceState) {
    if (typeof document === "undefined") return;
    const stateName = presenceState || "quiet";
    document.documentElement.dataset.raphaelAgentPresence = stateName;
    window.clearTimeout(raphaelPresenceResetTimer);
    if (stateName !== "quiet" && stateName !== "safety-exit") {
      raphaelPresenceResetTimer = window.setTimeout(() => {
        document.documentElement.dataset.raphaelAgentPresence = "quiet";
      }, 1600);
    }
  }

  function emitRestrictedRaphaelAgentEvent(eventType, event = {}, options = {}) {
    const currentState = store.getState();
    const intent = createRaphaelAgentIntent({
      eventType,
      event,
      state: currentState,
      companion: currentCreature,
      now: Date.now(),
      options: {
        suppressSpeech: true,
        animationAlreadyApplied: Boolean(options.animationAlreadyApplied)
      }
    });
    const reduction = reduceRaphaelAgentIntent(intent, currentState);

    applyRaphaelAgentReduction(reduction, {
      setPresenceState: setRaphaelAgentPresence,
      setStatusText: (text) => {
        if (text) statusText.textContent = text;
      },
      dispatchAnimation: (animation) => {
        if (options.animationAlreadyApplied || !animation?.intent) return;
        EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, {
          intent: animation.intent,
          source: animation.source || "raphael-agent"
        });
      }
    });

    return { intent, reduction };
  }

  function observeRaphaelAgentStateEvents(state) {
    const nextSnapshot = createRaphaelAgentEventSnapshot(state);
    const previousSnapshot = lastRaphaelAgentSnapshot;
    lastRaphaelAgentSnapshot = nextSnapshot;

    if (!previousSnapshot) return;

    if (nextSnapshot.traceSignature !== previousSnapshot.traceSignature) {
      emitRestrictedRaphaelAgentEvent("habitat_change", {
        traceSignature: nextSnapshot.traceSignature
      }, { animationAlreadyApplied: true });
    }

    if (nextSnapshot.explorationTotal > previousSnapshot.explorationTotal) {
      emitRestrictedRaphaelAgentEvent("exploration_result", {
        totalExplorations: nextSnapshot.explorationTotal,
        nodeId: nextSnapshot.explorationNodeId
      }, { animationAlreadyApplied: true });
    }

    if (nextSnapshot.battleAt && nextSnapshot.battleAt !== previousSnapshot.battleAt) {
      emitRestrictedRaphaelAgentEvent("standoff_result", {
        result: nextSnapshot.battleResult,
        battleAt: nextSnapshot.battleAt
      }, { animationAlreadyApplied: true });
    }
  }

  store.subscribe(() => {
    hudController.renderHUD();
    soulTalkController.renderChat();
    onboardingController.render();
    firstLoopController.render();
    interactionHintController.render();
    resonanceThreadController.render();
    gentleInvitationController.render();
    pageRouter.render();
    devPanelController?.renderReadout();
    observeRaphaelAgentStateEvents(store.getState());
  });
  EventBus.on(LANGUAGE_CHANGED_EVENT, () => renderActiveHabitatName(store.getState().activeHabitatId));

  stopEnvironmentHeartbeat?.();
  stopEnvironmentHeartbeat = startEnvironmentHeartbeat({
    store,
    saveCurrentState: saveDebounced,
    onHeartbeat: () => devPanelController?.renderReadout()
  });

  currentCreature = getCompanionById(store.getState().activeCompanionId);
  hudController.setCreature(currentCreature);
  soulTalkController.setCreature(currentCreature);
  hudController.renderHUD();
  soulTalkController.renderChat();
  onboardingController.render();

  if (!window.PIXI) {
    statusText.setAttribute("role", "alert");
    statusText.textContent = "棲地暫時無法顯示。請檢查網路後重新整理；你的本機記憶仍安全保留。";
    showPixiLoadFailure();
    return;
  }

  try {
    const app = await createPixiApp(qs("#game-root"));
    markPerf("nexus:pixi-ready");
    sceneApi = await bootScene(
      app,
      panelManager,
      statusText,
      soulTalkController,
      saveQueue,
      onboardingController,
      emitRestrictedRaphaelAgentEvent,
      getExpeditionController,
      bgmController
    );
    renderActiveHabitatName(store.getState().activeHabitatId);
    markPerf("nexus:first-scene-ready");

    // Return Echo 動畫 cue：場景與 COMPANION_ANIMATION_INTENT 橋接已就緒，emit 一次性 intent。
    // 不阻塞、不輪詢、不加 ticker；one-shot lock 中或缺圖時由橋接安全略過/ fallback。
    if (pendingReturnIntent) {
      EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, { intent: pendingReturnIntent, source: "return-echo" });
    }
    if (!shouldRunOnboarding && returnBehavior) {
      emitRestrictedRaphaelAgentEvent("return_echo", {
        returnBehavior,
        message: returnGreeting
      }, { animationAlreadyApplied: Boolean(pendingReturnIntent) });
    }

    // 效能：dev panel 是純開發工具，一般玩家路徑（無 ?devPanel=1）完全不建立、不 setup。
    // 全程以 devPanelController?. 取用，null 時安全略過。
    if (isDevPanelEnabled) {
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
      // dev-only：在 console 觸發任一 animation intent（一般玩家路徑不暴露）。
      // 例：__NEXUS_PLAY_ANIMATION_INTENT__("standoff.stabilized")
      if (typeof window !== "undefined") {
        window.__NEXUS_PLAY_ANIMATION_INTENT__ = (intent) =>
          EventBus.emit(COMPANION_ANIMATION_INTENT_EVENT, { intent, source: "dev" });
      }
    }
    markPerf("nexus:interactive");
    measurePerf("nexus:startup-total", "nexus:start", "nexus:interactive");
    measurePerf("nexus:scene-boot", "nexus:pixi-ready", "nexus:first-scene-ready");
  } catch (error) {
    console.error(error);
    statusText.textContent = "場景初始化失敗，請重新整理頁面。";
    showPixiLoadFailure("場景初始化失敗，請重新整理頁面；你的本機記憶仍安全保留。");
  }
}

function ensureRaphaelAgentPresenceStyles() {
  if (typeof document === "undefined") return;
  if (document.querySelector('link[data-raphael-agent-presence="true"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "./styles/raphael-agent-presence.css";
  link.dataset.raphaelAgentPresence = "true";
  document.head.appendChild(link);
}

function createRaphaelAgentEventSnapshot(state = {}) {
  const traces = Array.isArray(state.habitatTraces) ? state.habitatTraces : [];
  const traceSignature = traces
    .map((trace) => `${trace?.id || "trace"}:${trace?.status || "unknown"}:${trace?.emotion || "none"}:${trace?.intensity || 0}`)
    .join("|");

  return {
    explorationTotal: Number(state.explorationProgress?.totalExplorations) || 0,
    explorationNodeId: state.explorationProgress?.lastNodeId || null,
    battleAt: Number(state.battleRecord?.lastBattleAt) || 0,
    battleResult: state.battleRecord?.lastResult || null,
    traceSignature
  };
}

function bindSettingsDropdown() {
  const settingsToggleButton = qs("#btn-settings-toggle");
  const settingsDropdown = qs("#settings-dropdown");
  if (!settingsToggleButton || !settingsDropdown) return;
  if (settingsToggleButton.dataset.panelTrigger === "settings") return;

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

async function bootScene(
  app,
  panelManager,
  statusText,
  soulTalkController,
  saveQueue,
  onboardingController,
  raphaelAgentEventBridge = null,
  getExpeditionControllerRef = null,
  bgmController = null
) {
  const runtimeGuard = createRuntimeGuard(app);
  const world = createWorld(app);
  const layers = getSceneLayers(world);

  const initialHabitatId = normalizeHabitatId(store.getState().activeHabitatId);
  const initialProfile = setActiveSceneProfile(initialHabitatId);
  const environmentLayer = await createEnvironmentLayer(layers, app, initialProfile);
  const live3d = await createMoonlakeLive3dScene({
    gameRoot: app.canvas.parentElement,
    getEnvironmentState,
    getWeather: getHabitatWeather
  });
  const syncHybridRendererVisibility = () => {
    const useLive3d = live3d.ready && environmentLayer.profileId === "moonlake";
    live3d.setActive(useLive3d);
    setPixiEnvironmentVisibility(layers, !useLive3d, environmentLayer);
    return useLive3d;
  };
  syncHybridRendererVisibility();
  const crystalStateRenderer = createCrystalStateRenderer(PIXI, {
    crystal: environmentLayer.crystal,
    isReducedMotion: () =>
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) ||
      document.documentElement?.dataset?.reducedMotionPreference === "reduced"
  });

  // Full-viewport FX must not inherit the height-fitted 390x844 safe-zone
  // transform. On short mobile viewports that transform narrows overlays and
  // leaves untreated bright strips along both sides of the habitat.
  const viewportFx = new PIXI.Container();
  viewportFx.name = "habitat_viewport_fx";
  viewportFx.eventMode = "passive";
  world.addChild(viewportFx);

  const lightingFx = createHabitatLightingFx(PIXI, {
    width: app.screen.width,
    height: app.screen.height
  });
  viewportFx.addChild(lightingFx.root);

  const particles = createParticles();
  layers.layerFX.addChild(particles);

  // 天氣 FX（TP-HAB-WEATHER-1）：掛在 layerFX，氛圍 only。
  const weatherFx = createHabitatWeatherFx(PIXI, {
    width: app.screen.width,
    height: app.screen.height
  });
  viewportFx.addChild(weatherFx.root);
  // setHabitatWeather 會改 active id；ticker 內 updateHabitatWeatherFx 偵測差異後套用視覺。
  onHabitatWeatherChange(() => {
    weatherFx.weatherId = "__pending__";
  });
  const syncPixiAtmosphereVisibility = () => {
    const useLive3d = live3d.ready && environmentLayer.profileId === "moonlake";
    lightingFx.root.visible = !useLive3d;
    weatherFx.root.visible = !useLive3d;
  };
  syncPixiAtmosphereVisibility();

  // 預覽覆寫：?weather=rain|mist|clear|…  ?timePhase=dawn|day|dusk|night
  try {
    const params = new URLSearchParams(window.location.search);
    const weatherParam = params.get("weather");
    if (weatherParam) setHabitatWeather(weatherParam);
    const timeParam = params.get("timePhase");
    if (timeParam) setSceneTimePhaseOverride(timeParam);
    else clearSceneTimePhaseOverride();
  } catch {
    // ignore malformed query
  }

  // 天氣／時間 hook 可先掛；依賴 companion / swapCompanion 的 QA API 在 attach 後再補。
  if (typeof window !== "undefined") {
    window.__NEXUS_HABITAT = {
      setWeather: setHabitatWeather,
      setTimePhase: setSceneTimePhaseOverride,
      clearTimePhase: clearSceneTimePhaseOverride,
      weatherHooks: HABITAT_WEATHER_HOOKS,
      getActiveHabitat: () => environmentLayer.profileId
    };
  }

  const environmentEffects = new PIXI.Container();
  environmentEffects.name = "environment_effects";
  layers.layerFX.addChild(environmentEffects);
  const activeEnvironmentEffects = [];
  const fishingFx = createMoonlakeFishingFx(layers.layerFX);
  const habitatInteractionLayer = createMoonlakeInteractionLayer(PIXI, {
    parent: viewportFx,
    live3d,
    isActive: () => live3d.ready && environmentLayer.profileId === "moonlake",
    isBlocked: () => panelManager.isPanelOpen() || onboardingController?.isActive?.(),
    onInteraction: (interaction) => {
      markInteraction();
      const local = layers.layerFX.toLocal({ x: interaction.x, y: interaction.y });
      const event = {
        type: `${interaction.type}_tap`,
        interactionId: interaction.id,
        color: interaction.type === "lantern"
          ? "#FFD47A"
          : interaction.type === "crystal"
            ? "#56E8FF"
            : "#8EEBFF",
        x: local.x,
        y: local.y
      };
      EventBus.emit(ENVIRONMENT_INTERACTION_EVENT, event);
      statusText.textContent = getMoonlakeInteractionMessage(interaction.type);
    }
  });

  const habitatTraceRenderer = createHabitatTraceRenderer(PIXI, {
    fx: layers.layerFX,
    foreground: layers.layerForeground,
    platform: layers.layerPlatform
  });

  EventBus.on(ENVIRONMENT_INTERACTION_EVENT, (event) => {
    if (event?.type === "crystal_touch" || event?.type === "crystal_tap") {
      activeEnvironmentEffects.push(createCrystalTouchEffect(environmentEffects, event));
      return;
    }
    if (event?.type === "lantern_tap") {
      activeEnvironmentEffects.push(createLanternTouchEffect(environmentEffects, event));
      return;
    }
    if (event?.type === "water_tap") {
      activeEnvironmentEffects.push(createWaterRippleEffect(environmentEffects, event));
    }
  });

  // 氛圍鉤子：對峙／心語相關動畫意圖 → 天氣 preset（無獎勵、無 FOMO）
  EventBus.on(COMPANION_ANIMATION_INTENT_EVENT, (payload) => {
    const source = payload?.source || "";
    if (source === "battle" || source === "standoff" || source === "map-exploration") {
      setHabitatWeather(HABITAT_WEATHER_HOOKS.afterStandoffPressure);
      return;
    }
    if (source === "soul-talk" || source === "soulTalk" || source === "raphael") {
      setHabitatWeather(HABITAT_WEATHER_HOOKS.afterSoulTalk);
      return;
    }
    if (source === "calm-sync" || source === "care") {
      setHabitatWeather(HABITAT_WEATHER_HOOKS.afterRepair);
    }
  });

  // 效能：habitat trace 的 map+sync 從 ticker（每幀）移到「痕跡內容改變時」才跑。
  // ticker 只保留 update(t) 做逐幀動畫。先在 bootScene 同步一次（含 reload 後既有痕跡）。
  let lastHabitatTraceSig = null;
  function syncHabitatVisuals(state = store.getState()) {
    crystalStateRenderer.sync(state.emotionalMemories || []);

    const traces = state.habitatTraces || [];
    // 便宜的內容簽章：長度＋每筆 id/status/intensity；只在實際變動時重建 visuals。
    let sig = String(traces.length);
    for (let index = 0; index < traces.length; index += 1) {
      const trace = traces[index];
      sig += `|${trace.id}:${trace.status}:${trace.emotion}:${trace.intensity}`;
    }
    if (sig === lastHabitatTraceSig) return;
    lastHabitatTraceSig = sig;
    habitatTraceRenderer.sync(mapHabitatTracesToVisuals(traces));
  }
  syncHabitatVisuals();
  store.subscribe(syncHabitatVisuals);

  const reportCompanionStatus = ({ message }) => {
    if (message) statusText.textContent = message;
  };
  let companionPositionCleanup = null;
  let companionSwapVersion = 0;
  let companion = await createCreatureNode(currentCreature, { onStatus: reportCompanionStatus });

  function attachCompanion(node, creature) {
    companionPositionCleanup?.();
    companionPositionCleanup = positionCompanion(node, app);
    layers.layerEntity.addChild(node);
    exposeDevCompanion(node);

    companionMotionController = createCompanionMotion(node, store.getState().mood);
    const nodeInteractionController = createInteractionController({
      companion: node,
      creature,
      store,
      saveCurrentState: () => saveQueue.enqueue(SAVE_LEVEL.INTERACTION),
      statusText,
      onStateChange: () => {
        soulTalkController.renderChat();
        devPanelController?.renderReadout();
      }
    });
    interactionController = nodeInteractionController;
    bindCompanionTap(node, {
      isInteractionBlocked: () => panelManager.isPanelOpen() || onboardingController?.isActive?.(),
      onTouch: (touchType) => {
        markInteraction(); // 觸碰會喚醒睡眠中的夥伴
        return Promise.resolve(nodeInteractionController.handleTouch(touchType)).then((touchResult) => {
          raphaelAgentEventBridge?.("touch", {
            touchType,
            touchResult
          }, { animationAlreadyApplied: true });
          return touchResult;
        });
      }
    });
  }

  function getCompanionTouchTarget() {
    let bounds = null;
    try {
      bounds = companion?.getBounds?.() || null;
    } catch {
      return null;
    }
    const width = Number(bounds?.width);
    const height = Number(bounds?.height);
    const x = Number(bounds?.x);
    const y = Number(bounds?.y);
    if (
      !Number.isFinite(width)
      || !Number.isFinite(height)
      || !Number.isFinite(x)
      || !Number.isFinite(y)
      || width <= 0
      || height <= 0
    ) {
      return null;
    }
    return {
      x: x + width / 2,
      y: y + height / 2,
      size: Math.min(128, Math.max(68, Math.max(width, height) * 1.18))
    };
  }

  attachCompanion(companion, currentCreature);

  // 一次性註冊：動畫意圖橋接（戰鬥結算回棲地、dev helper 等都透過此事件）。
  EventBus.on(COMPANION_ANIMATION_INTENT_EVENT, (payload) => {
    playCompanionAnimationIntent(payload?.intent);
  });

  async function swapCompanion(nextCreature) {
    const swapVersion = ++companionSwapVersion;
    const previousCompanion = companion;
    interactionController?.dispose?.();
    interactionController = null;
    const nextCompanion = await createCreatureNode(nextCreature, {
      onStatus: (payload) => {
        if (swapVersion === companionSwapVersion) reportCompanionStatus(payload);
      }
    });
    if (
      swapVersion !== companionSwapVersion
      || store.getState().activeCompanionId !== nextCreature.id
    ) {
      nextCompanion.destroy({ children: true });
      return false;
    }
    companion = nextCompanion;
    attachCompanion(nextCompanion, nextCreature);
    if (previousCompanion && previousCompanion !== nextCompanion) {
      previousCompanion.parent?.removeChild(previousCompanion);
      previousCompanion.destroy({ children: true });
    }
    statusText.textContent = `${nextCreature.name}來到了你身邊。`;
    return true;
  }

  async function switchHabitat(habitatId) {
    const normalizedId = normalizeHabitatId(habitatId);
    const profile = getSceneProfile(normalizedId);
    const switched = await switchEnvironmentHabitat(environmentLayer, layers, app, profile);
    if (!switched) return false;
    store.setState({ activeHabitatId: normalizedId });
    renderActiveHabitatName(normalizedId);
    companionPositionCleanup = positionCompanion(companion, app);
    rebaseCompanionMotion(companionMotionController, companion);
    weatherFx.weatherId = "__pending__";
    syncHybridRendererVisibility();
    syncPixiAtmosphereVisibility();
    bgmController?.onHabitat?.(normalizedId);
    return true;
  }

  const isSceneEditorMode = readSceneEditorFlag();
  if (isSceneEditorMode) {
    enableEditorMode(app.stage);
  }

  const expeditionHost = new PIXI.Container();
  expeditionHost.name = "expedition_host";
  expeditionHost.visible = false;
  app.stage.addChild(expeditionHost);

  const sceneBridge = {
    PIXI: window.PIXI,
    getViewSize() {
      return { width: app.renderer.width, height: app.renderer.height };
    },
    mountExpedition(root) {
      expeditionHost.removeChildren();
      expeditionHost.addChild(root);
      world.visible = false;
      live3d.setActive(false);
      expeditionHost.visible = true;
    },
    unmountExpedition() {
      expeditionHost.removeChildren();
      expeditionHost.visible = false;
      world.visible = true;
      syncHybridRendererVisibility();
    }
  };

  const projectMoonlakeWorldPoint = (worldPoint) => {
    const screen = live3d.projectWorldToScreen(worldPoint);
    if (!screen?.visible) return null;
    const local = layers.layerEntity.toLocal({ x: screen.x, y: screen.y });
    return {
      x: Number(local.x),
      y: Number(local.y),
      scale: Number(screen.scale) || 1,
      referenceScale390: Number(screen.referenceScale390) || 1,
      depth: Number(screen.depth),
      surface: screen.surface || null,
      routeId: screen.routeId || null
    };
  };

  let t = 0;
  app.ticker.add((ticker) => {
    if (runtimeGuard.shouldSkipFrame()) return;

    const safeTicker = runtimeGuard.getSafeTicker(ticker);
    const expedition = getExpeditionControllerRef?.();
    if (expedition?.isActive()) {
      expedition.update(safeTicker);
      return;
    }

    t += safeTicker.deltaMS / 1000;

    if (!isSceneEditorMode) {
      const nowMs = Date.now();
      const isSleeping = shouldSleep(nowMs, lastInteractionAt);
      if (isSleeping !== wasSleeping) {
        wasSleeping = isSleeping;
        if (isSleeping) {
          statusText.textContent = `${currentCreature.name}在夜色裡睡著了。`;
        } else {
          statusText.textContent = isWithinSleepWindow(nowMs)
            ? `你輕輕喚醒了${currentCreature.name}。`
            : `${currentCreature.name}在晨光中醒了。`;
        }
      }
      updateCompanionMotion(companion, companionMotionController, t, performance.now(), store.getState().mood, (motionState) => {
        currentMotionState = motionState;
        devPanelController?.renderReadout();
      }, {
        canAmbientWalk: !panelManager.isPanelOpen() && !onboardingController?.isActive?.(),
        isSleeping,
        activeHabitatId: environmentLayer.profileId,
        companionId: currentCreature.id,
        deltaMs: safeTicker.deltaMS,
        reducedMotion: Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
          || document.documentElement?.dataset?.reducedMotionPreference === "reduced",
        projectWorldPoint: projectMoonlakeWorldPoint,
        // Moonlake fishing eligibility is further constrained by the active
        // bridge waypoint's authored orientation options.
        ambientActions: environmentLayer.profileId === "moonlake"
          ? ["fishing_back", "fishing_front", "fishing_side"]
          : []
      });
      updateMoonlakeFishingFx(
        fishingFx,
        getCompanionRoamingSnapshot(companionMotionController),
        companion,
        safeTicker
      );
    }
    if (environmentLayer.magicCircle && !environmentLayer.magicCircle.__sceneEditorOriginalAlpha) {
      environmentLayer.magicCircle.alpha = 0.76 + Math.sin(t * 1.4) * 0.03;
    }

    if (companion.__accentFlame) {
      companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
    }

    resizeHabitatLightingFx(lightingFx, app.screen.width, app.screen.height);
    resizeHabitatWeatherFx(weatherFx, app.screen.width, app.screen.height);
    habitatInteractionLayer.resize(app.screen.width, app.screen.height);
    habitatInteractionLayer.setVisible(
      live3d.ready && environmentLayer.profileId === "moonlake"
    );
    updateEnvironmentLayer(environmentLayer, safeTicker);
    live3d.update(safeTicker);
    updateHabitatLightingFx(lightingFx);
    updateHabitatWeatherFx(weatherFx, safeTicker);
    animateParticles(particles, t, safeTicker);
    updateEnvironmentEffects(activeEnvironmentEffects, safeTicker);

    // 水晶與 trace 的同步已移到 syncHabitatVisuals()（由 store.subscribe 驅動）；逐幀只做動畫更新。
    habitatTraceRenderer.update(t);
  });

  if (typeof window !== "undefined") {
    Object.assign(window.__NEXUS_HABITAT || (window.__NEXUS_HABITAT = {}), {
      switchHabitat: (habitatId) => switchHabitat(habitatId),
      // QA：切換夥伴（先寫 activeCompanionId，再走 scene swap）。
      swapCompanionById: async (companionId) => {
        const next = getCompanionById(companionId);
        if (!next) return false;
        store.setState({ activeCompanionId: next.id });
        return swapCompanion(next);
      },
      // QA：腳底基準（motion.base）對十字投影目標（__placementTarget）。
      getFootPlacement() {
        const target = companion?.__placementTarget || null;
        const baseX = Number(companionMotionController?.baseX ?? companion?.x);
        const baseY = Number(companionMotionController?.baseY ?? companion?.y);
        const scaleX = Number(companion?.scale?.x) || 1;
        const scaleY = Number(companion?.scale?.y) || 1;
        // opaque-foot 對齊時，可見腳掌 = base + opaqueFoot*scale；應等於十字目標。
        const opaque = companion?.__opaqueFoot || { x: 0, y: 0 };
        const footX = baseX + Number(opaque.x || 0) * scaleX;
        const footY = baseY + Number(opaque.y || 0) * scaleY;
        let globalX = null;
        let globalY = null;
        try {
          if (companion && typeof companion.toGlobal === "function") {
            const global = companion.toGlobal({
              x: Number(opaque.x || 0),
              y: Number(opaque.y || 0)
            });
            globalX = Number(global.x);
            globalY = Number(global.y);
          } else if (companion && typeof companion.getGlobalPosition === "function") {
            const global = companion.getGlobalPosition();
            globalX = Number(global.x) + Number(opaque.x || 0) * scaleX;
            globalY = Number(global.y) + Number(opaque.y || 0) * scaleY;
          }
        } catch {
          // ignore
        }
        const shadow = companion?.__groundShadow || null;
        const shadowFoot = companion?.__shadowFoot || null;
        const shadowLocalX = shadow ? Number(shadow.x) : null;
        const shadowLocalY = shadow ? Number(shadow.y) : null;
        // 有量到 opaque-foot 時：影子必須貼同一點。Placeholder 無貼圖則以 sync 結果為準（gap=0）。
        let shadowGap = null;
        if (shadowLocalX != null && shadowLocalY != null) {
          if (companion?.__opaqueFoot) {
            shadowGap = Math.hypot(
              shadowLocalX - Number(opaque.x || 0),
              shadowLocalY - Number(opaque.y || 0)
            );
          } else {
            shadowGap = 0;
          }
        }
        return {
          profileId: environmentLayer.profileId,
          companionId: store.getState().activeCompanionId || null,
          alignment: target?.alignment || null,
          footX,
          footY,
          baseX,
          baseY,
          targetX: Number(target?.x),
          targetY: Number(target?.y),
          globalX,
          globalY,
          shadowLocalX,
          shadowLocalY,
          shadowFootX: shadowFoot ? Number(shadowFoot.x) : null,
          shadowFootY: shadowFoot ? Number(shadowFoot.y) : null,
          shadowGap
        };
      },
      getActiveCompanionNode: () => companion || null,
      getLive3dDiagnostics: () => live3d.getDiagnostics(),
      getRoamingSnapshot: () => getCompanionRoamingSnapshot(companionMotionController),
      getFishingFxDiagnostics: () => fishingFx.getDiagnostics(),
      getInteractionHotspots: () => habitatInteractionLayer.getDiagnostics(),
      triggerHabitatInteractionForQa(interactionId) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("moonlakeBridgeQa") !== "1") return null;
        return habitatInteractionLayer.trigger(interactionId);
      },
      setRoamingWaypointForQa(waypointId) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("moonlakeBridgeQa") !== "1") return false;
        return snapCompanionRoamingToWaypoint(
          companionMotionController,
          waypointId,
          performance.now()
        );
      },
      setRoamingSegmentForQa(fromWaypointId, toWaypointId, progress = 0) {
        const params = new URLSearchParams(window.location.search);
        if (params.get("moonlakeBridgeQa") !== "1") return false;
        return stageCompanionRoamingSegment(
          companionMotionController,
          fromWaypointId,
          toWaypointId,
          progress
        );
      },
      playFishingForQa(waypointId, animationName, mirrorX = false) {
        const params = new URLSearchParams(window.location.search);
        const allowedAnimations = new Set([
          "fishing_back",
          "fishing_front",
          "fishing_side"
        ]);
        if (
          params.get("moonlakeBridgeQa") !== "1"
          || !allowedAnimations.has(animationName)
        ) {
          return false;
        }
        const snapped = snapCompanionRoamingToWaypoint(
          companionMotionController,
          waypointId,
          performance.now()
        );
        if (!snapped) return false;
        playDevMotion(companionMotionController, animationName, {
          mirrorX,
          waterSide: animationName === "fishing_back"
            ? "far"
            : mirrorX
              ? "left"
              : "right",
          durationMs: 10_000
        });
        return true;
      },
      clearForcedMotionForQa() {
        const params = new URLSearchParams(window.location.search);
        if (params.get("moonlakeBridgeQa") !== "1" || !companionMotionController) return false;
        companionMotionController.devForcedState = null;
        companionMotionController.devForcedUntil = 0;
        companionMotionController.devForcedMirrorX = false;
        companionMotionController.devForcedWaterSide = null;
        companionMotionController.devForcedRailOffsetX390 = 0;
        companionMotionController.ambientActionState = null;
        companionMotionController.ambientActionUntil = 0;
        companionMotionController.ambientActionMirrorX = false;
        companionMotionController.ambientActionWaterSide = null;
        companionMotionController.ambientActionRailOffsetX390 = 0;
        companionMotionController.fishingSequence = null;
        return true;
      }
    });
  }

  return {
    swapCompanion,
    switchHabitat,
    sceneBridge,
    live3d,
    getCompanionTouchTarget
  };
}

function setPixiEnvironmentVisibility(layers, visible, environmentLayer = null) {
  const environmentLayerNames = [
    "layerBackground",
    "layerCelestial",
    "layerMidground",
    "layerPlatform",
    "layerForeground",
    "layerOcclusion"
  ];
  environmentLayerNames.forEach((name) => {
    if (layers?.[name]) layers[name].visible = Boolean(visible);
  });
  if (environmentLayer?.habitatObjects?.root) {
    environmentLayer.habitatObjects.root.visible = Boolean(visible);
  }
}

function createMoonlakeInteractionLayer(PIXI, {
  parent,
  live3d,
  isActive,
  isBlocked,
  onInteraction
}) {
  const root = new PIXI.Container();
  root.name = "moonlake_interaction_hotspots";
  root.eventMode = "passive";
  parent.addChild(root);
  let lastWidth = 0;
  let lastHeight = 0;
  const targets = MOONLAKE_INTERACTION_HOTSPOTS.map((hotspot) => {
    const target = new PIXI.Container();
    target.name = `moonlake_interaction_${hotspot.id}`;
    target.eventMode = "static";
    target.cursor = "pointer";
    target.__hotspot = hotspot;
    target.on("pointerdown", (event) => {
      event?.stopPropagation?.();
      trigger(hotspot.id);
    });
    root.addChild(target);
    return target;
  });

  function resize(width, height) {
    if (lastWidth === width && lastHeight === height) return;
    lastWidth = width;
    lastHeight = height;
    targets.forEach((target) => {
      const projected = live3d.projectImageToScreen(target.__hotspot);
      target.visible = Boolean(projected?.visible);
      if (!projected) return;
      target.position.set(projected.x, projected.y);
      target.hitArea = new PIXI.Circle(
        0,
        0,
        target.__hotspot.radiusPx390 * projected.referenceScale390
      );
    });
  }

  function trigger(interactionId) {
    if (!isActive() || isBlocked()) return null;
    const result = live3d.triggerInteraction(interactionId);
    if (!result) return null;
    onInteraction?.(result);
    return result;
  }

  return {
    root,
    resize,
    trigger,
    setVisible(visible) {
      root.visible = Boolean(visible);
    },
    getDiagnostics() {
      return {
        active: root.visible,
        count: targets.length,
        targets: targets.map((target) => ({
          id: target.__hotspot.id,
          type: target.__hotspot.type,
          x: target.x,
          y: target.y,
          radius: Number(target.hitArea?.radius) || 0,
          visible: target.visible
        }))
      };
    }
  };
}

function createMoonlakeFishingFx(parent) {
  const root = new PIXI.Container();
  root.name = "moonlake_fishing_line_fx";
  root.eventMode = "none";
  root.visible = false;
  const graphics = new PIXI.Graphics();
  root.addChild(graphics);
  parent.addChild(root);
  const diagnostics = {
    visible: false,
    phase: null,
    waterSide: null,
    lineLengthPx: 0,
    extendsBeyondRail: false,
    start: null,
    end: null
  };
  return {
    root,
    graphics,
    diagnostics,
    getDiagnostics: () => ({ ...diagnostics })
  };
}

function updateMoonlakeFishingFx(fishingFx, roaming, companion, ticker) {
  const fishing = roaming?.fishing;
  const graphics = fishingFx.graphics;
  graphics.clear();
  if (!fishing || !companion) {
    fishingFx.root.visible = false;
    Object.assign(fishingFx.diagnostics, {
      visible: false,
      phase: null,
      waterSide: null,
      lineLengthPx: 0,
      extendsBeyondRail: false,
      start: null,
      end: null
    });
    return;
  }

  fishingFx.root.visible = true;
  const phase = fishing.phase || "wait";
  const progress = Math.min(1, Math.max(0, Number(fishing.phaseProgress) || 0));
  const referenceScale = Number(roaming.projected?.referenceScale390) || 1;
  const depthScale = Math.min(0.9, Math.max(0.42, Number(roaming.projected?.scale) || 0.72));
  const startX = companion.x;
  const startY = companion.y - 80 * referenceScale * depthScale;
  const reach = 64 * referenceScale * Math.max(0.62, Math.sqrt(depthScale));
  const direction = fishing.waterSide === "left"
    ? { x: -1, y: 0.22 }
    : fishing.waterSide === "far"
      ? { x: 0, y: -1 }
      : { x: 1, y: 0.22 };
  const extension = phase === "cast"
    ? easeOutCubic(progress)
    : phase === "reel"
      ? Math.max(0.08, 1 - easeOutCubic(progress))
      : phase === "settle"
        ? 0.2
        : 1;
  const endX = startX + direction.x * reach * extension;
  const endY = startY + direction.y * reach * extension;
  const controlX = startX + (endX - startX) * 0.56;
  const controlY = Math.min(startY, endY) - 10 * referenceScale * depthScale;
  const bitePulse = phase === "bite"
    ? 0.7 + Math.sin((Number(ticker?.lastTime) || performance.now()) * 0.032) * 0.3
    : 0;

  graphics
    .moveTo(startX, startY)
    .quadraticCurveTo(controlX, controlY, endX, endY)
    .stroke({
      color: FISHING_LINE_COLOR,
      alpha: phase === "settle" ? 0.35 : 0.86,
      width: Math.max(1, 1.35 * referenceScale)
    });
  graphics
    .circle(endX, endY, Math.max(2.2, 3.2 * referenceScale * depthScale))
    .fill({
      color: phase === "bite" ? 0xffd36c : 0x6fe9ff,
      alpha: phase === "settle" ? 0.35 : 0.9
    });
  if (phase === "wait" || phase === "bite") {
    const ringRadius = (8 + bitePulse * 8) * referenceScale * depthScale;
    graphics
      .ellipse(endX, endY + 2 * referenceScale, ringRadius, ringRadius * 0.42)
      .stroke({
        color: phase === "bite" ? 0xffe5a5 : 0x8eefff,
        alpha: phase === "bite" ? 0.82 : 0.34,
        width: Math.max(1, referenceScale)
      });
  }

  const lineLengthPx = Math.hypot(endX - startX, endY - startY);
  Object.assign(fishingFx.diagnostics, {
    visible: true,
    phase,
    waterSide: fishing.waterSide,
    lineLengthPx,
    extendsBeyondRail: lineLengthPx >= 36 * referenceScale,
    start: { x: startX, y: startY },
    end: { x: endX, y: endY }
  });
}

function getMoonlakeInteractionMessage(type) {
  if (type === "lantern") return "燈火回應你的觸碰，暖光慢慢亮起。";
  if (type === "crystal") return "水晶閃出一圈細碎星光。";
  return "湖面泛開一圈柔和漣漪。";
}

function createCrystalTouchEffect(parent, event) {
  const effect = new PIXI.Container();
  effect.x = event.x;
  effect.y = event.y - 38;
  effect.__ageMs = 0;
  effect.__baseY = effect.y;
  effect.__effectKind = "crystal";

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

function createLanternTouchEffect(parent, event) {
  const effect = new PIXI.Container();
  effect.x = event.x;
  effect.y = event.y;
  effect.__ageMs = 0;
  effect.__baseY = effect.y;
  effect.__effectKind = "lantern";
  const glow = new PIXI.Graphics();
  glow.circle(0, 0, 22).fill({ color: event.color, alpha: 0.2 });
  glow.circle(0, 0, 11).fill({ color: 0xfff4c2, alpha: 0.52 });
  glow.circle(0, 0, 3.5).fill({ color: 0xffffff, alpha: 0.9 });
  effect.addChild(glow);
  parent.addChild(effect);
  return effect;
}

function createWaterRippleEffect(parent, event) {
  const effect = new PIXI.Container();
  effect.x = event.x;
  effect.y = event.y;
  effect.__ageMs = 0;
  effect.__baseY = effect.y;
  effect.__effectKind = "water";
  const ripple = new PIXI.Graphics();
  ripple
    .ellipse(0, 0, 18, 7)
    .stroke({ color: event.color, alpha: 0.8, width: 1.5 });
  ripple
    .ellipse(0, 0, 8, 3)
    .stroke({ color: 0xffffff, alpha: 0.56, width: 1 });
  effect.addChild(ripple);
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
    if (effect.__effectKind === "water") {
      effect.y = effect.__baseY;
      effect.scale.set(0.72 + progress * 1.8);
      effect.rotation = 0;
    } else if (effect.__effectKind === "lantern") {
      effect.y = effect.__baseY - pulse * 3;
      effect.scale.set(0.74 + pulse * 0.5);
      effect.rotation = 0;
    } else {
      effect.y = effect.__baseY - progress * 18;
      effect.scale.set(0.7 + pulse * 0.35 + progress * 0.2);
      effect.rotation = progress * 0.22;
    }

    if (progress >= 1) {
      effect.parent?.removeChild(effect);
      effect.destroy({ children: true });
      activeEffects.splice(index, 1);
    }
  }
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
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
  // 常駐把手：腳底／十字 QA 與部分 gate 需要；舊 devPanel 別名一併保留。
  window.__NEXUS_ACTIVE_COMPANION__ = companion;
  const params = new URLSearchParams(window.location.search);
  if (params.get("devPanel") === "1" || params.get("devSceneEditor") === "1") {
    window.__NEXUS_TEST_COMPANION__ = companion;
  }
}

function installRaphaelPreviewHarnessIfRequested() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  if (params.get("raphaelPreview") !== "1") return;
  window.__RAPHAEL_PREVIEW_BOOTSTRAP__ = {
    requested: true,
    startedAt: new Date().toISOString(),
    appliedToLive: false
  };
  import("./ai/testHarness/raphaelPreviewStagingCases.js").then((mod) =>
    mod.installRaphaelPreviewStagingHarness(window)
  ).catch((error) => {
    window.__RAPHAEL_PREVIEW_REPORT__ = {
      ok: false,
      previewOnly: true,
      appliedToLive: false,
      fallbackUsed: true,
      reason: `PREVIEW_HARNESS_IMPORT_FAILED:${error?.message || "unknown"}`
    };
  });
}

function saveCurrentState(state = store.getState()) {
  const result = saveState(state);
  lastSaveStatus = {
    ok: Boolean(result.ok),
    emergency: Boolean(result.emergency),
    estimatedSaveSizeKB: result.state ? estimateSaveSizeKB(result.state) : 0
  };
  return result;
}
