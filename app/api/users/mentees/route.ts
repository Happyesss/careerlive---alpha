import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// GET - Fetch all mentees for mentor scheduling
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'mentor') {
      return NextResponse.json({ error: 'Only mentors can access this endpoint' }, { status: 403 });
    }

    // Fetch all mentees
    const mentees = await User.find({ role: 'mentee' })
      .select('firstName lastName email')
      .sort({ firstName: 1 });

    // Format mentees to match auth system format (id instead of _id)
    const formattedMentees = mentees.map(mentee => ({
      id: mentee._id.toString(), // Convert to string and use 'id'
      _id: mentee._id, // Keep _id for backwards compatibility
      firstName: mentee.firstName,
      lastName: mentee.lastName,
      email: mentee.email
    }));

    return NextResponse.json({ mentees: formattedMentees });
  } catch (error) {
    console.error('Error fetching mentees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
