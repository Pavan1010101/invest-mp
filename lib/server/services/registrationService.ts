/**
 * SISMP — Registration Service & State Machine Logic
 * Handles registration creation, ID generation, and status state transitions.
 * Enforces BRD rules: mandatory reasons for Reject & Resubmit.
 */
import { REGISTRATION_STATUSES } from '@/lib/constants/statuses';
import { generateRegistrationId } from '@/lib/utils';

export interface RegistrationInputData {
  fullName: string;
  email: string;
  phone: string;
  designation?: string;
  organization: string;
  type: string;
  badgeRole: string;
  sector: string;
  country: string;
  state?: string;
  city?: string;
  investmentInterestINR?: number;
  notes?: string;
}

export interface StatusUpdateResult {
  id: string;
  status: string;
  rejectionReason?: string;
  resubmitReason?: string;
  updatedAt: string;
}

export class RegistrationService {
  /**
   * Create a new registration record with auto-formatted ID (e.g. IMP26-00104)
   */
  static createRegistration(data: any) {
    const fullName = data.fullName || data.applicantName || 'Attendee';
    const email = data.email || 'applicant@summit.mp.gov.in';
    const organization = data.organization || data.organizationName || 'Enterprise';
    const sector = data.sector || 'Manufacturing';
    const registrationId = data.id || generateRegistrationId();
    const now = new Date().toISOString();

    const record = {
      id: registrationId,
      applicantName: fullName,
      email: email,
      phone: data.phone || '',
      designation: data.designation || '',
      organization: organization,
      type: data.type || 'Investor',
      badgeRole: data.badgeRole || 'Investor',
      sector: sector,
      country: data.country || 'India',
      state: data.state || 'Madhya Pradesh',
      city: data.city || 'Bhopal',
      status: REGISTRATION_STATUSES.SUBMITTED,
      investmentInterestINR: typeof data.investmentInterestINR === 'number' ? data.investmentInterestINR : parseInt(data.investmentInterestINR || '0', 10),
      notes: data.notes || '',
      submittedAt: data.submittedAt || now,
      createdAt: now,
      updatedAt: now,
    };

    return record;
  }

  /**
   * Update Registration Status (State Machine transition logic)
   * Enforces BRD rule: Reject and Resubmit MUST contain a written reason string.
   */
  static updateStatus(
    registrationId: string,
    targetStatus: string,
    reason?: string,
    officerId?: string
  ): StatusUpdateResult {
    const validStatuses = Object.values(REGISTRATION_STATUSES);
    if (!validStatuses.includes(targetStatus as any)) {
      throw new Error(`Invalid status transition to "${targetStatus}".`);
    }

    // BRD Rule Validation: Reason is mandatory for REJECTED and RESUBMIT
    if (
      (targetStatus === REGISTRATION_STATUSES.REJECTED || targetStatus === REGISTRATION_STATUSES.RESUBMIT) &&
      (!reason || !reason.trim())
    ) {
      throw new Error(`A clear written reason is strictly required when status is set to ${targetStatus}.`);
    }

    const now = new Date().toISOString();

    return {
      id: registrationId,
      status: targetStatus,
      rejectionReason: targetStatus === REGISTRATION_STATUSES.REJECTED ? reason : undefined,
      resubmitReason: targetStatus === REGISTRATION_STATUSES.RESUBMIT ? reason : undefined,
      updatedAt: now,
    };
  }
}
