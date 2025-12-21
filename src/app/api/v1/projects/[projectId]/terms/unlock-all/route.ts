/**
 * Lock/Unlock All Terms API endpoints
 * POST /api/v1/projects/:projectId/terms/unlock-all - Unlock all terms in project (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, checkProjectAccess } from '@/lib/middleware';

// POST /api/v1/projects/:projectId/terms/unlock-all - Unlock all terms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (auth.isApiKey && auth.apiKeyRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId } = await params;

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
          { error: 'Editors cannot unlock terms' },
          { status: 403 }
        );
      }
    }

    const result = await prisma.term.updateMany({
      where: {
        projectId,
      },
      data: {
        isLocked: false,
      },
    });

    return NextResponse.json({ 
      message: 'All terms unlocked successfully',
      count: result.count,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
