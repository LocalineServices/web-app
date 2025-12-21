import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { authenticateRequest, checkProjectAccess } from '@/lib/middleware';

// PATCH /api/v1/projects/:projectId/labels/:labelId - Update a label
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; labelId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API keys with admin role can update labels
    if (auth.isApiKey && auth.apiKeyRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId, labelId } = await params;
    const body = await request.json();
    const { name, color, value } = body;

    // Verify project access
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

      // Editors cannot update labels
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot update labels' },
          { status: 403 }
        );
      }
    }

    // Verify label exists and belongs to project
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
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

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    // Check if new name conflicts with existing label
    if (name && name.trim() !== label.name) {
      const existing = await prisma.label.findFirst({
        where: {
          projectId,
          name: name.trim(),
          id: { not: labelId },
        },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Label with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Build update data
    const updateData: { name?: string; color?: string; value?: string | null } = {};

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }

    if (color !== undefined) {
      updateData.color = color;
    }

    if (value !== undefined) {
      updateData.value = value?.trim() || null;
    }

    if (Object.keys(updateData).length === 0) {
      // Transform to match expected format
      const transformedLabel = {
        id: label.id,
        project_id: label.projectId,
        name: label.name,
        color: label.color,
        value: label.value,
        created_at: label.createdAt,
      };
      return NextResponse.json({ label: transformedLabel });
    }

    const updatedLabel = await prisma.label.update({
      where: { id: labelId },
      data: updateData,
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
      id: updatedLabel.id,
      project_id: updatedLabel.projectId,
      name: updatedLabel.name,
      color: updatedLabel.color,
      value: updatedLabel.value,
      created_at: updatedLabel.createdAt,
    };

    return NextResponse.json({ label: transformedLabel });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/:projectId/labels/:labelId - Delete a label
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; labelId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // API keys with admin role can delete labels
    if (auth.isApiKey && auth.apiKeyRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { projectId, labelId } = await params;

    // Verify project access
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

      // Editors cannot delete labels
      if (access.memberRole === 'editor') {
        return NextResponse.json(
          { error: 'Editors cannot delete labels' },
          { status: 403 }
        );
      }
    }

    // Verify label exists and belongs to project
    const label = await prisma.label.findFirst({
      where: {
        id: labelId,
        projectId,
      },
      select: { id: true },
    });

    if (!label) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 });
    }

    // Delete the label (cascade will handle junction tables)
    await prisma.label.delete({
      where: { id: labelId },
    });

    return NextResponse.json({ message: 'Label deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
