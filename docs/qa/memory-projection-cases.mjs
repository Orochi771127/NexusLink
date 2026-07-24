/**
 * Pack 3 — Memory single-truth projection cases.
 * Run: node docs/qa/memory-projection-cases.mjs
 */

import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  projectMemoryEvidence,
  countMemoryEvidence,
  isConcreteRecallEvidenceVisible,
  isPlayerVisibleAnchor
} = await import(pathToFileURL(path.join(repoRoot, "src/ui/memoryProjection.js")).href);

const {
  findPersistedRecall,
  retrieveSoftAnchorAllusion
} = await import(pathToFileURL(path.join(repoRoot, "src/ai/dialogue/companionAnchorPolicy.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

const visibleAnchor = {
  id: "anch_preference_coffee",
  kind: "preference",
  key: "coffee",
  label: "咖啡",
  softLabel: "咖啡",
  detail: "比較在意那杯手沖",
  createdAt: 100
};

const riskyAnchor = {
  id: "anch_bad",
  kind: "recent_event",
  key: "risky",
  label: "危險",
  detail: "想死的念頭",
  createdAt: 200
};

const emptyAnchor = {
  id: "anch_empty",
  kind: "preference",
  key: "quiet",
  label: "安靜",
  detail: "",
  createdAt: 50
};

assert.equal(isPlayerVisibleAnchor(visibleAnchor), true);
assert.equal(isPlayerVisibleAnchor(riskyAnchor), false);
assert.equal(isPlayerVisibleAnchor(emptyAnchor), false);
ok("anchor visibility filters risky/empty");

const state = {
  memories: [{ id: "m1", title: "月湖", text: "第一次坐下", createdAt: 10 }],
  emotionalMemories: [
    {
      id: "e1",
      theme: "疲憊",
      excerpt: "那晚很累",
      emotion: "fatigue",
      status: "active",
      createdAt: 20
    },
    {
      id: "e2",
      theme: "舊傷",
      excerpt: "已放下的光",
      emotion: "sadness",
      status: "released",
      createdAt: 5
    }
  ],
  habitatTraces: [
    { id: "t1", memoryId: "e1", intensity: 0.4, status: "active", createdAt: 21 }
  ],
  companionAnchors: [visibleAnchor, riskyAnchor, emptyAnchor]
};

const projected = projectMemoryEvidence(state, { limit: 20 });
const kinds = projected.map((item) => item.kind);
assert.ok(kinds.includes("anchor"), "visible anchor projected");
assert.ok(kinds.includes("emotional_archive"), "released memory stays as archive");
assert.ok(!projected.some((item) => item.source === riskyAnchor), "risky anchor hidden");
assert.equal(
  projected.find((item) => item.kind === "emotional_archive")?.claimable,
  false
);
ok("projection includes anchors + archive; excludes risky");

const counts = countMemoryEvidence(state);
assert.equal(counts.anchors, 1);
assert.equal(counts.emotional, 1);
assert.equal(counts.emotionalArchive, 1);
ok("evidence counts");

const recall = findPersistedRecall("還記得咖啡嗎", {
  companionAnchors: state.companionAnchors,
  emotionalMemories: state.emotionalMemories
});
assert.ok(recall);
assert.equal(recall.source, "companion_anchor");
assert.equal(isConcreteRecallEvidenceVisible(state, recall), true);
ok("concrete recall aligns with visible evidence");

const soft = retrieveSoftAnchorAllusion("今天好想喝咖啡", state.companionAnchors);
assert.ok(soft?.weaveLine);
const softRiskyOnly = retrieveSoftAnchorAllusion("今天好想喝咖啡", [riskyAnchor]);
assert.equal(softRiskyOnly, null);
ok("soft allusion requires visible anchors");

const releasedOnlyRecall = findPersistedRecall("還記得舊傷嗎", {
  companionAnchors: [],
  emotionalMemories: state.emotionalMemories
});
assert.equal(releasedOnlyRecall, null);
ok("released emotional memory is not concrete-recalled");

console.log("\nAll memory projection cases passed.");
