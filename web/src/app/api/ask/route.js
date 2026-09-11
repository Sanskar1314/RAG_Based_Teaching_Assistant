import { NextResponse } from 'next/server';
import { searchSimilarByText } from '@/lib/rag';
import { generateResponse, buildPrompt } from '@/lib/gemini';

export async function POST(request) {
  try {
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

    // 3. Generate response using Gemini 2.0 Flash
    let responseText;
    try {
      responseText = await generateResponse(prompt);
    } catch (err) {
      console.error('[API] Generation error:', err);
      return NextResponse.json(
        { error: 'Failed to generate response. Please check your Gemini API key.' },
        { status: 500 }
      );
    }

    // 4. Return formatted response and video sources
    const sources = topChunks.map((chunk) => ({
      title: chunk.title,
      number: chunk.number,
      start: chunk.start,
      end: chunk.end,
      text: chunk.text,
    }));

    return NextResponse.json({
      response: responseText,
      sources,
    });
  } catch (err) {
    console.error('[API] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
