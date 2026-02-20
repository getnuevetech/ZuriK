'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';
import { Spinner } from '../components/ui/Spinner';

interface WithRoleOptions {
  allowedRoles: string[];
}

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { allowedRoles }: WithRoleOptions
): React.FC<P> {
  const ProtectedComponent: React.FC<P> = (props) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return;
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }
      if (user && !allowedRoles.includes(user.role)) {
        router.push('/403');
      }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    if (!isAuthenticated || (user && !allowedRoles.includes(user.role))) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  ProtectedComponent.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return ProtectedComponent;
}

export function useRequireRole(allowedRoles: string[]) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const rolesKey = allowedRoles.join(',');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user && !rolesKey.split(',').includes(user.role)) {
      router.push('/403');
    }
  }, [isLoading, isAuthenticated, user, router, rolesKey]);

  return { user, isAuthenticated, isLoading };
}
