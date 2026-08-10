/**
 * SISMP — Staff Mock Data Store
 * Provides realistic dataset for Approvals Queue, On-site Verification & Badges, and B2G Meetings.
 */
import { REGISTRATION_STATUSES, BADGE_ROLES } from '@/lib/constants/statuses';

export interface StaffRegistrationRecord {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  designation: string;
  organization: string;
  type: string;
  badgeRole: string;
  sector: string;
  country: string;
  state: string;
  department: string;
  status: string;
  submittedAt: string;
  investmentInterestINR: number;
  documents: { id: string; name: string; type: string; url: string; verified: boolean }[];
  delegates: { id: string; name: string; designation: string; email: string }[];
  notes?: string;
  rejectionReason?: string;
  resubmitReason?: string;
}

export interface MeetingRequest {
  id: string;
  investorName: string;
  companyName: string;
  departmentName: string;
  officerName: string;
  requestedDate: string;
  timeSlot: string; // e.g. "10:00 AM - 10:45 AM"
  roomId: string;
  roomName: string;
  status: 'Requested' | 'Accepted' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Expired';
  expiresAt: string; // ISO 24h expiration timestamp
  createdAt: string; // ISO creation timestamp for sorting
  notes?: string;
}

export const MOCK_REGISTRATION_RECORDS: StaffRegistrationRecord[] = [
  {
    id: 'IMP26-60557',
    applicantName: 'Summit Delegate',
    email: 'delegate.60557@investmp.gov.in',
    phone: '+91 98110 60557',
    designation: 'Executive Director',
    organization: 'Global Infrastructure Corp',
    type: 'Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'Infrastructure & Urban Development',
    country: 'India',
    state: 'Madhya Pradesh',
    department: 'Department of Urban Development & Housing',
    status: REGISTRATION_STATUSES.SUBMITTED,
    submittedAt: '2026-02-05T15:45:00Z',
    investmentInterestINR: 3500000000, // ₹350 Cr
    documents: [
      { id: 'doc-60557-1', name: 'Global_Infra_Registration.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [],
    notes: 'Proposing Smart City commercial complex in Bhopal.',
  },
  {
    id: 'IMP26-39324',
    applicantName: 'Pawan Kurchaniya',
    email: 'pawan.kurchaniya@mp.gov.in',
    phone: '+91 98260 39324',
    designation: 'Managing Director & Founder',
    organization: 'MP Innovation & Tech Enterprises Ltd.',
    type: 'Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'Information Technology & Electronics',
    country: 'India',
    state: 'Madhya Pradesh',
    department: 'Department of Science & Technology',
    status: REGISTRATION_STATUSES.SUBMITTED,
    submittedAt: '2026-02-05T14:20:00Z',
    investmentInterestINR: 1500000000, // ₹150 Cr
    documents: [
      { id: 'doc-39324-1', name: 'MP_Innovation_Tech_MOA.pdf', type: 'PDF', url: '#', verified: true },
      { id: 'doc-39324-2', name: 'Board_Resolution_TechPark.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [
      { id: 'del-39324-1', name: 'Sanjay Verma', designation: 'Chief Technology Officer', email: 'sanjay.verma@mptech.com' },
    ],
    notes: 'Proposing 50-acre AI & Software Development Park near Super Corridor Indore.',
  },
  {
    id: 'IMP26-00104',
    applicantName: 'Vikramaditya Birla',
    email: 'v.birla@adityabirla.com',
    phone: '+91 98200 12345',
    designation: 'Managing Director & CEO',
    organization: 'Grasim Industries Ltd.',
    type: 'Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'Manufacturing',
    country: 'India',
    state: 'Madhya Pradesh',
    department: 'Department of Industrial Policy & Investment Promotion',
    status: REGISTRATION_STATUSES.SUBMITTED,
    submittedAt: '2026-02-05T09:30:00Z',
    investmentInterestINR: 25000000000, // ₹2,500 Cr
    documents: [
      { id: 'doc-1', name: 'Grasim_MOA_AOA.pdf', type: 'PDF', url: '#', verified: true },
      { id: 'doc-2', name: 'Board_Resolution_Investment.pdf', type: 'PDF', url: '#', verified: true },
      { id: 'doc-3', name: 'PAN_GST_Certificate.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [
      { id: 'del-1', name: 'Rajesh Shah', designation: 'VP Corporate Affairs', email: 'r.shah@adityabirla.com' },
      { id: 'del-2', name: 'Priya Nambiar', designation: 'General Manager Projects', email: 'p.nambiar@adityabirla.com' },
    ],
    notes: 'Interested in setting up a mega textile and chemical processing facility near Pithampur.',
  },
  {
    id: 'IMP26-00105',
    applicantName: 'Sarah Jenkins',
    email: 's.jenkins@suzlon.com',
    phone: '+44 7700 900077',
    designation: 'Head of Global Expansion',
    organization: 'Vestas Wind Systems A/S',
    type: 'Foreign Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'Renewable Energy',
    country: 'United Kingdom',
    state: 'London',
    department: 'Department of New & Renewable Energy',
    status: REGISTRATION_STATUSES.SUBMITTED,
    submittedAt: '2026-02-05T11:15:00Z',
    investmentInterestINR: 42000000000, // ₹4,200 Cr
    documents: [
      { id: 'doc-4', name: 'Vestas_Certificate_Incorporation.pdf', type: 'PDF', url: '#', verified: true },
      { id: 'doc-5', name: 'Passport_Copy_SarahJenkins.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [
      { id: 'del-3', name: 'Hans Meier', designation: 'Chief Technical Officer', email: 'h.meier@vestas.com' },
    ],
    notes: 'Proposing 1.2GW wind-solar hybrid energy park in Malwa region.',
  },
  {
    id: 'IMP26-00106',
    applicantName: 'Dr. Anita Roy',
    email: 'anita.roy@lupin.com',
    phone: '+91 99301 44556',
    designation: 'Executive Vice President R&D',
    organization: 'Lupin Pharmaceuticals Ltd.',
    type: 'Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'Pharma & Biotech',
    country: 'India',
    state: 'Maharashtra',
    department: 'Department of Public Health & Medical Education',
    status: REGISTRATION_STATUSES.RESUBMIT,
    submittedAt: '2026-02-04T16:20:00Z',
    investmentInterestINR: 8500000000, // ₹850 Cr
    resubmitReason: 'Please re-upload a clearer scanned copy of the Board Resolution letter.',
    documents: [
      { id: 'doc-6', name: 'Lupin_Registration_Doc.pdf', type: 'PDF', url: '#', verified: false },
    ],
    delegates: [],
  },
  {
    id: 'IMP26-00107',
    applicantName: 'Aarav Sharma',
    email: 'aarav@greenmobility.io',
    phone: '+91 98112 33445',
    designation: 'Co-Founder & CEO',
    organization: 'GreenCharge Mobility Pvt Ltd',
    type: 'Startup',
    badgeRole: BADGE_ROLES.STARTUP,
    sector: 'Automobile',
    country: 'India',
    state: 'Madhya Pradesh',
    department: 'MP Micro, Small & Medium Enterprises (MSME)',
    status: REGISTRATION_STATUSES.APPROVED,
    submittedAt: '2026-02-03T14:10:00Z',
    investmentInterestINR: 350000000, // ₹35 Cr
    documents: [
      { id: 'doc-7', name: 'DPIIT_Recognition_Certificate.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [
      { id: 'del-4', name: 'Kavita Singh', designation: 'Co-Founder & CTO', email: 'kavita@greenmobility.io' },
    ],
  },
  {
    id: 'IMP26-00108',
    applicantName: 'Michael Chen',
    email: 'm.chen@foxconn.tw',
    phone: '+886 912 345 678',
    designation: 'VP Supply Chain India Strategy',
    organization: 'Foxconn Electronics Technology',
    type: 'Foreign Investor',
    badgeRole: BADGE_ROLES.INVESTOR,
    sector: 'IT & Electronics',
    country: 'Taiwan',
    state: 'Taipei',
    department: 'Department of Science & Technology',
    status: REGISTRATION_STATUSES.APPROVED,
    submittedAt: '2026-02-02T10:00:00Z',
    investmentInterestINR: 65000000000, // ₹6,500 Cr
    documents: [
      { id: 'doc-8', name: 'Foxconn_India_MoU_Draft.pdf', type: 'PDF', url: '#', verified: true },
    ],
    delegates: [],
  },
  {
    id: 'IMP26-00109',
    applicantName: 'Rajeev Singhania',
    email: 'rsinghania@mediastart.in',
    phone: '+91 98100 99887',
    designation: 'Chief Bureau Correspondent',
    organization: 'Economic Times & Business Standard',
    type: 'Delegate',
    badgeRole: BADGE_ROLES.MEDIA,
    sector: 'Media & Communications',
    country: 'India',
    state: 'Delhi',
    department: 'Department of Public Relations',
    status: REGISTRATION_STATUSES.REJECTED,
    submittedAt: '2026-02-01T12:00:00Z',
    rejectionReason: 'Press accreditation card expired and could not be verified by PR department.',
    investmentInterestINR: 0,
    documents: [
      { id: 'doc-9', name: 'Press_Card_Scan.pdf', type: 'PDF', url: '#', verified: false },
    ],
    delegates: [],
  },
];

export const MOCK_MEETING_REQUESTS: MeetingRequest[] = [
  {
    id: 'MTG-801',
    investorName: 'Vikramaditya Birla',
    companyName: 'Grasim Industries Ltd.',
    departmentName: 'Department of Industrial Policy',
    officerName: 'Shri R. K. Vardhan (IAS)',
    requestedDate: '2026-02-24',
    timeSlot: '10:30 AM - 11:15 AM',
    roomId: 'RM-A01',
    roomName: 'VVIP Pavilion Conference Room A-01',
    status: 'Requested',
    expiresAt: new Date(Date.now() + 18 * 3600 * 1000).toISOString(), // ~18h remaining
    createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    notes: 'Discussion regarding 500-acre land allocation near Pithampur Auto Cluster.',
  },
  {
    id: 'MTG-802',
    investorName: 'Sarah Jenkins',
    companyName: 'Vestas Wind Systems A/S',
    departmentName: 'Department of New & Renewable Energy',
    officerName: 'Smt. Ananya Verma (IAS)',
    requestedDate: '2026-02-24',
    timeSlot: '02:00 PM - 02:45 PM',
    roomId: 'RM-B02',
    roomName: 'Green Energy Lounge B-02',
    status: 'Confirmed',
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    notes: 'Power purchase tariff structure and grid connectivity timeline.',
  },
  {
    id: 'MTG-803',
    investorName: 'Michael Chen',
    companyName: 'Foxconn Electronics Technology',
    departmentName: 'Department of Science & Technology',
    officerName: 'Shri Manoj Agarwal (IAS)',
    requestedDate: '2026-02-25',
    timeSlot: '11:30 AM - 12:15 PM',
    roomId: 'RM-A02',
    roomName: 'VVIP Pavilion Conference Room A-02',
    status: 'Accepted',
    expiresAt: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4h remaining countdown
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    notes: 'Semiconductor assembly plant incentive package alignment.',
  },
  {
    id: 'MTG-804',
    investorName: 'Aarav Sharma',
    companyName: 'GreenCharge Mobility Pvt Ltd',
    departmentName: 'MP MSME Department',
    officerName: 'Shri S. K. Chouhan',
    requestedDate: '2026-02-24',
    timeSlot: '04:00 PM - 04:30 PM',
    roomId: 'RM-C01',
    roomName: 'MSME Incubator Hub C-01',
    status: 'Expired',
    expiresAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    notes: 'Auto-expired after 24 hours without department confirmation.',
  },
];
