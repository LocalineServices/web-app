import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Label {
  id: string;
  project_id: string;
  name: string;
  color: string;
  created_at: string;
}

export function useLabels(projectId: string | undefined) {
  return useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      
      const response = await fetch(`/api/v1/projects/${projectId}/labels`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch labels');
      }

      const data = await response.json();
      return data.labels as Label[];
    },
    enabled: !!projectId,
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });
}

export function useCreateLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; color?: string }) => {
      const response = await fetch(`/api/v1/projects/${projectId}/labels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create label');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
  });
}

export function useUpdateLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ labelId, data }: { labelId: string; data: { name?: string; color?: string } }) => {
      const response = await fetch(`/api/v1/projects/${projectId}/labels/${labelId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update label');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
  });
}

export function useDeleteLabel(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (labelId: string) => {
      const response = await fetch(`/api/v1/projects/${projectId}/labels/${labelId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete label');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', projectId] });
    },
  });
}
