import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const meetingLink = searchParams.get('meetingLink');
    
    if (!meetingLink) {
      return NextResponse.json({ error: 'Meeting link is required' }, { status: 400 });
    }

    const booking = await Booking.findOne({ meetingLink })
      .populate('menteeId', 'firstName lastName email id')
      .populate('mentorId', 'firstName lastName email id');

    if (!booking) {
      return NextResponse.json({ booking: null });
    }

    return NextResponse.json({ booking });

  } catch (error) {
    console.error('Error fetching booking by meeting link:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
