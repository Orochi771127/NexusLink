import { segmentUtterance } from "./utteranceSegmenter.js";
import { extractEntitySlots } from "./entitySlotExtractor.js";
import { classifyTopic } from "./topicClassifier.js";
import { classifyDialogueAct } from "./dialogueActClassifier.js";
import { detectNuances } from "./nuanceDetector.js";
import { extractSemanticFrame } from "./semanticFrameExtractor.js";
import { scoreNluConfidence } from "./nluConfidenceScorer.js";

export function runNluPipeline(inputText = "", analysis = {}, intent = {}, safety = {}) {
  const segments = segmentUtterance(inputText);
  const entities = extractEntitySlots(inputText, segments);
  const topic = classifyTopic(inputText, entities, analysis);
  const dialogueAct = classifyDialogueAct(inputText, analysis, intent, topic);
  const nuances = detectNuances(inputText, segments);
  const semanticFrame = extractSemanticFrame({
    inputText,
    segments,
    entities,
    topic,
    dialogueAct,
    nuances,
    analysis,
    intent
  });
  const confidence = scoreNluConfidence({ semanticFrame, dialogueAct, topic, nuances });

  return {
    semanticFrame,
    dialogueAct,
    topic,
    confidence: confidence.score,
    confidenceBand: confidence.band,
    constraints: semanticFrame.constraints,
    preferredResponse: semanticFrame.preferredResponse,
    entities,
    nuances,
    segments,
    safetyCategory: safety?.category || null
  };
}