import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { smartSearch, getSearchSuggestions, getSearchAnalytics } from '@/lib/search';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const folder = searchParams.get('folder') as 'inbox' | 'sent' | 'draft' || undefined;
    const sender = searchParams.get('sender') || undefined;
    const hasAttachments = searchParams.get('hasAttachments') === 'true' ? true : 
                          searchParams.get('hasAttachments') === 'false' ? false : undefined;
    const sensitivity = searchParams.get('sensitivity') as 'normal' | 'private' | 'personal' | 'confidential' || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const type = searchParams.get('type') || 'search'; // 'search', 'suggestions', 'analytics'

    // Build filters object
    const filters = {
      folder,
      sender,
      hasAttachments,
      sensitivity,
      dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
    };

    let result;

    switch (type) {
      case 'suggestions':
        if (query.length < 2) {
          result = { suggestions: [] };
        } else {
          const suggestions = await getSearchSuggestions(userId, query);
          result = { suggestions };
        }
        break;

      case 'analytics':
        const analytics = await getSearchAnalytics(userId);
        result = { analytics };
        break;

      case 'search':
      default:
        if (!query.trim()) {
          result = { results: [], total: 0 };
        } else {
          const results = await smartSearch(userId, query, filters);
          result = { 
            results, 
            total: results.length,
            query,
            filters,
            searchTime: Date.now()
          };
        }
        break;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in smart search:', error);
    return NextResponse.json({ 
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 