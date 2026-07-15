import assert from "node:assert/strict";

import { EXPLORATION_NODES } from "../../src/data/explorationNodes.js";
import {
  FIRST_EXPLORATION_NODE_ID,
  buildPhaseSearchReading,
  createEncounterTransition,
  hasExistingExplorationProgress,
  isFirstExplorationNodeAllowed,
  resolvePhaseSearchChoice
} from "../../src/ui/mapController.js";
import { createPanelManager } from "../../src/ui/panelManager.js";

function createClassList() {
  const values = new Set();
  return {
    add: (...tokens) => tokens.forEach((token) => values.add(token)),
    remove: (...tokens) => tokens.forEach((token) => values.delete(token)),
    contains: (token) => values.has(token)
  };
}

function createElement(dataset = {}) {
  const attributes = new Map();
  return {
    dataset: { ...dataset },
    hidden: false,
    inert: false,
    tabIndex: -1,
    classList: createClassList(),
    setAttribute(name, value) { attributes.set(name, String(value)); },
    removeAttribute(name) { attributes.delete(name); },
    getAttribute(name) { return attributes.get(name); },
    addEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
}

function installPanelDom() {
  const backdrop = createElement();
  const mapPanel = createElement({ panel: "map" });
  const soulPanel = createElement({ panel: "soulTalk" });
  const pageLayer = createElement();
  const panelLayer = createElement({ activePanel: "none" });
  panelLayer.querySelector = (selector) => selector === ".panel-backdrop" ? backdrop : null;
  panelLayer.querySelectorAll = (selector) => selector === "[data-panel]" ? [mapPanel, soulPanel] : [];
  const body = createElement();
  let keydownHandler = null;
  globalThis.document = {
    body,
    querySelector(selector) {
      if (selector === ".panel-layer") return panelLayer;
      if (selector === "#page-layer") return pageLayer;
      return null;
    },
    querySelectorAll() { return []; },
    addEventListener(type, handler) {
      if (type === "keydown") keydownHandler = handler;
    }
  };
  globalThis.requestAnimationFrame = (callback) => callback();
  return {
    body,
    dispatchEscape() { keydownHandler?.({ key: "Escape" }); }
  };
}

function testFirstExplorationGate() {
  const fresh = { explorationProgress: { totalExplorations: 0 } };
  assert.equal(isFirstExplorationNodeAllowed(fresh, FIRST_EXPLORATION_NODE_ID), true);
  for (const node of EXPLORATION_NODES) {
    if (node.id === FIRST_EXPLORATION_NODE_ID) continue;
    assert.equal(isFirstExplorationNodeAllowed(fresh, node.id), false, `${node.id} must stay locked on exploration zero`);
  }
  const veteran = { explorationProgress: { totalExplorations: 2 } };
  assert.equal(isFirstExplorationNodeAllowed(veteran, "starwood_trail"), true);
  assert.equal(isFirstExplorationNodeAllowed(veteran, "rift_observatory"), true);
  const legacyVeteran = { explorationProgress: { totalExplorations: 0, visitCounts: { starwood_trail: 2 } } };
  assert.equal(hasExistingExplorationProgress(legacyVeteran), true);
  assert.equal(isFirstExplorationNodeAllowed(legacyVeteran, "rift_observatory"), true);
}

function testPhaseSearchContract() {
  const starwood = EXPLORATION_NODES.find((node) => node.id === "starwood_trail");
  assert.ok(starwood?.phaseSearch, "starwood_trail must declare the phase-search slice");
  assert.deepEqual(starwood.phaseSearch.choices.map((choice) => choice.id), ["direct", "anchor", "calm_sync", "return"]);

  const quietCompanion = { name: "灰影貓", temperament: { zh: "觀察型・安靜", en: "Observant & Quiet" } };
  const tiredReading = buildPhaseSearchReading(
    { energy: 2, touchFatigue: 0, defense: 20, mood: "calm" },
    quietCompanion,
    starwood.phaseSearch
  );
  assert.equal(tiredReading.suggestedChoice, "anchor");

  const brightCompanion = { name: "焰尾小狐", temperament: { zh: "活潑・明亮", en: "Playful & Bright" } };
  const brightReading = buildPhaseSearchReading(
    { energy: 8, touchFatigue: 0, defense: 18, mood: "warm" },
    brightCompanion,
    starwood.phaseSearch
  );
  assert.equal(brightReading.suggestedChoice, "direct");

  const direct = resolvePhaseSearchChoice("direct", starwood.phaseSearch);
  assert.equal(direct.shouldExplore, true);
  assert.equal(direct.shouldClose, true);

  const anchor = resolvePhaseSearchChoice("anchor", starwood.phaseSearch);
  assert.equal(anchor.shouldExplore, false);
  assert.deepEqual(anchor.sessionPatch, { anchorRead: true, settled: false });
  assert.equal("statePatch" in anchor, false, "anchor reading must not create persistent rewards");

  const calm = resolvePhaseSearchChoice("calm_sync", starwood.phaseSearch);
  assert.deepEqual(calm.sessionPatch, { anchorRead: false, settled: true });
  assert.equal("statePatch" in calm, false, "phase calm sync is session-only and cannot overwrite companion state");

  const returned = resolvePhaseSearchChoice("return", starwood.phaseSearch);
  assert.equal(returned.shouldClose, true);
  assert.equal(returned.shouldExplore, false);
  assert.equal(returned.sessionPatch, null);
  assert.equal("statePatch" in returned, false, "return must be zero-mutation");
}

function testEncounterLifecycle() {
  let timerCallback = null;
  let clearedTimer = null;
  let active = true;
  const started = [];
  const cancelled = [];
  const transition = createEncounterTransition({
    setTimer(callback) {
      timerCallback = callback;
      return 41;
    },
    clearTimer(timerId) { clearedTimer = timerId; },
    isMapActive: () => active,
    onStart: (encounter) => started.push(encounter),
    onCancel: (encounter) => cancelled.push(encounter)
  });

  transition.schedule({ id: "cancel-on-close" }, 650);
  assert.equal(transition.isPending(), true);
  assert.equal(transition.cancel(), true);
  assert.equal(clearedTimer, 41);
  assert.equal(started.length, 0);
  assert.equal(cancelled.at(-1).id, "cancel-on-close");

  active = false;
  transition.schedule({ id: "inactive-panel" }, 650);
  timerCallback();
  assert.equal(started.length, 0);
  assert.equal(cancelled.at(-1).id, "inactive-panel");

  active = true;
  transition.schedule({ id: "active-map" }, 650);
  timerCallback();
  assert.equal(started.at(-1).id, "active-map");
  assert.equal(transition.isPending(), false);
}

function testPanelCloseNotifications() {
  const panelDom = installPanelDom();
  const manager = createPanelManager();
  const events = [];
  manager.registerOnClose("map", (event) => events.push(event));
  manager.bind();

  manager.openPanel("map");
  manager.closePanel();
  assert.equal(events.at(-1).reason, "close");
  assert.equal(events.at(-1).forced, false);

  manager.openPanel("map");
  manager.closePanel({ force: true });
  assert.equal(events.at(-1).reason, "force");
  assert.equal(events.at(-1).forced, true);

  manager.openPanel("map");
  panelDom.dispatchEscape();
  assert.equal(events.at(-1).reason, "escape");
  assert.equal(events.at(-1).forced, false);

  manager.openPanel("map");
  manager.openPanel("soulTalk");
  assert.equal(events.at(-1).reason, "switch");
  assert.equal(events.at(-1).nextPanel, "soulTalk");
  assert.equal(panelDom.body.dataset.soulTalk, "open");

  manager.openPanel("map");
  assert.equal(panelDom.body.dataset.soulTalk, "collapsed", "switching away must clear Soul Talk open state");

  let vetoCount = 0;
  manager.registerCloseGuard("map", () => true);
  manager.openPanel("map");
  const beforeVeto = events.length;
  manager.registerOnClose("map", () => { vetoCount += 1; });
  assert.equal(manager.closePanel(), false);
  assert.equal(events.length, beforeVeto);
  assert.equal(vetoCount, 0);
}

testFirstExplorationGate();
testPhaseSearchContract();
testEncounterLifecycle();
testPanelCloseNotifications();

console.log(JSON.stringify({
  gate: "map-first-session",
  passed: true,
  checks: ["K9", "phase-search", "encounter-lifecycle", "panel-close-notifications"]
}, null, 2));
