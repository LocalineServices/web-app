/**
 * Lock/Unlock All Terms API endpoints
 * POST /api/v1/projects/:projectId/terms/lock-all - Lock all terms in project (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, checkProjectAccess } from '@/lib/middleware';

// POST /api/v1/projects/:projectId/terms/lock-all - Lock all terms
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API keys with admin role can lock terms
    if (auth.isApiKey && auth.apiKeyRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId } = await params;

    // Verify project access
    if (auth.isApiKey) {
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Editors cannot lock terms
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot lock terms' },
          { status: 403 }
        );
      }
    }

    // Lock all terms for this project
    const result = await prisma.term.updateMany({
      where: {
        projectId,
      },
      data: {
        isLocked: true,
      },
    });

    return NextResponse.json({ 
      message: 'All terms locked successfully',
      count: result.count,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
