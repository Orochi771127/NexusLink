/**
 * memoryVectorStub.js
 * 
 * Simulated Vector Search for Episodic Memory (Phase 4 Hybrid Memory).
 * In a production backend environment, this would call an Embeddings DB.
 * Here, it uses a lightweight heuristic based on keyword overlap and emotion matching
 * to generate a candidate pool for the Recall Policy.
 */

export function searchEpisodicCandidates(memories = [], queryText = "", emotionKey = null, topK = 10) {
  if (!Array.isArray(memories) || memories.length === 0) return [];
  
  const keywords = tokenize(queryText);
  
  const scored = memories.map(memory => {
    return {
      memory,
      similarityScore: calculateSimilarity(memory, keywords, emotionKey)
    };
  });
  
  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    // We keep a very low threshold so we don't accidentally drop memories
    // that the recall policy might value (e.g. freshness/intensity).
    // The vector search's job is candidate generation, not final filtering.
    .filter(entry => entry.similarityScore >= 0.0) 
    .slice(0, topK)
    .map(entry => entry.memory);
}

function calculateSimilarity(memory, keywords, emotionKey) {
  let score = 0.1; // Base score so things don't get completely dropped
  const content = String(memory.excerpt || memory.theme || memory.label || "").toLowerCase();
  
  // 1. Semantic/Keyword Overlap (Stub for Vector Distance)
  let matchCount = 0;
  for (const kw of keywords) {
    if (content.includes(kw)) {
      matchCount++;
    }
  }
  
  if (keywords.length > 0) {
    score += (matchCount / keywords.length) * 0.5;
  }
  
  // 2. Emotion Alignment
  if (emotionKey && memory.emotion === emotionKey) {
    score += 0.4;
  }
  
  return Math.min(1.0, score);
}

function tokenize(text = "") {
  return String(text || "")
    .toLowerCase()
    .replace(/[，。！？、\s]/g, " ")
    .split(" ")
    .map(p => p.trim())
    .filter(p => p.length >= 1) // allow single chars in Chinese
    .slice(0, 10);
}
