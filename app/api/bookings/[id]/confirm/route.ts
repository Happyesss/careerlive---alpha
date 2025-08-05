import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';
import User from '@/models/User';
import EmailService from '@/lib/emailService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const bookingId = params.id;
    const booking = await Booking.findById(bookingId)
      .populate('menteeId', 'firstName lastName email')
      .populate('mentorId', 'firstName lastName email');

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Booking has already been processed' 
      }, { status: 400 });
    }

    // Update booking status to confirmed
    booking.status = 'confirmed';
    await booking.save();

    // Send confirmation email to mentee (no meeting link - mentor will handle this manually)
    const emailService = new EmailService();
    await emailService.sendBookingConfirmationEmail(
      booking.menteeId as any,
      booking.mentorId as any,
      booking
    );

    // Return a user-friendly HTML response
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmed - CareerLive</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .success-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #10b981; margin: 0; font-size: 28px; }
          p { color: #64748b; line-height: 1.6; }
          .booking-details { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail { display: flex; justify-content: space-between; margin: 10px 0; }
          .btn { background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="success-icon">✅</div>
            <h1>Time Slot Confirmed!</h1>
            <p>Thank you for confirming the mentoring session time slot.</p>
          </div>
          
          <div class="booking-details">
            <div class="detail">
              <strong>Mentee:</strong>
              <span>${(booking.menteeId as any).firstName} ${(booking.menteeId as any).lastName}</span>
            </div>
            <div class="detail">
              <strong>Date & Time:</strong>
              <span>${new Date(booking.scheduledDateTime).toLocaleString()}</span>
            </div>
            <div class="detail">
              <strong>Duration:</strong>
              <span>${booking.duration} minutes</span>
            </div>
          </div>
          
          <p>The mentee has been notified via email about the confirmed time slot.</p>
          <p><strong>Next Steps:</strong> Please create a meeting link and share it with the mentee through the platform or email.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="btn">Return to CareerLive</a>
          </div>
        </div>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Error confirming booking:', error);
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Error - CareerLive</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 40px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; text-align: center; }
          .error-icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #ef4444; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Error</h1>
          <p>There was an error processing your booking confirmation. Please try again or contact support.</p>
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none;">Return to CareerLive</a>
        </div>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}
