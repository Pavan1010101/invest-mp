import { NextResponse } from 'next/server';
import { LocalStore } from '@/lib/server/db';
import { MOCK_REGISTRATION_RECORDS } from '@/lib/api/mocks/staffMockData';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 });
    }

    // Look up by ID or Email (case-insensitive)
    const lowerQ = id.toLowerCase();
    const allRecords = await LocalStore.getAll();
    
    let found = allRecords.find((r) => r.id.toLowerCase() === lowerQ || r.email.toLowerCase() === lowerQ);

    // Fallback search in MOCK_REGISTRATION_RECORDS if not present in LocalStore file yet
    if (!found) {
      found = MOCK_REGISTRATION_RECORDS.find((r) => r.id.toLowerCase() === lowerQ || r.email.toLowerCase() === lowerQ);
    }

    if (found) {
      return NextResponse.json({ success: true, data: found });
    } else {
      // Return 200 with success: false so status page handles notFound state cleanly without browser 404 console errors
      return NextResponse.json({ success: false, data: null, error: 'Registration not found' }, { status: 200 });
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to look up registration' },
      { status: 500 }
    );
  }
}
