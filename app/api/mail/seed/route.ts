import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run the seed script for the current user
    const { stdout, stderr } = await execAsync(`npm run db:seed-user ${userId}`);
    
    if (stderr && !stderr.includes('ℹ️')) {
      console.error('Seed script stderr:', stderr);
    }

    // Check if the seeding was successful by looking for success indicators in stdout
    const isSuccess = stdout.includes('🎉 Database seeded successfully') || 
                     stdout.includes('✅ Created sample threads and emails');

    if (isSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully for your user',
        userId: userId,
        output: stdout
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Seeding may have failed or data already exists',
        userId: userId,
        output: stdout
      });
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      userId: userId,
      message: 'Your Clerk user ID. Use this to seed data for your account.',
      instructions: 'POST to this endpoint to seed data for your user'
    });
  } catch (error) {
    console.error('Error getting user ID:', error);
    return NextResponse.json({ 
      error: 'Failed to get user ID',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 