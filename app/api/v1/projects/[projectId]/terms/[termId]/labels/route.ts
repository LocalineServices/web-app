/**
 * Term Labels API endpoints
 * PUT /api/v1/projects/:projectId/terms/:termId/labels - Set term labels (editors and admins)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface SetLabelsRequest {
  labelIds: string[];
}

// PUT /api/v1/projects/:projectId/terms/:termId/labels
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; termId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { termId, projectId } = await params;
    const body: SetLabelsRequest = await request.json();

    // Verify project access and store for reuse
    let sessionAccess: Awaited<ReturnType<typeof checkProjectAccess>> | null = null;
    
    if (auth.isApiKey) {
      // API key must match the project
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      // Check API key has editor or admin role
      if (!isAuthorized('PUT', auth.apiKeyRole)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else {
      // Session user must own the project or be a team member
      sessionAccess = await checkProjectAccess(auth.userId!, projectId);
      
      if (!sessionAccess.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }
    }

    // Verify term belongs to the project
    const term = await prisma.term.findFirst({
      where: {
        id: termId,
        projectId,
      },
      select: {
        id: true,
        isLocked: true,
      },
    });

    if (!term) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }
    
    // If term is locked, only admins can modify labels
    if (term.isLocked) {
      if (auth.isApiKey) {
        // API key must have admin role
        if (auth.apiKeyRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and its labels can only be modified by admins' },
            { status: 403 }
          );
        }
      } else {
        // Session user must be owner or admin team member (reuse cached access check)
        if (!sessionAccess!.isOwner && sessionAccess!.memberRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and its labels can only be modified by admins' },
            { status: 403 }
          );
        }
      }
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
    const updatedTerm = await prisma.term.update({
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
        id: updatedTerm.id,
        value: updatedTerm.value,
        context: updatedTerm.context,
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
