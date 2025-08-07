'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FeedbackDashboard from '@/components/FeedbackDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';

const FeedbackPage = () => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/sign-in');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/sign-in');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canViewAllFeedback = user.role === 'admin';
  const mentorId = user.role === 'mentor' ? user._id : undefined;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Feedback Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {canViewAllFeedback 
                  ? 'View all feedback from mentoring sessions'
                  : 'View feedback from your mentoring sessions'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                About Session Feedback
              </h3>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <p>• <strong>Session Effectiveness:</strong> How well the session achieved the mentee's goals</p>
                <p>• <strong>Mentor Guidance:</strong> Quality and helpfulness of mentor's advice and support</p>
                <p>• <strong>Platform Experience:</strong> Video quality, chat functionality, and overall platform performance</p>
                <p className="mt-2 text-blue-700 dark:text-blue-300">
                  Feedback is collected automatically after each session to help improve our mentoring experience.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Feedback Dashboard */}
        <FeedbackDashboard mentorId={mentorId} />
      </div>
    </div>
  );
};

export default FeedbackPage;
