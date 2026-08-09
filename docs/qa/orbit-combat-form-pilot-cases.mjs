/**
 * Global 3D Pilot R1 — session-only base/resonance combat-form cases.
 * Run: node docs/qa/orbit-combat-form-pilot-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");
const fromRepo = (relativePath) =>
  pathToFileURL(path.join(repoRoot, relativePath)).href;

const {
  ORBIT_TOP_PROFILE_IDS,
  createOrbitTopCombatFormConfig,
  getOrbitTopProfile
} = await import(fromRepo("src/data/orbitTopProfiles.js"));
const {
  hasEqualOrbitCombatFormBudget,
  orbitCombatFormBudget
} = await import(fromRepo("src/orbit/orbitCombatForm.js"));
const {
  createOrbitSession,
  launchOrbitSession,
  stepOrbitSession,
  triggerOrbitCombatForm
} = await import(fromRepo("src/orbit/orbitEngine.js"));
const { ORBIT_PHYSICS_MODELS } = await import(
  fromRepo("src/orbit/orbitPhysics.js")
);

const stats = Object.freeze({
  impact: 42,
  spin: 48,
  guard: 46,
  burst: 18,
  overheat: 0,
  canLaunch: true
});

const stage = Object.freeze({
  id: "combat-form-pilot",
  title: "共鳴變形 Pilot",
  regionId: "moonlake",
  goal: "survive",
  goalLabel: "共同守住 8 秒",
  surviveSeconds: 8,
  maxSeconds: 10,
  arenaRadius: 1,
  containedArena: true,
  playerStart: { x: 0, y: 0.46 },
  dummyStart: { x: 0, y: -0.32 },
  dummyEnabled: true
});

function ok(name) {
  console.log(`PASS  ${name}`);
}

assert.deepEqual(ORBIT_TOP_PROFILE_IDS, [
  "greyshade-cat",
  "crystalfin-seahorse",
  "rift-echo"
]);
for (const id of ORBIT_TOP_PROFILE_IDS) {
  const profile = getOrbitTopProfile(id);
  if (id === "crystalfin-seahorse") {
    assert.equal(profile.artStatus, "runtime-promoted-owner-approved");
    assert.ok(profile.model.glbPath.startsWith("assets/3d/orbit-tops-r2/"));
    assert.ok(profile.model.candidateGlbPath.includes("global-3d-gameplay-pilots-r2"));
  } else {
    assert.equal(profile.artStatus, "runtime-promoted-owner-approved");
    assert.ok(profile.model.glbPath.startsWith("assets/3d/orbit-tops-r1/"));
    assert.ok(profile.model.glbPath.endsWith(".glb"));
  }
  assert.ok(profile.model.candidateGlbPath.endsWith(".glb"));
  assert.equal(hasEqualOrbitCombatFormBudget(profile.forms), true);
  assert.equal(orbitCombatFormBudget(profile.forms.base.physics), 6);
  assert.equal(orbitCombatFormBudget(profile.forms.resonance.physics), 6);
  assert.equal("impact" in profile.forms.resonance.physics, false);
  assert.equal("winner" in profile.forms.resonance.physics, false);
  assert.equal("reward" in profile.forms.resonance.physics, false);
}
ok("approved tops keep distinct identity and equal form budgets");

const crystalfinConfig = createOrbitTopCombatFormConfig("crystalfin-seahorse");
assert.equal(crystalfinConfig.enabled, true);
assert.equal(crystalfinConfig.player.profileId, "crystalfin-seahorse-orbit-top-r2");
assert.equal(
  getOrbitTopProfile("crystalfin-seahorse").model.colliderProxyNode,
  "ColliderProxy_Deterministic2D"
);
ok("Crystalfin R2 top uses the same session-only combat-form contract");

function createPilotSession() {
  return createOrbitSession({
    stats,
    stage,
    physicsModel: ORBIT_PHYSICS_MODELS.hybridSpin,
    nonPersistent: true,
    combatForm: createOrbitTopCombatFormConfig("greyshade-cat", {
      playerWindowOpensAt: 0,
      enemyWindowOpensAt: 0.5,
      resonanceDurationSeconds: 1.25
    })
  });
}

let session = createPilotSession();
assert.equal(session.combatForms.player.current, "base");
assert.equal(session.combatForms.dummy.current, "base");
const aimingAttempt = triggerOrbitCombatForm(session);
assert.equal(aimingAttempt, session);

session = launchOrbitSession(session, -0.06, 0.28);
const energyBefore =
  session.player.inertiaScale *
  (session.player.vx ** 2 + session.player.vy ** 2);
session = triggerOrbitCombatForm(session);
const energyAfter =
  session.player.inertiaScale *
  (session.player.vx ** 2 + session.player.vy ** 2);
assert.equal(session.combatForms.player.current, "resonance");
assert.equal(session.combatForms.player.chargesRemaining, 0);
assert.ok(Math.abs(energyBefore - energyAfter) < 1e-12);
assert.equal(triggerOrbitCombatForm(session), session);
ok("manual resonance changes bounded profile without creating launch energy");

for (let i = 0; i < 90; i += 1) {
  session = stepOrbitSession(session, 1 / 120);
}
assert.equal(session.combatForms.dummy.current, "resonance");
assert.equal(session.combatForms.dummy.chargesRemaining, 0);
assert.equal(
  session.combatForms.lastTransition.source,
  "deterministic_auto"
);
for (let i = 0; i < 120; i += 1) {
  session = stepOrbitSession(session, 1 / 120);
}
assert.equal(session.combatForms.player.current, "base");
assert.equal(session.combatForms.dummy.current, "base");
ok("player and opponent use the same timed return-to-base state machine");

function replayAtHz(hz) {
  let value = createPilotSession();
  value = launchOrbitSession(value, -0.06, 0.28);
  value = triggerOrbitCombatForm(value);
  for (let i = 0; i < hz * 2; i += 1) {
    value = stepOrbitSession(value, 1 / hz);
  }
  const round = (number) => Math.round(number * 1e10) / 1e10;
  return {
    phase: value.phase,
    elapsed: round(value.elapsed),
    transitionIndex: value.combatForms.transitionIndex,
    playerForm: value.combatForms.player.current,
    dummyForm: value.combatForms.dummy.current,
    player: [
      round(value.player.x),
      round(value.player.y),
      round(value.player.vx),
      round(value.player.vy),
      round(value.player.spin),
      round(value.player.stability),
      round(value.player.radius)
    ],
    dummy: [
      round(value.dummy.x),
      round(value.dummy.y),
      round(value.dummy.vx),
      round(value.dummy.vy),
      round(value.dummy.spin),
      round(value.dummy.stability),
      round(value.dummy.radius)
    ]
  };
}

assert.deepEqual(replayAtHz(30), replayAtHz(60));
assert.deepEqual(replayAtHz(60), replayAtHz(120));
ok("combat-form transitions and physics replay exactly at 30/60/120 Hz");

const malformed = createOrbitSession({
  stats,
  stage,
  combatForm: {
    enabled: true,
    player: {
      profileId: "bad",
      windowOpensAt: 0,
      forms: {
        base: { physics: { collisionRadius: 1 } },
        resonance: { physics: { collisionRadius: 1.2 } }
      }
    }
  }
});
assert.equal(malformed.combatForms.player.enabled, false);
assert.equal(malformed.combatForms.player.disabledReason, "unequal_form_budget");
assert.equal(malformed.combatForms.dummy.enabled, false);
ok("missing or unequal form data fails closed to base");

console.log("\nOrbit combat-form Pilot cases passed.");
