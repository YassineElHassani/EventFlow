'use client';

import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import { UserRole } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard roles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
