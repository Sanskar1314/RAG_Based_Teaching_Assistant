/**
 * RAG (Retrieval Augmented Generation) search engine.
 * Fast TF-IDF + Term match retrieval over course video subtitle chunks.
 */

import fs from 'fs';
import path from 'path';

let cachedData = null;

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can', 'cant', 'cannot', 'could',
  'course', 'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in',
  'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
  'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
  'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
  'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what',
  'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would',
  'you', 'your', 'yours', 'yourself', 'yourselves', 'taught', 'explain',
  'explained', 'tell', 'show'
]);

/**
 * Load embeddings and metadata from web/data/embeddings.json.
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
 * Perform hybrid TF-IDF search over the subtitle chunks.
 * @param {string} queryText - User's question
 * @param {number} topK - Number of top chunks to return
 * @returns {Array} Top-K chunks sorted by relevance
 */
export function searchSimilarByText(queryText, topK = 5) {
  const data = loadEmbeddings();

  const words = queryText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  const terms = words.length > 0 ? words : queryText.toLowerCase().split(/\s+/);
  const totalDocs = data.length;

  // Calculate Document Frequencies
  const dfMap = {};
  for (const term of terms) {
    let count = 0;
    for (const chunk of data) {
      if (chunk.text.toLowerCase().includes(term)) count++;
    }
    dfMap[term] = count;
  }

  // Score each chunk using TF-IDF + Title relevance
  const scored = data.map((chunk) => {
    const textLower = chunk.text.toLowerCase();
    const titleLower = chunk.title.toLowerCase();

    let score = 0;

    for (const term of terms) {
      // Term Frequency in text
      const matches = (textLower.match(new RegExp(term, 'g')) || []).length;
      if (matches > 0) {
        const idf = Math.log((totalDocs + 1) / (dfMap[term] + 1));
        score += matches * idf;
      }

      // Title match boost
      if (titleLower.includes(term)) {
        score += 8.0;
      }
    }

    return {
      ...chunk,
      similarity: score,
    };
  });

  // Sort descending by relevance score
  scored.sort((a, b) => b.similarity - a.similarity);

  // Return top-K without embedding vector
  return scored.slice(0, topK).map(({ embedding, ...rest }) => rest);
}

export function searchSimilar(queryEmbedding, topK = 5) {
  return searchSimilarByText('', topK);
}
