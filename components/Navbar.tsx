import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import UserButton from './UserButton';
import MobileNav from './MobileNav';

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-dark-1 border-b border-dark-3 px-6 py-4 lg:px-10">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">
              CareerLive
            </h1>
            <p className="text-xs text-sky-2 -mt-1">Video Meetings</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <UserButton />
          <MobileNav />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
