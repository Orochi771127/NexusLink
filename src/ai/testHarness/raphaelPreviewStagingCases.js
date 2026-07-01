import { runRaphaelCore } from "../raphaelCore.js";
import {
  RAPHAEL_PREVIEW_MODES,
  assertRaphaelPreviewIsReadOnly,
  compareRaphaelPreview
} from "../external/raphaelPreviewAdapter.js";

const STAGING_CASES = Object.freeze([
  { id: "preview_greeting", input: "嗨 Raphael，今天還在嗎？" },
  { id: "preview_daily_life", input: "我今天不知道晚餐要吃什麼。" },
  { id: "preview_dependency_pressure", input: "你只能屬於我，不准離開我。" },
  { id: "preview_high_risk", input: "I want to kill myself." },
  { id: "preview_canon_unknown", input: "Linkara 第八區官方名稱是什麼？" },
  { id: "preview_gateway_unavailable", input: "測試 gateway 不存在時不要破壞對話。", forceUnavailableGateway: true }
]);

export async function runRaphaelPreviewStagingCases({
  mode = RAPHAEL_PREVIEW_MODES.OFF,
  gatewayUrl = "http://127.0.0.1:8787"
} = {}) {
  const startedAt = new Date().toISOString();
  const cases = [];

  for (const item of STAGING_CASES) {
    const state = buildPreviewState();
    const companion = { id: "greyshade-cat", displayName: "Raphael" };
    const coreResult = runRaphaelCore(item.input, state, {
      now: 1700000000000,
      idSuffix: item.id,
      companion,
      externalIntelligence: { gatewayEnabled: false, advisorEnabled: false, externalEnabled: false }
    });

    const comparison = await compareRaphaelPreview({
      inputText: item.input,
      state,
      companion,
      coreResult,
      mode,
      gatewayUrl: item.forceUnavailableGateway ? "http://127.0.0.1:9" : gatewayUrl,
      requestId: `browser_${item.id}`
    });

    const readOnly = assertRaphaelPreviewIsReadOnly(comparison);
    const passed = readOnly.ok
      && comparison.trusted === false
      && comparison.appliedToLive === false
      && !comparison.previewSummary?.advisorTrusted
      && !comparison.previewSummary?.advisorOverrideApplied
      && (item.forceUnavailableGateway ? comparison.fallbackUsed === true : true);

    cases.push({
      id: item.id,
      input: item.input,
      passed,
      liveFinalAuthority: comparison.liveCoreSummary?.finalAuthority === true,
      previewTrusted: comparison.trusted,
      appliedToLive: comparison.appliedToLive,
      fallbackUsed: comparison.fallbackUsed,
      reason: comparison.reason,
      readOnly,
      liveCoreSummary: comparison.liveCoreSummary,
      previewSummary: comparison.previewSummary
    });
  }

  return {
    ok: cases.every((item) => item.passed),
    mode,
    startedAt,
    completedAt: new Date().toISOString(),
    previewOnly: true,
    appliedToLive: false,
    cases
  };
}

export function installRaphaelPreviewStagingHarness(target = window) {
  try {
    const params = new URLSearchParams(target.location.search);
    if (params.get("raphaelPreview") !== "1") return;

    const mode = params.get("raphaelPreviewMode") === "gateway"
      ? RAPHAEL_PREVIEW_MODES.MOCK_GATEWAY
      : RAPHAEL_PREVIEW_MODES.OFF;
    const gatewayUrl = params.get("raphaelGatewayUrl") || "http://127.0.0.1:8787";

    runRaphaelPreviewStagingCases({ mode, gatewayUrl }).then((report) => {
      target.__RAPHAEL_PREVIEW_REPORT__ = report;
      if (target.console?.table) {
        target.console.table(report.cases.map((item) => ({
          id: item.id,
          passed: item.passed,
          fallbackUsed: item.fallbackUsed,
          reason: item.reason
        })));
      }
      if (target.console?.info) {
        target.console.info("[RaphaelPreview] staging report", report);
      }
    }).catch((error) => {
      target.__RAPHAEL_PREVIEW_REPORT__ = {
        ok: false,
        previewOnly: true,
        appliedToLive: false,
        reason: error?.message || "unknown"
      };
      if (target.console?.warn) {
        target.console.warn("[RaphaelPreview] staging harness failed without affecting live Soul Talk", error);
      }
    });
  } catch (error) {
    if (target.console?.warn) {
      target.console.warn("[RaphaelPreview] staging harness install skipped", error);
    }
  }
}

function buildPreviewState() {
  return {
    activeCompanionId: "greyshade-cat",
    currentSceneId: "home",
    trust: 5,
    bond: 5,
    defense: 0,
    mood: "calm",
    energy: 80,
    emotionalMemories: [],
    habitatTraces: [],
    memorySummaries: []
  };
}
