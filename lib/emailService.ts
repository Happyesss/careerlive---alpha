import nodemailer from 'nodemailer';
import { IUser } from '@/models/User';
import { IBooking } from '@/models/Booking';

// Email templates
const BOOKING_REQUEST_TEMPLATE = (mentee: IUser, booking: IBooking, bookingId: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Request - CareerLive</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .booking-card { background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #0ea5e9; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: 600; color: #475569; }
        .detail-value { color: #1e293b; }
        .action-buttons { text-align: center; margin: 30px 0; }
        .btn { display: inline-block; padding: 14px 28px; margin: 8px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; transition: all 0.3s ease; }
        .btn-confirm { background-color: #10b981; color: white; }
        .btn-confirm:hover { background-color: #059669; }
        .btn-decline { background-color: #ef4444; color: white; }
        .btn-decline:hover { background-color: #dc2626; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 14px; }
        .footer a { color: #0ea5e9; text-decoration: none; }
        .note { background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
        .note-text { color: #92400e; font-size: 14px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 New Mentoring Request</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">You have a new booking request from a mentee</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1e293b; margin-bottom: 20px;">Booking Details</h2>
            
            <div class="booking-card">
                <div class="detail-row">
                    <span class="detail-label">👤 Mentee Name:</span>
                    <span class="detail-value">${mentee.firstName} ${mentee.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📧 Email:</span>
                    <span class="detail-value">${mentee.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Requested Date:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏰ Requested Time:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ Duration:</span>
                    <span class="detail-value">${booking.duration} minutes</span>
                </div>
                ${booking.description ? `
                <div class="detail-row">
                    <span class="detail-label">💬 Message:</span>
                    <span class="detail-value">${booking.description}</span>
                </div>
                ` : ''}
            </div>

            <div class="action-buttons">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/${bookingId}/confirm" class="btn btn-confirm">
                    ✅ Confirm Time Slot
                </a>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/${bookingId}/decline" class="btn btn-decline">
                    ❌ Decline Request
                </a>
            </div>

            <div class="note">
                <p class="note-text">
                    <strong>📝 Important:</strong> By confirming, you're agreeing to the requested time slot. You'll need to create and share the meeting link with the mentee separately through the platform or email.
                </p>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Please confirm or decline this time slot request. The mentee will be notified of your decision via email.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2024 CareerLive. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CareerLive</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

const BOOKING_CONFIRMATION_TEMPLATE = (mentor: IUser, booking: IBooking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Time Slot Confirmed - CareerLive</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .booking-card { background-color: #ecfdf5; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid: #10b981; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
        .detail-label { font-weight: 600; color: #047857; }
        .detail-value { color: #1e293b; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 14px; }
        .footer a { color: #0ea5e9; text-decoration: none; }
        .note { background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .note-text { color: #1e40af; font-size: 14px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Time Slot Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mentor has confirmed the time slot</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 25px;">
                Great news! Your mentor <strong>${mentor.firstName} ${mentor.lastName}</strong> has confirmed your requested time slot.
            </p>
            
            <div class="booking-card">
                <div class="detail-row">
                    <span class="detail-label">👨‍🏫 Mentor:</span>
                    <span class="detail-value">${mentor.firstName} ${mentor.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📧 Mentor Email:</span>
                    <span class="detail-value">${mentor.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Confirmed Date:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏰ Confirmed Time:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ Duration:</span>
                    <span class="detail-value">${booking.duration} minutes</span>
                </div>
            </div>

            <div class="note">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📋 What happens next:</h4>
                <ul style="margin: 0; color: #1e40af; line-height: 1.6;">
                    <li>Your mentor will create the meeting link and share it with you</li>
                    <li>You may receive the meeting link via email or through the platform</li>
                    <li>Add this session to your calendar</li>
                    <li>Prepare any questions or topics you'd like to discuss</li>
                </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400e;">� Preparation Tips:</h4>
                <ul style="margin: 0; color: #92400e; line-height: 1.6;">
                    <li>Test your camera and microphone before the meeting</li>
                    <li>Prepare a list of questions or topics to discuss</li>
                    <li>Have a stable internet connection ready</li>
                    <li>Find a quiet, well-lit space for the session</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 CareerLive. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CareerLive</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

const MEETING_CONFIRMATION_TEMPLATE = (mentor: IUser, booking: IBooking, meetingLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meeting Scheduled - CareerLive</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .meeting-card { background-color: #ecfdf5; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid: #10b981; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #d1fae5; }
        .detail-label { font-weight: 600; color: #047857; }
        .detail-value { color: #1e293b; }
        .meeting-btn { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; margin: 20px 0; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 14px; }
        .footer a { color: #0ea5e9; text-decoration: none; }
        .note { background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0; }
        .note-text { color: #1e40af; font-size: 14px; margin: 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Meeting Scheduled!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your mentor has scheduled your session</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 25px;">
                Excellent! Your mentor <strong>${mentor.firstName} ${mentor.lastName}</strong> has scheduled your mentoring session and provided the meeting link.
            </p>
            
            <div class="meeting-card">
                <div class="detail-row">
                    <span class="detail-label">👨‍🏫 Mentor:</span>
                    <span class="detail-value">${mentor.firstName} ${mentor.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📧 Mentor Email:</span>
                    <span class="detail-value">${mentor.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Date:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏰ Time:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏱️ Duration:</span>
                    <span class="detail-value">${booking.duration} minutes</span>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${meetingLink}" class="meeting-btn">
                    🎥 Join Meeting
                </a>
                <p style="color: #64748b; font-size: 14px; margin-top: 10px;">
                    Click this link when it's time for your session
                </p>
            </div>

            <div class="note">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📋 Before the meeting:</h4>
                <ul style="margin: 0; color: #1e40af; line-height: 1.6;">
                    <li>Test your camera and microphone</li>
                    <li>Prepare questions or topics to discuss</li>
                    <li>Ensure stable internet connection</li>
                    <li>Find a quiet, well-lit space</li>
                    <li>Add this to your calendar</li>
                </ul>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 600;">
                    💡 <strong>Meeting Link:</strong> ${meetingLink}
                </p>
                <p style="margin: 10px 0 0 0; color: #92400e; font-size: 14px;">
                    Save this link! You can also find it in your CareerLive dashboard under "Upcoming Meetings".
                </p>
            </div>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">📱 Access Your Meeting:</h4>
                <ul style="margin: 0; color: #1e40af; line-height: 1.6;">
                    <li>Click the link above to join directly</li>
                    <li>Visit your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/upcoming" style="color: #1e40af; text-decoration: underline;">CareerLive Dashboard</a> to see upcoming meetings</li>
                    <li>You'll receive a join button 15 minutes before the meeting</li>
                </ul>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
                Looking forward to your mentoring session! If you have any questions, feel free to reach out to your mentor directly.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2024 CareerLive. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CareerLive</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

const BOOKING_DECLINED_TEMPLATE = (mentor: IUser, booking: IBooking) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Update - CareerLive</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .booking-card { background-color: #fef2f2; border-radius: 12px; padding: 25px; margin: 20px 0; border-left: 4px solid #ef4444; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #fecaca; }
        .detail-label { font-weight: 600; color: #991b1b; }
        .detail-value { color: #1e293b; }
        .footer { background-color: #1e293b; color: #94a3b8; padding: 25px; text-align: center; font-size: 14px; }
        .footer a { color: #0ea5e9; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Booking Update</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your booking request status has been updated</p>
        </div>
        
        <div class="content">
            <p style="font-size: 18px; color: #1e293b; margin-bottom: 25px;">
                We're sorry to inform you that your mentor <strong>${mentor.firstName} ${mentor.lastName}</strong> was unable to confirm your booking for the requested time.
            </p>
            
            <div class="booking-card">
                <div class="detail-row">
                    <span class="detail-label">👨‍🏫 Mentor:</span>
                    <span class="detail-value">${mentor.firstName} ${mentor.lastName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">📅 Requested Date:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">⏰ Requested Time:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</span>
                </div>
            </div>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1e40af;">💡 What you can do next:</h4>
                <ul style="margin: 0; color: #1e40af; line-height: 1.6;">
                    <li>Try booking a different time slot with the same mentor</li>
                    <li>Browse other available mentors in your field</li>
                    <li>Contact our support team if you need assistance</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}" style="background-color: #0ea5e9; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 600;">
                    🔍 Find Another Mentor
                </a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 CareerLive. All rights reserved.</p>
            <p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit CareerLive</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Support</a>
            </p>
        </div>
    </div>
</body>
</html>
`;

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendBookingRequestEmail(mentor: IUser, mentee: IUser, booking: IBooking, bookingId: string) {
    try {
      const mailOptions = {
        from: `"CareerLive" <${process.env.GMAIL_USER}>`,
        to: mentor.email,
        subject: `🚀 New Mentoring Request from ${mentee.firstName} ${mentee.lastName}`,
        html: BOOKING_REQUEST_TEMPLATE(mentee, booking, bookingId),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking request email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending booking request email:', error);
      return { success: false, error };
    }
  }

  async sendMeetingConfirmationEmail(mentee: IUser, mentor: IUser, booking: IBooking, meetingLink: string) {
    try {
      const mailOptions = {
        from: `"CareerLive" <${process.env.GMAIL_USER}>`,
        to: mentee.email,
        subject: `🎉 Meeting Scheduled with ${mentor.firstName} ${mentor.lastName} - Link Included!`,
        html: MEETING_CONFIRMATION_TEMPLATE(mentor, booking, meetingLink),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Meeting confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending meeting confirmation email:', error);
      return { success: false, error };
    }
  }

  async sendBookingConfirmationEmail(mentee: IUser, mentor: IUser, booking: IBooking) {
    try {
      const mailOptions = {
        from: `"CareerLive" <${process.env.GMAIL_USER}>`,
        to: mentee.email,
        subject: `🎉 Time Slot Confirmed with ${mentor.firstName} ${mentor.lastName}`,
        html: BOOKING_CONFIRMATION_TEMPLATE(mentor, booking),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending booking confirmation email:', error);
      return { success: false, error };
    }
  }

  async sendBookingDeclinedEmail(mentee: IUser, mentor: IUser, booking: IBooking) {
    try {
      const mailOptions = {
        from: `"CareerLive" <${process.env.GMAIL_USER}>`,
        to: mentee.email,
        subject: `📅 Booking Update from ${mentor.firstName} ${mentor.lastName}`,
        html: BOOKING_DECLINED_TEMPLATE(mentor, booking),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Booking declined email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending booking declined email:', error);
      return { success: false, error };
    }
  }
}

export default EmailService;
