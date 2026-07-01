import { segmentUtterance } from "./utteranceSegmenter.js";
import { extractEntitySlots } from "./entitySlotExtractor.js";
import { classifyTopic } from "./topicClassifier.js";
import { classifyDialogueAct } from "./dialogueActClassifier.js";
import { detectNuances } from "./nuanceDetector.js";
import { extractSemanticFrame } from "./semanticFrameExtractor.js";
import { scoreNluConfidence } from "./nluConfidenceScorer.js";
import { getTrainingSuggestion } from "../raphaelTrainingAdapter.js";

export function runNluPipeline(inputText = "", analysis = {}, intent = {}, safety = {}) {
  const segments = segmentUtterance(inputText);
  const entities = extractEntitySlots(inputText, segments);
  const trainingSuggestion = getTrainingSuggestion(inputText, { analysis, intent, safety });
  const topic = resolveTopic(
    classifyTopic(inputText, entities, analysis),
    trainingSuggestion
  );
  const dialogueAct = resolveDialogueAct(
    classifyDialogueAct(inputText, analysis, intent, topic),
    trainingSuggestion
  );
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
    inputText: String(inputText || "").trim(),
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
    safetyCategory: safety?.category || null,
    trainingSuggestion
  };
}

function resolveTopic(topic, trainingSuggestion) {
  const suggestedTopic = trainingSuggestion?.suggestion?.topic || null;
  if (topic === "unknown" && suggestedTopic) return suggestedTopic;
  return topic;
}

function resolveDialogueAct(dialogueAct, trainingSuggestion) {
  const suggestedAct = trainingSuggestion?.suggestion?.dialogueAct || null;
  if (!suggestedAct) return dialogueAct;
  if (dialogueAct === "describing_event") return suggestedAct;
  if (dialogueAct === "asking_question" && suggestedAct !== "describing_event") return suggestedAct;
  return dialogueAct;
}
