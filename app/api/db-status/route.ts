import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import User from '@/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Count total users (without returning sensitive data)
    const userCount = await User.countDocuments();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      database: 'careerlive',
      collections: ['users']
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
