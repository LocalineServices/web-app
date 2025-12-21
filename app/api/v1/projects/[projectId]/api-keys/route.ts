/**
 * API Keys management
 * GET /api/v1/projects/:projectId/api-keys - List API keys
 * POST /api/v1/projects/:projectId/api-keys - Create API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, generateApiKey, hashApiKey } from '@/lib/auth';
import { checkProjectAccess } from '@/lib/middleware';
import { prisma } from '@/lib/db';

interface CreateApiKeyRequest {
  name: string;
  role: 'read-only' | 'editor' | 'admin';
}

// GET /api/v1/projects/:projectId/api-keys
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    const access = await checkProjectAccess(currentUser.userId, projectId);
    
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!access.isOwner && access.memberRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only project owner or admin members can manage API keys' },
        { status: 403 }
      );
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        projectId,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
        revokedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: apiKeys });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/projects/:projectId/api-keys
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body: CreateApiKeyRequest = await request.json();

    const access = await checkProjectAccess(currentUser.userId, projectId);
    
    if (!access.hasAccess) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (!access.isOwner && access.memberRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only project owner or admin members can manage API keys' },
        { status: 403 }
      );
    }

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    if (!['read-only', 'editor', 'admin'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be read-only, editor, or admin' },
        { status: 400 }
      );
    }

    const apiKey = generateApiKey();
    const keyHash = await hashApiKey(apiKey);

    const keyId = uuidv4();
    const createdKey = await prisma.apiKey.create({
      data: {
        id: keyId,
        projectId,
        name: body.name,
        keyHash,
        role: body.role,
      },
      select: {
        id: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      data: {
        id: createdKey.id,
        name: createdKey.name,
        role: createdKey.role,
        key: apiKey, // Only returned once
        createdAt: createdKey.createdAt,
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
