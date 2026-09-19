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

/**
 * FALLBACK: TF-IDF text search (used if no embedding available).
 * @param {string} queryText
 * @param {number} topK
 */
export function searchSimilarByText(queryText, topK = 5) {
  const data = loadEmbeddings();

  const STOPWORDS = new Set([
    'a', 'about', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'but', 'by',
    'can', 'do', 'does', 'for', 'from', 'had', 'has', 'have', 'he', 'how',
    'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'me', 'my', 'no',
    'not', 'of', 'on', 'or', 'so', 'some', 'than', 'that', 'the', 'their',
    'them', 'then', 'there', 'these', 'they', 'this', 'those', 'to', 'too',
    'up', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'who',
    'why', 'with', 'you', 'your',
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
      if (matches > 0) score += matches * Math.log((totalDocs + 1) / (dfMap[term] + 1));
      if (titleLower.includes(term)) score += 8.0;
    }
    return { ...chunk, similarity: score };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}
