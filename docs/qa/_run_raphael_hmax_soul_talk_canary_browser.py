"""Chromium proof for the disabled-by-default, owner-only HMAX Soul Talk canary."""

import json
import time
from contextlib import contextmanager
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread

from playwright.sync_api import sync_playwright

from _run_live_playtest_gate import (
    STORAGE_KEY,
    VIEWPORT,
    collapse_dev_panel,
    get_state,
    invoke_touch,
    open_soul_talk,
)


ORDINARY_INPUT = "今天有點累，想安靜說幾句。"
HIGH_RISK_INPUT = "我剛剛一次吞了很多藥。"
HOSTED_MARKER = "HMAX_CANARY_BROWSER_VISIBLE_ONCE"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"


def run():
    with local_static_server() as base:
        return run_browser(base)


def run_browser(base):
    report = {
        "browser": "chromium",
        "viewport": VIEWPORT,
        "console_errors": [],
        "checks": {},
    }
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)

        baseline = run_ordinary_scenario(browser, base, mode="disabled", report=report)
        canary = run_ordinary_scenario(browser, base, mode="valid", report=report)
        report["checks"]["default_disabled_zero_network"] = baseline["fetches"] == 0
        report["checks"]["default_disabled_keeps_embedded_speech"] = (
            HOSTED_MARKER not in baseline["lines"] and baseline["companion_count"] > 0
        )
        report["checks"]["owner_canary_fetches_once"] = canary["fetches"] == 1
        report["checks"]["hosted_speech_replaces_exactly_once"] = (
            canary["lines"].count(HOSTED_MARKER) == 1
            and canary["chat_marker_count"] == 1
            and canary["chat_length"] == baseline["chat_length"]
            and canary["companion_count"] == baseline["companion_count"]
        )
        report["checks"]["hosted_speech_not_persisted"] = HOSTED_MARKER not in canary["persisted"]
        report["checks"]["canary_does_not_add_gameplay_mutation"] = canary["gameplay"] == baseline["gameplay"]
        report["checks"]["application_audit_is_speech_only"] = any(
            event.get("reason") == "candidate_applied"
            and event.get("audit") == {
                "displayedHostedSpeech": True,
                "appliedHostedEffects": False,
                "committedHostedMemory": False,
                "directGameMutation": False,
            }
            for event in canary["diagnostics"]
        )
        report["checks"]["diagnostics_redact_raw_input_and_speech"] = (
            ORDINARY_INPUT not in json.dumps(canary["diagnostics"], ensure_ascii=False)
            and HOSTED_MARKER not in json.dumps(canary["diagnostics"], ensure_ascii=False)
        )

        timeout = run_ordinary_scenario(browser, base, mode="timeout", report=report)
        report["checks"]["timeout_keeps_single_embedded_result"] = (
            timeout["fetches"] == 1
            and HOSTED_MARKER not in timeout["lines"]
            and timeout["chat_length"] == baseline["chat_length"]
            and timeout["companion_count"] == baseline["companion_count"]
            and any(event.get("reason") == "hosted_timeout" for event in timeout["diagnostics"])
        )

        killed = run_ordinary_scenario(browser, base, mode="kill_switch", report=report)
        report["checks"]["kill_switch_zero_network"] = (
            killed["fetches"] == 0 and HOSTED_MARKER not in killed["lines"]
        )

        high_risk = run_high_risk_scenario(browser, base, report)
        report["checks"]["high_risk_zero_hosted_request"] = high_risk["fetches"] == 0
        report["checks"]["high_risk_local_system_terminal"] = (
            high_risk["system_count"] > 0 and HOSTED_MARKER not in high_risk["lines"]
        )

        panel_closed = run_late_scenario(browser, base, report, mutation="close_panel")
        report["late_scenarios"] = {"panel_closed": panel_closed}
        report["checks"]["closed_panel_blocks_late_candidate"] = (
            panel_closed["fetches"] == 1 and not panel_closed["hosted_marker_present"]
        )
        in_flight_kill = run_late_scenario(browser, base, report, mutation="kill_switch")
        report["late_scenarios"]["in_flight_kill"] = in_flight_kill
        report["checks"]["in_flight_kill_blocks_late_candidate"] = (
            in_flight_kill["fetches"] == 1
            and not in_flight_kill["hosted_marker_present"]
            and any(event.get("reason") == "canary_disabled_in_flight" for event in in_flight_kill["diagnostics"])
        )
        state_stale = run_late_scenario(browser, base, report, mutation="state_change")
        report["late_scenarios"]["state_stale"] = state_stale
        report["checks"]["state_change_blocks_late_candidate"] = (
            state_stale["fetches"] == 1
            and not state_stale["hosted_marker_present"]
            and any(event.get("reason") == "stale_turn" for event in state_stale["diagnostics"])
        )

        browser.close()

    report["ok"] = all(report["checks"].values()) and not report["console_errors"]
    report["console_error_count"] = len(report["console_errors"])
    return report


def run_ordinary_scenario(browser, base, mode, report):
    page = new_page(browser, report)
    install_fixture(page, mode)
    prepare(page, base)
    send(page, ORDINARY_INPUT)
    if mode == "valid":
        page.wait_for_function(
            "() => window.__HMAX_CANARY_RESULTS__.some((event) => event.reason === 'candidate_applied')",
            timeout=5000,
        )
    elif mode == "timeout":
        page.wait_for_function(
            "() => window.__HMAX_CANARY_RESULTS__.some((event) => event.reason === 'hosted_timeout')",
            timeout=5000,
        )
    else:
        time.sleep(0.5)
    snapshot = scenario_snapshot(page)
    page.close()
    return snapshot


def run_high_risk_scenario(browser, base, report):
    page = new_page(browser, report)
    install_fixture(page, "valid")
    prepare(page, base)
    send(page, HIGH_RISK_INPUT)
    time.sleep(0.5)
    state = get_state(page)
    snapshot = {
        "fetches": page.evaluate("() => window.__HMAX_CANARY_FETCHES__.length"),
        "system_count": len(page.locator("#chat-log .chat-line.system").all_text_contents()),
        "lines": "\n".join(page.locator("#chat-log .chat-line").all_text_contents()),
        "state_json": json.dumps(state, ensure_ascii=False),
    }
    page.close()
    return snapshot


def run_late_scenario(browser, base, report, mutation):
    page = new_page(browser, report)
    install_fixture(page, "deferred")
    prepare(page, base)
    send(page, ORDINARY_INPUT, delay=0.1)
    page.wait_for_function("() => window.__HMAX_CANARY_FETCHES__.length === 1", timeout=5000)
    if mutation == "close_panel":
        page.evaluate("() => document.querySelector('[data-panel=\"soulTalk\"] [data-panel-close]').click()")
        page.wait_for_function(
            "() => document.querySelector('.panel-layer').dataset.activePanel === 'none'",
            timeout=5000,
        )
    elif mutation == "kill_switch":
        page.evaluate("() => { window.__NEXUS_RAPHAEL_HMAX_CANARY__.killSwitch = true; }")
    elif mutation == "state_change":
        page.evaluate(
            """async () => {
              const store = await import('./src/state/store.js');
              store.updateState((state) => { state.energy = Math.max(0, Number(state.energy || 0) - 1); });
            }"""
        )
    page.evaluate("() => window.__HMAX_CANARY_RELEASE__()")
    time.sleep(0.6)
    state_json = json.dumps(get_state(page), ensure_ascii=False)
    snapshot = {
        "fetches": page.evaluate("() => window.__HMAX_CANARY_FETCHES__.length"),
        "diagnostics": page.evaluate("() => window.__HMAX_CANARY_RESULTS__"),
        "active_panel": page.evaluate("() => document.querySelector('.panel-layer').dataset.activePanel"),
        "hosted_marker_present": HOSTED_MARKER in state_json,
    }
    page.close()
    return snapshot


def scenario_snapshot(page):
    state = get_state(page)
    lines = page.locator("#chat-log .chat-line").all_text_contents()
    chat = state.get("chatHistory") or []
    return {
        "fetches": page.evaluate("() => window.__HMAX_CANARY_FETCHES__.length"),
        "diagnostics": page.evaluate("() => window.__HMAX_CANARY_RESULTS__"),
        "lines": "\n".join(lines),
        "chat_marker_count": sum(1 for item in chat if HOSTED_MARKER in item.get("text", "")),
        "chat_length": len(chat),
        "companion_count": sum(1 for item in chat if item.get("role") == "companion"),
        "persisted": page.evaluate(f"() => localStorage.getItem('{STORAGE_KEY}') || ''"),
        "gameplay": gameplay_projection(state),
    }


def gameplay_projection(state):
    return {
        "bond": state.get("bond"),
        "trust": state.get("trust"),
        "defense": state.get("defense"),
        "energy": state.get("energy"),
        "mood": state.get("mood"),
        "memoryCount": len(state.get("emotionalMemories") or []),
        "anchorCount": len(state.get("companionAnchors") or []),
        "traceCount": len(state.get("habitatTraces") or []),
        "growth": state.get("companionGrowth"),
    }


def new_page(browser, report):
    page = browser.new_page(viewport=VIEWPORT)
    page.route(PIXI_CDN_URL, lambda route: route.abort("failed"))

    def on_console(msg):
        if msg.type != "error":
            return
        if (msg.location or {}).get("url") == PIXI_CDN_URL and "ERR_FAILED" in msg.text:
            return
        report["console_errors"].append(msg.text)

    page.on("console", on_console)
    page.on("pageerror", lambda error: report["console_errors"].append(str(error)))
    return page


def install_fixture(page, mode):
    config_enabled = mode != "disabled"
    kill_switch = mode == "kill_switch"
    fetch_body = deferred_fetch_body() if mode == "deferred" else timeout_fetch_body() if mode == "timeout" else immediate_fetch_body()
    page.add_init_script(
        f"""
        (() => {{
          const storageKey = "{STORAGE_KEY}";
          const seededAt = 1786435200000;
          localStorage.setItem(storageKey, JSON.stringify({{
            activeCompanionId: "greyshade-cat",
            unlockedCompanionIds: ["greyshade-cat"],
            playerProfile: {{ displayName: "HMAX Canary QA", createdAt: seededAt, updatedAt: seededAt }},
            onboarding: {{
              status: "completed",
              completed: true,
              completedAt: seededAt,
              identityCompleted: true,
              guidanceCompleted: true,
              greyshadeMetAt: seededAt,
              firstLoop: {{ completedAt: seededAt }}
            }},
            firstTouchCompleted: true,
            firstHugCompleted: true,
            energy: 7,
            touchFatigue: 0,
            mood: "calm",
            defense: 10,
            bond: 12,
            trust: 12,
            safeHarborMode: false,
            lastSeenAt: seededAt
          }}));
          window.__HMAX_CANARY_FETCHES__ = [];
          window.__HMAX_CANARY_RESULTS__ = [];
          window.__HMAX_CANARY_RELEASE__ = () => {{}};
          {canary_config_script(config_enabled, kill_switch, fetch_body)}
        }})();
        """
    )


def canary_config_script(enabled, kill_switch, fetch_body):
    if not enabled:
        return "delete window.__NEXUS_RAPHAEL_HMAX_CANARY__;"
    return f"""
      window.__NEXUS_RAPHAEL_HMAX_CANARY__ = {{
        enabled: true,
        ownerOnly: true,
        cloudProcessingConsent: true,
        visibleSpeechApproved: true,
        killSwitch: {str(kill_switch).lower()},
        timeoutMs: 250,
        baseUrl: "http://127.0.0.1:8787",
        getAccessToken: async () => "browser-owner-session-token",
        onResult: (event) => window.__HMAX_CANARY_RESULTS__.push(event),
        fetchImpl: {fetch_body}
      }};
    """


def immediate_fetch_body():
    return decision_fetch_prefix() + decision_fetch_suffix()


def deferred_fetch_body():
    return decision_fetch_prefix() + "await new Promise((resolve) => { window.__HMAX_CANARY_RELEASE__ = resolve; });" + decision_fetch_suffix()


def timeout_fetch_body():
    return """async (url, init) => {
      const request = JSON.parse(init.body);
      window.__HMAX_CANARY_FETCHES__.push({ url: String(url), requestId: request.requestId });
      await new Promise((resolve, reject) => {
        const fail = () => { const error = new Error('aborted'); error.name = 'AbortError'; reject(error); };
        if (init.signal.aborted) fail(); else init.signal.addEventListener('abort', fail, { once: true });
      });
      throw new Error('unreachable');
    }"""


def decision_fetch_prefix():
    return """async (url, init) => {
      const request = JSON.parse(init.body);
      window.__HMAX_CANARY_FETCHES__.push({
        url: String(url),
        requestId: request.requestId,
        retention: request.consent.retention,
        careProcessing: request.consent.careProcessing,
        hasAuthorization: init.headers.Authorization.startsWith('Bearer ')
      });
    """


def decision_fetch_suffix():
    return f"""
      const decision = {{
        contractVersion: request.contractVersion,
        requestId: request.requestId,
        turnId: `hosted:${{request.requestId}}`,
        coreVersion: "hmax-browser-canary-fixture-v1",
        authority: {{
          cognition: "RaphaelCore",
          speech: "RaphaelCore",
          memoryEligibility: "RaphaelCore",
          persistence: "MemoryPort",
          gameMutation: "NexusLinkReducer"
        }},
        safety: {{ level: "none", category: "none", terminal: false, localOnly: false }},
        speech: {{ role: "companion", text: "{HOSTED_MARKER}", final: true }},
        affect: null,
        boundary: {{ active: false }},
        supportDecision: {{ mode: "ordinary", source: "browser-fixture" }},
        memoryProposals: [],
        effectProposals: [],
        audit: {{
          modelTrusted: false,
          directGameMutation: false,
          rawInputPersisted: false,
          rawInputExported: false
        }}
      }};
      return {{ ok: true, status: 200, text: async () => JSON.stringify(decision) }};
    }}"""


def prepare(page, base):
    page.goto(f"{base}?devPanel=1", wait_until="commit", timeout=30000)
    page.wait_for_selector("#game-root", timeout=30000)
    wait_for_runtime(page)
    time.sleep(0.8)
    for _ in range(2):
        touch = invoke_touch(page, "touch")
        time.sleep(0.3)
        if (touch.get("result") or {}).get("reaction") != "wake":
            break
    collapse_dev_panel(page)
    open_soul_talk(page)


def send(page, text, delay=0.8):
    page.locator("#message-input").fill(text)
    page.locator("#send-button").click()
    time.sleep(delay)


def wait_for_runtime(page):
    page.wait_for_function(
        "() => document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=30000,
    )
    page.wait_for_function(
        "() => document.documentElement.dataset.firstSessionLoader === 'complete'",
        timeout=30000,
    )


@contextmanager
def local_static_server():
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, _format, *_args):
            return

    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["ok"] else 1)
