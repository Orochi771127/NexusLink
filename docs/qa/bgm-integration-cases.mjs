/**
 * BGM integration smoke cases (Node, no browser Audio).
 * Run: node docs/qa/bgm-integration-cases.mjs
 *
 * Covers registry resolution, unmapped inventory, and scene ID helpers.
 * Playback / iOS autoplay / mute require manual browser tests (see checklist).
 */

import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

const {
  BGM_SCENE,
  BGM_UNMAPPED_ASSETS,
  habitatSceneId,
  resolveBgmScene,
  listMappedBgmScenes
} = await import(pathToFileURL(path.join(repoRoot, "src/data/bgmRegistry.js")).href);

function ok(name) {
  console.log(`PASS  ${name}`);
}

async function assertFileExists(relativePath) {
  const abs = path.join(repoRoot, relativePath.replace(/^\.\//, ""));
  await access(abs);
}

const cases = [];

cases.push(async () => {
  assert.equal(habitatSceneId("moonlake"), "habitat:moonlake");
  assert.equal(habitatSceneId(""), "habitat:moonlake");
  ok("habitatSceneId defaults");
});

cases.push(async () => {
  const start = resolveBgmScene(BGM_SCENE.START);
  assert.equal(start.sceneId, "screen:start");
  assert.match(start.src, /bgm_login_page\.mp3$/);
  assert.equal(start.loop, true);
  await assertFileExists(start.src);
  ok("screen:start maps to login_page and file exists");
});

cases.push(async () => {
  const select = resolveBgmScene(BGM_SCENE.COMPANION_SELECT);
  assert.equal(select.sceneId, "screen:companion-select");
  assert.match(select.src, /bgm_linkara_lofi\.mp3$/);
  await assertFileExists(select.src);
  ok("screen:companion-select maps to lofi (Owner-confirmed) and file exists");
});

cases.push(async () => {
  const moon = resolveBgmScene(habitatSceneId("moonlake"));
  assert.equal(moon.sceneId, "habitat:moonlake");
  assert.match(moon.src, /bgm_ethereal_moon_lakefront\.mp3$/);
  assert.equal(moon.src.includes("bgm_lakefront.mp3"), false);
  await assertFileExists(moon.src);
  ok("habitat:moonlake maps to ethereal_moon_lakefront (Owner-corrected)");
});

cases.push(async () => {
  const habitats = ["moonlake", "plains", "forge", "harbor", "core", "tidal", "mystic"];
  for (const id of habitats) {
    const resolved = resolveBgmScene(habitatSceneId(id));
    assert.equal(resolved.sceneId, `habitat:${id}`);
    assert.equal(resolved.fallback, false);
    await assertFileExists(resolved.src);
  }
  ok("all seven habitats map to existing files");
});

cases.push(async () => {
  const unknown = resolveBgmScene("habitat:does-not-exist");
  assert.equal(unknown.fallback, true);
  assert.equal(unknown.sceneId, BGM_SCENE.FALLBACK);
  await assertFileExists(unknown.src);
  ok("unknown habitat falls back to legacy m4a without throw");
});

cases.push(async () => {
  assert.ok(BGM_UNMAPPED_ASSETS.includes("./assets/audio/bgm_lakefront.mp3"));
  for (const asset of BGM_UNMAPPED_ASSETS) {
    await assertFileExists(asset);
  }
  const mappedSrcs = new Set(listMappedBgmScenes().map((s) => s.src));
  for (const asset of BGM_UNMAPPED_ASSETS) {
    assert.equal(mappedSrcs.has(asset), false, `${asset} must not be auto-mapped`);
  }
  ok("unmapped assets exist on disk and are not in SCENE_TO_SRC");
});

cases.push(async () => {
  const mapped = listMappedBgmScenes();
  assert.ok(mapped.length >= 10);
  for (const entry of mapped) {
    await assertFileExists(entry.src);
  }
  ok("every mapped registry src exists on disk");
});

let failed = 0;
for (const run of cases) {
  try {
    await run();
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${error.message}`);
    console.error(error);
  }
}

if (failed) {
  console.error(`\n${failed} BGM case(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} BGM registry cases passed`);
