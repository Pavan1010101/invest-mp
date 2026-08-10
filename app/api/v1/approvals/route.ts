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
import { LocalStore, OfficerStore } from '@/lib/server/db';
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
        let finalPassword = `MPGIS-${Math.floor(1000 + Math.random() * 9000)}`;
        
        try {
          const { APPROVED_ATTENDEE_CREDENTIALS } = await import('@/lib/auth/officerCredentials');
          const staticAttendee = APPROVED_ATTENDEE_CREDENTIALS.find(a => a.email.toLowerCase() === recipientEmail.toLowerCase());
          
          if (staticAttendee) {
            finalPassword = staticAttendee.password;
          } else {
            const existing = await OfficerStore.getByEmailOrId(recipientEmail);
            if (!existing) {
              await OfficerStore.insert({
                id: registrationId,
                name: finalName,
                email: recipientEmail,
                password: finalPassword,
                role: 'attendee' as any,
                department: finalOrg,
                sector: finalSector,
                badgeRole: finalRole
              });
            }
          }
        } catch (e) {
          console.warn('Failed to insert approved user into OfficerStore:', e);
        }

        emailResult = await EmailService.sendApprovalCredentialsEmail({
          to: recipientEmail,
          applicantName: finalName,
          registrationId: registrationId,
          organization: finalOrg,
          badgeRole: finalRole,
          sector: finalSector,
          defaultPassword: finalPassword,
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
