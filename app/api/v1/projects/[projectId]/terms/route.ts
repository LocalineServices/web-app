/**
 * Terms API endpoints
 * GET /api/v1/projects/:projectId/terms - List terms
 * POST /api/v1/projects/:projectId/terms - Create term (admins only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface CreateTermRequest {
  value: string;
  context?: string;
}

// GET /api/v1/projects/:projectId/terms
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

    // Get terms with labels
    const terms = await prisma.term.findMany({
      where: { projectId },
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
            value: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Transform to expected format
    const transformedTerms = terms.map((term) => ({
      id: term.id,
      value: term.value,
      context: term.context,
      isLocked: term.isLocked,
      labels: term.labels,
      date: {
        created: term.createdAt,
        modified: term.updatedAt,
      },
    }));

    return NextResponse.json({ data: transformedTerms });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/:projectId/terms - Requires admin permissions
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
    const body: CreateTermRequest = await request.json();

    // Verify project access - editors cannot create terms, only admins
    if (auth.isApiKey) {
      // API key must match the project and have admin or editor role
      if (auth.projectId !== projectId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Session user must own the project or be an admin member (not editor)
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Editors cannot create terms, only translate
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors can only translate existing terms' },
          { status: 403 }
        );
      }
    }

    // Validate input
    if (!body.value || body.value.trim().length === 0) {
      return NextResponse.json(
        { error: 'Term value is required' },
        { status: 400 }
      );
    }

    // Check if term with same value already exists in this project
    const existingTerm = await prisma.term.findFirst({
      where: {
        projectId,
        value: body.value.trim(),
      },
      select: { id: true },
    });

    if (existingTerm) {
      return NextResponse.json(
        { error: 'A term with this key already exists in this project' },
        { status: 409 }
      );
    }

    // Create term
    const termId = uuidv4();
    const term = await prisma.term.create({
      data: {
        id: termId,
        projectId,
        value: body.value,
        context: body.context || null,
      },
      select: {
        id: true,
        value: true,
        context: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return created term
    return NextResponse.json({
      data: {
        id: term.id,
        value: term.value,
        context: term.context,
        isLocked: term.isLocked,
        labels: [],
        date: {
          created: term.createdAt,
          modified: term.updatedAt,
        },
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
