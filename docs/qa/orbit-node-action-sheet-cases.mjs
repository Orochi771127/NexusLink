/**
 * Nexus Spin Moonlake node Action Sheet cases.
 * Run: node docs/qa/orbit-node-action-sheet-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  ORBIT_NODE_ACTION_IDS,
  resolveOrbitNodeActionSheet
} = await import(
  pathToFileURL(path.join(repoRoot, "src/orbit/orbitNodeActionResolver.js")).href
);
const { STRINGS } = await import(
  pathToFileURL(path.join(repoRoot, "src/i18n/strings.js")).href
);

function ok(name) {
  console.log(`PASS  ${name}`);
}

const freshState = {
  onboarding: {
    completed: false,
    firstLoop: {}
  },
  chapterProgress: {
    current: 1,
    completed: []
  },
  habitatTraces: []
};
const freshSnapshot = JSON.stringify(freshState);
const freshSheet = resolveOrbitNodeActionSheet(freshState);
const freshById = Object.fromEntries(
  freshSheet.actions.map((action) => [action.id, action])
);

assert.deepEqual(
  freshSheet.actions.map((action) => action.id),
  [
    ORBIT_NODE_ACTION_IDS.ORBIT,
    ORBIT_NODE_ACTION_IDS.EXPEDITION,
    ORBIT_NODE_ACTION_IDS.STANDOFF
  ]
);
assert.equal(freshById.orbit.available, true);
assert.equal(freshById.orbit.primary, true);
assert.equal(freshById.orbit.route, "orbit");
assert.equal(freshById.expedition.available, false);
assert.equal(freshById.expedition.route, "map");
assert.equal(freshById.standoff.available, false);
assert.equal(freshById.standoff.route, "map");
assert.equal(JSON.stringify(freshState), freshSnapshot);
ok("fresh Moonlake exposes Orbit first and keeps gated branches unavailable without mutation");

const progressedState = {
  onboarding: {
    completed: true,
    firstLoop: {
      completedAt: 1
    }
  },
  chapterProgress: {
    current: 2,
    completed: [1]
  },
  habitatTraces: [
    {
      id: "trace-visible",
      type: "em_quiet_return"
    }
  ]
};
const progressedSnapshot = JSON.stringify(progressedState);
const progressedSheet = resolveOrbitNodeActionSheet(progressedState);
const progressedById = Object.fromEntries(
  progressedSheet.actions.map((action) => [action.id, action])
);

assert.equal(progressedById.expedition.available, true);
assert.equal(progressedById.expedition.copyKey, "explore.nodeActions.expeditionSub");
assert.equal(progressedById.standoff.available, true);
assert.equal(progressedById.standoff.copyKey, "explore.nodeActions.standoffSub");
assert.equal(JSON.stringify(progressedState), progressedSnapshot);
assert.equal(Object.isFrozen(progressedSheet), true);
assert.equal(Object.isFrozen(progressedSheet.actions), true);
ok("existing chapter and standoff safety gates drive availability without parallel rules");

const nodeActionKeys = [
  "explore.nodeActions.open",
  "explore.nodeActions.openSub",
  "explore.nodeActions.title",
  "explore.nodeActions.copy",
  "explore.nodeActions.close",
  "explore.nodeActions.primary",
  "explore.nodeActions.orbit",
  "explore.nodeActions.orbitSub",
  "explore.nodeActions.expedition",
  "explore.nodeActions.expeditionSub",
  "explore.nodeActions.expeditionLocked",
  "explore.nodeActions.standoff",
  "explore.nodeActions.standoffSub",
  "explore.nodeActions.standoffLocked"
];
for (const key of nodeActionKeys) {
  assert.ok(STRINGS[key], `missing ${key}`);
  for (const language of ["tc", "sc", "en", "jp"]) {
    assert.equal(typeof STRINGS[key][language], "string", `${key}.${language}`);
    assert.ok(STRINGS[key][language].trim(), `${key}.${language} empty`);
  }
}
ok("Action Sheet chrome is complete in tc/sc/en/jp");

const pageRouterSource = fs.readFileSync(
  path.join(repoRoot, "src/ui/pageRouter.js"),
  "utf8"
);
const pageCssSource = fs.readFileSync(
  path.join(repoRoot, "styles/page-content.css"),
  "utf8"
);

assert.match(pageRouterSource, /data-page-action="open-map"/);
assert.match(pageRouterSource, /data-page-action="open-node-actions"/);
assert.match(pageRouterSource, /data-page-action="choose-node-mode"/);
assert.match(pageRouterSource, /role="dialog"/);
assert.match(pageRouterSource, /aria-modal="true"/);
assert.match(pageRouterSource, /event\.key === "Escape"/);
assert.match(pageRouterSource, /event\.key === "Tab"/);
assert.match(pageCssSource, /\.explore-node-actions-backdrop/);
assert.match(pageCssSource, /\.explore-node-action:disabled/);
ok("Explore keeps the map gate while adding an accessible, mobile-contained mode sheet");

console.log("\nAll Orbit node Action Sheet cases passed.");
