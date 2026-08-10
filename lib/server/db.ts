import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { StaffRegistrationRecord, MOCK_REGISTRATION_RECORDS } from '@/lib/api/mocks/staffMockData';
import { DepartmentOfficerCredential, DEPARTMENT_OFFICER_CREDENTIALS } from '@/lib/auth/officerCredentials';
import { type CRMInvestorRecord, type MoURecord, MOCK_CRM_INVESTORS, MOCK_MOUS } from '@/lib/api/mocks/crmMockData';

// Memory fallbacks for write operations if DB is offline
const memoryRegistrations: any[] = [...MOCK_REGISTRATION_RECORDS];
const memoryOfficers: any[] = DEPARTMENT_OFFICER_CREDENTIALS.map(o => ({
  ...o,
  password: bcrypt.hashSync(o.password || 'default', 10)
}));

export class LocalStore {
  static init() {}
  static resetDatabase() {}

  static async getAll(): Promise<any[]> {
    try {
      const records = await prisma.registration.findMany({ orderBy: { createdAt: 'desc' } });
      return records.length > 0 ? records : memoryRegistrations;
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.getAll, returning memory fallback:', err);
      return memoryRegistrations;
    }
  }

  static async getById(id: string): Promise<any | null> {
    try {
      const record = await prisma.registration.findUnique({ where: { id } });
      if (record) return record;
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.getById:', err);
    }
    return memoryRegistrations.find((r) => r.id === id) || null;
  }

  static async getByEmail(email: string): Promise<any | null> {
    if (!email || !email.trim()) return null;
    const cleanEmail = email.trim().toLowerCase();
    try {
      const record = await prisma.registration.findUnique({ where: { email: cleanEmail } });
      if (record) return record;
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.getByEmail:', err);
    }
    return memoryRegistrations.find((r) => r.email?.toLowerCase() === cleanEmail) || null;
  }

  static async getByPhone(phone: string): Promise<any | null> {
    if (!phone || !phone.trim()) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) return null;
    try {
      const records = await prisma.registration.findMany();
      const match = records.find(r => r.phone && r.phone.replace(/\D/g, '') === cleanPhone);
      if (match) return match;
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.getByPhone:', err);
    }
    return memoryRegistrations.find((r) => r.phone && r.phone.replace(/\D/g, '') === cleanPhone) || null;
  }

  static async insert(record: StaffRegistrationRecord): Promise<any> {
    const existingEmail = await this.getByEmail(record.email);
    if (existingEmail) {
      throw new Error(`An application with email "${record.email}" has already been submitted.`);
    }

    memoryRegistrations.unshift(record);

    try {
      return await prisma.registration.create({
        data: {
          id: record.id,
          applicantName: record.applicantName,
          email: record.email.trim().toLowerCase(),
          phone: record.phone,
          designation: record.designation || null,
          organization: record.organization,
          type: record.type,
          badgeRole: record.badgeRole,
          sectorId: (record as any).sector || 'General',
          country: record.country,
          state: record.state || null,
          city: (record as any).city || null,
          status: record.status || 'Submitted',
          rejectionReason: record.rejectionReason || null,
          resubmitReason: record.resubmitReason || null,
          investmentInterestINR: record.investmentInterestINR ? BigInt(record.investmentInterestINR) : null,
          notes: record.notes || null,
        } as any
      });
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.insert, saved to memory fallback:', err);
      return record;
    }
  }

  static async update(id: string, updates: Partial<StaffRegistrationRecord>): Promise<any> {
    const { id: _, ...safeUpdates } = updates as any;
    const idx = memoryRegistrations.findIndex((r) => r.id === id);
    if (idx !== -1) {
      memoryRegistrations[idx] = { ...memoryRegistrations[idx], ...safeUpdates };
    }
    try {
      return await prisma.registration.update({
        where: { id },
        data: safeUpdates,
      });
    } catch (err) {
      console.warn('DB disconnect/error in LocalStore.update, updated memory fallback:', err);
      return memoryRegistrations[idx] || updates;
    }
  }
}

export class OfficerStore {
  static init() {}

  static async getAll(): Promise<any[]> {
    try {
      const users = await prisma.user.findMany();
      if (users.length > 0) {
        return users.map((u: any) => ({
          ...u,
          password: u.passwordHash,
        }));
      }
    } catch (err) {
      console.warn('DB disconnect/error in OfficerStore.getAll, returning memory fallback:', err);
    }
    return memoryOfficers;
  }

  static async getByEmailOrId(query: string): Promise<any | null> {
    if (!query || !query.trim()) return null;
    const clean = query.trim().toLowerCase();
    try {
      const records = await prisma.user.findMany();
      const match = records.find(o => o.email.toLowerCase() === clean || o.id === clean);
      if (match) {
        return { ...match, password: match.passwordHash };
      }
    } catch (err) {
      console.warn('DB disconnect/error in OfficerStore.getByEmailOrId:', err);
    }
    return memoryOfficers.find(o => o.email.toLowerCase() === clean || o.id.toLowerCase() === clean) || null;
  }

  static async insert(officer: DepartmentOfficerCredential): Promise<any> {
    const existing = await this.getByEmailOrId(officer.email);
    if (existing) {
      throw new Error(`An officer account with email "${officer.email}" already exists.`);
    }
    const hashedOfficer = { ...officer, password: bcrypt.hashSync(officer.password || 'default', 10) };
    memoryOfficers.unshift(hashedOfficer);

    try {
      return await prisma.user.create({
        data: {
          email: officer.email,
          name: officer.name,
          role: officer.role,
          departmentId: (officer as any).departmentId || null,
          department: officer.department || null,
          sector: officer.sector || null,
          badgeRole: officer.badgeRole || null,
          passwordHash: bcrypt.hashSync(officer.password || 'default', 10),
        }
      });
    } catch (err) {
      console.warn('DB disconnect/error in OfficerStore.insert, saved to memory fallback:', err);
      return officer;
    }
  }

  static async delete(id: string): Promise<boolean> {
    const idx = memoryOfficers.findIndex((o) => o.id === id);
    if (idx !== -1) {
      memoryOfficers.splice(idx, 1);
    }
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return idx !== -1;
    }
  }
}

export interface GateAuditRecord {
  id: string;
  regId: string;
  applicantName: string;
  organization: string;
  badgeRole: string;
  gate: string;
  status: 'GRANTED' | 'DENIED';
  timestamp: string;
  reason?: string;
}

export class GateAuditStore {
  static init() {}

  static async getAll(): Promise<any[]> {
    return prisma.gateAudit.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async insert(record: GateAuditRecord): Promise<any> {
    return prisma.gateAudit.create({
      data: {
        regId: record.regId,
        applicantName: record.applicantName,
        organization: record.organization,
        badgeRole: record.badgeRole,
        gate: record.gate,
        status: record.status,
        reason: record.reason || null,
        timestamp: record.timestamp
      }
    });
  }
}

export interface PavilionRequestRecord {
  id: string; // e.g. req-...
  applicantId: string; // e.g. IMP26-...
  applicantName: string;
  companyName: string;
  requestedHall: string;
  preferredStallNumber: string;
  sector: string;
  powerRequirementKW: number;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
}

export class PavilionRequestStore {
  static init() {}

  static async getAll(): Promise<any[]> {
    return prisma.pavilionRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async getByApplicantId(applicantId: string): Promise<any[]> {
    return prisma.pavilionRequest.findMany({ where: { applicantId } });
  }

  static async insert(record: PavilionRequestRecord): Promise<any> {
    return prisma.pavilionRequest.create({
      data: {
        id: record.id,
        applicantId: record.applicantId,
        applicantName: record.applicantName,
        companyName: record.companyName,
        requestedHall: record.requestedHall,
        preferredStallNumber: record.preferredStallNumber,
        sector: record.sector,
        powerRequirementKW: record.powerRequirementKW,
        requestDate: record.requestDate,
        status: record.status
      }
    });
  }

  static async updateStatus(id: string, status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'): Promise<any> {
    return prisma.pavilionRequest.update({
      where: { id },
      data: { status }
    });
  }
}

export interface MeetingRequestRecord {
  id: string; // e.g. meet-...
  applicantId: string;
  applicantName: string;
  companyName: string;
  sector: string;
  requestDate: string;
  status: 'Pending' | 'Requested' | 'Accepted' | 'Scheduled' | 'Completed' | 'Declined' | 'Cancelled' | 'Pending_Peer_Acceptance';
  durationMins?: number;
  scheduledTime?: string;
  roomId?: string;
  roomName?: string;
  meetingLink?: string;
  officerId?: string;
  officerName?: string;
  departmentName?: string;
  requestedDate?: string;
  timeSlot?: string;
}

export class MeetingRequestStore {
  static init() {}

  static async enrichMeetings(meetings: any[]): Promise<any[]> {
    if (meetings.length === 0) return [];
    
    // Gather all unique registration IDs
    const regIds = new Set<string>();
    meetings.forEach(m => {
      if (m.registrationId) regIds.add(m.registrationId);
      if (m.officerId && m.officerId.startsWith('IMP')) regIds.add(m.officerId);
    });

    const regs = await prisma.registration.findMany({
      where: { id: { in: Array.from(regIds) } }
    });
    const regMap = new Map(regs.map(r => [r.id, r]));
    
    // Fallback to memoryRegistrations
    regIds.forEach(id => {
      if (!regMap.has(id)) {
        const memReg = memoryRegistrations.find(r => r.id === id);
        if (memReg) regMap.set(id, memReg);
      }
    });

    // Fallback to Officers for internal requests
    const allOfficers = await OfficerStore.getAll();
    regIds.forEach(id => {
      if (!regMap.has(id)) {
        const off = allOfficers.find(o => o.id === id || o.email === id);
        if (off) {
          regMap.set(id, {
            id: off.id,
            applicantName: off.name || 'Officer',
            organization: off.department || off.sector || 'Department',
            sectorId: off.sector || 'General'
          } as any);
        }
      }
    });

    return meetings.map(m => {
      const applicant = regMap.get(m.registrationId);
      const officer = m.officerId ? regMap.get(m.officerId) : null;

      return {
        ...m,
        applicantId: m.registrationId,
        applicantName: applicant?.applicantName || 'Unknown Applicant',
        companyName: applicant?.organization || 'Unknown Company',
        sector: applicant?.sectorId || 'General',
        officerName: officer?.applicantName || (m.officerId && m.officerId.startsWith('IMP') ? 'Unknown Officer' : m.departmentName),
        departmentName: officer?.organization || m.departmentName,
      };
    });
  }

  static async getAll(): Promise<any[]> {
    const meetings = await prisma.meeting.findMany({ orderBy: { createdAt: 'desc' } });
    return this.enrichMeetings(meetings);
  }

  static async getByApplicantId(applicantId: string): Promise<any[]> {
    const meetings = await prisma.meeting.findMany({ where: { registrationId: applicantId } });
    return this.enrichMeetings(meetings);
  }

  static async insert(record: MeetingRequestRecord): Promise<any> {
    return prisma.meeting.create({
      data: {
        id: record.id,
        registrationId: record.applicantId,
        departmentName: record.departmentName || '',
        requestedDate: record.requestedDate || record.requestDate,
        timeSlot: record.timeSlot || '',
        roomId: record.roomId || '',
        roomName: record.roomName || '',
        status: record.status,
        notes: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // default 24h
        officerId: record.officerId || null,
      }
    });
  }

  static async update(id: string, updates: Partial<MeetingRequestRecord>): Promise<any> {
    return prisma.meeting.update({
      where: { id },
      data: updates as any,
    });
  }

  static async updateStatus(id: string, status: 'Pending' | 'Requested' | 'Accepted' | 'Scheduled' | 'Completed' | 'Declined' | 'Cancelled'): Promise<any> {
    return this.update(id, { status });
  }
}

export class MoUStore {
  static init() {}

  static async enrichMoUs(mous: any[]): Promise<any[]> {
    if (mous.length === 0) return [];
    
    // Gather all unique registration IDs
    const regIds = new Set<string>();
    mous.forEach(m => {
      if (m.investorId) regIds.add(m.investorId);
      if (m.officerId && m.officerId.startsWith('IMP')) regIds.add(m.officerId);
    });

    const regs = await prisma.registration.findMany({
      where: { id: { in: Array.from(regIds) } }
    });
    const regMap = new Map(regs.map(r => [r.id, r]));
    
    // Fallback to memoryRegistrations
    regIds.forEach(id => {
      if (!regMap.has(id)) {
        const memReg = memoryRegistrations.find(r => r.id === id);
        if (memReg) regMap.set(id, memReg);
      }
    });

    // Fallback to Officers for internal requests
    const allOfficers = await OfficerStore.getAll();
    regIds.forEach(id => {
      if (!regMap.has(id)) {
        const off = allOfficers.find(o => o.id === id || o.email === id);
        if (off) {
          regMap.set(id, {
            id: off.id,
            applicantName: off.name || 'Officer',
            organization: off.department || off.sector || 'Department',
            sectorId: off.sector || 'General'
          } as any);
        }
      }
    });

    return mous.map(m => {
      const investor = regMap.get(m.investorId);
      const target = m.officerId ? regMap.get(m.officerId) : null;

      return {
        ...m,
        proposedInvestmentINR: Number(m.proposedCapitalINR),
        mouTitle: m.title,
        investorName: investor?.applicantName || 'Unknown Investor',
        companyName: investor?.organization || 'Unknown Company',
        targetName: target?.applicantName || (m.officerId && m.officerId.startsWith('IMP') ? 'Unknown Target' : m.departmentName),
      };
    });
  }

  static async getAll(): Promise<any[]> {
    const mous = await prisma.moU.findMany({ orderBy: { createdAt: 'desc' } });
    return this.enrichMoUs(mous);
  }

  static async getByApplicantId(applicantId: string): Promise<any[]> {
    const mous = await prisma.moU.findMany({ 
      where: { 
        OR: [
          { investorId: applicantId },
          { officerId: applicantId }
        ]
      } 
    });
    return this.enrichMoUs(mous);
  }

  static async insert(record: any): Promise<any> {
    const created = await prisma.moU.create({
      data: {
        id: record.id,
        title: record.title || record.mouTitle || 'Untitled MoU',
        investorId: record.applicantId,
        officerId: record.targetId || record.officerId || null,
        departmentName: record.targetName || record.departmentName || 'Department',
        proposedCapitalINR: BigInt(record.proposedCapitalINR || record.proposedInvestmentINR || 0),
        estimatedJobs: Number(record.estimatedJobs || 0),
        sector: record.sector || 'General',
        status: record.status,
      } as any
    });
    return (await this.enrichMoUs([created]))[0];
  }

  static async update(id: string, updates: Partial<any>): Promise<any> {
    // Strip out mapped UI fields so Prisma doesn't throw "Unknown argument"
    const { 
      proposedInvestmentINR, 
      mouTitle, 
      investorName, 
      companyName, 
      targetName,
      id: _id,
      createdAt,
      updatedAt,
      ...validUpdates 
    } = updates;

    const updated = await prisma.moU.update({
      where: { id },
      data: validUpdates as any,
    });
    return (await this.enrichMoUs([updated]))[0];
  }
}

export class CRMStore {
  static init() {}

  static async getAll(): Promise<any[]> {
    return prisma.investorProfile.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async getById(id: string): Promise<any | null> {
    return prisma.investorProfile.findUnique({ where: { id } });
  }

  static async getByRegistrationId(registrationId: string): Promise<any | null> {
    return prisma.investorProfile.findUnique({ where: { registrationId } });
  }

  static async update(id: string, updates: Partial<CRMInvestorRecord>): Promise<any> {
    return prisma.investorProfile.update({
      where: { id },
      data: updates as any,
    });
  }
}

export const CRMService = CRMStore;
