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
  initialQuery?: string;
}

export default function SmartSearch({ 
  onSearch, 
  onClear, 
  placeholder = "Search emails with AI...",
  className = "",
  initialQuery = ""
}: SmartSearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update query when initialQuery changes (from URL)
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

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
          className="pl-10 pr-20 text-gray-900 placeholder:text-gray-500 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
        />
        
        {/* Search Actions */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 ${
                  getFilterCount() > 0 ? 'bg-blue-100 text-blue-800 border border-blue-200' : ''
                }`}
              >
                <Filter className="w-3 h-3 mr-1" />
                {getFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-xs bg-blue-200 text-blue-800">
                    {getFilterCount()}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="text-gray-900 font-medium">Search Filters</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Folder Filter */}
              <DropdownMenuItem onClick={() => updateFilter('folder', 'inbox')} className="text-gray-700 hover:text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Inbox</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilter('folder', 'sent')} className="text-gray-700 hover:text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Sent</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateFilter('folder', 'draft')} className="text-gray-700 hover:text-gray-900">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Drafts</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              {/* Attachment Filter */}
              <DropdownMenuItem onClick={() => updateFilter('hasAttachments', true)} className="text-gray-700 hover:text-gray-900">
                <Paperclip className="w-3 h-3 mr-2" />
                Has Attachments
              </DropdownMenuItem>
              
              {/* Sensitivity Filter */}
              <DropdownMenuItem onClick={() => updateFilter('sensitivity', 'confidential')} className="text-gray-700 hover:text-gray-900">
                <Shield className="w-3 h-3 mr-2" />
                Confidential
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => setFilters({})} className="text-gray-700 hover:text-gray-900">
                <X className="w-3 h-3 mr-2" />
                Clear All Filters
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            size="sm"
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border border-blue-200">
              {filters.folder}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-blue-900" 
                onClick={() => removeFilter('folder')}
              />
            </Badge>
          )}
          {filters.hasAttachments && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border border-green-200">
              Has Attachments
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-green-900" 
                onClick={() => removeFilter('hasAttachments')}
              />
            </Badge>
          )}
          {filters.sensitivity && (
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800 border border-red-200">
              {filters.sensitivity}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer hover:text-red-900" 
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
              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 font-medium">
                <Lightbulb className="w-3 h-3 text-yellow-600" />
                <span>AI Suggestions</span>
              </div>
              {suggestions.slice(0, 5).map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded text-gray-700 hover:text-gray-900"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Search className="w-3 h-3 text-gray-500" />
                  <span className="text-sm">{suggestion.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 font-medium">
                <Clock className="w-3 h-3 text-gray-500" />
                <span>Recent Searches</span>
              </div>
              {searchHistory.slice(0, 3).map((historyItem, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer rounded text-gray-700 hover:text-gray-900"
                  onClick={() => handleSuggestionClick({ text: historyItem, type: 'phrase' })}
                >
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-sm">{historyItem}</span>
                </div>
              ))}
            </div>
          )}

          {/* Analytics Insights */}
          {analytics && (
            <div className="p-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-600 mb-2 font-medium">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                <span>Insights</span>
              </div>
              <div className="text-xs text-gray-700 space-y-1">
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