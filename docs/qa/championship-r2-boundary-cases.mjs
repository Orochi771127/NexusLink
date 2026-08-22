import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const acceptedBase = process.env.CHAMPIONSHIP_R2_BASE_REF || "3264be80f76547fd05ef8dd622e94700fdb2206b";
const allowedAddedPath = /^(docs\/design\/CHAMPIONSHIP_[A-Z0-9_]+_R2\.md|docs\/qa\/(?:championship-r2-[a-z0-9-]+-cases\.mjs|CHAMPIONSHIP_R2_[A-Z0-9_]+\.md|_run_championship-r2-browser-gate\.py)|research\/championship-r2\/|src\/championship\/(?:field|kernel|modes|presentation\/r2|raising|r2)\/|src\/data\/championship\/r2\/)/;

function gitLines(args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
}

function collectChanges() {
  const tracked = gitLines(["diff", "--name-status", "--no-renames", acceptedBase]).map((line) => {
    const [status, file] = line.split("\t");
    return { status, file: file.replaceAll("\\", "/") };
  });
  const untracked = gitLines(["ls-files", "--others", "--exclude-standard"]).map((file) => ({ status: "A", file: file.replaceAll("\\", "/") }));
  return [...tracked, ...untracked];
}

function walk(relativeRoot) {
  const absoluteRoot = path.join(repoRoot, relativeRoot);
  if (!fs.existsSync(absoluteRoot)) return [];
  const output = [];
  for (const entry of fs.readdirSync(absoluteRoot, { withFileTypes: true })) {
    const relative = path.join(relativeRoot, entry.name);
    if (entry.isDirectory()) output.push(...walk(relative));
    else output.push({ relative: relative.replaceAll("\\", "/"), text: fs.readFileSync(path.join(repoRoot, relative), "utf8") });
  }
  return output;
}

test("R2 candidate changes stay inside the authorized additive tree", () => {
  const changes = collectChanges();
  assert.ok(changes.length > 0);
  for (const entry of changes) {
    if (entry.file === "docs/agent/AI_EXECUTION_LEDGER.md") {
      assert.ok(["M", "A"].includes(entry.status), `unexpected ledger status: ${entry.status}`);
      continue;
    }
    assert.equal(entry.status, "A", `R2 must not mutate an existing tracked file: ${entry.status} ${entry.file}`);
    assert.match(entry.file, allowedAddedPath, `R2 file is outside the authorized tree: ${entry.file}`);
  }
});

test("R2 runtime has no production persistence, network, protected-domain, or ROM payload authority", () => {
  const files = [
    ...walk("src/championship/field"),
    ...walk("src/championship/kernel"),
    ...walk("src/championship/modes"),
    ...walk("src/championship/presentation/r2"),
    ...walk("src/championship/raising"),
    ...walk("src/championship/r2"),
    ...walk("src/data/championship/r2")
  ];
  const forbidden = [
    /\bsaveState\b/, /\bsaveQueue\b/, /localStorage\s*\./, /sessionStorage\s*\./,
    /indexedDB\s*\./, /\bfetch\s*\(/, /XMLHttpRequest/, /sendBeacon/, /serviceWorker/,
    /raphaelCore/i, /standoff/i, /heartcoreOrbit/i, /\.nds\b/i, /privateforensics/i
  ];
  for (const file of files) {
    for (const pattern of forbidden) assert.doesNotMatch(file.text, pattern, `${file.relative} violates ${pattern}`);
  }
});

test("production groundwork files remain byte-identical to the accepted R1 candidate", () => {
  const protectedPaths = [
    "index.html", "src/app.js", "src/ui/pageRouter.js", "src/state/saveManager.js",
    "src/state/store.js", "src/state/defaultState.js", "src/pixi/pixiApp.js",
    "assets", "scripts", "tools"
  ];
  const changed = new Set(gitLines(["diff", "--name-only", acceptedBase]).map((file) => file.replaceAll("\\", "/")));
  for (const protectedPath of protectedPaths) {
    assert.equal([...changed].some((file) => file === protectedPath || file.startsWith(`${protectedPath}/`)), false, `protected path changed: ${protectedPath}`);
  }
});

test("R2 public artifacts include no binary game payload", () => {
  const added = collectChanges().map((entry) => entry.file);
  for (const file of added) assert.doesNotMatch(file, /\.(?:nds|bin|dat|col|esc|nbs|opm|bsa)$/i);
});
