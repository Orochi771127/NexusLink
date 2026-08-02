# Game QA & Automated Test Harness Skill

This skill defines the quality assurance and test harness standards for Nexus Link.

## Core Invariants
1. Pure logic modules (`RaphaelCore`, `OrbitEngine`, `SaveManager`) must pass Headless Node testing without DOM/WebGL.
2. Zero unauthorized write to `localStorage` during automated smoke test passes.
3. Strict Safety Shield and Boundary Eval invariant preservation.

## Running Test Verification
```bash
# Run RaphaelCore AI Smoke Suite
node src/ai/testHarness/raphaelCoreSmokeCases.js

# Run Hermes Shadow Bridge Verification
node src/ai/external/testHermesShadowBridge.js

# Run Gameplay Skin Runtime QA
node docs/qa/gameplay-skin-runtime-r2-cases.mjs
```
