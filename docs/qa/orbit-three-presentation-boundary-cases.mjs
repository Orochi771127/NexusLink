import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getThreeSceneProfile } from "../../src/data/threeSceneProfiles.js";

const sceneUrl = new URL("../../src/three/orbitTopPilotScene.js", import.meta.url);
const sceneSource = await readFile(sceneUrl, "utf8");
const profile = getThreeSceneProfile("orbit-top-pilot");

assert.ok(profile, "Orbit Three presentation profile must be registered");
assert.equal(profile.mode, "approved-live-pilot");
assert.equal(profile.enableByDefault, true);
assert.equal(profile.authority, "snapshot-only");
assert.equal(profile.fallback, "orbit-canvas");
assert.equal(profile.enableQuery, "orbit3dPilot");
assert.equal(profile.candidateQuery, "orbit3dCandidate");

assert.match(sceneSource, /const \[THREE, \{ GLTFLoader \}\]/,
  "Three ESM must be consumed as a namespace module");
assert.doesNotMatch(sceneSource, /default\s*:\s*THREE/,
  "Three ESM has no default export");
assert.match(sceneSource, /update\(snapshot\)/,
  "presentation layer must consume immutable runtime snapshots");
assert.match(sceneSource, /authority:\s*"snapshot-only"/,
  "diagnostics must expose presentation-only authority");
assert.match(sceneSource, /webglcontextlost/,
  "WebGL context loss must activate the fallback boundary");
assert.match(sceneSource, /enableQueryValue === "0"/,
  "the approved live Pilot must retain an explicit Canvas fallback switch");

for (const forbidden of [
  "saveManager",
  "defaultState",
  "../state/store",
  "orbitPhysics",
  "battleEngine",
  "RaphaelCore",
  "localStorage"
]) {
  assert.equal(sceneSource.includes(forbidden), false,
    `presentation scene must not import or own ${forbidden}`);
}

console.log("PASS orbit-three-presentation-boundary-cases");
