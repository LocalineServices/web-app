/**
 * Individual Project API endpoints
 * GET /api/v1/projects/:id - Get project details
 * PATCH /api/v1/projects/:id - Update project (requires session or admin API key or admin team member)
 * DELETE /api/v1/projects/:id - Delete project (requires session owner only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, isAuthorized, checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface UpdateProjectRequest {
  name?: string;
  description?: string;
}

// GET /api/v1/projects/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!isAuthorized(request.method, auth.apiKeyRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { projectId } = await params;

    if (auth.isApiKey && auth.projectId !== projectId) {
      return NextResponse.json(
        { error: 'API key not valid for this project' },
        { status: 403 }
      );
    }

    if (!auth.isApiKey) {
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          owner: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json({ data: project });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: project });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/v1/projects/:id - Only session auth or admin API keys or admin team members
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    if (auth.isApiKey) {
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Admin API key required to manage project settings' },
          { status: 403 }
        );
      }
      if (auth.projectId !== projectId) {
        return NextResponse.json(
          { error: 'API key not valid for this project' },
          { status: 403 }
        );
      }
    } else {
      const access = await checkProjectAccess(auth.userId!, projectId);
      
      if (!access.hasAccess) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      if (!access.isOwner && access.memberRole !== 'admin') {
        return NextResponse.json(
          { error: 'Only project owner or admin members can manage project settings' },
          { status: 403 }
        );
      }
    }

    const body: UpdateProjectRequest = await request.json();

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const updateData: { name?: string; description?: string | null } = {};

    if (body.name !== undefined) {
      updateData.name = body.name;
    }
    if (body.description !== undefined) {
      updateData.description = body.description;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
      },
    });

    return NextResponse.json({ data: updatedProject });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/:id - Only project owner can delete (not team members or API keys)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    if (auth.isApiKey) {
      return NextResponse.json(
        { error: 'API keys cannot delete projects' },
        { status: 403 }
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: auth.userId,
      },
      select: { id: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found or you are not the owner' },
        { status: 404 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
