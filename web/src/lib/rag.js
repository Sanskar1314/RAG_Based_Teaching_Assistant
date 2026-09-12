/**
 * RAG (Retrieval Augmented Generation) search engine.
 * Semantic search using cosine similarity over pre-computed Gemini embeddings.
 */

import fs from 'fs';
import path from 'path';

let cachedData = null;

/**
 * Load embeddings and metadata from web/data/embeddings.json.
 * Cached in memory after first load.
 */
export function loadEmbeddings() {
  if (cachedData) return cachedData;

  const dataPath = path.join(process.cwd(), 'data', 'embeddings.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  cachedData = JSON.parse(raw);

  console.log(`[RAG] Loaded ${cachedData.length} chunks into memory`);
  return cachedData;
}

/**
 * Compute cosine similarity between two vectors.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} similarity score between -1 and 1
 */
export function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Semantic search: find top-K most similar chunks to a query embedding.
 * Uses cosine similarity over pre-computed Gemini embeddings.
 * @param {number[]} queryEmbedding - Embedding vector of the user's question
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} Top-K chunks sorted by semantic similarity
 */
export function searchSimilarByEmbedding(queryEmbedding, topK = 5) {
  const data = loadEmbeddings();

  const scored = data.map((chunk) => ({
    ...chunk,
    similarity: chunk.embedding
      ? cosineSimilarity(queryEmbedding, chunk.embedding)
      : 0,
  }));

  scored.sort((a, b) => b.similarity - a.similarity);

  // Return top-K, stripping the large embedding vector from response
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}

/**
 * Fallback TF-IDF text search (used if embedding is unavailable).
 * @param {string} queryText - User's question
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} Top-K chunks sorted by relevance
 */
export function searchSimilarByText(queryText, topK = 5) {
  const data = loadEmbeddings();

  const STOPWORDS = new Set([
    'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by',
    'can', 'do', 'does', 'doing', 'for', 'from', 'had', 'has', 'have', 'he',
    'her', 'him', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just',
    'me', 'my', 'no', 'not', 'of', 'on', 'or', 'our', 'out', 'so', 'some',
    'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they',
    'this', 'those', 'to', 'too', 'up', 'was', 'we', 'were', 'what', 'when',
    'where', 'which', 'who', 'why', 'with', 'you', 'your',
  ]);

  const terms = queryText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  const totalDocs = data.length;

  const dfMap = {};
  for (const term of terms) {
    let count = 0;
    for (const chunk of data) {
      if (chunk.text.toLowerCase().includes(term)) count++;
    }
    dfMap[term] = count;
  }

  const scored = data.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    const titleLower = chunk.title.toLowerCase();
    let score = 0;

    for (const term of terms) {
      const matches = (textLower.match(new RegExp(term, 'g')) || []).length;
      if (matches > 0) {
        const idf = Math.log((totalDocs + 1) / (dfMap[term] + 1));
        score += matches * idf;
      }
      if (titleLower.includes(term)) score += 8.0;
    }

    return { ...chunk, similarity: score };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}
