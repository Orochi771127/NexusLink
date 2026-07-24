/**
 * Pack 4 — Dynamic chapter encounter resolver cases.
 * Run: node docs/qa/chapter-encounter-resolver-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  resolveChapterEncounter,
  listChapterEncounterCandidates,
  collectKnownCompanionIds,
  isCompanionAlreadyKnown
} = await import(pathToFileURL(path.join(repoRoot, "src/engine/chapterEncounterResolver.js")).href);

const {
  getChapterCompanionId,
  canAskResonance,
  evaluateResonanceInvite
} = await import(pathToFileURL(path.join(repoRoot, "src/engine/resonanceInviteEngine.js")).href);

const {
  createDefaultCompanionStates,
  createDefaultRelationshipState,
  createDefaultGrowthState,
  ensureCompanionRelationshipInDraft,
  COMPANION_STATE_SCHEMA_VERSION
} = await import(pathToFileURL(path.join(repoRoot, "src/state/companionStateSchema.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

// Preferred first for chapter 5
assert.equal(listChapterEncounterCandidates(5)[0], "blazetail-kit");
assert.ok(listChapterEncounterCandidates(5).includes("sprigfawn"));
assert.deepEqual(listChapterEncounterCandidates(7), []);
ok("candidate lists");

const fresh = {
  activeCompanionId: "greyshade-cat",
  unlockedCompanionIds: ["greyshade-cat"],
  resonance: { companions: {}, chapterMarks: {} }
};
const meet5 = resolveChapterEncounter(fresh, 5);
assert.equal(meet5.kind, "meet");
assert.equal(meet5.companionId, "blazetail-kit");
assert.equal(meet5.usedAlternate, false);
ok("fresh player meets preferred chapter companion");

const firstBondBlaze = {
  activeCompanionId: "blazetail-kit",
  unlockedCompanionIds: ["blazetail-kit"],
  resonance: { companions: {}, chapterMarks: {} }
};
const alt5 = resolveChapterEncounter(firstBondBlaze, 5);
assert.equal(alt5.kind, "meet");
assert.notEqual(alt5.companionId, "blazetail-kit");
assert.equal(alt5.usedAlternate, true);
assert.equal(isCompanionAlreadyKnown(firstBondBlaze, "blazetail-kit"), true);
ok("first-bond preferred → alternate meet");

const allKnown = {
  activeCompanionId: "greyshade-cat",
  unlockedCompanionIds: [
    "greyshade-cat",
    "sprigfawn",
    "starstripe-cub",
    "auriowl",
    "blazetail-kit",
    "crystalfin-seahorse"
  ],
  resonance: { companions: {}, chapterMarks: {} }
};
assert.equal(collectKnownCompanionIds(allKnown).size, 6);
const fallback = resolveChapterEncounter(allKnown, 5);
assert.equal(fallback.kind, "fallback");
assert.ok(fallback.eventId);
assert.ok(fallback.lines?.length >= 2);
ok("all known → fallback event");

const already = {
  ...fresh,
  resonance: {
    companions: { "blazetail-kit": { metAt: 1 } },
    chapterMarks: {
      5: { resolvedCompanionId: "blazetail-kit", bondAtStart: 0, trustAtStart: 0 }
    }
  }
};
assert.equal(resolveChapterEncounter(already, 5).kind, "already_met");
assert.equal(resolveChapterEncounter({
  ...fresh,
  resonance: {
    companions: {},
    chapterMarks: { 5: { fallbackEventId: "chapter_5_quiet_echo" } }
  }
}, 5).kind, "already_fallback");
ok("idempotent already_met / already_fallback");

assert.equal(getChapterCompanionId(5), "blazetail-kit");
assert.equal(getChapterCompanionId(5, already), "blazetail-kit");
assert.equal(getChapterCompanionId(5, {
  resonance: { chapterMarks: { 5: { fallbackEventId: "x" } } }
}), null);
ok("getChapterCompanionId respects resolved / fallback");

const draft = {
  activeCompanionId: "greyshade-cat",
  companionStates: createDefaultCompanionStates("greyshade-cat")
};
assert.equal(ensureCompanionRelationshipInDraft(draft, "auriowl", 99), true);
assert.ok(draft.companionStates.byId.auriowl.relationship);
assert.equal(draft.companionStates.byId.auriowl.relationship.bond, 0);
assert.equal(draft.companionStates.byId["greyshade-cat"].relationship.bond, 0);
// Second call is no-op
assert.equal(ensureCompanionRelationshipInDraft(draft, "auriowl", 100), false);
ok("ensureCompanionRelationshipInDraft baseline only");

const inviteState = {
  activeCompanionId: "greyshade-cat",
  bond: 80,
  trust: 80,
  companionStates: {
    version: COMPANION_STATE_SCHEMA_VERSION,
    byId: {
      "greyshade-cat": {
        companionId: "greyshade-cat",
        relationship: createDefaultRelationshipState({ bond: 80, trust: 80 }),
        growth: createDefaultGrowthState({ companionId: "greyshade-cat" }),
        updatedAt: 1
      },
      "sprigfawn": {
        companionId: "sprigfawn",
        relationship: createDefaultRelationshipState({ bond: 2, trust: 2 }),
        growth: createDefaultGrowthState({ companionId: "sprigfawn" }),
        updatedAt: 1
      }
    }
  },
  chapterProgress: { current: 3, completed: [2] },
  resonance: {
    companions: { sprigfawn: { metAt: 1 } },
    chapterMarks: {
      2: {
        resolvedCompanionId: "sprigfawn",
        bondAtStart: 0,
        trustAtStart: 0,
        blockedTouchAtStart: 0,
        overwhelmedCount: 0
      }
    }
  }
};
assert.equal(canAskResonance(inviteState, 2).eligible, true);
assert.equal(canAskResonance(inviteState, 2).companionId, "sprigfawn");
const invite = evaluateResonanceInvite(inviteState, 2);
assert.equal(invite.companionId, "sprigfawn");
assert.equal(invite.willing, false);
assert.equal(invite.cause, "early");
ok("invite uses resolved companion relationship");

console.log("\nAll chapter encounter resolver cases passed.");
