/**
 * Pack 2.5 — Mirror misuse guardrail cases.
 * Run: node docs/qa/mirror-misuse-guardrail-cases.mjs
 *
 * Static + runtime checks so Companion A’s top-level bond cannot silently
 * become the authority for Companion B judgments again.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  JUDGMENT_GUARDED_RELATIVE_PATHS,
  CHAPTER_MARK_GUARDED_RELATIVE_PATH,
  ACTIVE_MIRROR_ALLOWLIST_RELATIVE_PATHS,
  MIRROR_MISUSE_RULE,
  resolveRelationshipForJudgment,
  diagnoseActiveMirrorJudgmentRisk
} = await import(
  pathToFileURL(path.join(repoRoot, "src/state/relationshipAuthorityGuard.js")).href
);

const {
  resolveRelationshipForCompanion,
  createDefaultCompanionStates,
  createDefaultRelationshipState,
  createDefaultGrowthState,
  COMPANION_STATE_SCHEMA_VERSION
} = await import(
  pathToFileURL(path.join(repoRoot, "src/state/companionStateSchema.js")).href
);

const { evaluateResonanceInvite, getChapterCompanionId } = await import(
  pathToFileURL(path.join(repoRoot, "src/engine/resonanceInviteEngine.js")).href
);

function ok(name) {
  console.log(`PASS  ${name}`);
}

function stripJsComments(source) {
  return String(source || "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function readRepo(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

// --- Static: guarded judgment modules must not read top-level bond/trust ---
const TOP_LEVEL_AFFINITY_RE = /\bstate\.(bond|trust|blockedTouchCount)\b/;

for (const relative of JUDGMENT_GUARDED_RELATIVE_PATHS) {
  const code = stripJsComments(readRepo(relative));
  assert.equal(
    TOP_LEVEL_AFFINITY_RE.test(code),
    false,
    `${relative} must not read state.bond/trust/blockedTouchCount for judgments`
  );
  if (relative.endsWith("resonanceInviteEngine.js")) {
    assert.match(
      code,
      /resolveRelationshipFor(?:Judgment|Companion)/,
      `${relative} must call relationship authority helper`
    );
  }
  ok(`guarded static clean: ${relative}`);
}

// --- Static: chapter-mark writer must use snapshot helper, not draft.bond ---
{
  const relative = CHAPTER_MARK_GUARDED_RELATIVE_PATH;
  const code = stripJsComments(readRepo(relative));
  assert.match(code, /buildRelationshipChapterMarkSnapshot/);
  assert.match(code, /ensureCompanionRelationshipInDraft/);
  assert.equal(
    /bondAtStart\s*:\s*(?:Number\()?draft\.bond\b/.test(code),
    false,
    `${relative} must not snapshot bondAtStart from draft.bond`
  );
  assert.equal(
    /trustAtStart\s*:\s*(?:Number\()?draft\.trust\b/.test(code),
    false,
    `${relative} must not snapshot trustAtStart from draft.trust`
  );
  ok(`chapter-mark path uses helpers: ${relative}`);
}

// --- Static: allowlist files still exist (documentation anchor) ---
for (const relative of ACTIVE_MIRROR_ALLOWLIST_RELATIVE_PATHS) {
  assert.ok(fs.existsSync(path.join(repoRoot, relative)), `missing allowlist file ${relative}`);
}
ok(`active-mirror allowlist paths exist (${ACTIVE_MIRROR_ALLOWLIST_RELATIVE_PATHS.length})`);

assert.match(MIRROR_MISUSE_RULE.summary, /resolveRelationshipForCompanion/);
ok("rule constant present");

// --- Runtime: judgment alias matches schema helper ---
{
  const state = {
    activeCompanionId: "greyshade-cat",
    bond: 90,
    trust: 90,
    companionStates: {
      version: COMPANION_STATE_SCHEMA_VERSION,
      byId: {
        "greyshade-cat": {
          relationship: createDefaultRelationshipState({ bond: 90, trust: 90 }),
          growth: createDefaultGrowthState({ companionId: "greyshade-cat" })
        },
        "blazetail-kit": {
          relationship: createDefaultRelationshipState({ bond: 1, trust: 1 }),
          growth: createDefaultGrowthState({ companionId: "blazetail-kit" })
        }
      }
    }
  };
  const viaAlias = resolveRelationshipForJudgment(state, "blazetail-kit");
  const viaSchema = resolveRelationshipForCompanion(state, "blazetail-kit");
  assert.equal(viaAlias.bond, 1);
  assert.equal(viaSchema.bond, 1);
  assert.equal(viaAlias.bond, viaSchema.bond);
  ok("resolveRelationshipForJudgment matches schema helper");
}

// --- Runtime: diagnose risk only for non-active targets ---
assert.equal(
  diagnoseActiveMirrorJudgmentRisk({ activeCompanionId: "greyshade-cat" }, "greyshade-cat"),
  null
);
assert.match(
  diagnoseActiveMirrorJudgmentRisk({ activeCompanionId: "greyshade-cat" }, "blazetail-kit"),
  /Pack2\.5 risk/
);
ok("diagnoseActiveMirrorJudgmentRisk");

// --- Runtime regression: high active A must not unlock low target B invite ---
{
  const chapterNo = 5;
  const targetId = getChapterCompanionId(chapterNo);
  assert.ok(targetId);
  const state = {
    activeCompanionId: "greyshade-cat",
    bond: 99,
    trust: 99,
    companionStates: createDefaultCompanionStates("greyshade-cat"),
    chapterProgress: { current: chapterNo + 1, completed: [chapterNo] },
    resonance: {
      companions: { [targetId]: { metAt: 1 } },
      chapterMarks: {
        [chapterNo]: {
          resolvedCompanionId: targetId,
          bondAtStart: 0,
          trustAtStart: 0,
          blockedTouchAtStart: 0,
          overwhelmedCount: 0
        }
      }
    }
  };
  // Ensure target byId is low
  state.companionStates = {
    version: COMPANION_STATE_SCHEMA_VERSION,
    byId: {
      ...state.companionStates.byId,
      [targetId]: {
        relationship: createDefaultRelationshipState({ bond: 0, trust: 0 }),
        growth: createDefaultGrowthState({ companionId: targetId })
      }
    }
  };
  const invite = evaluateResonanceInvite(state, chapterNo);
  assert.equal(invite.companionId, targetId);
  assert.equal(invite.willing, false);
  assert.equal(invite.cause, "early");
  ok("invite still refuses when only active mirror is high");
}

console.log("\nAll mirror misuse guardrail cases passed.");
