/**
 * React Query hooks for Team Members
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: 'editor' | 'admin';
  assignedLocales: string[] | null;
  createdAt: string;
}

export interface InviteMemberRequest {
  email: string;
  role: 'editor' | 'admin';
  assignedLocales?: string[];
}

export interface UpdateMemberRequest {
  role?: 'editor' | 'admin';
  assignedLocales?: string[];
}

export function useTeamMembers(projectId: string, options?: { enableLiveUpdates?: boolean }) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      const response = await fetch(`/api/v1/projects/${projectId}/members`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      return (data.data || []) as TeamMember[];
    },
    enabled: !!projectId,
    refetchInterval: options?.enableLiveUpdates !== false ? 5000 : false,
  });
}

export function useInviteMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteMemberRequest) => {
      const response = await fetch(`/api/v1/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
}

export function useUpdateMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, data }: { memberId: string; data: UpdateMemberRequest }) => {
      const response = await fetch(`/api/v1/projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
}

export function useRemoveMember(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/v1/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove member');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
}
