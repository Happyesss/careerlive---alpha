'use client';

import { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { useToast } from './ui/use-toast';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void; // Called when feedback is submitted
  meetingId: string;
  mentorId: string;
  menteeId: string;
  bookingId?: string;
  userName: string;
  userEmail: string;
}

interface FeedbackData {
  sessionEffectiveness: number;
  mentorGuidance: number;
  platformExperience: number;
  whatWorkedWell: string;
  howToImprove: string;
  additionalComments: string;
}

const FeedbackModal = ({
  isOpen,
  onClose,
  onComplete,
  meetingId,
  mentorId,
  menteeId,
  bookingId,
  userName,
  userEmail,
}: FeedbackModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    sessionEffectiveness: 0,
    mentorGuidance: 0,
    platformExperience: 0,
    whatWorkedWell: '',
    howToImprove: '',
    additionalComments: '',
  });

  const handleRatingChange = (field: keyof Pick<FeedbackData, 'sessionEffectiveness' | 'mentorGuidance' | 'platformExperience'>, rating: number) => {
    setFeedback(prev => ({
      ...prev,
      [field]: rating,
    }));
  };

  const handleTextChange = (field: keyof Pick<FeedbackData, 'whatWorkedWell' | 'howToImprove' | 'additionalComments'>, value: string) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderStarRating = (
    label: string,
    value: number,
    onChange: (rating: number) => void,
    description: string
  ) => (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`p-1 transition-colors ${
              rating <= value
                ? 'text-yellow-400 hover:text-yellow-500'
                : 'text-gray-300 hover:text-gray-400 dark:text-gray-600 dark:hover:text-gray-500'
            }`}
          >
            <Star
              size={20}
              fill={rating <= value ? 'currentColor' : 'none'}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {value > 0 ? `${value}/10` : 'Rate this'}
        </span>
      </div>
    </div>
  );

  const isValid = () => {
    return (
      feedback.sessionEffectiveness > 0 &&
      feedback.mentorGuidance > 0 &&
      feedback.platformExperience > 0
    );
  };

  const handleSubmit = async () => {
    if (!isValid()) {
      toast({
        title: 'Missing Ratings',
        description: 'Please provide ratings for all categories.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        name: userName,
        email: userEmail,
        meetingId,
        mentorId,
        menteeId,
        bookingId,
        sessionEffectiveness: feedback.sessionEffectiveness,
        mentorGuidance: feedback.mentorGuidance,
        platformExperience: feedback.platformExperience,
        whatWorkedWell: feedback.whatWorkedWell,
        howToImprove: feedback.howToImprove,
        additionalComments: feedback.additionalComments,
      };

      console.log('Submitting feedback:', submitData);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const responseData = await response.json();
      console.log('Feedback response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit feedback');
      }

      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback! It helps us improve our platform.',
      });

      // Call onComplete if provided, otherwise call onClose
      if (onComplete) {
        onComplete();
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Submission Failed',
        description: error instanceof Error ? error.message : 'There was an error submitting your feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            📝 Session Feedback
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Help us improve your mentoring experience by sharing your feedback about this session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Rating Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Rate Your Experience
            </h3>
            
            {renderStarRating(
              'Session Effectiveness',
              feedback.sessionEffectiveness,
              (rating) => handleRatingChange('sessionEffectiveness', rating),
              'How effective was this mentoring session in achieving your goals?'
            )}

            {renderStarRating(
              'Mentor Guidance',
              feedback.mentorGuidance,
              (rating) => handleRatingChange('mentorGuidance', rating),
              'How helpful and insightful was your mentor\'s guidance?'
            )}

            {renderStarRating(
              'Platform Experience',
              feedback.platformExperience,
              (rating) => handleRatingChange('platformExperience', rating),
              'How was the video quality, chat, and overall platform performance?'
            )}
          </div>

          {/* Open-ended Questions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Additional Feedback
            </h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What worked well? ✨
              </label>
              <Textarea
                placeholder="Share what you found most valuable about this session..."
                value={feedback.whatWorkedWell}
                onChange={(e) => handleTextChange('whatWorkedWell', e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feedback.whatWorkedWell.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                How can we improve? 🚀
              </label>
              <Textarea
                placeholder="Suggest improvements for future sessions..."
                value={feedback.howToImprove}
                onChange={(e) => handleTextChange('howToImprove', e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feedback.howToImprove.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Comments 💭
              </label>
              <Textarea
                placeholder="Any other thoughts or feedback..."
                value={feedback.additionalComments}
                onChange={(e) => handleTextChange('additionalComments', e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {feedback.additionalComments.length}/1000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
            className="text-gray-600 dark:text-gray-400"
          >
            Skip for now
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!isValid() || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send size={16} />
                <span>Submit Feedback</span>
              </div>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
