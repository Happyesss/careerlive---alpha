import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bookingId = params.id;
    const booking = await Booking.findById(bookingId)
      .populate('menteeId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user is authorized to view this booking
    const isAuthorized = booking.menteeId._id.toString() === user._id.toString() || 
                        booking.mentorId._id.toString() === user._id.toString();

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const bookingId = params.id;
    const { status } = await request.json();

    const booking = await Booking.findById(bookingId)
      .populate('menteeId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Only mentors can update booking status
    if (booking.mentorId._id.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Only the mentor can update this booking' }, { status: 403 });
    }

    // Update booking status
    if (status) booking.status = status;

    await booking.save();

    return NextResponse.json({ 
      message: 'Booking updated successfully',
      booking 
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
