const KEY_DIRECTION = Object.freeze({ ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" });

export function createChampionshipInputAdapter({ root, getPhase, move, activateFocused }) {
  let disposed = false;
  let frameId = null;
  let gamepadDirectionLatch = null;
  let gamepadConfirmLatch = false;

  function onKeyDown(event) {
    const direction = KEY_DIRECTION[event.key];
    if (direction && getPhase() === "HUNT_FIELD") {
      event.preventDefault();
      if (event.repeat) return;
      move(direction);
    } else if ((event.key === "Enter" || event.key === " ") && document.activeElement === root) {
      event.preventDefault();
      activateFocused();
    }
  }

  function onSemanticGamepad(event) {
    const action = event.detail?.action;
    if (["up", "down", "left", "right"].includes(action) && getPhase() === "HUNT_FIELD") move(action);
    if (action === "confirm") activateFocused();
  }

  function pollGamepad() {
    if (disposed) return;
    const pad = navigator.getGamepads?.()?.find(Boolean);
    if (pad) {
      const horizontal = pad.axes?.[0] ?? 0;
      const vertical = pad.axes?.[1] ?? 0;
      const direction = pad.buttons?.[12]?.pressed || vertical < -0.65 ? "up"
        : pad.buttons?.[13]?.pressed || vertical > 0.65 ? "down"
          : pad.buttons?.[14]?.pressed || horizontal < -0.65 ? "left"
            : pad.buttons?.[15]?.pressed || horizontal > 0.65 ? "right"
              : null;
      const confirmPressed = Boolean(pad.buttons?.[0]?.pressed);
      if (direction && direction !== gamepadDirectionLatch && getPhase() === "HUNT_FIELD") {
        move(direction);
      } else if (!direction && confirmPressed && !gamepadConfirmLatch) {
        activateFocused();
      }
      gamepadDirectionLatch = direction;
      gamepadConfirmLatch = confirmPressed;
    } else {
      gamepadDirectionLatch = null;
      gamepadConfirmLatch = false;
    }
    frameId = requestAnimationFrame(pollGamepad);
  }

  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("championship-gamepad-action", onSemanticGamepad);
  frameId = requestAnimationFrame(pollGamepad);
  return Object.freeze({
    dispose() {
      disposed = true;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("championship-gamepad-action", onSemanticGamepad);
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    }
  });
}
