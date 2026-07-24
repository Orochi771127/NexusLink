/**
 * Pack 2 — Resonance invite relationship authority cases.
 * Run: node docs/qa/resonance-invite-authority-cases.mjs
 *
 * Proves Companion A bond/trust cannot unlock Companion B invites when
 * companionStates.byId is present.
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  evaluateResonanceInvite,
  canAskResonance,
  getChapterCompanionId
} = await import(pathToFileURL(path.join(repoRoot, "src/engine/resonanceInviteEngine.js")).href);

const {
  createDefaultCompanionStates,
  createDefaultRelationshipState,
  createDefaultGrowthState,
  buildRelationshipChapterMarkSnapshot,
  COMPANION_STATE_SCHEMA_VERSION
} = await import(pathToFileURL(path.join(repoRoot, "src/state/companionStateSchema.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

function makeRecord(companionId, relationship) {
  return {
    companionId,
    relationship: createDefaultRelationshipState(relationship),
    growth: createDefaultGrowthState({ companionId }),
    updatedAt: Date.now()
  };
}

function buildByIdState({
  activeId,
  chapterNo,
  activeRel,
  targetRel,
  mark,
  completed = true
} = {}) {
  const targetId = getChapterCompanionId(chapterNo);
  assert.ok(targetId, `chapter ${chapterNo} must have companionId`);

  const companionStates = {
    version: COMPANION_STATE_SCHEMA_VERSION,
    byId: {
      [activeId]: makeRecord(activeId, activeRel),
      [targetId]: makeRecord(targetId, targetRel)
    }
  };

  return {
    activeCompanionId: activeId,
    bond: activeRel.bond,
    trust: activeRel.trust,
    blockedTouchCount: activeRel.blockedTouchCount || 0,
    companionStates,
    chapterProgress: {
      current: chapterNo + 1,
      completed: completed ? [chapterNo] : []
    },
    resonance: {
      companions: {
        [targetId]: { metAt: 1, joinedAt: null }
      },
      chapterMarks: {
        [chapterNo]: mark
      }
    }
  };
}

const cases = [];

cases.push(() => {
  // Chapter 5 target = blazetail-kit (registry). Active greyshade has huge affinity
  // over a polluted mark baseline, but blazetail relationship is still baseline.
  const chapterNo = 5;
  const targetId = getChapterCompanionId(chapterNo);
  const state = buildByIdState({
    activeId: "greyshade-cat",
    chapterNo,
    activeRel: { bond: 80, trust: 60, blockedTouchCount: 0 },
    targetRel: { bond: 5, trust: 5, blockedTouchCount: 0 },
    mark: {
      bondAtStart: 70,
      trustAtStart: 50,
      blockedTouchAtStart: 0,
      overwhelmedCount: 0
    }
  });

  assert.equal(canAskResonance(state, chapterNo).eligible, true);
  const result = evaluateResonanceInvite(state, chapterNo);
  assert.equal(result.companionId, targetId);
  assert.equal(result.willing, false, "must not unlock from active greyshade mirror");
  assert.equal(result.cause, "early");
  ok("R1: high active A does not unlock low target B invite");
});

cases.push(() => {
  const chapterNo = 5;
  const state = buildByIdState({
    activeId: "greyshade-cat",
    chapterNo,
    activeRel: { bond: 90, trust: 80, blockedTouchCount: 0 },
    targetRel: { bond: 14, trust: 12, blockedTouchCount: 0 },
    mark: {
      bondAtStart: 8,
      trustAtStart: 6,
      blockedTouchAtStart: 0,
      overwhelmedCount: 0
    }
  });
  // Target delta (14-8)+(12-6)=12 >= 6 even while active is greyshade
  const result = evaluateResonanceInvite(state, chapterNo);
  assert.equal(result.willing, true);
  assert.equal(result.cause, null);
  ok("R3: target byId affinity alone can unlock while another companion is active");
});

cases.push(() => {
  const draft = {
    activeCompanionId: "greyshade-cat",
    bond: 55,
    trust: 40,
    blockedTouchCount: 1,
    companionStates: createDefaultCompanionStates("greyshade-cat")
  };
  draft.companionStates.byId["blazetail-kit"] = makeRecord("blazetail-kit", {
    bond: 3,
    trust: 4,
    blockedTouchCount: 0
  });
  const snap = buildRelationshipChapterMarkSnapshot(draft, "blazetail-kit", 99);
  assert.equal(snap.bondAtStart, 3);
  assert.equal(snap.trustAtStart, 4);
  assert.equal(snap.blockedTouchAtStart, 0);
  assert.notEqual(snap.bondAtStart, 55);
  ok("R4: chapter mark snapshot uses target relationship, not active mirror");
});

cases.push(() => {
  // Legacy fixture shape (no companionStates): dual-read keeps prior harness behavior
  const chapterNo = 2;
  const companionId = getChapterCompanionId(chapterNo);
  const state = {
    bond: 14,
    trust: 12,
    blockedTouchCount: 0,
    chapterProgress: { current: 3, completed: [2] },
    resonance: {
      companions: { [companionId]: { metAt: 1, joinedAt: null } },
      chapterMarks: {
        2: { bondAtStart: 10, trustAtStart: 8, blockedTouchAtStart: 0, overwhelmedCount: 0 }
      }
    }
  };
  const result = evaluateResonanceInvite(state, 2);
  assert.equal(result.willing, true);
  ok("legacy dual-read: top-level mirror still works without companionStates bag");
});

let failed = 0;
for (const run of cases) {
  try {
    run();
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${error.message}`);
    console.error(error);
  }
}

if (failed) {
  console.error(`\n${failed} authority case(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} resonance invite authority cases passed`);
