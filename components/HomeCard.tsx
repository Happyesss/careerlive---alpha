'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HomeCardProps {
  className?: string;
  img: string;
  title: string;
  description: string;
  handleClick?: () => void;
}

const HomeCard = ({ className, img, title, description, handleClick }: HomeCardProps) => {
  return (
    <div
      className={cn(
        'group relative bg-dark-1 rounded-xl p-6 border border-dark-3 transition-all duration-300 cursor-pointer overflow-hidden',
        'hover:border-white/20 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-1',
        'flex flex-col justify-between min-h-[180px]',
        className
      )}
      onClick={handleClick}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5 transform rotate-12 translate-x-6 -translate-y-6">
        <div className="w-full h-full bg-white rounded-lg"></div>
      </div>
      
      {/* Icon Container */}
      <div className="flex-shrink-0 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/15 transition-colors duration-300">
          <Image 
            src={img} 
            alt={title} 
            width={24} 
            height={24} 
            className="filter brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sky-2 text-sm leading-relaxed group-hover:text-sky-1 transition-colors duration-300">
          {description}
        </p>
      </div>
    </div>
  );
};

export default HomeCard;
