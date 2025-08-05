import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';
import User from '@/models/User';
import EmailService from '@/lib/emailService';
import jwt from 'jsonwebtoken';

// POST - Schedule a meeting (mentor creates/confirms booking)
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const mentor = await User.findById(decoded.userId);
    
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Only mentors can schedule meetings' }, { status: 403 });
    }

    const { 
      menteeId, 
      scheduledDateTime, 
      duration = 60, 
      meetingLink,
      bookingId = null 
    } = await request.json();

    // Validate required fields
    if (!menteeId || !scheduledDateTime || !meetingLink) {
      return NextResponse.json({ 
        error: 'Missing required fields: menteeId, scheduledDateTime, meetingLink' 
      }, { status: 400 });
    }

    // Validate mentee exists
    const mentee = await User.findById(menteeId);
    if (!mentee || mentee.role !== 'mentee') {
      return NextResponse.json({ error: 'Invalid mentee' }, { status: 400 });
    }

    // Check if the scheduled time is in the future
    const meetingDate = new Date(scheduledDateTime);
    if (meetingDate <= new Date()) {
      return NextResponse.json({ 
        error: 'Meeting time must be in the future' 
      }, { status: 400 });
    }

    let booking;

    if (bookingId) {
      // Update existing booking request
      booking = await Booking.findById(bookingId);
      if (!booking) {
        return NextResponse.json({ error: 'Booking request not found' }, { status: 404 });
      }
      
      if (booking.mentorId.toString() !== mentor._id.toString()) {
        return NextResponse.json({ error: 'You can only confirm your own booking requests' }, { status: 403 });
      }

      // Update the booking
      booking.status = 'confirmed';
      booking.scheduledDateTime = meetingDate;
      booking.duration = duration;
      await booking.save();
    } else {
      // Create new booking (mentor initiated)
      booking = new Booking({
        menteeId,
        mentorId: mentor._id,
        scheduledDateTime: meetingDate,
        description: 'Meeting scheduled by mentor',
        duration,
        status: 'confirmed'
      });
      await booking.save();
    }

    // Send meeting confirmation email to mentee
    const emailService = new EmailService();
    await emailService.sendMeetingConfirmationEmail(mentee, mentor, booking, meetingLink);

    return NextResponse.json({ 
      message: 'Meeting scheduled successfully',
      booking: {
        _id: booking._id,
        menteeId: booking.menteeId,
        mentorId: booking.mentorId,
        scheduledDateTime: booking.scheduledDateTime,
        status: booking.status,
        duration: booking.duration,
        meetingLink
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error scheduling meeting:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
