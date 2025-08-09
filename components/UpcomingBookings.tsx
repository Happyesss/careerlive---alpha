'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Video, User, ExternalLink } from 'lucide-react';

interface Booking {
  _id: string;
  menteeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  description?: string;
  duration: number;
  meetingLink?: string;
  createdAt: string;
}

const UpcomingBookings = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const fetchUpcomingBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter for confirmed bookings in the future with meeting links
        const now = new Date();
        const upcoming = data.bookings?.filter((booking: Booking) => {
          const bookingDate = new Date(booking.scheduledDateTime);
          return booking.status === 'confirmed' && 
                 bookingDate > now && 
                 booking.meetingLink;
        }) || [];
        setUpcomingBookings(upcoming);
      }
    } catch (error) {
      console.error('Error fetching upcoming bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  const isWithinJoinTime = (scheduledDateTime: string) => {
    const now = new Date();
    const meetingTime = new Date(scheduledDateTime);
    const timeDiff = meetingTime.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    
    // Allow joining 15 minutes before and up to meeting time
    return minutesDiff <= 15 && minutesDiff >= -5;
  };

  // Don't show for mentors or if no upcoming bookings
  if (user?.role !== 'mentee' || upcomingBookings.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-blue-1" />
          <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
        </div>
        <div className="bg-dark-3 rounded-lg p-4">
          <p className="text-sky-2 text-sm">Loading upcoming meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-1" />
        <h3 className="text-lg font-semibold text-white">Upcoming Meetings</h3>
        <span className="bg-blue-1 text-black text-xs px-2 py-1 rounded-full font-medium">
          {upcomingBookings.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {upcomingBookings.map((booking) => {
          const { date, time } = formatDateTime(booking.scheduledDateTime);
          const canJoin = isWithinJoinTime(booking.scheduledDateTime);
          const otherPerson = user?.role === 'mentee' ? booking.mentorId : booking.menteeId;
          
          return (
            <Card 
              key={booking._id} 
              className="bg-dark-2 border-dark-3 p-4 hover:border-blue-1 transition-colors"
            >
              <div className="flex sm:items-center items-start flex-col gap-6 sm:gap-0 sm:flex-row justify-between">
                <div className="flex items-center  gap-3">
                  <div className="w-10 h-10 bg-blue-1 rounded-full flex items-center justify-center text-white font-semibold">
                    {otherPerson.firstName[0]}{otherPerson.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4 text-sky-2" />
                      <p className="font-medium text-white">
                        {otherPerson.firstName} {otherPerson.lastName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-sky-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{time} ({booking.duration}min)</span>
                      </div>
                    </div>
                    {booking.description && (
                      <p className="text-xs text-sky-2 mt-1">{booking.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {canJoin ? (
                    <Button
                      onClick={() => handleJoinMeeting(booking.meetingLink!)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <Video className="h-4 w-4 mr-1" />
                      Join Now
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleJoinMeeting(booking.meetingLink!)}
                      variant="outline"
                      size="sm"
                      className="border-blue-1 text-blue-1 hover:bg-blue-1 hover:text-black"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Meeting Link
                    </Button>
                  )}
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-1/20 text-blue-1">
                    confirmed
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingBookings;
