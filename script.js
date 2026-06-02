(() => {
  const STORAGE_KEY = "nexusLinkPrototypeState:v2";
  const CREATURES_PATH = "./data/creatures.json";
  const PLATFORM_LAKE_PATH = "./assets/platforms/Platform_LakeMagicCircle.png";
  const currentCreatureId = "greyshade-cat";
  const FALLBACK_CREATURE = {
    id: "flametail-fox",
    name: "焰尾狐",
    element: "fire",
    image: "./assets/flametail-fox.png",
    defaultMood: "warm",
    description: "火屬性的陪伴型 AI 小怪獸。"
  };

  // v0.2.4 fallback touch personality data. Keep this shape data-ready so it can move
  // into data/creatures.json when creature-authored personalities are introduced.
  const TOUCH_PERSONALITY_FALLBACKS = {
    "greyshade-cat": {
      baseDefense: 39,
      trustWeight: 1.4,
      bondWeight: 1.2,
      energyWeight: 1.2,
      fatigueSensitivity: 6.0,
      defenseWeight: 0.65,
      trustDefenseReduction: 1.4
    }
  };
  const DEFAULT_TOUCH_PERSONALITY = TOUCH_PERSONALITY_FALLBACKS[currentCreatureId];
  const SUPPORTED_DEV_MOODS = new Set(["calm", "happy", "warm", "sad", "defensive", "distant", "tired"]);

  let currentCreature = FALLBACK_CREATURE;

  const defaultState = {
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    defense: 35,
    touchFatigue: 0,
    lastTouchAt: null,
    lastSeenAt: Date.now(),
    firstTouchCompleted: false,
    reactionPreview: "",
    spamScore: 0,
    lastMessage: "",
    chatHistory: [
      {
        role: "companion",
        text: "我在這裡，安靜地看著你。"
      }
    ]
  };

  const devQueryHooks = readDevQueryHooks();
  applyDevResetHook(devQueryHooks);
  const state = applyDevQueryHooks(applyOfflineRecovery(loadState()), devQueryHooks);
  saveState();

  const gameRoot = document.querySelector("#game-root");
  const statusText = document.querySelector("#status-text");
  const chatLog = document.querySelector("#chat-log");
  const messageInput = document.querySelector("#message-input");
  const sendButton = document.querySelector("#send-button");
  const foxName = document.querySelector("#fox-name");
  const bondEl = document.querySelector("#bond-value");
  const trustEl = document.querySelector("#trust-value");
  const moodEl = document.querySelector("#mood-value");
  const energyEl = document.querySelector("#energy-value");
  const bondFill = document.querySelector("#bond-fill");
  const trustFill = document.querySelector("#trust-fill");
  const moodFill = document.querySelector("#mood-fill");
  const energyFill = document.querySelector("#energy-fill");
  const modalCreatureName = document.querySelector("#modal-creature-name");
  const modalCreatureDescription = document.querySelector("#modal-creature-description");
  const soulTalkPreview = document.querySelector("#soul-talk-preview");
  const panelLayer = document.querySelector(".panel-layer");
  const panelTriggers = document.querySelectorAll("[data-panel-trigger]");
  const panelCloseButtons = document.querySelectorAll("[data-panel-close]");
  const bottomNavButtons = document.querySelectorAll(".bottom-nav button[data-action]");
  const actionSheetTitle = document.querySelector("#action-sheet-title");
  const actionSheetCopy = document.querySelector("#action-sheet-copy");
  const actionSheetActions = document.querySelector("#action-sheet-actions");
  let activePanel = null;
  let queuedAction = null;

  setViewportVars();
  window.addEventListener("resize", setViewportVars);
  window.addEventListener("orientationchange", setViewportVars);
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setViewportVars);
    window.visualViewport.addEventListener("scroll", setViewportVars);
  }

  if (!window.PIXI) {
    statusText.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
    return;
  }

  const WORLD_WIDTH = 390;
  const WORLD_HEIGHT = 844;
  const COMPANION_GROUND_Y = 485;
  const PLATFORM_Y = 540;
  const app = new PIXI.Application();

  app
    .init({
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      backgroundAlpha: 0,
      antialias: false,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true
    })
    .then(async () => {
      gameRoot.appendChild(app.canvas);
      currentCreature = await loadCurrentCreature();
      applyCreatureText();
      await bootScene();
      bindUI();
      renderHUD();
      renderChat();
    })
    .catch((error) => {
      console.error(error);
      statusText.textContent = "場景初始化失敗，請重新整理頁面。";
    });


  function setViewportVars() {
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${height}px`);
  }

  async function bootScene() {
    const world = new PIXI.Container();
    app.stage.addChild(world);

    // CSS owns the lake-night camp backdrop; PixiJS is reserved for companion and ambient effects.
    const particles = createParticles();
    world.addChild(particles);

    const platform = await createPlatformNode();
    world.addChild(platform);

    const companion = await createCreatureNode(currentCreature);
    companion.x = WORLD_WIDTH / 2;
    companion.y = COMPANION_GROUND_Y;
    world.addChild(companion);

    const companionMotion = createCompanionMotion(companion);

    companion.eventMode = "static";
    companion.cursor = "pointer";
    let lastTapAt = 0;
    companion.on("pointertap", () => {
      if (activePanel) return;
      const now = Date.now();
      const isDoubleTap = now - lastTapAt < 320;
      lastTapAt = now;
      const interactionResult = handleCompanionTouch(isDoubleTap ? "hug" : "touch");
      triggerCompanionTouchMotion(companionMotion, interactionResult);
    });

    let t = 0;
    app.ticker.add((ticker) => {
      t += ticker.deltaMS / 1000;

      updateCompanionMotion(companion, companionMotion, t, performance.now());
      platform.alpha = 0.76 + Math.sin(t * 1.4) * 0.03;

      if (companion.__accentFlame) {
        companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
      }

      particles.children.forEach((particle, index) => {
        particle.y -= (0.15 + index * 0.002) * ticker.deltaTime;
        particle.alpha = 0.25 + Math.sin(t + index) * 0.12;
        if (particle.y < 110) particle.y = 760;
      });
    });
  }

  async function loadCurrentCreature() {
    try {
      const response = await fetch(CREATURES_PATH, { cache: "no-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const creatures = await response.json();
      const creature = creatures.find((item) => item.id === currentCreatureId);
      if (!creature) throw new Error(`Creature not found: ${currentCreatureId}`);

      return creature;
    } catch (error) {
      console.warn("Creature data load failed, fallback to default creature:", error);
      statusText.textContent = "角色資料載入失敗，已改用預設夥伴。";
      return FALLBACK_CREATURE;
    }
  }

  async function createPlatformNode() {
    try {
      const texture = await PIXI.Assets.load(PLATFORM_LAKE_PATH);
      const platform = new PIXI.Sprite(texture);
      platform.anchor.set(0.5);
      platform.x = WORLD_WIDTH / 2;
      platform.y = PLATFORM_Y;
      platform.eventMode = "none";
      platform.alpha = 0.76;

      const targetWidth = 252;
      const targetHeight = WORLD_HEIGHT * 0.13;
      const scale = Math.min(targetWidth / platform.width, targetHeight / platform.height);
      platform.scale.set(scale);
      return platform;
    } catch (error) {
      console.warn("Platform image load failed, fallback to platform glow:", error);
      const platform = new PIXI.Graphics();
      platform.ellipse(WORLD_WIDTH / 2, PLATFORM_Y, 118, 34).fill({ color: 0x8deeff, alpha: 0.14 });
      platform.ellipse(WORLD_WIDTH / 2, PLATFORM_Y, 82, 18).stroke({ color: 0xb7f7ff, alpha: 0.32, width: 2 });
      platform.eventMode = "none";
      return platform;
    }
  }

  async function createCreatureNode(creature) {
    try {
      const texture = await PIXI.Assets.load(creature.image);
      const spriteCreature = createCreatureSprite(texture, creature);
      statusText.textContent = `${creature.name}已進入夜間湖畔棲地。`;
      return spriteCreature;
    } catch (error) {
      console.warn("Creature image load failed, fallback to placeholder:", error);
      statusText.textContent = `${creature.name}圖片載入失敗，已改用預設造型。`;
      return createCreaturePlaceholder(creature);
    }
  }

  function createCreatureSprite(texture, creature) {
    const fox = new PIXI.Container();

    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, 54, 58, 14).fill({ color: 0x000000, alpha: 0.25 });
    fox.addChild(shadow);

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 1);

    const maxW = Math.min(170, WORLD_WIDTH * 0.46);
    const maxH = Math.min(170, WORLD_HEIGHT * 0.2);
    const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
    sprite.scale.set(scale);

    fox.addChild(sprite);

    fox.__isSpriteCreature = true;

    if (creature.element === "fire") {
      const flame = createFlameAccent();
      fox.addChild(flame);
      fox.__accentFlame = flame;
    }

    return fox;
  }

  function drawLakeCamp(g) {
    g.clear();

    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill({ color: 0x06101d, alpha: 0.06 });
    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill({ color: 0x0b1f33, alpha: 0.08 });

    g.circle(302, 104, 78).fill({ color: 0x8deeff, alpha: 0.12 });
    g.circle(302, 104, 36).fill({ color: 0xdffbff, alpha: 0.32 });
    g.circle(294, 96, 29).fill({ color: 0xffffff, alpha: 0.12 });

    g.moveTo(0, 286).lineTo(68, 174).lineTo(150, 286).closePath().fill({ color: 0x0c1d31, alpha: 0.36 });
    g.moveTo(76, 286).lineTo(206, 146).lineTo(334, 286).closePath().fill({ color: 0x102844, alpha: 0.34 });
    g.moveTo(226, 286).lineTo(332, 176).lineTo(414, 286).closePath().fill({ color: 0x0a1a2d, alpha: 0.34 });
    g.rect(0, 276, WORLD_WIDTH, 96).fill({ color: 0x07111f, alpha: 0.18 });

    for (let x = -28; x < WORLD_WIDTH + 40; x += 34) {
      const height = 68 + (x % 3) * 9;
      g.moveTo(x, 368).lineTo(x + 17, 270 - height * 0.18).lineTo(x + 34, 368).closePath().fill({ color: 0x09231e, alpha: 0.48 });
      g.rect(x + 14, 338, 6, 48).fill({ color: 0x081916, alpha: 0.5 });
    }

    g.ellipse(WORLD_WIDTH / 2, 432, 272, 108).fill({ color: 0x082c42, alpha: 0.2 });
    g.ellipse(WORLD_WIDTH / 2, 418, 246, 70).fill({ color: 0x1a6a82, alpha: 0.42 });
    g.ellipse(154, 405, 78, 10).fill({ color: 0x8deeff, alpha: 0.08 });
    g.ellipse(268, 448, 92, 9).fill({ color: 0xffb86b, alpha: 0.1 });
    g.rect(28, 420, 334, 2).fill({ color: 0xb7f7ff, alpha: 0.08 });
    g.rect(72, 456, 246, 2).fill({ color: 0xb7f7ff, alpha: 0.07 });

    g.roundRect(-24, 500, WORLD_WIDTH + 48, 380, 38).fill({ color: 0x102820, alpha: 0.32 });
    g.roundRect(34, 506, 320, 210, 32).fill({ color: 0x1f3b2f, alpha: 0.34 });
    g.ellipse(194, 538, 164, 24).fill({ color: 0x08130f, alpha: 0.18 });

    g.ellipse(195, 686, 72, 24).fill("#120e0b");
    g.rect(162, 693, 72, 8).fill("#5b351a");
    g.rect(168, 684, 62, 7).fill("#6f421e");
    g.circle(195, 666, 54).fill({ color: 0xff9747, alpha: 0.13 });
    g.circle(195, 664, 28).fill({ color: 0xffb86b, alpha: 0.34 });
    g.moveTo(195, 632).lineTo(176, 676).lineTo(215, 676).closePath().fill("#ff7a2f");
    g.moveTo(200, 644).lineTo(185, 677).lineTo(211, 677).closePath().fill("#ffd166");
    g.moveTo(190, 650).lineTo(182, 678).lineTo(198, 678).closePath().fill({ color: 0xffffff, alpha: 0.34 });
  }

  function createParticles() {
    const layer = new PIXI.Container();
    for (let i = 0; i < 44; i += 1) {
      const p = new PIXI.Graphics();
      const isWarm = i % 5 === 0;
      p.circle(0, 0, 0.8 + Math.random() * 1.9).fill({
        color: isWarm ? 0xffb86b : 0x8deeff,
        alpha: isWarm ? 0.42 : 0.3
      });
      p.x = 20 + Math.random() * (WORLD_WIDTH - 40);
      p.y = 100 + Math.random() * 660;
      layer.addChild(p);
    }
    return layer;
  }

  function createCreaturePlaceholder(creature = FALLBACK_CREATURE) {
    const fox = new PIXI.Container();

    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, 48, 54, 13).fill({ color: 0x000000, alpha: 0.28 });
    fox.addChild(shadow);

    const body = new PIXI.Graphics();
    body.roundRect(-42, -28, 84, 70, 24).fill("#d85f32");
    body.roundRect(-29, -18, 58, 52, 18).fill("#f28b43");
    fox.addChild(body);

    const head = new PIXI.Graphics();
    head.roundRect(-36, -76, 72, 58, 22).fill("#e86d34");
    head.moveTo(-28, -70).lineTo(-48, -104).lineTo(-4, -84).closePath().fill("#e86d34");
    head.moveTo(28, -70).lineTo(48, -104).lineTo(4, -84).closePath().fill("#e86d34");
    head.moveTo(-31, -78).lineTo(-41, -96).lineTo(-12, -84).closePath().fill("#ffd29b");
    head.moveTo(31, -78).lineTo(41, -96).lineTo(12, -84).closePath().fill("#ffd29b");
    fox.addChild(head);

    const face = new PIXI.Graphics();
    face.circle(-14, -51, 4).fill("#1f1f2e");
    face.circle(14, -51, 4).fill("#1f1f2e");
    face.roundRect(-10, -39, 20, 10, 5).fill("#ffe0b5");
    face.circle(0, -39, 2.5).fill("#1f1f2e");
    fox.addChild(face);

    const tail = new PIXI.Graphics();
    tail
      .moveTo(38, 0)
      .quadraticCurveTo(92, -32, 66, -82)
      .quadraticCurveTo(110, -40, 78, 22)
      .closePath()
      .fill("#f9733a");
    tail
      .moveTo(76, -72)
      .quadraticCurveTo(104, -38, 76, 2)
      .quadraticCurveTo(94, -42, 76, -72)
      .fill("#ffd166");
    fox.addChildAt(tail, 1);

    if (creature.element === "fire") {
      const flame = createFlameAccent();
      fox.addChild(flame);
      fox.__accentFlame = flame;
    }

    return fox;
  }

  function createFlameAccent() {
    const flame = new PIXI.Graphics();
    flame.moveTo(0, -108).lineTo(-15, -76).lineTo(15, -76).closePath().fill("#ff7a2f");
    flame.moveTo(2, -98).lineTo(-6, -77).lineTo(10, -77).closePath().fill("#ffd166");
    return flame;
  }

  function createCompanionMotion(companion) {
    return {
      state: getIdleMotionState(state.mood),
      temporaryState: null,
      temporaryStartedAt: 0,
      temporaryUntil: 0,
      baseX: companion.x,
      baseY: companion.y,
      baseScale: companion.scale.x || 1,
      baseAlpha: companion.alpha,
      baseRotation: companion.rotation || 0
    };
  }

  function getIdleMotionState(mood) {
    const moodToIdle = {
      calm: "idle_calm",
      defensive: "idle_defensive",
      distant: "idle_distant",
      sad: "idle_distant",
      happy: "idle_calm",
      tired: "idle_distant",
      warm: "idle_calm"
    };
    return moodToIdle[mood] || "idle_calm";
  }

  function getTouchMotionState(reaction) {
    const reactionToMotion = {
      accept: "touch_accept",
      guarded_accept: "touch_guarded",
      hesitate: "touch_guarded",
      reject: "touch_reject"
    };
    return reactionToMotion[reaction] || "touch_guarded";
  }

  function triggerCompanionTouchMotion(motion, interactionResult = {}) {
    const touchState = getTouchMotionState(interactionResult.reaction);
    motion.temporaryState = touchState;
    motion.temporaryStartedAt = performance.now();
    motion.temporaryUntil = motion.temporaryStartedAt + 850;
  }

  function updateCompanionMotion(companion, motion, timeSeconds, nowMs) {
    motion.state = getIdleMotionState(state.mood);
    if (motion.temporaryState && nowMs >= motion.temporaryUntil) {
      motion.temporaryState = null;
      motion.temporaryStartedAt = 0;
      motion.temporaryUntil = 0;
    }

    const activeState = motion.temporaryState || motion.state;
    const transform = motion.temporaryState
      ? getTemporaryMotionTransform(activeState, motion, nowMs)
      : getIdleMotionTransform(activeState, timeSeconds);

    companion.x = motion.baseX + transform.offsetX;
    companion.y = motion.baseY + transform.offsetY;
    companion.scale.set(motion.baseScale * transform.scaleMultiplier);
    companion.alpha = motion.baseAlpha * transform.alphaMultiplier;
    companion.rotation = motion.baseRotation + transform.rotation;
  }

  function getIdleMotionTransform(motionState, timeSeconds) {
    if (motionState === "idle_defensive") {
      const breath = Math.sin(timeSeconds * 1.7);
      return {
        offsetX: 0,
        offsetY: 2 + breath * 1.6,
        scaleMultiplier: 0.985 + breath * 0.004,
        alphaMultiplier: 1,
        rotation: 0
      };
    }

    if (motionState === "idle_distant") {
      const breath = Math.sin(timeSeconds * 1.25);
      return {
        offsetX: 0,
        offsetY: 4 + breath * 1.4,
        scaleMultiplier: 0.965 + breath * 0.0035,
        alphaMultiplier: 0.98,
        rotation: 0
      };
    }

    const breath = Math.sin(timeSeconds * 1.55);
    return {
      offsetX: 0,
      offsetY: breath * 2.5,
      scaleMultiplier: 1 + breath * 0.007,
      alphaMultiplier: 1,
      rotation: 0
    };
  }

  function getTemporaryMotionTransform(motionState, motion, nowMs) {
    const duration = Math.max(1, motion.temporaryUntil - motion.temporaryStartedAt);
    const progress = Math.min(1, Math.max(0, (nowMs - motion.temporaryStartedAt) / duration));
    const pulse = Math.sin(progress * Math.PI);
    const settle = 1 - progress;

    if (motionState === "touch_accept") {
      return {
        offsetX: 0,
        offsetY: -5 * pulse + 1.5 * settle,
        scaleMultiplier: 1 + 0.012 * pulse,
        alphaMultiplier: 1,
        rotation: 0.012 * Math.sin(progress * Math.PI * 2)
      };
    }

    if (motionState === "touch_reject") {
      return {
        offsetX: -3 * pulse,
        offsetY: 3 * pulse + 3 * settle,
        scaleMultiplier: 0.972 - 0.008 * pulse,
        alphaMultiplier: 0.985,
        rotation: -0.01 * pulse
      };
    }

    return {
      offsetX: 1.5 * Math.sin(progress * Math.PI * 4) * settle,
      offsetY: -2 * pulse + 2 * settle,
      scaleMultiplier: 0.99 + 0.006 * pulse,
      alphaMultiplier: 1,
      rotation: 0.006 * Math.sin(progress * Math.PI * 4) * settle
    };
  }


  function getCurrentTouchPersonality() {
    return (
      currentCreature.touchPersonality ||
      TOUCH_PERSONALITY_FALLBACKS[currentCreature.id] ||
      DEFAULT_TOUCH_PERSONALITY
    );
  }

  function getUniversalTouchReaction(targetState, personality) {
    const moodModifiers = {
      calm: 10,
      happy: 20,
      warm: 15,
      sad: -10,
      defensive: -25,
      distant: -15,
      tired: -12
    };
    const moodModifier = moodModifiers[targetState.mood] || 0;
    const baseSafety = 30;
    const safetyScore =
      baseSafety +
      targetState.trust * personality.trustWeight +
      targetState.bond * personality.bondWeight +
      moodModifier +
      targetState.energy * personality.energyWeight -
      targetState.touchFatigue * personality.fatigueSensitivity;
    const defenseThreshold =
      personality.baseDefense +
      targetState.defense * personality.defenseWeight -
      targetState.trust * personality.trustDefenseReduction;
    const delta = safetyScore - defenseThreshold;

    if (delta >= 25) return "accept";
    if (delta >= 0) return "guarded_accept";
    if (delta >= -20) return "hesitate";
    return "reject";
  }

  function handleCompanionTouch(touchType = "touch") {
    const now = Date.now();
    const fatigueIncrease = touchType === "hug" ? 1.5 : 1;
    let reaction;

    if (!state.firstTouchCompleted) {
      reaction = "guarded_accept";
      state.firstTouchCompleted = true;
      state.touchFatigue = clampValue(state.touchFatigue + 0.5, 0, 10);
    } else {
      state.touchFatigue = clampValue(state.touchFatigue + fatigueIncrease, 0, 10);
      reaction = getUniversalTouchReaction(state, getCurrentTouchPersonality());

      if (state.touchFatigue >= 8) {
        reaction = "reject";
      } else if (state.touchFatigue >= 6 && reaction === "accept") {
        reaction = "hesitate";
      }
    }

    state.lastTouchAt = now;
    applyTouchReactionMutation(reaction);
    state.reactionPreview = getTouchReactionText(reaction);
    statusText.textContent = state.reactionPreview;
    saveState();
    renderHUD();
    renderChat();

    return {
      reaction,
      motionState: getTouchMotionState(reaction)
    };
  }

  function applyTouchReactionMutation(reaction) {
    if (reaction === "accept") {
      state.bond += 1;
      state.trust += 1;
      state.defense -= 1;
      state.mood = state.energy <= 2 ? "tired" : "warm";
    } else if (reaction === "guarded_accept") {
      state.bond += 1;
      state.defense -= 1;
      if (state.mood === "defensive") state.mood = "calm";
    } else if (reaction === "hesitate") {
      state.defense += 1;
      if (state.energy <= 2) state.mood = "tired";
    } else {
      state.defense += 2;
      state.mood = "defensive";
    }

    state.bond = clampValue(state.bond, 0, 100);
    state.trust = clampValue(state.trust, 0, 100);
    state.energy = clampValue(state.energy, 0, 10);
    state.defense = clampValue(state.defense, 0, 100);
    state.touchFatigue = clampValue(state.touchFatigue, 0, 10);
  }

  function getTouchReactionText(reaction) {
    const reactionText = {
      accept: "灰影貓閉上眼睛，短暫地放鬆下來。",
      guarded_accept: "灰影貓耳朵動了動，但沒有躲開。",
      hesitate: "灰影貓看著你，尾巴末端有些緊繃。",
      reject: "灰影貓默默往後退了一點。"
    };
    return reactionText[reaction] || reactionText.guarded_accept;
  }

  function applyCreatureText() {
    foxName.textContent = currentCreature.name;
    modalCreatureName.textContent = currentCreature.name;
    modalCreatureDescription.textContent = currentCreature.description || "心核同步中的陪伴型 AI 小怪獸。";
    messageInput.placeholder = `對${currentCreature.name}說一句話...`;
  }

  function bindUI() {
    panelTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        if (trigger.dataset.panelTrigger === "character") openCharacterDetail();
        if (trigger.dataset.panelTrigger === "soulTalk") openSoulTalk();
      });
    });

    panelCloseButtons.forEach((button) => {
      button.addEventListener("click", closePanel);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && activePanel) closePanel();
    });

    sendButton.addEventListener("click", () => {
      const value = messageInput.value.trim();
      if (!value) return;
      messageInput.value = "";
      handlePlayerMessage(value);
    });

    messageInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        sendButton.click();
      }
    });

    bottomNavButtons.forEach((button) => {
      button.addEventListener("click", () => {
        openActionSheet(button.dataset.action);
      });
    });

  }

  function openPanel(panelName) {
    if (!panelName) return;
    activePanel = panelName;
    panelLayer.dataset.activePanel = panelName;
    panelLayer.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-open");
    if (panelName === "soulTalk") {
      requestAnimationFrame(() => messageInput.focus({ preventScroll: true }));
    }
  }

  function closePanel() {
    activePanel = null;
    panelLayer.dataset.activePanel = "none";
    panelLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-open");
    queuedAction = null;
  }

  function openCharacterDetail() {
    renderHUD();
    openPanel("character");
  }

  function openSoulTalk() {
    renderChat();
    openPanel("soulTalk");
  }

  function openActionSheet(action) {
    const actionMeta = getActionMeta(action);
    if (!actionMeta) return;
    queuedAction = action;
    actionSheetTitle.textContent = actionMeta.title;
    actionSheetCopy.textContent = actionMeta.copy;
    renderActionRows(actionMeta.rows);
    openPanel("actionSheet");
  }

  function renderActionRows(rows) {
    actionSheetActions.innerHTML = "";
    rows.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        commitNavAction(queuedAction, label);
        closePanel();
      });
      actionSheetActions.appendChild(button);
    });
  }

  function getActionMeta(action) {
    const actions = {
      explore: {
        title: "探索",
        copy: "選擇一個短探索行動；首頁保持乾淨，不展開永久工具列表。",
        message: "森林深處有微弱的光。",
        rows: ["前往湖畔深處", "查看今日事件", "搜尋微光記號"]
      },
      care: {
        title: "照顧",
        copy: "用一次短照顧行動安撫夥伴，詳細互動留在 Soul Talk。",
        message: "你靠近牠，牠的呼吸變得穩定。",
        rows: ["摸摸", "餵食", "休息", "安撫"]
      },
      grow: {
        title: "成長",
        copy: "查看一次心核同步提示，不在首頁展開大型 HUD。",
        message: "心核頻率正在緩慢同步。",
        rows: ["查看同步率", "進化預覽", "能力培養"]
      },
      memory: {
        title: "記憶",
        copy: "保存目前片刻，並將細節留給角色詳情或 Soul Talk。",
        message: "一段微弱的回憶被保存下來。",
        rows: ["回憶紀錄", "對話片段", "羈絆節點"]
      }
    };
    return actions[action];
  }

  function commitNavAction(action, choice) {
    const actionMeta = getActionMeta(action);
    if (!actionMeta) return;
    const message = choice ? `${actionMeta.message}（${choice}）` : actionMeta.message;
    addChat("system", message);
    statusText.textContent = message;
    saveState();
    renderChat();
  }

  function handlePlayerMessage(message) {
    addChat("player", message);

    const moodBefore = state.mood;
    const repeated = message === state.lastMessage;
    state.lastMessage = message;
    state.bond += 1;
    state.energy = Math.max(0, state.energy - 1);

    if (repeated) {
      state.spamScore += 1;
      state.trust = Math.max(0, state.trust - 1);
      state.mood = "defensive";
    } else if (state.energy <= 2) {
      state.mood = "tired";
    } else if (/累|悶|難過|不想|孤單|寂寞/.test(message)) {
      state.mood = "calm";
      state.trust += 1;
    } else {
      state.mood = "warm";
    }

    const reply = mockAIResponse(message, repeated);
    addChat("companion", reply);
    saveState();
    renderHUD();
    renderChat();

    return {
      moodBefore,
      moodAfter: state.mood,
      repeated
    };
  }

  function mockAIResponse(message, repeated) {
    if (repeated) return "你剛剛一直重複同一句話……我有點不安。我想慢一點。";
    if (state.energy <= 1) return "我有點累了。可以陪我安靜待一下嗎？";
    if (/累|悶|難過|不想|孤單|寂寞/.test(message)) return "今天的空氣好像有點重。我先不吵你，你可以在這裡待一下。";
    if (/摸|摸摸|陪/.test(message)) return "嗯……火變得比較暖了。你還在，這件事我有感覺到。";
    return "我聽見了。這句話會留在火光裡一小段時間。";
  }

  function addChat(role, text) {
    state.reactionPreview = "";
    state.chatHistory.push({ role, text });
    if (state.chatHistory.length > 24) state.chatHistory.shift();
  }

  function renderHUD() {
    bondEl.textContent = state.bond;
    trustEl.textContent = state.trust;
    moodEl.textContent = state.mood;
    energyEl.textContent = state.energy;
    foxName.textContent = currentCreature.name;
    statusText.textContent = `${currentCreature.name}正在湖畔安靜呼吸。`;

    bondFill.style.width = `${clampPercent(state.bond, 24)}%`;
    trustFill.style.width = `${clampPercent(state.trust, 12)}%`;
    energyFill.style.width = `${clampPercent(state.energy, 10)}%`;
    moodFill.style.width = `${moodPercent(state.mood)}%`;
  }

  function clampPercent(value, max) {
    return Math.max(0, Math.min(100, (Number(value) / max) * 100));
  }

  function clampValue(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function moodPercent(mood) {
    const moodMap = {
      defensive: 24,
      tired: 38,
      calm: 62,
      warm: 82
    };
    return moodMap[mood] || 50;
  }

  function renderChat() {
    chatLog.innerHTML = "";
    const visibleHistory = state.chatHistory.slice(-12);
    const lastItem = state.chatHistory[state.chatHistory.length - 1];
    soulTalkPreview.textContent = state.reactionPreview || (lastItem ? lastItem.text : "我在這裡，安靜地看著你。");
    for (const item of visibleHistory) {
      const line = document.createElement("div");
      const role = item.role === "fox" ? "companion" : item.role;
      line.className = `chat-line ${role}`;
      if (role === "player") {
        line.textContent = `你：${item.text}`;
      } else if (role === "system") {
        line.textContent = `聖域：${item.text}`;
      } else {
        line.textContent = `${currentCreature.name}：${item.text}`;
      }
      chatLog.appendChild(line);
    }
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function readDevQueryHooks() {
    const hooks = { applied: false };

    try {
      const params = new URLSearchParams(window.location.search);

      if (params.get("devReset") === "1") {
        hooks.devReset = true;
        hooks.applied = true;
      }

      const devMood = params.get("devMood");
      if (SUPPORTED_DEV_MOODS.has(devMood)) {
        hooks.mood = devMood;
        hooks.applied = true;
      }

      readClampedDevNumber(params, "devDefense", 0, 100, (value) => {
        hooks.defense = value;
        hooks.applied = true;
      });
      readClampedDevNumber(params, "devFatigue", 0, 10, (value) => {
        hooks.touchFatigue = value;
        hooks.applied = true;
      });
      readClampedDevNumber(params, "devTrust", 0, 100, (value) => {
        hooks.trust = value;
        hooks.applied = true;
      });
      readClampedDevNumber(params, "devBond", 0, 100, (value) => {
        hooks.bond = value;
        hooks.applied = true;
      });
      readClampedDevNumber(params, "devEnergy", 0, 10, (value) => {
        hooks.energy = value;
        hooks.applied = true;
      });

      const devFirstTouch = params.get("devFirstTouch");
      if (devFirstTouch === "0" || devFirstTouch === "1") {
        hooks.firstTouchCompleted = devFirstTouch === "1";
        hooks.applied = true;
      }
    } catch (error) {
      console.warn("Failed to parse NexusLink dev query hooks", error);
    }

    return hooks;
  }

  function readClampedDevNumber(params, key, min, max, applyValue) {
    if (!params.has(key)) return;

    const rawValue = params.get(key);
    if (rawValue === null || rawValue.trim() === "") return;

    const parsedValue = Number(rawValue);
    if (!Number.isFinite(parsedValue)) return;

    applyValue(clampValue(parsedValue, min, max));
  }

  function applyDevResetHook(hooks) {
    if (!hooks.devReset) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to reset NexusLink save from dev query hook", error);
    }
  }

  function applyDevQueryHooks(targetState, hooks) {
    const nextState = normalizeState(targetState);
    if (!hooks.applied) return nextState;

    // Development-only QA hooks: controlled exclusively by URL query params.
    // They must remain invisible and never render debug state on the home screen.
    if (hooks.mood) nextState.mood = hooks.mood;
    if (hooks.defense !== undefined) nextState.defense = hooks.defense;
    if (hooks.touchFatigue !== undefined) nextState.touchFatigue = hooks.touchFatigue;
    if (hooks.trust !== undefined) nextState.trust = hooks.trust;
    if (hooks.bond !== undefined) nextState.bond = hooks.bond;
    if (hooks.energy !== undefined) nextState.energy = hooks.energy;
    if (hooks.firstTouchCompleted !== undefined) {
      nextState.firstTouchCompleted = hooks.firstTouchCompleted;
    }

    console.info("[NexusLink dev hooks applied]", {
      devReset: Boolean(hooks.devReset),
      mood: hooks.mood,
      defense: hooks.defense,
      touchFatigue: hooks.touchFatigue,
      trust: hooks.trust,
      bond: hooks.bond,
      energy: hooks.energy,
      firstTouchCompleted: hooks.firstTouchCompleted
    });

    return normalizeState(nextState);
  }

  function saveState() {
    state.lastSeenAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultState();
      return normalizeState({ ...createDefaultState(), ...JSON.parse(raw) });
    } catch (error) {
      console.warn("Failed to load save data", error);
      return createDefaultState();
    }
  }

  function createDefaultState() {
    return {
      ...defaultState,
      lastSeenAt: Date.now(),
      chatHistory: defaultState.chatHistory.map((item) => ({ ...item }))
    };
  }

  function normalizeState(targetState) {
    return {
      ...targetState,
      bond: clampValue(targetState.bond, 0, 100),
      trust: clampValue(targetState.trust, 0, 100),
      energy: clampValue(targetState.energy, 0, 10),
      defense: clampValue(targetState.defense ?? 35, 0, 100),
      touchFatigue: clampValue(targetState.touchFatigue ?? 0, 0, 10),
      lastTouchAt: targetState.lastTouchAt ?? null,
      lastSeenAt: Number(targetState.lastSeenAt) || Date.now(),
      firstTouchCompleted: Boolean(targetState.firstTouchCompleted),
      reactionPreview: targetState.reactionPreview || "",
      chatHistory: Array.isArray(targetState.chatHistory)
        ? targetState.chatHistory
        : createDefaultState().chatHistory
    };
  }

  function applyOfflineRecovery(targetState) {
    const recoveredState = normalizeState(targetState);
    const now = Date.now();
    const elapsedMs = Math.max(0, now - recoveredState.lastSeenAt);
    const thirtyMinutes = 30 * 60 * 1000;
    const twoHours = 2 * 60 * 60 * 1000;

    if (elapsedMs >= thirtyMinutes) {
      const fatigueRecovery = Math.floor(elapsedMs / thirtyMinutes);
      recoveredState.touchFatigue = clampValue(recoveredState.touchFatigue - fatigueRecovery, 0, 10);
    }

    if (elapsedMs >= twoHours) {
      const energyRecovery = Math.floor(elapsedMs / twoHours);
      recoveredState.energy = clampValue(recoveredState.energy + energyRecovery, 0, 10);
    }

    recoveredState.lastSeenAt = now;
    return recoveredState;
  }
})();
