'use client';

import { useState, useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { StreamChat } from 'stream-chat';
import { Chat, Channel, ChannelHeader, MessageList, MessageInput, Thread, Window } from 'stream-chat-react';
import { 
  MessageSquare, 
  X, 
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface StreamChatPanelProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const StreamChatPanel = ({ isMinimized = false, onToggleMinimize }: StreamChatPanelProps) => {
  const call = useCall();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Stream Chat client and channel
  useEffect(() => {
    if (!call || !localParticipant) return;

    const initializeChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // For now, we'll use a simplified approach without Stream Chat
        // This would require proper Stream Chat API keys and user tokens
        // For demo purposes, we'll fall back to the custom implementation
        
        console.log('Stream Chat initialization would happen here');
        
        // Instead, let's enhance our existing custom chat implementation
        setIsLoading(false);
        
      } catch (err) {
        console.error('Failed to initialize Stream Chat:', err);
        setError('Failed to initialize chat');
        setIsLoading(false);
      }
    };

    initializeChat();

    return () => {
      // Cleanup
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, [call, localParticipant]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setUnreadCount(0);
    }
  };

  if (isMinimized) {
    return (
      <Button
        onClick={onToggleMinimize}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 bg-white shadow-lg border-gray-200 hover:bg-gray-50"
      >
        <MessageSquare className="h-5 w-5 text-blue-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-80 h-96 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-900">Chat</span>
          <span className="text-sm text-gray-500">({participants.length} participants)</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            onClick={toggleExpanded}
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            onClick={onToggleMinimize}
            variant="ghost"
            size="sm"
            className="p-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Initializing chat...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">{error}</p>
                <p className="text-xs text-gray-500">Chat features are not available right now</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Stream Chat Integration</p>
                <p className="text-xs text-gray-500">
                  Requires Stream Chat API keys and user authentication.
                  <br />
                  For demo purposes, this shows the chat UI structure.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreamChatPanel;
