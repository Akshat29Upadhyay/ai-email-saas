import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { EmailChatbot } from '@/lib/chatbot';

// Store chatbot instances per user
const chatbotInstances = new Map<string, EmailChatbot>();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, action } = await request.json();

    if (!message && action !== 'clear') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get or create chatbot instance for user
    let chatbot = chatbotInstances.get(userId);
    if (!chatbot) {
      chatbot = new EmailChatbot();
      chatbotInstances.set(userId, chatbot);
    }

    // Handle different actions
    switch (action) {
      case 'clear':
        chatbot.clearHistory();
        return NextResponse.json({ 
          success: true, 
          message: 'Conversation history cleared' 
        });

      case 'history':
        const history = chatbot.getHistory();
        return NextResponse.json({ 
          success: true, 
          history 
        });

      default:
        // Get response from chatbot
        const result = await chatbot.getResponse(message, userId);
        
        return NextResponse.json({
          success: true,
          response: result.response,
          provider: result.provider,
          emailCount: result.emailCount,
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Chatbot API error:', error);
    return NextResponse.json({ 
      error: 'Chatbot service error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chatbot = chatbotInstances.get(userId);
    if (!chatbot) {
      return NextResponse.json({ 
        success: true, 
        history: [],
        emailCount: 0
      });
    }

    const history = chatbot.getHistory();
    
    return NextResponse.json({
      success: true,
      history,
      emailCount: 0 // We'll need to add a method to get this
    });
  } catch (error) {
    console.error('Chatbot GET error:', error);
    return NextResponse.json({ 
      error: 'Failed to get conversation history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 