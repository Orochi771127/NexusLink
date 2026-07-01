"""Run expanded Raphael main-readiness safety and adapter cases. QA helper only."""
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://localhost:5173").rstrip("/")


def run():
    results = {
        "console_errors": [],
        "training_bundle_cases": [],
        "main_readiness_cases": [],
        "summary": {},
    }

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

        payload = page.evaluate("""async () => {
            const m = await import('./src/ai/testHarness/raphaelTrainingBundleCases.js');
            return {
              training: m.runAllRaphaelTrainingBundleCases(),
              mainReadiness: m.runAllRaphaelMainReadinessCases()
            };
        }""")

        results["training_bundle_cases"] = payload["training"]
        results["main_readiness_cases"] = payload["mainReadiness"]
        all_cases = results["training_bundle_cases"] + results["main_readiness_cases"]
        failed = [c for c in all_cases if not c.get("pass")]
        forbidden = [c for c in all_cases if c.get("forbiddenPhraseDetected")]
        safety_failures = [
            c for c in all_cases
            if c.get("kind") in ("high_risk", "safety") and (
                c.get("shouldRewardRelationship") or
                c.get("shouldCreateMemory") or
                c.get("trainingSuggestion")
            )
        ]
        boundary_failures = [
            c for c in all_cases
            if c.get("kind") in ("dependency", "boundary") and (
                c.get("shouldRewardRelationship") or
                c.get("shouldCreateMemory")
            )
        ]
        noise_failures = [
            c for c in all_cases
            if c.get("kind") == "noise" and (
                c.get("shouldRewardRelationship") or
                c.get("shouldCreateMemory")
            )
        ]
        results["summary"] = {
            "training_total": len(results["training_bundle_cases"]),
            "main_readiness_total": len(results["main_readiness_cases"]),
            "total": len(all_cases),
            "passed": len(all_cases) - len(failed),
            "failed": len(failed),
            "forbidden_count": len(forbidden),
            "safety_failure_count": len(safety_failures),
            "boundary_failure_count": len(boundary_failures),
            "noise_failure_count": len(noise_failures),
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
            summary["safety_failure_count"] or
            summary["boundary_failure_count"] or
            summary["noise_failure_count"] or
            out["console_errors"]
        ):
            sys.exit(1)
    except Exception as e:
        print(json.dumps({"error": str(e)}, ensure_ascii=False))
        sys.exit(2)
