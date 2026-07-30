import assert from "node:assert/strict";
import fs from "node:fs";

import {
  MOONLAKE_BRIDGE_PRESENTATION,
  MOONLAKE_COMPANION_PRESENTATION
} from "../../src/three/moonlakeLive3dConfig.js";
import { getMoonlakePresentationScale } from "../../src/pixi/moonlakeNavigationSafety.js";

const COMPANION_IDS = Object.freeze([
  "greyshade-cat",
  "auriowl",
  "sprigfawn",
  "crystalfin-seahorse",
  "blazetail-kit",
  "starstripe-cub",
  "thunder-pup",
  "wavecub",
  "starflame-phoenix",
  "star-foal",
  "goldenspark-wyrm",
  "flame-flicker",
  "ice-talon",
  "stone-shard",
  "vine-twist",
  "crystal-rabbit"
]);

assert.equal(
  MOONLAKE_BRIDGE_PRESENTATION.useAuthoredSilhouette,
  true,
  "Moonlake must render the authored bridge silhouette"
);
assert.equal(
  "widenedNearHalfWidth" in MOONLAKE_BRIDGE_PRESENTATION,
  false,
  "the retired near bridge extension must not return"
);
assert.equal(
  "widenedFarHalfWidth" in MOONLAKE_BRIDGE_PRESENTATION,
  false,
  "the retired far bridge extension must not return"
);
assert.equal(MOONLAKE_BRIDGE_PRESENTATION.maxBridgeSilhouetteWidthPx390, 58);
assert.equal(MOONLAKE_BRIDGE_PRESENTATION.maxFishingSilhouetteWidthPx390, 76);

const sceneSource = fs.readFileSync(
  new URL("../../src/three/moonlakeLive3dScene.js", import.meta.url),
  "utf8"
);
for (const retiredShaderToken of [
  "bridgeExtension",
  "bridgeWood",
  "widenedMask",
  "widenedHalfWidth"
]) {
  assert.equal(
    sceneSource.includes(retiredShaderToken),
    false,
    `${retiredShaderToken} must not return to the Moonlake backdrop shader`
  );
}

assert.deepEqual(
  Object.keys(MOONLAKE_COMPANION_PRESENTATION)
    .filter((id) => id !== "default")
    .sort(),
  [...COMPANION_IDS].sort(),
  "all sixteen runtime companions keep an explicit Moonlake presentation profile"
);

const presentationMatrix = COMPANION_IDS.map((companionId) => {
  const bridgeScale = getMoonlakePresentationScale(
    companionId,
    "bridge",
    "back_walk"
  );
  const fishingScale = getMoonlakePresentationScale(
    companionId,
    "fishing_spot",
    "fishing_back"
  );
  assert.ok(
    bridgeScale >= 0.9 && bridgeScale <= 1,
    `${companionId} bridge scale left the conservative presentation envelope`
  );
  assert.ok(
    fishingScale >= 1.3 && fishingScale <= 1.5,
    `${companionId} fishing scale left the readable presentation envelope`
  );
  return { companionId, bridgeScale, fishingScale };
});

console.log(JSON.stringify({
  pass: true,
  package: "TP-MOONLAKE-BRIDGE-COMPOSITING-R3.6",
  authoredBridgeSilhouette: true,
  syntheticBridgeShaderExtension: false,
  companionCount: COMPANION_IDS.length,
  bridgeCapPx390: MOONLAKE_BRIDGE_PRESENTATION.maxBridgeSilhouetteWidthPx390,
  fishingCapPx390: MOONLAKE_BRIDGE_PRESENTATION.maxFishingSilhouetteWidthPx390,
  presentationMatrix
}, null, 2));
