import { ReactNode } from 'react';

import StreamVideoProvider from '@/providers/StreamClientProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main>
      <ProtectedRoute>
        <StreamVideoProvider>{children}</StreamVideoProvider>
      </ProtectedRoute>
    </main>
  );
};

export default RootLayout;
