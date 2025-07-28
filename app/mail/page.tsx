"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Calendar,
  Paperclip,
  Loader2,
  AlertCircle,
  Sparkles,
  X,
  Zap,
  ZapCircle
} from 'lucide-react';
import SeedDataButton from '@/components/seed-data-button';
import SmartSearch from '@/components/smart-search';
import EmailChatbot from '@/components/email-chatbot';
import { UserHeader } from '@/components/user-header';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types based on Prisma schema
interface EmailAddress {
  id: string;
  name: string | null;
  address: string;
  raw: string | null;
}

interface EmailAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  inline: boolean;
  contentId: string | null;
  content: string | null;
  contentLocation: string | null;
}

interface Email {
  id: string;
  subject: string;
  bodySnippet: string | null;
  body: string | null;
  sentAt: Date;
  receivedAt: Date;
  hasAttachments: boolean;
  emailLabel: 'inbox' | 'sent' | 'draft';
  sensitivity: 'normal' | 'private' | 'personal' | 'confidential';
  from: EmailAddress;
  to: EmailAddress[];
  cc: EmailAddress[];
  bcc: EmailAddress[];
  attachments: EmailAttachment[];
}

interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  participantIds: string[];
  inboxStatus: boolean;
  draftStatus: boolean;
  sentStatus: boolean;
  emails: Email[];
}

export default function MailPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'draft'>('inbox');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update URL with current search and folder state
  const updateURL = (folder: string, query: string) => {
    const params = new URLSearchParams();
    if (folder && folder !== 'inbox') params.set('folder', folder);
    if (query) params.set('q', query);
    
    const newURL = params.toString() ? `?${params.toString()}` : '';
    router.replace(`/mail${newURL}`, { scroll: false });
  };

  // Initialize from URL params
  useEffect(() => {
    if (isLoaded && user) {
      const initialFolder = searchParams.get('folder') || 'inbox';
      const initialQuery = searchParams.get('q') || '';
      setCurrentFolder(initialFolder as 'inbox' | 'sent' | 'draft');
      setSearchQuery(initialQuery);
      fetchThreads(initialFolder, initialQuery);
    }
  }, [user, isLoaded, router, searchParams]);

  // Handle URL parameter changes (browser back/forward)
  useEffect(() => {
    if (isLoaded && user) {
      const urlFolder = searchParams.get('folder') || 'inbox';
      const urlQuery = searchParams.get('q') || '';
      
      // Only update if different from current state
      if (urlFolder !== currentFolder || urlQuery !== searchQuery) {
        setCurrentFolder(urlFolder as 'inbox' | 'sent' | 'draft');
        setSearchQuery(urlQuery);
        fetchThreads(urlFolder, urlQuery);
      }
    }
  }, [searchParams, isLoaded, user]);

  // Fetch threads from API
  const fetchThreads = async (folder?: string, query?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (folder) params.append('folder', folder);
      if (query) params.append('q', query);
      
      const response = await fetch(`/api/mail/threads?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }
      
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load emails');
    } finally {
      setLoading(false);
    }
  };

  // Smart search function
  const handleSmartSearch = async (query: string, filters: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('q', query);
      params.append('type', 'search');
      
      // Add filters to params
      if (filters.folder) params.append('folder', filters.folder);
      if (filters.sender) params.append('sender', filters.sender);
      if (filters.hasAttachments !== undefined) params.append('hasAttachments', filters.hasAttachments.toString());
      if (filters.sensitivity) params.append('sensitivity', filters.sensitivity);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start.toISOString());
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end.toISOString());
      
      const response = await fetch(`/api/mail/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to perform smart search');
      }
      
      const data = await response.json();
      
      // Convert search results back to thread format for compatibility
      const searchThreads = data.results.map((result: any) => result.thread);
      setThreads(searchThreads);
      setSearchQuery(query);
      updateURL(filters.folder || 'inbox', query); // Update URL with search results
    } catch (err) {
      console.error('Error in smart search:', err);
      setError('Smart search failed');
    } finally {
      setLoading(false);
    }
  };

  // Simple search function


  // Fetch specific thread
  const fetchThread = async (threadId: string) => {
    try {
      const response = await fetch(`/api/mail/threads/${threadId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }
      
      const data = await response.json();
      setSelectedThread(data.thread);
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError('Failed to load email details');
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        fetchThreads(currentFolder, searchQuery);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      fetchThreads(currentFolder);
    }
  }, [searchQuery, currentFolder]);

  const handleThreadSelect = (thread: Thread) => {
    setSelectedThread(thread);
  };

  const handleFolderChange = (folder: 'inbox' | 'sent' | 'draft') => {
    setCurrentFolder(folder);
    setSelectedThread(null);
    setSearchQuery(''); // Clear search when changing folders
    fetchThreads(folder);
    updateURL(folder, ''); // Update URL and clear search
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const emailDate = new Date(date);
    const diffInHours = (now.getTime() - emailDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return emailDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return emailDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return email[0].toUpperCase();
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-2 text-gray-600">Loading your inbox...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <UserHeader />

      <div className="flex h-[calc(100vh-64px)] pt-16">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Folder Navigation */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <Button 
                variant={currentFolder === 'inbox' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${currentFolder === 'inbox' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => handleFolderChange('inbox')}
              >
                <Inbox className="w-4 h-4 mr-3" />
                Inbox
                <Badge className="ml-auto bg-gray-200 text-gray-800">
                  {threads.filter(t => t.emails.some(e => e.emailLabel === 'inbox')).length}
                </Badge>
              </Button>
              <Button 
                variant={currentFolder === 'sent' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${currentFolder === 'sent' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => handleFolderChange('sent')}
              >
                <Send className="w-4 h-4 mr-3" />
                Sent
                <Badge className="ml-auto bg-gray-200 text-gray-800">
                  {threads.filter(t => t.emails.some(e => e.emailLabel === 'sent')).length}
                </Badge>
              </Button>
              <Button 
                variant={currentFolder === 'draft' ? 'default' : 'ghost'} 
                className={`w-full justify-start ${currentFolder === 'draft' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => handleFolderChange('draft')}
              >
                <FileText className="w-4 h-4 mr-3" />
                Drafts
                <Badge className="ml-auto bg-gray-200 text-gray-800">
                  {threads.filter(t => t.emails.some(e => e.emailLabel === 'draft')).length}
                </Badge>
              </Button>
            </div>
          </div>

          {/* AI Features */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">AI Features</h3>
            <div className="space-y-2">
              <Button variant="ghost" size="sm" className="w-full justify-start text-green-700 hover:bg-green-50">
                <Sparkles className="w-4 h-4 mr-3" />
                Smart Compose
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-blue-700 hover:bg-blue-50">
                <Zap className="w-4 h-4 mr-3" />
                Auto Reply
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-purple-700 hover:bg-purple-50">
                <Mail className="w-4 h-4 mr-3" />
                Email Summary
              </Button>
            </div>
          </div>

          {/* Database Status */}
          <div className="p-4">
            <SeedDataButton />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Search and Actions Bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold text-gray-900 capitalize">{currentFolder}</h2>
                {searchQuery && (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                      AI Search
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {threads.length} results
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearchQuery('');
                        fetchThreads(currentFolder);
                        updateURL(currentFolder, ''); // Clear URL parameters
                      }}
                      className="text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear Search
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Smart Search */}
                <div className="w-80">
                  <SmartSearch
                    onSearch={handleSmartSearch}
                    onClear={() => {
                      setSearchQuery('');
                      fetchThreads(currentFolder);
                      updateURL(currentFolder, ''); // Clear URL parameters
                    }}
                    placeholder="Search emails with AI..."
                    initialQuery={searchQuery}
                  />
                </div>
                
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Compose
                </Button>
              </div>
            </div>
          </div>

          {/* Email List */}
          <div className="w-1/2 border-r border-gray-200">
            {error && (
              <div className="p-4 flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}
            
            <ScrollArea className="h-[calc(100vh-160px)]">
              <div className="space-y-1">
                {threads.map((thread) => {
                  const latestEmail = thread.emails[0];
                  if (!latestEmail) return null;
                  
                  return (
                    <div
                      key={thread.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        selectedThread?.id === thread.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-transparent'
                      }`}
                      onClick={() => handleThreadSelect(thread)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 mt-1">
                          <AvatarFallback>
                            {getInitials(latestEmail.from.name, latestEmail.from.address)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {latestEmail.from.name || latestEmail.from.address}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatDate(latestEmail.sentAt)}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {thread.subject}
                          </p>
                          
                          <p className="text-sm text-gray-600 truncate">
                            {latestEmail.bodySnippet || 'No preview available'}
                          </p>
                          
                          <div className="flex items-center space-x-2 mt-2">
                            {latestEmail.hasAttachments && (
                              <Paperclip className="w-3 h-3 text-gray-400" />
                            )}
                            {latestEmail.sensitivity !== 'normal' && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                {latestEmail.sensitivity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {threads.length === 0 && !loading && !error && (
                  <div className="p-8 text-center">
                    <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery ? 'No emails match your search.' : 'Your inbox is empty.'}
                    </p>
                    {!searchQuery && (
                      <div className="max-w-md mx-auto">
                        <SeedDataButton />
                      </div>
                    )}
                  </div>
                )}
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
                      {selectedThread.emails[0] && (
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            From: {selectedThread.emails[0].from.name || selectedThread.emails[0].from.address}
                          </span>
                          <span>
                            To: {selectedThread.emails[0].to.map(t => t.name || t.address).join(', ')}
                          </span>
                          <span>{formatDate(selectedThread.emails[0].sentAt)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                        <Reply className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                        <Forward className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
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
                      <span>{selectedThread.emails[0].attachments.length} attachment(s)</span>
                    </div>
                  )}
                </div>

                {/* Email Content */}
                <ScrollArea className="flex-1 p-6">
                  <div className="prose max-w-none">
                    {selectedThread.emails.map((email, index) => (
                      <div key={email.id} className="mb-8">
                        <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                          <span>{email.from.name || email.from.address}</span>
                          <span>•</span>
                          <span>{formatDate(email.sentAt)}</span>
                        </div>
                        
                        <div className="text-gray-900 leading-relaxed">
                          {email.body ? (
                            <div dangerouslySetInnerHTML={{ __html: email.body }} />
                          ) : (
                            <p>{email.bodySnippet || 'No content available'}</p>
                          )}
                        </div>
                        
                        {email.attachments.length > 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                            <div className="space-y-2">
                              {email.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                                  <Paperclip className="w-4 h-4 text-gray-400" />
                                  <span>{attachment.name}</span>
                                  <span className="text-gray-500">({attachment.size} bytes)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* AI Features Bar */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-50">
                      <FileText className="w-4 h-4 mr-2" />
                      AI Summary
                    </Button>
                    <Button variant="outline" size="sm" className="text-green-700 border-green-300 hover:bg-green-50">
                      <Reply className="w-4 h-4 mr-2" />
                      Smart Reply
                    </Button>
                    <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-50">
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
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
        </div>
      </div>
      
      {/* Email Chatbot */}
      <EmailChatbot />
    </div>
  );
}