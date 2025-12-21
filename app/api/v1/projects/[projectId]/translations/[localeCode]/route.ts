/**
 * Translations for specific locale
 * GET /api/v1/projects/:projectId/translations/:localeCode - Get all translations for locale
 * DELETE /api/v1/projects/:projectId/translations/:localeCode - Delete locale by code
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthorized } from '@/lib/middleware';
import { prisma } from '@/lib/db';

// GET /api/v1/projects/:projectId/translations/:localeCode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, localeCode } = await params;

    // Verify project access
    const { checkProjectAccess } = await import('@/lib/middleware');
    const access = await checkProjectAccess(
      auth.userId!,
      projectId
    );

    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get locale
    const locale = await prisma.locale.findFirst({
      where: {
        projectId,
        code: localeCode,
      },
      select: { id: true },
    });

    if (!locale) {
      return NextResponse.json(
        { error: 'Locale not found' },
        { status: 404 }
      );
    }

    // Get translations for this locale with labels
    const translations = await prisma.translation.findMany({
      where: {
        localeId: locale.id,
        term: {
          projectId,
        },
      },
      select: {
        id: true,
        termId: true,
        value: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to expected format
    const transformedTranslations = translations.map((translation) => ({
      termId: translation.termId,
      value: translation.value,
      date: {
        created: translation.createdAt,
        modified: translation.updatedAt,
      },
    }));

    return NextResponse.json({ data: transformedTranslations });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/:projectId/translations/:localeCode - Delete locale by code
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if authorized for DELETE (admin only for API keys)
    if (!isAuthorized('DELETE', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - admin access required for deletion' },
        { status: 403 }
      );
    }

    const { projectId, localeCode } = await params;

    if (!localeCode) {
      return NextResponse.json(
        { error: 'Locale code is required' },
        { status: 400 }
      );
    }

    // Verify project access - admin or owner only for DELETE
    const { checkProjectAccess } = await import('@/lib/middleware');
    const access = await checkProjectAccess(
      auth.userId!,
      projectId
    );

    if (!access.hasAccess || (!access.isOwner && access.memberRole !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden - admin access required' }, { status: 403 });
    }

    // Delete locale by code (this will cascade delete translations due to ON DELETE CASCADE)
    const deleteResult = await prisma.locale.deleteMany({
      where: {
        projectId,
        code: localeCode,
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json(
        { error: 'Locale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
