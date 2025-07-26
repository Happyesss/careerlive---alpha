'use client';
import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, X } from 'lucide-react';
import { useGetCalls } from '@/hooks/useGetCalls';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  duration: number;
  description?: string;
}

interface ScheduleCalendarProps {
  onScheduleMeeting: (meeting: { dateTime: Date; description: string }) => void;
  onClose: () => void;
}

const ScheduleCalendar = ({ onScheduleMeeting, onClose }: ScheduleCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const { upcomingCalls } = useGetCalls();

  // Convert upcoming calls to calendar events
  const events: CalendarEvent[] = upcomingCalls?.map(call => ({
    id: call.id,
    title: call.state?.custom?.description || 'Meeting',
    date: new Date(call.state.startsAt!),
    time: new Date(call.state.startsAt!).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    duration: 60,
    description: call.state?.custom?.description
  })) || [];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const handleSchedule = () => {
    if (!selectedDate) return;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    
    onScheduleMeeting({
      dateTime,
      description: description || `Meeting scheduled for ${dateTime.toLocaleDateString()}`
    });
  };

  const days = getDaysInMonth(currentDate);
  const timeSlots = generateTimeSlots();

  return (
    <div className="bg-dark-1 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-1" />
          Schedule Meeting
        </h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-sky-2" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-dark-2 rounded-lg p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-sky-2" />
              </button>
              <h3 className="text-xl font-semibold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-dark-3 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-sky-2" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-sky-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (!day) {
                  return <div key={index} className="p-2 h-12"></div>;
                }

                const dayEvents = getEventsForDate(day);
                const isSelected = selectedDate?.toDateString() === day.toDateString();
                const isPast = isPastDate(day);
                const todayClass = isToday(day);

                return (
                  <button
                    key={day.getDate()}
                    onClick={() => !isPast && setSelectedDate(day)}
                    disabled={isPast}
                    className={`
                      p-2 h-12 text-sm rounded-lg transition-all relative
                      ${isPast 
                        ? 'text-gray-500 cursor-not-allowed' 
                        : 'text-white hover:bg-dark-3 cursor-pointer'
                      }
                      ${isSelected 
                        ? 'bg-blue-1 text-white' 
                        : todayClass 
                        ? 'bg-dark-3 text-blue-1 font-semibold' 
                        : ''
                      }
                    `}
                  >
                    {day.getDate()}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-orange-1 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Events for Selected Date */}
          {selectedDate && (
            <div className="mt-4 bg-dark-2 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">
                Events for {selectedDate.toLocaleDateString()}
              </h4>
              {getEventsForDate(selectedDate).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="bg-dark-3 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-1" />
                        <span className="text-white font-medium">{event.title}</span>
                        <span className="text-sky-2 text-sm">{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sky-2 text-sm">No events scheduled</p>
              )}
            </div>
          )}
        </div>

        {/* Schedule Form */}
        <div className="bg-dark-2 rounded-lg p-4 h-fit">
          <h4 className="text-lg font-semibold text-white mb-4">Schedule New Meeting</h4>
          
          {selectedDate ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-sky-2 mb-2">Selected Date</label>
                <div className="bg-dark-3 rounded-lg p-3 text-white">
                  {selectedDate.toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="block text-sm text-sky-2 mb-2">Time</label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-dark-3 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-1"
                >
                  {timeSlots.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-sky-2 mb-2">Duration (minutes)</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-dark-3 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-1"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-sky-2 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Meeting description..."
                  className="w-full bg-dark-3 text-white rounded-lg p-3 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-1"
                />
              </div>

              <button
                onClick={handleSchedule}
                className="w-full bg-blue-1 hover:bg-blue-1/80 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-sky-2 mx-auto mb-3" />
              <p className="text-sky-2">Select a date to schedule a meeting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;
