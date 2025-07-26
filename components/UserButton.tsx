'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, LogOut } from 'lucide-react';

const UserButton = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/sign-in');
  };

  if (!user) return null;

  const userInitials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full bg-dark-3 hover:bg-dark-2"
        >
          {user.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt={`${user.firstName} ${user.lastName}`}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <span className="text-sm font-medium text-white">
              {userInitials}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-dark-1 border-dark-3" align="end">
        <div className="flex items-center space-x-2 p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-3">
            {user.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <span className="text-xs font-medium text-white">
                {userInitials}
              </span>
            )}
          </div>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-dark-3" />
        <DropdownMenuItem className="text-white focus:bg-dark-2" disabled>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-dark-3" />
        <DropdownMenuItem
          className="text-white focus:bg-dark-2 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserButton;
