/* eslint-disable camelcase */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import ScheduleCalendar from './ScheduleCalendar';
import BookingModal from './BookingModal';
import MentorScheduler from './MentorScheduler';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useAuth } from '@/providers/AuthProvider';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';
import { Calendar, X } from 'lucide-react';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = ({ selectedBooking, onClearBooking }: { selectedBooking?: any; onClearBooking?: () => void }) => {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 'isBookingMentor' | 'isMentorScheduling' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const client = useStreamVideoClient();
  const { user } = useAuth();
  const { toast } = useToast();

  // Open mentor scheduling modal when booking is selected
  React.useEffect(() => {
    if (selectedBooking && user?.role === 'mentor') {
      setMeetingState('isMentorScheduling');
    }
  }, [selectedBooking, user]);

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      toast({ title: 'Failed to create Meeting' });
    }
  };

  const handleScheduleMeeting = async (meetingData: { dateTime: Date; description: string }) => {
    setValues(prev => ({
      ...prev,
      dateTime: meetingData.dateTime,
      description: meetingData.description
    }));
    
    if (!client || !user) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      
      await call.getOrCreate({
        data: {
          starts_at: meetingData.dateTime.toISOString(),
          custom: {
            description: meetingData.description,
          },
        },
      });
      
      setCallDetail(call);
      toast({
        title: 'Meeting Scheduled Successfully',
        description: `Meeting scheduled for ${meetingData.dateTime.toLocaleDateString()} at ${meetingData.dateTime.toLocaleTimeString()}`,
      });
      setMeetingState(undefined);
    } catch (error) {
      toast({ title: 'Failed to schedule meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {user.role === "mentor" ?  <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState('isInstantMeeting')}
      /> : null}
     
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />

      {user.role === "mentee" ? (
        <HomeCard
          img="/icons/schedule.svg"
          title="Schedule Booking"
          description="Book a session with mentor"
          handleClick={() => setMeetingState('isBookingMentor')}
        />
      ) : null}

      {user.role === "mentor" ?  <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Schedule with mentees"
        handleClick={() => setMeetingState('isMentorScheduling')}
      /> : null}
     
      <HomeCard
        img="/icons/recordings.svg"
        title="Recording Quick Guide"
        description="Learn recording features"
        handleClick={() => router.push('/recordings')}
      />

      {/* Booking Modal for Mentees */}
      <BookingModal
        isOpen={meetingState === 'isBookingMentor'}
        onClose={() => setMeetingState(undefined)}
      />

      {/* Mentor Scheduling Modal */}
      {meetingState === 'isMentorScheduling' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-dark-1 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-dark-1 border-b border-dark-3 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-1" />
                <h2 className="text-xl font-semibold text-white">Schedule Meeting with Mentee</h2>
              </div>
              <button
                onClick={() => {
                  setMeetingState(undefined);
                  onClearBooking?.();
                }}
                className="text-sky-2 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <MentorScheduler 
                onClose={() => {
                  setMeetingState(undefined);
                  onClearBooking?.();
                }} 
                selectedBooking={selectedBooking}
              />
            </div>
          </div>
        </div>
      )}

      {!callDetail ? (
        <>
          {meetingState === 'isScheduleMeeting' && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <ScheduleCalendar
                onScheduleMeeting={handleScheduleMeeting}
                onClose={() => setMeetingState(undefined)}
              />
            </div>
          )}
        </>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Paste Meeting Link"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder="Meeting link"
          onChange={(e) => setValues({ ...values, link: e.target.value })}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </div>
  );
};

export default MeetingTypeList;
