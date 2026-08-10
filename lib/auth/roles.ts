/**
 * SISMP — RBAC Role Definitions
 * Matches the roles described in the BRD exactly.
 */

export const ROLES = {
  // Public (unauthenticated or self-registered)
  PUBLIC: 'public',

  // Authenticated attendee roles
  INVESTOR: 'investor',
  DELEGATE: 'delegate',
  FOREIGN_INVESTOR: 'foreign_investor',
  STARTUP: 'startup',
  DEPARTMENT_VISITOR: 'department_visitor',

  // Staff roles
  DEPARTMENT_OFFICER: 'department_officer',
  REGISTRATION_DESK: 'registration_desk',
  RELATIONSHIP_MANAGER: 'relationship_manager',
  PAVILION_MANAGER: 'pavilion_manager',
  EVENT_ORGANIZER: 'event_organizer',
  SECURITY_STAFF: 'security_staff',

  // Admin roles
  MPIDC_ADMIN: 'mpidc_admin',
  SUPER_ADMIN: 'super_admin',

  // Executive (read-only dashboards)
  CMO_OFFICIAL: 'cmo_official',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, { en: string; hi: string }> = {
  [ROLES.PUBLIC]: { en: 'Public', hi: 'सार्वजनिक' },
  [ROLES.INVESTOR]: { en: 'Investor', hi: 'निवेशक' },
  [ROLES.DELEGATE]: { en: 'Delegate', hi: 'प्रतिनिधि' },
  [ROLES.FOREIGN_INVESTOR]: { en: 'Foreign Investor', hi: 'विदेशी निवेशक' },
  [ROLES.STARTUP]: { en: 'Startup', hi: 'स्टार्टअप' },
  [ROLES.DEPARTMENT_VISITOR]: { en: 'Department Visitor', hi: 'विभागीय आगंतुक' },
  [ROLES.DEPARTMENT_OFFICER]: { en: 'Department Officer', hi: 'विभागीय अधिकारी' },
  [ROLES.REGISTRATION_DESK]: { en: 'Registration Desk', hi: 'पंजीकरण डेस्क' },
  [ROLES.RELATIONSHIP_MANAGER]: { en: 'Relationship Manager', hi: 'संबंध प्रबंधक' },
  [ROLES.PAVILION_MANAGER]: { en: 'Pavilion Manager', hi: 'पैवेलियन प्रबंधक' },
  [ROLES.EVENT_ORGANIZER]: { en: 'Event Organizer', hi: 'कार्यक्रम आयोजक' },
  [ROLES.SECURITY_STAFF]: { en: 'Security Staff', hi: 'सुरक्षा कर्मी' },
  [ROLES.MPIDC_ADMIN]: { en: 'MPIDC Admin', hi: 'एमपीआईडीसी प्रशासक' },
  [ROLES.SUPER_ADMIN]: { en: 'Super Admin', hi: 'सुपर प्रशासक' },
  [ROLES.CMO_OFFICIAL]: { en: 'CMO Official', hi: 'सीएमओ अधिकारी' },
};
