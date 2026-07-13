from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:4173"
OUT = Path(__file__).resolve().parent
errors = []
failed_requests = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, args=["--no-proxy-server"])
    page = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    page.on("console", lambda message: errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))
    page.on("requestfailed", lambda request: failed_requests.append(f"{request.url}: {request.failure}"))
    page.goto(f"{BASE}/output/map-pilots/linkara-moonlake-diorama-v1/runtime-harness.html", wait_until="networkidle")
    page.evaluate("""
      async () => {
        const [{ createAtlasController }, { createMapController }, { default: defaultState }] = await Promise.all([
          import('/src/ui/atlasController.js'),
          import('/src/ui/mapController.js'),
          import('/src/state/defaultState.js')
        ]);
        const state = structuredClone(defaultState);
        const store = { getState: () => state, updateState: () => {} };
        const panelManager = { openPanel: (name) => document.querySelector('.panel-layer').dataset.activePanel = name };
        window.__atlas = createAtlasController({ panelManager, store });
        window.__map = createMapController({ store, panelManager });
        window.__atlas.open();
      }
    """)
    page.wait_for_selector('.panel-layer[data-active-panel="atlas"] .atlas-map-art')
    page.wait_for_function("document.querySelector('.atlas-map-art')?.href?.baseVal?.length > 0")
    atlas = page.locator("#atlas-canvas")
    atlas.screenshot(path=str(OUT / "runtime-atlas-390x844.png"))
    atlas_metrics = page.evaluate("""
      () => {
        const canvas = document.querySelector('#atlas-canvas');
        const image = document.querySelector('.atlas-map-art');
        const nodes = [...document.querySelectorAll('.atlas-node')];
        const rect = canvas.getBoundingClientRect();
        return {
          canvas: { width: rect.width, height: rect.height },
          imageHref: image?.href?.baseVal || '',
          nodes: nodes.length,
          nodeBoundsValid: nodes.every((node) => {
            const box = node.getBoundingClientRect();
            return box.left >= rect.left - 1 && box.right <= rect.right + 1 && box.top >= rect.top - 1 && box.bottom <= rect.bottom + 1;
          })
        };
      }
    """)

    page.evaluate("window.__map.open()")
    page.wait_for_selector('#map-canvas.is-art-ready .map-art-layer')
    page.wait_for_function("document.querySelectorAll('.map-node.is-node-art-ready').length >= 6")
    map_canvas = page.locator("#map-canvas")
    map_canvas.screenshot(path=str(OUT / "runtime-moonlake-390x844.png"))
    map_metrics = page.evaluate("""
      () => {
        const canvas = document.querySelector('#map-canvas');
        const art = document.querySelector('.map-art-layer');
        const visibleNodes = [...document.querySelectorAll('.map-node:not([hidden])')];
        const rect = canvas.getBoundingClientRect();
        return {
          canvas: { width: rect.width, height: rect.height },
          artLoaded: art?.complete && art?.naturalWidth === 1200 && art?.naturalHeight === 1584,
          visibleNodes: visibleNodes.length,
          vignetteNodes: visibleNodes.filter((node) => node.classList.contains('is-node-art-ready')).length,
          nodeBoundsValid: visibleNodes.every((node) => {
            const box = node.getBoundingClientRect();
            return box.left >= rect.left - 2 && box.right <= rect.right + 2 && box.top >= rect.top - 2 && box.bottom <= rect.bottom + 2;
          })
        };
      }
    """)

    print({"atlas": atlas_metrics, "moonlake": map_metrics, "consoleErrors": errors, "failedRequests": failed_requests})
    assert atlas_metrics["nodes"] == 7
    assert atlas_metrics["nodeBoundsValid"]
    assert map_metrics["artLoaded"]
    assert map_metrics["visibleNodes"] >= 6
    assert map_metrics["vignetteNodes"] >= 6
    assert map_metrics["nodeBoundsValid"]
    assert not errors
    assert not failed_requests
    browser.close()
