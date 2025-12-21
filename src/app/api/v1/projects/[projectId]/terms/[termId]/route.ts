/**
 * Individual Term API endpoints
 * PATCH /api/v1/projects/:projectId/terms/:termId - Update term (admins only)
 * DELETE /api/v1/projects/:projectId/terms/:termId - Delete term (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface UpdateTermRequest {
  value?: string;
  context?: string;
}

// PATCH /api/v1/projects/:projectId/terms/:termId - Admins only (editors cannot modify terms)
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

    if (!isAuthorized('PATCH', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId, termId } = await params;
    const body: UpdateTermRequest = await request.json();

    const existingTerm = await prisma.term.findUnique({
      where: { id: termId },
      select: { projectId: true, isLocked: true },
    });

    if (!existingTerm) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 });
    }

    if (existingTerm.projectId !== projectId) {
      return NextResponse.json({ error: 'Term not found in this project' }, { status: 404 });
    }

    if (auth.isApiKey) {
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      
      if (existingTerm.isLocked && auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'This term is locked and can only be modified by admins' },
          { status: 403 }
        );
      }
    } else {
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot update terms' },
          { status: 403 }
        );
      }
      
      if (existingTerm.isLocked && !access.isOwner && access.memberRole !== 'admin') {
        return NextResponse.json(
          { error: 'This term is locked and can only be modified by admins' },
          { status: 403 }
        );
      }
    }

    const updateData: { value?: string; context?: string | null } = {};

    if (body.value !== undefined) {
      updateData.value = body.value;
    }
    if (body.context !== undefined) {
      updateData.context = body.context;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedTerm = await prisma.term.update({
      where: { id: termId },
      data: updateData,
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

// DELETE /api/v1/projects/:projectId/terms/:termId - Admins only (editors cannot delete terms)
export async function DELETE(
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

    if (!isAuthorized('DELETE', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required for deletion' },
        { status: 403 }
      );
    }

    const { projectId, termId } = await params;

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

    if (auth.isApiKey) {
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot delete terms' },
          { status: 403 }
        );
      }
    }

    await prisma.term.delete({
      where: { id: termId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
