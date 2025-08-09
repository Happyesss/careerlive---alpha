'use client';

import { useState, useEffect, useRef } from 'react';
import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  user: {
    id: string;
    name: string;
    image?: string;
  };
  text: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'system';
}

interface InCallChatPanelProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const InCallChatPanel = ({ isExpanded: externalIsExpanded, onToggle, onUnreadCountChange }: InCallChatPanelProps = {}) => {
  const call = useCall();
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Common emojis for quick access
  const quickEmojis = ['👍', '👎', '😊', '😄', '❤️', '🎉', '👏', '🤔', '😮', '👋'];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isExpanded]);

  // Initialize chat and listen for events
  useEffect(() => {
    if (!call || !localParticipant) return;

    setMessages(prev => {
      if (prev.length > 0) return prev;
      
      const welcomeMessage: ChatMessage = {
        id: `system-welcome-${Date.now()}`,
        user: { id: 'system', name: 'System' },
        text: 'Chat is ready! Send messages during your call.',
        timestamp: new Date(),
        type: 'system'
      };
      
      return [welcomeMessage];
    });

    const handleParticipantJoined = (event: any) => {
      const participantName = event.participant.user.name || event.participant.user.id;
      const joinMessage: ChatMessage = {
        id: `system-join-${Date.now()}`,
        user: {
          id: 'system',
          name: 'System'
        },
        text: `${participantName} joined the call`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, joinMessage]);
      setUnreadCount(prev => prev + 1);
    };

    const handleParticipantLeft = (event: any) => {
      const participantName = event.participant.user.name || event.participant.user.id;
      const leftMessage: ChatMessage = {
        id: `system-left-${Date.now()}`,
        user: {
          id: 'system',
          name: 'System'
        },
        text: `${participantName} left the call`,
        timestamp: new Date(),
        type: 'system'
      };
      
      setMessages(prev => [...prev, leftMessage]);
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to participant events
    call.on('call.session_participant_joined', handleParticipantJoined);
    call.on('call.session_participant_left', handleParticipantLeft);

    return () => {
      call.off('call.session_participant_joined', handleParticipantJoined);
      call.off('call.session_participant_left', handleParticipantLeft);
    };
  }, [call?.id, localParticipant?.userId]); // More specific dependencies

  // Simplified and reliable message sending
  const sendMessage = async (messageText: string, messageType: 'text' | 'emoji' = 'text') => {
    if (!call || !localParticipant || !messageText.trim()) return;

    try {
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const timestamp = new Date();
      
      const chatMessage: ChatMessage = {
        id: messageId,
        user: {
          id: localParticipant.userId,
          name: localParticipant.name || localParticipant.userId,
          image: localParticipant.image
        },
        text: messageText.trim(),
        timestamp: timestamp,
        type: messageType
      };

      const eventPayload = {
        type: 'chat-message',
        messageId,
        senderId: localParticipant.userId,
        senderName: localParticipant.name || localParticipant.userId,
        text: messageText.trim(),
        messageType,
        timestamp: timestamp.toISOString()
      };

      await call.sendCustomEvent(eventPayload);
      setMessages(prev => [...prev, chatMessage]);
      setNewMessage('');
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  // Listen for incoming chat messages
  useEffect(() => {
    if (!call || !localParticipant) return;

    const handleCustomEvent = (event: any) => {
      let eventType = event.custom?.type || event.data?.type || event.type;
      let eventData = event.custom || event.data || event;
      
      if (event.type === 'custom' && eventData.type) {
        eventType = eventData.type;
      }
      
      if (!eventType && (eventData.senderId || eventData.messageId)) {
        eventType = 'chat-message';
      }
      
      if (eventType === 'chat-message' && eventData.senderId !== localParticipant.userId) {
        const incomingMessage: ChatMessage = {
          id: eventData.messageId || `msg-${Date.now()}-${Math.random()}`,
          user: {
            id: eventData.senderId,
            name: eventData.senderName || eventData.senderId,
            image: undefined
          },
          text: eventData.text,
          timestamp: new Date(eventData.timestamp),
          type: eventData.messageType || 'text'
        };
        
        setMessages(prev => {
          if (prev.some(m => m.id === incomingMessage.id)) return prev;
          return [...prev, incomingMessage];
        });
        
        setUnreadCount(prev => prev + 1);
      }
    };

    call.on('custom', handleCustomEvent);
    return () => call.off('custom', handleCustomEvent);
  }, [call, localParticipant]);

  // Reset unread count when chat is expanded
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  // Notify parent of unread count changes
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
    }
  };

  const handleEmojiClick = (emoji: string) => {
    sendMessage(emoji, 'emoji');
  };

  const toggleExpanded = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalIsExpanded(!internalIsExpanded);
    }
    if (!isExpanded) {
      setUnreadCount(0);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!call) return null; // Don't show anything if no call

  // Debug log to check if component is rendering
  console.log('InCallChatPanel render:', { 
    hasCall: !!call, 
    isExpanded, 
    participantCount: participants.length,
    messagesCount: messages.length 
  });

  return (
    <>
      {/* Chat Panel - Only show when expanded */}
      {isExpanded && (
        <div className="custom-chat-panel fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-80 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Chat</span>
              <span className="text-sm text-gray-500">({participants.length})</span>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                onClick={toggleExpanded}
                size="sm"
                className="p-2 flex-shrink-0 bg-blue-100 hover:bg-blue-200 text-blue-600"
                style={{ opacity: 1, visibility: 'visible' }}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Chat Content */}
          <>
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto max-h-60 min-h-[240px] space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No messages yet</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "group",
                      message.type === 'system' ? 'text-center' : 'flex space-x-2'
                    )}
                  >
                    {message.type === 'system' ? (
                      <div className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1 inline-block">
                        {message.text}
                      </div>
                    ) : (
                      <>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-white">
                              {message.user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {message.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                          <div className={cn(
                            "mt-1 text-sm",
                            message.type === 'emoji' ? 'text-2xl' : 'text-gray-700'
                          )}>
                            {message.text}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              {/* Quick Emojis - Show above input when picker is open */}
              {showEmojiPicker && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg border">
                  <div className="flex flex-wrap gap-1">
                    {quickEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        onClick={() => handleEmojiClick(emoji)}
                        variant="ghost"
                        size="sm"
                        className="p-1 h-8 w-8 text-lg hover:bg-gray-200"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  size="sm"
                  className={
                    `flex-shrink-0 p-2 ${showEmojiPicker ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-100 hover:bg-blue-200 text-blue-600'}`
                  }
                  style={{ opacity: 1, visibility: 'visible' }}
                >
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
                  maxLength={500}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newMessage.trim()}
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default InCallChatPanel;
