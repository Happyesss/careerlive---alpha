import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/database';
import Booking from '@/models/Booking';
import User from '@/models/User';
import EmailService from '@/lib/emailService';
import crypto from 'crypto';

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

    // Update booking status to confirmed and generate meeting link
    booking.status = 'confirmed';
    
    // Generate a unique meeting ID and link
    // The actual Stream call will be created when users join the meeting
    const meetingId = crypto.randomUUID();
    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${meetingId}`;
    booking.meetingLink = meetingLink;
    
    await booking.save();

    // Send confirmation email to mentee with meeting link
    const emailService = new EmailService();
    await emailService.sendMeetingConfirmationEmail(
      booking.menteeId as any,
      booking.mentorId as any,
      booking,
      meetingLink
    );

    // Send confirmation notification to mentor
    await emailService.sendMentorConfirmationNotification(
      booking.mentorId as any,
      booking.menteeId as any,
      booking,
      meetingLink
    );

    // Return a user-friendly HTML response
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Booking Confirmed - CareerLive</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
            margin: 0; 
            padding: 40px 20px; 
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 20px; 
            padding: 50px 40px; 
            box-shadow: 0 20px 50px rgba(0,0,0,0.1);
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          .container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }
          .success-icon { 
            font-size: 80px; 
            margin-bottom: 25px; 
            animation: bounce 1s ease-in-out;
          }
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-10px); }
            60% { transform: translateY(-5px); }
          }
          h1 { 
            color: #10b981; 
            margin: 0 0 15px 0; 
            font-size: 36px; 
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .subtitle {
            color: #64748b; 
            font-size: 18px;
            margin-bottom: 35px;
            line-height: 1.5;
          }
          .booking-details { 
            background: linear-gradient(145deg, #f8fafc 0%, #ecfdf5 100%); 
            padding: 30px; 
            border-radius: 16px; 
            margin: 30px 0; 
            border-left: 5px solid #10b981;
            text-align: left;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .detail { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
            margin: 15px 0; 
            padding: 12px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .detail:last-child {
            border-bottom: none;
          }
          .detail strong {
            color: #374151;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .detail span {
            color: #1f2937;
            font-weight: 500;
          }
          .info-box {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: left;
          }
          .info-box h3 {
            color: #1e40af;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .info-box p {
            color: #1e40af;
            margin: 8px 0;
            line-height: 1.6;
          }
          .btn { 
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
            color: white !important; 
            padding: 16px 32px; 
            border-radius: 12px; 
            text-decoration: none; 
            display: inline-block; 
            margin: 25px 0;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
            border: none;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
            color: white !important;
          }
          .icon {
            font-size: 18px;
            margin-right: 8px;
            display: inline-block;
            width: 20px;
            height: 20px;
            text-align: center;
          }
          .emoji-icon {
            font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif;
            font-style: normal;
            font-weight: normal;
            text-rendering: optimizeLegibility;
          }
        </style>
      </head>
      <body>
        <div class="container">

          <h1>Time Slot Confirmed!</h1>
          <p class="subtitle">Thank you for confirming the mentoring session time slot.</p>
          <div class="booking-details">
            <div class="detail">
              <strong>Mentee:</strong>
              <span>${(booking.menteeId as any).firstName} ${(booking.menteeId as any).lastName}</span>
            </div>
            <div class="detail">
              <strong>Date & Time:</strong>
              <span>${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at ${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short' 
              })}</span>
            </div>
            <div class="detail">
              <strong>Duration:</strong>
              <span>${booking.duration} minutes</span>
            </div>
          </div>
          
          <div class="info-box">
            <h3>&#128231; Notifications Sent</h3>
            <p>The mentee has been notified via email about the confirmed time slot</p>
            <p>Meeting link has been automatically generated and shared</p>
            <p>Both parties can now access the session from their dashboard</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}" class="btn">
            Return to CareerLive Dashboard
          </a>
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
