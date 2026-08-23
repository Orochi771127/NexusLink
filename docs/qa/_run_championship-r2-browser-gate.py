import hashlib
import json
import os
import tempfile
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright


STORAGE_KEY = "nexusLinkR2State:v1"
PIXI_CDN = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"
OUTPUT_DIR = Path(os.environ.get("NEXUS_R2_QA_OUTPUT", Path(tempfile.gettempdir()) / "nexus-championship-r2-qa"))


def check(report, name, condition, detail=None):
    report["checks"].append({"name": name, "ok": bool(condition), "detail": detail})


def install_boundary_canary(context):
    seed = json.dumps({"canary": "production-state", "wallet": 777, "relationship": {"trust": 41}}, separators=(",", ":"))
    context.add_init_script(script=f"""(() => {{
      if (!['http:', 'https:'].includes(location.protocol)) return;
      const original = {{
        setItem: Storage.prototype.setItem,
        removeItem: Storage.prototype.removeItem,
        clear: Storage.prototype.clear,
        fetch: window.fetch,
        xhrOpen: XMLHttpRequest.prototype.open,
        idbOpen: indexedDB.open.bind(indexedDB),
        beacon: navigator.sendBeacon?.bind(navigator)
      }};
      original.setItem.call(localStorage, {json.dumps(STORAGE_KEY)}, {json.dumps(seed)});
      window.__R2_BOUNDARY_CALLS__ = {{ storage: [], fetch: [], xhr: [], indexedDb: [], beacon: [] }};
      Storage.prototype.setItem = function(key, value) {{ window.__R2_BOUNDARY_CALLS__.storage.push(['setItem', String(key)]); return original.setItem.call(this, key, value); }};
      Storage.prototype.removeItem = function(key) {{ window.__R2_BOUNDARY_CALLS__.storage.push(['removeItem', String(key)]); return original.removeItem.call(this, key); }};
      Storage.prototype.clear = function() {{ window.__R2_BOUNDARY_CALLS__.storage.push(['clear']); return original.clear.call(this); }};
      window.fetch = function(...args) {{ window.__R2_BOUNDARY_CALLS__.fetch.push(String(args[0])); return original.fetch.apply(this, args); }};
      XMLHttpRequest.prototype.open = function(method, url, ...rest) {{ window.__R2_BOUNDARY_CALLS__.xhr.push([String(method), String(url)]); return original.xhrOpen.call(this, method, url, ...rest); }};
      indexedDB.open = function(...args) {{ window.__R2_BOUNDARY_CALLS__.indexedDb.push(['open', String(args[0])]); return original.idbOpen(...args); }};
      if (original.beacon) navigator.sendBeacon = function(...args) {{ window.__R2_BOUNDARY_CALLS__.beacon.push(String(args[0])); return original.beacon(...args); }};
    }})()""")


def attach_errors(page):
    errors = []

    def on_console(message):
        if message.type != "error":
            return
        location = message.location or {}
        if ("pixi.min.js" in message.text or location.get("url") == PIXI_CDN) and "ERR_FAILED" in message.text:
            return
        errors.append(message.text)

    page.on("console", on_console)
    page.on("pageerror", lambda error: errors.append(str(error)))
    return errors


def external_resource_requests(requests, base_url):
    return [request for request in requests if not request["url"].startswith(f"{base_url}/")]


def layout_snapshot(page):
    return page.evaluate("""() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      canvasCount: document.querySelectorAll('.r2-canvas-host canvas').length,
      feedback: document.querySelector('.r2-feedback')?.textContent?.trim() || '',
      controls: [...document.querySelectorAll('button:not([disabled])')].map((button) => {
        const rect = button.getBoundingClientRect();
        return { text: button.textContent.trim(), width: rect.width, height: rect.height };
      }),
      revision: document.querySelector('#championship-r2-root')?.dataset.revision || null,
      paused: document.querySelector('#championship-r2-root')?.dataset.paused || null
    })""")


def run_disabled(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    install_boundary_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append(request.url))
    page.goto(f"{base_url}/research/championship-r2/index.html", wait_until="domcontentloaded")
    check(report, "disabled_gate_visible", page.locator("#r2-gate").is_visible())
    check(report, "disabled_root_hidden", page.locator("#championship-r2-root").is_hidden())
    check(report, "disabled_zero_r2_module_requests", not any("/src/championship/raising/" in url or "/presentation/r2/" in url for url in requests), requests)
    check(report, "disabled_zero_pixi_requests", not any("pixi" in url.lower() for url in requests), requests)
    check(report, "disabled_zero_canvas", page.locator("canvas").count() == 0)
    check(report, "disabled_zero_boundary_calls", all(not calls for calls in page.evaluate("() => window.__R2_BOUNDARY_CALLS__").values()))
    check(report, "disabled_no_console_errors", errors == [], errors)
    context.close()


def run_fallback(browser, base_url, report, width, height, reduced_motion=False, font_scale=1.0):
    context = browser.new_context(viewport={"width": width, "height": height}, reduced_motion="reduce" if reduced_motion else "no-preference")
    install_boundary_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append({"url": request.url, "resourceType": request.resource_type}))
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    before = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    if font_scale != 1.0:
        page.evaluate("scale => document.documentElement.style.fontSize = `${scale * 100}%`", font_scale)
    initial = layout_snapshot(page)
    start = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome")
    page.keyboard.press("ArrowLeft")
    page.get_by_role("button", name="Blazetail", exact=True).click()
    page.get_by_role("button", name="Short practice", exact=True).click()
    page.get_by_role("button", name="Pause rhythm", exact=True).click()
    page.get_by_role("button", name="Resume rhythm", exact=True).click()
    page.get_by_role("button", name="Advance 5 min", exact=True).click()
    final = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome")
    after = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    layout = layout_snapshot(page)
    calls = page.evaluate("() => window.__R2_BOUNDARY_CALLS__")
    label = f"fallback_{width}x{height}_font{int(font_scale * 100)}"
    check(report, f"{label}_interactive_flow", final["revision"] >= start["revision"] + 6 and final["selectedResidentId"] == "resident:blazetail-kit", {"start": start["revision"], "final": final["revision"]})
    check(report, f"{label}_production_save_unchanged", before == after, {"before": hashlib.sha256(before.encode()).hexdigest(), "after": hashlib.sha256(after.encode()).hexdigest()})
    check(report, f"{label}_zero_storage_api_mutation_calls", all(not values for values in calls.values()), calls)
    external_requests = external_resource_requests(requests, base_url)
    check(
        report,
        f"{label}_only_allowlisted_pixi_asset_egress",
        external_requests == [{"url": PIXI_CDN, "resourceType": "script"}],
        external_requests,
    )
    check(report, f"{label}_no_horizontal_overflow", initial["overflow"] <= 1 and layout["overflow"] <= 1, {"initial": initial["overflow"], "final": layout["overflow"]})
    check(report, f"{label}_touch_targets", all(control["height"] >= 44 for control in layout["controls"]), layout["controls"])
    check(report, f"{label}_dom_fallback", layout["canvasCount"] == 0)
    check(report, f"{label}_session_only_contract", "owned" not in json.dumps(final).lower() and "captured" not in json.dumps(final).lower())
    public_api_keys = page.evaluate("() => Object.keys(window.__NEXUS_CHAMPIONSHIP_R2__).sort()")
    check(report, f"{label}_public_api_is_read_only", public_api_keys == ["dispose", "getPresentationDiagnostics", "inspect"], public_api_keys)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / f"championship-r2-{label}.png"), full_page=True)
    page.evaluate("() => { window.__NEXUS_CHAMPIONSHIP_R2__.dispose(); }")
    check(report, f"{label}_dispose_clears_mount", page.locator("#championship-r2-root").evaluate("root => root.childElementCount") == 0)
    check(report, f"{label}_no_console_errors", errors == [], errors)
    context.close()


def run_save_remount_lifecycle(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
    install_boundary_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append({"url": request.url, "resourceType": request.resource_type}))
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    production_before = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    cycle_evidence = []

    for cycle in range(1, 21):
        page.get_by_role("button", name="Advance 5 min", exact=True).click()
        dirty = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
        save_button = page.get_by_role("button", name="Save", exact=True)
        dirty_ready = dirty["raisingSave"]["phase"] == "DIRTY" and dirty["raisingSave"]["dirty"] and save_button.is_enabled()
        save_button.click()
        saved = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
        saved_exact = (
            saved["raisingSave"]["phase"] == "SAVED"
            and not saved["raisingSave"]["dirty"]
            and saved["raisingSave"]["savedStateRevision"] == saved["raisingHome"]["revision"]
            and saved["raisingSave"]["savedStateDigest"] == saved["raisingSave"]["runtimeDigest"]
        )
        expected_state = {
            "revision": saved["raisingHome"]["revision"],
            "tick": saved["raisingHome"]["tick"],
            "caretakerPosition": saved["raisingHome"]["caretakerPosition"],
            "selectedResidentId": saved["raisingHome"]["selectedResidentId"],
            "runtimeDigest": saved["raisingSave"]["runtimeDigest"],
            "savedStateDigest": saved["raisingSave"]["savedStateDigest"],
        }
        page.get_by_role("button", name="Remount session", exact=True).click()
        page.wait_for_function(
            """expected => {
              const snapshot = window.__NEXUS_CHAMPIONSHIP_R2__?.inspect();
              return snapshot?.lifecycle?.active
                && snapshot.lifecycle.remountCount === expected
                && snapshot.raisingSave?.phase === 'RESTORED';
            }""",
            arg=cycle,
        )
        restored = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
        restored_exact = (
            restored["raisingHome"]["revision"] == expected_state["revision"]
            and restored["raisingHome"]["tick"] == expected_state["tick"]
            and restored["raisingHome"]["caretakerPosition"] == expected_state["caretakerPosition"]
            and restored["raisingHome"]["selectedResidentId"] == expected_state["selectedResidentId"]
            and restored["raisingSave"]["runtimeDigest"] == expected_state["runtimeDigest"]
            and restored["raisingSave"]["savedStateDigest"] == expected_state["savedStateDigest"]
            and restored["raisingSave"]["phase"] == "RESTORED"
            and not restored["raisingSave"]["dirty"]
        )
        cycle_evidence.append({
            "cycle": cycle,
            "dirtyReady": dirty_ready,
            "savedExact": saved_exact,
            "restoredExact": restored_exact,
            "revision": restored["raisingHome"]["revision"],
            "tick": restored["raisingHome"]["tick"],
            "digest": restored["raisingSave"]["runtimeDigest"],
        })

    final = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    production_after_cycles = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    calls = page.evaluate("() => window.__R2_BOUNDARY_CALLS__")
    external_requests = external_resource_requests(requests, base_url)
    check(
        report,
        "save_remount_20_actual_button_cycles_restore_exact_state",
        len(cycle_evidence) == 20 and all(
            entry["dirtyReady"] and entry["savedExact"] and entry["restoredExact"]
            for entry in cycle_evidence
        ),
        cycle_evidence,
    )
    check(
        report,
        "save_remount_20_cycles_dispose_and_port_accounting",
        final["lifecycle"] == {"mountCount": 21, "disposeCount": 20, "remountCount": 20, "active": True}
        and final["raisingSaveBoundary"]["memoryCommits"] == 20
        and final["raisingSaveBoundary"]["readRequests"] == 21
        and final["raisingSaveBoundary"]["browserStorageWrites"] == 0
        and final["raisingSaveBoundary"]["persistentWrites"] == 0
        and final["raisingSaveBoundary"]["networkMutations"] == 0,
        {"lifecycle": final["lifecycle"], "boundary": final["raisingSaveBoundary"]},
    )
    check(
        report,
        "save_remount_focus_returns_to_remount_control",
        page.evaluate("() => document.activeElement?.dataset.persistenceAction === 'remount'"),
    )
    check(report, "save_remount_production_save_unchanged", production_before == production_after_cycles)
    check(report, "save_remount_zero_browser_storage_or_network_mutations", all(not values for values in calls.values()), calls)
    check(
        report,
        "save_remount_only_one_allowlisted_pixi_attempt",
        external_requests == [{"url": PIXI_CDN, "resourceType": "script"}],
        external_requests,
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-save-remount-cycle-20.png"), full_page=True)

    saved_before_refresh = final["raisingHome"]
    page.reload(wait_until="domcontentloaded")
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    refreshed = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    production_after_refresh = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    check(
        report,
        "browser_refresh_loses_realm_local_save",
        saved_before_refresh["revision"] == 20
        and saved_before_refresh["tick"] == 20
        and refreshed["raisingHome"]["revision"] == 0
        and refreshed["raisingHome"]["tick"] == 0
        and refreshed["raisingSave"]["phase"] == "DIRTY"
        and refreshed["raisingSaveBoundary"]["slotCount"] == 0
        and refreshed["lifecycle"] == {"mountCount": 1, "disposeCount": 0, "remountCount": 0, "active": True},
        {"beforeRefresh": saved_before_refresh, "afterRefresh": refreshed},
    )
    check(report, "browser_refresh_production_save_still_unchanged", production_before == production_after_refresh)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-refresh-loss.png"), full_page=True)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
    check(report, "save_remount_final_dispose_clears_mount", page.locator("#championship-r2-root").evaluate("root => root.childElementCount") == 0)
    check(report, "save_remount_no_console_errors", errors == [], errors)
    context.close()


def run_save_failure_retry_export(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True)
    install_boundary_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append({"url": request.url, "resourceType": request.resource_type}))
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(
        f"{base_url}/research/championship-r2/index.html?championshipR2=1&r2SaveFailure=once",
        wait_until="domcontentloaded",
    )
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    production_before = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    page.get_by_role("button", name="Advance 5 min", exact=True).click()
    page.get_by_role("button", name="Save", exact=True).click()
    failed = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    failed_ui = page.locator(".r2-save-status")
    check(
        report,
        "save_failure_is_assertive_never_success",
        failed["raisingSave"]["phase"] == "SAVE_FAILED"
        and failed["raisingSave"]["lastCode"] == "CHAMPIONSHIP_R2_SAVE_INJECTED_FAILURE"
        and failed["raisingSave"]["dirty"]
        and failed["raisingSave"]["canRetry"]
        and failed_ui.get_attribute("role") == "alert"
        and failed_ui.get_attribute("aria-live") == "assertive"
        and "is-failure" in (failed_ui.get_attribute("class") or "")
        and "is-success" not in (failed_ui.get_attribute("class") or "")
        and page.get_by_role("button", name="Retry", exact=True).is_enabled()
        and page.get_by_role("button", name="Export recovery", exact=True).is_enabled()
        and page.get_by_role("button", name="Remount session", exact=True).is_disabled(),
        {"status": failed["raisingSave"], "class": failed_ui.get_attribute("class"), "text": failed_ui.text_content()},
    )

    page.get_by_role("button", name="Export recovery", exact=True).click()
    recovery = page.locator("#r2-recovery-json")
    recovery_serialized = recovery.input_value()
    recovery_document = json.loads(recovery_serialized)
    exported = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    check(
        report,
        "save_failure_export_recovery_ui_contains_verified_dirty_state",
        recovery.is_visible()
        and recovery.get_attribute("readonly") is not None
        and recovery_document["schemaVersion"] == 2
        and recovery_document["payload"]["stateRevision"] == failed["raisingHome"]["revision"]
        and exported["raisingSave"]["phase"] == "SAVE_FAILED"
        and exported["raisingSave"]["dirty"],
        {"bytes": len(recovery_serialized.encode("utf-8")), "status": exported["raisingSave"]},
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-save-failure-export.png"), full_page=True)

    page.get_by_role("button", name="Retry", exact=True).click()
    retried = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    retry_ui = page.locator(".r2-save-status")
    check(
        report,
        "save_retry_same_realm_commits_without_false_failure",
        retried["raisingSave"]["phase"] == "SAVED"
        and not retried["raisingSave"]["dirty"]
        and not retried["raisingSave"]["canRetry"]
        and retried["raisingSaveBoundary"]["injectedFailures"] == 1
        and retried["raisingSaveBoundary"]["memoryCommits"] == 1
        and retry_ui.get_attribute("role") == "status"
        and retry_ui.get_attribute("aria-live") == "polite"
        and "is-failure" not in (retry_ui.get_attribute("class") or "")
        and page.get_by_role("button", name="Retry", exact=True).is_disabled()
        and page.get_by_role("button", name="Remount session", exact=True).is_enabled(),
        {"status": retried["raisingSave"], "boundary": retried["raisingSaveBoundary"]},
    )
    page.get_by_role("button", name="Remount session", exact=True).click()
    page.wait_for_function("""() => {
      const snapshot = window.__NEXUS_CHAMPIONSHIP_R2__?.inspect();
      return snapshot?.lifecycle?.remountCount === 1 && snapshot.raisingSave?.phase === 'RESTORED';
    }""")
    restored = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect()")
    check(
        report,
        "save_retry_then_actual_remount_restores_state",
        restored["raisingHome"]["revision"] == retried["raisingHome"]["revision"]
        and restored["raisingHome"]["tick"] == retried["raisingHome"]["tick"]
        and restored["raisingSave"]["runtimeDigest"] == retried["raisingSave"]["runtimeDigest"]
        and restored["raisingSave"]["phase"] == "RESTORED",
        {"before": retried, "after": restored},
    )
    calls = page.evaluate("() => window.__R2_BOUNDARY_CALLS__")
    production_after = page.evaluate(f"() => localStorage.getItem({json.dumps(STORAGE_KEY)})")
    check(report, "save_failure_flow_zero_storage_or_network_mutations", all(not values for values in calls.values()), calls)
    check(report, "save_failure_flow_production_save_unchanged", production_before == production_after)
    check(
        report,
        "save_failure_flow_only_allowlisted_pixi_attempt",
        external_resource_requests(requests, base_url) == [{"url": PIXI_CDN, "resourceType": "script"}],
        external_resource_requests(requests, base_url),
    )
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-save-retry-restored.png"), full_page=True)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
    check(report, "save_failure_flow_no_console_errors", errors == [], errors)
    context.close()


def run_dom_spatial_care(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    page.get_by_role("button", name="Blazetail", exact=True).click()
    spatial_before = page.locator(".r2-spatial-status").text_content()
    page.keyboard.press("ArrowUp")
    page.keyboard.press("ArrowUp")
    for _ in range(6):
        page.keyboard.press("ArrowRight")
    page.get_by_role("button", name="Offer care", exact=True).click()
    spatial_after = page.locator(".r2-spatial-status").text_content()
    feedback = page.locator(".r2-feedback").text_content()
    state = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome")
    check(
        report,
        "dom_fallback_exposes_spatial_guidance_and_completes_care",
        "Distance 8" in spatial_before and "Distance 0" in spatial_after and "accepts the care offering" in feedback and state["caretakerPosition"] == {"x": 18, "y": 8},
        {"before": spatial_before, "after": spatial_after, "feedback": feedback, "position": state["caretakerPosition"]}
    )
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
    context.close()


def run_landscape_touch(browser, base_url, report):
    context = browser.new_context(viewport={"width": 844, "height": 390}, has_touch=True)
    page = context.new_page()
    page.route(PIXI_CDN, lambda route: route.abort("failed"))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
    page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
    before = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome")
    move_up = page.get_by_role("button", name="Move up", exact=True)
    move_up.tap(timeout=5_000)
    after = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome")
    layout = layout_snapshot(page)
    distance = abs(after["caretakerPosition"]["x"] - before["caretakerPosition"]["x"]) + abs(after["caretakerPosition"]["y"] - before["caretakerPosition"]["y"])
    check(
        report,
        "landscape_844x390_real_tap_moves_exactly_one_tile",
        after["revision"] == before["revision"] + 1 and distance == 1 and layout["overflow"] <= 1 and all(control["height"] >= 44 for control in layout["controls"]),
        {"before": before["caretakerPosition"], "after": after["caretakerPosition"], "revisionDelta": after["revision"] - before["revision"], "distance": distance, "overflow": layout["overflow"]}
    )
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-fallback_844x390_touch.png"), full_page=True)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
    context.close()


def run_motion_preference_invariance(browser, base_url, report):
    snapshots = {}
    for preference in ("no-preference", "reduce"):
        context = browser.new_context(viewport={"width": 390, "height": 844}, reduced_motion=preference)
        page = context.new_page()
        page.route(PIXI_CDN, lambda route: route.abort("failed"))
        page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
        page.wait_for_function("() => Boolean(window.__NEXUS_CHAMPIONSHIP_R2__)")
        page.wait_for_timeout(2200)
        snapshots[preference] = page.evaluate("() => { const state = window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome; return { revision: state.revision, tick: state.tick }; }")
        page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
        context.close()
    check(
        report,
        "motion_preference_does_not_change_simulation",
        snapshots["no-preference"] == snapshots["reduce"] == {"revision": 0, "tick": 0},
        snapshots
    )


def run_early_pagehide(browser, base_url, report):
    context = browser.new_context(viewport={"width": 390, "height": 844})
    page = context.new_page()
    held_routes = []
    page.route(PIXI_CDN, lambda route: held_routes.append(route))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded")
    page.wait_for_selector(".r2-hud")
    page.wait_for_timeout(100)
    page.evaluate("() => window.dispatchEvent(new PageTransitionEvent('pagehide'))")
    for route in held_routes:
        route.abort("failed")
    page.wait_for_timeout(100)
    state = page.evaluate("""() => ({
      published: Boolean(window.__NEXUS_CHAMPIONSHIP_R2__),
      children: document.querySelector('#championship-r2-root').childElementCount,
      canvases: document.querySelectorAll('.r2-canvas-host canvas').length
    })""")
    check(
        report,
        "early_pagehide_aborts_boot_and_clears_mount",
        bool(held_routes) and state == {"published": False, "children": 0, "canvases": 0},
        {"heldPixiRequests": len(held_routes), "state": state}
    )
    context.close()


def run_pixi(browser, base_url, report):
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    install_boundary_canary(context)
    page = context.new_page()
    errors = attach_errors(page)
    requests = []
    page.on("request", lambda request: requests.append({"url": request.url, "resourceType": request.resource_type}))
    page.goto(f"{base_url}/research/championship-r2/index.html?championshipR2=1", wait_until="domcontentloaded", timeout=30_000)
    page.wait_for_selector(".r2-canvas-host canvas", state="visible", timeout=60_000)
    canvas = page.locator(".r2-canvas-host canvas")
    script = page.locator('script[data-championship-pixi="r2"]')
    check(report, "pixi_single_canvas", canvas.count() == 1)
    check(report, "pixi_canvas_accessibility_hidden", canvas.get_attribute("aria-hidden") == "true" and canvas.get_attribute("tabindex") == "-1")
    check(report, "pixi_pinned_sri", script.count() == 1 and script.get_attribute("integrity") == "sha384-zdhGmV2SoYr+2tn3rLxuKWeeNdIcsEK3qFdEqFlmHOPdYCbq++efc+FP7DE8r4kC")
    page.get_by_role("button", name="Hunt", exact=True).click()
    mode_notice_visible = page.locator(".r2-canvas-fallback").is_visible()
    page.get_by_role("button", name="Home", exact=True).click()
    check(report, "pixi_home_restores_field_after_unmounted_mode_notice", mode_notice_visible and page.locator(".r2-canvas-fallback").is_hidden() and canvas.is_visible())
    before = page.evaluate("() => { const state = window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome; return { position: state.caretakerPosition, revision: state.revision }; }")
    box = canvas.bounding_box()
    page.mouse.click(box["x"] + box["width"] * 0.25, box["y"] + box["height"] * 0.7)
    after = page.evaluate("() => { const state = window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome; return { position: state.caretakerPosition, revision: state.revision }; }")
    distance = abs(after["position"]["x"] - before["position"]["x"]) + abs(after["position"]["y"] - before["position"]["y"])
    check(report, "pixi_pointer_maps_to_exactly_one_tile_intent", distance == 1 and after["revision"] == before["revision"] + 1, {"before": before, "after": after, "distance": distance})
    frame_intervals = page.evaluate("""() => new Promise(resolve => {
      const samples = []; let previous = performance.now();
      const frame = now => { samples.push(now - previous); previous = now; if (samples.length >= 90) resolve(samples.slice(5)); else requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
    })""")
    ordered = sorted(frame_intervals)
    median = ordered[len(ordered) // 2]
    p95 = ordered[int(len(ordered) * 0.95)]
    workload = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.getPresentationDiagnostics()")
    check(report, "pixi_render_workload_under_16_67ms", workload["averageMs"] <= 16.67 and workload["p95Ms"] <= 16.67, {"workload": workload, "headlessRafMeasurement": {"medianMs": median, "p95Ms": p95, "releaseConclusion": "INCONCLUSIVE_HEADLESS_LIMITED"}})
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-pixi-1280x900.png"), full_page=True)
    before_context_loss = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome.revision")
    page.evaluate("""() => {
      const canvas = document.querySelector('.r2-canvas-host canvas');
      canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
    }""")
    page.get_by_role("button", name="Advance 5 min", exact=True).click()
    after_context_loss = page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.inspect().raisingHome.revision")
    check(
        report,
        "pixi_context_loss_keeps_dom_gameplay_and_save_authority_outside_canvas",
        canvas.is_hidden()
        and page.locator(".r2-canvas-fallback").is_visible()
        and "context was lost" in page.locator(".r2-canvas-fallback").text_content()
        and after_context_loss == before_context_loss + 1
        and page.get_by_role("button", name="Save", exact=True).is_enabled(),
        {"beforeRevision": before_context_loss, "afterRevision": after_context_loss},
    )
    check(report, "pixi_zero_storage_api_mutation_calls", all(not values for values in page.evaluate("() => window.__R2_BOUNDARY_CALLS__").values()))
    external_requests = external_resource_requests(requests, base_url)
    check(
        report,
        "pixi_exact_allowlisted_asset_egress",
        external_requests == [{"url": PIXI_CDN, "resourceType": "script"}],
        external_requests,
    )
    page.screenshot(path=str(OUTPUT_DIR / "championship-r2-pixi-context-loss.png"), full_page=True)
    page.evaluate("() => window.__NEXUS_CHAMPIONSHIP_R2__.dispose()")
    check(report, "pixi_dispose_removes_canvas", page.locator("canvas").count() == 0)
    check(report, "pixi_no_console_errors", errors == [], errors)
    context.close()


def main():
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, format, *args):
            return

    repo_root = Path(__file__).resolve().parents[2]
    server = ThreadingHTTPServer(("127.0.0.1", 0), partial(QuietHandler, directory=str(repo_root)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}"
    report = {"checks": [], "outputDir": str(OUTPUT_DIR)}
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            run_disabled(browser, base_url, report)
            run_fallback(browser, base_url, report, 390, 844)
            run_fallback(browser, base_url, report, 1280, 900)
            run_fallback(browser, base_url, report, 390, 844, reduced_motion=True, font_scale=2.0)
            run_save_remount_lifecycle(browser, base_url, report)
            run_save_failure_retry_export(browser, base_url, report)
            run_dom_spatial_care(browser, base_url, report)
            run_landscape_touch(browser, base_url, report)
            run_motion_preference_invariance(browser, base_url, report)
            run_early_pagehide(browser, base_url, report)
            run_pixi(browser, base_url, report)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)
    failures = [entry for entry in report["checks"] if not entry["ok"]]
    report["summary"] = {"total": len(report["checks"]), "passed": len(report["checks"]) - len(failures), "failed": len(failures), "ok": not failures}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(1 if failures else 0)


if __name__ == "__main__":
    main()
