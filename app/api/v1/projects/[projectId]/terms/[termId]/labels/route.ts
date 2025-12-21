/**
 * Term Labels API endpoints
 * PUT /api/v1/projects/:projectId/terms/:termId/labels - Set term labels
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface SetLabelsRequest {
  labelIds: string[];
}

// Helper to verify term access (owner or team member)
async function verifyTermAccess(termId: string, projectId: string, userId: string): Promise<{
  hasAccess: boolean;
  isLocked: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}> {
  const term = await prisma.term.findFirst({
    where: {
      id: termId,
      projectId,
    },
    select: { 
      id: true,
      isLocked: true,
      project: {
        select: {
          ownerId: true,
          members: {
            where: {
              userId,
            },
            select: {
              id: true,
              role: true,
            },
          },
        },
      },
    },
  });
  
  if (!term) {
    return { hasAccess: false, isLocked: false, isOwner: false, isAdmin: false };
  }
  
  const isOwner = term.project.ownerId === userId;
  const member = term.project.members[0];
  const isAdmin = isOwner || (member && member.role === 'admin');
  
  // Allow if user is owner or a team member
  return {
    hasAccess: isOwner || term.project.members.length > 0,
    isLocked: term.isLocked,
    isOwner,
    isAdmin,
  };
}

// PUT /api/v1/projects/:projectId/terms/:termId/labels
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { termId, projectId } = await params;
    const body: SetLabelsRequest = await request.json();

    // Verify access (owner or team member)
    const access = await verifyTermAccess(termId, projectId, currentUser.userId);
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: 'Term not found or access denied' },
        { status: 404 }
      );
    }
    
    // If term is locked, only admins can modify labels
    if (access.isLocked && !access.isAdmin) {
      return NextResponse.json(
        { error: 'This term is locked and its labels can only be modified by admins' },
        { status: 403 }
      );
    }

    // Validate that all label IDs belong to the project
    if (body.labelIds && body.labelIds.length > 0) {
      const labels = await prisma.label.findMany({
        where: {
          id: { in: body.labelIds },
          projectId,
        },
        select: { id: true },
      });

      if (labels.length !== body.labelIds.length) {
        return NextResponse.json(
          { error: 'One or more labels not found in this project' },
          { status: 400 }
        );
      }
    }

    // Update term labels using set operation
    const term = await prisma.term.update({
      where: { id: termId },
      data: {
        labels: {
          set: body.labelIds.map(id => ({ id })),
        },
      },
      select: {
        id: true,
        value: true,
        context: true,
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
        id: term.id,
        value: term.value,
        context: term.context,
        labels: term.labels,
        date: {
          created: term.createdAt,
          modified: term.updatedAt,
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
