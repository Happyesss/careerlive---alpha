'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';
import { Call } from '@stream-io/video-react-sdk';

import { useGetCallById } from '@/hooks/useGetCallById';
import Alert from '@/components/Alert';
import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const { call, isCallLoading } = useGetCallById(id as string);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [createdCall, setCreatedCall] = useState<Call | null>(null);
  const [isCreatingCall, setIsCreatingCall] = useState(false);
  const client = useStreamVideoClient();

  // Function to create a call if it doesn't exist
  const createCallIfNeeded = async () => {
    if (!client || !user || !id || createdCall || call) return;
    
    setIsCreatingCall(true);
    try {
      // Create a new call with the meeting ID
      const newCall = client.call('default', id as string);
      
      // Check if there's a booking associated with this meeting
      let bookingData = null;
      try {
        const response = await fetch(`/api/bookings/by-meeting-link?meetingLink=${encodeURIComponent(`${window.location.origin}/meeting/${id}`)}`);
        if (response.ok) {
          const data = await response.json();
          bookingData = data.booking;
        }
      } catch (error) {
        console.log('No booking found for this meeting');
      }

      // Create the call with appropriate data
      await newCall.getOrCreate({
        data: {
          starts_at: bookingData?.scheduledDateTime || new Date().toISOString(),
          custom: {
            description: bookingData ? 
              `Meeting between ${bookingData.mentorId?.firstName} and ${bookingData.menteeId?.firstName}` : 
              'Video Meeting',
          },
          // Add members if booking data is available
          ...(bookingData && {
            members: [
              { user_id: bookingData.mentorId?.id || bookingData.mentorId?._id },
              { user_id: bookingData.menteeId?.id || bookingData.menteeId?._id },
            ].filter(member => member.user_id) // Filter out undefined members
          })
        },
      });
      
      setCreatedCall(newCall);
    } catch (error) {
      console.error('Error creating call:', error);
    } finally {
      setIsCreatingCall(false);
    }
  };

  // Create call if needed when component mounts and no call exists
  useEffect(() => {
    if (!isCallLoading && !call && !createdCall && !isCreatingCall) {
      createCallIfNeeded();
    }
  }, [isCallLoading, call, createdCall, isCreatingCall, client, user, id]);

  // Track that mentees joined this meeting via link for history display
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      if (!user?.id || user.role !== 'mentee') return;
      const meetingId = (id as string) || currentCall?.id;
      if (!meetingId) return;

      const key = `joinedViaLink:${user.id}`;
      const existing: string[] = JSON.parse(window.localStorage.getItem(key) || '[]');
      if (!existing.includes(meetingId)) {
        window.localStorage.setItem(key, JSON.stringify([...existing, meetingId]));
      }
    } catch (_) {
      // ignore
    }
  }, [user?.id, user?.role, id, isCallLoading]);

  if (loading || isCallLoading || isCreatingCall) return <Loader />;

  const currentCall = call || createdCall;

  if (!currentCall) return (
    <div className="text-center text-white p-8">
      <p className="text-3xl font-bold mb-4">Unable to create meeting</p>
      <p className="text-gray-400">Please try again or contact support if the problem persists.</p>
    </div>
  );

  // get more info about custom call type:  https://getstream.io/video/docs/react/guides/configuring-call-types/
  const notAllowed = currentCall.type === 'invited' && (!user || !currentCall.state.members.find((m) => m.user.id === user.id));

  if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={currentCall}>
        <StreamTheme>

        {!isSetupComplete ? (
          <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
        ) : (
          <MeetingRoom />
        )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
