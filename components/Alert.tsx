import Link from 'next/link';
import Image from 'next/image';
import { Home, PhoneOff } from 'lucide-react';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface PermissionCardProps {
  title: string;
  iconUrl?: string;
}

const Alert = ({ title, iconUrl }: PermissionCardProps) => {
  const isCallEnded = title.includes("ended by the host");
  
  return (
    <section className="flex-center h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-[480px] border border-gray-700 bg-gray-800/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            {/* Icon Section */}
            <div className="relative">
              <div className={`flex items-center justify-center w-20 h-20 rounded-full ${
                isCallEnded ? 'bg-red-500/20' : 'bg-blue-500/20'
              } border-2 ${
                isCallEnded ? 'border-red-500/30' : 'border-blue-500/30'
              }`}>
                {iconUrl ? (
                  <Image 
                    src={iconUrl} 
                    width={40} 
                    height={40} 
                    alt="icon" 
                    className="filter brightness-0 invert"
                  />
                ) : (
                  <PhoneOff 
                    size={40} 
                    className={isCallEnded ? 'text-red-400' : 'text-blue-400'} 
                  />
                )}
              </div>
              {/* Animated ring */}
              <div className={`absolute inset-0 rounded-full border-2 ${
                isCallEnded ? 'border-red-500/50' : 'border-blue-500/50'
              } animate-pulse`}></div>
            </div>

            {/* Title Section */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white leading-tight">
                {isCallEnded ? "Meeting Ended" : "Meeting Status"}
              </h1>
              <p className="text-gray-300 text-base leading-relaxed max-w-sm">
                {title}
              </p>
            </div>

            {/* Action Buttons: side by side if call ended, otherwise single */}
            {isCallEnded ? (
              <div className="flex gap-3 w-full pt-4">
                <Button 
                  asChild 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Link href="/" className="flex items-center justify-center gap-2">
                    <Home size={18} />
                    Back to Home
                  </Link>
                </Button>
                <Button 
                  asChild
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Link href="/upcoming">Schedule New</Link>
                </Button>
              </div>
            ) : (
              <div className="w-full pt-4">
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  <Link href="/" className="flex items-center justify-center gap-2">
                    <Home size={18} />
                    Back to Home
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default Alert;
