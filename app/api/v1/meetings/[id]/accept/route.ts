import { NextResponse } from 'next/server';
import { MeetingRequestStore } from '@/lib/server/db';

export async function PATCH(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { action } = body; // 'accept' or 'decline'

    if (!action || !['accept', 'decline'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
    }

    const newStatus = action === 'accept' ? 'Requested' : 'Declined';

    await MeetingRequestStore.update(id, {
      status: newStatus as any
    });

    return NextResponse.json({
      success: true,
      message: `Meeting ${action}ed successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update meeting status.' },
      { status: 500 }
    );
  }
}
