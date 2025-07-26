'use client';

import { useState } from 'react';
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

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  const endCallForEveryone = async () => {
    await call.endCall();
    router.push('/');
    setIsDialogOpen(false);
  };
  
  const leaveCall = async () => {
    await call.leave();
    router.push('/');
    setIsDialogOpen(false);
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
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EndCallButton;
