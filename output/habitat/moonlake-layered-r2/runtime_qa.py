import json
import sys
from pathlib import Path
from urllib.parse import urlencode

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parent
BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:5179"
SCREENSHOTS = ROOT / "runtime-qa"
SCREENSHOTS.mkdir(exist_ok=True)


def complete_onboarding(page):
    steps = [
        '[data-onboarding-action="start"]',
        '[data-onboarding-action="skip-identity"]',
        '[data-onboarding-action="guidance-next"]',
        '[data-onboarding-action="bond-choose"][data-bond-id="greyshade-cat"]',
        '[data-onboarding-action="complete"]',
    ]
    for selector in steps:
        locator = page.locator(selector).first
        locator.wait_for(state="visible", timeout=12000)
        locator.click(force=True)
    page.wait_for_function(
        "() => document.querySelector('#onboarding-root')?.hidden === true",
        timeout=12000,
    )


def inspect_runtime(page):
    return page.evaluate(
        """
        () => {
          const placements = (window.__NEXUS_SCENE_EDITOR_OBJECTS || [])
            .filter((object) => object.__sceneEditor?.placement);
          const root = placements[0]?.parent || null;
          const find = (node, name) => {
            if (!node) return null;
            if (node.name === name) return node;
            for (const child of node.children || []) {
              const match = find(child, name);
              if (match) return match;
            }
            return null;
          };
          const world = root?.parent || null;
          const ambient = find(world, 'habitat_phase_ambient');
          const fog = find(world, 'weather_fog');
          const rain = find(world, 'weather_rain');
          const wetness = find(world, 'weather_wetness');
          const ripples = find(world, 'weather_water_ripples');
          const bgNight = find(world, 'bg_night');
          const bgDay = find(world, 'bg_day');
          const grid = find(root, 'moonlake_dev_placement_grid');
          return {
            placementCount: placements.length,
            ids: placements.map((object) => object.__sceneEditor.id).sort(),
            completeChildSets: placements.every((object) => {
              const names = new Set((object.children || []).map((child) => child.name));
              const id = object.__sceneEditor.id;
              return names.has(`${id}_shadow`)
                && names.has(`${id}_light`)
                && names.has(`${id}_base`)
                && names.has(`${id}_emissive`);
            }),
            rootVisible: root?.visible ?? null,
            rootTransform: root ? {
              x: root.x,
              y: root.y,
              scaleX: root.scale.x,
              scaleY: root.scale.y
            } : null,
            gridPresent: Boolean(grid),
            oldCampPlatePresent: Boolean(find(world, 'camp_structures_day') || find(world, 'camp_structures_night')),
            bgNightAlpha: bgNight?.alpha ?? null,
            bgTexturesShared: Boolean(bgDay && bgNight && bgDay.texture === bgNight.texture),
            emissiveAlpha: placements.map((object) => find(object, `${object.__sceneEditor.id}_emissive`)?.alpha ?? null),
            shadowAlpha: placements.map((object) => find(object, `${object.__sceneEditor.id}_shadow`)?.alpha ?? null),
            ambientAlpha: ambient?.alpha ?? null,
            fogAlpha: fog?.alpha ?? null,
            rainVisible: rain?.visible ?? null,
            wetnessAlpha: wetness?.alpha ?? null,
            rippleVisibleCount: (ripples?.children || []).filter((child) => child.visible).length,
            editorMetadataComplete: placements.every((object) => {
              const data = object.__sceneEditor;
              return Boolean(data.slotId && data.placementGrid && data.cell && data.offsetPx && data.renderLayer);
            })
          };
        }
        """
    )


def assert_common(result, expect_grid=False):
    assert result["placementCount"] == 8, result
    assert result["completeChildSets"], result
    assert result["editorMetadataComplete"], result
    assert result["gridPresent"] is expect_grid, result
    assert not result["oldCampPlatePresent"], result
    assert result["bgNightAlpha"] == 0, result
    assert result["bgTexturesShared"], result
    assert result["rootVisible"], result
    assert result["rootTransform"]["scaleX"] == result["rootTransform"]["scaleY"], result


def run_case(browser, name, viewport, params, onboarding=True):
    context = browser.new_context(viewport=viewport, device_scale_factor=1)
    page = context.new_page()
    console_errors = []
    page_errors = []
    requests = []
    page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on("request", lambda request: requests.append(request.url))
    page.goto(f"{BASE}/?{urlencode(params)}", wait_until="domcontentloaded", timeout=30000)
    if onboarding:
        page.evaluate("() => localStorage.clear()")
        page.reload(wait_until="domcontentloaded", timeout=30000)
        complete_onboarding(page)
    page.wait_for_function("() => Boolean(window.__NEXUS_HABITAT)", timeout=20000)
    page.wait_for_timeout(1200)
    result = inspect_runtime(page)
    assert_common(result, expect_grid=params.get("showPlacementGrid") == "1")
    if params.get("showPlacementGrid") == "1":
        round_trip = page.evaluate(
            """
            () => {
              const before = window.__NEXUS_SCENE_EDITOR_EXPORT__();
              const applied = window.__NEXUS_SCENE_EDITOR_IMPORT__(before);
              const after = window.__NEXUS_SCENE_EDITOR_EXPORT__();
              const normalize = (payload) => payload.objects
                .filter((entry) => entry.slotId)
                .sort((a, b) => a.id.localeCompare(b.id));
              return {
                applied,
                equal: JSON.stringify(normalize(before)) === JSON.stringify(normalize(after))
              };
            }
            """
        )
        assert round_trip["applied"]["applied"] >= 8, round_trip
        assert round_trip["equal"], round_trip
        result["editorRoundTrip"] = round_trip
    forbidden_requests = [
        url for url in requests
        if "MoonlakeDiorama_r1/camp_structures" in url
        or "MoonlakeDiorama_r1/bg_night_base" in url
    ]
    assert not forbidden_requests, forbidden_requests
    canvas = page.locator("#game-root canvas").first
    canvas.screenshot(path=str(SCREENSHOTS / f"{name}.png"))

    if name == "day-clear-390x844":
        switched_regions = []
        for region_id in ["core", "mystic", "plains", "forge", "harbor", "tidal"]:
            switched_out = page.evaluate(
                "(regionId) => window.__NEXUS_HABITAT.switchHabitat(regionId)", region_id
            )
            assert switched_out
            page.wait_for_timeout(260)
            hidden = page.evaluate(
                "() => (window.__NEXUS_SCENE_EDITOR_OBJECTS || []).find((o) => o.__sceneEditor?.placement)?.parent?.visible"
            )
            assert hidden is False
            switched_regions.append(region_id)
        switched_back = page.evaluate("() => window.__NEXUS_HABITAT.switchHabitat('moonlake')")
        assert switched_back
        page.wait_for_timeout(500)
        restored = inspect_runtime(page)
        assert_common(restored, expect_grid=False)
        result["habitatRoundTrip"] = switched_regions

    assert not console_errors, console_errors
    assert not page_errors, page_errors
    context.close()
    return {
        "name": name,
        "viewport": viewport,
        "params": params,
        "result": result,
        "consoleErrors": console_errors,
        "pageErrors": page_errors,
        "forbiddenLegacyRequests": forbidden_requests,
        "screenshot": str((SCREENSHOTS / f"{name}.png").relative_to(ROOT))
    }


def main():
    cases = [
        ("day-clear-390x844", {"width": 390, "height": 844}, {"timePhase": "day", "weather": "clear"}),
        ("night-clear-390x844", {"width": 390, "height": 844}, {"timePhase": "night", "weather": "clear"}),
        ("day-mist-390x844", {"width": 390, "height": 844}, {"timePhase": "day", "weather": "mist"}),
        ("night-rain-390x664", {"width": 390, "height": 664}, {"timePhase": "night", "weather": "rain"}),
        ("dev-grid-390x844", {"width": 390, "height": 844}, {"devSceneEditor": "1", "showPlacementGrid": "1", "timePhase": "day", "weather": "clear"}),
    ]
    report = {"base": BASE, "cases": []}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, args=["--use-angle=swiftshader"])
        for case in cases:
            report["cases"].append(run_case(browser, *case))
        browser.close()
    report["passed"] = len(report["cases"]) == len(cases)
    (ROOT / "runtime-qa-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
