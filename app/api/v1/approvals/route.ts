/**
 * SISMP — REST API Route Handler: /api/v1/approvals
 * Department Officer Approval Queue State Transition Controller.
 * Features:
 * - Enforces BRD rule: Mandatory written reason string for Reject and Resubmit actions.
 * - Triggers Email Service (Gmail SMTP) for Approved, Rejected, and Resubmit actions.
 */
import { NextResponse } from 'next/server';
import { RegistrationService } from '@/lib/server/services/registrationService';
import { EmailService } from '@/lib/server/services/emailService';
import { LocalStore } from '@/lib/server/db';
import { REGISTRATION_STATUSES } from '@/lib/constants/statuses';

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { registrationId, status, reason, officerId, applicantEmail, applicantName, organization, badgeRole, sector } = body;

    if (!registrationId || !status) {
      return NextResponse.json(
        { success: false, error: 'registrationId and status parameters are required' },
        { status: 400 }
      );
    }

    // Call service to validate status and enforce mandatory written reason rules
    const result = RegistrationService.updateStatus(registrationId, status, reason, officerId);
    
    // Update Local JSON Store so the state persists across Next.js reloads
    await LocalStore.update(registrationId, result);

    // Fetch complete record details from LocalStore for accurate email dispatch
    const record = await LocalStore.getById(registrationId);

    const recipientEmail = applicantEmail || record?.email;
    const finalName = applicantName || record?.applicantName || 'Valued Attendee';
    const finalOrg = organization || record?.organization || 'Participant Enterprise';
    const finalRole = badgeRole || record?.badgeRole || 'Investor';
    const finalSector = sector || record?.sector || 'General';

    // Dispatch corresponding official email via Gmail SMTP / Resend
    let emailResult = null;
    if (recipientEmail) {
      if (status === REGISTRATION_STATUSES.APPROVED) {
        emailResult = await EmailService.sendApprovalCredentialsEmail({
          to: recipientEmail,
          applicantName: finalName,
          registrationId: registrationId,
          organization: finalOrg,
          badgeRole: finalRole,
          sector: finalSector,
        });
      } else if (status === REGISTRATION_STATUSES.REJECTED) {
        emailResult = await EmailService.sendRejectionEmail({
          to: recipientEmail,
          applicantName: finalName,
          registrationId: registrationId,
          organization: finalOrg,
          rejectionReason: reason || 'Document verification criteria not met.',
        });
      } else if (status === REGISTRATION_STATUSES.RESUBMIT) {
        emailResult = await EmailService.sendResubmitEmail({
          to: recipientEmail,
          applicantName: finalName,
          registrationId: registrationId,
          organization: finalOrg,
          resubmitReason: reason || 'Please upload updated company registration documentation.',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Registration ${registrationId} status updated to ${status}`,
      data: result,
      emailNotification: emailResult,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to update approval status',
      },
      { status: 400 }
    );
  }
}
