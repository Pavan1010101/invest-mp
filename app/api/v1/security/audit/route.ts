/**
 * SISMP — REST API Route Handler: /api/v1/security/audit
 * Manages Gate Access Audits & Statistics in `.data/gate_audits.json` disk database.
 */
import { NextResponse } from 'next/server';
import { GateAuditStore, GateAuditRecord } from '@/lib/server/db';

export async function GET() {
  try {
    const audits = await GateAuditStore.getAll();
    const stats = {
      totalScans: audits.length,
      granted: audits.filter((a) => a.status === 'GRANTED').length,
      denied: audits.filter((a) => a.status === 'DENIED').length,
    };

    return NextResponse.json({
      success: true,
      stats,
      data: audits,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch gate audits' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.regId || !body.status || !body.gate) {
      return NextResponse.json(
        { success: false, error: 'regId, status, and gate are required.' },
        { status: 400 }
      );
    }

    const newAudit: GateAuditRecord = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      regId: body.regId.toUpperCase(),
      applicantName: body.applicantName || 'Unknown Attendee',
      organization: body.organization || 'N/A',
      badgeRole: body.badgeRole || 'Unknown',
      gate: body.gate,
      status: body.status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reason: body.reason || undefined,
    };

    const saved = await GateAuditStore.insert(newAudit);

    return NextResponse.json(
      {
        success: true,
        data: saved,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record audit log' },
      { status: 400 }
    );
  }
}
