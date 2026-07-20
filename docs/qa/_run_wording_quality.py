"""Run TP-WQ1 wording-quality eval cases. QA helper only."""
import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:5173")


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
            const m = await import('./src/ai/testHarness/wordingQualityEvalCases.js');
            return m.runAllWordingQualityCases();
        }""")

        results["cases"] = cases
        failed = [c for c in cases if not c.get("pass")]
        results["summary"] = {
            "total": len(cases),
            "passed": len(cases) - len(failed),
            "failed": len(failed),
            "failed_ids": [c.get("id") for c in failed],
            "console_error_count": len(results["console_errors"]),
        }
        browser.close()

    return results


if __name__ == "__main__":
    out = run()
    payload = json.dumps(out, ensure_ascii=False, indent=2)
    print(payload)
    out_path = os.path.join(os.path.dirname(__file__), "_wording_quality_output.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(payload)
    if out["summary"]["failed"] or out["summary"]["console_error_count"]:
        sys.exit(1)
