/**
 * Team Members API endpoints
 * GET /api/v1/projects/:projectId/members - List team members
 * POST /api/v1/projects/:projectId/members - Add team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { authenticateRequest, parseAssignedLocales, canManageTeamMembers } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface AddMemberRequest {
  email: string;
  role: 'editor' | 'admin';
  assignedLocales?: string[]; // For editors only
}

// GET /api/v1/projects/:projectId/members
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

    const { projectId } = await params;

    if (auth.isApiKey) {
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Admin API key required to list team members' },
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
      const canManage = await canManageTeamMembers(auth.userId!, projectId);
      
      if (!canManage) {
        const members = await prisma.projectMember.findMany({
          where: { 
            projectId,
            userId: auth.userId,
          },
          select: {
            id: true,
            userId: true,
            role: true,
            assignedLocales: true,
            createdAt: true,
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const transformedMembers = members.map((member) => {
          const assignedLocales = parseAssignedLocales(member.assignedLocales);

          return {
            id: member.id,
            userId: member.userId,
            email: member.user.email,
            name: member.user.name,
            role: member.role,
            assignedLocales,
            createdAt: member.createdAt,
          };
        });

        return NextResponse.json({ data: transformedMembers });
      }
    }

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      select: {
        id: true,
        userId: true,
        role: true,
        assignedLocales: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const transformedMembers = members.map((member) => {
      const assignedLocales = parseAssignedLocales(member.assignedLocales);

      return {
        id: member.id,
        userId: member.userId,
        email: member.user.email,
        name: member.user.name,
        role: member.role,
        assignedLocales,
        createdAt: member.createdAt,
      };
    });

    return NextResponse.json({ data: transformedMembers });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/:projectId/members
export async function POST(
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
    const body: AddMemberRequest = await request.json();

    if (auth.isApiKey) {
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Admin API key required to add team members' },
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
      const canManage = await canManageTeamMembers(auth.userId!, projectId);
      
      if (!canManage) {
        return NextResponse.json(
          { error: 'Only project owner or admin members can add team members' },
          { status: 403 }
        );
      }
    }

    if (!body.email || body.email.trim().length === 0) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!body.role || !['editor', 'admin'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Role must be either "editor" or "admin"' },
        { status: 400 }
      );
    }

    const userToAdd = await prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, name: true },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: 'User with this email is not registered' },
        { status: 404 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { 
        ownerId: true,
        members: {
          where: { userId: userToAdd.id },
          select: { id: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.ownerId === userToAdd.id) {
      return NextResponse.json(
        { error: 'User is already the owner of this project' },
        { status: 409 }
      );
    }

    if (project.members.length > 0) {
      return NextResponse.json(
        { error: 'User is already a team member of this project' },
        { status: 409 }
      );
    }

    let assignedLocalesJson: string | null = null;
    if (body.assignedLocales && body.assignedLocales.length > 0) {
      if (body.role !== 'editor') {
        return NextResponse.json(
          { error: 'Assigned locales can only be set for editors' },
          { status: 400 }
        );
      }

      const locales = await prisma.locale.findMany({
        where: {
          projectId,
          code: { in: body.assignedLocales },
        },
        select: { code: true },
      });

      if (locales.length !== body.assignedLocales.length) {
        return NextResponse.json(
          { error: 'One or more assigned locales do not exist in this project' },
          { status: 400 }
        );
      }

      assignedLocalesJson = JSON.stringify(body.assignedLocales);
    }

    const memberId = uuidv4();
    const member = await prisma.projectMember.create({
      data: {
        id: memberId,
        projectId,
        userId: userToAdd.id,
        role: body.role,
        assignedLocales: assignedLocalesJson,
      },
      select: {
        id: true,
        userId: true,
        role: true,
        assignedLocales: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    const assignedLocales = parseAssignedLocales(member.assignedLocales);

    return NextResponse.json({
      data: {
        id: member.id,
        userId: member.userId,
        email: member.user.email,
        name: member.user.name,
        role: member.role,
        assignedLocales,
        createdAt: member.createdAt,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
