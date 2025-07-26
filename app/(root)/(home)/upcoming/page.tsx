'use client';
import React from 'react';
import CallList from '@/components/CallList';
import { Calendar, Clock, Users } from 'lucide-react';
import { useGetCalls } from '@/hooks/useGetCalls';

const UpcomingPage = () => {
  const { upcomingCalls, isLoading } = useGetCalls();

  // Get today's meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysMeetings = upcomingCalls?.filter(({ state: { startsAt } }) => {
    if (!startsAt) return false;
    const meetingDate = new Date(startsAt);
    return meetingDate >= today && meetingDate < tomorrow;
  }) || [];

  // Get this week's meetings
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7); // End of week

  const thisWeekMeetings = upcomingCalls?.filter(({ state: { startsAt } }) => {
    if (!startsAt) return false;
    const meetingDate = new Date(startsAt);
    return meetingDate >= startOfWeek && meetingDate < endOfWeek;
  }) || [];

  // Get next meeting
  const nextMeeting = upcomingCalls?.sort((a, b) => {
    const dateA = a.state.startsAt ? new Date(a.state.startsAt).getTime() : 0;
    const dateB = b.state.startsAt ? new Date(b.state.startsAt).getTime() : 0;
    return dateA - dateB;
  })[0];

  // Calculate time until next meeting
  const getTimeUntilNextMeeting = () => {
    if (!nextMeeting?.state.startsAt) return 'No upcoming meetings';
    
    const nextMeetingTime = new Date(nextMeeting.state.startsAt);
    const currentTime = new Date();
    const diffMs = nextMeetingTime.getTime() - currentTime.getTime();
    
    if (diffMs <= 0) return 'Meeting started';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      return `In ${days} day${days > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `In ${diffHours}h ${diffMinutes}m`;
    } else {
      return `In ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };
  return (
    <div className="min-h-screen bg-dark-2">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-1/10 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-1" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upcoming Meetings</h1>
              <p className="text-sky-2">Stay prepared for your scheduled meetings</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-white" />
              <div>
                <p className="text-sky-2 text-sm">Next Meeting</p>
                <p className="text-white font-semibold">{isLoading ? '...' : getTimeUntilNextMeeting()}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <div>
                <p className="text-sky-2 text-sm">Today's Meetings</p>
                <p className="text-white font-semibold">{isLoading ? '...' : `${todaysMeetings.length} scheduled`}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-white" />
              <div>
                <p className="text-sky-2 text-sm">This Week</p>
                <p className="text-white font-semibold">{isLoading ? '...' : `${thisWeekMeetings.length} meetings`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
          <CallList type="upcoming" />
        </div>
      </div>
    </div>
  );
};

export default UpcomingPage;
