import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test database connection
    const accountCount = await prisma.account.count({
      where: { clerkUserId: userId },
    });

    const threadCount = await prisma.thread.count({
      where: {
        account: {
          clerkUserId: userId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      clerkUserId: userId,
      accountCount,
      threadCount,
      message: 'Database connection working with Clerk ID',
    });
  } catch (error) {
    console.error('Error in test route:', error);
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 