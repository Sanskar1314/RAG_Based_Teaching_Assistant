/**
 * RAG (Retrieval Augmented Generation) search engine.
 * Primary: Pinecone vector database (semantic cosine similarity).
 * Fallback: In-memory cosine similarity over embeddings.json.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import fs from 'fs';
import path from 'path';

// In-memory cache for fallback
let cachedData = null;
let pineconeIndex = null;

/**
 * Initialize and return Pinecone index (singleton).
 */
function getPineconeIndex() {
  if (pineconeIndex) return pineconeIndex;
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || 'sigmalearn';
  if (!apiKey) throw new Error('PINECONE_API_KEY is not set');
  const pc = new Pinecone({ apiKey });
  pineconeIndex = pc.index(indexName);
  console.log(`[RAG] Connected to Pinecone index: ${indexName}`);
  return pineconeIndex;
}

/**
 * Load embeddings.json into memory (used as fallback).
 */
export function loadEmbeddings() {
  if (cachedData) return cachedData;
  const dataPath = path.join(process.cwd(), 'data', 'embeddings.json');
  const raw = fs.readFileSync(dataPath, 'utf-8');
  cachedData = JSON.parse(raw);
  console.log(`[RAG] Loaded ${cachedData.length} chunks into memory (fallback)`);
  return cachedData;
}

/**
 * Cosine similarity between two vectors (used in fallback).
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
 * PRIMARY: Semantic search using Pinecone vector database.
 * @param {number[]} queryEmbedding - Gemini embedding of the user's question
 * @param {number} topK - Number of results to return
 * @returns {Promise<Array>} Top-K matching chunks with metadata
 */
export async function searchPinecone(queryEmbedding, topK = 5) {
  const index = getPineconeIndex();

  const result = await index.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
  });

  return result.matches.map((match) => ({
    title: match.metadata?.title || '',
    number: match.metadata?.number ?? 0,
    start: match.metadata?.start ?? 0,
    end: match.metadata?.end ?? 0,
    text: match.metadata?.text || '',
    similarity: match.score,
  }));
}

/**
 * FALLBACK: In-memory cosine similarity search over embeddings.json.
 * Used if Pinecone is unavailable.
 * @param {number[]} queryEmbedding
 * @param {number} topK
 */
export function searchSimilarByEmbedding(queryEmbedding, topK = 5) {
  const data = loadEmbeddings();
  const scored = data.map((chunk) => ({
    ...chunk,
    similarity: chunk.embedding ? cosineSimilarity(queryEmbedding, chunk.embedding) : 0,
  }));
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}

