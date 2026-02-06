'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/lib/types';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export default function AuthGuard({ children, roles }: AuthGuardProps) {
  const router = useRouter();
  const { user, token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!token || !user) {
      router.replace('/auth/login');
      return;
    }
    if (roles && !roles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [token, user, roles, router]);

  if (!token || !user) return null;
  if (roles && !roles.includes(user.role)) return null;

  return <>{children}</>;
}
