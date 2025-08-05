import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Simply get all mentors from the database - no availability checking
    const mentors = await User.find({ role: 'mentor' })
      .select('firstName lastName email imageUrl')
      .lean();

    const availableMentors = mentors.map(mentor => ({
      _id: mentor._id,
      firstName: mentor.firstName,
      lastName: mentor.lastName,
      email: mentor.email,
      imageUrl: mentor.imageUrl || '',
      fullName: `${mentor.firstName} ${mentor.lastName}`
    }));

    return NextResponse.json({ 
      availableMentors,
      totalMentors: mentors.length,
      availableCount: availableMentors.length
    });

  } catch (error) {
    console.error('Error fetching mentors:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
