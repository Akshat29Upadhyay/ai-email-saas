"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Zap, 
  Clock, 
  Filter, 
  Sparkles,
  Mail,
  User,
  Paperclip
} from 'lucide-react';

export default function SearchDemo() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLive, setIsLive] = useState(false);

  const demoEmails = [
    {
      id: 1,
      subject: "Project Update Meeting",
      sender: "John Smith",
      email: "john@company.com",
      snippet: "Hi team, let's discuss the latest project updates...",
      hasAttachments: true,
      date: "2 hours ago"
    },
    {
      id: 2,
      subject: "Budget Review Q4",
      sender: "Sarah Johnson",
      email: "sarah@company.com",
      snippet: "Please review the Q4 budget numbers...",
      hasAttachments: false,
      date: "1 day ago"
    },
    {
      id: 3,
      subject: "Client Presentation",
      sender: "Mike Wilson",
      email: "mike@company.com",
      snippet: "Here's the client presentation for tomorrow...",
      hasAttachments: true,
      date: "3 days ago"
    }
  ];

  const filteredEmails = demoEmails.filter(email => 
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.snippet.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setIsLive(value.length > 0);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>Real-Time Email Filtering Demo</span>
          {isLive && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Zap className="w-3 h-3 mr-1" />
              Live
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Type to see real-time filtering in action. Results update instantly as you type!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search emails, senders, or content..."
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            className="pl-10 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          {isLive && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                <Zap className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {filteredEmails.length} of {demoEmails.length} emails
              {isLive && searchQuery && (
                <span className="text-green-600 ml-2">
                  • Filtered in real-time
                </span>
              )}
            </span>
            {searchQuery && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleInputChange('')}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>

          {/* Email List */}
          <div className="space-y-2">
            {filteredEmails.map(email => (
              <div 
                key={email.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{email.subject}</h4>
                      {email.hasAttachments && (
                        <Paperclip className="w-3 h-3 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                      <User className="w-3 h-3" />
                      <span>{email.sender}</span>
                      <span>•</span>
                      <span>{email.email}</span>
                    </div>
                    <p className="text-sm text-gray-600">{email.snippet}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{email.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEmails.length === 0 && searchQuery && (
            <div className="text-center py-8 text-gray-500">
              <Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No emails found matching "{searchQuery}"</p>
              <p className="text-sm">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>

        {/* Features Highlight */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Real-Time Features:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Instant filtering as you type</span>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-blue-600" />
              <span>Search across subjects, senders, and content</span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-purple-600" />
              <span>Advanced filters and sorting</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 