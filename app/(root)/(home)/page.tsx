'use client';
import React, { useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import PendingBookingCards from '@/components/PendingBookingCards';
import UpcomingBookings from '@/components/UpcomingBookings';
import PendingFeedbackHandler from '@/components/PendingFeedbackHandler';
import { Clock, Calendar, TrendingUp, Users, Bell, Video, Lightbulb, Monitor, MicOff } from 'lucide-react';
import { useGetCalls } from '@/hooks/useGetCalls';
import { useAuth } from '@/providers/AuthProvider';
import ApprovePopup from '@/components/ApprovePopup';

const Home = () => {
  const now = new Date();
  const { endedCalls, upcomingCalls, isLoading } = useGetCalls();
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [approveBooking, setApproveBooking] = useState(null);
  const [fetchPendingRequests, setFetchPendingRequests] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleBookingClick = (booking: any) => {
    setApproveBooking(booking);
    setIsPopupOpen(true);
    // This will be handled by MeetingTypeList to open the scheduling modal
  };

  
  const fetchPendingBookings = async () => {
         setFetchPendingRequests(!fetchPendingRequests);
  }

  const onClose = () => {
    setApproveBooking(null);
    setIsPopupOpen(false);
  };  


  const handleClearBooking = () => {
    setSelectedBooking(null);
  };

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = (new Intl.DateTimeFormat('en-US', { dateStyle: 'full' })).format(now);

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

  const totalAttended = endedCalls?.length || 0;

  return (
    <div className="min-h-screen bg-dark-2">
      <PendingFeedbackHandler />
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome back{user ? `, ${user.firstName}` : ''}! ROLE : {user ? user.role : 'null'}
              </h1>
              <p className="text-sky-2">Ready to connect with your team?</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 hover:border-blue-1/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-2 text-sm mb-1">Current Time</p>
                <h3 className="text-2xl font-bold text-white">{time}</h3>
                <p className="text-sky-2 text-sm">{date}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 hover:border-green-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-2 text-sm mb-1">Today's Meetings</p>
                <h3 className="text-2xl font-bold text-white">{isLoading ? '...' : todaysMeetings.length}</h3>
                <p className="text-green-500 text-sm">scheduled</p>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-2 text-sm mb-1">This Week</p>
                <h3 className="text-2xl font-bold text-white">{isLoading ? '...' : thisWeekMeetings.length}</h3>
                <p className="text-purple-500 text-sm">meetings</p>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3 hover:border-orange-500/30 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sky-2 text-sm mb-1">Meetings Attended</p>
                <h3 className="text-2xl font-bold text-white">{isLoading ? '...' : totalAttended}</h3>
                <p className="text-orange-500 text-sm">completed</p>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-lg">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
            <div className="flex items-center gap-2 text-sky-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">All systems operational</span>
            </div>
          </div>
          <MeetingTypeList 
            selectedBooking={selectedBooking} 
            onClearBooking={handleClearBooking}
          />
        </div>

        {/* Upcoming Bookings for Mentees */}
        <UpcomingBookings />

        {/* Pending Booking Requests */}
        {user?.role === 'mentor' && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Pending Booking Requests</h2>
              <div className="flex items-center gap-2 text-sky-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">Click to schedule</span>
              </div>
            </div>
            <PendingBookingCards fetchPendingRequests={fetchPendingRequests}  onBookingClick={handleBookingClick} />
            {isPopupOpen && approveBooking ? 
              <ApprovePopup data={approveBooking} fetchPendingBookings={fetchPendingBookings}  onClose={onClose}/> : null}
          </div>
        )}

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Meetings */}
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Meetings</h3>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 rounded-lg bg-dark-2">
                    <div className="h-4 bg-dark-3 rounded mb-2"></div>
                    <div className="h-3 bg-dark-3 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Recent ended calls */}
                {endedCalls?.length == 0 ? (<div className='lg:h-[25vh] w-full  flex items-center justify-center'><p className='text-white'>No recent calls found</p></div>) : ( endedCalls?.slice(0, 4).map((call, index) => {
                  const meetingDate = call.state.startsAt ? new Date(call.state.startsAt) : new Date();
                  const timeStr = meetingDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-2 hover:bg-dark-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {call.state.custom?.description || `Meeting ${index + 1}`}
                          </p>
                          <p className="text-xs text-sky-2">
                            {timeStr} • {call.state.members.length} participants
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                        completed
                      </span>
                    </div>
                  );
                }))}
               
                
                {/* Show fewer upcoming calls to make room for more ended calls */}
                {upcomingCalls?.slice(0, 0).map((call, index) => {
                  const meetingDate = call.state.startsAt ? new Date(call.state.startsAt) : new Date();
                  const timeStr = meetingDate.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                  
                  return (
                    <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-2 hover:bg-dark-3 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-1"></div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {call.state.custom?.description || `Upcoming Meeting ${index + 1}`}
                          </p>
                          <p className="text-xs text-sky-2">
                            {timeStr} • {call.state.members.length} participants
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-1/20 text-blue-1">
                        upcoming
                      </span>
                    </div>
                  );
                })}
                
                {/* Show message if no meetings */}
                {(!endedCalls || endedCalls.length === 0) && (!upcomingCalls || upcomingCalls.length === 0) && (
                  <div className="text-center py-6">
                    <p className="text-sky-2 text-sm">No meetings found</p>
                    <p className="text-sky-2 text-xs mt-1">Start your first meeting!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Tips */}
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <h3 className="text-xl font-semibold text-white mb-4">Meeting Tips</h3>
            <div className="space-y-4">
              {[
                { tip: "Test your camera and microphone before important meetings", icon: <Video className="h-4 w-4 text-blue-1" /> },
                { tip: "Use a quiet, well-lit environment for better video quality", icon: <Lightbulb className="h-4 w-4 text-yellow-500" /> },
                { tip: "Share your screen for more engaging presentations", icon: <Monitor className="h-4 w-4 text-green-500" /> },
                { tip: "Mute yourself when not speaking to reduce background noise", icon: <MicOff className="h-4 w-4 text-red-500" /> },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-dark-2">
                  <div className="mt-1">{item.icon}</div>
                  <p className="text-sm text-sky-2 leading-relaxed">{item.tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
