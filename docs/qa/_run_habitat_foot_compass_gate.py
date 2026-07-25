# Habitat foot-on-compass alignment live gate.
# Run: python docs/qa/_run_habitat_foot_compass_gate.py
# Prefers NEXUS_QA_BASE (default http://127.0.0.1:5197).

import json
import os
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE_URL = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:5197")
STORAGE_KEY = "nexusLinkR2State:v1"
PIXEL_TOLERANCE = float(os.environ.get("NEXUS_FOOT_TOLERANCE", "3"))
VIEWPORT = {"width": 390, "height": 844}
HABITATS = ["moonlake", "plains", "forge", "harbor", "core", "tidal", "mystic"]
OUT_DIR = Path(tempfile.gettempdir()) / "nexus-foot-compass-qa"
ALL_IDS = [
    "greyshade-cat",
    "flame-flicker",
    "ice-talon",
    "stone-shard",
    "vine-twist",
    "crystal-rabbit",
    "sprigfawn",
    "starstripe-cub",
    "auriowl",
    "blazetail-kit",
    "crystalfin-seahorse",
    "thunder-pup",
    "wavecub",
    "starflame-phoenix",
    "star-foal",
    "goldenspark-wyrm",
]


def seed(context):
    ids_json = json.dumps(ALL_IDS)
    context.add_init_script(
        script=f"""(() => {{
          if (!['http:', 'https:'].includes(location.protocol)) return;
          const now = Date.now();
          localStorage.setItem({json.dumps(STORAGE_KEY)}, JSON.stringify({{
            playerProfile: {{ displayName: 'Foot QA', identitySkipped: false, createdAt: now, updatedAt: now }},
            onboarding: {{
              status: 'completed', completed: true, completedAt: now,
              identityCompleted: true, guidanceCompleted: true, greyshadeMetAt: now,
              veteranAutoCompleted: false, firstLoop: {{ completedAt: now }}
            }},
            firstTouchCompleted: true, firstHugCompleted: true,
            activeCompanionId: 'greyshade-cat',
            unlockedCompanionIds: {ids_json},
            activeHabitatId: 'moonlake',
            energy: 10, mood: 'calm', defense: 35, bond: 20, trust: 20, touchFatigue: 0
          }}));
        }})();"""
    )


def measure(page):
    return page.evaluate(
        """() => {
          const habitat = window.__NEXUS_HABITAT;
          if (!habitat?.getFootPlacement) return { ok: false, reason: 'missing_handles' };
          const sample = habitat.getFootPlacement();
          if (!Number.isFinite(sample.targetX) || !Number.isFinite(sample.targetY)) {
            return { ok: false, reason: 'missing_placement_target', ...sample };
          }
          const dx = sample.footX - sample.targetX;
          const dy = sample.footY - sample.targetY;
          return {
            ok: true,
            ...sample,
            dx, dy, dist: Math.hypot(dx, dy)
          };
        }"""
    )


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    results = []
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport=VIEWPORT, device_scale_factor=1)
        seed(context)
        page = context.new_page()
        page.goto(f"{BASE_URL}/?qa=foot-compass", wait_until="domcontentloaded", timeout=90000)
        page.wait_for_function(
            """() => {
              const h = window.__NEXUS_HABITAT;
              if (!h?.switchHabitat || !h?.swapCompanionById || !h?.getFootPlacement) return false;
              const sample = h.getFootPlacement();
              return Number.isFinite(sample?.targetX) && Number.isFinite(sample?.footX);
            }""",
            timeout=90000,
        )
        page.wait_for_timeout(1500)

        companion_ids = page.evaluate(
            """async () => {
              const reg = await import('/src/data/companionRegistry.js');
              return reg.COMPANIONS.map((c) => c.id);
            }"""
        )

        for habitat_id in HABITATS:
            switched = page.evaluate(
                """async (habitatId) => {
                  const ok = await window.__NEXUS_HABITAT.switchHabitat(habitatId);
                  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                  await new Promise((r) => setTimeout(r, 400));
                  return Boolean(ok);
                }""",
                habitat_id,
            )
            if not switched:
                failures.append({"habitat": habitat_id, "reason": "switch_failed"})
                continue

            for companion_id in companion_ids:
                swapped = page.evaluate(
                    """async (companionId) => {
                      const ok = await window.__NEXUS_HABITAT.swapCompanionById(companionId);
                      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
                      await new Promise((r) => setTimeout(r, 500));
                      return Boolean(ok);
                    }""",
                    companion_id,
                )
                if not swapped:
                    failures.append(
                        {"habitat": habitat_id, "companion": companion_id, "reason": "swap_failed"}
                    )
                    continue

                # Force a layout pass after swap (resize listener path).
                page.evaluate("() => window.dispatchEvent(new Event('resize'))")
                page.wait_for_timeout(250)
                sample = measure(page)
                sample["habitat"] = habitat_id
                sample["companion"] = companion_id
                results.append(sample)

                if not sample.get("ok"):
                    failures.append(sample)
                elif sample.get("alignment") != "foot":
                    failures.append({**sample, "reason": "alignment_not_foot"})
                elif abs(sample.get("dx", 99)) > PIXEL_TOLERANCE or abs(sample.get("dy", 99)) > PIXEL_TOLERANCE:
                    failures.append({**sample, "reason": "foot_off_cross"})

                if companion_id == "greyshade-cat":
                    page.screenshot(
                        path=str(OUT_DIR / f"{habitat_id}__greyshade-cat.png"),
                        full_page=False,
                    )

        browser.close()

    report = {
        "baseUrl": BASE_URL,
        "tolerancePx": PIXEL_TOLERANCE,
        "companionCount": len(companion_ids) if results else 0,
        "totalSamples": len(results),
        "failureCount": len(failures),
        "passed": len(failures) == 0 and len(results) > 0,
        "screenshotDir": str(OUT_DIR),
        "failures": failures[:50],
        "maxDist": max((r.get("dist") or 0) for r in results) if results else None,
    }
    Path("docs/qa/_habitat_foot_compass_gate_output.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["passed"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
