/**
 * SISMP — MoU Digital Signature & Execution Service
 * Enforces Prompt Section 5 rule:
 * MoUs can NEVER be executed unless BOTH Investor and Department Officer signatures are verified on file.
 */
import { MOU_STATUSES } from '@/lib/constants/statuses';
import { MoURecord } from '@/lib/api/mocks/crmMockData';
import { MeetingRequestStore } from '@/lib/server/db';

export class MoUService {
  /**
   * Register a digital signature for Investor, Target, or Department
   */
  static async signMoU(mou: MoURecord, party: 'investor' | 'target' | 'department', signatureHash: string): Promise<MoURecord> {
    if (party === 'investor') {
      const meetings = await MeetingRequestStore.getByApplicantId((mou as any).investorId || (mou as any).applicantId);
      const hasScheduledMeeting = meetings.some((m: any) => m.status === 'Completed' || m.status === 'Scheduled');
      if (!hasScheduledMeeting) {
        throw new Error('FORBIDDEN: Investors must have a scheduled or completed meeting before they are eligible to sign an MoU.');
      }
    }

    const now = new Date().toISOString();

    const updated = {
      ...mou,
      investorSigned: party === 'investor' ? true : mou.investorSigned,
      investorSignedAt: party === 'investor' ? now : mou.investorSignedAt,
      targetSigned: party === 'target' ? true : mou.targetSigned,
      targetSignedAt: party === 'target' ? now : mou.targetSignedAt,
      departmentSigned: party === 'department' ? true : mou.departmentSigned,
      departmentSignedAt: party === 'department' ? now : mou.departmentSignedAt,
    };

    // Auto-advance status to Signed if all required signatures exist
    if (updated.investorSigned && updated.targetSigned && updated.departmentSigned) {
      updated.status = MOU_STATUSES.SIGNED;
    } else {
      updated.status = MOU_STATUSES.PENDING_SIGNATURES;
    }

    return updated;
  }

  /**
   * Revoke a digital signature for Investor, Target, or Department
   */
  static revokeMoU(mou: MoURecord, party: 'investor' | 'target' | 'department'): MoURecord {
    const updated = {
      ...mou,
      investorSigned: party === 'investor' ? false : mou.investorSigned,
      investorSignedAt: party === 'investor' ? undefined : mou.investorSignedAt,
      targetSigned: party === 'target' ? false : mou.targetSigned,
      targetSignedAt: party === 'target' ? undefined : mou.targetSignedAt,
      departmentSigned: party === 'department' ? false : mou.departmentSigned,
      departmentSignedAt: party === 'department' ? undefined : mou.departmentSignedAt,
    };

    if (updated.investorSigned && updated.targetSigned && updated.departmentSigned) {
      updated.status = MOU_STATUSES.SIGNED;
    } else {
      updated.status = MOU_STATUSES.PENDING_SIGNATURES;
    }

    return updated;
  }

  /**
   * Execute MoU. STRICT CHECK: All 3 signatures MUST be present.
   */
  static executeMoU(mou: MoURecord): MoURecord {
    if (!mou.investorSigned || !mou.targetSigned || !mou.departmentSigned) {
      throw new Error('FORBIDDEN: MoU cannot be executed until Investor, Target Attendee, and Department Officer have all signed.');
    }

    return {
      ...mou,
      status: MOU_STATUSES.EXECUTED,
    };
  }
}
