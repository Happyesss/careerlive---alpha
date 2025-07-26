'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { sidebarLinks } from '@/constants';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="sticky left-0 top-0 flex h-screen w-fit flex-col bg-dark-1 border-r border-dark-3 p-6 pt-28 text-white max-sm:hidden lg:w-[280px]">
      <div className="flex flex-1 flex-col gap-3">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
          
          return (
            <Link
              href={item.route}
              key={item.label}
              className={cn(
                'flex gap-4 items-center p-4 rounded-lg transition-all duration-200',
                {
                  'bg-blue-1 text-white': isActive,
                  'hover:bg-dark-3 text-sky-2 hover:text-white': !isActive,
                }
              )}
            >
              <Image
                src={item.imgURL}
                alt={item.label}
                width={20}
                height={20}
              />
              <p className="text-lg font-semibold max-lg:hidden">
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
