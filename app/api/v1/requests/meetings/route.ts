import { NextResponse } from 'next/server';
import { MeetingRequestStore, MeetingRequestRecord, LocalStore, OfficerStore } from '@/lib/server/db';
import { EmailService } from '@/lib/server/services/emailService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    const allRequests = await MeetingRequestStore.getAll();
    if (applicantId) {
      const data = allRequests.filter((m: any) => m.registrationId === applicantId || m.applicantId === applicantId || m.officerId === applicantId);
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ success: true, data: allRequests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicantId, applicantName, companyName, sector, durationMins, officerId, officerName, departmentName, requestedDate, timeSlot } = body;

    if (!applicantId || !sector) {
      return NextResponse.json({ success: false, error: 'applicantId and sector are required.' }, { status: 400 });
    }

    // Ensure applicantId is the Registration ID (e.g. IMP26-...)
    // If it's an email or Mongo ID, find the real Registration ID
    let finalApplicantId = applicantId;
    if (applicantId && !applicantId.startsWith('IMP')) {
      const reg = await LocalStore.getByEmail(applicantId) || await LocalStore.getById(applicantId);
      if (reg) {
        finalApplicantId = reg.id;
        applicantName = applicantName === 'Current User' || applicantName === 'Unknown' ? reg.applicantName : applicantName;
        companyName = companyName === 'Independent' || companyName === 'Unknown Company' ? reg.organization : companyName;
      }
    }

    let finalOfficerId = officerId;
    if (officerId && !officerId.startsWith('IMP')) {
      const offReg = await LocalStore.getByEmail(officerId) || await LocalStore.getById(officerId);
      if (offReg) finalOfficerId = offReg.id;
    }

    const newReq: MeetingRequestRecord = {
      id: `meet-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      applicantId: finalApplicantId,
      applicantName: applicantName || 'Unknown',
      companyName: companyName || 'Unknown Company',
      sector,
      durationMins: durationMins ? Number(durationMins) : 30,
      requestDate: new Date().toISOString(),
      status: (finalOfficerId && String(finalOfficerId).startsWith('IMP')) ? 'Pending_Peer_Acceptance' : (officerName ? 'Requested' : 'Pending'), // P2P meetings wait for peer acceptance
      
      // P2P Fields
      officerId: finalOfficerId,
      officerName,
      departmentName,
      requestedDate,
      timeSlot
    };

    const saved = await MeetingRequestStore.insert(newReq);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, scheduledTime, meetingLink, roomId, roomName } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const updates: any = { status };
    if (scheduledTime) updates.timeSlot = scheduledTime;
    if (roomId) updates.roomId = roomId;
    if (roomName) updates.roomName = roomName;
    if (meetingLink) updates.meetingLink = meetingLink;

    const updated = await MeetingRequestStore.update(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Send notifications if meeting is scheduled
    if (status === 'Scheduled') {
      try {
        const applicant = await LocalStore.getById(updated.registrationId);
        let officer = await LocalStore.getById(updated.officerId || '');
        if (!officer && updated.officerId) {
          officer = await OfficerStore.getByEmailOrId(updated.officerId);
        }

        const date = updated.requestedDate || updated.requestDate || 'TBD';
        const finalTimeSlot = updated.timeSlot || 'TBD';
        const finalRoomName = updated.roomName || 'TBD';
        const otherPartyForApplicant = officer?.applicantName || officer?.name || updated.departmentName || 'Target Party';
        const otherPartyForOfficer = applicant?.applicantName || 'Target Party';

        if (applicant?.email) {
          await EmailService.sendMeetingScheduledEmail({
            to: applicant.email,
            recipientName: applicant.applicantName || 'Applicant',
            otherPartyName: otherPartyForApplicant,
            date,
            timeSlot: finalTimeSlot,
            roomName: finalRoomName,
            meetingId: updated.id
          });
        }

        if (officer?.email) {
          await EmailService.sendMeetingScheduledEmail({
            to: officer.email,
            recipientName: officer.applicantName || officer.name || 'Officer',
            otherPartyName: otherPartyForOfficer,
            date,
            timeSlot: finalTimeSlot,
            roomName: finalRoomName,
            meetingId: updated.id
          });
        }
      } catch (emailErr) {
        console.error('Failed to send meeting scheduled emails:', emailErr);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

