/**
 * SISMP — REST API Route Handler: /api/v1/mou
 * MoU Digital Signature & Execution Controller.
 * Enforces Prompt Section 5 rule: Both Investor and Department Officer signatures are required for execution.
 */
import { NextResponse } from 'next/server';
import { MoUService } from '@/lib/server/services/mouService';
import { CRMService } from '@/lib/server/services/crmService';
import { MoUStore } from '@/lib/server/db';
import { MOU_STATUSES } from '@/lib/constants/statuses';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicantId');
    const participantId = searchParams.get('participantId');

    let data;
    if (participantId) {
      const allMous = await MoUStore.getAll();
      data = allMous.filter((m: any) => m.applicantId === participantId || m.targetId === participantId);
    } else if (applicantId) {
      data = await MoUStore.getByApplicantId(applicantId);
    } else {
      data = await MoUStore.getAll();
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, mouId, party, signatureHash, draftData } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'action parameter is required' },
        { status: 400 }
      );
    }

    if (action === 'draft') {
      if (!draftData) return NextResponse.json({ success: false, error: 'draftData required' }, { status: 400 });
      const newMoU = await MoUStore.insert({
        id: `MOU-${Math.floor(Math.random() * 90000) + 10000}`,
        ...draftData,
        investorSigned: false,
        departmentSigned: false,
        status: MOU_STATUSES.PENDING_SIGNATURES,
      });
      return NextResponse.json({ success: true, data: newMoU });
    }

    if (!mouId) return NextResponse.json({ success: false, error: 'mouId required' }, { status: 400 });

    const allMous = await MoUStore.getAll();
    const mou = allMous.find((m: any) => m.id === mouId);
    if (!mou) {
      return NextResponse.json({ success: false, error: 'MoU not found' }, { status: 404 });
    }

    if (action === 'sign') {
      const signed = await MoUService.signMoU(mou, party, signatureHash || 'hash_default');
      await MoUStore.update(mou.id, signed);
      return NextResponse.json({
        success: true,
        message: `MoU ${mouId} signed by ${party}`,
        data: signed,
      });
    }

    if (action === 'revoke') {
      const revoked = MoUService.revokeMoU(mou, party);
      await MoUStore.update(mou.id, revoked);
      return NextResponse.json({
        success: true,
        message: `MoU ${mouId} signature revoked by ${party}`,
        data: revoked,
      });
    }

    if (action === 'execute') {
      // Calls service to validate dual-signature requirement (Prompt Section 5)
      const executed = MoUService.executeMoU(mou);
      await MoUStore.update(mou.id, executed);

      // Auto-update CRM if there is a linked applicant (Investor)
      if (executed.applicantId) {
        CRMService.updatePipelineStatusByRegistration(executed.applicantId, 'Committed');
        CRMService.appendLogByRegistration(
          executed.applicantId,
          `System Auto-Log: MoU ${executed.id} Executed Successfully. Pipeline status advanced to Committed.`,
          'email'
        );
      }

      // Target (if any) could also be a registered attendee with a CRM record
      if (executed.targetId) {
        CRMService.updatePipelineStatusByRegistration(executed.targetId, 'Committed');
        CRMService.appendLogByRegistration(
          executed.targetId,
          `System Auto-Log: MoU ${executed.id} Executed Successfully. Pipeline status advanced to Committed.`,
          'email'
        );
      }

      return NextResponse.json({
        success: true,
        message: `MoU ${mouId} successfully executed`,
        data: executed,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'MoU execution failed',
      },
      { status: 403 }
    );
  }
}
