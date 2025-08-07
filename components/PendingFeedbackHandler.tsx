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
    // Check for pending feedback on component mount
    const checkPendingFeedback = () => {
      const pendingData = localStorage.getItem('pendingFeedback');
      if (pendingData) {
        try {
          const data = JSON.parse(pendingData) as PendingFeedbackData;
          // Check if the feedback is recent (within last 10 minutes)
          const isRecent = Date.now() - data.timestamp < 10 * 60 * 1000;
          
          if (isRecent) {
            setFeedbackData(data);
            setShowFeedback(true);
          }
          
          // Clear the pending feedback regardless of age
          localStorage.removeItem('pendingFeedback');
        } catch (error) {
          localStorage.removeItem('pendingFeedback');
        }
      }
    };

    // Check immediately when component mounts
    checkPendingFeedback();
    
    // Also check periodically in case user navigates back quickly
    const interval = setInterval(checkPendingFeedback, 2000);
    
    // Check when the page becomes visible (e.g., user returns from meeting)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkPendingFeedback();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
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
