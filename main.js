(() => {
  const statusEl = document.querySelector("#status-text");
  const gameRoot = document.querySelector("#game-root");

  if (!window.PIXI) {
    statusEl.textContent = "PixiJS 載入失敗，請檢查網路或 CDN。";
    return;
  }

  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 450;
  const PLAYER_SPEED = 420;
  const PLAYER_RADIUS = 16;
  const PULSE_BASE_SPEED = 145;
  const PULSE_ACCEL = 3.8;
  const SPAWN_BASE_INTERVAL = 1.05;

  const app = new PIXI.Application();

  app
    .init({
      backgroundAlpha: 0,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      antialias: true,
      resizeTo: gameRoot,
    })
    .then(() => {
      gameRoot.appendChild(app.canvas);
      bootGame();
    })
    .catch((error) => {
      console.error(error);
      statusEl.textContent = "初始化失敗，請重新整理頁面。";
    });

  function bootGame() {
    const world = new PIXI.Container();
    app.stage.addChild(world);

    const bg = new PIXI.Graphics();
    drawBackground(bg);
    world.addChild(bg);

    const player = createPlayer();
    player.x = GAME_WIDTH / 2;
    player.y = GAME_HEIGHT - 50;
    world.addChild(player);

    const pulsesLayer = new PIXI.Container();
    world.addChild(pulsesLayer);

    const hudText = new PIXI.Text({
      text: "Score: 0  Time: 0.0s",
      style: {
        fill: "#e2e8f0",
        fontSize: 22,
        fontWeight: "700",
        stroke: { color: "#090b18", width: 4 },
      },
    });
    hudText.position.set(16, 16);
    world.addChild(hudText);

    const centerText = new PIXI.Text({
      text: "",
      style: {
        fill: "#67e8f9",
        fontSize: 40,
        fontWeight: "800",
        align: "center",
        stroke: { color: "#090b18", width: 6 },
      },
      anchor: 0.5,
    });
    centerText.anchor.set(0.5);
    centerText.position.set(GAME_WIDTH / 2, GAME_HEIGHT / 2);
    world.addChild(centerText);

    const keys = new Set();
    window.addEventListener("keydown", (event) => {
      keys.add(event.key.toLowerCase());
      if (event.key === " ") {
        event.preventDefault();
        if (state.gameOver) resetGame();
      }
    });
    window.addEventListener("keyup", (event) => {
      keys.delete(event.key.toLowerCase());
    });

    const state = {
      gameOver: false,
      elapsed: 0,
      score: 0,
      spawnTimer: 0,
      pulses: [],
    };

    statusEl.textContent = "存活越久分數越高。失敗後按空白鍵重新開始。";

    app.ticker.add((ticker) => {
      const deltaSeconds = ticker.deltaMS / 1000;

      if (!state.gameOver) {
        updatePlayer(deltaSeconds);
        updatePulses(deltaSeconds);
        updateSpawn(deltaSeconds);
        state.elapsed += deltaSeconds;
        state.score = Math.floor(state.elapsed * 10 + state.pulses.length * 0.4);
      }

      hudText.text = `Score: ${state.score}  Time: ${state.elapsed.toFixed(1)}s`;
    });

    function updatePlayer(deltaSeconds) {
      const leftPressed = keys.has("arrowleft") || keys.has("a");
      const rightPressed = keys.has("arrowright") || keys.has("d");

      if (leftPressed === rightPressed) return;

      const direction = leftPressed ? -1 : 1;
      player.x += direction * PLAYER_SPEED * deltaSeconds;
      player.x = clamp(player.x, PLAYER_RADIUS + 8, GAME_WIDTH - PLAYER_RADIUS - 8);
    }

    function updateSpawn(deltaSeconds) {
      state.spawnTimer -= deltaSeconds;
      const interval = Math.max(
        0.3,
        SPAWN_BASE_INTERVAL - state.elapsed * 0.02,
      );

      if (state.spawnTimer > 0) return;

      state.spawnTimer = interval;
      spawnPulse();

      if (Math.random() < 0.12 + state.elapsed * 0.003) {
        spawnPulse(true);
      }
    }

    function spawnPulse(isFast = false) {
      const pulse = new PIXI.Graphics();
      const radius = 8 + Math.random() * 16;
      const hue = isFast ? 330 : 198;
      pulse.circle(0, 0, radius).fill(`hsl(${hue} 90% 62%)`);
      pulse.alpha = 0.85;

      pulse.x = 12 + Math.random() * (GAME_WIDTH - 24);
      pulse.y = -20;

      const speedBoost = isFast ? 1.6 : 1;
      const vx = (Math.random() - 0.5) * 70;
      const vy =
        (PULSE_BASE_SPEED + state.elapsed * PULSE_ACCEL + Math.random() * 80) * speedBoost;

      pulsesLayer.addChild(pulse);
      state.pulses.push({ sprite: pulse, r: radius, vx, vy });
    }

    function updatePulses(deltaSeconds) {
      for (let i = state.pulses.length - 1; i >= 0; i -= 1) {
        const pulse = state.pulses[i];
        pulse.sprite.x += pulse.vx * deltaSeconds;
        pulse.sprite.y += pulse.vy * deltaSeconds;

        if (pulse.sprite.x < pulse.r || pulse.sprite.x > GAME_WIDTH - pulse.r) {
          pulse.vx *= -1;
        }

        if (intersects(player.x, player.y, PLAYER_RADIUS, pulse.sprite.x, pulse.sprite.y, pulse.r)) {
          endGame();
          return;
        }

        if (pulse.sprite.y > GAME_HEIGHT + 30) {
          pulse.sprite.destroy();
          state.pulses.splice(i, 1);
        }
      }
    }

    function endGame() {
      state.gameOver = true;
      centerText.text = "Connection Lost\nPress Space";
      statusEl.textContent = `遊戲結束，最終分數 ${state.score}。按空白鍵再玩一次。`;
    }

    function resetGame() {
      for (const pulse of state.pulses) {
        pulse.sprite.destroy();
      }
      state.pulses.length = 0;
      state.spawnTimer = 0;
      state.elapsed = 0;
      state.score = 0;
      state.gameOver = false;
      player.x = GAME_WIDTH / 2;
      centerText.text = "";
      statusEl.textContent = "新的連線建立，繼續生存挑戰！";
    }
  }

  function createPlayer() {
    const player = new PIXI.Graphics();
    player.moveTo(0, -16);
    player.lineTo(14, 16);
    player.lineTo(-14, 16);
    player.closePath();
    player.fill("#67e8f9");
    player.stroke({ color: "#a5f3fc", width: 2 });
    return player;
  }

  function drawBackground(bg) {
    bg.clear();
    bg.rect(0, 0, GAME_WIDTH, GAME_HEIGHT).fill("#05070f");

    for (let i = 0; i < 80; i += 1) {
      const x = Math.random() * GAME_WIDTH;
      const y = Math.random() * GAME_HEIGHT;
      const size = Math.random() * 2 + 0.5;
      bg.circle(x, y, size).fill(`rgba(103, 232, 249, ${Math.random() * 0.35})`);
    }

    for (let x = 0; x <= GAME_WIDTH; x += 80) {
      bg.moveTo(x, 0);
      bg.lineTo(x, GAME_HEIGHT);
    }
    for (let y = 0; y <= GAME_HEIGHT; y += 75) {
      bg.moveTo(0, y);
      bg.lineTo(GAME_WIDTH, y);
    }
    bg.stroke({ color: "rgba(103, 232, 249, 0.08)", width: 1 });
  }

  function intersects(ax, ay, ar, bx, by, br) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy <= (ar + br) ** 2;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
})();
