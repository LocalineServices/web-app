/**
 * Term Lock/Unlock API endpoint
 * PATCH /api/v1/projects/:projectId/terms/:termId/lock - Toggle term lock status (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface LockTermRequest {
  isLocked: boolean;
}

// PATCH /api/v1/projects/:projectId/terms/:termId/lock - Admins only
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if authorized for PATCH (admin only)
    if (!isAuthorized('PATCH', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId, termId } = await params;
    const body: LockTermRequest = await request.json();

    // Verify term exists and get project info
    const existingTerm = await prisma.term.findUnique({
      where: { id: termId },
      select: { projectId: true },
    });

    if (!existingTerm) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    }

    if (existingTerm.projectId !== projectId) {
      return NextResponse.json({ error: 'Term not found in this project' }, { status: 404 });
    }

    // Verify admin access only
    if (auth.isApiKey) {
      // API key must match the project and have admin role
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can lock/unlock terms' },
          { status: 403 }
        );
      }
    } else {
      // Session user must own the project or be an admin member
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Only owner or admin member can lock/unlock
      if (!access.isOwner && access.memberRole !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can lock/unlock terms' },
          { status: 403 }
        );
      }
    }

    // Validate input
    if (typeof body.isLocked !== 'boolean') {
      return NextResponse.json(
        { error: 'isLocked must be a boolean' },
        { status: 400 }
      );
    }

    // Update term lock status
    const updatedTerm = await prisma.term.update({
      where: { id: termId },
      data: { isLocked: body.isLocked },
      select: {
        id: true,
        value: true,
        context: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
        labels: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        id: updatedTerm.id,
        value: updatedTerm.value,
        context: updatedTerm.context,
        isLocked: updatedTerm.isLocked,
        labels: updatedTerm.labels,
        date: {
          created: updatedTerm.createdAt,
          modified: updatedTerm.updatedAt,
        },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
