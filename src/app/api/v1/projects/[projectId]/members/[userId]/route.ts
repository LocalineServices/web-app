/**
 * Individual Team Member API endpoints
 * PATCH /api/v1/projects/:projectId/members/:userId - Update team member
 * DELETE /api/v1/projects/:projectId/members/:userId - Remove team member
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, parseAssignedLocales, canManageTeamMembers } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface UpdateMemberRequest {
  role?: 'editor' | 'admin';
  assignedLocales?: string[]; // For editors only
}

// PATCH /api/v1/projects/:projectId/members/:userId
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId, userId } = await params;
    const body: UpdateMemberRequest = await request.json();

    if (auth.isApiKey) {
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Admin API key required to update team members' },
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
          { error: 'Only project owner or admin members can update team members' },
          { status: 403 }
        );
      }
    }

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    const updateData: {
      role?: string;
      assignedLocales?: string | null;
    } = {};

    if (body.role !== undefined) {
      if (!['editor', 'admin'].includes(body.role)) {
        return NextResponse.json(
          { error: 'Role must be either "editor" or "admin"' },
          { status: 400 }
        );
      }
      updateData.role = body.role;
      
      if (body.role === 'admin') {
        updateData.assignedLocales = null;
      }
    }

    if (body.assignedLocales !== undefined) {
      const currentMember = await prisma.projectMember.findUnique({
        where: { id: member.id },
        select: { role: true },
      });
      
      const effectiveRole = body.role || currentMember?.role;

      if (effectiveRole === 'editor') {
        if (body.assignedLocales.length > 0) {
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

          updateData.assignedLocales = JSON.stringify(body.assignedLocales);
        } else {
          updateData.assignedLocales = null;
        }
      } else if (effectiveRole === 'admin') {
        updateData.assignedLocales = null;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.projectMember.update({
      where: { id: member.id },
      data: updateData,
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

    const assignedLocales = parseAssignedLocales(updatedMember.assignedLocales);

    return NextResponse.json({
      data: {
        id: updatedMember.id,
        userId: updatedMember.userId,
        email: updatedMember.user.email,
        name: updatedMember.user.name,
        role: updatedMember.role,
        assignedLocales,
        createdAt: updatedMember.createdAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/projects/:projectId/members/:userId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; userId: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId, userId } = await params;

    if (auth.isApiKey) {
      if (auth.apiKeyRole !== 'admin') {
        return NextResponse.json(
          { error: 'Admin API key required to remove team members' },
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
          { error: 'Only project owner or admin members can remove team members' },
          { status: 403 }
        );
      }
    }

    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
      },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      );
    }

    await prisma.projectMember.delete({
      where: { id: member.id },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
