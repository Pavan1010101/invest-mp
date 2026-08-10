/**
 * SISMP — CRM, MoU, Pavilion & Events Mock Data Store
 * Powers Phase 3 Advanced Staff Screens.
 */

import { CRM_STATUSES, MOU_STATUSES, STALL_STATUSES } from '@/lib/constants/statuses';

export interface CRMInvestorRecord {
  id: string;
  registrationId?: string;
  investorName: string;
  companyName: string;
  email: string;
  phone: string;
  sector: string;
  country: string;
  department: string;
  relationshipManager: string;
  status: string; // New | In Discussion | Committed | Invested | Closed
  proposedInvestmentINR: number;
  expectedEmployment: number;
  lastContactDate: string;
  isEscalated: boolean;
  escalationReason?: string;

  // 360 Degree Profile Details
  communications: {
    id: string;
    type: 'email' | 'call' | 'meeting' | 'site_visit';
    summary: string;
    loggedBy: string;
    loggedAt: string;
  }[];

  tasks: {
    id: string;
    title: string;
    dueDate: string;
    priority: 'low' | 'medium' | 'high';
    isCompleted: boolean;
  }[];

  siteVisits: {
    id: string;
    locationName: string;
    visitDate: string;
    conductedBy: string;
    notes: string;
    attachmentsCount: number;
  }[];
}

export interface MoURecord {
  id: string;
  applicantId: string;
  mouTitle: string;
  investorName: string;
  companyName: string;
  departmentName: string;
  proposedInvestmentINR: number;
  estimatedJobs: number;
  sector: string;
  status: string; // Draft | Pending Signatures | Signed | Executed
  investorSigned: boolean;
  investorSignedAt?: string;
  targetSigned: boolean;
  targetSignedAt?: string;
  departmentSigned: boolean;
  departmentSignedAt?: string;
  draftUrl: string;
  createdDate: string;
  
  // P2P Fields (when generated from a meeting)
  meetingId?: string;
  targetId?: string;
  targetName?: string;
}

export interface StallRecord {
  id: string;
  stallNumber: string;
  hallName: string;
  sizeSqM: number;
  allocatedTo?: string;
  companyName?: string;
  status: string; // Available | Allocated | Setup In Progress | Ready
  powerReqKW: number;
  wifiNeeded: boolean;
  specialRequests?: string;
}

export interface StallAllocationRequest {
  id: string;
  applicantName: string;
  companyName: string;
  requestedHall: string;
  preferredStallNumber: string;
  sector: string;
  powerRequirementKW: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface AgendaSession {
  id: string;
  title: string;
  track: string;
  day: string;
  startTime: string;
  endTime: string;
  hallName: string;
  speakers: { name: string; title: string; company: string }[];
  isPublished: boolean;
}

export const MOCK_CRM_INVESTORS: CRMInvestorRecord[] = [
  {
    id: 'CRM-1001',
    registrationId: 'IMP26-84015',
    investorName: 'Vikramaditya Birla',
    companyName: 'Grasim Industries Ltd.',
    email: 'v.birla@adityabirla.com',
    phone: '+91 98200 12345',
    sector: 'Manufacturing',
    country: 'India',
    department: 'Department of Industrial Policy & Investment Promotion',
    relationshipManager: 'Smt. Radhika Mehta (RM-04)',
    status: CRM_STATUSES.COMMITTED,
    proposedInvestmentINR: 25000000000, // ₹2,500 Cr
    expectedEmployment: 4500,
    lastContactDate: '2026-02-04T11:30:00Z',
    isEscalated: false,
    communications: [
      {
        id: 'comm-1',
        type: 'meeting',
        summary: 'Met at Bhopal VIP Lounge. Discussed land allocation in Pithampur Sector 3.',
        loggedBy: 'Radhika Mehta',
        loggedAt: '2026-02-04T11:30:00Z',
      },
      {
        id: 'comm-2',
        type: 'site_visit',
        summary: 'Pithampur industrial site visit completed with District Collector.',
        loggedBy: 'Radhika Mehta',
        loggedAt: '2026-01-28T14:00:00Z',
      },
    ],
    tasks: [
      { id: 't-1', title: 'Send revised land subsidy policy notification PDF', dueDate: '2026-02-06', priority: 'high', isCompleted: false },
      { id: 't-2', title: 'Schedule follow-up call with Pollution Control Board', dueDate: '2026-02-08', priority: 'medium', isCompleted: true },
    ],
    siteVisits: [
      {
        id: 'sv-1',
        locationName: 'Pithampur Smart Industrial Park (500 Acres)',
        visitDate: '2026-01-28',
        conductedBy: 'Dist Collector & MPIDC Manager',
        notes: 'Water pipeline connectivity & 220kV power substation inspected.',
        attachmentsCount: 4,
      },
    ],
  },
  {
    id: 'CRM-1002',
    registrationId: 'IMP26-00104',
    investorName: 'Sarah Jenkins',
    companyName: 'Vestas Wind Systems A/S',
    email: 's.jenkins@vestas.com',
    phone: '+44 7700 900077',
    sector: 'Renewable Energy',
    country: 'United Kingdom',
    department: 'Department of New & Renewable Energy',
    relationshipManager: 'Shri Amit Sen (RM-02)',
    status: CRM_STATUSES.IN_DISCUSSION,
    proposedInvestmentINR: 42000000000, // ₹4,200 Cr
    expectedEmployment: 3200,
    lastContactDate: '2026-01-25T09:15:00Z',
    isEscalated: true,
    escalationReason: 'Overdue task: Grid connectivity feasibility report pending department approval >7 days',
    communications: [
      {
        id: 'comm-3',
        type: 'call',
        summary: 'Discussed green energy transmission tariff structures and wheeling charges.',
        loggedBy: 'Amit Sen',
        loggedAt: '2026-01-25T09:15:00Z',
      },
    ],
    tasks: [
      { id: 't-3', title: 'Escalate grid feasibility clearance to Energy Secretary', dueDate: '2026-01-30', priority: 'high', isCompleted: false },
    ],
    siteVisits: [],
  },
  {
    id: 'CRM-1003',
    investorName: 'Michael Chen',
    companyName: 'Foxconn Electronics Technology',
    email: 'm.chen@foxconn.tw',
    phone: '+886 912 345 678',
    sector: 'IT & Electronics',
    country: 'Taiwan',
    department: 'Department of Science & Technology',
    relationshipManager: 'Shri Amit Sen (RM-02)',
    status: CRM_STATUSES.INVESTED,
    proposedInvestmentINR: 65000000000, // ₹6,500 Cr
    expectedEmployment: 12000,
    lastContactDate: '2026-02-03T16:45:00Z',
    isEscalated: false,
    communications: [
      {
        id: 'comm-4',
        type: 'meeting',
        summary: 'MoU signed & land allotment letter issued for Mandideep Electronics Cluster.',
        loggedBy: 'Amit Sen',
        loggedAt: '2026-02-03T16:45:00Z',
      },
    ],
    tasks: [
      { id: 't-4', title: 'Coordinate foundation ceremony press release', dueDate: '2026-02-12', priority: 'medium', isCompleted: false },
    ],
    siteVisits: [
      {
        id: 'sv-2',
        locationName: 'Mandideep Electronics Zone Hub A',
        visitDate: '2026-01-15',
        conductedBy: 'MD MPIDC & Tech Mission Director',
        notes: 'High-speed optical fiber backbone verified.',
        attachmentsCount: 6,
      },
    ],
  },
];

export const MOCK_MOUS: MoURecord[] = [
  {
    id: 'MOU-2026-001',
    applicantId: 'IMP26-84015',
    mouTitle: 'Strategic Investment in Green Energy Manufacturing',
    investorName: 'Vikramaditya Birla',
    companyName: 'Grasim Industries Ltd.',
    departmentName: 'Department of Industrial Policy & Investment Promotion',
    proposedInvestmentINR: 25000000000,
    estimatedJobs: 4500,
    sector: 'Manufacturing',
    status: MOU_STATUSES.PENDING_SIGNATURES,
    investorSigned: true,
    investorSignedAt: '2026-02-04T18:30:00Z',
    targetSigned: false, // Target signature pending
    departmentSigned: false, // Department signature still pending!
    draftUrl: '#',
    createdDate: '2026-01-30',
  },
  {
    id: 'MOU-2026-002',
    applicantId: 'IMP26-99120',
    mouTitle: 'Semiconductor OSAT & Electronics Manufacturing Hub',
    investorName: 'Michael Chen',
    companyName: 'Foxconn Electronics Technology',
    departmentName: 'Department of Science & Technology',
    proposedInvestmentINR: 65000000000,
    estimatedJobs: 12000,
    sector: 'IT & Electronics',
    status: MOU_STATUSES.EXECUTED,
    investorSigned: true,
    investorSignedAt: '2026-02-02T10:15:00Z',
    targetSigned: true,
    targetSignedAt: '2026-02-02T15:30:00Z',
    departmentSigned: true,
    departmentSignedAt: '2026-02-03T11:00:00Z',
    draftUrl: '#',
    createdDate: '2026-01-20',
  },
  {
    id: 'MOU-2026-003',
    applicantId: 'IMP26-11234',
    mouTitle: 'Logistics Park and Inland Container Depot Development',
    investorName: 'Sarah Jenkins',
    companyName: 'Vestas Wind Systems A/S',
    departmentName: 'Department of New & Renewable Energy',
    proposedInvestmentINR: 42000000000,
    estimatedJobs: 3200,
    sector: 'Renewable Energy',
    status: MOU_STATUSES.DRAFT,
    investorSigned: false,
    targetSigned: false,
    departmentSigned: false,
    draftUrl: '#',
    createdDate: '2026-02-01',
  },
];

export const MOCK_STALLS: StallRecord[] = [
  { id: 'ST-01', stallNumber: 'A-101', hallName: 'Hall A (Manufacturing)', sizeSqM: 100, allocatedTo: 'CRM-1001', companyName: 'Grasim Industries Ltd.', status: STALL_STATUSES.READY, powerReqKW: 50, wifiNeeded: true },
  { id: 'ST-02', stallNumber: 'A-102', hallName: 'Hall A (Manufacturing)', sizeSqM: 75, allocatedTo: undefined, companyName: undefined, status: STALL_STATUSES.AVAILABLE, powerReqKW: 30, wifiNeeded: true },
  { id: 'ST-03', stallNumber: 'B-201', hallName: 'Hall B (IT & Innovation)', sizeSqM: 150, allocatedTo: 'CRM-1003', companyName: 'Foxconn Electronics', status: STALL_STATUSES.SETUP_IN_PROGRESS, powerReqKW: 120, wifiNeeded: true, specialRequests: 'Cleanroom demo enclosure setup' },
  { id: 'ST-04', stallNumber: 'B-202', hallName: 'Hall B (IT & Innovation)', sizeSqM: 50, allocatedTo: 'CRM-1007', companyName: 'GreenCharge Mobility', status: STALL_STATUSES.ALLOCATED, powerReqKW: 25, wifiNeeded: true },
  { id: 'ST-05', stallNumber: 'C-301', hallName: 'Hall C (Renewable Energy)', sizeSqM: 120, allocatedTo: undefined, companyName: undefined, status: STALL_STATUSES.AVAILABLE, powerReqKW: 40, wifiNeeded: false },
];

export const MOCK_ALLOCATION_REQUESTS: StallAllocationRequest[] = [
  { id: 'REQ-501', applicantName: 'Dr. Anita Roy', companyName: 'Lupin Pharmaceuticals Ltd.', requestedHall: 'Hall A', preferredStallNumber: 'A-102', sector: 'Pharma', powerRequirementKW: 35, requestDate: '2026-02-03', status: 'Pending' },
  { id: 'REQ-502', applicantName: 'Sarah Jenkins', companyName: 'Vestas Wind Systems', requestedHall: 'Hall C', preferredStallNumber: 'C-301', sector: 'Renewable Energy', powerRequirementKW: 40, requestDate: '2026-02-04', status: 'Pending' },
];

export const MOCK_AGENDA_SESSIONS: AgendaSession[] = [
  {
    id: 'SESS-01',
    title: 'Inaugural Plenary & Keynote Address by Hon’ble Chief Minister',
    track: 'Plenary',
    day: 'Day 1 (Feb 24)',
    startTime: '09:30 AM',
    endTime: '11:00 AM',
    hallName: 'Grand Plenary Auditorium A',
    speakers: [
      { name: 'Hon’ble Chief Minister', title: 'Head of Government', company: 'Government of Madhya Pradesh' },
      { name: 'Shri Vikramaditya Birla', title: 'Chairman', company: 'Aditya Birla Group' },
    ],
    isPublished: true,
  },
  {
    id: 'SESS-02',
    title: 'Global Renewable Energy & Green Hydrogen Investment Opportunities',
    track: 'Sector Roundtable',
    day: 'Day 1 (Feb 24)',
    startTime: '11:30 AM',
    endTime: '01:00 PM',
    hallName: 'Renewable Energy Hall B',
    speakers: [
      { name: 'Sarah Jenkins', title: 'VP Strategy', company: 'Vestas Wind Systems' },
      { name: 'Principal Secretary Energy', title: 'IAS Officer', company: 'Dept of Renewable Energy' },
    ],
    isPublished: true,
  },
  {
    id: 'SESS-03',
    title: 'Semiconductor & Electronics Manufacturing Ecosystem in MP',
    track: 'Tech & Electronics',
    day: 'Day 2 (Feb 25)',
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    hallName: 'Tech Innovation Hall C',
    speakers: [
      { name: 'Michael Chen', title: 'VP Supply Chain', company: 'Foxconn Electronics' },
    ],
    isPublished: false, // Draft session
  },
];
