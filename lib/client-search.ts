// Client-side real-time filtering for immediate feedback
export interface Thread {
  id: string;
  subject: string;
  lastMessageDate: Date;
  participantIds: string[];
  inboxStatus: boolean;
  draftStatus: boolean;
  sentStatus: boolean;
  emails: any[];
}

export interface SearchFilter {
  folder?: 'inbox' | 'sent' | 'draft';
  sender?: string;
  hasAttachments?: boolean;
  sensitivity?: 'normal' | 'private' | 'personal' | 'confidential';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Real-time client-side filtering
export function filterThreadsRealTime(
  threads: Thread[],
  query: string,
  filters: SearchFilter = {}
): Thread[] {
  if (!query.trim() && Object.keys(filters).length === 0) {
    return threads;
  }

  const queryLower = query.toLowerCase();
  
  return threads.filter(thread => {
    // Apply folder filter
    if (filters.folder) {
      if (filters.folder === 'inbox' && !thread.inboxStatus) return false;
      if (filters.folder === 'sent' && !thread.sentStatus) return false;
      if (filters.folder === 'draft' && !thread.draftStatus) return false;
    }

    // Check if any email in the thread matches the search criteria
    const hasMatchingEmail = thread.emails.some(email => {
      // Text search
      const matchesText = query.trim() === '' || 
        email.subject.toLowerCase().includes(queryLower) ||
        (email.bodySnippet && email.bodySnippet.toLowerCase().includes(queryLower)) ||
        (email.body && email.body.toLowerCase().includes(queryLower)) ||
        (email.from.name && email.from.name.toLowerCase().includes(queryLower)) ||
        email.from.address.toLowerCase().includes(queryLower) ||
        email.to.some((recipient: any) => 
          (recipient.name && recipient.name.toLowerCase().includes(queryLower)) ||
          recipient.address.toLowerCase().includes(queryLower)
        );

      // Sender filter
      const matchesSender = !filters.sender || 
        (email.from.name && email.from.name.toLowerCase().includes(filters.sender.toLowerCase())) ||
        email.from.address.toLowerCase().includes(filters.sender.toLowerCase());

      // Attachment filter
      const matchesAttachments = filters.hasAttachments === undefined || 
        email.hasAttachments === filters.hasAttachments;

      // Sensitivity filter
      const matchesSensitivity = !filters.sensitivity || 
        email.sensitivity === filters.sensitivity;

      // Date range filter
      const matchesDateRange = !filters.dateRange || 
        (email.sentAt >= filters.dateRange.start && email.sentAt <= filters.dateRange.end);

      return matchesText && matchesSender && matchesAttachments && matchesSensitivity && matchesDateRange;
    });

    return hasMatchingEmail;
  });
}

// Highlight matching text in search results
export function highlightMatches(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
}

// Get search suggestions from existing threads
export function getSearchSuggestionsFromThreads(threads: Thread[], query: string): string[] {
  if (query.length < 2) return [];

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  threads.forEach(thread => {
    // Subject suggestions
    if (thread.subject.toLowerCase().includes(queryLower)) {
      suggestions.add(thread.subject);
    }

    // Sender suggestions
    thread.emails.forEach(email => {
      if (email.from.name && email.from.name.toLowerCase().includes(queryLower)) {
        suggestions.add(email.from.name);
      }
      if (email.from.address.toLowerCase().includes(queryLower)) {
        suggestions.add(email.from.address);
      }
    });

    // Content suggestions
    thread.emails.forEach(email => {
      if (email.bodySnippet) {
        const words = email.bodySnippet.toLowerCase().split(' ');
        words.forEach(word => {
          if (word.includes(queryLower) && word.length > 2) {
            suggestions.add(word);
          }
        });
      }
    });
  });

  return Array.from(suggestions).slice(0, 10);
}

// Calculate search relevance score
export function calculateRelevanceScore(thread: Thread, query: string): number {
  if (!query.trim()) return 0;

  let score = 0;
  const queryLower = query.toLowerCase();

  thread.emails.forEach(email => {
    // Subject match (highest weight)
    if (email.subject.toLowerCase().includes(queryLower)) {
      score += 10;
    }

    // Sender name match
    if (email.from.name && email.from.name.toLowerCase().includes(queryLower)) {
      score += 8;
    }

    // Sender email match
    if (email.from.address.toLowerCase().includes(queryLower)) {
      score += 6;
    }

    // Body snippet match
    if (email.bodySnippet && email.bodySnippet.toLowerCase().includes(queryLower)) {
      score += 4;
    }

    // Full body match
    if (email.body && email.body.toLowerCase().includes(queryLower)) {
      score += 3;
    }

    // Recipient match
    email.to.forEach((recipient: any) => {
      if (recipient.name && recipient.name.toLowerCase().includes(queryLower)) {
        score += 5;
      }
      if (recipient.address.toLowerCase().includes(queryLower)) {
        score += 4;
      }
    });
  });

  // Recency boost
  const daysSinceLastMessage = (Date.now() - thread.lastMessageDate.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceLastMessage <= 7) {
    score += 2;
  }

  return score;
}

// Sort threads by relevance
export function sortThreadsByRelevance(threads: Thread[], query: string): Thread[] {
  if (!query.trim()) return threads;

  return threads
    .map(thread => ({
      thread,
      relevance: calculateRelevanceScore(thread, query)
    }))
    .filter(item => item.relevance > 0)
    .sort((a, b) => b.relevance - a.relevance)
    .map(item => item.thread);
} 