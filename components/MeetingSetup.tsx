'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useAuth } from '@/providers/AuthProvider';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { user } = useAuth();
  
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-dark-1 text-white p-3 sm:p-4 md:p-8">
      <div className="relative w-full max-w-4xl rounded-lg overflow-hidden bg-gray-900 shadow-2xl mb-3 sm:mb-4 md:mb-6">
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 bg-black/50 px-2 py-1 md:px-3 md:py-1 rounded text-xs md:text-sm font-medium">
          {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
        </div>
        <VideoPreview className="w-full h-[200px] xs:h-[250px] sm:h-[350px] md:h-[500px]" />
        <div className="absolute bottom-2 sm:bottom-3 md:bottom-6 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2 md:gap-4">
          <button
            onClick={() => {
              if (isMicEnabled) {
                call.microphone.disable();
                setIsMicEnabled(false);
              } else {
                call.microphone.enable();
                setIsMicEnabled(true);
              }
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
              !isMicEnabled 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <svg width="14" height="14" className="sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
              {!isMicEnabled ? (
                <>
                  <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                </>
              ) : (
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28C16.28 17.23 19 14.41 19 11h-1.7z"/>
              )}
            </svg>
          </button>
          <button
            onClick={() => {
              if (isCameraEnabled) {
                call.camera.disable();
                setIsCameraEnabled(false);
              } else {
                call.camera.enable();
                setIsCameraEnabled(true);
              }
            }}
            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-colors ${
              !isCameraEnabled 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <svg width="14" height="14" className="sm:w-4 sm:h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
              {!isCameraEnabled ? (
                <>
                  <path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5zM3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2zM15 11.73L9.27 6H15v5.73z"/>
                </>
              ) : (
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              )}
            </svg>
          </button>
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors">
            <div className="scale-50 sm:scale-75 md:scale-100">
              <DeviceSettings />
            </div>
          </div>
        </div>
      </div>
      
      <Button
        className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 sm:px-6 sm:py-2 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-semibold rounded-full shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-none md:w-auto"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join now
      </Button>
    </div>
  );
};

export default MeetingSetup;
