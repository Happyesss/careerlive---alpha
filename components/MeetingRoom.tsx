'use client';
import { useState } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Video, Square, Mic, MicOff, Camera, CameraOff, Monitor, MonitorOff, MessageSquare } from 'lucide-react';
import { useLocalRecording } from '@/hooks/useLocalRecording';
import RecordingDownloadModal from './RecordingDownloadModal';
import InCallChatPanel from './InCallChatPanel';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Clear unread count when chat is opened
  const handleChatToggle = () => {
    const newShowChat = !showChat;
    setShowChat(newShowChat);
    if (newShowChat) {
      setChatUnreadCount(0);
    }
  };
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  
  const {
    isRecording,
    showDownloadModal,
    startRecording,
    stopRecording,
    downloadRecording,
    discardRecording
  } = useLocalRecording();

  // State for custom controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  // Custom control functions
  const toggleMicrophone = async () => {
    if (!call) return;
    if (isMicOn) {
      await call.microphone.disable();
    } else {
      await call.microphone.enable();
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = async () => {
    if (!call) return;
    if (isCameraOn) {
      await call.camera.disable();
    } else {
      await call.camera.enable();
    }
    setIsCameraOn(!isCameraOn);
  };

  const toggleScreenShare = async () => {
    if (!call) return;
    if (isScreenSharing) {
      await call.screenShare.disable();
    } else {
      await call.screenShare.enable();
    }
    setIsScreenSharing(!isScreenSharing);
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-visible pt-2 md:pt-4 text-white">
      <div className="relative flex size-full items-center justify-center overflow-visible">
        <div className="flex size-full max-w-[1000px] items-center px-2 md:px-0">
          <CallLayout />
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-0 md:ml-2 w-full md:w-auto', {
            'block fixed md:relative inset-0 md:inset-auto z-50 md:z-auto bg-black md:bg-transparent md:show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-1 sm:gap-2 md:gap-5 p-2 md:p-4 bg-gradient-to-t from-black/70 to-transparent overflow-visible meeting-controls">
        {/* Microphone Control */}
        <button
          onClick={toggleMicrophone}
          className={`cursor-pointer rounded-lg px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 transition-colors flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0 ${
            isMicOn 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isMicOn ? (
            <>
              <Mic size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Mic</span>
            </>
          ) : (
            <>
              <MicOff size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Unmute</span>
            </>
          )}
        </button>

        {/* Camera Control */}
        <button
          onClick={toggleCamera}
          className={`cursor-pointer rounded-lg px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 transition-colors flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0 ${
            isCameraOn 
              ? 'bg-gray-800 hover:bg-gray-700 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isCameraOn ? (
            <>
              <Camera size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Camera</span>
            </>
          ) : (
            <>
              <CameraOff size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Turn On</span>
            </>
          )}
        </button>

        {/* Screen Share Control */}
        <button
          onClick={toggleScreenShare}
          className={`cursor-pointer rounded-lg px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 transition-colors flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0 ${
            isScreenSharing 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {isScreenSharing ? (
            <>
              <MonitorOff size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Stop Share</span>
            </>
          ) : (
            <>
              <Monitor size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 shadow-lg flex-shrink-0">
              <LayoutList size={14} className="sm:w-4 sm:h-4 md:w-5 md:h-5 text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="bg-gray-800 text-white border-gray-700">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                  className="hover:bg-gray-700"
                >
                  {item}
                </DropdownMenuItem>
                {index < 2 && <DropdownMenuSeparator className="bg-gray-700" />}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex-shrink-0">
          <CallStatsButton />
        </div>
        
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`recording-button cursor-pointer rounded-lg px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 transition-colors flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <Square size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Stop</span>
            </>
          ) : (
            <>
              <Video size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
              <span className="hidden sm:inline">Record</span>
            </>
          )}
        </button>
        
        <button 
          onClick={handleChatToggle}
          className={`cursor-pointer rounded-lg transition-colors px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0 relative ${
            showChat 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          <MessageSquare size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
          <span className="hidden sm:inline">Chat</span>
          {chatUnreadCount > 0 && !showChat && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] text-[10px]">
              {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
            </span>
          )}
        </button>
        
        <button 
          onClick={() => setShowParticipants((prev) => !prev)}
          className="cursor-pointer rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors px-1 py-2 sm:px-2 sm:py-2 md:px-4 md:py-2 flex items-center gap-1 md:gap-2 shadow-lg text-xs md:text-sm flex-shrink-0"
        >
          <Users size={12} className="sm:w-[14px] sm:h-[14px] md:w-[18px] md:h-[18px] text-white" />
          <span className="hidden sm:inline">Participants</span>
        </button>
        
        <div className="scale-50 sm:scale-75 md:scale-100 flex-shrink-0">
          <EndCallButton />
        </div>
      </div>
      
      <RecordingDownloadModal
        isOpen={showDownloadModal}
        onDownload={downloadRecording}
        onDiscard={discardRecording}
      />

      {/* In-Call Chat Panel */}
      <InCallChatPanel 
        isExpanded={showChat} 
        onToggle={handleChatToggle}
        onUnreadCountChange={setChatUnreadCount}
      />
    </section>
  );
};

export default MeetingRoom;
