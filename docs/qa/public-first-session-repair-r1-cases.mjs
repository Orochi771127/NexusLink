/**
 * Public new-player repair R1 deterministic contract checks.
 * Run: node docs/qa/public-first-session-repair-r1-cases.mjs
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isAtlasRegionSelectable,
  resolveAtlasHabitatId
} from "../../src/ui/atlasController.js";
import { getChapterByNumber } from "../../src/data/chapterRegistry.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
const cases = [];

function check(name, assertion) {
  assertion();
  cases.push(name);
  console.log(`PASS  ${name}`);
}

const freshProgress = { current: 1, completed: [] };
const progressed = { current: 2, completed: [1] };
const chapterTwoRegion = getChapterByNumber(2)?.regionId;

check("fresh atlas keeps Moonlake selectable", () => {
  assert.equal(isAtlasRegionSelectable("moonlake", freshProgress), true);
});

check("fresh atlas rejects locked future regions", () => {
  assert.equal(isAtlasRegionSelectable(chapterTwoRegion, freshProgress), false);
});

check("completed atlas regions remain revisit-able", () => {
  assert.equal(isAtlasRegionSelectable("moonlake", progressed), true);
});

check("invalid persisted habitat recovers to the current chapter", () => {
  assert.equal(resolveAtlasHabitatId(chapterTwoRegion, freshProgress), "moonlake");
});

const onboardingSource = read("src/ui/onboardingController.js");
const restartBody = onboardingSource.match(/function restart\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
check("guidance replay is session-only", () => {
  assert.match(restartBody, /replayActive = true/);
  assert.doesNotMatch(restartBody, /store\.setState|persist\(/);
});

const codexSource = read("src/ui/codexController.js");
check("player Codex omits RPG and implementation metadata", () => {
  assert.doesNotMatch(
    codexSource,
    /戰鬥定位 ROLE|素材狀態 RUNTIME|能力雷達|Tactic tags|Canon roadmap/
  );
});

const sharedCopy = [
  read("src/ui/gentleInvitationController.js"),
  read("src/data/explorationNodes.js"),
  read("src/ai/awakening/firstAwakeningEvent.js"),
  read("src/expedition/intentNarration.js")
].join("\n");
check("shared invitation and exploration copy is species-neutral", () => {
  assert.doesNotMatch(sharedCopy, /耳朵|尾巴|爪子|鼻尖|毛上/);
});

const soulCopy = read("src/data/soulTalkResponsePacks.js");
check("shared Soul Talk reflection no longer assumes fur or a tail", () => {
  assert.doesNotMatch(soulCopy, /氣味還留在我毛上|我尾巴就想動/);
});

const onboardingCss = read("styles/ui-v3-onboarding.css");
check("first-loop prose cannot intercept companion touch", () => {
  assert.match(onboardingCss, /\.onboarding-shell\s*\{[\s\S]*?pointer-events:\s*auto/);
  assert.match(
    onboardingCss,
    /\.first-loop-hint-wrap\.is-visible\s*\{[\s\S]*?pointer-events:\s*none/
  );
  assert.match(onboardingCss, /\.first-loop-skip\s*\{[\s\S]*?pointer-events:\s*auto/);
  assert.match(onboardingCss, /\.touch-affordance\.is-visible\s*\{[\s\S]*?pointer-events:\s*auto/);
});

const pageRouterSource = read("src/ui/pageRouter.js");
const pageCss = read("styles/page-content.css");
check("every page gets a visible 44px Soul Talk action", () => {
  assert.match(pageRouterSource, /ensurePageSoulTalkActions/);
  assert.match(pageRouterSource, /button\.dataset\.pageAction = "open-soul-talk"/);
  assert.match(pageCss, /\.page-soul-talk-action\s*\{[\s\S]*?min-height:\s*44px/);
});

const mainCss = read("styles.css");
check("mobile Orbit guidance remains visible and settings target is 44px", () => {
  assert.match(mainCss, /\.quick-hud \.settings-item\s*\{[\s\S]*?width:\s*44px/);
  assert.match(mainCss, /#btn-settings-toggle\s*\{[\s\S]*?width:\s*44px/);
  assert.match(mainCss, /@media \(max-width: 420px\)[\s\S]*?\.orbit-hint\s*\{[\s\S]*?display:\s*block/);
});

const orbitSource = read("src/ui/orbitBattleController.js");
check("Orbit prototype HUD reserves a separate meter row", () => {
  assert.match(orbitSource, /session\.prototypeSlice \? 68 : 48/);
});

const soulTalkSource = read("src/ui/soulTalkController.js");
check("Soul Talk clears stale listening copy without overwriting result status", () => {
  assert.match(soulTalkSource, /statusText\?\.textContent\.startsWith\(`\$\{companionName\}正在聽`\)/);
});

console.log(`\nAll ${cases.length} public first-session repair R1 cases passed.`);
