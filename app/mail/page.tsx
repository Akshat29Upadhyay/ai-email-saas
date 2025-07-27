"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Star, 
  Archive, 
  Trash2,
  MoreHorizontal,
  Reply,
  Forward,
  Filter,
  Settings,
  Plus,
  ChevronDown,
  Calendar,
  Paperclip,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Email {
  id: string;
  subject: string;
  bodySnippet: string;
  sentAt: Date;
  from: {
    name: string;
    address: string;
  };
  to: Array<{
    name: string;
    address: string;
  }>;
  hasAttachments: boolean;
  emailLabel: 'inbox' | 'sent' | 'draft';
  sensitivity: 'normal' | 'private' | 'personal' | 'confidential';
}

interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  participantIds: string[];
  emails: Email[];
  inboxStatus: boolean;
  draftStatus: boolean;
  sentStatus: boolean;
}

export default function MailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState('inbox');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push('/sign-in');
        return;
      }
      
      // Mock data for demonstration
      const mockThreads: Thread[] = [
        {
          id: '1',
          subject: 'Project Update - Q4 Goals',
          lastMessageDate: new Date('2024-01-15T10:30:00'),
          participantIds: ['user1', 'user2'],
          inboxStatus: true,
          draftStatus: false,
          sentStatus: false,
          emails: [
            {
              id: '1',
              subject: 'Project Update - Q4 Goals',
              bodySnippet: 'Hi team, I wanted to share our progress on the Q4 goals...',
              sentAt: new Date('2024-01-15T10:30:00'),
              from: { name: 'John Smith', address: 'john@company.com' },
              to: [{ name: 'Team', address: 'team@company.com' }],
              hasAttachments: true,
              emailLabel: 'inbox',
              sensitivity: 'normal'
            }
          ]
        },
        {
          id: '2',
          subject: 'Meeting Tomorrow at 2 PM',
          lastMessageDate: new Date('2024-01-15T09:15:00'),
          participantIds: ['user1', 'user3'],
          inboxStatus: true,
          draftStatus: false,
          sentStatus: false,
          emails: [
            {
              id: '2',
              subject: 'Meeting Tomorrow at 2 PM',
              bodySnippet: 'Just a reminder about our scheduled meeting...',
              sentAt: new Date('2024-01-15T09:15:00'),
              from: { name: 'Sarah Johnson', address: 'sarah@company.com' },
              to: [{ name: 'Akshat', address: 'akshat@company.com' }],
              hasAttachments: false,
              emailLabel: 'inbox',
              sensitivity: 'normal'
            }
          ]
        },
        {
          id: '3',
          subject: 'AI Email RAG Implementation',
          lastMessageDate: new Date('2024-01-15T08:45:00'),
          participantIds: ['user1', 'user4'],
          inboxStatus: true,
          draftStatus: false,
          sentStatus: false,
          emails: [
            {
              id: '3',
              subject: 'AI Email RAG Implementation',
              bodySnippet: 'Great news! We\'ve successfully implemented the AI-driven email RAG system...',
              sentAt: new Date('2024-01-15T08:45:00'),
              from: { name: 'Tech Team', address: 'tech@company.com' },
              to: [{ name: 'Development Team', address: 'dev@company.com' }],
              hasAttachments: true,
              emailLabel: 'inbox',
              sensitivity: 'confidential'
            }
          ]
        }
      ];
      
      setThreads(mockThreads);
      setLoading(false);
    }
  }, [user, isLoaded, router]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement full-text search functionality here
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Keyboard shortcuts
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      // Focus search
      document.getElementById('search-input')?.focus();
    }
    if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      // Quick reply
      console.log('Quick reply');
    }
    if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      // Jump to inbox
      setCurrentFolder('inbox');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50" onKeyDown={handleKeyPress} tabIndex={0}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">EmailSaaS</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Inbox className="w-4 h-4 mr-2" />
                Inbox
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <Send className="w-4 h-4 mr-2" />
                Sent
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-600">
                <FileText className="w-4 h-4 mr-2" />
                Drafts
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search-input"
                placeholder="Search emails (⌘K)"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Compose
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Keyboard Shortcuts</DropdownMenuItem>
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Avatar className="w-8 h-8">
              <AvatarImage src={user.imageUrl} />
              <AvatarFallback>
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Folders</h3>
              <div className="space-y-1">
                <Button 
                  variant={currentFolder === 'inbox' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setCurrentFolder('inbox')}
                >
                  <Inbox className="w-4 h-4 mr-2" />
                  Inbox
                  <Badge variant="secondary" className="ml-auto">3</Badge>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  Starred
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Send className="w-4 h-4 mr-2" />
                  Sent
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Drafts
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Trash
                </Button>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">AI Features</h3>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start text-green-600">
                  <Search className="w-4 h-4 mr-2" />
                  Smart Search
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-blue-600">
                  <FileText className="w-4 h-4 mr-2" />
                  AI Summaries
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-purple-600">
                  <Reply className="w-4 h-4 mr-2" />
                  Smart Replies
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex">
          {/* Email List */}
          <div className="w-1/2 border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {currentFolder.charAt(0).toUpperCase() + currentFolder.slice(1)}
                </h2>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                {threads.length} conversations
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-1">
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                      selectedThread?.id === thread.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-transparent'
                    }`}
                    onClick={() => setSelectedThread(thread)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8 mt-1">
                        <AvatarFallback>
                          {thread.emails[0]?.from.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {thread.emails[0]?.from.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {thread.lastMessageDate.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {thread.subject}
                        </p>
                        
                        <p className="text-sm text-gray-600 truncate">
                          {thread.emails[0]?.bodySnippet}
                        </p>
                        
                        <div className="flex items-center space-x-2 mt-2">
                          {thread.emails[0]?.hasAttachments && (
                            <Paperclip className="w-3 h-3 text-gray-400" />
                          )}
                          {thread.emails[0]?.sensitivity !== 'normal' && (
                            <Badge variant="outline" className="text-xs">
                              {thread.emails[0]?.sensitivity}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Email Detail */}
          <div className="flex-1">
            {selectedThread ? (
              <div className="h-full flex flex-col">
                {/* Email Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {selectedThread.subject}
                      </h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>From: {selectedThread.emails[0]?.from.name} &lt;{selectedThread.emails[0]?.from.address}&gt;</span>
                        <span>To: {selectedThread.emails[0]?.to.map(t => t.name).join(', ')}</span>
                        <span>{selectedThread.lastMessageDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Reply className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Forward className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Mark as read</DropdownMenuItem>
                          <DropdownMenuItem>Star</DropdownMenuItem>
                          <DropdownMenuItem>Archive</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  {selectedThread.emails[0]?.hasAttachments && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Paperclip className="w-4 h-4" />
                      <span>1 attachment</span>
                    </div>
                  )}
                </div>

                {/* Email Content */}
                <ScrollArea className="flex-1 p-6">
                  <div className="prose max-w-none">
                    <p className="text-gray-900 leading-relaxed">
                      {selectedThread.emails[0]?.bodySnippet}
                    </p>
                    <p className="text-gray-900 leading-relaxed mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                    <p className="text-gray-900 leading-relaxed mt-4">
                      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </p>
                  </div>
                </ScrollArea>

                {/* AI Features Bar */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="text-blue-600">
                      <FileText className="w-4 h-4 mr-2" />
                      AI Summary
                    </Button>
                    <Button variant="outline" size="sm" className="text-green-600">
                      <Reply className="w-4 h-4 mr-2" />
                      Smart Reply
                    </Button>
                    <Button variant="outline" size="sm" className="text-purple-600">
                      <Search className="w-4 h-4 mr-2" />
                      Related Emails
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select an email</h3>
                  <p className="text-gray-600">Choose an email from the list to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4">
        <Card className="w-64">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Keyboard Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>⌘K</span>
              <span>Search</span>
            </div>
            <div className="flex justify-between">
              <span>⌘R</span>
              <span>Quick Reply</span>
            </div>
            <div className="flex justify-between">
              <span>⌘J</span>
              <span>Jump to Inbox</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}