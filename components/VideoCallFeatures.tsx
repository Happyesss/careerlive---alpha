'use client';
import React, { useState, useEffect } from 'react';
import { Video, Users, Monitor, Mic, Camera, MessageCircle, Shield, Zap } from 'lucide-react';

const VideoCallFeatures = () => {
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description: "Crystal clear video quality",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Users,
      title: "Team Meetings",
      description: "Connect with multiple people",
      color: "text-green-400",
      bgColor: "bg-green-500/10"
    },
    {
      icon: Monitor,
      title: "Screen Share",
      description: "Share your screen seamlessly",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: Mic,
      title: "Audio Controls",
      description: "Advanced audio management",
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Real-time messaging",
      color: "text-pink-400",
      bgColor: "bg-pink-500/10"
    },
    {
      icon: Shield,
      title: "Secure Calls",
      description: "End-to-end encryption",
      color: "text-red-400",
      bgColor: "bg-red-500/10"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="w-full">
      <div className="bg-dark-2 border border-dark-3 rounded-xl p-3 shadow-lg w-full max-lg:hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-blue-1/20 p-1.5 rounded-lg">
            <Zap className="w-3 h-3 text-blue-1" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white">Live Features</h3>
            <p className="text-xs text-sky-2">Professional video calling</p>
          </div>
        </div>

        {/* Current Feature Display */}
        <div className="mb-3">
          <div className={`${features[currentFeature].bgColor} rounded-lg p-3 transition-all duration-500`}>
            <div className="flex items-center gap-2 mb-1">
              {React.createElement(features[currentFeature].icon, {
                className: `w-4 h-4 ${features[currentFeature].color}`
              })}
              <h4 className="text-xs font-medium text-white">{features[currentFeature].title}</h4>
            </div>
            <p className="text-xs text-sky-2">{features[currentFeature].description}</p>
          </div>
        </div>

        {/* Feature Indicators */}
        <div className="flex justify-center gap-1 mb-3">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeature(index)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentFeature 
                  ? 'bg-blue-1 w-4' 
                  : 'bg-dark-3 hover:bg-dark-2'
              }`}
            />
          ))}
        </div>

        {/* Quick Stats */}
        <div className="border-t border-dark-3 pt-2">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-dark-1 rounded-lg p-2">
              <div className="text-sm font-bold text-blue-1">99.9%</div>
              <div className="text-xs text-sky-2">Uptime</div>
            </div>
            <div className="bg-dark-1 rounded-lg p-2">
              <div className="text-sm font-bold text-green-400">50+</div>
              <div className="text-xs text-sky-2">Participants</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallFeatures;
