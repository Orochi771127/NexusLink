import assert from "node:assert/strict";
import test from "node:test";

import { createChampionshipR2Session } from "../../src/championship/r2/createChampionshipR2Session.js";
import { RAISING_HOME_COMMANDS } from "../../src/championship/raising/raisingHomeDefinition.js";

test("R2 session composes the lazy mode kernel with Raising Home without save authority", async () => {
  const session = createChampionshipR2Session({ sessionId: "r2-integration-open" });
  assert.equal(session.getSnapshot().mode.lifecycle, "IDLE");
  assert.equal(session.getSnapshot().raisingHome.modeId, "raising-home");
  const opened = await session.open();
  assert.equal(opened.accepted, true);
  assert.equal(session.getSnapshot().mode.lifecycle, "ACTIVE");
  assert.equal(session.getSnapshot().mode.currentModeId, "championship:mode:raising-home");
  assert.equal(session.listModes().length, 22);
  assert.equal(session.getSnapshot().saveBoundary.committedWrites, 0);
  assert.equal(session.getSnapshot().saveBoundary.committedDeletes, 0);
  await session.dispose();
});

test("R2 open is idempotent and gameplay remains session-only", async () => {
  const session = createChampionshipR2Session({ sessionId: "r2-integration-idempotent" });
  await session.open();
  const revision = session.getSnapshot().mode.revision;
  const reopened = await session.open();
  assert.equal(reopened.code, "CHAMPIONSHIP_R2_ALREADY_OPEN");
  assert.equal(session.getSnapshot().mode.revision, revision);
  const publication = session.dispatchRaisingHome({
    type: RAISING_HOME_COMMANDS.ADVANCE,
    minutes: 5,
    commandId: "integration:advance:1",
    expectedRevision: session.getRaisingHomeSnapshot().revision
  });
  assert.equal(publication.persistenceAttempted, false);
  assert.equal(publication.playerStatePatch, null);
  assert.equal(session.getSnapshot().saveBoundary.writeRequests, 0);
  assert.equal("raisingHome" in session, false);
  assert.equal("modeRouter" in session, false);
  await session.dispose();
  assert.equal(session.getSnapshot().disposed, true);
});

test("R2 dispose exits the active mode, disposes the router, and is idempotent", async () => {
  const session = createChampionshipR2Session({ sessionId: "r2-integration-dispose" });
  await session.open();
  const disposed = await session.dispose();
  assert.equal(disposed.accepted, true);
  assert.equal(disposed.snapshot.lifecycle, "DISPOSED");
  assert.deepEqual(disposed.snapshot.eventLog.map((event) => event.type), ["MODE_ENTERED", "MODE_EXITED", "MODE_ROUTER_DISPOSED"]);
  assert.equal((await session.dispose()).code, "CHAMPIONSHIP_R2_ALREADY_DISPOSED");
});
