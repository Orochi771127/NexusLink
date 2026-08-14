/**
 * First Touch State Projection R1 deterministic source-contract checks.
 * Run: node docs/qa/first-touch-state-projection-r1-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
const passed = [];

function check(name, assertion) {
  assertion();
  passed.push(name);
  console.log(`PASS  ${name}`);
}

const hintSource = read("src/ui/interactionHintController.js");
const appSource = read("src/app.js");
const hintCss = read("styles/ui-v3-onboarding.css");

check("first-touch completion remains the permanent stop condition", () => {
  assert.match(hintSource, /if \(state\.firstTouchCompleted\) return false/);
});

check("the affordance is limited to the Home habitat", () => {
  assert.match(hintSource, /isHomeActive/);
  assert.match(hintSource, /!isHomeActive\(\)/);
  assert.match(appSource, /pageRouter\?\.getActivePage\?\.\(\) === "home"/);
});

check("the first-session presentation owns input until it leaves", () => {
  assert.match(hintSource, /isPresentationActive/);
  assert.match(appSource, /dataset\.firstSessionLoader !== "complete"/);
  assert.match(hintSource, /data-first-session-loader/);
});

check("page and panel projection is event-driven", () => {
  assert.match(hintSource, /new MutationObserver\(render\)/);
  assert.match(hintSource, /attributeFilter:\s*\["class", "data-first-session-loader"\]/);
  const trackingBody = hintSource.match(/const track = \(\) => \{([\s\S]*?)\n\s*\};/)?.[1] || "";
  assert.doesNotMatch(trackingBody, /shouldShow|store\.getState|isPanelOpen|isHomeActive/);
});

check("renderer coordinates are projected into the DOM viewport", () => {
  assert.match(appSource, /canvas\?\.getBoundingClientRect\?\.\(\)/);
  assert.match(appSource, /canvasBounds\.left \+ \(x \+ width \/ 2\) \* scaleX/);
  assert.match(appSource, /canvasBounds\.top \+ \(y \+ height \/ 2\) \* scaleY/);
  assert.match(appSource, /viewportWidth = width \* scaleX/);
  assert.match(appSource, /viewportHeight = height \* scaleY/);
});

check("hidden surfaces cannot intercept input", () => {
  assert.match(hintCss, /\.touch-affordance\s*\{[\s\S]*?pointer-events:\s*none/);
  assert.match(hintCss, /\.touch-affordance\.is-visible\s*\{[\s\S]*?pointer-events:\s*auto/);
});

check("reduced motion keeps a static equivalent cue", () => {
  assert.match(hintSource, /is-lowmotion/);
  assert.match(hintCss, /\.touch-affordance\.is-lowmotion/);
  assert.match(hintCss, /animation:\s*none/);
});

console.log(`\nAll ${passed.length} First Touch State Projection R1 cases passed.`);
