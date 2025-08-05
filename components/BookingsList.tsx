'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Booking {
  _id: string;
  menteeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  mentorId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  scheduledDateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  description?: string;
  duration: number;
  createdAt: string;
}

const BookingsList: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-sky-2" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/10';
      case 'cancelled':
        return 'text-red-500 bg-red-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'completed':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-sky-2 bg-sky-2/10';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-2">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-dark-3 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-dark-3 rounded w-2/3 mb-6"></div>
          </div>

          {/* Loading Cards */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-dark-3 rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-dark-4 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-dark-4 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-dark-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-dark-2">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user?.role === 'mentee' ? 'My Bookings' : 'Booking Requests'}
                </h1>
                <p className="text-sky-2">
                  {user?.role === 'mentee' 
                    ? 'Review your mentoring sessions and appointments'
                    : 'Manage incoming booking requests from mentees'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-sky-2 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No bookings yet</h3>
            <p className="text-sky-2">
              {user?.role === 'mentee' 
                ? 'Schedule your first mentoring session to get started!'
                : 'You don\'t have any booking requests yet.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-2">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {user?.role === 'mentee' ? 'My Bookings' : 'Booking Requests'}
              </h1>
              <p className="text-sky-2">
                {user?.role === 'mentee' 
                  ? 'Review your mentoring sessions and appointments'
                  : 'Manage incoming booking requests from mentees'
                }
              </p>
            </div>
          </div>

          {/* Stats Cards - Smaller */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="text-sm font-medium text-white">Confirmed</h3>
                  <p className="text-lg font-bold text-green-500">
                    {bookings.filter(b => b.status === 'confirmed').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <div>
                  <h3 className="text-sm font-medium text-white">Pending</h3>
                  <p className="text-lg font-bold text-yellow-500">
                    {bookings.filter(b => b.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="text-sm font-medium text-white">Total</h3>
                  <p className="text-lg font-bold text-blue-500">
                    {bookings.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
      
      {bookings.map((booking) => {
        const otherPerson = user?.role === 'mentee' ? booking.mentorId : booking.menteeId;
        
        return (
          <Card key={booking._id} className="bg-dark-2 border-dark-3 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-1 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {otherPerson.firstName[0]}{otherPerson.lastName[0]}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white">
                    {user?.role === 'mentee' ? 'Mentor: ' : 'Mentee: '}
                    {otherPerson.firstName} {otherPerson.lastName}
                  </h3>
                  <p className="text-xs text-sky-2">{otherPerson.email}</p>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sky-2 text-sm">
                <Calendar className="h-3 w-3" />
                <span>{new Date(booking.scheduledDateTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sky-2 text-sm">
                <Clock className="h-3 w-3" />
                <span>{new Date(booking.scheduledDateTime).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })} ({booking.duration}min)</span>
              </div>
            </div>

            {booking.description && (
              <div className="mb-3">
                <div className="flex items-center gap-1 text-sky-2 mb-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="text-xs">Message:</span>
                </div>
                <p className="text-white text-xs bg-dark-3 p-2 rounded">
                  {booking.description}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-dark-3">
              <div className="text-xs text-sky-2">
                {new Date(booking.createdAt).toLocaleDateString()}
              </div>
              
              {booking.status === 'confirmed' && (
                <div className="text-xs text-green-500 font-medium">
                  ✅ Confirmed - Awaiting link
                </div>
              )}
            </div>
          </Card>
        );
      })}
        </div>
      </div>
    </div>
  );
};

export default BookingsList;
