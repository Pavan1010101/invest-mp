/**
 * SISMP — StatusBadge Component
 * Renders BRD-compliant status labels with correct colors.
 * Always references the status constants — never accepts arbitrary color props.
 */
import React from 'react';
import { cn } from '@/lib/utils';
import {
  REGISTRATION_STATUSES,
  CRM_STATUSES,
  MOU_STATUSES,
  MEETING_STATUSES,
  STALL_STATUSES,
} from '@/lib/constants/statuses';

type AllStatuses =
  | (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES]
  | (typeof CRM_STATUSES)[keyof typeof CRM_STATUSES]
  | (typeof MOU_STATUSES)[keyof typeof MOU_STATUSES]
  | (typeof MEETING_STATUSES)[keyof typeof MEETING_STATUSES]
  | (typeof STALL_STATUSES)[keyof typeof STALL_STATUSES];

interface StatusBadgeProps {
  status: AllStatuses | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

/** Maps status labels to their exact semantic colors */
const STATUS_STYLE_MAP: Record<string, { text: string; bg: string; dot: string }> = {
  // Registration
  'Submitted': { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  'Approved': { text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Rejected': { text: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500' },
  'Resubmit': { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  // CRM
  'New': { text: 'text-slate-700', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  'In Discussion': { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  'Committed': { text: 'text-indigo-700', bg: 'bg-indigo-50', dot: 'bg-indigo-500' },
  'Invested': { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  'Closed': { text: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  // MoU
  'Draft': { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  'Pending Signatures': { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'Signed': { text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Executed': { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  // Meeting
  'Requested': { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  'Confirmed': { text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Completed': { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
  'Cancelled': { text: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-400' },
  'Expired': { text: 'text-slate-500', bg: 'bg-slate-100', dot: 'bg-slate-400' },
  // Stall
  'Available': { text: 'text-green-700', bg: 'bg-green-50', dot: 'bg-green-500' },
  'Allocated': { text: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  'Setup In Progress': { text: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500' },
  'Ready': { text: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
};

const DEFAULT_STYLE = { text: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400' };

export function StatusBadge({ status, size = 'md', showDot = true, className }: StatusBadgeProps) {
  const style = STATUS_STYLE_MAP[status] ?? DEFAULT_STYLE;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full whitespace-nowrap',
        style.text,
        style.bg,
        size === 'sm' && 'text-xs px-2 py-0.5',
        size === 'md' && 'text-sm px-3 py-1',
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
      )}
      {status}
    </span>
  );
}
