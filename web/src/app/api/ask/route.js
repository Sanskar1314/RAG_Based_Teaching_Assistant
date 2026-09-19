import { NextResponse } from 'next/server';
import { searchPinecone, searchSimilarByEmbedding } from '@/lib/rag';
import { embedText, generateResponse, buildPrompt } from '@/lib/gemini';

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json({ error: 'Please enter a valid question.' }, { status: 400 });
    }

    const trimmedQuestion = question.trim();

    // 1. Embed the user's question
    let queryEmbedding = null;
    try {
      queryEmbedding = await embedText(trimmedQuestion);
    } catch (embedErr) {
      console.warn('[API] Embedding failed:', embedErr?.message);
    }

    // 2. Search: Pinecone → in-memory cosine fallback
    let topChunks;
    let searchMethod = 'unknown';

    if (queryEmbedding && process.env.PINECONE_API_KEY) {
      try {
        topChunks = await searchPinecone(queryEmbedding, 5);
        searchMethod = 'pinecone';
        console.log(`[API] Pinecone search ✅ top score: ${topChunks[0]?.similarity?.toFixed(3)}`);
      } catch (pcErr) {
        console.warn('[API] Pinecone failed, falling back to in-memory:', pcErr?.message);
      }
    }

    if (!topChunks && queryEmbedding) {
      topChunks = searchSimilarByEmbedding(queryEmbedding, 5);
      searchMethod = 'in-memory cosine';
      console.log(`[API] In-memory search ✅ top score: ${topChunks[0]?.similarity?.toFixed(3)}`);
    }

    if (!topChunks) {
      return NextResponse.json({ error: 'Could not generate an embedding for your question. Please try again.' }, { status: 500 });
    }

    console.log(`[API] Search method used: ${searchMethod}`);

    // 3. Build prompt and generate response
    const prompt = buildPrompt(trimmedQuestion, topChunks);

    let responseText;
    try {
      responseText = await generateResponse(prompt);
    } catch (err) {
      console.error('[API] Generation error:', err?.message || err);
      const errMsg = err?.message || String(err);
      const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota');
      const isAuthError = errMsg.includes('401') || errMsg.includes('403') || errMsg.toLowerCase().includes('api key') || errMsg.toLowerCase().includes('invalid');
      let userMsg = `Gemini API error: ${errMsg}`;
      if (isRateLimit) userMsg = 'Rate limit reached. Please wait a moment and try again.';
      if (isAuthError) userMsg = 'Invalid or missing API key. Check GEMINI_API_KEY in Vercel Environment Variables.';
      return NextResponse.json({ error: userMsg }, { status: 500 });
    }

    // 4. Return response and sources
    const sources = topChunks.map((chunk) => ({
      title: chunk.title,
      number: chunk.number,
      start: chunk.start,
      end: chunk.end,
      text: chunk.text,
    }));

    return NextResponse.json({ response: responseText, sources });
  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json({ error: `Unexpected error: ${err?.message || err}` }, { status: 500 });
  }
}
