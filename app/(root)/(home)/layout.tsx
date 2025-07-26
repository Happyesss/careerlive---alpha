import { Metadata } from 'next';
import { ReactNode } from 'react';

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export const metadata: Metadata = {
  title: 'CareerLive - Professional Video Meetings',
  description: 'A workspace for your team, powered by Stream Video and custom authentication.',
};

const RootLayout = ({ children }: Readonly<{children: ReactNode}>) => {
  return (
    <main className="relative bg-gray-900 min-h-screen">
      <Navbar />

      <div className="flex">
        <Sidebar />
        
        <section className="flex min-h-screen flex-1 flex-col pt-20 max-md:pt-16">
          <div className="w-full h-full">{children}</div>
        </section>
      </div>
    </main>
  );
};

export default RootLayout;
