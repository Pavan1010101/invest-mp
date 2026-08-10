/**
 * SISMP — Departmental Officers & Staff Credential Store
 * Official credentials for all Sector Nodal Officers, Desk Staff, MPIDC Admin, Super Admin & CMO.
 * Persists accounts to server database file (`.data/officers.json`) via `/api/v1/officers`.
 */
import { ROLES, type Role } from './roles';

export interface DepartmentOfficerCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  department: string;
  sector: string;
  badgeRole: string;
  isCustom?: boolean;
  createdAt?: string;
}

export const DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS: DepartmentOfficerCredential[] = [
  {
    id: 'super-901',
    name: 'System Super Administrator',
    email: 'super.admin@mp.gov.in',
    password: 'SuperAdmin@MP2026!',
    role: ROLES.SUPER_ADMIN,
    department: 'State IT Infrastructure & Governance',
    sector: 'System Administration & Nodal Officers Management',
    badgeRole: 'Staff',
  },
  {
    id: 'off-101',
    name: 'Shri R. K. Vardhan (IAS)',
    email: 'industrial.policy@mp.gov.in',
    password: 'Officer@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of Industrial Policy & Investment Promotion',
    sector: 'Manufacturing',
    badgeRole: 'Government',
  },
  {
    id: 'off-102',
    name: 'Smt. Ananya Verma (IAS)',
    email: 'renewable.energy@mp.gov.in',
    password: 'Renewable@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of New & Renewable Energy',
    sector: 'Renewable Energy',
    badgeRole: 'Government',
  },
  {
    id: 'off-103',
    name: 'Shri Manoj Agarwal (IAS)',
    email: 'science.tech@mp.gov.in',
    password: 'SciTech@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of Science & Technology',
    sector: 'IT & Electronics',
    badgeRole: 'Government',
  },
  {
    id: 'off-104',
    name: 'Dr. S. K. Chouhan',
    email: 'pharma.health@mp.gov.in',
    password: 'Pharma@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of Public Health & Medical Education',
    sector: 'Pharma & Biotech',
    badgeRole: 'Government',
  },
  {
    id: 'off-105',
    name: 'Shri Rajesh Gupta',
    email: 'msme.dept@mp.gov.in',
    password: 'MSME@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'MP Micro, Small & Medium Enterprises (MSME)',
    sector: 'Agro & MSME',
    badgeRole: 'Government',
  },
  {
    id: 'off-106',
    name: 'Shri Vikram Singh',
    email: 'auto.industry@mp.gov.in',
    password: 'Auto@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of Automobile & Heavy Engineering',
    sector: 'Automobile',
    badgeRole: 'Government',
  },
  {
    id: 'off-107',
    name: 'Smt. Meenakshi Sharma',
    email: 'tourism.dept@mp.gov.in',
    password: 'Tourism@MP2026!',
    role: ROLES.DEPARTMENT_OFFICER,
    department: 'Department of Tourism & Culture',
    sector: 'Tourism',
    badgeRole: 'Government',
  },
  {
    id: 'desk-201',
    name: 'Main Registration Desk Officer',
    email: 'registration.desk@mp.gov.in',
    password: 'RegDesk@MP2026!',
    role: ROLES.REGISTRATION_DESK,
    department: 'On-Site Registration & Badge Operations',
    sector: 'Event Operations',
    badgeRole: 'Staff',
  },
  {
    id: 'sec-202',
    name: 'Security Gate Operations Lead',
    email: 'security.desk@mp.gov.in',
    password: 'Security@MP2026!',
    role: ROLES.SECURITY_STAFF,
    department: 'Hall Security & QR Audit Control',
    sector: 'Venue Security',
    badgeRole: 'Staff',
  },
  {
    id: 'rm-203',
    name: 'Senior Relationship Manager',
    email: 'relationship.mgr@mp.gov.in',
    password: 'RM@MP2026!',
    role: ROLES.RELATIONSHIP_MANAGER,
    department: 'Investor Relations & B2B Facilitation',
    sector: 'Investor Concierge',
    badgeRole: 'Staff',
  },
  {
    id: 'pav-204',
    name: 'Chief Pavilion & Exhibition Manager',
    email: 'pavilion.mgr@mp.gov.in',
    password: 'Pavilion@MP2026!',
    role: ROLES.PAVILION_MANAGER,
    department: 'Exhibition & Industry Stall Management',
    sector: 'Exhibition Hall',
    badgeRole: 'Staff',
  },
  {
    id: 'org-205',
    name: 'Summit Event Operations Controller',
    email: 'event.organizer@mp.gov.in',
    password: 'Organizer@MP2026!',
    role: ROLES.EVENT_ORGANIZER,
    department: 'Executive Event Control Room',
    sector: 'Summit Management',
    badgeRole: 'Staff',
  },
  {
    id: 'admin-201',
    name: 'MPIDC Chief Administrator',
    email: 'mpidc.admin@mp.gov.in',
    password: 'MPIDC@MP2026!',
    role: ROLES.MPIDC_ADMIN,
    department: 'MP Industrial Development Corporation',
    sector: 'All Sectors',
    badgeRole: 'Staff',
  },
  {
    id: 'cmo-301',
    name: 'Chief Minister Office Secretary',
    email: 'cmo.official@mp.gov.in',
    password: 'CMO@MP2026!',
    role: ROLES.CMO_OFFICIAL,
    department: 'Chief Minister\'s Office (CMO)',
    sector: 'Executive Overview',
    badgeRole: 'Government',
  },
];

export const DEPARTMENT_OFFICER_CREDENTIALS = DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS;

export interface ApprovedAttendeeCredential {
  registrationId: string;
  name: string;
  email: string;
  password: string;
  badgeRole: string;
  organization: string;
  sector: string;
}

export const APPROVED_ATTENDEE_CREDENTIALS: ApprovedAttendeeCredential[] = [
  {
    registrationId: 'IMP26-16070',
    name: 'Kapil Kurchaniya',
    email: 'kapilkurchaniya98@gmail.com',
    password: 'password (or MPGIS-16070)',
    badgeRole: 'Investor',
    organization: 'ASHTRABYTE',
    sector: 'IT & Electronics',
  },
  {
    registrationId: 'IMP26-84015',
    name: 'Kumar Mangalam Birla',
    email: 'v.birla@adityabirla.com',
    password: 'password (or MPGIS-84015)',
    badgeRole: 'VIP / Speaker',
    organization: 'Aditya Birla Group',
    sector: 'Manufacturing & Textiles',
  },
  {
    registrationId: 'IMP26-86323',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@tataservices.com',
    password: 'password (or MPGIS-86323)',
    badgeRole: 'Investor',
    organization: 'Tata Consultancy Services',
    sector: 'Information Technology & Electronics',
  },
  {
    registrationId: 'IMP26-00104',
    name: 'Sarah Jenkins',
    email: 's.jenkins@cleanenergy.uk',
    password: 'password (or MPGIS-00104)',
    badgeRole: 'Foreign Investor',
    organization: 'Global Clean Energy Partners UK',
    sector: 'Renewable Energy',
  },
  {
    registrationId: 'IMP26-00105',
    name: 'Vikram Mehta',
    email: 'vikram.m@agriplus.in',
    password: 'password (or MPGIS-00105)',
    badgeRole: 'Startup',
    organization: 'AgriPlus Innovations Pvt Ltd',
    sector: 'Agro & Food Processing',
  },
];

const STORAGE_KEY = 'sismp_custom_officers_list';

/**
 * Retrieves all officer credentials from server database file `.data/officers.json` (falling back to localStorage / defaults).
 */
export function getStoredOfficerCredentials(): DepartmentOfficerCredential[] {
  if (typeof window === 'undefined') return DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS;
  
  try {
    const rawLocal = localStorage.getItem(STORAGE_KEY);
    const localList: DepartmentOfficerCredential[] = rawLocal ? JSON.parse(rawLocal) : [];

    const existingEmails = new Set(DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS.map((c) => c.email.toLowerCase()));
    const validLocal = localList.filter((c) => !existingEmails.has(c.email.toLowerCase()));

    return [...DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS, ...validLocal];
  } catch {
    return DEFAULT_DEPARTMENT_OFFICER_CREDENTIALS;
  }
}

/**
 * Saves a new Sector Nodal Officer or Staff Account directly to server database (`.data/officers.json`).
 */
export async function addOfficerCredentialAsync(newOfficer: Omit<DepartmentOfficerCredential, 'id' | 'isCustom' | 'createdAt'>): Promise<DepartmentOfficerCredential> {
  const created: DepartmentOfficerCredential = {
    ...newOfficer,
    id: `off-${Math.floor(1000 + Math.random() * 9000)}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  // 1. Post to REST API for server disk persistence (.data/officers.json)
  try {
    await fetch('/api/v1/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    });
  } catch (err) {
    console.warn('API officer save notice:', err);
  }

  // 2. Save to client storage backup
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const customList: DepartmentOfficerCredential[] = raw ? JSON.parse(raw) : [];
      customList.push(created);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customList));
    } catch (err) {
      console.error('Failed to save officer credential locally:', err);
    }
  }

  return created;
}

export function addOfficerCredential(newOfficer: Omit<DepartmentOfficerCredential, 'id' | 'isCustom' | 'createdAt'>): DepartmentOfficerCredential {
  const created: DepartmentOfficerCredential = {
    ...newOfficer,
    id: `off-${Math.floor(1000 + Math.random() * 9000)}`,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  // Fire async API call to save on disk
  if (typeof window !== 'undefined') {
    fetch('/api/v1/officers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(created),
    }).catch((e) => console.warn('Disk officer save warning:', e));

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const customList: DepartmentOfficerCredential[] = raw ? JSON.parse(raw) : [];
      customList.push(created);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customList));
    } catch (err) {
      console.error('Failed to save officer credential locally:', err);
    }
  }

  return created;
}

/**
 * Removes a custom officer account from server database file and local backup.
 */
export function deleteOfficerCredential(id: string): void {
  if (typeof window === 'undefined') return;

  // 1. Send DELETE to server API
  fetch(`/api/v1/officers?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch((e) => console.warn('Disk officer delete warning:', e));

  // 2. Remove from local backup
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const customList: DepartmentOfficerCredential[] = JSON.parse(raw);
    const updated = customList.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete officer credential:', err);
  }
}
