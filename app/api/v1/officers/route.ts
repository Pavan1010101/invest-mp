/**
 * SISMP — REST API Route Handler: /api/v1/officers
 * Manages Sector Nodal Officers & Staff Accounts in `.data/officers.json` disk database.
 */
import { NextResponse } from 'next/server';
import { OfficerStore } from '@/lib/server/db';

export async function GET() {
  try {
    const officers = await OfficerStore.getAll();
    return NextResponse.json({
      success: true,
      total: officers.length,
      data: officers,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch officers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.password || !body.sector) {
      return NextResponse.json(
        { success: false, error: 'Name, Email, Password, and Sector are strictly required.' },
        { status: 400 }
      );
    }

    const emailClean = body.email.trim().toLowerCase();
    const newOfficer = {
      id: body.id || `off-${Math.floor(1000 + Math.random() * 9000)}`,
      name: body.name.trim(),
      email: emailClean,
      password: body.password.trim(),
      sector: body.sector.trim(),
      department: body.department ? body.department.trim() : `Department of ${body.sector.trim()}`,
      role: body.role || 'department_officer',
      badgeRole: body.badgeRole || 'Government',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };

    const saved = await OfficerStore.insert(newOfficer as any);

    return NextResponse.json(
      {
        success: true,
        message: 'Nodal Officer account created and persisted to database.',
        data: saved,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Failed to create officer account',
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Officer ID is required' }, { status: 400 });
    }

    const deleted = await OfficerStore.delete(id);
    if (deleted) {
      return NextResponse.json({ success: true, message: `Officer account ${id} removed from database.` });
    } else {
      return NextResponse.json({ success: false, error: 'Officer account not found' }, { status: 444 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to delete officer account' }, { status: 400 });
  }
}
