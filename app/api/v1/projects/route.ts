/**
 * Projects API endpoints
 * GET /api/v1/projects - List user's projects
 * POST /api/v1/projects - Create a new project
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface CreateProjectRequest {
  name: string;
  description?: string;
}

// GET /api/v1/projects - List user's projects (owned and team member)
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: currentUser.userId },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const memberProjects = await prisma.projectMember.findMany({
      where: { userId: currentUser.userId },
      select: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        role: true,
      },
    });

    const allProjects = [
      ...ownedProjects.map(p => ({ ...p, memberRole: null })),
      ...memberProjects.map(m => ({ ...m.project, memberRole: m.role })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({ data: allProjects });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body: CreateProjectRequest = await request.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    const projectId = uuidv4();
    const project = await prisma.project.create({
      data: {
        id: projectId,
        name,
        description: description || null,
        ownerId: currentUser.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
      },
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
