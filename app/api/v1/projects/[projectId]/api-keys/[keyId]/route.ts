/**
 * Individual API Key management
 * DELETE /api/v1/projects/:projectId/api-keys/:keyId - Revoke API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Helper to verify project ownership
async function verifyProjectOwnership(projectId: string, userId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
    select: { id: true },
  });
  return !!project;
}

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

    // Verify project ownership
    const hasAccess = await verifyProjectOwnership(projectId, currentUser.userId);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Verify API key belongs to project
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

    // Revoke API key (soft delete)
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
