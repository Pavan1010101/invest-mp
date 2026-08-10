'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { ShieldAlert } from 'lucide-react';

const ROUTE_PERMISSIONS: Record<string, string> = {
  '/staff/approvals': PERMISSIONS.APPROVE_REGISTRATION,
  '/staff/badges': PERMISSIONS.VIEW_BADGES,
  '/staff/meetings': PERMISSIONS.MANAGE_MEETINGS,
  '/staff/crm': PERMISSIONS.VIEW_CRM,
  '/staff/mou': PERMISSIONS.VIEW_MOU,
  '/staff/pavilions': PERMISSIONS.VIEW_PAVILIONS,
  '/staff/events': PERMISSIONS.VIEW_EVENTS,
  '/staff/security': PERMISSIONS.SCAN_QR,
  '/staff/admin': PERMISSIONS.VIEW_ADMIN,
  '/dashboards/super-admin': PERMISSIONS.VIEW_ADMIN,
  '/dashboards/cmo': PERMISSIONS.VIEW_CMO_DASHBOARD,
  '/dashboards/mpidc': PERMISSIONS.VIEW_MPIDC_DASHBOARD,
  '/dashboards/department': PERMISSIONS.VIEW_DEPT_DASHBOARD,
};

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, can } = useAuth();
  const [isReady, setIsReady] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const getRequiredPermission = () => {
    if (!pathname) return null;
    const match = Object.keys(ROUTE_PERMISSIONS).find((route) => pathname.startsWith(route));
    return match ? ROUTE_PERMISSIONS[match] : null;
  };

  const requiredPermission = getRequiredPermission();
  const hasAccess = !requiredPermission || can(requiredPermission as any);

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
