import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check environment variables
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    
    return NextResponse.json({
      success: true,
      setup: {
        openai: hasOpenAI ? 'Configured' : 'Missing API Key',
        gemini: hasGemini ? 'Configured' : 'Missing API Key',
        hasFallback: hasOpenAI || hasGemini,
        ready: hasOpenAI || hasGemini
      },
      message: hasOpenAI || hasGemini 
        ? 'Chatbot is ready to use!' 
        : 'Please configure at least one AI service'
    });
  } catch (error) {
    console.error('Chatbot test error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 