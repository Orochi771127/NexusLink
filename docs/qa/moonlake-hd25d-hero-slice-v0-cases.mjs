/**
 * TP-MOONLAKE-HD25D-HERO-SLICE-V0
 *
 * Verifies the Moonlake HD-2.5D Hero Slice v0 candidate is correctly declared,
 * feature-gated, NOT promoted to shipping default, and that the declared asset
 * fingerprint matches the file actually on disk.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import {
  MOONLAKE_HD25D_HERO_SLICE_CANDIDATE,
  MOONLAKE_VISIBLE_GLB_CANDIDATE,
  MOONLAKE_COMPANION_DIRECTION_SHEETS,
  MOONLAKE_WORLD_WAYPOINTS
} from "../../src/three/moonlakeLive3dConfig.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const candidate = MOONLAKE_HD25D_HERO_SLICE_CANDIDATE;

// ---- 1. never silently promoted
assert.equal(candidate.shippingDefault, false, "hero slice must not be shipping default");
assert.equal(MOONLAKE_VISIBLE_GLB_CANDIDATE.shippingDefault, false, "r4-0 must stay non-default");

// ---- 2. shares one gate, distinct value, does not collide with r4-0
assert.equal(candidate.queryParam, MOONLAKE_VISIBLE_GLB_CANDIDATE.queryParam);
assert.equal(candidate.queryValue, "2");
assert.notEqual(candidate.queryValue, MOONLAKE_VISIBLE_GLB_CANDIDATE.queryValue);

// ---- 3. camera profile is a fixed, portrait-safe three-quarter rig
assert.ok(candidate.camera.pitchDeg >= 30 && candidate.camera.pitchDeg <= 45,
  "pitch must sit in the approved 30-45 deg band");
assert.equal(candidate.camera.yawDeg, 0, "hero yaw is controlled");
assert.ok(candidate.camera.fov > 0 && candidate.camera.fov <= 36, "low-FOV diorama framing");
assert.equal(candidate.camera.portraitSafeAspect, "9:16");
assert.equal(candidate.camera.freeCameraAllowed, false, "no free-camera dependency");

// ---- 4. runtime keeps ownership of animated water / sky
assert.deepEqual([...candidate.hiddenMeshTokens], ["backdrop", "water"]);
assert.equal(candidate.preserveAuthoredMaterials, true);

// ---- 5. declared asset fingerprint matches the file on disk
const glbPath = resolve(repoRoot, candidate.asset.glb.replace(/^\.\//, ""));
const bytes = readFileSync(glbPath);
const sha = createHash("sha256").update(bytes).digest("hex").toUpperCase();
assert.equal(statSync(glbPath).size, candidate.asset.bytes, "declared byte count must match disk");
assert.equal(sha, candidate.asset.sha256, "declared SHA-256 must match disk");

// ---- 6. it must actually be lighter than the r4-0 baseline (no unevidenced claims)
assert.ok(candidate.asset.bytes < 3_098_820, "hero slice must not regress payload vs r4-0");
assert.ok(candidate.asset.triangles < 66_726, "hero slice must not regress triangles vs r4-0");

// ---- 7. only approved direction sheets, all four present, none invented
const dirs = Object.keys(MOONLAKE_COMPANION_DIRECTION_SHEETS.directions);
assert.deepEqual(dirs.sort(), ["back", "front", "left", "right"]);
assert.equal(MOONLAKE_COMPANION_DIRECTION_SHEETS.columns * MOONLAKE_COMPANION_DIRECTION_SHEETS.rows,
  MOONLAKE_COMPANION_DIRECTION_SHEETS.frames, "grid must account for every declared frame");
for (const [name, rel] of Object.entries(MOONLAKE_COMPANION_DIRECTION_SHEETS.directions)) {
  const p = resolve(repoRoot, rel.replace(/^\.\//, ""));
  assert.ok(statSync(p).size > 0, `approved sheet missing on disk: ${name}`);
}

// ---- 8. the shared world waypoints the hero camera frames still exist
for (const key of ["platform_center", "bridge_near", "bridge_mid", "bridge_far"]) {
  assert.ok(MOONLAKE_WORLD_WAYPOINTS[key], `missing waypoint ${key}`);
}

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-HD25D-HERO-SLICE-V0",
  shippingDefault: candidate.shippingDefault,
  gate: `${candidate.queryParam}=${candidate.queryValue}`,
  assetBytes: candidate.asset.bytes,
  assetSha256: candidate.asset.sha256,
  triangles: candidate.asset.triangles,
  baselineBytes: 3_098_820,
  baselineTriangles: 66_726,
  bytesDelta: candidate.asset.bytes - 3_098_820,
  trianglesDelta: candidate.asset.triangles - 66_726,
  camera: {
    pitchDeg: candidate.camera.pitchDeg,
    yawDeg: candidate.camera.yawDeg,
    fov: candidate.camera.fov
  },
  approvedDirections: dirs.length
}, null, 2));
