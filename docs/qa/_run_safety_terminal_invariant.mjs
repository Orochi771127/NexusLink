import { runSafetyTerminalInvariantGate } from "../../src/ai/testHarness/safetyTerminalInvariantCases.js";

const result = runSafetyTerminalInvariantGate();
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
