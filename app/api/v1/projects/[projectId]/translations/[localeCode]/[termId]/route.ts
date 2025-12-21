/**
 * Update specific translation
 * PATCH /api/v1/projects/:projectId/translations/:localeCode/:termId - Update translation
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest, isAuthorized, checkProjectAccess, canAccessLocale } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface UpdateTranslationRequest {
  value: string;
}

// PATCH /api/v1/projects/:projectId/translations/:localeCode/:termId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; localeCode: string; termId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if authorized for PATCH
    if (!isAuthorized('PATCH', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId, localeCode, termId } = await params;
    const body: UpdateTranslationRequest = await request.json();

    // Verify project access
    if (auth.isApiKey) {
      // API key must match the project
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Session user must own the project or be a team member
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Check if editor has access to this locale
      if (access.memberRole === 'editor') {
        if (!canAccessLocale(localeCode, access.assignedLocales)) {
          return NextResponse.json(
            { error: 'You do not have access to translate this locale' },
            { status: 403 }
          );
        }
      }
    }

    // Validate input
    if (!body.value) {
      return NextResponse.json(
        { error: 'Translation value is required' },
        { status: 400 }
      );
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

    // Verify term exists in project and check lock status
    const term = await prisma.term.findFirst({
      where: {
        id: termId,
        projectId,
      },
      select: { id: true, isLocked: true },
    });

    if (!term) {
      return NextResponse.json(
        { error: 'Term not found' },
        { status: 404 }
      );
    }
    
    // If term is locked, check if user is admin
    if (term.isLocked) {
      if (auth.isApiKey) {
        // Only admin API keys can update locked terms
        if (auth.apiKeyRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      } else {
        // Only owner or admin members can update locked terms
        const access = await checkProjectAccess(auth.userId!, projectId);
        if (!access.isOwner && access.memberRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      }
    }

    // Check if translation exists
    const existingTranslation = await prisma.translation.findFirst({
      where: {
        termId,
        localeId: locale.id,
      },
      select: { id: true },
    });

    let translation;
    if (existingTranslation) {
      // Update existing translation
      translation = await prisma.translation.update({
        where: { id: existingTranslation.id },
        data: { value: body.value },
        select: {
          termId: true,
          value: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      // Create new translation
      const translationId = uuidv4();
      translation = await prisma.translation.create({
        data: {
          id: translationId,
          termId,
          localeId: locale.id,
          value: body.value,
        },
        select: {
          termId: true,
          value: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    // Return translation
    return NextResponse.json({
      data: {
        termId: translation.termId,
        value: translation.value,
        date: {
          created: translation.createdAt,
          modified: translation.updatedAt,
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
