'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function BookingTestPage() {
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; data?: any; error?: string }>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    try {
      const result = await testFn();
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: true, data: result }
      }));
      toast({
        title: `✅ ${testName}`,
        description: "Test passed successfully",
      });
    } catch (error: any) {
      setTestResults((prev) => ({
        ...prev,
        [testName]: { success: false, error: error.message }
      }));
      toast({
        title: `❌ ${testName}`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    const response = await fetch('/api/auth/me', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    
    return await response.json();
  };

  const testMentors = async () => {
    const response = await fetch('/api/mentors/available', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch mentors');
    }
    
    const data = await response.json();
    if (!data.mentors || data.mentors.length === 0) {
      throw new Error('No mentors found in database');
    }
    
    return data;
  };

  const testBookings = async () => {
    const response = await fetch('/api/bookings', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    
    return await response.json();
  };

  const testCreateBooking = async () => {
    // First get available mentors
    const mentorsResponse = await fetch('/api/mentors/available', {
      credentials: 'include'
    });
    
    if (!mentorsResponse.ok) {
      throw new Error('Failed to fetch mentors for test booking');
    }
    
    const mentorsData = await mentorsResponse.json();
    if (!mentorsData.mentors || mentorsData.mentors.length === 0) {
      throw new Error('No mentors available for test booking');
    }
    
    const testBooking = {
      mentorId: mentorsData.mentors[0]._id,
      preferredDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
      preferredTime: "14:00",
      duration: 60,
      message: "Test booking created by test suite"
    };
    
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testBooking)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create test booking');
    }
    
    return await response.json();
  };

  const runAllTests = async () => {
    await runTest('Authentication Check', testAuth);
    await runTest('Mentors List', testMentors);
    await runTest('Bookings List', testBookings);
    await runTest('Create Test Booking', testCreateBooking);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Booking System Test Suite</CardTitle>
          <p className="text-muted-foreground">
            Run these tests to verify the booking system is working correctly
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => runTest('Authentication Check', testAuth)}
              disabled={loading}
              variant="outline"
            >
              Test Auth
            </Button>
            <Button 
              onClick={() => runTest('Mentors List', testMentors)}
              disabled={loading}
              variant="outline"
            >
              Test Mentors
            </Button>
            <Button 
              onClick={() => runTest('Bookings List', testBookings)}
              disabled={loading}
              variant="outline"
            >
              Test Bookings
            </Button>
            <Button 
              onClick={() => runTest('Create Test Booking', testCreateBooking)}
              disabled={loading}
              variant="outline"
            >
              Create Test
            </Button>
          </div>
          
          <Button 
            onClick={runAllTests}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </CardContent>
      </Card>

      {Object.keys(testResults).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(testResults).map(([testName, result]: [string, any]) => (
                <div key={testName} className="border rounded p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={result.success ? "text-green-600" : "text-red-600"}>
                      {result.success ? "✅" : "❌"}
                    </span>
                    <strong>{testName}</strong>
                  </div>
                  
                  {result.success ? (
                    <pre className="text-sm bg-green-50 p-2 rounded overflow-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-sm bg-red-50 p-2 rounded text-red-800">
                      <strong>Error:</strong> {result.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
