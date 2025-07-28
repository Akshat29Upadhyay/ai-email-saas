"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2,
  Sparkles,
  Mail,
  Zap,
  X
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  provider?: string;
  emailCount?: number;
}

interface EmailChatbotProps {
  className?: string;
}

export default function EmailChatbot({ className = "" }: EmailChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<{ openai: string; gemini: string; ready: boolean } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check AI service status on mount
  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const response = await fetch('/api/chatbot/test');
        const data = await response.json();
        if (data.success) {
          setAiStatus(data.setup);
        }
      } catch (error) {
        console.error('Failed to check AI status:', error);
      }
    };
    
    checkAIStatus();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: data.timestamp,
        provider: data.provider,
        emailCount: data.emailCount
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Chatbot error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get response');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'clear' }),
      });
      setMessages([]);
      setError(null);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        size="lg"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-16 right-0 w-96 h-[500px] shadow-xl border-0 flex flex-col">
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <CardTitle className="text-lg">Email Assistant</CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                {aiStatus && (
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      aiStatus.ready 
                        ? 'text-green-100 border-green-300 bg-green-900/20' 
                        : 'text-red-100 border-red-300 bg-red-900/20'
                    }`}
                  >
                    {aiStatus.ready ? 'AI Ready' : 'AI Unavailable'}
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-white hover:bg-white/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-blue-100">
              Ask me anything about your emails
            </p>
          </CardHeader>

          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Email Assistant
                  </h3>
                  <p className="text-gray-600">
                    I can help you find and understand information from your emails.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="w-4 h-4 mt-0.5 text-blue-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            {message.role === 'assistant' ? (
                              <div className="chatbot-markdown">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            )}
                            
                            {/* Message metadata */}
                            {message.role === 'assistant' && (message.provider || message.emailCount) && (
                              <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                                {message.provider && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.provider === 'OpenAI GPT-4' ? (
                                      <Sparkles className="w-3 h-3 mr-1" />
                                    ) : (
                                      <Zap className="w-3 h-3 mr-1" />
                                    )}
                                    {message.provider}
                                  </Badge>
                                )}
                                {message.emailCount && message.emailCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    <Mail className="w-3 h-3 mr-1" />
                                    {message.emailCount} emails
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {message.role === 'user' && (
                            <User className="w-4 h-4 mt-0.5 text-blue-100 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-sm text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Error message */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-200 flex-shrink-0">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  ref={inputRef}
                  placeholder="Ask about your emails..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="flex-1 text-gray-900 placeholder:text-gray-500"
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 