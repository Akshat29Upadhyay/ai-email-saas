import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserThreads, searchThreads } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') as 'inbox' | 'sent' | 'draft' || 'inbox';
    const query = searchParams.get('q');

    let threads;
    
    if (query) {
      threads = await searchThreads(userId, query);
    } else {
      threads = await getUserThreads(userId, folder);
    }

    return NextResponse.json({ threads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 