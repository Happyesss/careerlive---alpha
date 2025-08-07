'use client';

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Users, MessageSquare, Calendar } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface FeedbackData {
  _id: string;
  name: string;
  email: string;
  meetingId: string;
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  menteeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  sessionEffectiveness: number;
  mentorGuidance: number;
  platformExperience: number;
  whatWorkedWell?: string;
  howToImprove?: string;
  additionalComments?: string;
  createdAt: string;
}

interface FeedbackStats {
  averageSessionEffectiveness: number;
  averageMentorGuidance: number;
  averagePlatformExperience: number;
  totalFeedbacks: number;
}

interface FeedbackDashboardProps {
  mentorId?: string;
  menteeId?: string;
}

const FeedbackDashboard = ({ mentorId, menteeId }: FeedbackDashboardProps) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeedback();
  }, [page, mentorId, menteeId]);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });

      if (mentorId) params.append('mentorId', mentorId);
      if (menteeId) params.append('menteeId', menteeId);

      const response = await fetch(`/api/feedback?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFeedbacks(data.feedbacks);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300 dark:text-gray-600'
            }
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}/10</span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return 'text-green-600 dark:text-green-400';
    if (rating >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading && feedbacks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Session Effectiveness</p>
                <p className={`text-xl font-bold ${getRatingColor(stats.averageSessionEffectiveness)}`}>
                  {stats.averageSessionEffectiveness.toFixed(1)}/10
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Mentor Guidance</p>
                <p className={`text-xl font-bold ${getRatingColor(stats.averageMentorGuidance)}`}>
                  {stats.averageMentorGuidance.toFixed(1)}/10
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Platform Experience</p>
                <p className={`text-xl font-bold ${getRatingColor(stats.averagePlatformExperience)}`}>
                  {stats.averagePlatformExperience.toFixed(1)}/10
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.totalFeedbacks}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Feedback List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Feedback
        </h3>

        {feedbacks.length === 0 ? (
          <Card className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No feedback yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Feedback will appear here after mentoring sessions are completed.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <Card key={feedback._id} className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {feedback.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feedback.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Session with: {feedback.mentorId.firstName} {feedback.mentorId.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {formatDate(feedback.createdAt)}
                      </Badge>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ID: {feedback.meetingId.slice(-8)}
                      </p>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Session Effectiveness
                      </p>
                      {renderStars(feedback.sessionEffectiveness)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Mentor Guidance
                      </p>
                      {renderStars(feedback.mentorGuidance)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Platform Experience
                      </p>
                      {renderStars(feedback.platformExperience)}
                    </div>
                  </div>

                  {/* Comments */}
                  {(feedback.whatWorkedWell || feedback.howToImprove || feedback.additionalComments) && (
                    <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {feedback.whatWorkedWell && (
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                            ✨ What worked well:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                            {feedback.whatWorkedWell}
                          </p>
                        </div>
                      )}
                      {feedback.howToImprove && (
                        <div>
                          <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">
                            🚀 How to improve:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            {feedback.howToImprove}
                          </p>
                        </div>
                      )}
                      {feedback.additionalComments && (
                        <div>
                          <p className="text-sm font-medium text-purple-700 dark:text-purple-400 mb-1">
                            💭 Additional comments:
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            {feedback.additionalComments}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center space-x-2">
            <Button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              variant="outline"
              size="sm"
            >
              Previous
            </Button>
            <span className="flex items-center px-3 text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackDashboard;
