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
import { createCompanionInitiativeController } from "./ui/companionInitiativeController.js";
import { createAudioCueController } from "./ui/audioCueController.js";
import { createActionSheetController } from "./ui/actionSheetController.js";
import { createCalmSyncController } from "./ui/calmSyncController.js";
import { createPageRouter } from "./ui/pageRouter.js";
import { createSettingsController } from "./ui/settingsController.js";
import { createCompanionSelectController } from "./ui/companionSelectController.js";
import { createMapController } from "./ui/mapController.js";
import { createAtlasController } from "./ui/atlasController.js";
import { createBattleController } from "./ui/battleController.js";
import { createCodexController } from "./ui/codexController.js";
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
import { createHabitatTraceRenderer } from "./pixi/habitatTraceRenderer.js";
import { enableEditorMode, readSceneEditorFlag } from "./tools/sceneEditor.js";
import {
  createCompanionMotion,
  playDevMotion,
  updateCompanionMotion
} from "./pixi/motionController.js";
import { resolveAnimationIntent } from "./engine/animationProfile.js";

const ENVIRONMENT_INTERACTION_EVENT = "ENVIRONMENT_INTERACTION";
const COMPANION_ANIMATION_INTENT_EVENT = "COMPANION_ANIMATION_INTENT";
const ENVIRONMENT_EFFECT_LIFETIME_MS = 720;
let currentCreature = FALLBACK_CREATURE;
let companionMotionController = null;
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

  store.replaceState(initialState);
  markPerf("nexus:state-loaded");
  const saveQueue = createSaveQueue(saveCurrentState);
  saveQueue.enqueue(SAVE_LEVEL.CRITICAL);
  const saveInteraction = () => {
    markInteraction();
    return saveQueue.enqueue(SAVE_LEVEL.INTERACTION);
  };
  const saveDebounced = () => saveQueue.enqueue(SAVE_LEVEL.DEBOUNCE);

  const hudController = createHudController({ store, statusText });
  // 主畫面回饋 toast：接夥伴觸碰反應（含拒絕）與 Care/Growth/探索的動作狀態。
  const companionFeedbackController = createCompanionFeedbackController();
  companionFeedbackController.bind();
  const soulTalkController = createSoulTalkController({ store, saveCurrentState: saveInteraction });
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

  const onboardingController = createOnboardingController({
    store,
    saveCurrentState: () => saveQueue.enqueue(SAVE_LEVEL.CRITICAL),
    // 初遇定情（CH-2）：選定即切換棲地夥伴（state 已先寫入，normalize 會放行）。
    onBondChosen: (companionId) => applyCompanionChange(companionId)
  });
  // Meet 之後的首輪閉環（觸碰→心語→痕跡）：完成/跳過前只開心核與心語入口。
  const firstLoopController = createFirstLoopController({
    store,
    saveCurrentState: () => saveQueue.enqueue(SAVE_LEVEL.CRITICAL)
  });
  // 互動可讀性提示（支柱一）：貓身上的輕觸光暈，firstTouch 前指引新玩家「牠可以被碰」。
  const interactionHintController = createInteractionHintController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen(),
    isOnboardingActive: () => onboardingController?.isActive?.()
  });
  // 柔性邀請（支柱二）：首輪後由夥伴狀態驅動的一句溫柔下一步，讓核心迴圈不再沉默。
  const gentleInvitationController = createGentleInvitationController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen()
  });
  // 主動微時刻（TP-7）：牠偶爾真的先動——狀態驅動、冷卻防打擾、不寫 chatHistory。
  const companionInitiativeController = createCompanionInitiativeController({
    store,
    isPanelOpen: () => panelManager.isPanelOpen()
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

  function getBattleController() {
    if (!battleController) {
      battleController = createBattleController({
        store,
        panelManager,
        soulTalkController,
        saveCurrentState,
        statusText
      });
      battleController.bind();
    }
    return battleController;
  }

  function getMapController() {
    if (!mapController) {
      mapController = createMapController({
        store,
        panelManager,
        soulTalkController,
        saveCurrentState: saveInteraction,
        battleController: getBattleController(),
        statusText
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
      atlasController = createAtlasController({ panelManager, store });
    }
    return atlasController;
  }

  function getCompanionSelectController() {
    if (!companionSelectController) {
      companionSelectController = createCompanionSelectController({
        store,
        panelManager,
        saveCurrentState,
        onCompanionChanged: (companion) => applyCompanionChange(companion?.id)
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
    openMap: () => getMapController().open(),
    openCodex: () => getCodexController().open(),
    openAtlas: () => getAtlasController().open()
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
  companionInitiativeController.bind();
  audioCueController.bind();
  settingsController.bind();
  pageRouter.bind();
  actionSheetController.bind();
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
    gentleInvitationController.render();
    pageRouter.render();
    devPanelController?.renderReadout();
    observeRaphaelAgentStateEvents(store.getState());
  });

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
    statusText.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
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
      emitRestrictedRaphaelAgentEvent
    );
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
  raphaelAgentEventBridge = null
) {
  const runtimeGuard = createRuntimeGuard(app);
  const world = createWorld(app);
  const layers = getSceneLayers(world);

  const environmentLayer = await createEnvironmentLayer(layers, app);

  const particles = createParticles();
  layers.layerFX.addChild(particles);

  const environmentEffects = new PIXI.Container();
  environmentEffects.name = "environment_effects";
  layers.layerFX.addChild(environmentEffects);
  const activeEnvironmentEffects = [];

  const habitatTraceRenderer = createHabitatTraceRenderer(PIXI, {
    fx: layers.layerFX,
    foreground: layers.layerForeground,
    platform: layers.layerPlatform
  });

  EventBus.on(ENVIRONMENT_INTERACTION_EVENT, (event) => {
    if (event?.type !== "crystal_touch") return;
    activeEnvironmentEffects.push(createCrystalTouchEffect(environmentEffects, event));
  });

  // 效能：habitat trace 的 map+sync 從 ticker（每幀）移到「痕跡內容改變時」才跑。
  // ticker 只保留 update(t) 做逐幀動畫。先在 bootScene 同步一次（含 reload 後既有痕跡）。
  let lastHabitatTraceSig = null;
  function syncHabitatTraces() {
    const traces = store.getState().habitatTraces || [];
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
  syncHabitatTraces();
  store.subscribe(syncHabitatTraces);

  let companion = await createCreatureNode(currentCreature, statusText);

  function attachCompanion(node, creature) {
    positionCompanion(node, app);
    layers.layerEntity.addChild(node);
    exposeDevCompanion(node);

    companionMotionController = createCompanionMotion(node, store.getState().mood);
    interactionController = createInteractionController({
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
    bindCompanionTap(node, {
      isInteractionBlocked: () => panelManager.isPanelOpen() || onboardingController?.isActive?.(),
      onTouch: (touchType) => {
        markInteraction(); // 觸碰會喚醒睡眠中的夥伴
        return Promise.resolve(interactionController.handleTouch(touchType)).then((touchResult) => {
          raphaelAgentEventBridge?.("touch", {
            touchType,
            touchResult
          }, { animationAlreadyApplied: true });
          return touchResult;
        });
      }
    });
  }

  attachCompanion(companion, currentCreature);

  // 一次性註冊：動畫意圖橋接（戰鬥結算回棲地、dev helper 等都透過此事件）。
  EventBus.on(COMPANION_ANIMATION_INTENT_EVENT, (payload) => {
    playCompanionAnimationIntent(payload?.intent);
  });

  async function swapCompanion(nextCreature) {
    const previousCompanion = companion;
    interactionController?.dispose?.();
    interactionController = null;
    const nextCompanion = await createCreatureNode(nextCreature, statusText);
    companion = nextCompanion;
    attachCompanion(nextCompanion, nextCreature);
    if (previousCompanion && previousCompanion !== nextCompanion) {
      previousCompanion.parent?.removeChild(previousCompanion);
      previousCompanion.destroy({ children: true });
    }
    statusText.textContent = `${nextCreature.name}來到了你身邊。`;
  }

  const isSceneEditorMode = readSceneEditorFlag();
  if (isSceneEditorMode) {
    enableEditorMode(app.stage);
  }

  let t = 0;
  app.ticker.add((ticker) => {
    if (runtimeGuard.shouldSkipFrame()) return;

    const safeTicker = runtimeGuard.getSafeTicker(ticker);
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
        isSleeping
      });
    }
    if (!environmentLayer.magicCircle.__sceneEditorOriginalAlpha) {
      environmentLayer.magicCircle.alpha = 0.76 + Math.sin(t * 1.4) * 0.03;
    }

    if (companion.__accentFlame) {
      companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
    }

    updateEnvironmentLayer(environmentLayer, safeTicker);
    animateParticles(particles, t, safeTicker);
    updateEnvironmentEffects(activeEnvironmentEffects, safeTicker);

    // trace 的 map+sync 已移到 syncHabitatTraces()（由 store.subscribe 驅動）；逐幀只做動畫更新。
    habitatTraceRenderer.update(t);
  });

  return { swapCompanion };
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

function saveCurrentState() {
  const result = saveState(store.getState());
  lastSaveStatus = {
    ok: Boolean(result.ok),
    emergency: Boolean(result.emergency),
    estimatedSaveSizeKB: result.state ? estimateSaveSizeKB(result.state) : 0
  };
  return result;
}
