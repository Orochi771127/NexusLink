/**
 * PACK R5 — Orbit regression runner（平行於 web-release-gate 的最小自動檢查）
 * Run: node docs/qa/orbit-regression-cases.mjs
 *
 * 依序跑 R1–R5 harness；任一失敗則 exit 1。
 */

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const harnesses = [
  "orbit-battle-prototype-cases.mjs",
  "orbit-stage-cases.mjs",
  "orbit-duel-cases.mjs",
  "orbit-settlement-cases.mjs",
  "orbit-feel-cases.mjs",
  "orbit-i18n-cases.mjs"
];

let failed = 0;
for (const name of harnesses) {
  const file = path.join(__dirname, name);
  console.log(`\n── ${name} ──`);
  const result = spawnSync(process.execPath, [file], {
    encoding: "utf8",
    cwd: path.resolve(__dirname, "../..")
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) {
    console.error(`FAIL  ${name} (exit ${result.status})`);
    failed += 1;
  } else {
    console.log(`OK    ${name}`);
  }
}

if (failed > 0) {
  console.error(`\nOrbit regression: ${failed} harness(es) failed.`);
  process.exit(1);
}

console.log("\nAll orbit regression harnesses passed.");
