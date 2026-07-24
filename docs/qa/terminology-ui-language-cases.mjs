/**
 * Pack 5 — Player-facing terminology / anti-clinical-claim scan.
 * Run: node docs/qa/terminology-ui-language-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

function ok(name) {
  console.log(`PASS  ${name}`);
}

// 玩家可見宣稱禁區（刻意不掃內部註解檔裡的「禁止診斷」說明本身以外的產品宣稱）。
const BANNED_CLAIM_RE = /治療性依附|療癒玩家|啟動催產素|改善依附|降低孤獨|臨床效果|心理治療|你有憂鬱|你焦慮症/;

const PLAYER_FACING_FILES = [
  "src/i18n/strings.js",
  "src/data/companionRegistry.js",
  "src/ui/codexController.js",
  "src/data/heartsparkCouncilCanon.js"
];

for (const relative of PLAYER_FACING_FILES) {
  const full = path.join(repoRoot, relative);
  const text = fs.readFileSync(full, "utf8");
  const hit = text.match(BANNED_CLAIM_RE);
  assert.equal(hit, null, `${relative} still contains banned claim: ${hit?.[0]}`);
}
ok("player-facing files have no banned clinical claims");

const registry = await import(pathToFileURL(path.join(repoRoot, "src/data/companionRegistry.js")).href);
const soothers = registry.COMPANIONS.filter((c) => c.battleRole?.zh === "安撫者");
assert.ok(soothers.length >= 2, "expected vine-twist + sprigfawn soother roles");
assert.equal(
  registry.COMPANIONS.some((c) => c.battleRole?.zh === "療癒者"),
  false
);
assert.equal(
  registry.COMPANIONS.some((c) => /牠的療癒/.test(c.description || "")),
  false
);
ok("companion battleRole / description use safe wording");

const codexText = fs.readFileSync(path.join(repoRoot, "src/ui/codexController.js"), "utf8");
assert.match(codexText, /label:\s*"安撫"/);
assert.doesNotMatch(codexText, /label:\s*"治癒"/);
ok("codex radar axis label is 安撫");

const strings = fs.readFileSync(path.join(repoRoot, "src/i18n/strings.js"), "utf8");
assert.doesNotMatch(strings, /治療|療癒|診斷|臨床|治癒/);
ok("i18n strings.js free of clinical/healing claim words");

console.log("\nAll terminology UI language cases passed.");
