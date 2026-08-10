import { NextResponse } from 'next/server';
import { CRMService } from '@/lib/server/services/crmService';

export async function GET(request: Request) {
  try {
    const records = await CRMService.getAll();
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, crmId, registrationId, status, summary, type } = body;

    if (action === 'updateStatus' && registrationId && status) {
      const updated = CRMService.updatePipelineStatusByRegistration(registrationId, status);
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'appendLog' && registrationId && summary) {
      const updated = CRMService.appendLogByRegistration(registrationId, summary, type || 'email');
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ success: false, error: 'Invalid action or missing parameters' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
