import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, checkProjectAccess } from '@/lib/middleware';
import { v4 as uuidv4 } from 'uuid';

// GET /api/v1/projects/:projectId/labels - List all labels
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const labels = await prisma.label.findMany({
      where: { projectId },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        value: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });

    // Transform to match expected format
    const transformedLabels = labels.map(label => ({
      id: label.id,
      project_id: label.projectId,
      name: label.name,
      color: label.color,
      value: label.value,
      created_at: label.createdAt,
    }));

    return NextResponse.json({ labels: transformedLabels });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/:projectId/labels - Create a new label (admins only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API keys with admin role can create labels
    if (auth.isApiKey && auth.apiKeyRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId } = await params;
    const body = await request.json();
    const { name, color, value } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Label name is required' }, { status: 400 });
    }

    // Verify project access - editors cannot create labels
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

      // Editors cannot create labels
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot create labels' },
          { status: 403 }
        );
      }
    }

    // Check if label with same name already exists
    const existing = await prisma.label.findFirst({
      where: {
        projectId,
        name: name.trim(),
      },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Label with this name already exists' },
        { status: 409 }
      );
    }

    const labelId = uuidv4();
    const labelColor = color || '#808080';

    const label = await prisma.label.create({
      data: {
        id: labelId,
        projectId,
        name: name.trim(),
        color: labelColor,
        value: value?.trim() || null,
      },
      select: {
        id: true,
        projectId: true,
        name: true,
        color: true,
        value: true,
        createdAt: true,
      },
    });

    // Transform to match expected format
    const transformedLabel = {
      id: label.id,
      project_id: label.projectId,
      name: label.name,
      color: label.color,
      value: label.value,
      created_at: label.createdAt,
    };

    return NextResponse.json({ label: transformedLabel }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
