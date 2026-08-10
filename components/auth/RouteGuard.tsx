'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROUTE_ACCESS } from '@/lib/auth/permissions';
import { ShieldAlert } from 'lucide-react';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isReady, setIsReady] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getRequiredRoles = () => {
    if (!pathname) return null;
    const match = Object.keys(ROUTE_ACCESS).find((route) => pathname.startsWith(route) && route !== '/');
    return match ? ROUTE_ACCESS[match] : null;
  };

  const requiredRoles = getRequiredRoles();
  // If no specific route mapping found, default to true for safety or let layout handle it.
  // Actually, we should check if they are authorized. If it's in ROUTE_ACCESS, check role.
  const hasAccess = !requiredRoles || (user && requiredRoles.includes(user.role as any));

  useEffect(() => {
    // Wait a brief tick for AuthProvider localStorage to hydrate
    const timer = setTimeout(() => {
      setIsReady(true);
      if (!user) {
        router.push('/login');
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [user, router]);

  if (!isReady || !user) return null; // Wait for redirect if not logged in

  if (!hasAccess) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-background text-center p-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Access Restricted</h2>
        <p className="text-foreground-muted max-w-md mb-6">
          Your current role (<strong>{user.role}</strong>) does not have authorization to view this page. Please contact the System Super Administrator if you believe this is an error.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary-600 transition-colors"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
