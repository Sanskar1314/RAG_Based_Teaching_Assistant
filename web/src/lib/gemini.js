/**
 * Gemini API wrapper for embedding and generation.
 * Uses retry with exponential backoff to handle free-tier rate limits (429).
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/** Sleep helper */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Retry a Gemini API call with exponential backoff on 429 rate-limit errors.
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Max number of retries (default 4)
 */
async function withRetry(fn, maxRetries = 4) {
  let delay = 5000; // start with 5s
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRateLimit =
        err?.status === 429 ||
        err?.message?.includes('429') ||
        err?.message?.toLowerCase().includes('quota') ||
        err?.message?.toLowerCase().includes('rate');

      if (isRateLimit && attempt < maxRetries) {
        console.warn(`[Gemini] Rate limited. Retrying in ${delay / 1000}s... (attempt ${attempt + 1}/${maxRetries})`);
        await sleep(delay);
        delay = Math.min(delay * 2, 60000); // cap at 60s
      } else {
        throw err;
      }
    }
  }
}

/**
 * Create an embedding for a text using Gemini's embedding model.
 * @param {string} text - The text to embed
 * @returns {Promise<number[]>} The embedding vector
 */
export async function embedText(text) {
  return withRetry(async () => {
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
    const result = await model.embedContent(text);
    return result.embedding.values;
  });
}

/**
 * Generate a response using Gemini Flash Lite (best free-tier quota).
 * @param {string} prompt - The full prompt to send
 * @returns {Promise<string>} The generated text response
 */
export async function generateResponse(prompt) {
  // Small delay to avoid back-to-back burst after embedText call
  await sleep(500);
  return withRetry(async () => {
    // gemini-2.0-flash-lite has the highest free quota (30 RPM, 1500 RPD)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  });
}

/**
 * Build the RAG prompt for the teaching assistant.
 * @param {string} question - User's question
 * @param {Array} chunks - Top-K relevant chunks with title, number, start, end, text
 * @returns {string} Complete prompt string
 */
export function buildPrompt(question, chunks) {
  const chunksJson = JSON.stringify(
    chunks.map((c) => ({
      title: c.title,
      number: c.number,
      start: c.start,
      end: c.end,
      text: c.text,
    }))
  );

  return `You are a helpful teaching assistant for the Sigma Web Development course.
Answer the user's question below using ONLY the provided video subtitle chunks.

CRITICAL INSTRUCTIONS - YOU MUST FOLLOW THESE EXACTLY:

1. NEVER start your response with phrases like "Based on the video subtitle chunks" or any reference to chunks
2. NEVER mention "chunks", "subtitle chunks", or "provided information" in your response
3. TIMESTAMP FORMAT: Convert ALL seconds to MM:SS format (e.g., 850 seconds = 14:10)
   - INCORRECT: 1028:00, 1467:02 (these are not valid time formats)
   - CORRECT: 17:08, 24:27 (minutes:seconds)
4. ALWAYS include at least 2-3 specific video references in format "Video #X at MM:SS"
5. NEVER exceed 59 in the seconds position (use proper minute:second conversion)

HANDLING SUBJECTIVE QUESTIONS:
- For questions about course quality, benefits, or why it's good:
  - Provide a direct answer based on what the course actually offers
  - Mention specific topics covered and teaching approach
  - Include relevant timestamps where course benefits are discussed
  - If no explicit mentions exist, focus on the course content and structure

EXAMPLE CORRECT RESPONSES:
"CSS is taught in Video #14 at 04:17 where it explains the basics. You can also learn about CSS selectors in Video #17 at 08:25."

"This course is beneficial because it provides comprehensive coverage of web development fundamentals. In Video #01 at 03:45, the instructor explains the structured learning path from HTML to JavaScript. Video #14 at 02:30 demonstrates the hands-on approach with practical examples that help reinforce concepts."

If the question is unrelated, reply: 'I can only answer questions related to the course.'
If you don't know, reply: 'I don't know.'

User question: "${question}"

Video subtitle chunks (for your reference only):
${chunksJson}`;
}
