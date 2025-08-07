'use client';

import { useState, useEffect } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import { X, LogOut, PhoneOff } from 'lucide-react';
import { Button } from './ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from './ui/dialog';
import FeedbackModal from './FeedbackModal';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    userId: string;
    userName: string;
    userEmail: string;
  } | null>(null);

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant, useParticipants } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  const participants = useParticipants();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  // Get user info from localStorage or participant data
  useEffect(() => {
    if (localParticipant) {
      const storedUser = localStorage.getItem('user');
      const userData = storedUser ? JSON.parse(storedUser) : null;
      
      setUserInfo({
        userId: localParticipant.userId,
        userName: localParticipant.name || userData?.name || 'Unknown User',
        userEmail: userData?.email || 'unknown@example.com',
      });
    }
  }, [localParticipant]);

  const endCallForEveryone = async () => {
    try {
      await call.endCall();
      setIsDialogOpen(false);
      
      // Show feedback modal before redirecting
      if (userInfo) {
        setShowFeedbackModal(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      router.push('/');
    }
  };
  
  const leaveCall = async () => {
    try {
      await call.leave();
      setIsDialogOpen(false);
      
      // Show feedback modal before redirecting
      if (userInfo) {
        setShowFeedbackModal(true);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error leaving call:', error);
      router.push('/');
    }
  };

  const handleFeedbackComplete = () => {
    setShowFeedbackModal(false);
    router.push('/');
  };

  const handleFeedbackSkip = () => {
    setShowFeedbackModal(false);
    router.push('/');
  };

  // Get mentor and mentee IDs for feedback
  const getMentorMenteeIds = () => {
    const mentor = participants.find(p => p.userId !== localParticipant?.userId);
    const mentorId = mentor?.userId || '';
    const menteeId = localParticipant?.userId || '';
    
    return { mentorId, menteeId };
  };

  return (
    <>
      <Button 
        onClick={() => setIsDialogOpen(true)} 
        className="bg-red-500 hover:bg-red-600 transition-colors"
      >
        {isMeetingOwner ? (
          <span className="flex items-center gap-1">
            <PhoneOff size={18} />
            <span>End Call</span>
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <LogOut size={18} />
            <span>Leave Call</span>
          </span>
        )}
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">End Meeting</DialogTitle>
            <DialogDescription className="text-gray-300">
              Choose how you would like to exit this meeting
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            <Button
              onClick={leaveCall}
              className="flex flex-col items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 h-32"
            >
              <LogOut size={28} />
              <div className="text-center">
                <div className="font-medium">Leave Meeting</div>
                <div className="text-xs text-gray-300">The meeting will continue for others</div>
              </div>
            </Button>
            
            {isMeetingOwner && (
              <Button
                onClick={endCallForEveryone}
                className="flex flex-col items-center justify-center gap-2 bg-red-500 hover:bg-red-600 h-32"
              >
                <PhoneOff size={28} />
                <div className="text-center">
                  <div className="font-medium">End Meeting for All</div>
                  <div className="text-xs text-gray-300">All participants will be removed</div>
                </div>
              </Button>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-600 text-black hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      {showFeedbackModal && userInfo && (
        <FeedbackModal
          isOpen={showFeedbackModal}
          onClose={handleFeedbackSkip}
          meetingId={call.id}
          mentorId={getMentorMenteeIds().mentorId}
          menteeId={getMentorMenteeIds().menteeId}
          userName={userInfo.userName}
          userEmail={userInfo.userEmail}
        />
      )}
    </>
  );
};

export default EndCallButton;
