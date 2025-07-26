'use client';
import React, { useState } from 'react';
import CallList from "@/components/CallList";
import { CheckCircle, Users, Filter, Calendar, Clock } from 'lucide-react';
import { useGetCalls } from '@/hooks/useGetCalls';

const PreviousPage = () => {
  const { endedCalls, isLoading } = useGetCalls();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration'>('newest');

  // Calculate total completed (all ended meetings)
  const completedMeetings = endedCalls || [];
  return (
    <div className="min-h-screen bg-dark-2">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Previous Meetings</h1>
              <p className="text-sky-2">Review your completed meetings and sessions</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-white" />
              <div>
                <p className="text-sky-2 text-sm">Total Completed</p>
                <p className="text-white font-semibold">{isLoading ? '...' : `${completedMeetings.length} meetings`}</p>
              </div>
            </div>
          </div>
          <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-white" />
              <div>
                <p className="text-sky-2 text-sm">Total Participated</p>
                <p className="text-white font-semibold">{isLoading ? '...' : `${completedMeetings.length} meetings`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="bg-dark-1 rounded-xl p-6 border border-dark-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Previous Meetings</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-sky-2" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'duration')}
                className="bg-dark-3 border border-dark-3 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-1"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">By Duration</option>
              </select>
            </div>
          </div>
          <CallList type="ended" sortBy={sortBy} />
        </div>
      </div>
    </div>
  );
};

export default PreviousPage;
