"use client";

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  X, 
  Sparkles, 
  Clock, 
  User, 
  Paperclip, 
  Shield,
  Calendar,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SearchSuggestion {
  text: string;
  type: 'sender' | 'subject' | 'content' | 'phrase';
}

interface SearchFilter {
  folder?: 'inbox' | 'sent' | 'draft';
  sender?: string;
  hasAttachments?: boolean;
  sensitivity?: 'normal' | 'private' | 'personal' | 'confidential';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface SmartSearchProps {
  onSearch: (query: string, filters: SearchFilter) => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export default function SmartSearch({ 
  onSearch, 
  onClear, 
  placeholder = "Search emails with AI...",
  className = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load search history and analytics on mount
  useEffect(() => {
    loadSearchHistory();
    loadAnalytics();
  }, []);

  // Handle clicks outside suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSearchHistory = () => {
    const history = localStorage.getItem('emailSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchHistory = (searchQuery: string) => {
    const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('emailSearchHistory', JSON.stringify(newHistory));
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/mail/search?type=analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/mail/search?type=suggestions&q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = data.suggestions.map((suggestion: string) => ({
          text: suggestion,
          type: 'phrase' as const
        }));
        setSuggestions(formattedSuggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.length >= 2) {
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    saveSearchHistory(query);
    setShowSuggestions(false);
    
    try {
      onSearch(query, filters);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    onSearch(suggestion.text, filters);
    saveSearchHistory(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setFilters({});
    setShowSuggestions(false);
    onClear();
  };

  const updateFilter = (key: keyof SearchFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const removeFilter = (key: keyof SearchFilter) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const getFilterCount = () => {
    return Object.keys(filters).filter(key => filters[key as keyof SearchFilter] !== undefined).length;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={() => query.length >= 2 && setShowSuggestions(true)}
          className="pl-10 pr-20"
        />
        
        {/* Search Actions */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 ${getFilterCount() > 0 ? 'bg-blue-100 text-blue-600' : ''}`}
              >
                <Filter className="w-3 h-3 mr-1" />
                {getFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs">
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Search Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Folder Filter */}
              <DropdownMenuItem onClick={() => updateFilter('folder', 'inbox')}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Inbox</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilter('folder', 'sent')}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sent</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilter('folder', 'draft')}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Drafts</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Attachment Filter */}
              <DropdownMenuItem onClick={() => updateFilter('hasAttachments', true)}>
                <Paperclip className="w-3 h-3 mr-2" />
                Has Attachments
              </DropdownMenuItem>
              
              {/* Sensitivity Filter */}
              <DropdownMenuItem onClick={() => updateFilter('sensitivity', 'confidential')}>
                <Shield className="w-3 h-3 mr-2" />
                Confidential
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setFilters({})}>
                <X className="w-3 h-3 mr-2" />
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {getFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.folder && (
            <Badge variant="secondary" className="text-xs">
              {filters.folder}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeFilter('folder')}
              />
            </Badge>
          )}
          {filters.hasAttachments && (
            <Badge variant="secondary" className="text-xs">
              Has Attachments
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeFilter('hasAttachments')}
              />
            </Badge>
          )}
          {filters.sensitivity && (
            <Badge variant="secondary" className="text-xs">
              {filters.sensitivity}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeFilter('sensitivity')}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Search Suggestions */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <Lightbulb className="w-3 h-3" />
                <span>AI Suggestions</span>
              </div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{suggestion.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <Clock className="w-3 h-3" />
                <span>Recent Searches</span>
              </div>
              {searchHistory.slice(0, 3).map((historyItem, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
                  onClick={() => handleSuggestionClick({ text: historyItem, type: 'phrase' })}
                >
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-sm">{historyItem}</span>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Insights */}
          {analytics && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <TrendingUp className="w-3 h-3" />
                <span>Insights</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>📧 {analytics.totalEmails} emails</div>
                <div>💬 {analytics.totalThreads} conversations</div>
                <div>📅 {analytics.recentActivity} recent</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 