/**
 * Individual API Key management
 * DELETE /api/v1/projects/:projectId/api-keys/:keyId - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkProjectAccess } from '@/lib/middleware';

// DELETE /api/v1/projects/:projectId/api-keys/:keyId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; keyId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId, keyId } = await params;

    const access = await checkProjectAccess(currentUser.userId, projectId);
    
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!access.isOwner && access.memberRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only project owners and admins can delete API keys' },
        { status: 403 }
      );
    }

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        projectId,
      },
      select: { id: true },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
