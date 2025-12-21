/**
 * API authentication middleware
 * Handles both JWT session authentication and API key authentication
 */

import { NextRequest } from 'next/server';
import { getCurrentUser, verifyApiKey } from '@/lib/auth';
import { prisma } from '@/lib/db';

export interface AuthContext {
  userId?: string;
  projectId?: string;
  apiKeyRole?: 'read-only' | 'editor' | 'admin';
  isApiKey: boolean;
  // Team member context
  teamMemberRole?: 'editor' | 'admin';
  assignedLocales?: string[]; // For editors with locale restrictions
  isOwner?: boolean;
}

/**
 * Authenticate request - supports both session and API key
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  // Check for API key in Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const apiKey = authHeader.substring(7);
    
    // Get all non-revoked API keys
    const apiKeys = await prisma.apiKey.findMany({
      where: { revokedAt: null },
      select: {
        id: true,
        projectId: true,
        keyHash: true,
        role: true,
      },
    });
    
    // Verify the provided API key against each stored hash
    for (const keyRecord of apiKeys) {
      const isValid = await verifyApiKey(apiKey, keyRecord.keyHash);
      if (isValid) {
        // The role is already in the correct format from database
        return {
          projectId: keyRecord.projectId,
          apiKeyRole: keyRecord.role as 'read-only' | 'editor' | 'admin',
          isApiKey: true,
        };
      }
    }
    
    // No matching API key found
    return null;
  }

  // Fall back to session authentication
  const currentUser = await getCurrentUser();
  if (currentUser) {
    return {
      userId: currentUser.userId,
      isApiKey: false,
    };
  }

  return null;
}

/**
 * Check if request is authorized based on method and role
 */
export function isAuthorized(
  method: string,
  role?: 'read-only' | 'editor' | 'admin'
): boolean {
  if (!role) return true; // Session authentication has full access

  switch (role) {
    case 'read-only':
      return method === 'GET';
    case 'editor':
      // Editor can do everything except manage project settings (which requires session auth)
      return ['GET', 'POST', 'PATCH', 'DELETE'].includes(method);
    case 'admin':
      return true;
    default:
      return false;
  }
}

/**
 * Check if user has access to a project (as owner or team member)
 */
export async function checkProjectAccess(
  userId: string,
  projectId: string
): Promise<{
  hasAccess: boolean;
  isOwner: boolean;
  memberRole?: 'editor' | 'admin';
  assignedLocales?: string[];
}> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { 
      ownerId: true,
      members: {
        where: { userId },
        select: {
          role: true,
          assignedLocales: true,
        },
      },
    },
  });

  if (!project) {
    return { hasAccess: false, isOwner: false };
  }

  const isOwner = project.ownerId === userId;
  if (isOwner) {
    return { hasAccess: true, isOwner: true };
  }

  const member = project.members[0];
  if (member) {
    const assignedLocales = parseAssignedLocales(member.assignedLocales);
    return {
      hasAccess: true,
      isOwner: false,
      memberRole: member.role as 'editor' | 'admin',
      assignedLocales,
    };
  }

  return { hasAccess: false, isOwner: false };
}

/**
 * Check if editor can access a specific locale
 */
export function canAccessLocale(
  localeCode: string,
  assignedLocales?: string[]
): boolean {
  // If no locales assigned, editor can access all locales
  if (!assignedLocales || assignedLocales.length === 0) {
    return true;
  }
  return assignedLocales.includes(localeCode);
}

/**
 * Parse assigned locales from JSON string
 */
export function parseAssignedLocales(localesJson: string | null): string[] | undefined {
  if (!localesJson) {
    return undefined;
  }
  try {
    return JSON.parse(localesJson);
  } catch (error) {
    console.error('Failed to parse assigned locales:', error);
    return undefined;
  }
}

/**
 * Check if user can manage team members (owner or admin)
 */
export async function canManageTeamMembers(
  userId: string,
  projectId: string
): Promise<boolean> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { 
      ownerId: true,
      members: {
        where: { userId },
        select: { role: true },
      },
    },
  });

  if (!project) {
    return false;
  }

  const isOwner = project.ownerId === userId;
  const isAdminMember = project.members[0]?.role === 'admin';

  return isOwner || isAdminMember;
}
