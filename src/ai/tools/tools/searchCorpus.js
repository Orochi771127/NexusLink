import { loadRaphaelCorpus, getCorpusSentencesByEmotion } from "../../corpusLoader.js";

export const searchCorpusTool = Object.freeze({
  name: "searchCorpus",
  risk: "low",
  requiresUserConsent: false,
  allowedInRuntime: true,
  execute(input = {}, _context = {}) {
    const corpus = loadRaphaelCorpus();
    const emotion = input.emotion || "calm";
    const sentences = getCorpusSentencesByEmotion(emotion);
    return { ok: true, data: { version: corpus.version, sentences } };
  }
});