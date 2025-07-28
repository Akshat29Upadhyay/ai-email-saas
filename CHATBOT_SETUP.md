# Email Chatbot Setup Guide

## Overview
The email chatbot uses AI to help you find and understand information from your emails. It supports both OpenAI GPT-4 and Google Gemini as fallback.

## Environment Variables

Add these to your `.env` file:

```env
# OpenAI API Key (Primary)
OPENAI_API_KEY=your_openai_api_key_here

# Google Gemini API Key (Fallback)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting API Keys

### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to "API Keys" in the sidebar
4. Click "Create new secret key"
5. Copy the key and add it to your `.env` file

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file

## Features

### 🤖 AI-Powered Email Assistance
- **Smart Search**: Find emails by content, sender, or context
- **Email Summaries**: Get quick summaries of email threads
- **Pattern Recognition**: Identify email patterns and insights
- **Contextual Answers**: Get answers based on your actual email data

### 🔄 Fallback System
- **Primary**: OpenAI GPT-4 for best performance
- **Fallback**: Google Gemini if OpenAI is unavailable
- **Seamless**: Automatic switching between providers

### 💬 Interactive Chat Interface
- **Floating Chat**: Accessible from any page
- **Conversation History**: Maintains chat context
- **Real-time Responses**: Instant AI responses

## Usage Examples

### Ask about specific emails:
- "What emails do I have about meetings?"
- "Show me emails from my boss"
- "Find emails with attachments"

### Get insights:
- "Summarize my recent conversations"
- "What's my email activity like this week?"
- "Who do I communicate with most?"

### Email management:
- "Help me organize my inbox"
- "Find important emails I might have missed"
- "Show me emails that need follow-up"

## Technical Details

### API Endpoints
- `POST /api/chatbot` - Send message and get response
- `GET /api/chatbot` - Get conversation history
- `POST /api/chatbot` with `action: 'clear'` - Clear history
- `GET /api/chatbot/test` - Check AI service status

### Security
- All requests require authentication via Clerk
- Email data is only accessible to the authenticated user
- API keys are stored securely in environment variables

### Performance
- Intelligent email context loading
- Relevant email search for each query
- Conversation memory for context continuity
- Fast response times with fallback support

## Troubleshooting

### "OpenAI service unavailable"
- Check your `OPENAI_API_KEY` is correct
- Verify your OpenAI account has credits
- The system will automatically fall back to Gemini

### "Both AI services are currently unavailable"
- Check both API keys are set correctly
- Verify internet connection
- Check API service status pages

### "Failed to load email context"
- Ensure you have emails in your database
- Check database connection
- Verify Prisma schema is up to date

## Privacy & Security

- **Email Privacy**: Only your own emails are accessible
- **No Data Storage**: Chat history is not permanently stored
- **Secure API**: All communication is encrypted
- **User Isolation**: Each user has their own chatbot instance 