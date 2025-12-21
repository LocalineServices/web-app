/**
 * Locales API endpoints
 * GET /api/v1/projects/:projectId/translations - List all locales
 * POST /api/v1/projects/:projectId/translations - Add new locale (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';
import { isValidLocaleCode, getLocaleByCode } from '@/lib/locales';

interface AddLocaleRequest {
  code: string;
}

// GET /api/v1/projects/:projectId/translations - List locales
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

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
    }

    // Get locales
    const locales = await prisma.locale.findMany({
      where: { projectId },
      select: {
        id: true,
        code: true,
        language: true,
        region: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Transform to expected format
    const transformedLocales = locales.map((locale) => ({
      id: locale.id,
      locale: {
        code: locale.code,
        language: locale.language,
        region: locale.region,
      },
      date: locale.createdAt,
    }));

    return NextResponse.json({ data: transformedLocales });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/:projectId/translations - Add locale (admins only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if authorized for POST
    if (!isAuthorized('POST', auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Forbidden - insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId } = await params;
    const body: AddLocaleRequest = await request.json();

    // Verify project access - editors cannot add locales
    if (auth.isApiKey) {
      // API key must match the project
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Session user must own the project or be an admin member (not editor)
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Editors cannot add locales
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot add locales' },
          { status: 403 }
        );
      }
    }

    // Validate input
    if (!body.code || body.code.trim().length === 0) {
      return NextResponse.json(
        { error: 'Locale code is required' },
        { status: 400 }
      );
    }

    // Validate locale code against predefined list
    if (!isValidLocaleCode(body.code)) {
      return NextResponse.json(
        { error: 'Invalid locale code. Please use a supported locale code (e.g., en_US, de_DE, fr_FR)' },
        { status: 400 }
      );
    }

    // Get locale definition
    const localeDefinition = getLocaleByCode(body.code);
    if (!localeDefinition) {
      return NextResponse.json(
        { error: 'Locale definition not found' },
        { status: 400 }
      );
    }

    // Check if locale already exists
    const existingLocale = await prisma.locale.findFirst({
      where: {
        projectId,
        code: body.code,
      },
      select: { id: true },
    });

    if (existingLocale) {
      return NextResponse.json(
        { error: 'Locale already exists' },
        { status: 409 }
      );
    }

    // Create locale with language and region populated
    const localeId = uuidv4();
    const locale = await prisma.locale.create({
      data: {
        id: localeId,
        projectId,
        code: body.code,
        language: localeDefinition.language,
        region: localeDefinition.region,
      },
      select: {
        id: true,
        code: true,
        language: true,
        region: true,
        createdAt: true,
      },
    });

    // Return created locale
    return NextResponse.json({
      data: {
        id: locale.id,
        locale: {
          code: locale.code,
          language: locale.language,
          region: locale.region,
        },
        date: locale.createdAt,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

