import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: "editor" | "admin";
  assignedLocales: string[] | null;
  createdAt: string;
}

interface InviteMemberRequest {
  email: string;
  role: "editor" | "admin";
  assignedLocales?: string[];
}

interface UpdateMemberRequest {
  role: "editor" | "admin";
  assignedLocales?: string[];
}

export function useTeamMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');

      const response = await fetch(`/api/v1/projects/${projectId}/members`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 403) {
          // User doesn't have permission
          return null;
        }
        throw new Error('Failed to fetch team members');
      }

      const data = await response.json();
      return data.data as TeamMember[];
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
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
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateMemberRequest }) => {
      const response = await fetch(`/api/v1/projects/${projectId}/members/${userId}`, {
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
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/v1/projects/${projectId}/members/${userId}`, {
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
