import { prisma } from './prisma';

// Smart search types
export interface SearchResult {
  thread: any;
  relevance: number;
  matchedFields: string[];
  highlights: string[];
}

export interface SearchFilters {
  folder?: 'inbox' | 'sent' | 'draft';
  sender?: string;
  hasAttachments?: boolean;
  sensitivity?: 'normal' | 'private' | 'personal' | 'confidential';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Smart search function with multiple search strategies
export async function smartSearch(
  clerkUserId: string,
  query: string,
  filters: SearchFilters = {}
): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  
  // Get all threads for the user
  const accounts = await prisma.account.findMany({
    where: { clerkUserId },
    include: {
      threads: {
        where: {
          ...(filters.folder === 'inbox' && { inboxStatus: true }),
          ...(filters.folder === 'sent' && { sentStatus: true }),
          ...(filters.folder === 'draft' && { draftStatus: true }),
        },
        include: {
          emails: {
            include: {
              from: true,
              to: true,
              cc: true,
              bcc: true,
              attachments: true,
            },
            orderBy: {
              sentAt: 'desc',
            },
          },
        },
        orderBy: {
          lastMessageDate: 'desc',
        },
      },
    },
  });

  const allThreads = accounts.flatMap(account => account.threads);

  // Apply different search strategies
  for (const thread of allThreads) {
    let relevance = 0;
    const matchedFields: string[] = [];
    const highlights: string[] = [];

    // 1. Exact text matching (highest priority)
    const exactMatches = await performExactSearch(thread, query);
    relevance += exactMatches.relevance;
    matchedFields.push(...exactMatches.matchedFields);
    highlights.push(...exactMatches.highlights);

    // 2. Semantic search (medium priority)
    const semanticMatches = await performSemanticSearch(thread, query);
    relevance += semanticMatches.relevance * 0.8;
    matchedFields.push(...semanticMatches.matchedFields);
    highlights.push(...semanticMatches.highlights);

    // 3. Fuzzy search (lower priority)
    const fuzzyMatches = await performFuzzySearch(thread, query);
    relevance += fuzzyMatches.relevance * 0.6;
    matchedFields.push(...fuzzyMatches.matchedFields);
    highlights.push(...fuzzyMatches.highlights);

    // 4. Apply filters
    if (await applyFilters(thread, filters)) {
      // Add filter bonus
      relevance += 0.1;
    } else {
      // Skip this result if filters don't match
      continue;
    }

    // 5. Recency boost
    const daysSinceLastMessage = (Date.now() - thread.lastMessageDate.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastMessage <= 7) {
      relevance += 0.2; // Recent emails get a boost
    }

    // 6. Importance boost based on sender and content
    relevance += calculateImportanceScore(thread);

    if (relevance > 0) {
      results.push({
        thread,
        relevance,
        matchedFields: [...new Set(matchedFields)], // Remove duplicates
        highlights: [...new Set(highlights)].slice(0, 3), // Limit highlights
      });
    }
  }

  // Sort by relevance and return top results
  return results
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 50); // Limit to top 50 results
}

// Exact text matching
async function performExactSearch(thread: any, query: string) {
  let relevance = 0;
  const matchedFields: string[] = [];
  const highlights: string[] = [];
  const queryLower = query.toLowerCase();

  // Search in subject
  if (thread.subject.toLowerCase().includes(queryLower)) {
    relevance += 10;
    matchedFields.push('subject');
    highlights.push(`Subject: ${thread.subject}`);
  }

  // Search in email content
  for (const email of thread.emails) {
    if (email.subject.toLowerCase().includes(queryLower)) {
      relevance += 8;
      matchedFields.push('email_subject');
      highlights.push(`Email: ${email.subject}`);
    }

    if (email.bodySnippet && email.bodySnippet.toLowerCase().includes(queryLower)) {
      relevance += 6;
      matchedFields.push('email_body');
      highlights.push(`Content: ${email.bodySnippet.substring(0, 100)}...`);
    }

    if (email.body && email.body.toLowerCase().includes(queryLower)) {
      relevance += 5;
      matchedFields.push('email_body_full');
    }

    // Search in sender/recipient names
    if (email.from.name && email.from.name.toLowerCase().includes(queryLower)) {
      relevance += 7;
      matchedFields.push('sender_name');
      highlights.push(`From: ${email.from.name}`);
    }

    if (email.from.address.toLowerCase().includes(queryLower)) {
      relevance += 6;
      matchedFields.push('sender_email');
      highlights.push(`From: ${email.from.address}`);
    }

    // Search in recipients
    for (const recipient of email.to) {
      if (recipient.name && recipient.name.toLowerCase().includes(queryLower)) {
        relevance += 5;
        matchedFields.push('recipient_name');
        highlights.push(`To: ${recipient.name}`);
      }
      if (recipient.address.toLowerCase().includes(queryLower)) {
        relevance += 4;
        matchedFields.push('recipient_email');
        highlights.push(`To: ${recipient.address}`);
      }
    }
  }

  return { relevance, matchedFields, highlights };
}

// Semantic search (simplified version - in production you'd use embeddings)
async function performSemanticSearch(thread: any, query: string) {
  let relevance = 0;
  const matchedFields: string[] = [];
  const highlights: string[] = [];

  // Simple keyword-based semantic search
  const semanticKeywords = {
    'meeting': ['meeting', 'schedule', 'appointment', 'call', 'conference'],
    'project': ['project', 'task', 'work', 'assignment', 'deliverable'],
    'report': ['report', 'analysis', 'summary', 'review', 'assessment'],
    'urgent': ['urgent', 'important', 'critical', 'priority', 'asap'],
    'deadline': ['deadline', 'due', 'timeline', 'schedule', 'deadline'],
    'budget': ['budget', 'cost', 'expense', 'financial', 'money'],
    'team': ['team', 'collaboration', 'group', 'department', 'staff'],
  };

  const queryLower = query.toLowerCase();
  
  for (const [category, keywords] of Object.entries(semanticKeywords)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      // Check if thread contains related content
      const threadText = `${thread.subject} ${thread.emails.map(e => e.bodySnippet || '').join(' ')}`.toLowerCase();
      
      if (keywords.some(keyword => threadText.includes(keyword))) {
        relevance += 3;
        matchedFields.push(`semantic_${category}`);
        highlights.push(`Related to: ${category}`);
      }
    }
  }

  return { relevance, matchedFields, highlights };
}

// Fuzzy search for typos and partial matches
async function performFuzzySearch(thread: any, query: string) {
  let relevance = 0;
  const matchedFields: string[] = [];
  const highlights: string[] = [];

  // Simple fuzzy matching (in production you'd use a proper fuzzy search library)
  const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
  const threadText = `${thread.subject} ${thread.emails.map(e => e.bodySnippet || '').join(' ')}`.toLowerCase();

  for (const word of queryWords) {
    // Check for partial matches
    if (threadText.includes(word.substring(0, Math.floor(word.length * 0.7)))) {
      relevance += 2;
      matchedFields.push('fuzzy_match');
      highlights.push(`Partial match: ${word}`);
    }
  }

  return { relevance, matchedFields, highlights };
}

// Apply search filters
async function applyFilters(thread: any, filters: SearchFilters): Promise<boolean> {
  // Sender filter
  if (filters.sender) {
    const senderMatch = thread.emails.some((email: any) => 
      email.from.name?.toLowerCase().includes(filters.sender!.toLowerCase()) ||
      email.from.address.toLowerCase().includes(filters.sender!.toLowerCase())
    );
    if (!senderMatch) return false;
  }

  // Attachment filter
  if (filters.hasAttachments !== undefined) {
    const hasAttachments = thread.emails.some((email: any) => email.hasAttachments);
    if (hasAttachments !== filters.hasAttachments) return false;
  }

  // Sensitivity filter
  if (filters.sensitivity) {
    const hasSensitivity = thread.emails.some((email: any) => email.sensitivity === filters.sensitivity);
    if (!hasSensitivity) return false;
  }

  // Date range filter
  if (filters.dateRange) {
    const threadDate = thread.lastMessageDate;
    if (threadDate < filters.dateRange.start || threadDate > filters.dateRange.end) {
      return false;
    }
  }

  return true;
}

// Calculate importance score based on various factors
function calculateImportanceScore(thread: any): number {
  let score = 0;

  // Sender importance (you could maintain a list of important contacts)
  const importantSenders = ['ceo', 'manager', 'director', 'hr', 'finance'];
  const senderMatch = thread.emails.some((email: any) => 
    importantSenders.some(important => 
      email.from.name?.toLowerCase().includes(important) ||
      email.from.address.toLowerCase().includes(important)
    )
  );
  if (senderMatch) score += 0.3;

  // Content importance indicators
  const importanceKeywords = ['urgent', 'important', 'critical', 'priority', 'asap', 'deadline'];
  const threadText = `${thread.subject} ${thread.emails.map(e => e.bodySnippet || '').join(' ')}`.toLowerCase();
  const hasImportanceKeywords = importanceKeywords.some(keyword => threadText.includes(keyword));
  if (hasImportanceKeywords) score += 0.2;

  // Sensitivity level
  const hasConfidential = thread.emails.some((email: any) => email.sensitivity === 'confidential');
  if (hasConfidential) score += 0.3;

  // Has attachments
  const hasAttachments = thread.emails.some((email: any) => email.hasAttachments);
  if (hasAttachments) score += 0.1;

  return score;
}

// Get search suggestions based on user's email history
export async function getSearchSuggestions(clerkUserId: string, partialQuery: string): Promise<string[]> {
  const suggestions: string[] = [];
  
  if (partialQuery.length < 2) return suggestions;

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

  const allThreads = accounts.flatMap(account => account.threads);
  const queryLower = partialQuery.toLowerCase();

  // Extract common words and phrases
  const words = new Set<string>();
  const phrases = new Set<string>();

  for (const thread of allThreads) {
    // Add subject words
    thread.subject.split(' ').forEach(word => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (cleanWord.length > 2 && cleanWord.includes(queryLower)) {
        words.add(cleanWord);
      }
    });

    // Add sender names
    thread.emails.forEach((email: any) => {
      if (email.from.name) {
        const name = email.from.name.toLowerCase();
        if (name.includes(queryLower)) {
          phrases.add(email.from.name);
        }
      }
    });

    // Add common phrases from email content
    thread.emails.forEach((email: any) => {
      if (email.bodySnippet) {
        const snippet = email.bodySnippet.toLowerCase();
        const snippetWords = snippet.split(' ');
        for (let i = 0; i < snippetWords.length - 1; i++) {
          const phrase = `${snippetWords[i]} ${snippetWords[i + 1]}`;
          if (phrase.includes(queryLower)) {
            phrases.add(phrase);
          }
        }
      }
    });
  }

  // Combine and return suggestions
  return [...words, ...phrases].slice(0, 10);
}

// Get search analytics for the user
export async function getSearchAnalytics(clerkUserId: string) {
  const accounts = await prisma.account.findMany({
    where: { clerkUserId },
    include: {
      threads: {
        include: {
          emails: true,
        },
      },
    },
  });

  const allThreads = accounts.flatMap(account => account.threads);
  
  return {
    totalEmails: allThreads.reduce((sum, thread) => sum + thread.emails.length, 0),
    totalThreads: allThreads.length,
    recentActivity: allThreads.filter(thread => 
      (Date.now() - thread.lastMessageDate.getTime()) < 7 * 24 * 60 * 60 * 1000
    ).length,
    topSenders: getTopSenders(allThreads),
    commonTopics: getCommonTopics(allThreads),
  };
}

function getTopSenders(threads: any[]) {
  const senderCounts: { [key: string]: number } = {};
  
  threads.forEach(thread => {
    thread.emails.forEach((email: any) => {
      const sender = email.from.name || email.from.address;
      senderCounts[sender] = (senderCounts[sender] || 0) + 1;
    });
  });

  return Object.entries(senderCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([sender, count]) => ({ sender, count }));
}

function getCommonTopics(threads: any[]) {
  const topicCounts: { [key: string]: number } = {};
  const commonWords = ['meeting', 'project', 'report', 'update', 'review', 'deadline', 'budget', 'team'];
  
  threads.forEach(thread => {
    const text = `${thread.subject} ${thread.emails.map(e => e.bodySnippet || '').join(' ')}`.toLowerCase();
    commonWords.forEach(word => {
      if (text.includes(word)) {
        topicCounts[word] = (topicCounts[word] || 0) + 1;
      }
    });
  });

  return Object.entries(topicCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));
} 