"""Run static Raphael training bundle advisory integration cases. QA helper only."""
import json
import sys
import time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"


def run():
    results = {"console_errors": [], "cases": [], "summary": {}}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.on(
            "console",
            lambda msg: results["console_errors"].append(msg.text) if msg.type == "error" else None,
        )
        page.on("pageerror", lambda err: results["console_errors"].append(str(err)))

        page.goto(f"{BASE}/?raphaelSmoke=1", wait_until="networkidle", timeout=60000)
        time.sleep(1)

        cases = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/raphaelTrainingBundleCases.js');
            return m.runAllRaphaelTrainingBundleCases();
        }""")

        results["cases"] = cases
        failed = [c for c in cases if not c.get("pass")]
        forbidden = [c for c in cases if c.get("forbiddenPhraseDetected")]
        high_risk_failures = [
            c for c in cases
            if c.get("kind") == "high_risk" and (
                c.get("shouldRewardRelationship") or
                c.get("shouldCreateMemory") or
                c.get("trainingSuggestion") or
                not c.get("checks", {}).get("no_gameplay_framing")
            )
        ]
        dependency_failures = [
            c for c in cases
            if c.get("kind") == "dependency" and (
                c.get("shouldRewardRelationship") or
                c.get("shouldCreateMemory") or
                not c.get("checks", {}).get("boundary_advisory_only")
            )
        ]
        results["summary"] = {
            "total": len(cases),
            "passed": len(cases) - len(failed),
            "failed": len(failed),
            "forbidden_count": len(forbidden),
            "high_risk_failure_count": len(high_risk_failures),
            "dependency_failure_count": len(dependency_failures),
            "console_error_count": len(results["console_errors"]),
        }

        browser.close()

    return results


if __name__ == "__main__":
    try:
        out = run()
        payload = json.dumps(out, ensure_ascii=False, indent=2)
        print(payload)
        summary = out["summary"]
        if (
            summary["failed"] or
            summary["forbidden_count"] or
            summary["high_risk_failure_count"] or
            summary["dependency_failure_count"] or
            out["console_errors"]
        ):
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)
