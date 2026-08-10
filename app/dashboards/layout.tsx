'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { StaffHeader } from '@/components/layout/StaffHeader';
import { RouteGuard } from '@/components/auth/RouteGuard';

export default function DashboardsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Collapsible Sidebar */}
      <Sidebar />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <StaffHeader />
        <main className="flex-1 overflow-hidden">
          <RouteGuard>
            {children}
          </RouteGuard>
        </main>
      </div>
    </div>
  );
}
