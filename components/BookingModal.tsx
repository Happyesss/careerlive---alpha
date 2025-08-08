'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, Clock, User, MapPin, MessageSquare, CalendarDays } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface Mentor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  fullName: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [availableMentors, setAvailableMentors] = useState<Mentor[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Date/Time, 2: Mentor Selection, 3: Details
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedDate(null);
      setSelectedTime('');
      setDuration(60);
      setAvailableMentors([]);
      setSelectedMentor(null);
      setDescription('');
      setStep(1);
    }
  }, [isOpen]);

  const handleDateTimeSelect = async () => {
    if (!selectedDate || !selectedTime) {
      toast({ title: 'Please select both date and time', variant: 'destructive' });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);

    // Check if the selected time is in the future
    if (dateTime <= new Date()) {
      toast({ title: 'Please select a future date and time', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    
    try {
      // Just get all mentors - no availability checking
      const response = await fetch(`/api/mentors/available`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch mentors');
      }

      const data = await response.json();
      setAvailableMentors(data.availableMentors);
      
      if (data.availableMentors.length === 0) {
        toast({ 
          title: 'No mentors found', 
          description: 'Please try again later',
          variant: 'destructive'
        });
        return;
      }

      setStep(2);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to load mentors',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentorSelect = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setStep(3);
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedMentor) {
      toast({ title: 'Please complete all required fields', variant: 'destructive' });
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          mentorId: selectedMentor._id,
          scheduledDateTime: dateTime.toISOString(),
          description,
          duration
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      toast({ 
        title: 'Booking Request Sent!', 
        description: `Your request has been sent to ${selectedMentor.fullName}. You'll receive an email once they confirm the time slot.`,
      });
      onClose();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  if (!user || user.role !== 'mentee') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-dark-1 border-dark-3">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-blue-1" />
            Schedule a Mentoring Session
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                  ${step >= stepNumber ? 'bg-blue-1 text-white' : 'bg-dark-3 text-sky-2'}
                `}>
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-8 h-px mx-2 ${step > stepNumber ? 'bg-blue-1' : 'bg-dark-3'}`} />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-1" />
                Select Date & Time
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-sky-2 mb-2">
                    Select Date
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    minDate={new Date()}
                    maxDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)} // 30 days from now
                    className="w-full p-3 bg-dark-3 border border-dark-2 rounded-lg text-white focus:ring-2 focus:ring-blue-1 focus:border-transparent"
                    placeholderText="Choose a date"
                    dateFormat="MMMM d, yyyy"
                    filterDate={(date) => date.getDay() !== 0} // Exclude Sundays
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sky-2 mb-2">
                    Select Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-3 bg-dark-3 border border-dark-2 rounded-lg text-white focus:ring-2 focus:ring-blue-1 focus:border-transparent"
                  >
                    <option value="">Choose a time</option>
                    {generateTimeSlots().map((time) => (
                      <option key={time} value={time}>
                        {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-2 mb-2">
                  Duration (minutes)
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-3 bg-dark-3 border border-dark-2 rounded-lg text-white focus:ring-2 focus:ring-blue-1 focus:border-transparent"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                </select>
              </div>

              <Button
                onClick={handleDateTimeSelect}
                disabled={!selectedDate || !selectedTime || isLoading}
                className="w-full bg-blue-1 hover:bg-blue-1/80 text-white"
              >
                {isLoading ? 'Loading Mentors...' : 'View Available Mentors'}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-1" />
                  Choose Your Mentor
                </h3>
                <button
                  onClick={() => setStep(1)}
                  className="text-white bg-dark-3 py-2 px-5 text-sm rounded-sm hover:bg-dark-4"
                >
                  Back
                </button>
              </div>

              <div className="bg-dark-3 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-sky-2">
                  <MapPin className="h-4 w-4" />
                  <span>{formatSelectedDateTime()}</span>
                  <span>•</span>
                  <span>{duration} minutes</span>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {availableMentors.map((mentor) => (
                  <div
                    key={mentor._id}
                    onClick={() => handleMentorSelect(mentor)}
                    className="p-4 bg-dark-2 border border-dark-3 rounded-lg cursor-pointer hover:border-blue-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-1 rounded-full flex items-center justify-center text-white font-semibold">
                        {mentor.firstName[0]}{mentor.lastName[0]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{mentor.fullName}</h4>
                        <p className="text-sm text-sky-2">{mentor.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && selectedMentor && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-1" />
                  Booking Details
                </h3>
                <button
                  onClick={() => setStep(2)}
                  className="text-white bg-dark-3 py-2 px-5 text-sm rounded-sm hover:bg-dark-4"
                >
                  Back
                </button>
              </div>

              <div className="bg-dark-3 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm text-sky-2">
                  <User className="h-4 w-4" />
                  <span>Mentor: {selectedMentor.fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sky-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatSelectedDateTime()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-sky-2">
                  <MapPin className="h-4 w-4" />
                  <span>{duration} minutes session</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sky-2 mb-2">
                  Message for your mentor (optional)
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell your mentor what you'd like to discuss or any specific topics you want to cover..."
                  className="bg-dark-3 border-dark-2 text-white placeholder:text-sky-2 focus:ring-2 focus:ring-blue-1 focus:border-transparent"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="w-full bg-blue-1 hover:bg-blue-1/80 text-white"
              >
                {isSubmitting ? 'Sending Request...' : 'Send Booking Request'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
