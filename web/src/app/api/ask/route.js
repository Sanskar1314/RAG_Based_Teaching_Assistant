import { NextResponse } from 'next/server';
import { searchSimilarByText } from '@/lib/rag';
import { generateResponse, buildPrompt } from '@/lib/gemini';

export async function POST(request) {
  try {
    // Check API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.error('[API] GEMINI_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: GEMINI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { question } = body;

    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter a valid question.' },
        { status: 400 }
      );
    }

    const trimmedQuestion = question.trim();

    // 1. Search for top-5 most relevant subtitle chunks
    const topChunks = searchSimilarByText(trimmedQuestion, 5);

    // 2. Build the RAG prompt
    const prompt = buildPrompt(trimmedQuestion, topChunks);

    // 3. Generate response using Gemini
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

    // 4. Return formatted response and video sources
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
    return NextResponse.json(
      { error: `Unexpected error: ${err?.message || err}` },
      { status: 500 }
    );
  }
}
