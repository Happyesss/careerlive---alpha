"use client";

import Image from "next/image";
import { Calendar, Clock, Users, ExternalLink, Play } from "lucide-react";
import { Call } from '@stream-io/video-react-sdk';

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  isOngoing?: boolean;
  joinedViaLink?: boolean;
  call?: Call; // Add call prop to access actual members
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  isOngoing,
  joinedViaLink,
  call,
}: MeetingCardProps) => {
  const { toast } = useToast();

  // Get actual call members instead of static avatars
  const getCallMembers = () => {
    if (!call?.state?.members) return [];
    
    return call.state.members.map((member, index) => {
      const name = member.user.name || member.user.id || `User ${index + 1}`;
      return {
        name,
        image: member.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=32`,
        id: member.user.id
      };
    });
  };

  const callMembers = getCallMembers();
  const memberCount = callMembers.length;

  const formatDate = (dateString: string) => {
    try {
      // Handle different date formats
      let date;
      if (dateString.includes('Invalid Date') || !dateString || dateString === 'undefined') {
        return 'No date';
      }
      
      // Try parsing as ISO string or direct Date constructor
      date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original if can't parse
      }
      
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays === -1) return "Yesterday";
      if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
      if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return 'No date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      if (dateString.includes('Invalid Date') || !dateString || dateString === 'undefined') {
        return 'No time';
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'No time';
      }
      
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'No time';
    }
  };



const getDateLabel = (someDate: Date) => {
  const today = new Date();

  // Clone today's date to create a "tomorrow" date
  const tomorrow = new Date();
  // Increment the day by 1 to represent tomorrow
  tomorrow.setDate(today.getDate() + 1);

  // Helper function to check if two dates fall on the same calendar day
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&        // Compare day
    d1.getMonth() === d2.getMonth() &&      // Compare month
    d1.getFullYear() === d2.getFullYear();  // Compare year

  // If the given date is today, return "Today"
  if (isSameDay(someDate, today)) return "Today";

  // If the given date is tomorrow, return "Tomorrow"
  if (isSameDay(someDate, tomorrow)) return "Tomorrow";

  // Otherwise, return the date in default localized format
  return someDate.toLocaleDateString();
};


  return (
    <div className="group bg-dark-1  rounded-xl p-6 border border-dark-3 hover:border-blue-1/30 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 ">
        <div className="flex items-center gap-3 ">
          <div className="bg-blue-1/10 p-2 rounded-lg">
            <Image src={icon} alt="meeting" width={20} height={20} />
          </div>
          <div>
             <h3 className="text-lg break-all font-semibold text-white  group-hover:text-blue-1 transition-colors">
                   {title}
             </h3>

            <div className="flex items-center gap-4 mt-1">
              <div className="flex items-center gap-1 text-sky-2 text-sm">
                <Calendar className="w-3 h-3" />
                    <span>{getDateLabel(new Date(date))}</span>
              </div>
              <div className="flex items-center gap-1 text-sky-2 text-sm">
                <Clock className="w-3 h-3" />
                <span>{formatTime(date)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {joinedViaLink && (
            <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-500">
              Via Link
            </div>
          )}
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-medium",
            isOngoing
              ? "bg-yellow-500/20 text-yellow-500"
              : isPreviousMeeting 
              ? "bg-green-500/20 text-green-500" 
              : buttonText === "Play"
              ? "bg-orange-500/20 text-orange-500"
              : "bg-blue-1/20 text-blue-1"
          )}>
            {isOngoing ? "Ongoing" : isPreviousMeeting ? "Completed" : buttonText === "Play" ? "Recorded" : "Scheduled"}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex -space-x-2">
          {callMembers.slice(0, 4).map((member, index) => (
            <img
              key={member.id || index}
              src={member.image}
              alt={member.name}
              width={28}
              height={28}
              className="rounded-full border-2 border-dark-1"
            />
          ))}
          {callMembers.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-dark-3 border-2 border-dark-1 flex items-center justify-center">
              <span className="text-xs text-sky-2">+{callMembers.length - 4}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-sky-2 text-sm">
          <Users className="w-3 h-3" />
          <span>{memberCount} participant{memberCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Show appropriate buttons based on meeting status */}
        {isOngoing ? (
          <Button
            onClick={handleClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Join Now
          </Button>
        ) : !(isPreviousMeeting && !buttonText) ? (
          <>
            <Button
              onClick={handleClick}
              className={cn(
                "flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-all",
                isPreviousMeeting || buttonText === "Play"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-1 hover:bg-blue-1/80 text-white"
              )}
            >
              {buttonIcon1 ? (
                <Image src={buttonIcon1} alt="button icon" width={16} height={16} />
              ) : isPreviousMeeting ? (
                <ExternalLink className="w-4 h-4" />
              ) : buttonText === "Play" ? (
                <Play className="w-4 h-4" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              {buttonText || (isPreviousMeeting ? "View Details" : "Join Meeting")}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({ title: "Link copied to clipboard" });
              }}
              className="text-sky-2 hover:text-white hover:bg-dark-3"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sky-2">
            <span className="text-sm">Meeting ended</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;
