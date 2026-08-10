import { CRMStore } from '../db';
import { CRMInvestorRecord } from '@/lib/api/mocks/crmMockData';

export class CRMService {
  /**
   * Automatically updates a CRM record's pipeline status based on its linked registration ID.
   */
  static async updatePipelineStatusByRegistration(registrationId: string, status: string): Promise<CRMInvestorRecord | null> {
    const record = await CRMStore.getByRegistrationId(registrationId);
    if (!record) return null;

    return await CRMStore.update(record.id, { status });
  }

  /**
   * Appends an automated communication log to the CRM record.
   */
  static async appendLogByRegistration(registrationId: string, summary: string, type: 'email' | 'call' | 'meeting' | 'site_visit' = 'email'): Promise<CRMInvestorRecord | null> {
    const record = await CRMStore.getByRegistrationId(registrationId);
    if (!record) return null;

    const newLog = {
      id: `COMM-${Date.now()}`,
      type,
      summary,
      loggedBy: 'System Automation',
      loggedAt: new Date().toISOString(),
    };

    const updatedCommunications = [newLog, ...(record.communications || [])];

    return await CRMStore.update(record.id, { communications: updatedCommunications } as any);
  }

  /**
   * Retrieves all CRM records.
   */
  static async getAll(): Promise<CRMInvestorRecord[]> {
    return await CRMStore.getAll();
  }

  /**
   * Retrieves a specific CRM record by ID.
   */
  static async getById(id: string): Promise<CRMInvestorRecord | undefined> {
    return await CRMStore.getById(id);
  }

  /**
   * Standard update method by CRM ID.
   */
  static async update(id: string, updates: Partial<CRMInvestorRecord>): Promise<CRMInvestorRecord | null> {
    try {
      return await CRMStore.update(id, updates);
    } catch {
      return null;
    }
  }
}
