/**
 * SISMP — REST API Route Handler: /api/v1/meetings
 * B2G & B2B Meeting Scheduler Controller.
 * Features:
 * - Atomic room slot reservation with double-booking prevention lock
 * - Auto-expiry worker trigger
 */
import { NextResponse } from 'next/server';
import { MeetingSchedulerService } from '@/lib/server/services/meetingSchedulerService';
import { MeetingRequestStore } from '@/lib/server/db';

export async function GET() {
  try {
    const existingMeetings = await MeetingRequestStore.getAll();
    // Map fields from DB to match frontend expectations if necessary
    const formatted = existingMeetings.map((m: any) => ({
      id: m.id,
      investorName: m.applicantName || m.investorName,
      companyName: m.companyName,
      departmentName: m.departmentName,
      officerName: m.officerName || 'Department Officer',
      requestedDate: m.requestedDate,
      timeSlot: m.timeSlot,
      roomId: m.roomId,
      roomName: m.roomName,
      status: m.status,
      expiresAt: m.expiresAt,
      notes: m.notes,
      registrationId: m.registrationId,
      createdAt: m.createdAt || new Date().toISOString(),
    }));

    const updatedMeetings = MeetingSchedulerService.processAutoExpiry(formatted);

    return NextResponse.json({
      success: true,
      total: updatedMeetings.length,
      data: updatedMeetings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch meetings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const existingMeetings = await MeetingRequestStore.getAll();

    // Format DB existing meetings to match service check format
    const formattedExisting = existingMeetings.map((m: any) => ({
      id: m.id,
      investorName: m.applicantName || m.investorName,
      companyName: m.companyName,
      departmentName: m.departmentName,
      officerName: m.officerName || 'Department Officer',
      requestedDate: m.requestedDate,
      timeSlot: m.timeSlot,
      roomId: m.roomId,
      roomName: m.roomName,
      status: m.status,
      expiresAt: m.expiresAt,
      notes: m.notes,
      createdAt: m.createdAt || new Date().toISOString(),
    }));

    // Call service to reserve meeting with double-booking prevention lock
    const meeting = MeetingSchedulerService.reserveSlot(formattedExisting, body);

    const isB2B = body.officerId && String(body.officerId).startsWith('IMP');
    const finalStatus = isB2B ? 'Pending_Peer_Acceptance' : meeting.status;

    // Persist to database!
    await MeetingRequestStore.insert({
      id: meeting.id,
      applicantId: body.applicantId || body.registrationId || meeting.investorName,
      applicantName: meeting.investorName,
      companyName: meeting.companyName,
      sector: body.sector || 'General',
      requestDate: meeting.requestedDate,
      requestedDate: meeting.requestedDate,
      status: finalStatus as any,
      roomId: meeting.roomId,
      roomName: meeting.roomName,
      officerId: body.officerId || null,
      officerName: meeting.officerName,
      departmentName: meeting.departmentName,
      timeSlot: meeting.timeSlot,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Meeting slot reserved successfully',
        data: meeting,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Conflict or reservation failure',
      },
      { status: 409 }
    );
  }
}
