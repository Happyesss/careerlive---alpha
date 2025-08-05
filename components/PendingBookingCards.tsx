'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, MessageSquare, User, Bell } from 'lucide-react';

interface Booking {
  _id: string;
  menteeId: {
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

interface PendingBookingCardsProps {
  onBookingClick: (booking: Booking) => void;
}

const PendingBookingCards: React.FC<PendingBookingCardsProps> = ({ onBookingClick }) => {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'mentor') {
      fetchPendingBookings();
    }
  }, [user]);

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const pending = data.bookings?.filter((b: Booking) => b.status === 'pending') || [];
        setPendingBookings(pending);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show for mentors
  if (user?.role !== 'mentor') {
    return null;
  }

  // Don't show if no pending bookings
  if (pendingBookings.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-yellow-500" />
        <h2 className="text-xl font-semibold text-white">Pending Booking Requests</h2>
        <span className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-medium">
          {pendingBookings.length}
        </span>
      </div>
      <p className="text-sky-2 mb-4 text-sm">
        Click any card to quickly schedule with auto-filled details
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {pendingBookings.map((booking) => (
          <Card 
            key={booking._id} 
            className="bg-dark-3 border-dark-4 p-3 cursor-pointer transition-all hover:bg-dark-2 hover:border-yellow-500 hover:shadow-lg"
            onClick={() => onBookingClick(booking)}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold">
                {booking.menteeId.firstName[0]}{booking.menteeId.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {booking.menteeId.firstName} {booking.menteeId.lastName}
                </p>
                <p className="text-xs text-sky-2 truncate">{booking.menteeId.email}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-sky-2">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {new Date(booking.scheduledDateTime).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sky-2">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">
                  {new Date(booking.scheduledDateTime).toLocaleTimeString([], {
                    hour: '2-digit', 
                    minute:'2-digit'
                  })} ({booking.duration}min)
                </span>
              </div>
              
              {booking.description && (
                <div className="flex items-start gap-2 text-sky-2">
                  <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2 text-xs">
                    {booking.description}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-3 pt-2 border-t border-dark-4">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-yellow-500 font-medium">Click to schedule</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PendingBookingCards;
