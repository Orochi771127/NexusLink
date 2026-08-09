"""Real Chromium proof for the default-invisible local HMAX Soul Talk shadow seam."""

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


ORDINARY_INPUT = "今天午餐吃了麵，湖邊的風很舒服"
HIGH_RISK_INPUT = "我剛剛一次吞了很多藥"
HOSTED_MARKER = "HMAX_MOCK_SHOULD_NEVER_BE_VISIBLE"
PIXI_CDN_URL = "https://cdn.jsdelivr.net/npm/pixi.js@8.8.1/dist/pixi.min.js"


def run():
    with local_static_server() as base:
        return run_browser(base)


def run_browser(base):
    base_dev = f"{base}?devPanel=1"
    report = {
        "browser": "chromium",
        "viewport": VIEWPORT,
        "console_errors": [],
        "checks": {},
    }
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport=VIEWPORT)
        page.route(PIXI_CDN_URL, lambda route: route.abort("failed"))
        page.on(
            "console",
            lambda msg: report["console_errors"].append(msg.text)
            if msg.type == "error"
            and not (
                (msg.location or {}).get("url") == PIXI_CDN_URL
                and "ERR_FAILED" in msg.text
            )
            else None,
        )
        page.on("pageerror", lambda error: report["console_errors"].append(str(error)))
        install_shadow_fixture(page)

        goto_ready(page, base_dev)
        page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
        reload_ready(page)
        time.sleep(1.5)
        for _ in range(2):
            touch = invoke_touch(page, "touch")
            time.sleep(0.5)
            if (touch.get("result") or {}).get("reaction") != "wake":
                break

        collapse_dev_panel(page)
        open_soul_talk(page)

        send(page, ORDINARY_INPUT)
        page.wait_for_function("() => window.__HMAX_SHADOW_RESULTS__.length === 1")
        ordinary_state = get_state(page)
        ordinary_lines = page.locator("#chat-log .chat-line").all_text_contents()
        ordinary_fetches = page.evaluate("() => window.__HMAX_SHADOW_FETCHES__.length")
        diagnostic = page.evaluate("() => window.__HMAX_SHADOW_RESULTS__[0]")
        report["checks"]["ordinary_shadow_attempted_once"] = ordinary_fetches == 1
        report["checks"]["hosted_speech_not_visible"] = not any(
            HOSTED_MARKER in line for line in ordinary_lines
        )
        report["checks"]["hosted_speech_not_persisted"] = HOSTED_MARKER not in json.dumps(
            ordinary_state, ensure_ascii=False
        )
        report["checks"]["diagnostic_has_no_raw_input_or_decision"] = (
            ORDINARY_INPUT not in json.dumps(diagnostic, ensure_ascii=False)
            and "decision" not in diagnostic
        )
        report["checks"]["shadow_audit_is_no_apply"] = diagnostic.get("audit") == {
            "displayedHostedSpeech": False,
            "appliedHostedEffects": False,
            "committedHostedMemory": False,
        }

        fetches_before_risk = ordinary_fetches
        send(page, HIGH_RISK_INPUT)
        time.sleep(0.5)
        risk_fetches = page.evaluate("() => window.__HMAX_SHADOW_FETCHES__.length")
        risk_state = get_state(page)
        risk_lines = page.locator("#chat-log .chat-line.system").all_text_contents()
        report["checks"]["high_risk_zero_hosted_request"] = (
            risk_fetches == fetches_before_risk
        )
        report["checks"]["high_risk_local_system_terminal_visible"] = bool(risk_lines)
        report["checks"]["high_risk_hosted_marker_absent"] = HOSTED_MARKER not in json.dumps(
            risk_state, ensure_ascii=False
        )

        report["shadow_fetch_count"] = risk_fetches
        report["shadow_result_count"] = page.evaluate(
            "() => window.__HMAX_SHADOW_RESULTS__.length"
        )
        browser.close()

    report["ok"] = all(report["checks"].values())
    report["console_error_count"] = len(report["console_errors"])
    return report


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


def install_shadow_fixture(page):
    page.add_init_script(
        f"""
        (() => {{
          const storageKey = "{STORAGE_KEY}";
          const seededAt = Date.now();
          if (!localStorage.getItem(storageKey)) {{
            localStorage.setItem(storageKey, JSON.stringify({{
              activeCompanionId: "greyshade-cat",
              unlockedCompanionIds: ["greyshade-cat"],
              playerProfile: {{ displayName: "HMAX Shadow QA", createdAt: seededAt, updatedAt: seededAt }},
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
          }}
          window.__HMAX_SHADOW_FETCHES__ = [];
          window.__HMAX_SHADOW_RESULTS__ = [];
          window.__NEXUS_RAPHAEL_HMAX_SHADOW__ = {{
            enabled: true,
            ownerOnly: true,
            cloudProcessingConsent: true,
            baseUrl: "http://127.0.0.1:8787",
            getAccessToken: async () => "browser-session-fixture-token",
            onResult: (event) => window.__HMAX_SHADOW_RESULTS__.push(event),
            fetchImpl: async (url, init) => {{
              const request = JSON.parse(init.body);
              window.__HMAX_SHADOW_FETCHES__.push({{
                url: String(url),
                requestId: request.requestId,
                retention: request.consent.retention,
                careProcessing: request.consent.careProcessing,
                hasAuthorization: init.headers.Authorization.startsWith("Bearer ")
              }});
              const decision = {{
                contractVersion: request.contractVersion,
                requestId: request.requestId,
                turnId: `hosted:${{request.requestId}}`,
                coreVersion: "hmax-browser-shadow-fixture-v1",
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
            }}
          }};
        }})();
        """
    )


def send(page, text):
    page.locator("#message-input").fill(text)
    page.locator("#send-button").click()
    time.sleep(1.0)


def goto_ready(page, url):
    page.goto(url, wait_until="commit", timeout=30000)
    page.wait_for_selector("#game-root", timeout=30000)
    wait_for_runtime(page)


def reload_ready(page):
    page.reload(wait_until="commit", timeout=30000)
    page.wait_for_selector("#game-root", timeout=30000)
    wait_for_runtime(page)


def wait_for_runtime(page):
    page.wait_for_function(
        "() => document.documentElement.dataset.nexusControllersReady === 'true'",
        timeout=30000,
    )
    page.wait_for_function(
        "() => document.documentElement.dataset.firstSessionLoader === 'complete'",
        timeout=30000,
    )


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["ok"] else 1)
