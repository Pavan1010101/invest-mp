import { NextResponse } from 'next/server';
import { OfficerStore, LocalStore } from '@/lib/server/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or ID
    const user = await OfficerStore.getByEmailOrId(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValid = bcrypt.compareSync(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Do not return the password hash in the response
    const { password: _, ...safeUser } = user;

    if (safeUser.role === 'attendee') {
      const reg = await LocalStore.getByEmail(safeUser.email);
      if (reg) {
        (safeUser as any).registrationId = reg.id;
      }
    }

    return NextResponse.json({
      success: true,
      data: safeUser,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
