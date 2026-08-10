/**
 * SISMP — REST API Route Handler: /api/v1/registrations
 * Public Attendee Registration Submission & Query Endpoint.
 * Features:
 * - Duplicate Email & Phone Prevention Check.
 * - Password Code Generation & Paired Credentials Storage.
 * - Immediate Submission Receipt Email.
 */
import { NextResponse } from 'next/server';
import { RegistrationService } from '@/lib/server/services/registrationService';
import { EmailService } from '@/lib/server/services/emailService';
import { LocalStore } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const sector = searchParams.get('sector');

    let results = await LocalStore.getAll();
    if (status) results = results.filter((r) => r.status === status);
    if (sector) results = results.filter((r) => r.sector === sector);

    return NextResponse.json({
      success: true,
      total: results.length,
      data: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const emailClean = (body.email || body.officialEmail || '').trim().toLowerCase();

    // 1. Strict Duplicate Application Email Check
    if (emailClean) {
      const existingEmail = await LocalStore.getByEmail(emailClean);
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: `An application with email "${emailClean}" has already been submitted under Registration ID: ${existingEmail.id}. Each user must have a unique email address.`,
          },
          { status: 400 }
        );
      }
    }

    // 2. Strict Duplicate Phone Check (if phone provided)
    if (body.phone && body.phone.trim()) {
      const existingPhone = await LocalStore.getByPhone(body.phone.trim());
      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            error: `An application with phone number "${body.phone}" already exists (ID: ${existingPhone.id}). Please use a unique phone number.`,
          },
          { status: 400 }
        );
      }
    }

    const newRecord = RegistrationService.createRegistration(body);

    // Pair ID, Email, and Password Code together
    const assignedPassword = body.password || `MPGIS-${newRecord.id.split('-')[1]}`;
    
    const staffRecord = {
      ...newRecord,
      password: assignedPassword,
      department: body.department || 'Department of Industrial Policy & Investment Promotion',
      submittedAt: newRecord.createdAt,
      documents: [],
      delegates: [],
    };

    // Save record to LocalStore
    await LocalStore.insert(staffRecord as any);

    // Send immediate submission receipt confirmation email via Nodemailer/Gmail
    let emailResult = null;
    if (newRecord.email) {
      emailResult = await EmailService.sendSubmissionConfirmationEmail({
        to: newRecord.email,
        applicantName: newRecord.applicantName,
        registrationId: newRecord.id,
        organization: newRecord.organization,
        sector: newRecord.sector,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Registration created successfully and receipt email sent.',
        data: {
          ...newRecord,
          password: assignedPassword, // Paired credentials returned upon registration
        },
        emailNotification: emailResult,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to submit registration',
      },
      { status: 400 }
    );
  }
}
