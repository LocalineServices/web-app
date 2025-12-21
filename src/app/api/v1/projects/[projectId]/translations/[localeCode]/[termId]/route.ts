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

    if (!isAuthorized('PATCH', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId, localeCode, termId } = await params;
    const body: UpdateTranslationRequest = await request.json();

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
        if (!canAccessLocale(localeCode, access.assignedLocales)) {
          return NextResponse.json(
            { error: 'You do not have access to translate this locale' },
            { status: 403 }
          );
        }
      }
    }

    if (!body.value) {
      return NextResponse.json(
        { error: 'Translation value is required' },
        { status: 400 }
      );
    }

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
    
    if (term.isLocked) {
      if (auth.isApiKey) {
        if (auth.apiKeyRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      } else {
        const access = await checkProjectAccess(auth.userId!, projectId);
        if (!access.isOwner && access.memberRole !== 'admin') {
          return NextResponse.json(
            { error: 'This term is locked and can only be translated by admins' },
            { status: 403 }
          );
        }
      }
    }

    const existingTranslation = await prisma.translation.findFirst({
      where: {
        termId,
        localeId: locale.id,
      },
      select: { id: true },
    });

    let translation;
    if (existingTranslation) {
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
