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
                    Confirm Time Slot
                </a>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/api/bookings/${bookingId}/decline" class="btn btn-decline">
                    Decline Request
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
                    <li>Your meeting will be reflected in upcoming events</li>
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
    <title>Booking Confirmed - CareerLive</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            line-height: 1.6;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700; 
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 15px 0 0 0; 
            opacity: 0.95; 
            font-size: 16px;
        }
        .content { 
            padding: 45px 35px; 
        }
        .success-badge {
            background: #ecfdf5;
            color: #047857;
            padding: 12px 24px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 25px;
            border: 1px solid #d1fae5;
        }
        .meeting-details { 
            background: linear-gradient(145deg, #f8fafc 0%, #ecfdf5 100%);
            border-radius: 16px; 
            padding: 30px; 
            margin: 25px 0; 
            border-left: 5px solid #10b981;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .detail-grid {
            display: grid;
            gap: 15px;
        }
        .detail-item { 
            display: flex; 
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
            text-align: center;
        }
        .detail-label { 
            font-weight: 600; 
            color: #374151;
            margin-right: 15px;
            min-width: 120px;
        }
        .detail-value { 
            color: #1f2937;
            font-weight: 500;
        }
        .meeting-link-section {
            background: linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
            border: 1px solid #93c5fd;
        }
        .meeting-btn { 
            background: #ffffff !important; 
            color: #3b82f6 !important; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 10px; 
            font-weight: 700;
            font-size: 16px;
            display: inline-block; 
            margin: 15px 0;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.15);
            transition: all 0.3s ease;
            border: 2px solid #3b82f6 !important;
        }
        .meeting-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.25);
            color: #1d4ed8 !important;
            border-color: #1d4ed8 !important;
            background: #f8fafc !important;
        }
        .info-section {
            background: #fef9e7;
            border-left: 4px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .info-section h4 {
            color: #92400e;
            margin: 0 0 15px 0;
            font-size: 16px;
            font-weight: 600;
        }
        .info-list {
            color: #92400e;
            margin: 0;
            padding-left: 20px;
        }
        .info-list li {
            margin-bottom: 8px;
        }
        .footer { 
            background-color: #1f2937; 
            color: #9ca3af; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px;
        }
        .footer a { 
            color: #3b82f6; 
            text-decoration: none;
            font-weight: 500;
        }
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }
        .highlight-text {
            color: #059669;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Session Confirmed</h1>
            <p>Your mentoring session has been scheduled successfully</p>
        </div>
        
        <div class="content">
            <div class="success-badge">
                🎉 Booking Confirmed
            </div>
            
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 25px;">
                Great news! <span class="highlight-text">${mentor.firstName} ${mentor.lastName}</span> has confirmed your mentoring session. Your meeting is now scheduled and ready to go.
            </p>
            
            <div class="meeting-details">
                <h3 style="margin: 0 0 20px 0; color: #047857; font-size: 20px;">📋 Session Details</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-icon">👨‍🏫</span>
                        <span class="detail-label">Mentor:</span>
                        <span class="detail-value">${mentor.firstName} ${mentor.lastName}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📧</span>
                        <span class="detail-label">Contact:</span>
                        <span class="detail-value">${mentor.email}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">📅</span>
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">⏰</span>
                        <span class="detail-label">Time:</span>
                        <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            timeZoneName: 'short'
                        })}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">⏱️</span>
                        <span class="detail-label">Duration:</span>
                        <span class="detail-value">${booking.duration} minutes</span>
                    </div>
                </div>
            </div>

            <div class="meeting-link-section">
                <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">Join Your Session</h3>
                <p style="margin: 0 0 20px 0; color: #1e40af;">Click the button below when it's time for your meeting</p>
                <a href="${meetingLink}" class="meeting-btn">
                    Join Video Meeting
                </a>
                <p style="margin: 15px 0 0 0; color: #1e40af; font-size: 14px;">
                    Meeting Link: <code style="background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px; font-size: 12px;">${meetingLink}</code>
                </p>
            </div>

            <div class="divider"></div>

            <div class="info-section">
                <h4>📝 Pre-Meeting Preparation</h4>
                <ul class="info-list">
                    <li>Test your camera and microphone beforehand</li>
                    <li>Prepare specific questions or topics you'd like to discuss</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Find a quiet, well-lit space for the session</li>
                    <li>Add this meeting to your personal calendar</li>
                </ul>
            </div>

            <div style="background: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h4 style="color: #047857; margin: 0 0 15px 0; font-size: 16px;">📱 Meeting Access Options</h4>
                <ul style="color: #047857; margin: 0; padding-left: 20px;">
                    <li>Click the meeting link above to join directly</li>
                    <li>Visit your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/upcoming" style="color: #047857; text-decoration: underline; font-weight: 600;">CareerLive Dashboard</a> to access all your meetings</li>
                    <li>Join button will be available 15 minutes before the scheduled time</li>
                    <li>Meeting link is also saved in your account for future reference</li>
                </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                We're excited for your mentoring session! If you have any questions or need to reschedule, please contact your mentor directly or reach out to our support team.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0; font-weight: 600;">© 2024 CareerLive - Professional Mentoring Platform</p>
            <p style="margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit Dashboard</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Get Support</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/upcoming">Upcoming Meetings</a>
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

const MENTOR_CONFIRMATION_NOTIFICATION_TEMPLATE = (mentee: IUser, booking: IBooking, meetingLink: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Session Confirmed - CareerLive</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 0; 
            background-color: #f8fafc; 
            line-height: 1.6;
        }
        .container { 
            max-width: 650px; 
            margin: 0 auto; 
            background-color: #ffffff; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white; 
            padding: 40px 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 32px; 
            font-weight: 700; 
            letter-spacing: -0.5px;
        }
        .content { 
            padding: 45px 35px; 
        }
        .success-badge {
            background: #ecfdf5;
            color: #047857;
            padding: 12px 24px;
            border-radius: 50px;
            display: inline-block;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 25px;
            border: 1px solid #d1fae5;
        }
        .session-details { 
            background: linear-gradient(145deg, #f8fafc 0%, #ecfdf5 100%);
            border-radius: 16px; 
            padding: 30px; 
            margin: 25px 0; 
            border-left: 5px solid #10b981;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .detail-item { 
            display: flex; 
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-item:last-child {
            border-bottom: none;
        }
        .detail-icon {
            font-size: 20px;
            margin-right: 15px;
            width: 30px;
            text-align: center;
        }
        .detail-label { 
            font-weight: 600; 
            color: #374151;
            margin-right: 15px;
            min-width: 120px;
        }
        .detail-value { 
            color: #1f2937;
            font-weight: 500;
        }
        .info-section {
            background: #dbeafe;
            border-left: 4px solid #3b82f6;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
        }
        .footer { 
            background-color: #1f2937; 
            color: #9ca3af; 
            padding: 30px; 
            text-align: center; 
            font-size: 14px;
        }
        .footer a { 
            color: #3b82f6; 
            text-decoration: none;
            font-weight: 500;
        }
        .highlight-text {
            color: #059669;
            font-weight: 600;
        }
        .btn {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            display: inline-block;
            font-weight: 600;
            margin: 15px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Session Confirmed</h1>
            <p style="margin: 15px 0 0 0; opacity: 0.95; font-size: 16px;">You have successfully confirmed a mentoring session</p>
        </div>
        
        <div class="content">
            <div class="success-badge">
                🎉 Confirmation Successful
            </div>
            
            <p style="font-size: 18px; color: #1f2937; margin-bottom: 25px;">
                Thank you for confirming your mentoring session with <span class="highlight-text">${mentee.firstName} ${mentee.lastName}</span>. 
                The meeting link has been automatically generated and sent to your mentee.
            </p>
            
            <div class="session-details">
                <h3 style="margin: 0 0 20px 0; color: #047857; font-size: 20px;">📋 Session Summary</h3>
                <div class="detail-item">
                    <span class="detail-icon">👤</span>
                    <span class="detail-label">Mentee:</span>
                    <span class="detail-value">${mentee.firstName} ${mentee.lastName}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📧</span>
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${mentee.email}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">📅</span>
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">⏰</span>
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        timeZoneName: 'short'
                    })}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">⏱️</span>
                    <span class="detail-label">Duration:</span>
                    <span class="detail-value">${booking.duration} minutes</span>
                </div>
                <div class="detail-item">
                    <span class="detail-icon">🔗</span>
                    <span class="detail-label">Meeting Link:</span>
                    <span class="detail-value" style="font-size: 12px; word-break: break-all;">${meetingLink}</span>
                </div>
            </div>

            <div class="info-section">
                <h4 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📝 What happens next:</h4>
                <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                    <li>Your mentee has been notified via email with the meeting link</li>
                    <li>The session is now visible in your CareerLive dashboard</li>
                    <li>You can access the meeting link 15 minutes before the scheduled time</li>
                    <li>Prepare any materials or questions you'd like to discuss</li>
                </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/upcoming" class="btn">
                    View Dashboard
                </a>
                <a href="${meetingLink}" class="btn" style="margin-left: 10px;">
                    Meeting Link
                </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                Thank you for being part of the CareerLive mentoring community. Your guidance makes a real difference in someone's career journey.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0 0 10px 0; font-weight: 600;">© 2024 CareerLive - Professional Mentoring Platform</p>
            <p style="margin: 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}">Visit Dashboard</a> |
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/support">Get Support</a>
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

  async sendMentorConfirmationNotification(mentor: IUser, mentee: IUser, booking: IBooking, meetingLink: string) {
    try {
      const mailOptions = {
        from: `"CareerLive" <${process.env.GMAIL_USER}>`,
        to: mentor.email,
        subject: `✅ Session Confirmed - ${mentee.firstName} ${mentee.lastName}`,
        html: MENTOR_CONFIRMATION_NOTIFICATION_TEMPLATE(mentee, booking, meetingLink),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Mentor confirmation notification sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending mentor confirmation notification:', error);
      return { success: false, error };
    }
  }
}

export default EmailService;
