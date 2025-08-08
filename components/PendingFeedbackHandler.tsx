'use client';

import { useState, useEffect } from 'react';
import FeedbackModal from './FeedbackModal';

interface PendingFeedbackData {
  meetingId: string;
  mentorId: string;
  menteeId: string;
  userName: string;
  userEmail: string;
  timestamp: number;
}

const PendingFeedbackHandler = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<PendingFeedbackData | null>(null);

  useEffect(() => {
    // Check for pending feedback on component mount with a slight delay to ensure page refresh is complete
    const checkPendingFeedback = () => {
      const pendingData = localStorage.getItem('pendingFeedback');
      if (pendingData) {
        try {
          const data = JSON.parse(pendingData) as PendingFeedbackData;
          // Check if the feedback is recent (within last 10 minutes)
          const isRecent = Date.now() - data.timestamp < 10 * 60 * 1000;
          
          if (isRecent) {
            // Clear the pending feedback immediately to prevent duplicate shows
            localStorage.removeItem('pendingFeedback');
            
            // Show feedback with a small delay to ensure smooth transition after refresh
            setTimeout(() => {
              setFeedbackData(data);
              setShowFeedback(true);
            }, 1000); // 1 second delay for better UX
          } else {
            // Clear old feedback data
            localStorage.removeItem('pendingFeedback');
          }
        } catch (error) {
          localStorage.removeItem('pendingFeedback');
        }
      }
    };

    // Check immediately when component mounts
    checkPendingFeedback();
    
    // Check when the page becomes visible (e.g., user returns from meeting)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkPendingFeedback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    setFeedbackData(null);
  };

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    setFeedbackData(null);
  };

  if (!showFeedback || !feedbackData) {
    return null;
  }

  return (
    <FeedbackModal
      isOpen={showFeedback}
      onClose={handleFeedbackClose}
      onComplete={handleFeedbackComplete}
      meetingId={feedbackData.meetingId}
      mentorId={feedbackData.mentorId}
      menteeId={feedbackData.menteeId}
      userName={feedbackData.userName}
      userEmail={feedbackData.userEmail}
    />
  );
};

export default PendingFeedbackHandler;
