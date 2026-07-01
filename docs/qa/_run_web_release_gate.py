"""Nexus Link Steam Demo Web Release Gate.

This runner is intentionally product-read-only. It starts or reuses a local
HTTP server, runs existing Raphael/browser gates, adds state-migration,
asset-integrity, and lightweight accessibility probes, then writes a machine
readable summary to docs/qa/_web_release_gate_output.json.
"""

from __future__ import annotations

import argparse
import json
import os
import socket
import struct
import subprocess
import sys
import tempfile
import textwrap
import time
from pathlib import Path

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PORT = 5173
DEFAULT_BASE = f"http://localhost:{DEFAULT_PORT}"
OUTPUT_PATH = ROOT / "docs" / "qa" / "_web_release_gate_output.json"
STORAGE_KEY = "nexusLinkR2State:v1"
CHROMIUM_QA_ARGS = [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
]


def configure_stdio() -> None:
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure:
            reconfigure(encoding="utf-8", errors="replace")


def resolve_node() -> str:
    explicit = os.environ.get("NEXUS_NODE")
    candidates = [
        explicit,
        str(
            Path.home()
            / ".cache"
            / "codex-runtimes"
            / "codex-primary-runtime"
            / "dependencies"
            / "node"
            / "bin"
            / ("node.exe" if os.name == "nt" else "node")
        ),
        "node",
    ]
    for candidate in candidates:
        if not candidate:
            continue
        try:
            result = subprocess.run(
                [candidate, "--version"],
                cwd=ROOT,
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace",
                timeout=10,
                check=False,
            )
            if result.returncode == 0:
                return candidate
        except (FileNotFoundError, subprocess.SubprocessError):
            continue
    raise RuntimeError("No usable Node runtime found. Set NEXUS_NODE to the bundled node.exe path.")


def port_is_open(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.4)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def wait_for_port(port: int, timeout: float = 10.0) -> bool:
    deadline = time.time() + timeout
    while time.time() < deadline:
        if port_is_open(port):
            return True
        time.sleep(0.1)
    return False


def start_http_server(port: int):
    if port_is_open(port):
        return None, "reused_existing_server"
    proc = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(port)],
        cwd=ROOT,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.STDOUT,
        text=True,
    )
    if not wait_for_port(port):
        proc.terminate()
        raise RuntimeError(f"Local HTTP server did not start on port {port}")
    return proc, "started_local_http_server"


def run_command(name: str, command: list[str], env: dict[str, str] | None = None, timeout: int = 120):
    started = time.time()
    merged_env = os.environ.copy()
    merged_env["PYTHONIOENCODING"] = "utf-8"
    merged_env["PYTHONUTF8"] = "1"
    if env:
        merged_env.update(env)

    result = subprocess.run(
        command,
        cwd=ROOT,
        env=merged_env,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=timeout,
        check=False,
    )
    payload = parse_json_from_stdout(result.stdout)
    return {
        "name": name,
        "command": command,
        "exit_code": result.returncode,
        "duration_ms": int((time.time() - started) * 1000),
        "ok": result.returncode == 0,
        "json": payload,
        "stdout_tail": result.stdout[-1200:],
        "stderr_tail": result.stderr[-1200:],
    }


def parse_json_from_stdout(stdout: str):
    text = (stdout or "").strip()
    if not text:
        return None
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start = text.find("{")
        end = text.rfind("}")
        if start >= 0 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except json.JSONDecodeError:
                return None
    return None


def run_js_syntax(node: str):
    files = sorted((ROOT / "src").rglob("*.js"))
    files.extend(sorted((ROOT / "docs" / "qa").glob("*.mjs")))
    failed = []
    for file_path in files:
      rel = file_path.relative_to(ROOT).as_posix()
      result = subprocess.run(
          [node, "--check", rel],
          cwd=ROOT,
          capture_output=True,
          text=True,
          encoding="utf-8",
          errors="replace",
          timeout=20,
          check=False,
      )
      if result.returncode != 0:
          failed.append({
              "file": rel,
              "stdout": result.stdout,
              "stderr": result.stderr,
          })
    return {
        "name": "js_syntax",
        "total": len(files),
        "failed": failed,
        "ok": not failed,
    }


def run_state_migration(node: str):
    result = run_command(
        "state_onboarding_migration",
        [node, "docs/qa/state-onboarding-migration-cases.mjs"],
        timeout=30,
    )
    payload = result.get("json") or {}
    result["ok"] = result["exit_code"] == 0 and payload.get("failed") == 0
    return result


def read_png_size(path: Path):
    with path.open("rb") as fh:
        header = fh.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG file: {path}")
    return struct.unpack(">II", header[16:24])


def root_path(asset_path: str) -> Path:
    cleaned = asset_path[2:] if asset_path.startswith("./") else asset_path
    return ROOT / cleaned


def load_asset_manifest(node: str):
    script = textwrap.dedent(
        """
        import {
          ASSET_MANIFEST,
          RUNTIME_COMPANION_ASSET_KEYS,
          ILLUSTRATED_COMPANION_RUNTIME_POLICY
        } from './src/data/assetManifest.js';
        console.log(JSON.stringify({
          manifest: ASSET_MANIFEST,
          runtimeKeys: RUNTIME_COMPANION_ASSET_KEYS,
          policy: ILLUSTRATED_COMPANION_RUNTIME_POLICY
        }));
        """
    )
    result = run_command("asset_manifest_export", [node, "--input-type=module", "-e", script], timeout=30)
    if not result["ok"] or not result.get("json"):
        raise RuntimeError(f"Unable to export asset manifest: {result['stderr_tail'] or result['stdout_tail']}")
    return result["json"]


def run_asset_integrity(node: str):
    manifest_bundle = load_asset_manifest(node)
    manifest = manifest_bundle["manifest"]
    runtime_keys = manifest_bundle["runtimeKeys"]
    policy = manifest_bundle["policy"]
    max_edge = int(policy.get("maxSheetEdge") or 4096)
    failures = []
    companion_summaries = []

    for category_name in ("backgrounds", "platforms", "props", "audio"):
        for key, path in (manifest.get(category_name) or {}).items():
            if not root_path(path).exists():
                failures.append(f"missing:{category_name}.{key}:{path}")

    for key in runtime_keys:
        asset = (manifest.get("characters") or {}).get(key)
        if not asset:
            failures.append(f"missing-runtime-key:{key}")
            continue
        manifest_path = root_path(asset["runtimeManifest"])
        if not manifest_path.exists():
            failures.append(f"missing-runtime-manifest:{asset['id']}:{asset['runtimeManifest']}")
            continue
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        unique_sheets = {}
        for animation_id, entry in data.items():
            sheet_path = root_path(entry["sheet"])
            if not sheet_path.exists():
                failures.append(f"missing-sheet:{asset['id']}:{animation_id}:{entry['sheet']}")
                continue
            try:
                width, height = read_png_size(sheet_path)
            except Exception as exc:  # noqa: BLE001 - QA report should preserve path
                failures.append(f"bad-png:{asset['id']}:{animation_id}:{exc}")
                continue
            expected_width = int(entry["frameWidth"]) * int(entry["columns"])
            expected_height = int(entry["frameHeight"]) * int(entry["rows"])
            if width != expected_width or height != expected_height:
                failures.append(
                    f"grid-mismatch:{asset['id']}:{animation_id}:{width}x{height}!={expected_width}x{expected_height}"
                )
            if width > max_edge or height > max_edge:
                failures.append(f"sheet-edge:{asset['id']}:{animation_id}:{width}x{height}>{max_edge}")
            anchor = entry.get("anchor") or {}
            if anchor.get("x") != 0.5 or anchor.get("y") != 1:
                failures.append(f"anchor:{asset['id']}:{animation_id}:{anchor}")
            unique_sheets[entry["sheet"]] = True
        companion_summaries.append({
            "id": asset["id"],
            "animations": len(data),
            "uniqueSheets": len(unique_sheets),
            "manifest": asset["runtimeManifest"],
        })

    for key, asset in (manifest.get("characters") or {}).items():
        fallback = asset.get("fallbackImage")
        if fallback and not root_path(fallback).exists():
            failures.append(f"missing-fallback:{key}:{fallback}")

    return {
        "name": "asset_integrity",
        "companions": companion_summaries,
        "failures": failures,
        "ok": not failures,
    }


def run_raphael_agent_cases(node: str):
    script = textwrap.dedent(
        """
        import('./src/ai/testHarness/raphaelAgentEventCases.js')
          .then((m) => {
            const result = m.runRaphaelAgentEventCases();
            console.log(JSON.stringify(result));
            if (!result.ok) process.exit(1);
          })
          .catch((error) => {
            console.error(error);
            process.exit(2);
          });
        """
    )
    result = run_command(
        "raphael_restricted_agent_cases",
        [node, "--input-type=module", "-e", script],
        timeout=30,
    )
    payload = result.get("json") or {}
    result["ok"] = result["exit_code"] == 0 and payload.get("ok") is True
    return result


def run_accessibility_probe(base_url: str):
    screenshot_dir = Path(tempfile.mkdtemp(prefix="nexus_web_release_"))
    viewports = [
        {"name": "mobile_390x844", "width": 390, "height": 844},
        {"name": "desktop_1280x900", "width": 1280, "height": 900},
    ]
    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=CHROMIUM_QA_ARGS)
        for viewport in viewports:
            context = browser.new_context(
                viewport={"width": viewport["width"], "height": viewport["height"]},
                reduced_motion="reduce",
            )
            page = context.new_page()
            console_errors = []
            console_error_details = []

            def record_console_error(msg):
                if msg.type != "error":
                    return
                console_errors.append(msg.text)
                console_error_details.append({
                    "type": "console",
                    "text": msg.text,
                    "location": msg.location,
                })

            def record_page_error(err):
                text = str(err)
                console_errors.append(text)
                console_error_details.append({
                    "type": "pageerror",
                    "text": text,
                    "stack": getattr(err, "stack", None),
                })

            page.on("console", record_console_error)
            page.on("pageerror", record_page_error)
            page.goto(base_url, wait_until="networkidle", timeout=90000)
            page.evaluate(f"() => localStorage.removeItem('{STORAGE_KEY}')")
            page.reload(wait_until="networkidle", timeout=90000)
            page.wait_for_timeout(1500)
            onboarding_round = complete_onboarding_for_probe(page)
            screenshot_path = screenshot_dir / f"{viewport['name']}.png"
            page.screenshot(path=str(screenshot_path), full_page=False)
            probe = page.evaluate(
                """
                () => {
                  const buttons = Array.from(document.querySelectorAll('button'));
                  const unlabeledButtons = buttons
                    .filter((button) => {
                      const text = (button.innerText || button.textContent || '').trim();
                      return !text && !button.getAttribute('aria-label') && !button.getAttribute('title');
                    })
                    .map((button) => button.id || button.className || button.outerHTML.slice(0, 80));
                  const isActuallyFocusable = (node) => {
                    const style = window.getComputedStyle(node);
                    const rects = node.getClientRects();
                    const disabled = node.disabled || node.getAttribute('aria-disabled') === 'true';
                    return !disabled && node.tabIndex >= 0 && rects.length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
                  };
                  const focusableHidden = Array.from(document.querySelectorAll('[aria-hidden="true"] button, [aria-hidden="true"] input, [aria-hidden="true"] a[href]'))
                    .filter(isActuallyFocusable)
                    .map((node) => node.id || node.className || node.outerHTML.slice(0, 80));
                  const navButtons = Array.from(document.querySelectorAll('[data-nav-action], .aurora-nav-item, .bottom-nav button'));
                  return {
                    title: document.title,
                    canvasCount: document.querySelectorAll('canvas').length,
                    gameRoot: Boolean(document.querySelector('#game-root')),
                    soulLauncher: Boolean(document.querySelector('[data-panel-trigger="soulTalk"]')),
                    messageInput: Boolean(document.querySelector('#message-input')),
                    sendButton: Boolean(document.querySelector('#send-button')),
                    navButtonCount: navButtons.length,
                    unlabeledButtons,
                    focusableHidden,
                    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 8,
                    bodyScrollWidth: document.documentElement.scrollWidth,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight
                  };
                }
                """
            )
            soul_round = {"opened": False, "inputVisible": False}
            launcher = page.locator('[data-panel-trigger="soulTalk"]').first
            if launcher.count():
                launcher.click(timeout=10000, force=True)
                page.wait_for_selector('[data-panel="soulTalk"]', timeout=10000)
                soul_round = {
                    "opened": True,
                    "inputVisible": page.locator("#message-input").is_visible(timeout=5000),
                }
            focusable_hidden_warnings = probe["focusableHidden"]
            context.close()
            results.append({
                "viewport": viewport,
                "consoleErrors": console_errors,
                "consoleErrorDetails": console_error_details,
                "screenshot": str(screenshot_path),
                "probe": probe,
                "onboardingRound": onboarding_round,
                "soulRound": soul_round,
                "warnings": {
                    "focusableHidden": focusable_hidden_warnings,
                },
                "ok": (
                    not console_errors
                    and probe["canvasCount"] == 1
                    and probe["gameRoot"]
                    and onboarding_round["completed"]
                    and probe["soulLauncher"]
                    and probe["messageInput"]
                    and probe["sendButton"]
                    and probe["navButtonCount"] >= 4
                    and not probe["unlabeledButtons"]
                    and not probe["focusableHidden"]
                    and not probe["horizontalOverflow"]
                    and soul_round["opened"]
                    and soul_round["inputVisible"]
                ),
            })
        browser.close()

    return {
        "name": "accessibility_responsive_probe",
        "screenshotDir": str(screenshot_dir),
        "viewports": results,
        "ok": all(item["ok"] for item in results),
    }


def complete_onboarding_for_probe(page):
    root = page.locator("#onboarding-root").first
    if not root.count() or root.evaluate("node => node.hidden"):
        return {"startedVisible": False, "completed": True, "actions": []}

    actions = [
        ("start", "identity"),
        ("skip-identity", "guidance"),
        ("guidance-next", "meet"),
        ("complete", None),
    ]
    completed_actions = []
    for action, expected_step in actions:
        clicked = page.evaluate(
            """
            (action) => {
              const button = document.querySelector(`[data-onboarding-action="${action}"]`);
              if (!button) return false;
              button.click();
              return true;
            }
            """,
            action,
        )
        if not clicked:
            return {
                "startedVisible": True,
                "completed": False,
                "actions": completed_actions,
                "failedAction": action,
            }
        completed_actions.append(action)
        if expected_step:
            page.wait_for_function(
                """
                (step) => document.querySelector('.onboarding-shell')?.dataset.onboardingStep === step
                """,
                arg=expected_step,
                timeout=5000,
            )
        else:
            page.wait_for_function(
                "() => document.querySelector('#onboarding-root')?.hidden === true",
                timeout=5000,
            )

    completed = root.evaluate("node => node.hidden")
    return {
        "startedVisible": True,
        "completed": bool(completed),
        "actions": completed_actions,
    }


def run_existing_browser_gates(base_url: str):
    env = {"NEXUS_QA_BASE": base_url}
    return [
        run_command("raphael_core_smoke", [sys.executable, "docs/qa/_run_harness_smoke.py"], env=env, timeout=120),
        run_command("nlu_smoke", [sys.executable, "docs/qa/_run_nlu_smoke.py"], env=env, timeout=120),
        run_command(
            "raphael_main_readiness",
            [sys.executable, "docs/qa/_run_raphael_main_readiness.py"],
            env=env,
            timeout=120,
        ),
        run_command("stage4_human_playtest", [sys.executable, "docs/qa/_run_stage4_human_playtest.py"], env=env, timeout=120),
        run_command("live_playtest_gate", [sys.executable, "docs/qa/_run_live_playtest_gate.py"], env=env, timeout=180),
    ]


def summarize(report):
    required = []
    required.append(report["checks"]["jsSyntax"]["ok"])
    required.append(report["checks"]["stateMigration"]["ok"])
    required.append(report["checks"]["assetIntegrity"]["ok"])
    required.append(report["checks"]["raphaelAgent"]["ok"])
    required.append(report["checks"]["accessibilityProbe"]["ok"])
    required.extend(item["ok"] for item in report["checks"]["browserGates"])
    accessibility_warnings = []
    for viewport in report["checks"]["accessibilityProbe"]["viewports"]:
        focusable_hidden = viewport.get("warnings", {}).get("focusableHidden") or []
        if focusable_hidden:
            accessibility_warnings.append({
                "viewport": viewport["viewport"]["name"],
                "focusableHiddenCount": len(focusable_hidden),
            })
    manual_required = [
        "real_device_mobile_safari_or_chrome",
        "moderated_private_testers",
        "legal_privacy_store_copy_review",
    ]
    if accessibility_warnings:
        manual_required.append("aria_hidden_focus_management_review")
    return {
        "allAutomatedRequiredOk": all(required),
        "requiredCount": len(required),
        "requiredPassed": sum(1 for item in required if item),
        "accessibilityWarnings": accessibility_warnings,
        "manualRequired": manual_required,
    }


def main():
    configure_stdio()
    parser = argparse.ArgumentParser()
    parser.add_argument("--base", default=DEFAULT_BASE)
    parser.add_argument("--port", type=int, default=DEFAULT_PORT)
    parser.add_argument("--no-server", action="store_true")
    args = parser.parse_args()

    server = None
    server_status = "not_started"
    if not args.no_server and args.base.startswith("http://localhost"):
        server, server_status = start_http_server(args.port)

    node = resolve_node()
    report = {
        "schemaVersion": 1,
        "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
        "baseUrl": args.base.rstrip("/"),
        "server": server_status,
        "node": node,
        "checks": {},
    }

    try:
        report["checks"]["jsSyntax"] = run_js_syntax(node)
        report["checks"]["stateMigration"] = run_state_migration(node)
        report["checks"]["assetIntegrity"] = run_asset_integrity(node)
        report["checks"]["raphaelAgent"] = run_raphael_agent_cases(node)
        report["checks"]["accessibilityProbe"] = run_accessibility_probe(report["baseUrl"])
        report["checks"]["browserGates"] = run_existing_browser_gates(report["baseUrl"])
        report["summary"] = summarize(report)
    finally:
        if server is not None:
            server.terminate()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.kill()

    OUTPUT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if not report["summary"]["allAutomatedRequiredOk"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
