/**
 * SISMP — Staff App Top Header
 * Includes Role Switcher widget, Notifications bell, Language Switcher, User Menu, Password Change & Logout.
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { ROLES, type Role } from '@/lib/auth/roles';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { ChangePasswordModal } from '@/components/patterns/ChangePasswordModal';
import { Bell, User, ShieldAlert, CheckCircle, ChevronDown, LogOut, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export function StaffHeader() {
  const router = useRouter();
  const { user, role, switchRole, logout } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const availableRoles: { role: Role; label: string }[] = [
    { role: ROLES.DEPARTMENT_OFFICER, label: 'Department Officer' },
    { role: ROLES.REGISTRATION_DESK, label: 'Registration Desk' },
    { role: ROLES.RELATIONSHIP_MANAGER, label: 'Relationship Manager' },
    { role: ROLES.PAVILION_MANAGER, label: 'Pavilion Manager' },
    { role: ROLES.EVENT_ORGANIZER, label: 'Event Organizer' },
    { role: ROLES.SECURITY_STAFF, label: 'Security Staff' },
    { role: ROLES.MPIDC_ADMIN, label: 'MPIDC Admin' },
    { role: ROLES.SUPER_ADMIN, label: 'Super Admin' },
    { role: ROLES.CMO_OFFICIAL, label: 'CMO Official' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between shrink-0 z-20">
        {/* Search / Breadcrumb Placeholder */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="font-semibold text-primary">SISMP Staff Workspace</span>
            <span>/</span>
            <span className="capitalize">{role.replace('_', ' ')} Portal</span>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Active Role Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary-200 bg-primary-50 text-primary text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Role: {availableRoles.find((r) => r.role === role)?.label || role.replace('_', ' ')}</span>
          </div>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-destructive absolute top-1.5 right-1.5 ring-2 ring-surface" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface rounded-xl shadow-xl border border-border p-4 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                  <span className="text-xs font-bold text-foreground">Notifications</span>
                  <span className="text-[10px] text-primary font-medium cursor-pointer">Mark all as read</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-2 rounded-lg bg-primary-50/50 border border-primary-100">
                    <p className="font-medium text-foreground">New Registration Submitted</p>
                    <p className="text-[11px] text-foreground-muted mt-0.5">
                      Reliance Power submitted investor registration #IMP26-00892.
                    </p>
                    <span className="text-[10px] text-foreground-subtle mt-1 block">5m ago</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background border border-border">
                    <p className="font-medium text-foreground">B2G Meeting Conflict Resolved</p>
                    <p className="text-[11px] text-foreground-muted mt-0.5">
                      Room B-03 slot confirmed for Dept of Renewable Energy.
                    </p>
                    <span className="text-[10px] text-foreground-subtle mt-1 block">1h ago</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-semibold text-foreground leading-tight">
                  {user?.name || 'Department Officer'}
                </span>
                <span className="block text-[10px] text-foreground-subtle leading-tight">
                  {user?.email || 'officer@mp.gov.in'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-primary-50 text-foreground-muted hover:text-primary text-xs font-semibold transition-colors"
              title="Change / Update Password"
            >
              <KeyRound className="w-4 h-4 text-primary" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-colors"
              title="Sign Out of Session"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
