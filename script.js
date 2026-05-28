(() => {
  const STORAGE_KEY = "nexusLinkPrototypeState:v2";

  const defaultState = {
    bond: 0,
    trust: 5,
    mood: "calm",
    energy: 10,
    spamScore: 0,
    lastMessage: "",
    chatHistory: [
      {
        role: "fox",
        text: "火還亮著。我在這裡。"
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

  if (!window.PIXI) {
    statusText.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
    return;
  }

  const WORLD_WIDTH = 390;
  const WORLD_HEIGHT = 694;
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

    const fox = await createFlametailFoxNode();
    fox.x = WORLD_WIDTH / 2;
    fox.y = 470;
    world.addChild(fox);

    fox.eventMode = "static";
    fox.cursor = "pointer";
    fox.on("pointertap", () => {
      handlePlayerMessage("摸摸焰尾狐");
    });

    let t = 0;
    app.ticker.add((ticker) => {
      t += ticker.deltaMS / 1000;

      fox.y = 470 + Math.sin(t * 2.1) * 4;
      fox.scale.set(1 + Math.sin(t * 1.5) * 0.015);

      if (fox.__isSpriteFox && fox.__tailFlame) {
        fox.__tailFlame.alpha = 0.7 + Math.sin(t * 5) * 0.25;
      }

      particles.children.forEach((particle, index) => {
        particle.y -= (0.15 + index * 0.002) * ticker.deltaTime;
        particle.alpha = 0.25 + Math.sin(t + index) * 0.12;
        if (particle.y < 110) particle.y = 610;
      });
    });
  }

  async function createFlametailFoxNode() {
    const ASSET_PATH = "./assets/flametail-fox.png";

    try {
      const texture = await PIXI.Assets.load(ASSET_PATH);
      const spriteFox = createFoxSprite(texture);
      statusText.textContent = "焰尾狐已出現（圖片資源）。";
      return spriteFox;
    } catch (error) {
      console.warn("Fox image load failed, fallback to placeholder:", error);
      statusText.textContent = "焰尾狐圖片載入失敗，已改用預設造型。";
      return createFlametailFoxPlaceholder();
    }
  }

  function createFoxSprite(texture) {
    const fox = new PIXI.Container();

    const shadow = new PIXI.Graphics();
    shadow.ellipse(0, 54, 58, 14).fill({ color: 0x000000, alpha: 0.25 });
    fox.addChild(shadow);

    const sprite = new PIXI.Sprite(texture);
    sprite.anchor.set(0.5, 0.82);

    const maxW = 220;
    const maxH = 220;
    const scale = Math.min(maxW / sprite.width, maxH / sprite.height);
    sprite.scale.set(scale);

    fox.addChild(sprite);

    const flame = new PIXI.Graphics();
    flame.moveTo(0, -108).lineTo(-15, -76).lineTo(15, -76).closePath().fill("#ff7a2f");
    flame.moveTo(2, -98).lineTo(-6, -77).lineTo(10, -77).closePath().fill("#ffd166");
    fox.addChild(flame);

    fox.__isSpriteFox = true;
    fox.__tailFlame = flame;

    return fox;
  }

  function drawLakeCamp(g) {
    g.clear();

    g.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill("#07111f");

    g.circle(300, 92, 58).fill({ color: 0x9fd7ff, alpha: 0.22 });
    g.circle(300, 92, 28).fill({ color: 0xe3f6ff, alpha: 0.46 });

    g.moveTo(0, 240).lineTo(70, 150).lineTo(150, 240).closePath().fill("#12233a");
    g.moveTo(80, 240).lineTo(205, 132).lineTo(330, 240).closePath().fill("#152a45");
    g.moveTo(230, 240).lineTo(330, 162).lineTo(410, 240).closePath().fill("#102136");

    for (let x = -20; x < WORLD_WIDTH + 30; x += 38) {
      g.moveTo(x, 300).lineTo(x + 18, 225).lineTo(x + 36, 300).closePath().fill("#0d2a24");
    }

    g.ellipse(WORLD_WIDTH / 2, 360, 250, 92).fill("#103852");
    g.ellipse(WORLD_WIDTH / 2, 354, 230, 66).fill({ color: 0x1d5c7a, alpha: 0.5 });

    g.roundRect(-20, 415, WORLD_WIDTH + 40, 300, 32).fill("#1a2d25");
    g.roundRect(50, 430, 290, 165, 28).fill("#26382d");

    g.ellipse(195, 545, 62, 22).fill("#15120d");
    g.rect(168, 552, 60, 8).fill("#5b351a");
    g.circle(195, 530, 30).fill({ color: 0xff9f43, alpha: 0.2 });
    g.circle(195, 526, 18).fill({ color: 0xffc15a, alpha: 0.65 });
    g.moveTo(195, 500).lineTo(178, 536).lineTo(212, 536).closePath().fill("#ff7a2f");
    g.moveTo(198, 510).lineTo(186, 537).lineTo(208, 537).closePath().fill("#ffd166");
  }

  function createParticles() {
    const layer = new PIXI.Container();
    for (let i = 0; i < 32; i += 1) {
      const p = new PIXI.Graphics();
      p.circle(0, 0, 1 + Math.random() * 1.8).fill({ color: 0x8ee8ff, alpha: 0.35 });
      p.x = 24 + Math.random() * (WORLD_WIDTH - 48);
      p.y = 120 + Math.random() * 500;
      layer.addChild(p);
    }
    return layer;
  }

  function createFlametailFoxPlaceholder() {
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
    addChat("fox", reply);
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
    foxName.textContent = state.mood === "defensive" ? "焰尾狐 · 有點防備" : "焰尾狐";
    statusText.textContent = `狀態：${state.mood}｜SpamScore：${state.spamScore}`;
  }

  function renderChat() {
    chatLog.innerHTML = "";
    for (const item of state.chatHistory) {
      const line = document.createElement("div");
      line.className = `chat-line ${item.role}`;
      line.textContent = item.role === "player" ? `你：${item.text}` : `焰尾狐：${item.text}`;
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
