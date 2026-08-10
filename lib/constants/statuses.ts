/**
 * SISMP — BRD Status Vocabulary
 * Single source of truth for all status labels, colors, and icons.
 * Every StatusBadge in the app references this file.
 * DO NOT invent synonyms — these match the BRD exactly.
 */

export const REGISTRATION_STATUSES = {
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  RESUBMIT: 'Resubmit',
} as const;

export const CRM_STATUSES = {
  NEW: 'New',
  IN_DISCUSSION: 'In Discussion',
  COMMITTED: 'Committed',
  INVESTED: 'Invested',
  CLOSED: 'Closed',
} as const;

export const MOU_STATUSES = {
  DRAFT: 'Draft',
  PENDING_SIGNATURES: 'Pending Signatures',
  SIGNED: 'Signed',
  EXECUTED: 'Executed',
} as const;

export const STALL_STATUSES = {
  AVAILABLE: 'Available',
  ALLOCATED: 'Allocated',
  SETUP_IN_PROGRESS: 'Setup In Progress',
  READY: 'Ready',
} as const;

export const MEETING_STATUSES = {
  REQUESTED: 'Requested',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
} as const;

export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[keyof typeof REGISTRATION_STATUSES];
export type CRMStatus = (typeof CRM_STATUSES)[keyof typeof CRM_STATUSES];
export type MoUStatus = (typeof MOU_STATUSES)[keyof typeof MOU_STATUSES];
export type StallStatus = (typeof STALL_STATUSES)[keyof typeof STALL_STATUSES];
export type MeetingStatus = (typeof MEETING_STATUSES)[keyof typeof MEETING_STATUSES];

/** Color mapping: className → Tailwind token names for each status */
export const STATUS_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  // Registration statuses
  [REGISTRATION_STATUSES.SUBMITTED]: {
    text: 'text-status-submitted',
    bg: 'bg-status-submitted-bg',
    border: 'border-status-submitted',
  },
  [REGISTRATION_STATUSES.APPROVED]: {
    text: 'text-status-approved',
    bg: 'bg-status-approved-bg',
    border: 'border-status-approved',
  },
  [REGISTRATION_STATUSES.REJECTED]: {
    text: 'text-status-rejected',
    bg: 'bg-status-rejected-bg',
    border: 'border-status-rejected',
  },
  [REGISTRATION_STATUSES.RESUBMIT]: {
    text: 'text-status-resubmit',
    bg: 'bg-status-resubmit-bg',
    border: 'border-status-resubmit',
  },
  // CRM statuses
  [CRM_STATUSES.NEW]: {
    text: 'text-crm-new',
    bg: 'bg-crm-new-bg',
    border: 'border-crm-new',
  },
  [CRM_STATUSES.IN_DISCUSSION]: {
    text: 'text-crm-discussion',
    bg: 'bg-crm-discussion-bg',
    border: 'border-crm-discussion',
  },
  [CRM_STATUSES.COMMITTED]: {
    text: 'text-crm-committed',
    bg: 'bg-crm-committed-bg',
    border: 'border-crm-committed',
  },
  [CRM_STATUSES.INVESTED]: {
    text: 'text-crm-invested',
    bg: 'bg-crm-invested-bg',
    border: 'border-crm-invested',
  },
  [CRM_STATUSES.CLOSED]: {
    text: 'text-crm-closed',
    bg: 'bg-crm-closed-bg',
    border: 'border-crm-closed',
  },
};

/** Badge role types and their fixed colors per BRD */
export const BADGE_ROLES = {
  INVESTOR: 'Investor',
  GOVERNMENT: 'Government',
  MEDIA: 'Media',
  DELEGATE: 'Delegate',
  STARTUP: 'Startup',
  STAFF: 'Staff',
} as const;

export type BadgeRole = (typeof BADGE_ROLES)[keyof typeof BADGE_ROLES];

export const BADGE_ROLE_COLORS: Record<string, { text: string; bg: string }> = {
  [BADGE_ROLES.INVESTOR]: { text: 'text-badge-investor', bg: 'bg-badge-investor-bg' },
  [BADGE_ROLES.GOVERNMENT]: { text: 'text-badge-government', bg: 'bg-badge-government-bg' },
  [BADGE_ROLES.MEDIA]: { text: 'text-badge-media', bg: 'bg-badge-media-bg' },
  [BADGE_ROLES.DELEGATE]: { text: 'text-badge-delegate', bg: 'bg-badge-delegate-bg' },
  [BADGE_ROLES.STARTUP]: { text: 'text-badge-startup', bg: 'bg-badge-startup-bg' },
  [BADGE_ROLES.STAFF]: { text: 'text-badge-staff', bg: 'bg-badge-staff-bg' },
};

/** Registration types for the public portal */
export const REGISTRATION_TYPES = {
  INVESTOR: 'investor',
  DELEGATE: 'delegate',
  FOREIGN_INVESTOR: 'foreign-investor',
  STARTUP: 'startup',
  DEPARTMENT_VISITOR: 'department-visitor',
} as const;

export type RegistrationType = (typeof REGISTRATION_TYPES)[keyof typeof REGISTRATION_TYPES];

export const REGISTRATION_TYPE_LABELS: Record<string, { en: string; hi: string; description: string }> = {
  [REGISTRATION_TYPES.INVESTOR]: {
    en: 'Investor',
    hi: 'निवेशक',
    description: 'Domestic companies looking to invest in Madhya Pradesh',
  },
  [REGISTRATION_TYPES.DELEGATE]: {
    en: 'Delegate',
    hi: 'प्रतिनिधि',
    description: 'Industry representatives and delegates',
  },
  [REGISTRATION_TYPES.FOREIGN_INVESTOR]: {
    en: 'Foreign Investor',
    hi: 'विदेशी निवेशक',
    description: 'International investors and businesses',
  },
  [REGISTRATION_TYPES.STARTUP]: {
    en: 'Startup',
    hi: 'स्टार्टअप',
    description: 'Registered startups looking for investment opportunities',
  },
  [REGISTRATION_TYPES.DEPARTMENT_VISITOR]: {
    en: 'Department Visitor',
    hi: 'विभागीय आगंतुक',
    description: 'Government department officials and visitors',
  },
};
