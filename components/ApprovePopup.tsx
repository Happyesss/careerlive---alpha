'use client';

import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar, Clock, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useToast } from '@/components/ui/use-toast';
import { Call } from '@stream-io/video-react-sdk';

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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

type ApprovePopupProps = {
  data: Booking;
    onClose: () => void; 
    fetchPendingBookings: () => void;

};



const ApprovePopup: React.FC<ApprovePopupProps> = ({ data,onClose,fetchPendingBookings }) => {
  const client = useStreamVideoClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedMentee, setSelectedMentee] = useState<User | null>(null);
  const [callDetail, setCallDetail] = useState<Call>();
  const [isScheduling, setIsScheduling] = useState(false);

  const dt = new Date(data.scheduledDateTime);
  const [formData, setFormData] = useState({
    date: dt.toISOString().split('T')[0],
    time: dt.toTimeString().slice(0, 5),
    duration: data.duration || 60,
    meetingLink: '',
  });

  // handleBookingCardClick → setSelectedMentee
  useEffect(() => {
    const run = async () => {

      const menteeWithRole: User = {

        ...data.menteeId,
        id: data.menteeId._id,
        role: 'mentee',


      };
      setSelectedMentee(menteeWithRole);
    };
    run();
  }, [data]);

  // When mentee is ready, generate meeting link
  useEffect(() => {
    if (!selectedMentee) return;

    const run = async () => {
      
        console.log(formData.meetingLink)
           await generateMeetingLink();

    }

    if(formData.meetingLink === ""){
          run();

    }

  }, [selectedMentee]);

  
console.log(formData)
  // Generate meeting link using Stream Video

  const generateMeetingLink = async () => {
    if (!client || !user) {
      toast({
        title: 'Error',
        description: 'Stream client or user not available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsScheduling(true);

      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create call');

      const meetingDateTime = new Date(`${formData.date}T${formData.time}`);

      if (!selectedMentee?.id && !selectedMentee?._id) {
        throw new Error('Mentee information is missing');
      }

      await call.getOrCreate({
        data: {
          starts_at: meetingDateTime.toISOString(),
          custom: {
            description: `Scheduled meeting with ${selectedMentee.firstName} ${selectedMentee.lastName}`,
          },
          members: [
            { user_id: user.id },
            { user_id: selectedMentee.id || selectedMentee._id },
          ],
        },
      });

      const meetingLink = `${window.location.origin}/meeting/${call.id}`;
      setFormData((prev) => ({ ...prev, meetingLink }));
      setCallDetail(call);

      toast({
        title: 'Meeting Link Generated',
        description: 'Stream meeting link created successfully',
      });
    } catch (error) {
      console.error('Error generating meeting link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate meeting link',
        variant: 'destructive',
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
          bookingId: data?._id || null
        })
      });

      if (response.ok) {
        toast({
          title: "Meeting Scheduled!",
          description: `Meeting link sent to ${selectedMentee.firstName}`,
        });
        
        fetchPendingBookings(); // Refresh pending bookings
        onClose(); // Close the popup

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


  const handleCancel = async () => {
    try {
      const response = await fetch(`/api/bookings/${data._id}/decline`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Booking Cancelled',
          description: `Booking with ${data.menteeId.firstName} ${data.menteeId.lastName} has been cancelled.`,
        });
        onClose();
        fetchPendingBookings(); // Refresh pending bookings

      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }
    } catch (error) {
      toast({
        title: 'Error',
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    }
  };

  return (
    <div className='fixed inset-0 w-full flex items-center justify-center bg-black bg-opacity-50 z-50'>
      <Card id='scheduler-form' className='bg-dark-2 border-dark-3 p-6'>
        <div className='flex w-[600px] items-center justify-between mb-4'>
          <h2 className='text-lg font-semibold text-white'>Approve Booking</h2>
            <img src="/icons/add-meeting.svg" onClick={onClose} className='text-white h-5 cursor-pointer rotate-45 w-5' alt="" />
        </div>

        <div className='mb-4'>
          <label className='block text-[16px] mb-2 font-medium text-white '>
            Booking ID
          </label>

          <h1 className='text-[14px] font-medium text-[#cfcfcf]'>{data._id}</h1>

          <div className='flex items-center mb-6 mt-6 gap-2 '>
            <div className='w-8 h-8 bg-blue-1 rounded-full flex items-center justify-center text-white text-xs font-semibold'>
              {data.menteeId.firstName[0]}
              {data.menteeId.lastName[0]}
            </div>
            <div>
              <p className='text-[16px]  font-medium text-white'>
                {data.menteeId.firstName} {data.menteeId.lastName}
              </p>
            </div>
          </div>

          <div className='space-y-1 my-6 text-xs text-sky-2'>
            <div className='flex my-3 items-center gap-1'>
              <Calendar className='h-5 w-5 mr-2' />
              <span className='text-[15px] font-medium'>{dt.toLocaleDateString()}</span>
            </div>
            <div className='flex items-center my-3 gap-1'>
              <Clock className='h-5 w-5 mr-2' />
              <span className='text-[15px] font-medium '>
                {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({data.duration}min)
              </span>
            </div>
            {data.description && (
              <div className='flex items-start gap-1'>
                <MessageSquare className='h-3 w-3 mt-0.5' />
                <span className='line-clamp-2'>{data.description}</span>
              </div>
            )}
          </div>

          <Input
            value={formData.meetingLink}
            onChange={(e) => setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))}
            placeholder='Meeting link will be generated...'
            className='bg-dark-3 border-dark-4 focus:border-dark-4 text-white'
            readOnly
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
                 <Button onClick={() => handleScheduleMeeting()} className='mt-4 w-full bg-green-600 hover:bg-green-700' disabled={isScheduling}>
                    {isScheduling ? 'Scheduling...' : 'Approve Booking'}
               </Button>

                  <Button onClick={() => handleCancel()} className='mt-4 w-full bg-red-600 hover:bg-red-700' disabled={isScheduling}>
                       {'Cancel Booking'}
                </Button>

        </div>

       
      </Card>
    </div>
  );
};

export default ApprovePopup;
