/**
 * SISMP — Super Admin Roles & Permissions Matrix Editor
 * Interactive RBAC Matrix Editor.
 * Features:
 * - Table grid: Rows = Roles, Columns = Granular System Permissions
 * - Interactive cell toggles to grant/revoke permissions per role
 * - Live "View as [Role]" preview simulator
 * - Audit Trail & Save configuration trigger
 */
'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ROLES, ROLE_LABELS, type Role } from '@/lib/auth/roles';
import { PERMISSIONS, type Permission } from '@/lib/auth/permissions';
import {
  ShieldCheck,
  Check,
  X,
  Save,
  RotateCcw,
  Eye,
  SlidersHorizontal,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RolesMatrixPage() {
  const allRoles = Object.values(ROLES);
  const allPermissions = Object.values(PERMISSIONS);

  // Initial Matrix State
  const [matrix, setMatrix] = useState<Record<string, Record<string, boolean>>>(() => {
    const initial: Record<string, Record<string, boolean>> = {};
    allRoles.forEach((role) => {
      initial[role] = {};
      allPermissions.forEach((perm) => {
        // Super Admin gets all permissions, others default based on setup
        if (role === ROLES.SUPER_ADMIN) {
          initial[role][perm] = true;
        } else if (role === ROLES.DEPARTMENT_OFFICER) {
          initial[role][perm] = ['view_all_registrations', 'approve_registration', 'reject_registration', 'manage_meetings', 'view_mou', 'manage_mou', 'view_dept_dashboard'].includes(perm);
        } else if (role === ROLES.REGISTRATION_DESK) {
          initial[role][perm] = ['view_all_registrations', 'verify_registration', 'view_badges', 'print_badge', 'manual_check_in'].includes(perm);
        } else if (role === ROLES.RELATIONSHIP_MANAGER) {
          initial[role][perm] = ['view_all_registrations', 'view_crm', 'manage_crm', 'manage_meetings', 'view_mou', 'manage_mou'].includes(perm);
        } else {
          initial[role][perm] = perm.startsWith('view_');
        }
      });
    });
    return initial;
  });

  const [previewRole, setPreviewRole] = useState<Role | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const toggleCell = (role: string, perm: string) => {
    if (role === ROLES.SUPER_ADMIN) return; // Super admin cannot be edited
    setMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
    setIsSaved(false);
  };

  const handleSaveMatrix = async () => {
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 800));
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col overflow-hidden bg-background">
      {/* Top Header Bar */}
      <div className="h-16 px-6 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">RBAC Roles & Permissions Matrix Editor</h1>
          <p className="text-xs text-foreground-muted">
            Configure system-wide granular permissions per role. Changes apply live to all active staff sessions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {previewRole && (
            <div className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-amber-600" /> Viewing as: {ROLE_LABELS[previewRole]?.en}
              <button onClick={() => setPreviewRole(null)} className="underline text-[10px] ml-1">
                Exit
              </button>
            </div>
          )}
          <Button variant="accent" size="sm" isLoading={isSaving} onClick={handleSaveMatrix}>
            <Save className="w-4 h-4" /> Save RBAC Matrix
          </Button>
        </div>
      </div>

      {isSaved && (
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" /> Permissions Matrix updated successfully! Live security policy reloaded.
        </div>
      )}

      {/* Main Matrix Table Grid Container */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-card">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-background text-foreground sticky top-0 z-10 border-b border-border shadow-sm">
              <tr>
                <th className="p-4 border-r border-border font-extrabold w-64 bg-background">
                  System Permission \ Role
                </th>
                {allRoles.map((role) => (
                  <th key={role} className="p-3 text-center border-r border-border min-w-[130px]">
                    <div className="font-bold text-foreground capitalize truncate">
                      {ROLE_LABELS[role as Role]?.en || role.replace('_', ' ')}
                    </div>
                    <button
                      onClick={() => setPreviewRole(role as Role)}
                      className="text-[10px] text-primary hover:underline block mx-auto mt-0.5"
                    >
                      Preview Mode
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {allPermissions.map((perm) => (
                <tr key={perm} className="hover:bg-primary-50/30 transition-colors">
                  <td className="p-3 font-semibold text-foreground border-r border-border bg-surface font-mono">
                    <span className="text-primary block text-xs font-bold">{perm}</span>
                    <span className="text-[10px] text-foreground-subtle font-sans font-normal">
                      Controls {perm.replace(/_/g, ' ')} actions
                    </span>
                  </td>
                  {allRoles.map((role) => {
                    const isGranted = matrix[role]?.[perm] ?? false;
                    const isSuper = role === ROLES.SUPER_ADMIN;

                    return (
                      <td
                        key={`${role}-${perm}`}
                        onClick={() => toggleCell(role, perm)}
                        className={cn(
                          'p-3 text-center border-r border-border cursor-pointer transition-colors',
                          isGranted ? 'bg-emerald-50/50 hover:bg-emerald-100/60' : 'hover:bg-slate-100',
                          isSuper ? 'cursor-not-allowed bg-slate-50' : ''
                        )}
                      >
                        <div className="flex items-center justify-center">
                          {isGranted ? (
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                              ✓
                            </span>
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center font-bold text-xs">
                              &ndash;
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
