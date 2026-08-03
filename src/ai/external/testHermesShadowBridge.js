/**
 * testHermesShadowBridge.js
 * Verification tests for the hardened Hermes Shadow Bridge.
 * Covers all 8 audit issues.
 */

import { resolveExternalIntelligencePolicy } from './externalIntelligencePolicy.js';
import { redactForExternal, buildAdvisorPayload } from './privacyRedactor.js';
import { askHermesShadow, assertHermesShadowIsReadOnly, HERMES_SHADOW_AUDIT } from './hermesShadowAdapter.js';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) { passed++; console.log(`[PASS] ${label}`); }
    else { failed++; console.error(`[FAIL] ${label}`); }
  }

  console.log("=== Hermes Shadow Bridge — Hardened Test Suite ===\n");

  // ─── Test 1: Policy defaults ──────────────────────────────────────────
  const defaultPolicy = resolveExternalIntelligencePolicy();
  assert(defaultPolicy.hermesShadowEnabled === false, "T1a: hermesShadowEnabled defaults false");
  assert(defaultPolicy.hermesShadowUrl === "http://127.0.0.1:8788", "T1b: hermesShadowUrl defaults correct");
  assert(defaultPolicy.allowedHermesCapabilities.includes("web_search"), "T1c: web_search in allowlist");
  assert(!defaultPolicy.allowedHermesCapabilities.includes("file_write"), "T1d: file_write NOT in allowlist");

  // ─── Test 2: Privacy redaction ────────────────────────────────────────
  const sensitiveText = "我想自殺 我的email是 user@example.com 電話 0912345678";
  const redacted = redactForExternal(sensitiveText);
  assert(redacted.redacted === true, "T2a: Sensitivity flagged");
  assert(!redacted.text.includes("自殺"), "T2b: Sensitive term redacted");
  assert(!redacted.text.includes("user@example.com"), "T2c: Email redacted");

  // ─── Test 3: Disabled adapter returns null ────────────────────────────
  const disabledRes = await askHermesShadow(defaultPolicy, { safety: {} }, "test");
  assert(disabledRes === null, "T3: Disabled policy returns null");

  // ─── Test 4: Offline sidecar graceful fallback ────────────────────────
  const enabledPolicy = resolveExternalIntelligencePolicy({
    externalIntelligence: { hermesShadowEnabled: true }
  });
  const fallbackRes = await askHermesShadow(enabledPolicy, { safety: {} }, "test");
  assert(fallbackRes === null, "T4: Offline sidecar returns null (timeout or ECONNREFUSED)");

  // ─── Test 5: Issue 7 — allowlist injection prevention ─────────────────
  const injectedPolicy = resolveExternalIntelligencePolicy({
    externalIntelligence: {
      allowedHermesCapabilities: ["web_search", "file_write", "terminal_exec", "code_analysis"]
    }
  });
  assert(injectedPolicy.allowedHermesCapabilities.includes("web_search"), "T5a: web_search kept");
  assert(injectedPolicy.allowedHermesCapabilities.includes("code_analysis"), "T5b: code_analysis kept");
  assert(!injectedPolicy.allowedHermesCapabilities.includes("file_write"), "T5c: file_write injection blocked");
  assert(!injectedPolicy.allowedHermesCapabilities.includes("terminal_exec"), "T5d: terminal_exec injection blocked");

  // ─── Test 6: Issue 4 — buildAdvisorPayload only exports safe fields ──
  const fakePerception = {
    gateway: { normalizedInput: "我今天很開心" },
    analysis: { emotionKey: "joy" },
    intent: { intent: "share_feeling" },
    safety: { riskLevel: "none" }
  };
  const fakeCoreDecision = {
    activeGoal: "listen",
    selectedAction: "acknowledge"
  };
  const advisorPayload = buildAdvisorPayload({ perception: fakePerception, coreDecision: fakeCoreDecision });
  assert(!("stateMutation" in advisorPayload), "T6a: stateMutation not in payload");
  assert(!("emotionalMemories" in advisorPayload), "T6b: emotionalMemories not in payload");
  assert(!("companionAnchors" in advisorPayload), "T6c: companionAnchors not in payload");
  assert(advisorPayload.emotion === "joy", "T6d: emotion exported");
  assert(advisorPayload.includeRawInput === false, "T6e: includeRawInput is false");

  // ─── Test 7: Issue 8 — assertHermesShadowIsReadOnly ───────────────────
  const goodShadow = {
    trusted: false,
    audit: { ...HERMES_SHADOW_AUDIT }
  };
  const badShadow = {
    trusted: true,  // violation!
    audit: { ...HERMES_SHADOW_AUDIT, appliedToLive: true }
  };
  assert(assertHermesShadowIsReadOnly(null).ok === true, "T7a: null shadow passes");
  assert(assertHermesShadowIsReadOnly(goodShadow).ok === true, "T7b: valid shadow passes");
  assert(assertHermesShadowIsReadOnly(badShadow).ok === false, "T7c: tampered shadow rejected");

  // ─── Test 8: Issue 6 — hermesMemoryBridge with safety context ─────────
  const { processHermesMemoryProposals } = await import('./hermesMemoryBridge.js');

  // 8a: Normal proposals pass
  const normalState = { companionAnchors: [] };
  const normalProposals = [
    { kind: "preference", key: "cat_lover", label: "喜歡貓", detail: "玩家表示家裡有一隻橘貓", confidence: 0.95 }
  ];
  const normalResult = processHermesMemoryProposals(normalProposals, normalState, { safety: {}, intent: {}, plan: {} });
  assert(normalResult.merged === true, "T8a: Normal proposal merges");
  assert(normalState.companionAnchors[0]?.key === "cat_lover", "T8b: cat_lover anchor created");

  // 8b: Risky content rejected by sanitizeCompanionAnchor
  const riskyState = { companionAnchors: [] };
  const riskyProposals = [
    { kind: "preference", key: "risky", label: "自殺", detail: "我想自殺", confidence: 0.99 }
  ];
  const riskyResult = processHermesMemoryProposals(riskyProposals, riskyState, { safety: {}, intent: {}, plan: {} });
  assert(riskyResult.merged === false, "T8c: Risky proposal blocked");
  assert(riskyResult.rejected === 1, "T8d: 1 rejection counted");

  // 8c: High-risk safety context blocks ALL proposals
  const safetyState = { companionAnchors: [] };
  const safetyResult = processHermesMemoryProposals(
    normalProposals, safetyState,
    { safety: { isHighRisk: true }, intent: {}, plan: {} }
  );
  assert(safetyResult.merged === false, "T8e: High-risk context blocks all proposals");
  assert(safetyResult.reason === "safety_high_risk", "T8f: Correct block reason");

  // 8d: Boundary pressure context blocks ALL proposals
  const pressureState = { companionAnchors: [] };
  const pressureResult = processHermesMemoryProposals(
    normalProposals, pressureState,
    { safety: { isBoundaryPressure: true }, intent: {}, plan: {} }
  );
  assert(pressureResult.merged === false, "T8g: Boundary pressure blocks all proposals");

  // 8e: Dependency intent blocks ALL proposals
  const depState = { companionAnchors: [] };
  const depResult = processHermesMemoryProposals(
    normalProposals, depState,
    { safety: {}, intent: { intent: "dependency_pressure" }, plan: {} }
  );
  assert(depResult.merged === false, "T8h: Dependency intent blocks all proposals");

  // 8f: Rate limiting (max 3 per turn)
  const floodState = { companionAnchors: [] };
  const floodProposals = Array.from({ length: 10 }, (_, i) => ({
    kind: "preference", key: `item_${i}`, label: `Item ${i}`, detail: `Detail for item ${i}`, confidence: 0.8
  }));
  const floodResult = processHermesMemoryProposals(floodProposals, floodState, { safety: {}, intent: {}, plan: {} });
  assert(floodResult.count <= 3, "T8i: Max 3 proposals accepted per turn");
  assert(floodResult.rejected >= 7, "T8j: Excess proposals rejected");

  // ─── Summary ──────────────────────────────────────────────────────────
  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test suite crashed:", err);
  process.exit(1);
});
