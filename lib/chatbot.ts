import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { prisma } from './prisma';

// Initialize AI clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY!,
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface EmailContext {
  subject: string;
  sender: string;
  content: string;
  date: string;
  threadId: string;
}

export class EmailChatbot {
  private messages: ChatMessage[] = [];
  private emailContext: EmailContext[] = [];

  constructor() {
    // Initialize with system message
    this.messages.push({
      role: 'system',
      content: `You are an AI email assistant that helps users find and understand information from their emails. 
      
You have access to the user's email data and can:
- Search through emails to find relevant information
- Summarize email threads and conversations
- Answer questions about email content, senders, dates, etc.
- Help with email organization and management
- Provide insights about email patterns and communication

When answering questions:
1. Always reference specific emails when providing information
2. Include relevant details like sender names, dates, and subjects
3. Be helpful and conversational
4. If you don't have enough information, ask for clarification
5. Respect email privacy and only discuss the user's own emails

Current email context: ${this.emailContext.length} emails loaded.`
    });
  }

  // Load user's emails for context
  async loadUserEmails(clerkUserId: string, limit: number = 50) {
    try {
      const accounts = await prisma.account.findMany({
        where: { clerkUserId },
        include: {
          threads: {
            include: {
              emails: {
                include: {
                  from: true,
                  to: true,
                },
                orderBy: {
                  sentAt: 'desc',
                },
              },
            },
            orderBy: {
              lastMessageDate: 'desc',
            },
            take: limit,
          },
        },
      });

      this.emailContext = [];
      
      for (const account of accounts) {
        for (const thread of account.threads) {
          for (const email of thread.emails) {
            this.emailContext.push({
              subject: email.subject,
              sender: email.from.name || email.from.address,
              content: email.bodySnippet || email.body || 'No content available',
              date: email.sentAt.toISOString(),
              threadId: thread.id,
            });
          }
        }
      }

      // Update system message with email context
      this.updateSystemMessage();
      
      return this.emailContext.length;
    } catch (error) {
      console.error('Error loading user emails:', error);
      throw new Error('Failed to load email context');
    }
  }

  // Search emails for relevant context
  async searchEmails(query: string, clerkUserId: string, limit: number = 10) {
    try {
      const accounts = await prisma.account.findMany({
        where: { clerkUserId },
        include: {
          threads: {
            include: {
              emails: {
                include: {
                  from: true,
                  to: true,
                },
              },
            },
          },
        },
      });

      const relevantEmails: EmailContext[] = [];
      
      for (const account of accounts) {
        for (const thread of account.threads) {
          for (const email of thread.emails) {
            const emailText = `${email.subject} ${email.bodySnippet || email.body || ''} ${email.from.name || email.from.address}`.toLowerCase();
            const queryLower = query.toLowerCase();
            
            if (emailText.includes(queryLower)) {
              relevantEmails.push({
                subject: email.subject,
                sender: email.from.name || email.from.address,
                content: email.bodySnippet || email.body || 'No content available',
                date: email.sentAt.toISOString(),
                threadId: thread.id,
              });
              
              if (relevantEmails.length >= limit) break;
            }
          }
          if (relevantEmails.length >= limit) break;
        }
        if (relevantEmails.length >= limit) break;
      }

      return relevantEmails;
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  }

  private updateSystemMessage() {
    const emailSummary = this.emailContext.length > 0 
      ? `\n\nAvailable email context (${this.emailContext.length} emails):\n${this.emailContext.slice(0, 5).map(email => 
          `- ${email.subject} (from ${email.sender} on ${new Date(email.date).toLocaleDateString()})`
        ).join('\n')}`
      : '\n\nNo email context available.';

    this.messages[0] = {
      role: 'system',
      content: `You are an AI email assistant that helps users find and understand information from their emails. 
      
You have access to the user's email data and can:
- Search through emails to find relevant information
- Summarize email threads and conversations
- Answer questions about email content, senders, dates, etc.
- Help with email organization and management
- Provide insights about email patterns and communication

When answering questions:
1. Always reference specific emails when providing information
2. Include relevant details like sender names, dates, and subjects
3. Be helpful and conversational
4. If you don't have enough information, ask for clarification
5. Respect email privacy and only discuss the user's own emails${emailSummary}`
    };
  }

  // Get response using OpenAI
  private async getOpenAIResponse(userMessage: string): Promise<string> {
    try {
      // Add user message to conversation
      this.messages.push({ role: 'user', content: userMessage });

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: this.messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      const assistantMessage = response.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
      
      // Add assistant response to conversation
      this.messages.push({ role: 'assistant', content: assistantMessage });

      return assistantMessage;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('OpenAI service unavailable');
    }
  }

  // Get response using Google Gemini
  private async getGeminiResponse(userMessage: string, clerkUserId: string): Promise<string> {
    try {
      // Load all user emails for comprehensive context
      const allEmails = await this.loadAllUserEmails(clerkUserId, 50);
      
      // Prepare comprehensive email context for Gemini
      const emailContext = allEmails.length > 0 
        ? `\n\nComplete Email Database (${allEmails.length} emails):\n${allEmails.map((email, index) => 
            `Email ${index + 1}:
Subject: ${email.subject}
From: ${email.sender}
Date: ${new Date(email.date).toLocaleDateString()}
Content: ${email.content}
Thread ID: ${email.threadId}
---`
          ).join('\n\n')}`
        : '';

      const systemPrompt = `You are an AI email assistant with access to the user's complete email database. You can see all their emails and help them find and understand information from their emails.

${emailContext}

Your capabilities:
- Search through all emails to find relevant information
- Summarize email threads and conversations
- Answer questions about email content, senders, dates, etc.
- Help with email organization and management
- Provide insights about email patterns and communication

When answering questions:
1. Always reference specific emails when providing information
2. Include relevant details like sender names, dates, and subjects
3. Be helpful and conversational
4. If you don't have enough information, ask for clarification
5. Respect email privacy and only discuss the user's own emails

User Question: ${userMessage}

Please provide a helpful response based on the complete email database above. Always reference specific emails when providing information.`;

      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: systemPrompt,
      });

      const text = response.text || 'Sorry, I couldn\'t generate a response.';
      return text;
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Gemini service unavailable');
    }
  }

  // Load all user emails for comprehensive context
  private async loadAllUserEmails(clerkUserId: string, limit: number = 50): Promise<EmailContext[]> {
    try {
      const accounts = await prisma.account.findMany({
        where: { clerkUserId },
        include: {
          threads: {
            include: {
              emails: {
                include: {
                  from: true,
                  to: true,
                },
                orderBy: {
                  sentAt: 'desc',
                },
              },
            },
            orderBy: {
              lastMessageDate: 'desc',
            },
            take: limit,
          },
        },
      });

      const allEmails: EmailContext[] = [];
      
      for (const account of accounts) {
        for (const thread of account.threads) {
          for (const email of thread.emails) {
            allEmails.push({
              subject: email.subject,
              sender: email.from.name || email.from.address,
              content: email.bodySnippet || email.body || 'No content available',
              date: email.sentAt.toISOString(),
              threadId: thread.id,
            });
          }
        }
      }

      return allEmails;
    } catch (error) {
      console.error('Error loading all user emails:', error);
      return [];
    }
  }

  // Main method to get response with fallback
  async getResponse(userMessage: string, clerkUserId: string): Promise<{ response: string; provider: string; emailCount: number }> {
    try {
      // For OpenAI, we can use the existing search-based approach
      // For Gemini, we'll load all emails in the getGeminiResponse method
      
      // Try OpenAI first
      try {
        // Load or search for relevant emails for OpenAI
        const relevantEmails = await this.searchEmails(userMessage, clerkUserId, 10);
        if (relevantEmails.length > 0) {
          this.emailContext = relevantEmails;
          this.updateSystemMessage();
        }
        
        const response = await this.getOpenAIResponse(userMessage);
        return {
          response,
          provider: 'OpenAI GPT-4',
          emailCount: this.emailContext.length
        };
      } catch (openaiError) {
        console.log('OpenAI failed, trying Gemini...');
        
        // Fallback to Gemini with comprehensive email context
        try {
          const response = await this.getGeminiResponse(userMessage, clerkUserId);
          return {
            response,
            provider: 'Google Gemini',
            emailCount: 50 // Gemini gets access to up to 50 emails
          };
        } catch (geminiError) {
          throw new Error('Both AI services are currently unavailable');
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      throw error;
    }
  }

  // Clear conversation history
  clearHistory() {
    this.messages = [this.messages[0]]; // Keep system message
  }

  // Get conversation history
  getHistory(): ChatMessage[] {
    return this.messages.slice(1); // Exclude system message
  }
} 