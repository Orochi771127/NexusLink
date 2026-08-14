import { clamp } from "../utils/clamp.js";
import { clearState } from "../state/saveManager.js";
import { ANIMATION_NAMES } from "../engine/interactionController.js";

export const SUPPORTED_DEV_MOODS = new Set(["calm", "happy", "warm", "sad", "defensive", "distant", "tired"]);

const DEV_ANIMATION_NAMES = ["ambient_walk", ...ANIMATION_NAMES];

export function readDevPanelFlag() {
  try {
    return new URLSearchParams(window.location.search).get("devPanel") === "1";
  } catch (error) {
    console.warn("Failed to parse NexusLink dev panel flag", error);
    return false;
  }
}

export function readDevQueryHooks() {
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

export function applyDevResetHook(hooks) {
  if (!hooks.devReset) return;
  clearState();
}

export function applyDevQueryHooks(targetState, hooks) {
  if (!hooks.applied) return targetState;

  const nextState = { ...targetState };
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

  return nextState;
}

export function createDevPanelController({ isEnabled, store, saveCurrentState, playMotion, getCurrentMotionState, getAnimationLabState, getStorageDebugState, renderChat }) {
  let devPanelRoot = null;
  let devPanelReadout = null;
  let animationReadout = null;
  let devPanelCollapsed = false;

  function setup() {
    if (!isEnabled || devPanelRoot) return;

    devPanelRoot = document.createElement("aside");
    devPanelRoot.className = "dev-reaction-lab";
    devPanelRoot.setAttribute("aria-label", "Nexus Dev Reaction Lab");
    devPanelRoot.innerHTML = `
      <header class="dev-lab-header">
        <div>
          <p>DEV ONLY</p>
          <h2>Nexus Dev Reaction Lab</h2>
        </div>
        <button type="button" data-dev-collapse aria-label="Collapse dev reaction lab">−</button>
      </header>
      <div class="dev-lab-body">
        <section>
          <h3>State Tests</h3>
          <div class="dev-lab-grid">
            <button type="button" data-dev-preset="reset">Reset Save</button>
            <button type="button" data-dev-preset="ftueGuarded">FTUE Guarded Test</button>
            <button type="button" data-dev-preset="defensive">Defensive Test</button>
            <button type="button" data-dev-preset="highFatigue">High Fatigue Reject Test</button>
            <button type="button" data-dev-preset="positiveAccept">Positive Accept Test</button>
            <button type="button" data-dev-preset="distantIdle">Distant Idle Test</button>
          </div>
        </section>
        <section>
          <h3>Nexus Dev Animation Lab</h3>
          <div class="dev-lab-grid">
            ${DEV_ANIMATION_NAMES.map((name) => `<button type="button" data-dev-motion="${name}">Play ${name}</button>`).join("")}
          </div>
          <dl class="dev-lab-readout" data-animation-readout></dl>
        </section>
        <dl class="dev-lab-readout" data-dev-readout></dl>
      </div>
    `;

    document.body.appendChild(devPanelRoot);
    devPanelReadout = devPanelRoot.querySelector("[data-dev-readout]");
    animationReadout = devPanelRoot.querySelector("[data-animation-readout]");
    devPanelRoot.querySelector("[data-dev-collapse]").addEventListener("click", toggleDevPanel);
    devPanelRoot.querySelectorAll("[data-dev-preset]").forEach((button) => {
      button.addEventListener("click", () => applyDevPreset(button.dataset.devPreset));
    });
    devPanelRoot.querySelectorAll("[data-dev-motion]").forEach((button) => {
      button.addEventListener("click", () => playMotion(button.dataset.devMotion));
    });
    renderReadout();
  }

  function toggleDevPanel() {
    if (!devPanelRoot) return;
    devPanelCollapsed = !devPanelCollapsed;
    devPanelRoot.classList.toggle("is-collapsed", devPanelCollapsed);
    const button = devPanelRoot.querySelector("[data-dev-collapse]");
    button.textContent = devPanelCollapsed ? "+" : "−";
    button.setAttribute("aria-label", devPanelCollapsed ? "Expand dev reaction lab" : "Collapse dev reaction lab");
  }

  function applyDevPreset(presetName) {
    if (presetName === "reset") {
      clearState();
      window.location.reload();
      return;
    }

    const presets = {
      ftueGuarded: { firstTouchCompleted: false, mood: "calm", defense: 45, touchFatigue: 0, trust: 5, bond: 0, energy: 10 },
      defensive: { firstTouchCompleted: true, mood: "defensive", defense: 65, touchFatigue: 2, trust: 5, bond: 0, energy: 6 },
      highFatigue: { firstTouchCompleted: true, mood: "calm", defense: 45, touchFatigue: 9, trust: 5, bond: 0, energy: 5 },
      positiveAccept: { firstTouchCompleted: true, mood: "happy", defense: 20, touchFatigue: 0, trust: 30, bond: 30, energy: 10 },
      distantIdle: { firstTouchCompleted: true, mood: "distant", defense: 65, touchFatigue: 1, trust: 5, bond: 5, energy: 6 }
    };
    const preset = presets[presetName];
    if (!preset) return;

    store.setState({
      ...preset,
      lastTouchAt: null,
      lastTouchReaction: "",
      reactionPreview: ""
    });
    saveCurrentState();
    renderChat();
    renderReadout();
  }

  function renderReadout() {
    if (!isEnabled || !devPanelReadout) return;
    const state = store.getState();
    const storageDebug = getStorageDebugState?.() || {};
    const emotionalMemoryStats = summarizeEmotionalMemories(state.emotionalMemories || []);
    const fields = {
      mood: state.mood,
      bond: state.bond,
      trust: state.trust,
      energy: state.energy,
      defense: state.defense,
      boundaryPressure: Number(state.boundaryPressure || 0).toFixed(3),
      boundaryBand: state.boundaryBand || "open",
      touchFatigue: state.touchFatigue,
      safeHarborMode: Boolean(state.safeHarborMode),
      lastEmotionTag: state.lastEmotionTag || "",
      habitatRepairFactor: Number(state.habitatRepairFactor || 0).toFixed(3),
      firstTouchCompleted: state.firstTouchCompleted,
      lastReaction: state.lastTouchReaction || "",
      memoriesLength: state.memories?.length || 0,
      habitatTracesLength: state.habitatTraces?.length || 0,
      emotionalMemoriesLength: emotionalMemoryStats.total,
      emotionalMemoriesVisible: emotionalMemoryStats.visible,
      emotionalFresh: emotionalMemoryStats.statusCounts.fresh,
      emotionalSettled: emotionalMemoryStats.statusCounts.settled,
      emotionalTransformed: emotionalMemoryStats.statusCounts.transformed,
      emotionalArchived: emotionalMemoryStats.statusCounts.archived,
      emotionalReleased: emotionalMemoryStats.statusCounts.released,
      chatHistoryLength: state.chatHistory?.length || 0,
      estimatedSaveSizeKB: Number(storageDebug.estimatedSaveSizeKB || 0).toFixed(2),
      lastSaveStatus: storageDebug.ok === false ? "failed" : storageDebug.emergency ? "emergency" : "ok",
      timeAnomalyCount: state.timeAnomalyCount || 0,
      blockedTouchCount: state.blockedTouchCount || 0,
      currentMotionState: getCurrentMotionState(),
      reactionPreview: state.reactionPreview || ""
    };

    renderDefinitionList(devPanelReadout, fields);
    renderAnimationReadout();
  }

  function renderAnimationReadout() {
    if (!isEnabled || !animationReadout) return;

    const labState = getAnimationLabState?.() || {};
    const availability = DEV_ANIMATION_NAMES.map((name) => {
      const available = Boolean(labState.available?.[name]);
      return `${name}: ${available ? "available" : "missing"}`;
    }).join(" | ");
    const fields = {
      currentAnimation: labState.currentAnimationName || "fallback_placeholder",
      currentMood: store.getState().mood,
      spriteSheetModeActive: Boolean(labState.spriteSheetModeActive),
      fallbackMotionModeActive: !labState.spriteSheetModeActive || Boolean(labState.fallbackMotionModeActive),
      animationsJsonLoaded: Boolean(labState.metadataLoaded),
      availableAnimations: Object.values(labState.available || {}).filter(Boolean).length,
      missingAnimations: labState.missing?.length || 0,
      lastAnimationError: labState.errors?.at?.(-1) || "",
      animationAvailability: availability
    };

    renderDefinitionList(animationReadout, fields);
  }

  return {
    setup,
    renderReadout
  };
}

function readClampedDevNumber(params, key, min, max, applyValue) {
  if (!params.has(key)) return;

  const rawValue = params.get(key);
  if (rawValue === null || rawValue.trim() === "") return;

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) return;

  applyValue(clamp(parsedValue, min, max));
}

function summarizeEmotionalMemories(emotionalMemories) {
  const statusCounts = {
    fresh: 0,
    settled: 0,
    transformed: 0,
    archived: 0,
    released: 0
  };
  let visible = 0;

  emotionalMemories.forEach((memory) => {
    if (statusCounts[memory?.status] !== undefined) {
      statusCounts[memory.status] += 1;
    }
    if (memory?.isVisibleInHabitat !== false && ["fresh", "settled", "transformed"].includes(memory?.status)) {
      visible += 1;
    }
  });

  return {
    total: emotionalMemories.length,
    visible,
    statusCounts
  };
}

function renderDefinitionList(target, fields) {
  target.replaceChildren();

  Object.entries(fields).forEach(([label, value]) => {
    const row = document.createElement("div");
    const term = document.createElement("dt");
    const detail = document.createElement("dd");

    term.textContent = label;
    detail.textContent = String(value);
    row.append(term, detail);
    target.appendChild(row);
  });
}
