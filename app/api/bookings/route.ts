import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';
import User from '@/models/User';
import EmailService from '@/lib/emailService';
import jwt from 'jsonwebtoken';

// GET - Fetch all bookings for a user
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let bookings;
    if (user.role === 'mentor') {
      bookings = await Booking.find({ mentorId: user._id })
        .populate('menteeId', 'firstName lastName email')
        .sort({ createdAt: -1 });
    } else {
      bookings = await Booking.find({ menteeId: user._id })
        .populate('mentorId', 'firstName lastName email')
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const mentee = await User.findById(decoded.userId);
    
    if (!mentee || mentee.role !== 'mentee') {
      return NextResponse.json({ error: 'Only mentees can create bookings' }, { status: 403 });
    }

    const { mentorId, scheduledDateTime, description, duration = 60 } = await request.json();

    // Validate required fields
    if (!mentorId || !scheduledDateTime) {
      return NextResponse.json({ 
        error: 'Missing required fields: mentorId, scheduledDateTime' 
      }, { status: 400 });
    }

    // Validate mentor exists and is a mentor
    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return NextResponse.json({ error: 'Invalid mentor' }, { status: 400 });
    }

    // Check if the scheduled time is in the future
    const bookingDate = new Date(scheduledDateTime);
    if (bookingDate <= new Date()) {
      return NextResponse.json({ 
        error: 'Booking time must be in the future' 
      }, { status: 400 });
    }

    // Create the booking
    const booking = new Booking({
      menteeId: mentee._id,
      mentorId,
      scheduledDateTime: bookingDate,
      description: description || '',
      duration,
      status: 'pending'
    });

    await booking.save();

    // Send email notification to mentor
    const emailService = new EmailService();
    await emailService.sendBookingRequestEmail(mentor, mentee, booking, booking._id.toString());

    return NextResponse.json({ 
      message: 'Booking request sent successfully',
      booking: {
        _id: booking._id,
        mentorId: booking.mentorId,
        scheduledDateTime: booking.scheduledDateTime,
        status: booking.status,
        description: booking.description,
        duration: booking.duration
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
