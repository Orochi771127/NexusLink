import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const allowedNewPath = /^(docs\/design\/CHAMPIONSHIP_|docs\/qa\/(?:championship-r1-|CHAMPIONSHIP_R1_MANUAL_MATRIX|_run_championship-r1-browser-gate)|research\/championship-r1\/|src\/championship\/|src\/data\/championship\/)/;
const acceptedBaseRef = process.env.CHAMPIONSHIP_BASE_REF || "origin/main";

function gitLines(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
}

function nameStatusEntries(args) {
  return gitLines(["diff", "--name-status", "--no-renames", ...args]).map((line) => {
    const [status, ...pathParts] = line.split("\t");
    return { status, file: pathParts.at(-1).replaceAll("\\", "/") };
  });
}

function collectGateChanges() {
  return [
    ...nameStatusEntries([`${acceptedBaseRef}...HEAD`]),
    ...nameStatusEntries(["--cached"]),
    ...nameStatusEntries([]),
    ...gitLines(["ls-files", "--others", "--exclude-standard"]).map((file) => ({ status: "A", file: file.replaceAll("\\", "/") }))
  ];
}

function walkFiles(root) {
  const output = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) output.push(...walkFiles(full));
    else output.push(full);
  }
  return output;
}

function readTree(relativeRoot) {
  return walkFiles(path.join(repoRoot, relativeRoot)).map((file) => ({
    file,
    relative: path.relative(repoRoot, file).replaceAll("\\", "/"),
    text: fs.readFileSync(file, "utf8")
  }));
}

test("Phase 1 changes are new-file-only and remain inside Owner Gate paths", () => {
  const changes = collectGateChanges();
  assert.ok(changes.length > 0, "candidate must contain a Phase 1 change set");
  for (const { status, file } of changes) {
    assert.equal(status, "A", `existing tracked file changed or candidate file was deleted: ${status} ${file}`);
    assert.match(file, allowedNewPath, `out-of-scope file: ${file}`);
  }
});

test("Championship source has no save, root-store, cloud, network, or protected-domain authority", () => {
  const source = [...readTree("src/championship"), ...readTree("src/data/championship")];
  const forbidden = [
    /\bsaveState\b/, /\bsaveQueue\b/, /localStorage\s*\./, /sessionStorage\s*\./,
    /indexedDB\s*\./, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /serviceWorker/, /SyncManager/,
    /standoff/i, /heartcoreOrbit/i, /orbitController/i, /raphaelCore/i
  ];
  for (const { relative, text } of source) {
    for (const pattern of forbidden) assert.doesNotMatch(text, pattern, `${relative} violates ${pattern}`);
  }
  const presenter = fs.readFileSync(path.join(repoRoot, "src/championship/presentation/createChampionshipPixiPresenter.js"), "utf8");
  assert.doesNotMatch(presenter, /new\s+PIXI\.Application/);
  assert.doesNotMatch(presenter, /ticker\s*\./i);
});

test("standalone flag check precedes all conditional module imports", () => {
  const entry = fs.readFileSync(path.join(repoRoot, "research/championship-r1/entry.js"), "utf8");
  const flagBranch = entry.indexOf("if (!enabled)");
  const bootCall = entry.indexOf("bootChampionshipResearch().catch");
  const loadStateImport = entry.indexOf('import("../../src/state/saveManager.js")');
  assert.ok(flagBranch >= 0 && bootCall > flagBranch && loadStateImport > bootCall);
  assert.match(entry, /const \[\s*\{ loadState \}/);
  assert.match(entry, /PIXI_CDN_INTEGRITY\s*=\s*"sha384-[A-Za-z0-9+/=]+"/);
  assert.match(entry, /if \(window\.PIXI\) return Promise\.reject/);
  assert.match(entry, /script\.integrity\s*=\s*PIXI_CDN_INTEGRITY/);
  assert.doesNotMatch(entry, /\bsaveState\b|localStorage\s*\.|sessionStorage\s*\.|indexedDB\s*\.|\bfetch\s*\(/);
});

test("public files contain no ROM payload path or disallowed binary asset", () => {
  const publicFiles = [
    ...readTree("src/championship"), ...readTree("src/data/championship"),
    ...readTree("research/championship-r1")
  ];
  const forbiddenExtensions = /\.(?:nds|srl|bin|nanr|ncer|ncgr|nclr|nscr|nxr|wav|mp3|ogg|png|jpg|gif)\b/i;
  for (const { relative, text } of publicFiles) {
    if (relative !== "src/data/championship/validation/validateChampionshipRecord.js") {
      assert.doesNotMatch(text, /(?<![A-Za-z])[A-Za-z]:[\\/]/, `${relative} leaks a drive-letter path`);
      assert.doesNotMatch(text, /file:\/\//i, `${relative} leaks a file URL`);
      assert.doesNotMatch(text, /<PRIVATE_RE_ROOT>/, `${relative} leaks private-root notation`);
    }
    assert.doesNotMatch(text, forbiddenExtensions, `${relative} references a forbidden payload type`);
  }
});

test("production navigation and protected runtime files are unchanged", () => {
  const protectedPath = /^(src\/app\.js|index\.html|src\/(?:state|standoff|orbit|raphael)(?:\/|$))/;
  assert.deepEqual(collectGateChanges().filter(({ file }) => protectedPath.test(file)), []);
});
