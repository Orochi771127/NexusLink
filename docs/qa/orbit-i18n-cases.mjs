/**
 * PACK R5 — Orbit chrome i18n keys exist in tc/sc/en/jp.
 * Run: node docs/qa/orbit-i18n-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const { STRINGS } = await import(
  pathToFileURL(path.join(repoRoot, "src/i18n/strings.js")).href
);

const keys = [
  "explore.openOrbit",
  "orbit.dialogLabel",
  "orbit.kicker",
  "orbit.hint",
  "orbit.retreat",
  "orbit.toMap",
  "orbit.again",
  "orbit.mapKicker",
  "orbit.mapTitle",
  "orbit.mapNodesSuffix",
  "orbit.duelOpen",
  "orbit.closeExplore",
  "orbit.duelKicker",
  "orbit.statImpact",
  "orbit.statSpin",
  "orbit.statGuard",
  "orbit.statBurst",
  "orbit.statOverheat",
  "orbit.pathLit",
  "orbit.mapLooking"
];

const langs = ["tc", "sc", "en", "jp"];

for (const key of keys) {
  const entry = STRINGS[key];
  assert.ok(entry, `missing string key ${key}`);
  for (const lang of langs) {
    assert.equal(typeof entry[lang], "string", `${key}.${lang}`);
    assert.ok(entry[lang].trim().length > 0, `${key}.${lang} empty`);
  }
  console.log(`PASS  ${key} has tc/sc/en/jp`);
}

console.log("\nAll orbit i18n cases passed.");
