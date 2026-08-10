/**
 * SISMP — Staff Collapsible Sidebar Navigation
 * Gated by RBAC role permissions — only renders items the user's role can access.
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';
import { PERMISSIONS } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils';
import {
  CheckSquare,
  QrCode,
  Calendar,
  Users,
  FileSignature,
  Grid,
  Sparkles,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Layers,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  permission?: string;
  badge?: string;
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { can, role } = useAuth();

  const NAV_ITEMS: NavItem[] = [
    {
      label: 'Approvals Queue',
      href: '/staff/approvals',
      icon: CheckSquare,
      permission: PERMISSIONS.APPROVE_REGISTRATION,
      badge: '12',
    },
    {
      label: 'Badge & Verification',
      href: '/staff/badges',
      icon: QrCode,
      permission: PERMISSIONS.VIEW_BADGES,
    },
    {
      label: 'B2G Meetings',
      href: '/staff/meetings',
      icon: Calendar,
      permission: PERMISSIONS.MANAGE_MEETINGS,
      badge: '3',
    },
    {
      label: 'Investor 360° CRM',
      href: '/staff/crm',
      icon: Users,
      permission: PERMISSIONS.VIEW_CRM,
    },
    {
      label: 'MoU Management',
      href: '/staff/mou',
      icon: FileSignature,
      permission: PERMISSIONS.VIEW_MOU,
    },
    {
      label: 'Pavilions Layout',
      href: '/staff/pavilions',
      icon: Grid,
      permission: PERMISSIONS.VIEW_PAVILIONS,
    },
    {
      label: 'Event & Agenda',
      href: '/staff/events',
      icon: Sparkles,
      permission: PERMISSIONS.VIEW_EVENTS,
    },
    {
      label: 'Security & Access',
      href: '/staff/security',
      icon: ShieldCheck,
      permission: PERMISSIONS.SCAN_QR,
    },
  ];

  const DASHBOARD_ITEMS: NavItem[] = [
    {
      label: 'CMO Dashboard',
      href: '/dashboards/cmo',
      icon: BarChart3,
      permission: PERMISSIONS.VIEW_CMO_DASHBOARD,
    },
    {
      label: 'MPIDC Dashboard',
      href: '/dashboards/mpidc',
      icon: Layers,
      permission: PERMISSIONS.VIEW_MPIDC_DASHBOARD,
    },
    {
      label: 'Department View',
      href: '/dashboards/department',
      icon: Landmark,
      permission: PERMISSIONS.VIEW_DEPT_DASHBOARD,
    },
  ];

  const ADMIN_ITEMS: NavItem[] = [
    {
      label: 'Nodal Officer Manager',
      href: '/dashboards/super-admin',
      icon: ShieldCheck,
      permission: PERMISSIONS.VIEW_ADMIN,
    },
    {
      label: 'System Config',
      href: '/staff/admin/config',
      icon: Settings,
      permission: PERMISSIONS.VIEW_ADMIN,
    },
  ];

  // Filter items by user role permission
  const filterItems = (items: NavItem[]) =>
    items.filter((item) => !item.permission || can(item.permission as any));

  const visibleNav = filterItems(NAV_ITEMS);
  const visibleDashboards = filterItems(DASHBOARD_ITEMS);
  const visibleAdmin = filterItems(ADMIN_ITEMS);

  return (
    <aside
      className={cn(
        'h-screen sidebar-gradient text-sidebar-foreground flex flex-col transition-all duration-300 relative z-30 shrink-0 border-r border-slate-800',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 justify-between border-b border-slate-800 shrink-0">
        {!collapsed && (
          <Link href={visibleNav[0]?.href || '/staff/badges'} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              MP
            </div>
            <div>
              <span className="block text-sm font-bold text-white leading-none">SISMP Portal</span>
              <span className="block text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider">
                Staff Desk
              </span>
            </div>
          </Link>
        )}

        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold text-sm mx-auto">
            MP
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {/* Core Operations Group */}
        <div>
          {!collapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Operations
            </p>
          )}
          <nav className="space-y-1">
            {visibleNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group relative',
                    isActive
                      ? 'bg-primary-600 text-white font-semibold shadow-md'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Dashboards Group */}
        {visibleDashboards.length > 0 && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Analytics
              </p>
            )}
            <nav className="space-y-1">
              {visibleDashboards.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-primary-600 text-white font-semibold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Admin Group */}
        {visibleAdmin.length > 0 && (
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Administration
              </p>
            )}
            <nav className="space-y-1">
              {visibleAdmin.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 group',
                      isActive
                        ? 'bg-primary-600 text-white font-semibold shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400 group-hover:text-white')} />
                    {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Role Badge Indicator at Bottom */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-xs">
          <div className="text-[10px] text-slate-400">Current Scope</div>
          <div className="font-semibold text-slate-200 capitalize truncate mt-0.5">
            {role.replace('_', ' ')}
          </div>
        </div>
      )}
    </aside>
  );
}
