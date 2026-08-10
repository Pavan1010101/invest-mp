/**
 * SISMP — Email Dispatcher Service
 * Supports Gmail SMTP (via Nodemailer & Google App Password) and Resend API fallback.
 * Sends official email notifications for:
 * 1. Immediate Application Submission Confirmation Receipt
 * 2. Officer Approval (with Default Login ID, Default Password, Entry Pass, Login URL)
 * 3. Officer Rejection (with written rejection reason)
 * 4. Officer Resubmit Request (with required documentation updates)
 */
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromAddress = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

export interface SubmissionEmailPayload {
  to: string;
  applicantName: string;
  registrationId: string;
  organization: string;
  sector: string;
}

export interface ApprovalEmailPayload {
  to: string;
  applicantName: string;
  registrationId: string;
  organization: string;
  badgeRole: string;
  sector: string;
  defaultUserId?: string;
  defaultPassword?: string;
}

export interface RejectionEmailPayload {
  to: string;
  applicantName: string;
  registrationId: string;
  organization: string;
  rejectionReason: string;
}

export interface ResubmitEmailPayload {
  to: string;
  applicantName: string;
  registrationId: string;
  organization: string;
  resubmitReason: string;
}

export interface MeetingScheduledEmailPayload {
  to: string;
  recipientName: string;
  otherPartyName: string;
  date: string;
  timeSlot: string;
  roomName: string;
  meetingId: string;
}

export class EmailService {
  /**
   * 1. Send Application Submission Confirmation Receipt
   */
  static async sendSubmissionConfirmationEmail(payload: SubmissionEmailPayload) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0c1445 0%, #1E3A8A 100%); padding: 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; padding: 6px 16px; background: #2563eb; color: #ffffff; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
          .content { padding: 30px; }
          .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0f2fe; font-size: 14px; }
          .info-row:last-child { border-bottom: none; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">SUBMISSION CONFIRMED</div>
            <h1 style="margin:0; font-size:24px;">Invest Madhya Pradesh</h1>
            <p style="margin:5px 0 0 0; opacity:0.8; font-size:14px;">Global Investors Summit 2026</p>
          </div>
          <div class="content">
            <h2 style="font-size:18px; color:#1E3A8A;">Application Received, ${payload.applicantName}!</h2>
            <p style="font-size:14px; line-height:1.6; color:#334155;">
              Thank you for registering for the <strong>Invest Madhya Pradesh Global Investors Summit 2026</strong>. Your application has been successfully submitted and queued for verification by the Nodal Department Officer.
            </p>

            <div class="info-box">
              <h3 style="margin:0 0 12px 0; font-size:14px; color:#1E3A8A; text-transform:uppercase;">Application Summary</h3>
              <div class="info-row">
                <strong>Registration ID:</strong>
                <span style="font-family:monospace; font-weight:bold; color:#2563eb;">${payload.registrationId}</span>
              </div>
              <div class="info-row">
                <strong>Applicant Name:</strong>
                <span>${payload.applicantName}</span>
              </div>
              <div class="info-row">
                <strong>Organization:</strong>
                <span>${payload.organization}</span>
              </div>
              <div class="info-row">
                <strong>Sector:</strong>
                <span>${payload.sector}</span>
              </div>
              <div class="info-row">
                <strong>Current Status:</strong>
                <span style="font-weight:bold; color:#2563eb;">Submitted (Under Review)</span>
              </div>
            </div>

            <p style="font-size:13px; color:#475569;">
              You can track your live application status at any time using your Registration ID on the portal:
            </p>
            <div style="text-align:center; margin-top:20px;">
              <a href="http://localhost:3000/status?id=${payload.registrationId}" style="display:inline-block; padding:12px 24px; background:#1E3A8A; color:#ffffff; font-weight:bold; text-decoration:none; border-radius:6px; font-size:14px;">
                Track Application Status &rarr;
              </a>
            </div>
          </div>
          <div class="footer">
            Official Communication &bull; Government of Madhya Pradesh &bull; MPIDC
          </div>
        </div>
      </body>
      </html>
    `;

    return EmailService.dispatchEmail(payload.to, `[CONFIRMED] Application Submission Receipt — #${payload.registrationId}`, htmlContent, payload.registrationId);
  }

  /**
   * 2. Send Official Approval & Login Credentials Email
   */
  static async sendApprovalCredentialsEmail(payload: ApprovalEmailPayload) {
    const defaultId = payload.defaultUserId || payload.registrationId;
    const defaultPass = payload.defaultPassword || `MPGIS-${Math.floor(1000 + Math.random() * 9000)}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; padding: 6px 16px; background: #D97706; color: #ffffff; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
          .content { padding: 30px; }
          .cred-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .cred-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #d1fae5; font-size: 14px; }
          .cred-row:last-child { border-bottom: none; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">APPLICATION APPROVED</div>
            <h1 style="margin:0; font-size:24px;">Invest Madhya Pradesh</h1>
            <p style="margin:5px 0 0 0; opacity:0.8; font-size:14px;">Global Investors Summit 2026</p>
          </div>
          
          <div class="content">
            <h2 style="font-size:18px; color:#047857;">Congratulations, ${payload.applicantName}!</h2>
            <p style="font-size:14px; line-height:1.6; color:#334155;">
              We are pleased to inform you that your registration for <strong>Invest Madhya Pradesh Global Investors Summit 2026</strong> has been officially <strong>APPROVED</strong> by the Nodal Department Officer.
            </p>

            <div class="cred-box">
              <h3 style="margin:0 0 12px 0; font-size:14px; color:#047857; text-transform:uppercase;">Official Login Credentials & Access Pass</h3>
              <div class="cred-row">
                <strong>Registration ID:</strong>
                <span style="font-family:monospace; font-weight:bold; color:#047857;">${payload.registrationId}</span>
              </div>
              <div class="cred-row">
                <strong>Login User ID:</strong>
                <span style="font-family:monospace; font-weight:bold; color:#1E3A8A;">${defaultId}</span>
              </div>
              <div class="cred-row">
                <strong>Default Password Code:</strong>
                <span style="font-family:monospace; font-weight:bold; color:#b45309; background:#fef3c7; padding:2px 8px; border-radius:4px;">${defaultPass}</span>
              </div>
              <div class="cred-row">
                <strong>Badge Category:</strong>
                <span style="font-weight:bold; color:#D97706;">${payload.badgeRole}</span>
              </div>
            </div>

            <p style="font-size:13px; color:#475569; line-height:1.6;">
              <strong>Security Notice:</strong> You can log into the portal using your Login ID and Default Password code. After logging in, you can update your password to a custom password under your Profile settings.
            </p>

            <div style="text-align:center; margin-top:20px;">
              <a href="http://localhost:3000/login" style="display:inline-block; padding:12px 24px; background:#047857; color:#ffffff; font-weight:bold; text-decoration:none; border-radius:6px; font-size:14px;">
                Sign In to Portal & Update Password &rarr;
              </a>
            </div>

            <h3 style="font-size:14px; color:#0f172a; margin-top:24px;">Summit Venue & Schedule:</h3>
            <ul style="font-size:13px; color:#475569; line-height:1.8;">
              <li><strong>Dates:</strong> February 24–25, 2026</li>
              <li><strong>Venue:</strong> Brilliant Convention Centre, Indore, Madhya Pradesh</li>
              <li><strong>On-Site QR Badge Collection:</strong> Show your Registration ID (${payload.registrationId}) at the Registration Desk</li>
            </ul>
          </div>

          <div class="footer">
            Official Communication &bull; Government of Madhya Pradesh &bull; MPIDC
          </div>
        </div>
      </body>
      </html>
    `;

    return EmailService.dispatchEmail(payload.to, `[APPROVED] Login Credentials & Entry Pass — Registration #${payload.registrationId}`, htmlContent, payload.registrationId);
  }

  /**
   * 3. Send Official Rejection Notice Email
   */
  static async sendRejectionEmail(payload: RejectionEmailPayload) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; padding: 6px 16px; background: #ffffff; color: #dc2626; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
          .content { padding: 30px; }
          .reason-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0; color: #991b1b; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">APPLICATION NOT APPROVED</div>
            <h1 style="margin:0; font-size:24px;">Invest Madhya Pradesh</h1>
            <p style="margin:5px 0 0 0; opacity:0.8; font-size:14px;">Global Investors Summit 2026</p>
          </div>
          <div class="content">
            <h2 style="font-size:18px; color:#991b1b;">Dear ${payload.applicantName},</h2>
            <p style="font-size:14px; line-height:1.6; color:#334155;">
              We regret to inform you that your application for registration (<strong>#${payload.registrationId}</strong>) could not be approved by the Department Nodal Officer.
            </p>

            <div class="reason-box">
              <h3 style="margin:0 0 8px 0; font-size:14px; text-transform:uppercase;">Official Department Reason:</h3>
              <p style="margin:0; font-size:13px; line-height:1.5; font-weight:bold;">${payload.rejectionReason}</p>
            </div>

            <p style="font-size:13px; color:#475569;">
              If you have any questions or require clarification, please contact the MPIDC Help Desk or submit a fresh application with revised documentation.
            </p>
          </div>
          <div class="footer">
            Official Communication &bull; Government of Madhya Pradesh &bull; MPIDC
          </div>
        </div>
      </body>
      </html>
    `;

    return EmailService.dispatchEmail(payload.to, `[UPDATE] Application Status Update — Registration #${payload.registrationId}`, htmlContent, payload.registrationId);
  }

  /**
   * 4. Send Resubmit Requirements Request Email
   */
  static async sendResubmitEmail(payload: ResubmitEmailPayload) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; padding: 6px 16px; background: #ffffff; color: #d97706; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
          .content { padding: 30px; }
          .reason-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 20px; margin: 20px 0; color: #92400e; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">ACTION REQUIRED</div>
            <h1 style="margin:0; font-size:24px;">Invest Madhya Pradesh</h1>
            <p style="margin:5px 0 0 0; opacity:0.8; font-size:14px;">Global Investors Summit 2026</p>
          </div>
          <div class="content">
            <h2 style="font-size:18px; color:#b45309;">Dear ${payload.applicantName},</h2>
            <p style="font-size:14px; line-height:1.6; color:#334155;">
              The Department Nodal Officer has reviewed your application (<strong>#${payload.registrationId}</strong>) and requested additional or revised documentation before final approval can be granted.
            </p>

            <div class="reason-box">
              <h3 style="margin:0 0 8px 0; font-size:14px; text-transform:uppercase;">Nodal Officer Request:</h3>
              <p style="margin:0; font-size:13px; line-height:1.5; font-weight:bold;">${payload.resubmitReason}</p>
            </div>

            <div style="text-align:center; margin-top:20px;">
              <a href="http://localhost:3000/status?id=${payload.registrationId}" style="display:inline-block; padding:12px 24px; background:#d97706; color:#ffffff; font-weight:bold; text-decoration:none; border-radius:6px; font-size:14px;">
                Upload Requested Documents &rarr;
              </a>
            </div>
          </div>
          <div class="footer">
            Official Communication &bull; Government of Madhya Pradesh &bull; MPIDC
          </div>
        </div>
      </body>
      </html>
    `;

    return EmailService.dispatchEmail(payload.to, `[ACTION REQUIRED] Document Update Needed — Registration #${payload.registrationId}`, htmlContent, payload.registrationId);
  }

  /**
   * 5. Send Meeting Scheduled Email
   */
  static async sendMeetingScheduledEmail(payload: MeetingScheduledEmailPayload) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #0f172a; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); padding: 30px; text-align: center; color: #ffffff; }
          .badge { display: inline-block; padding: 6px 16px; background: #ccfbf1; color: #0f766e; border-radius: 20px; font-weight: bold; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
          .content { padding: 30px; }
          .info-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0; color: #166534; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">MEETING SCHEDULED</div>
            <h1 style="margin:0; font-size:24px;">Invest Madhya Pradesh</h1>
            <p style="margin:5px 0 0 0; opacity:0.8; font-size:14px;">Global Investors Summit 2026</p>
          </div>
          <div class="content">
            <h2 style="font-size:18px; color:#115e59;">Dear ${payload.recipientName},</h2>
            <p style="font-size:14px; line-height:1.6; color:#334155;">
              Your meeting with <strong>${payload.otherPartyName}</strong> has been successfully scheduled and a room has been allocated.
            </p>

            <div class="info-box">
              <h3 style="margin:0 0 12px 0; font-size:14px; text-transform:uppercase;">Meeting Details</h3>
              <p style="margin:5px 0;"><strong>Date:</strong> ${payload.date}</p>
              <p style="margin:5px 0;"><strong>Time Slot:</strong> ${payload.timeSlot}</p>
              <p style="margin:5px 0;"><strong>Venue/Room:</strong> ${payload.roomName}</p>
              <p style="margin:5px 0;"><strong>Meeting ID:</strong> ${payload.meetingId}</p>
            </div>
            
            <p style="font-size:13px; color:#475569;">
              Please arrive 5 minutes early to the designated meeting room.
            </p>
          </div>
          <div class="footer">
            Official Communication &bull; Government of Madhya Pradesh &bull; MPIDC
          </div>
        </div>
      </body>
      </html>
    `;

    return EmailService.dispatchEmail(payload.to, `[SCHEDULED] Meeting with ${payload.otherPartyName}`, htmlContent, payload.meetingId);
  }

  /**
   * Primary Dispatcher: Uses Gmail SMTP (Nodemailer) if configured, otherwise falls back to Resend API.
   */
  private static async dispatchEmail(to: string, subject: string, htmlContent: string, registrationId: string) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    // Option 1: Gmail SMTP via Nodemailer (Sends to ANY recipient worldwide)
    if (gmailUser && gmailAppPassword && !gmailAppPassword.includes('your_app_password')) {
      try {
        console.log(`[GMAIL SMTP] Dispatching email...`);
        console.log(`[GMAIL SMTP]   From: "Invest MP Summit" <${gmailUser}>`);
        console.log(`[GMAIL SMTP]   To: ${to}`);
        console.log(`[GMAIL SMTP]   Subject: ${subject}`);

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailAppPassword.replace(/\s+/g, ''), // Strip spaces if copied from Google
          },
        });

        const info = await transporter.sendMail({
          from: `"Invest MP Summit" <${gmailUser}>`,
          to: to,
          subject: subject,
          html: htmlContent,
        });

        console.log(`[GMAIL SMTP] ✅ Success! Message ID:`, info.messageId);

        return {
          success: true,
          provider: 'GMAIL_SMTP',
          messageId: info.messageId,
          registrationId,
          deliveredTo: to,
        };
      } catch (err: any) {
        console.error('[GMAIL SMTP] ❌ Dispatch Error:', err?.message || err);
        return {
          success: false,
          error: err?.message || 'Gmail SMTP dispatch failed',
        };
      }
    }

    // Option 2: Resend API Fallback
    if (resend && process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('your_resend_secret_key')) {
      try {
        const testRecipient = process.env.RESEND_TEST_RECIPIENT;
        const actualTo = testRecipient || to;

        console.log(`[RESEND API] Dispatching email...`);
        console.log(`[RESEND API]   From: Invest MP Summit <${fromAddress}>`);
        console.log(`[RESEND API]   To: ${actualTo}${testRecipient ? ` (overridden from ${to})` : ''}`);
        console.log(`[RESEND API]   Subject: ${subject}`);

        const response = await resend.emails.send({
          from: `Invest MP Summit <${fromAddress}>`,
          to: [actualTo],
          subject,
          html: htmlContent,
        });

        console.log(`[RESEND API] ✅ API Response:`, JSON.stringify(response, null, 2));

        return {
          success: true,
          provider: 'RESEND',
          data: response,
          registrationId,
          deliveredTo: actualTo,
        };
      } catch (err: any) {
        console.error('[RESEND API] ❌ Dispatch Error:', err?.message || err);
        return {
          success: false,
          error: err?.message || 'Resend API dispatch failed',
        };
      }
    }

    console.log(`[EMAIL SIMULATION] Prepared email for ${to} (${subject}). Configure GMAIL_USER & GMAIL_APP_PASSWORD in .env.local for live dispatch.`);
    return {
      success: true,
      simulated: true,
      message: `Email simulated for ${to}`,
      registrationId,
    };
  }
}
