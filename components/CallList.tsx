'use client';

import { Call, CallRecording } from '@stream-io/video-react-sdk';

import Loader from './Loader';
import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

const CallList = ({ type, sortBy }: { type: 'ended' | 'upcoming' | 'recordings', sortBy?: 'newest' | 'oldest' | 'duration' }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case 'ended':
        return endedCalls;
      case 'recordings':
        return recordings;
      case 'upcoming':
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case 'ended':
        return 'No Previous Calls';
      case 'upcoming':
        return 'No Upcoming Calls';
      case 'recordings':
        return 'No Recordings';
      default:
        return '';
    }
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      setRecordings(recordings);
    };

    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls();
  const noCallsMessage = getNoCallsMessage();

  // Sort calls based on sortBy prop (only for ended calls)
  const sortedCalls = type === 'ended' && sortBy ? [...(calls || [])].sort((a, b) => {
    const callA = a as Call;
    const callB = b as Call;
    
    switch (sortBy) {
      case 'newest':
        const dateA = callA.state?.startsAt ? new Date(callA.state.startsAt).getTime() : 0;
        const dateB = callB.state?.startsAt ? new Date(callB.state.startsAt).getTime() : 0;
        return dateB - dateA; // Newest first
      case 'oldest':
        const dateAOld = callA.state?.startsAt ? new Date(callA.state.startsAt).getTime() : 0;
        const dateBOld = callB.state?.startsAt ? new Date(callB.state.startsAt).getTime() : 0;
        return dateAOld - dateBOld; // Oldest first
      case 'duration':
        // Sort by member count as proxy for meeting size/duration
        const membersA = callA.state?.members?.length || 0;
        const membersB = callB.state?.members?.length || 0;
        return membersB - membersA; // Most participants first
      default:
        return 0;
    }
  }) : calls;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {sortedCalls && sortedCalls.length > 0 ? (
        sortedCalls.map((meeting: Call | CallRecording) => {
          const call = meeting as Call;
          const now = new Date();
          let isOngoing = false;
           let viaLink = false;
          // Detect instant meeting: description is 'Instant Meeting' or missing
          const isInstantMeeting = (call?.state?.custom?.description || '').trim().toLowerCase() === 'instant meeting' || !call?.state?.custom?.description;

        
          // Only check for ongoing status in upcoming meetings
          if (type === 'upcoming' && call.state?.startsAt) {
            const startTime = new Date(call.state.startsAt);
            const endTime = new Date(call.state.startsAt);
            endTime.setMinutes(endTime.getMinutes() + 30); // Assuming 30min default duration
            
            // Check if meeting is currently ongoing (started but not ended)
            isOngoing = now >= startTime && now <= endTime;
          }
          
          // For ended meetings, they are completed (not ongoing)
          if (type === 'ended') {
            isOngoing = false; // Ended meetings are never ongoing
          }

          // Determine if the current user joined this call via a link
          try {
            if (typeof window !== 'undefined' && user?.role === 'mentee' && call?.id) {
              const key = `joinedViaLink:${user.id}`;
              const existing: string[] = JSON.parse(window.localStorage.getItem(key) || '[]');
              viaLink = existing.includes(call.id);
            }
          } catch (_) {
            // ignore
          }

         
          
          return (
            <div>
              <MeetingCard
              key={(meeting as Call).id}
              icon={
                type === 'ended'
                  ? '/icons/previous.svg'
                  : type === 'upcoming'
                    ? '/icons/upcoming.svg'
                    : '/icons/recordings.svg'
              }
              title={
                (meeting as Call).state?.custom?.description ||
                (meeting as CallRecording).filename?.substring(0, 20) ||
                'No Description'
              }
              date={
                (meeting as Call).state?.startsAt?.toString() ||
                (meeting as CallRecording).start_time?.toString() ||
                new Date().toISOString()
              }
              isPreviousMeeting={type === 'ended' && !isOngoing}
              isOngoing={isOngoing}
              link={
                type === 'recordings'
                  ? (meeting as CallRecording).url
                  : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
              }
              
              buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
              buttonText={type === 'recordings' ? 'Play' : (type === 'ended' && !isOngoing ? undefined : 'Start')}
              joinedViaLink={viaLink}
              call={type !== 'recordings' ? (meeting as Call) : undefined}
              hideParticipants={isInstantMeeting && type === 'ended'}
              handleClick={
                type === 'recordings'
                  ? () => router.push(`${(meeting as CallRecording).url}`)
                  : () => router.push(`/meeting/${(meeting as Call).id}`)
              }
              
              callId={call?.id}

              
            />
            </div>
            
          );
        })
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
