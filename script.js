(() => {
  const STORAGE_KEY = "nexusLinkPrototypeState:v2";
  const CREATURES_PATH = "./data/creatures.json";
  const currentCreatureId = "greyshade-cat";
  const FALLBACK_CREATURE = {
    id: "flametail-fox",
    name: "焰尾狐",
    element: "fire",
    image: "./assets/flametail-fox.png",
    defaultMood: "warm",
    description: "火屬性的陪伴型 AI 小怪獸。"
  };

  let currentCreature = FALLBACK_CREATURE;

  const defaultState = {
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    spamScore: 0,
    lastMessage: "",
    chatHistory: [
      {
        role: "companion",
        text: "我在這裡，安靜地看著你。"
      }
    ]
  };

  const state = loadState();

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
  const bottomNavButtons = document.querySelectorAll(".bottom-nav button[data-action]");

  if (!window.PIXI) {
    statusText.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
    return;
  }

  const WORLD_WIDTH = 390;
  const WORLD_HEIGHT = 694;
  const COMPANION_GROUND_Y = 400;
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

  async function bootScene() {
    const world = new PIXI.Container();
    app.stage.addChild(world);

    const background = new PIXI.Graphics();
    drawLakeCamp(background);
    world.addChild(background);

    const particles = createParticles();
    world.addChild(particles);

    const companion = await createCreatureNode(currentCreature);
    companion.x = WORLD_WIDTH / 2;
    companion.y = COMPANION_GROUND_Y;
    world.addChild(companion);

    companion.eventMode = "static";
    companion.cursor = "pointer";
    companion.on("pointertap", () => {
      handlePlayerMessage(`摸摸${currentCreature.name}`);
    });

    let t = 0;
    app.ticker.add((ticker) => {
      t += ticker.deltaMS / 1000;

      companion.y = COMPANION_GROUND_Y + Math.sin(t * 2.1) * 3;
      companion.scale.set(1 + Math.sin(t * 1.5) * 0.015);

      if (companion.__isSpriteCreature && companion.__accentFlame) {
        companion.__accentFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
      }

      particles.children.forEach((particle, index) => {
        particle.y -= (0.15 + index * 0.002) * ticker.deltaTime;
        particle.alpha = 0.25 + Math.sin(t + index) * 0.12;
        if (particle.y < 110) particle.y = 610;
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

  async function createCreatureNode(creature) {
    try {
      const texture = await PIXI.Assets.load(creature.image);
      const spriteCreature = createCreatureSprite(texture);
      statusText.textContent = `${creature.name}已出現（圖片資源）。`;
      return spriteCreature;
    } catch (error) {
      console.warn("Creature image load failed, fallback to placeholder:", error);
      statusText.textContent = `${creature.name}圖片載入失敗，已改用預設造型。`;
      return createCreaturePlaceholder();
    }
  }

  function createCreatureSprite(texture) {
    const fox = new PIXI.Container();

    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, 54, 58, 14).fill({ color: 0x000000, alpha: 0.25 });
    fox.addChild(shadow);

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 1);

    const maxW = Math.min(170, WORLD_WIDTH * 0.44);
    const maxH = Math.min(170, WORLD_HEIGHT * 0.25);
    const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
    sprite.scale.set(scale);

    fox.addChild(sprite);

    const flame = new PIXI.Graphics();
    flame.moveTo(0, -108).lineTo(-15, -76).lineTo(15, -76).closePath().fill("#ff7a2f");
    flame.moveTo(2, -98).lineTo(-6, -77).lineTo(10, -77).closePath().fill("#ffd166");
    fox.addChild(flame);

    fox.__isSpriteCreature = true;
    fox.__accentFlame = flame;

    return fox;
  }

  function drawLakeCamp(g) {
    g.clear();

    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill("#06101d");
    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill({ color: 0x0b1f33, alpha: 0.35 });

    g.circle(302, 84, 72).fill({ color: 0x8deeff, alpha: 0.12 });
    g.circle(302, 84, 34).fill({ color: 0xdffbff, alpha: 0.32 });
    g.circle(294, 76, 27).fill({ color: 0xffffff, alpha: 0.12 });

    g.moveTo(0, 246).lineTo(68, 154).lineTo(150, 246).closePath().fill("#0c1d31");
    g.moveTo(76, 246).lineTo(206, 126).lineTo(334, 246).closePath().fill("#102844");
    g.moveTo(226, 246).lineTo(332, 156).lineTo(414, 246).closePath().fill("#0a1a2d");
    g.rect(0, 238, WORLD_WIDTH, 86).fill({ color: 0x07111f, alpha: 0.42 });

    for (let x = -28; x < WORLD_WIDTH + 40; x += 34) {
      const height = 68 + (x % 3) * 9;
      g.moveTo(x, 318).lineTo(x + 17, 236 - height * 0.18).lineTo(x + 34, 318).closePath().fill("#09231e");
      g.rect(x + 14, 290, 6, 44).fill("#081916");
    }

    g.ellipse(WORLD_WIDTH / 2, 372, 260, 98).fill("#082c42");
    g.ellipse(WORLD_WIDTH / 2, 362, 236, 62).fill({ color: 0x1a6a82, alpha: 0.42 });
    g.ellipse(154, 354, 78, 10).fill({ color: 0x8deeff, alpha: 0.08 });
    g.ellipse(268, 386, 92, 9).fill({ color: 0xffb86b, alpha: 0.1 });
    g.rect(28, 362, 334, 2).fill({ color: 0xb7f7ff, alpha: 0.08 });
    g.rect(72, 392, 246, 2).fill({ color: 0xb7f7ff, alpha: 0.07 });

    g.roundRect(-24, 428, WORLD_WIDTH + 48, 292, 34).fill("#102820");
    g.roundRect(34, 432, 320, 178, 32).fill({ color: 0x1f3b2f, alpha: 0.86 });
    g.ellipse(194, 458, 164, 24).fill({ color: 0x08130f, alpha: 0.18 });

    g.ellipse(195, 548, 72, 24).fill("#120e0b");
    g.rect(162, 555, 72, 8).fill("#5b351a");
    g.rect(168, 546, 62, 7).fill("#6f421e");
    g.circle(195, 528, 54).fill({ color: 0xff9747, alpha: 0.13 });
    g.circle(195, 526, 28).fill({ color: 0xffb86b, alpha: 0.34 });
    g.moveTo(195, 494).lineTo(176, 538).lineTo(215, 538).closePath().fill("#ff7a2f");
    g.moveTo(200, 506).lineTo(185, 539).lineTo(211, 539).closePath().fill("#ffd166");
    g.moveTo(190, 512).lineTo(182, 540).lineTo(198, 540).closePath().fill({ color: 0xffffff, alpha: 0.34 });
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
      p.y = 100 + Math.random() * 520;
      layer.addChild(p);
    }
    return layer;
  }

  function createCreaturePlaceholder() {
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

    const flame = new PIXI.Graphics();
    flame.moveTo(0, -108).lineTo(-16, -76).lineTo(16, -76).closePath().fill("#ff7a2f");
    flame.moveTo(2, -98).lineTo(-7, -77).lineTo(11, -77).closePath().fill("#ffd166");
    fox.addChild(flame);

    return fox;
  }

  function applyCreatureText() {
    foxName.textContent = currentCreature.name;
    messageInput.placeholder = `對${currentCreature.name}說一句話...`;
  }

  function bindUI() {
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
        handleNavAction(button.dataset.action);
      });
    });
  }

  function handleNavAction(action) {
    const messages = {
      explore: "森林深處有微弱的光。",
      care: "你靠近牠，牠的呼吸變得穩定。",
      grow: "心核頻率正在緩慢同步。",
      memory: "一段微弱的回憶被保存下來。"
    };

    const text = messages[action];
    if (!text) return;

    addChat("system", text);
    saveState();
    renderChat();
  }

  function handlePlayerMessage(message) {
    addChat("player", message);

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
  }

  function mockAIResponse(message, repeated) {
    if (repeated) return "你剛剛一直重複同一句話……我有點不安。我想慢一點。";
    if (state.energy <= 1) return "我有點累了。可以陪我安靜待一下嗎？";
    if (/累|悶|難過|不想|孤單|寂寞/.test(message)) return "今天的空氣好像有點重。我先不吵你，你可以在這裡待一下。";
    if (/摸|摸摸|陪/.test(message)) return "嗯……火變得比較暖了。你還在，這件事我有感覺到。";
    return "我聽見了。這句話會留在火光裡一小段時間。";
  }

  function addChat(role, text) {
    state.chatHistory.push({ role, text });
    if (state.chatHistory.length > 24) state.chatHistory.shift();
  }

  function renderHUD() {
    bondEl.textContent = state.bond;
    trustEl.textContent = state.trust;
    moodEl.textContent = state.mood;
    energyEl.textContent = state.energy;
    foxName.textContent = state.mood === "defensive" ? `${currentCreature.name} · 有點防備` : currentCreature.name;
    statusText.textContent = `狀態：${state.mood}｜SpamScore：${state.spamScore}`;
  }

  function renderChat() {
    chatLog.innerHTML = "";
    for (const item of state.chatHistory) {
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

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState, chatHistory: [...defaultState.chatHistory] };
      return { ...defaultState, ...JSON.parse(raw) };
    } catch (error) {
      console.warn("Failed to load save data", error);
      return { ...defaultState, chatHistory: [...defaultState.chatHistory] };
    }
  }
})();
