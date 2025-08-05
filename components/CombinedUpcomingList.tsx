'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CallList from '@/components/CallList';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Users, Video, ExternalLink, User, CalendarDays, Rocket } from 'lucide-react';
import { useGetCalls } from '@/hooks/useGetCalls';

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

const CombinedUpcomingList = () => {
  const { upcomingCalls, isLoading: callsLoading } = useGetCalls();
  const { user } = useAuth();
  const router = useRouter();
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(true);

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
      setIsBookingsLoading(false);
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

  // Get Stream calls that don't have corresponding bookings
  const getStreamCallsWithoutBookings = () => {
    if (!upcomingCalls) return [];
    
    return upcomingCalls.filter((call) => {
      const streamMeetingLink = `${window.location.origin}/meeting/${call.id}`;
      // Check if any booking has this exact meeting link
      const hasCorrespondingBooking = upcomingBookings.some(
        (booking) => booking.meetingLink === streamMeetingLink
      );
      return !hasCorrespondingBooking;
    });
  };

  const independentStreamCalls = getStreamCallsWithoutBookings();

  // Get today's meetings from both sources (but avoid duplicates)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysStreamMeetings = independentStreamCalls?.filter(({ state: { startsAt } }) => {
    if (!startsAt) return false;
    const meetingDate = new Date(startsAt);
    return meetingDate >= today && meetingDate < tomorrow;
  }) || [];

  const todaysBookings = upcomingBookings.filter((booking) => {
    const bookingDate = new Date(booking.scheduledDateTime);
    return bookingDate >= today && bookingDate < tomorrow;
  });

  // Get this week's meetings
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week

  const thisWeekStreamMeetings = independentStreamCalls?.filter(({ state: { startsAt } }) => {
    if (!startsAt) return false;
    const meetingDate = new Date(startsAt);
    return meetingDate >= startOfWeek && meetingDate < endOfWeek;
  }) || [];

  const thisWeekBookings = upcomingBookings.filter((booking) => {
    const bookingDate = new Date(booking.scheduledDateTime);
    return bookingDate >= startOfWeek && bookingDate < endOfWeek;
  });

  const isLoading = callsLoading || isBookingsLoading;

  return (
    <div className="min-h-screen bg-dark-2">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upcoming Meetings</h1>
          <p className="text-sky-2">
            {user?.role === 'mentee' 
              ? 'Your scheduled mentoring sessions and meetings'
              : 'Your upcoming meetings and scheduled sessions'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-dark-3 border-dark-4 p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-1" />
              <div>
                <h3 className="text-sm font-medium text-sky-2">Today</h3>
                <p className="text-2xl font-bold text-white">
                  {todaysStreamMeetings.length + todaysBookings.length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-3 border-dark-4 p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-sm font-medium text-sky-2">This Week</h3>
                <p className="text-2xl font-bold text-white">
                  {thisWeekStreamMeetings.length + thisWeekBookings.length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-dark-3 border-dark-4 p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="text-sm font-medium text-sky-2">Total Upcoming</h3>
                <p className="text-2xl font-bold text-white">
                  {(independentStreamCalls?.length || 0) + upcomingBookings.length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Today's Meetings */}
        {(todaysStreamMeetings.length > 0 || todaysBookings.length > 0) && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="h-5 w-5 text-blue-1" />
              <h2 className="text-xl font-bold text-white">Today's Schedule</h2>
            </div>
            <div className="space-y-3">
              {/* Today's Stream Meetings */}
              {todaysStreamMeetings.map((call, index) => {
                const meetingDate = call.state.startsAt ? new Date(call.state.startsAt) : new Date();
                const timeStr = meetingDate.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                
                return (
                  <Card key={call.id} className="bg-dark-2 border-dark-3 p-4 hover:border-blue-1 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-1"></div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {call.state.custom?.description || `Meeting ${index + 1}`}
                          </p>
                          <p className="text-xs text-sky-2">
                            {timeStr} • {call.state.members.length} participants
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => router.push(`/meeting/${call.id}`)}
                          size="sm"
                          className="bg-blue-1 hover:bg-blue-1/80 text-black"
                        >
                          <Video className="h-4 w-4 mr-1" />
                          Join
                        </Button>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-1/20 text-blue-1">
                          upcoming
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
              
              {/* Today's Bookings */}
              {todaysBookings.map((booking) => {
                const { date, time } = formatDateTime(booking.scheduledDateTime);
                const canJoin = isWithinJoinTime(booking.scheduledDateTime);
                const otherPerson = user?.role === 'mentee' ? booking.mentorId : booking.menteeId;
                
                return (
                  <Card 
                    key={booking._id} 
                    className="bg-dark-2 border-dark-3 p-4 hover:border-blue-1 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
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
                          scheduled
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* All Upcoming Meetings */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-5 w-5 text-blue-1" />
            <h2 className="text-xl font-bold text-white">All Upcoming Meetings</h2>
          </div>
          
          {/* Stream Video Calls - only show calls without corresponding bookings */}
          {independentStreamCalls && independentStreamCalls.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-blue-1" />
                <h3 className="text-lg font-semibold text-white">Video Calls</h3>
              </div>
              <div className="space-y-3">
                {independentStreamCalls.map((call, index) => {
                  const meetingDate = call.state.startsAt ? new Date(call.state.startsAt) : new Date();
                  const timeStr = meetingDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  const dateStr = meetingDate.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  });
                  
                  return (
                    <Card key={call.id} className="bg-dark-2 border-dark-3 p-4 hover:border-blue-1 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-1"></div>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {call.state.custom?.description || `Meeting ${index + 1}`}
                            </p>
                            <p className="text-xs text-sky-2">
                              {dateStr} • {timeStr} • {call.state.members.length} participants
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => router.push(`/meeting/${call.id}`)}
                            size="sm"
                            className="bg-blue-1 hover:bg-blue-1/80 text-black"
                          >
                            <Video className="h-4 w-4 mr-1" />
                            Start
                          </Button>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-1/20 text-blue-1">
                            scheduled
                          </span>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Confirmed Bookings - exclude today's bookings if they're already shown above */}
          {upcomingBookings.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-blue-1" />
                <h3 className="text-lg font-semibold text-white">Scheduled Sessions</h3>
              </div>
              <div className="space-y-3">
                {upcomingBookings
                  .filter((booking) => {
                    // Exclude bookings that are already shown in today's schedule
                    const bookingDate = new Date(booking.scheduledDateTime);
                    return !(bookingDate >= today && bookingDate < tomorrow);
                  })
                  .map((booking) => {
                  const { date, time } = formatDateTime(booking.scheduledDateTime);
                  const canJoin = isWithinJoinTime(booking.scheduledDateTime);
                  const otherPerson = user?.role === 'mentee' ? booking.mentorId : booking.menteeId;
                  
                  return (
                    <Card 
                      key={booking._id} 
                      className="bg-dark-2 border-dark-3 p-4 hover:border-blue-1 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
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
          )}
        </div>

        {/* Empty State */}
        {!isLoading && (!independentStreamCalls || independentStreamCalls.length === 0) && 
         upcomingBookings.filter((booking) => {
           const bookingDate = new Date(booking.scheduledDateTime);
           return !(bookingDate >= today && bookingDate < tomorrow);
         }).length === 0 && 
         todaysStreamMeetings.length === 0 && todaysBookings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-sky-2 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No upcoming meetings</h3>
            <p className="text-sky-2">
              {user?.role === 'mentee' 
                ? 'Schedule your first mentoring session to get started!'
                : 'Create your first meeting or wait for booking requests.'
              }
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-1 mx-auto mb-4"></div>
            <p className="text-sky-2">Loading upcoming meetings...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CombinedUpcomingList;
