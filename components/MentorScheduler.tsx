'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, Search, Send, Users, Video } from 'lucide-react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useGetCalls } from '@/hooks/useGetCalls';

interface Booking {
  _id: string;
  menteeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  description?: string;
  duration: number;
  createdAt: string;
}

interface User {
  _id: string;
  id: string; // Add id property for Stream consistency
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface MentorSchedulerProps {
  onClose?: () => void;
  selectedBooking?: any;
}

const MentorScheduler: React.FC<MentorSchedulerProps> = ({ onClose, selectedBooking: propSelectedBooking }) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [mentees, setMentees] = useState<User[]>([]);
  const [filteredMentees, setFilteredMentees] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentee, setSelectedMentee] = useState<User | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: 60,
    meetingLink: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScheduling, setIsScheduling] = useState(false);
  const [callDetail, setCallDetail] = useState<Call>();
  const { user } = useAuth();
  const { toast } = useToast();
  const client = useStreamVideoClient();
  const { refetchCalls } = useGetCalls();

  useEffect(() => {
    fetchPendingBookings();
    fetchMentees();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = mentees.filter(mentee => 
        `${mentee.firstName} ${mentee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredMentees(filtered);
    } else {
      setFilteredMentees(mentees);
    }
  }, [searchTerm, mentees]);

  // Handle prop selectedBooking from home page
  useEffect(() => {
    if (propSelectedBooking && mentees.length > 0) {
      handleBookingCardClick(propSelectedBooking);
    }
  }, [propSelectedBooking, mentees]);

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const pending = data.bookings?.filter((b: Booking) => b.status === 'pending') || [];
        setPendingBookings(pending);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMentees = async () => {
    try {
      const response = await fetch('/api/users/mentees', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMentees(data.mentees || []);
        setFilteredMentees(data.mentees || []);
      }
    } catch (error) {
      console.error('Error fetching mentees:', error);
    }
  };

  const handleBookingCardClick = (booking: Booking) => {
    setSelectedBooking(booking);
    // Add role and id properties to match User interface
    const menteeWithRole = { 
      ...booking.menteeId, 
      role: 'mentee',
      id: booking.menteeId._id // Map _id to id for Stream consistency
    };
    setSelectedMentee(menteeWithRole);
    setCallDetail(undefined);
    
    const bookingDate = new Date(booking.scheduledDateTime);
    setFormData({
      date: bookingDate.toISOString().split('T')[0],
      time: bookingDate.toTimeString().slice(0, 5),
      duration: booking.duration,
      meetingLink: ''
    });
    
    // Scroll to form
    document.getElementById('scheduler-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMenteeSelect = (mentee: User) => {
    setSelectedMentee(mentee);
    setSelectedBooking(null);
    setSearchTerm('');
    setCallDetail(undefined);
    
    // Clear form when selecting different mentee
    setFormData({
      date: '',
      time: '',
      duration: 60,
      meetingLink: ''
    });
  };

  const generateMeetingLink = async () => {
    if (!client || !user) {
      toast({
        title: "Error",
        description: "Stream client not available",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScheduling(true);
      
      // Create Stream call using the same pattern as MeetingTypeList
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      
      if (!call) {
        throw new Error('Failed to create call');
      }

      // Combine date and time to create the meeting datetime
      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);
      
      // Ensure we have both users
      if (!selectedMentee?.id && !selectedMentee?._id) {
        throw new Error('Mentee information is missing');
      }
      
      await call.getOrCreate({
        data: {
          starts_at: meetingDateTime.toISOString(),
          custom: {
            description: `Scheduled meeting with ${selectedMentee?.firstName} ${selectedMentee?.lastName}`,
          },
          members: [
            { user_id: user.id }, // Current mentor
            { user_id: selectedMentee.id || selectedMentee._id }, // Selected mentee
          ],
        },
      });

      // Store the call details and generate the meeting link
      setCallDetail(call);
      const meetingLink = `${window.location.origin}/meeting/${call.id}`;
      setFormData(prev => ({ ...prev, meetingLink }));
      
      toast({
        title: "Meeting Link Generated",
        description: "Stream meeting link created successfully",
      });
      
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast({
        title: "Error",
        description: "Failed to generate meeting link",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const handleScheduleMeeting = async () => {
    if (!selectedMentee || !formData.date || !formData.time) {
      toast({
        title: "Missing Information",
        description: "Please select mentee, date, and time",
        variant: "destructive",
      });
      return;
    }

    if (!formData.meetingLink) {
      toast({
        title: "Missing Meeting Link",
        description: "Please generate a meeting link",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      const scheduledDateTime = new Date(`${formData.date}T${formData.time}`);
      
      const response = await fetch('/api/mentor/schedule-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          menteeId: selectedMentee._id,
          scheduledDateTime: scheduledDateTime.toISOString(),
          duration: formData.duration,
          meetingLink: formData.meetingLink,
          bookingId: selectedBooking?._id || null
        })
      });

      if (response.ok) {
        toast({
          title: "Meeting Scheduled! 🎉",
          description: `Meeting link sent to ${selectedMentee.firstName}`,
        });
        
        // Reset form
        setSelectedMentee(null);
        setSelectedBooking(null);
        setCallDetail(undefined);
        setFormData({
          date: '',
          time: '',
          duration: 60,
          meetingLink: ''
        });
        
        // Refresh pending bookings and calls list
        fetchPendingBookings();
        refetchCalls(); // Refresh the calls list to show new meeting
        
        // Close modal if onClose is provided
        if (onClose) {
          setTimeout(() => onClose(), 1500); // Close after showing success message
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule meeting');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  if (user?.role !== 'mentor') {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-sky-2">This feature is only available for mentors.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Booking Request Cards */}
      {pendingBookings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">📋 Pending Requests (Click to Auto-Fill)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingBookings.map((booking) => (
              <Card 
                key={booking._id} 
                className={`bg-dark-3 border-dark-4 p-3 cursor-pointer transition-all hover:bg-dark-2 hover:border-blue-500 ${
                  selectedBooking?._id === booking._id ? 'border-blue-500 bg-dark-2' : ''
                }`}
                onClick={() => handleBookingCardClick(booking)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-blue-1 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {booking.menteeId.firstName[0]}{booking.menteeId.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {booking.menteeId.firstName} {booking.menteeId.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-1 text-xs text-sky-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(booking.scheduledDateTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(booking.scheduledDateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} ({booking.duration}min)</span>
                  </div>
                  {booking.description && (
                    <div className="flex items-start gap-1">
                      <MessageSquare className="h-3 w-3 mt-0.5" />
                      <span className="line-clamp-2">{booking.description}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Scheduler Form */}
      <Card id="scheduler-form" className="bg-dark-2 border-dark-3 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">🎯 Schedule Meeting</h3>
        
        {/* Mentee Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              {selectedMentee ? 'Selected Mentee:' : 'Search & Select Mentee:'}
            </label>
            
            {selectedMentee ? (
              <div className="flex items-center justify-between bg-dark-3 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-1 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {selectedMentee.firstName[0]}{selectedMentee.lastName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-white">{selectedMentee.firstName} {selectedMentee.lastName}</p>
                    <p className="text-sm text-sky-2">{selectedMentee.email}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedMentee(null)}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-2" />
                  <Input
                    placeholder="Search mentees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-dark-3 border-dark-4 text-white"
                  />
                </div>
                
                {searchTerm && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {filteredMentees.map((mentee) => (
                      <div
                        key={mentee._id}
                        className="flex items-center gap-3 p-2 bg-dark-3 rounded cursor-pointer hover:bg-dark-4"
                        onClick={() => handleMenteeSelect(mentee)}
                      >
                        <div className="w-6 h-6 bg-blue-1 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {mentee.firstName[0]}{mentee.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{mentee.firstName} {mentee.lastName}</p>
                          <p className="text-xs text-sky-2">{mentee.email}</p>
                        </div>
                      </div>
                    ))}
                    {filteredMentees.length === 0 && (
                      <p className="text-sm text-sky-2 p-2">No mentees found</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="bg-dark-3 border-dark-4 text-white"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Time</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="bg-dark-3 border-dark-4 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">Duration (minutes)</label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                className="bg-dark-3 border-dark-4 text-white"
                min="15"
                max="240"
                step="15"
              />
            </div>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Meeting Link</label>
            <div className="flex gap-2">
              <Input
                value={formData.meetingLink}
                onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                placeholder="Meeting link will be generated..."
                className="bg-dark-3 border-dark-4 text-white"
                readOnly
              />
              <Button 
                variant="outline" 
                onClick={generateMeetingLink}
                disabled={isScheduling || !formData.date || !formData.time || !selectedMentee}
                className="whitespace-nowrap"
              >
                <Video className="h-4 w-4 mr-1" />
                {isScheduling ? 'Generating...' : 'Generate Link'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleScheduleMeeting}
              disabled={isScheduling || !selectedMentee || !formData.date || !formData.time || !formData.meetingLink}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isScheduling ? 'Scheduling...' : 'Schedule & Send Link'}
            </Button>
            
            {(selectedMentee || selectedBooking) && (
              <Button 
                variant="outline"
                onClick={() => {
                  setSelectedMentee(null);
                  setSelectedBooking(null);
                  setFormData({ date: '', time: '', duration: 60, meetingLink: '' });
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MentorScheduler;
