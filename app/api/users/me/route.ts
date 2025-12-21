/**
 * User Profile API
 * GET /api/users/me - Get current user profile
 * PATCH /api/users/me - Update user profile
 * DELETE /api/users/me - Delete user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, removeAuthCookie } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// GET /api/users/me
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: currentUser.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: UpdateProfileRequest = await request.json();

    // Validate input
    const updateData: { name?: string; email?: string } = {};

    if (body.name !== undefined) {
      if (!body.name || body.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = body.name;
    }

    if (body.email !== undefined) {
      if (!body.email || body.email.trim().length === 0) {
        return NextResponse.json(
          { error: 'Email cannot be empty' },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      const existingUser = await prisma.user.findFirst({
        where: {
          email: body.email,
          NOT: { id: currentUser.userId },
        },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 409 }
        );
      }

      updateData.email = body.email;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/me
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check if user owns any projects
    const ownedProjectsCount = await prisma.project.count({
      where: { ownerId: currentUser.userId },
    });

    if (ownedProjectsCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account while owning projects. Please delete or transfer ownership of all projects first.' },
        { status: 400 }
      );
    }

    // Delete user account
    // Note: ProjectMember entries will be automatically deleted due to onDelete: Cascade in the schema
    await prisma.user.delete({
      where: { id: currentUser.userId },
    });

    // Clear authentication cookie
    await removeAuthCookie();

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
