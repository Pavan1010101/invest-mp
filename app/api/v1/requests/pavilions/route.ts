import { NextResponse } from 'next/server';
import { PavilionRequestStore, PavilionRequestRecord } from '@/lib/server/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');

    if (applicantId) {
      const data = await PavilionRequestStore.getByApplicantId(applicantId);
      return NextResponse.json({ success: true, data });
    }

    const allRequests = await PavilionRequestStore.getAll();
    return NextResponse.json({ success: true, data: allRequests });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { applicantId, applicantName, companyName, requestedHall, preferredStallNumber, sector, powerRequirementKW } = body;

    if (!applicantId || !requestedHall) {
      return NextResponse.json({ success: false, error: 'applicantId and requestedHall are required.' }, { status: 400 });
    }

    const newReq: PavilionRequestRecord = {
      id: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      applicantId,
      applicantName: applicantName || 'Unknown',
      companyName: companyName || 'Unknown Company',
      requestedHall,
      preferredStallNumber: preferredStallNumber || 'Any',
      sector: sector || 'General',
      powerRequirementKW: Number(powerRequirementKW) || 2,
      requestDate: new Date().toISOString(),
      status: 'Pending',
    };

    const saved = await PavilionRequestStore.insert(newReq);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'id and status are required' }, { status: 400 });
    }

    const updated = await PavilionRequestStore.updateStatus(id, status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
