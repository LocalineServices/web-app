/**
 * Signup API endpoint
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie, areSignupsEnabled } from '@/lib/auth';

interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check if signups are enabled
    if (!areSignupsEnabled()) {
      return NextResponse.json(
        { error: 'Account creation is currently disabled' },
        { status: 403 }
      );
    }

    const body: SignupRequest = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const userId = uuidv4();
    await prisma.user.create({
      data: {
        id: userId,
        email,
        passwordHash,
        name,
      },
    });

    const token = generateToken({ userId, email });
    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: userId,
        email,
        name,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
